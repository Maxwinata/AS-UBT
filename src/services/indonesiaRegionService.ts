// Service Integrasi Database Wilayah Nasional Indonesia & Kode Pos
// Mengintegrasikan Standar Kemendagri & Pos Indonesia dengan Caching Cerdas & Offline Fallback

import {
  Province,
  Regency,
  District,
  Village,
  PROVINCES,
  REGENCIES,
  DISTRICTS,
  VILLAGES,
} from '../data/indonesiaRegions';

const BASE_API_URL = 'https://www.emsifa.com/api-wilayah-indonesia/v2';
const CACHE_PREFIX = 'kemendagri_wilayah_v2_';

// In-memory cache for ultra-fast instantaneous lookups
const memoryCache = new Map<string, any>();

// Helper for caching with localStorage
function getFromCache<T>(key: string): T | null {
  if (memoryCache.has(key)) {
    return memoryCache.get(key) as T;
  }
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key);
    if (raw) {
      const parsed = JSON.parse(raw);
      memoryCache.set(key, parsed);
      return parsed as T;
    }
  } catch (e) {
    // localStorage disabled or quota exceeded
  }
  return null;
}

function saveToCache(key: string, data: any): void {
  memoryCache.set(key, data);
  try {
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(data));
  } catch (e) {
    // ignore quota errors
  }
}

// Timeout fetch wrapper to ensure UI never hangs if network is slow
async function fetchWithTimeout(url: string, timeoutMs = 4000): Promise<any> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(id);
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    return await response.json();
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

// Format ID helper (e.g. 1271 -> 12.71, 127101 -> 12.71.01)
export function normalizeRegencyId(rawId: string): string {
  const clean = rawId.replace(/\./g, '');
  if (clean.length === 4) {
    return `${clean.slice(0, 2)}.${clean.slice(2)}`;
  }
  return rawId;
}

export function normalizeDistrictId(rawId: string): string {
  const clean = rawId.replace(/\./g, '');
  if (clean.length === 6) {
    return `${clean.slice(0, 2)}.${clean.slice(2, 4)}.${clean.slice(4)}`;
  }
  return rawId;
}

// 1. Fetch Provinces (38 Provinsi Nasional)
export async function fetchNationalProvinces(): Promise<Province[]> {
  const cacheKey = 'provinces';
  const cached = getFromCache<Province[]>(cacheKey);
  if (cached && cached.length > 0) return cached;

  try {
    const json = await fetchWithTimeout(`${BASE_API_URL}/provinces.json`);
    const list: Province[] = (json.data || json || []).map((p: any) => ({
      id: p.id,
      name: (p.name || '').toUpperCase(),
    }));
    if (list.length > 0) {
      saveToCache(cacheKey, list);
      return list;
    }
  } catch (e) {
    // Fallback to local 38 provinces
  }
  return PROVINCES;
}

// 2. Fetch Regencies by Province
export async function fetchNationalRegencies(provinceNameOrId?: string): Promise<Regency[]> {
  if (!provinceNameOrId) return REGENCIES;

  // Find province ID
  const allProvinces = PROVINCES;
  const p = allProvinces.find(
    (prov) =>
      prov.id === provinceNameOrId ||
      prov.name.toUpperCase() === provinceNameOrId.toUpperCase()
  );
  const provId = p ? p.id : provinceNameOrId;

  const cacheKey = `regencies_${provId}`;
  const cached = getFromCache<Regency[]>(cacheKey);
  if (cached && cached.length > 0) return cached;

  try {
    const json = await fetchWithTimeout(`${BASE_API_URL}/regencies/${provId}.json`);
    const list: Regency[] = (json.data || json || []).map((r: any) => {
      const upperName = (r.name || '').toUpperCase();
      const isKota = upperName.startsWith('KOTA') || upperName.includes('KOTA ');
      return {
        id: r.id,
        provinceId: provId,
        name: upperName,
        type: isKota ? 'KOTA' : 'KABUPATEN',
      };
    });

    if (list.length > 0) {
      saveToCache(cacheKey, list);
      return list;
    }
  } catch (e) {
    // Fallback to local database
  }

  return REGENCIES.filter((r) => r.provinceId === provId);
}

