
const CACHE_NAME = 'maba-ekyc-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html'
];

// --- IndexedDB Queue Logic ---
const DB_NAME = 'EKycOfflineDB';
const DB_VERSION = 1;
const STORE_NAME = 'kyc-queue';

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    };
    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => reject(event.target.error);
  });
}

function saveToQueue(data) {
  return openDB().then((db) => {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.add({ ...data, timestamp: Date.now() });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  });
}

function getQueue() {
  return openDB().then((db) => {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  });
}

function deleteFromQueue(id) {
  return openDB().then((db) => {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  });
}

function base64ToBlob(base64Str) {
  const match = base64Str.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) return null;
  const contentType = match[1];
  const byteCharacters = atob(match[2]);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: contentType });
}

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

async function syncKycQueue() {
  try {
    const queue = await getQueue();
    if (!queue || queue.length === 0) return;
    
    console.log('[Service Worker] Syncing ' + queue.length + ' queued e-KYC items...');
    for (const item of queue) {
      try {
        const base64Str = await blobToBase64(item.imageBlob);
        const payload = { imageBase64: base64Str };
        
        const response = await fetch(item.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload)
        });
        
        if (response.ok) {
          console.log('[Service Worker] Successfully synced item:', item.id);
          await deleteFromQueue(item.id);
          
          self.clients.matchAll().then(clients => {
            clients.forEach(client => {
              client.postMessage({
                type: 'SYNC_SUCCESS',
                target: item.target,
                message: 'Data e-KYC (Offline) berhasil disinkronisasi ke server.'
              });
            });
          });
        }
      } catch (err) {
        console.warn('[Service Worker] Sync failed for item:', item.id, err);
      }
    }
  } catch (err) {
    console.error('[Service Worker] Error during syncKycQueue', err);
  }
}

self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-ekyc') {
    event.waitUntil(syncKycQueue());
  }
});

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Menghapus cache lama:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => syncKycQueue()) // Attempt sync on SW activation
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  // Intercept KYC API for offline queue
  if (event.request.method === 'POST' && (requestUrl.pathname === '/api/ocr-ktp' || requestUrl.pathname === '/api/validate-selfie')) {
    event.respondWith(
      fetch(event.request.clone()).catch(async (err) => {
        console.warn('[Service Worker] Offline, queuing e-KYC upload for', requestUrl.pathname);
        try {
          const reqClone = event.request.clone();
          const body = await reqClone.json(); // expects { imageBase64: '...' }
          const imageBlob = base64ToBlob(body.imageBase64);
          
          if (imageBlob) {
            await saveToQueue({
              url: requestUrl.pathname,
              target: requestUrl.pathname.includes('ocr-ktp') ? 'ktp' : 'selfie',
              imageBlob: imageBlob
            });
            
            if ('sync' in self.registration) {
              try {
                await self.registration.sync.register('sync-ekyc');
              } catch (e) {
                console.log('Background sync registration failed', e);
              }
            }
          }
        } catch (queueErr) {
          console.error('Failed to queue offline request', queueErr);
        }
        
        // Return a mock success response so the UI doesn't break
        return new Response(JSON.stringify({ 
          valid: true, 
          message: 'Anda sedang offline. Foto e-KYC disimpan secara lokal di IndexedDB dan akan diunggah otomatis saat koneksi internet kembali.',
          nik: 'DISIMPAN-OFFLINE',
          confidence: 1.0,
          isLive: true
        }), {
          headers: { 'Content-Type': 'application/json' }
        });
      })
    );
    return;
  }

  // Jangan cache request API dan metode selain GET
  if (event.request.method !== 'GET' || requestUrl.pathname.startsWith('/api/')) {
    return;
  }

  // Cache first, fallback to network untuk aset statis (JS, CSS, Gambar dari Vite)
  if (requestUrl.pathname.startsWith('/assets/') || requestUrl.pathname.match(/.(png|jpg|jpeg|svg|ico|woff2?)$/)) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request).then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
            return networkResponse;
          }
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          return networkResponse;
        });
      })
    );
    return;
  }

  // Network first, fallback to cache untuk dokumen HTML / rute navigasi React
  if (event.request.mode === 'navigate' || requestUrl.pathname === '/') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          return response;
        })
        .catch(() => {
          return caches.match(event.request).then((cachedResponse) => {
            return cachedResponse || caches.match('/index.html');
          });
        })
    );
    return;
  }
});
