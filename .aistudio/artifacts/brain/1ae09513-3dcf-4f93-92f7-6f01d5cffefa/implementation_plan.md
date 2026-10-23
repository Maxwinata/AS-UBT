# Perbaikan Layar Blank Putih (White Screen of Death) & Penyelarasan Arsitektur Frontend Laragon

Rencana perbaikan komprehensif untuk mengatasi layar blank putih (White Screen of Death) pada `http://asrama-ubt.test` di lingkungan Laragon Windows (Laravel 11 + Vite + Inertia React + MySQL) melalui penyelarasan entry point & DOM mounting, injeksi global `process.env`, penanganan rute & pemanggilan API defensif, serta pemasangan React Error Boundary berstandar produksi.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> **Keputusan Arsitektur Terkonfirmasi**:
> 1. **Dukungan Dual Mounting Resilien**: `resources/views/app.blade.php` dan `resources/js/app.tsx` akan mendukung eksekusi halaman Inertia (`#app` dengan `data-page`) secara primer sekaligus menyediakan fallback anggun ke kontainer SPA (`#root`) jika data page diakses tanpa middleware Inertia, sehingga browser tidak pernah terjebak pada layar putih kosong.
> 2. **Injeksi Global `process.env`**: Menambahkan blok `define: { 'process.env': {}, 'global': 'window' }` pada `vite.config.ts` untuk mencegah `Uncaught ReferenceError: process is not defined` yang umum terjadi pada pustaka pihak ketiga di lingkungan browser.
> 3. **Defensive Coding & Error Boundary Fallback**: Setiap pemanggilan endpoint backend (`/api/...`) dan manipulasi data array/objek diamankan dengan relative URL dan nullish coalescing (`data ?? []`), serta dibungkus komponen `ErrorBoundary` yang menampilkan kartu pemulihan interaktif (diagnostik koneksi dan tombol refresh) bila terjadi galat tak terduga.

---

### 1. Overview & Core Concept

- **What It Does**: Memulihkan tampilan visual aplikasi Asrama UBT (SI-GABUNG 54) di browser Laragon (`http://asrama-ubt.test`), memastikan form login SSO Maba & Eksisting tampil sempurna, interaktif, dan terhubung secara andal ke database lokal MySQL Laragon tanpa eror script tersembunyi.
- **Target Audience / Persona**: Mahasiswa Baru (PMB), Mahasiswa Eksisting, Pengelola Asrama, dan Pengembang yang menjalankan aplikasi di lingkungan Laragon Windows PHP 8.2 / MySQL.
- **Key Value**: Mengeliminasi White Screen of Death secara permanen, memberikan umpan balik visual instan (loading skeleton & pesan galat ramah pengguna), serta mempermudah debugging jika koneksi database lokal mengalami gangguan.

---

### 2. User Experience & Visual Design

- **Key User Flows**:
  1. Pengguna membuka `http://asrama-ubt.test` -> Laravel me-redirect ke rute `/login`.
  2. Blade `resources/views/app.blade.php` memuat bundel terkompilasi Vite yang telah memiliki polyfill `process.env`.
  3. `resources/js/app.tsx` mendeteksi `#app`, menginisialisasi Inertia page `Pages/Auth/Login.tsx` dalam bungkus `ErrorBoundary`.
  4. Pengguna melihat kartu login SSO SI-GABUNG 54 dengan dua tab pilihan: PMB (Live Query SIMABA) dan SSO Mahasiswa Eksisting.
  5. Jika koneksi backend atau format data tidak sesuai, `ErrorBoundary` menampilkan kartu diagnostik mandiri alih-alih layar putih, lengkap dengan petunjuk status koneksi Laragon.
- **Visual Identity & Theme**:
  - *Aesthetic Direction*: Bersih, formal akademik, responsif, dan presisi tinggi dengan tema khas Universitas Borneo Tarakan (UBT).
  - *Color Palette*: Slate dark (`#0f172a`), Emerald/Teal UBT (`#0d9488`, `#047857`), Amber peringatan (`#d97706`), dan Rose untuk galat (`#e11d48`).
  - *Typography*: Plus Jakarta Sans dengan hierarki jelas (`font-bold`, `font-mono` untuk NIM/No PMB).