// 3. Fetch Districts by Regency
export async function fetchNationalDistricts(
  regencyNameOrId?: string,
  provinceNameOrId?: string
): Promise<District[]> {
  if (!regencyNameOrId) return [];

  // Match regency in local database or find by name
  let targetRegId = regencyNameOrId;
  const matchedReg = REGENCIES.find(
    (r) =>
      r.id === regencyNameOrId ||
      r.name.toUpperCase() === regencyNameOrId.toUpperCase() ||
      r.name.replace(/^KOTA\s+|^KAB\.\s+|^KABUPATEN\s+/i, '').trim().toUpperCase() ===
        regencyNameOrId.replace(/^KOTA\s+|^KAB\.\s+|^KABUPATEN\s+/i, '').trim().toUpperCase()
  );

  if (matchedReg) {
    targetRegId = matchedReg.id;
  }

  const formattedRegId = normalizeRegencyId(targetRegId);
  const cacheKey = `districts_${formattedRegId}`;
  const cached = getFromCache<District[]>(cacheKey);
  if (cached && cached.length > 0) return cached;

  try {
    const json = await fetchWithTimeout(`${BASE_API_URL}/districts/${formattedRegId}.json`);
    const list: District[] = (json.data || json || []).map((d: any) => ({
      id: d.id,
      regencyId: formattedRegId,
      name: d.name,
    }));

    if (list.length > 0) {
      saveToCache(cacheKey, list);
      return list;
    }
  } catch (e) {
    // Fallback to local DISTRICTS
  }

  return DISTRICTS.filter(
    (d) =>
      d.regencyId === targetRegId ||
      d.regencyId === formattedRegId ||
      d.regencyId.replace(/\./g, '') === targetRegId.replace(/\./g, '')
  );
}

// 4. Fetch Villages by District (Contains accurate Postal Code!)
export async function fetchNationalVillages(
  districtNameOrId?: string,
  regencyNameOrId?: string
): Promise<Village[]> {
  if (!districtNameOrId) return [];

  let targetDistId = districtNameOrId;
  const matchedDist = DISTRICTS.find(
    (d) =>
      d.id === districtNameOrId ||
      d.name.toUpperCase() === districtNameOrId.toUpperCase()
  );

  if (matchedDist) {
    targetDistId = matchedDist.id;
  }

  const formattedDistId = normalizeDistrictId(targetDistId);
  const cacheKey = `villages_${formattedDistId}`;
  const cached = getFromCache<Village[]>(cacheKey);
  if (cached && cached.length > 0) return cached;

  try {
    const json = await fetchWithTimeout(`${BASE_API_URL}/villages/${formattedDistId}.json`);
    const list: Village[] = (json.data || json || []).map((v: any) => ({
      id: v.id,
      districtId: formattedDistId,
      name: v.name,
      postalCode: v.postal_code || v.postalCode || '',
    }));

    if (list.length > 0) {
      saveToCache(cacheKey, list);
      return list;
    }
  } catch (e) {
    // Fallback to local VILLAGES
  }

  return VILLAGES.filter(
    (v) =>
      v.districtId === targetDistId ||
      v.districtId === formattedDistId ||
      v.districtId.replace(/\./g, '') === targetDistId.replace(/\./g, '')
  );
}

// 5. National Quick Search Item
export interface NationalRegionSearchResult {
  province: string;
  regency: string;
  district: string;
  village: string;
  postalCode: string;
}