- **Interactive Feedback & Error Recovery**:
  - Komponen fallback `ErrorBoundary` dilengkapi kartu diagnostik dengan rincian galat yang dapat diciutkan, tombol "Muat Ulang Halaman", dan rekomendasi tindakan teknis untuk lingkungan Laragon.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Penyelarasan DOM Mounting (#app vs #root)**
  - *Chosen Approach*: `app.blade.php` merender `@inertia` (yang otomatis memuat `<div id="app" data-page="..."></div>`) disertai elemen pendukung `<div id="root"></div>`. Di sisi React (`resources/js/app.tsx`), script mengecek keberadaan elemen `#app` untuk menjalankan `createInertiaApp`. Jika `#app` tidak memiliki data halaman valid, script beralih secara anggun ke rendering komponen fallback pada `#root`.
  - *Why*: Menghindari tabrakan antara bundel SPA standalone (`src/main.tsx`) dan bundel Inertia (`resources/js/app.tsx`), sekaligus menjamin tidak ada `null pointer exception` saat `createRoot` dipanggil.
- **Decision 2: Penanganan `process.env` di Vite 6**
  - *Chosen Approach*: Menambahkan `define: { 'process.env': {}, 'global': 'window' }` di level konfigurasi `vite.config.ts`.
  - *Why*: Vite tidak menyertakan polyfill Node.js secara bawaan. Dependensi seperti `recharts`, `lucide-react`, atau skrip pemantauan yang mengakses `process.env.NODE_ENV` akan memicu `ReferenceError` di runtime browser jika tidak didefinisikan.
- **Decision 3: Pengecekan Fungsi Rute Tanpa Ketergantungan Ziggy Global**
  - *Chosen Approach*: Pada `Login.tsx`, gunakan pengecekan aman `typeof (window as any).route === 'function'` sebelum memanggil `route()`, atau prioritaskan navigasi path langsung Inertia `router.visit('/maba/dashboard')`.
  - *Why*: Mencegah crash fatal saat helper Ziggy `@routes` belum di-cache atau belum terpasang di file Blade.

---

### 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                      Browser (Laragon Windows)                         │
│                    URL: http://asrama-ubt.test/login                   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP GET
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     Laravel 11 Backend (PHP 8.2)                       │
│  - Route::get('/login') -> Inertia::render('Auth/Login')               │
│  - resources/views/app.blade.php                                       │
│    * @vite(['resources/css/app.css', 'resources/js/app.tsx'])         │
│    * @inertia / <div id="app" data-page="..."></div>                   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Serves HTML + Manifest Assets
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        Vite Bundler Runtime                            │
│  - vite.config.ts with define: { 'process.env': {}, 'global': 'window' }│
│  - No "process is not defined" crash in browser console                │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Executes Entry Point
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     resources/js/app.tsx                               │
│  - Detects DOM: checks for #app or #root                               │
│  - Wraps execution in React <ErrorBoundary>                           │
│  - Inisialisasi createInertiaApp dengan resolvePageComponent dinamis   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Mounts Component
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                  resources/js/Pages/Auth/Login.tsx                     │
│  - Enclosed in <ErrorBoundary> & <TestingModeProvider>                 │
│  - LoginDualTab Component:                                             │
│    * Tab 1: Live Query SIMABA (/api/simaba/search-student)             │
│    * Tab 2: SSO Mahasiswa Eksisting                                    │
│  - Safe navigation with router.visit() (resilient against Ziggy)       │
│  - Array & response sanitization: (data ?? []).map(...)                │
└────────────────────────────────────────────────────────────────────────┘
```

#### Rincian Berkas yang Diselaraskan:

1. **`vite.config.ts`**:
   - Menambahkan properti `define: { 'process.env': {}, 'global': 'window' }`.
   - Memastikan alias `@` mengarah ke root workspace agar modul di bawah `src/` dapat diimpor tanpa kendala path.

2. **`resources/views/app.blade.php`**:
   - Memuat font Plus Jakarta Sans dan meta tag responsif.
   - Menggunakan direktif `@vite(['resources/css/app.css', 'resources/js/app.tsx'])`.
   - Merender `@inertia` yang disertai `<div id="root"></div>` sebagai penampung darurat jika terjadi fallback non-Inertia.

3. **`resources/js/app.tsx`**:
   - Mengimpor komponen `ErrorBoundary`.
   - Menggunakan `createInertiaApp` dengan `resolve` yang memindai `./Pages/**/*.{tsx,jsx}`.
   - Membungkus mounting root dalam `<ErrorBoundary>` untuk menangkap semua potensi error rendering.

4. **`resources/js/Pages/Auth/Login.tsx`**:
   - Membungkus `LoginDualTab` dengan `TestingModeProvider` dan `ErrorBoundary`.
   - Menjamin pemanggilan `router.visit` aman dan tidak memanggil fungsi global tak berizin.
   - Menambahkan komponen Toaster (`sonner`) lokal agar notifikasi sukses/galat tampil konsisten.

5. **`resources/js/Components/ErrorBoundary.tsx`**:
   - Komponen Error Boundary murni berbasis React Component Lifecycle (`componentDidCatch`, `getDerivedStateFromError`).
   - Tampilan antarmuka kartu penanganan galat yang ramah, bersih, dan dilengkapi informasi diagnostik teknis untuk Laragon.

---

### Verifikasi Setelah Eksekusi

1. Jalankan `npm run build` untuk memverifikasi bahwa rollup bundling berhasil tanpa peringatan impor hilang atau eror sintaks.
2. Jalankan `npm run lint` / `tsc --noEmit` untuk memastikan konsistensi tipe TypeScript.
3. Berikan instruksi eksekusi untuk terminal Laragon pengguna:
   - `php artisan optimize:clear`
   - `php artisan view:clear`
   - Buka `http://asrama-ubt.test` di browser untuk memastikan halaman login tampil prima tanpa blank putih.