// Curated comprehensive postal code dictionary for instant national search
const NATIONAL_POSTAL_PRESETS: NationalRegionSearchResult[] = [
  // Sumatera Utara
  { province: 'SUMATERA UTARA', regency: 'KOTA MEDAN', district: 'Medan Kota', village: 'Pasar Baru', postalCode: '20212' },
  { province: 'SUMATERA UTARA', regency: 'KOTA MEDAN', district: 'Medan Kota', village: 'Teladan Barat', postalCode: '20217' },
  { province: 'SUMATERA UTARA', regency: 'KOTA MEDAN', district: 'Medan Kota', village: 'Pandan Hulu I', postalCode: '20211' },
  { province: 'SUMATERA UTARA', regency: 'KOTA MEDAN', district: 'Medan Kota', village: 'Mesjid', postalCode: '20213' },
  { province: 'SUMATERA UTARA', regency: 'KOTA MEDAN', district: 'Medan Baru', village: 'Padang Bulan', postalCode: '20155' },
  { province: 'SUMATERA UTARA', regency: 'KOTA MEDAN', district: 'Medan Petisah', village: 'Petisah Tengah', postalCode: '20112' },
  { province: 'SUMATERA UTARA', regency: 'KOTA MEDAN', district: 'Medan Selayang', village: 'Tanjung Sari', postalCode: '20132' },
  { province: 'SUMATERA UTARA', regency: 'KOTA MEDAN', district: 'Medan Sunggal', village: 'Sunggal', postalCode: '20128' },
  { province: 'SUMATERA UTARA', regency: 'KOTA MEDAN', district: 'Medan Barat', village: 'Kesawan', postalCode: '20111' },
  { province: 'SUMATERA UTARA', regency: 'KOTA MEDAN', district: 'Medan Timur', village: 'Perintis', postalCode: '20231' },
  { province: 'SUMATERA UTARA', regency: 'KOTA MEDAN', district: 'Medan Area', village: 'Kotamatsum I', postalCode: '20215' },
  { province: 'SUMATERA UTARA', regency: 'KOTA MEDAN', district: 'Medan Johor', village: 'Pangkalan Masyhur', postalCode: '20146' },
  { province: 'SUMATERA UTARA', regency: 'KOTA MEDAN', district: 'Medan Amplas', village: 'Amplas', postalCode: '20149' },
  { province: 'SUMATERA UTARA', regency: 'KAB. DELI SERDANG', district: 'Percut Sei Tuan', village: 'Bandar Khalipah', postalCode: '20371' },
  { province: 'SUMATERA UTARA', regency: 'KAB. DELI SERDANG', district: 'Lubuk Pakam', village: 'Lubuk Pakam I', postalCode: '20511' },
  { province: 'SUMATERA UTARA', regency: 'KOTA PEMATANGSIANTAR', district: 'Siantar Timur', village: 'Pahlawan', postalCode: '21132' },
  { province: 'SUMATERA UTARA', regency: 'KOTA BINJAI', district: 'Binjai Kota', village: 'Pekan Binjai', postalCode: '20713' },
  { province: 'SUMATERA UTARA', regency: 'KAB. KARO', district: 'Berastagi', village: 'Gundaling I', postalCode: '22153' },
  { province: 'SUMATERA UTARA', regency: 'KAB. TOBA', district: 'Balige', village: 'Balige I', postalCode: '22311' },

  // DKI Jakarta
  { province: 'DKI JAKARTA', regency: 'KOTA JAKARTA PUSAT', district: 'Gambir', village: 'Gambir', postalCode: '10110' },
  { province: 'DKI JAKARTA', regency: 'KOTA JAKARTA PUSAT', district: 'Menteng', village: 'Menteng', postalCode: '10310' },
  { province: 'DKI JAKARTA', regency: 'KOTA JAKARTA PUSAT', district: 'Tanah Abang', village: 'Kebon Kacang', postalCode: '10240' },
  { province: 'DKI JAKARTA', regency: 'KOTA JAKARTA SELATAN', district: 'Kebayoran Baru', village: 'Senayan', postalCode: '12190' },
  { province: 'DKI JAKARTA', regency: 'KOTA JAKARTA SELATAN', district: 'Setiabudi', village: 'Karet Semanggi', postalCode: '12930' },
  { province: 'DKI JAKARTA', regency: 'KOTA JAKARTA SELATAN', district: 'Cilandak', village: 'Cilandak Barat', postalCode: '12430' },
  { province: 'DKI JAKARTA', regency: 'KOTA JAKARTA BARAT', district: 'Grogol Petamburan', village: 'Tanjung Duren', postalCode: '11470' },
  { province: 'DKI JAKARTA', regency: 'KOTA JAKARTA TIMUR', district: 'Matraman', village: 'Palmeriam', postalCode: '13140' },
  { province: 'DKI JAKARTA', regency: 'KOTA JAKARTA UTARA', district: 'Kelapa Gading', village: 'Kelapa Gading Barat', postalCode: '14240' },

  // Jawa Barat
  { province: 'JAWA BARAT', regency: 'KOTA BANDUNG', district: 'Coblong', village: 'Dago', postalCode: '40135' },
  { province: 'JAWA BARAT', regency: 'KOTA BANDUNG', district: 'Coblong', village: 'Lebakgede', postalCode: '40132' },
  { province: 'JAWA BARAT', regency: 'KOTA BOGOR', district: 'Bogor Tengah', village: 'Pabaton', postalCode: '16121' },
  { province: 'JAWA BARAT', regency: 'KOTA DEPOK', district: 'Beji', village: 'Pondok Cina', postalCode: '16424' },
  { province: 'JAWA BARAT', regency: 'KOTA BEKASI', district: 'Bekasi Selatan', village: 'Pekayon Jaya', postalCode: '17148' },

  // Jawa Tengah & DI Yogyakarta
  { province: 'JAWA TENGAH', regency: 'KOTA SEMARANG', district: 'Semarang Tengah', village: 'Pandansari', postalCode: '50139' },
  { province: 'JAWA TENGAH', regency: 'KOTA SURAKARTA (SOLO)', district: 'Banjarsari', village: 'Manahan', postalCode: '57139' },
  { province: 'DI YOGYAKARTA', regency: 'KOTA YOGYAKARTA', district: 'Gondokusuman', village: 'Terban', postalCode: '55223' },
  { province: 'DI YOGYAKARTA', regency: 'KAB. SLEMAN', district: 'Depok', village: 'Caturtunggal', postalCode: '55281' },

  // Jawa Timur
  { province: 'JAWA TIMUR', regency: 'KOTA SURABAYA', district: 'Gubeng', village: 'Airlangga', postalCode: '60286' },
  { province: 'JAWA TIMUR', regency: 'KOTA SURABAYA', district: 'Wonokromo', village: 'Sawunggaling', postalCode: '60242' },
  { province: 'JAWA TIMUR', regency: 'KOTA MALANG', district: 'Lowokwaru', village: 'Ketawanggede', postalCode: '65145' },

  // Banten
  { province: 'BANTEN', regency: 'KOTA TANGERANG SELATAN', district: 'Serpong', village: 'Lengkong Gudang', postalCode: '15321' },
  { province: 'BANTEN', regency: 'KOTA TANGERANG', district: 'Tangerang', village: 'Sukarasa', postalCode: '15111' },

  // Bali & Luar Jawa
  { province: 'BALI', regency: 'KOTA DENPASAR', district: 'Denpasar Barat', village: 'Pemecutan', postalCode: '80112' },
  { province: 'ACEH', regency: 'KOTA BANDA ACEH', district: 'Baiturrahman', village: 'Kampung Baru', postalCode: '23242' },
  { province: 'SUMATERA BARAT', regency: 'KOTA PADANG', district: 'Padang Barat', village: 'Kampung Jao', postalCode: '25112' },
  { province: 'RIAU', regency: 'KOTA PEKANBARU', district: 'Sukajadi', village: 'Kampung Melayu', postalCode: '28124' },
  { province: 'KEPULAUAN RIAU', regency: 'KOTA BATAM', district: 'Batam Kota', village: 'Teluk Tering', postalCode: '29461' },
  { province: 'SUMATERA SELATAN', regency: 'KOTA PALEMBANG', district: 'Ilir Barat I', village: 'Bukit Lama', postalCode: '30139' },
  { province: 'SULAWESI SELATAN', regency: 'KOTA MAKASSAR', district: 'Ujung Pandang', village: 'Maloku', postalCode: '90111' },
  { province: 'KALIMANTAN TIMUR', regency: 'KOTA SAMARINDA', district: 'Samarinda Kota', village: 'Pelabuhan', postalCode: '75112' },
  { province: 'KALIMANTAN TIMUR', regency: 'KOTA BALIKPAPAN', district: 'Balikpapan Kota', village: 'Klandasan Ilir', postalCode: '76113' },
];

// Search national catalog by Postal Code, Village Name, or District Name
export function searchNationalRegions(query: string): NationalRegionSearchResult[] {
  const q = query.trim().toUpperCase();
  if (q.length < 2) return [];

  return NATIONAL_POSTAL_PRESETS.filter(
    (item) =>
      item.postalCode.startsWith(q) ||
      item.village.toUpperCase().includes(q) ||
      item.district.toUpperCase().includes(q) ||
      item.regency.toUpperCase().includes(q)
  ).slice(0, 8);
}
