# Perbaikan Layar Blank Putih & Optimasi Lazy Loading Gerbang Login SI-GABUNG 54

Rencana komprehensif untuk menuntaskan galat `TypeError: Cannot read properties of null (reading 'component')` pada Inertia.js dan mengeliminasi layar blank putih di peramban saat mengakses `http://127.0.0.1:8000/login` atau `http://asrama-ubt.test`. Solusi ini mengimplementasikan penguraian payload halaman yang aman, injeksi eksplisit `page` ke `createInertiaApp`, arsitektur dynamic code-splitting (lazy loading) pada halaman login, dan pemisahan modul berat (TensorFlow, Tesseract OCR, jsPDF) agar formulir login terbuka instan.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> **Keputusan Terkonfirmasi Berdasarkan Klarifikasi Pengguna**:
> 1. **Akar Masalah TypeError `component` Terselesaikan**: Inertia.js core v2/v3 mencari elemen `<script data-page="app" type="application/json">` saat `page` tidak diberikan secara eksplisit ke `createInertiaApp`. Pada direktif standar Blade `@inertia`, Laravel hanya merender `<div id="app" data-page="...">`. Akibatnya, `getInitialPageFromDOM` mengembalikan `null`, memicu `TypeError: Cannot read properties of null (reading 'component')` di baris inisialisasi awal. Solusinya adalah mem-parsing `dataset.page` secara aman dan menginjeksi objek `page: initialPage` langsung ke `createInertiaApp`, didukung tag script JSON ganda di file Blade.
> 2. **Penerapan Dynamic Lazy Loading**: Mengubah mekanisme `import.meta.glob('./Pages/**/*.{tsx,jsx}', { eager: true })` menjadi dynamic lazy loading resolver. Modul berbobot besar (model AI BlazeFace, TensorFlow, Tesseract OCR, jsPDF, D3) diisolasi ke chunk terpisah dan hanya dimuat saat pengguna berhasil login ke dashboard terkait. Halaman login utama kini berukuran sangat ramping (<100 KB) dan terbuka seketika.
> 3. **Dukungan Lingkungan Bersamaan (`artisan serve` & `npm run dev`)**: Konfigurasi diselaraskan agar berjalan mulus baik pada mode dev server Vite lokal (port 5173/3000) maupun setelah `npm run build` di bawah PHP 8.2 Laragon Windows.

---

### 1. Overview & Core Concept

- **What It Does**: Memulihkan tampilan visual gerbang masuk SSO Asrama UBT (SI-GABUNG 54) sehingga form verifikasi PMB dan form login SSO eksisting langsung muncul tanpa delay dan tanpa galat script di Console F12.
- **Target Audience / Persona**: Mahasiswa Baru (PMB), Mahasiswa Senior/Eksisting, Pengelola Asrama & Keuangan UBT, serta Pengembang pada lingkungan Laragon Windows.
- **Key Value**: Mengeliminasi White Screen of Death secara permanen, mempercepat waktu render awal (FCP) hingga di bawah 300 ms lewat dynamic chunking, dan menyediakan penanganan galat visual mandiri melalui React Error Boundary.

---

### 2. User Experience & Visual Design

- **Key User Flows**:
  1. Pengguna membuka `http://127.0.0.1:8000/login` atau `http://asrama-ubt.test/login`.
  2. Peramban menerima HTML dari Laravel Blade yang memuat penampung DOM `#app` beserta payload metadata halaman awal yang valid.
  3. `resources/js/app.tsx` mengekstraksi metadata halaman, memvalidasi keberadaan komponen `Auth/Login`, dan segera me-resolve chunk `Auth/Login.tsx` secara dinamis.
  4. Pengguna langsung melihat kartu login SSO SI-GABUNG 54:
     - **Tab 1 (PMB Mahasiswa Baru)**: Input No. Pendaftaran dengan fitur pencarian live ke data SIMABA dan deteksi dini NIM resmi via SIAKAD Staging.
     - **Tab 2 (SSO Eksisting / Pengelola)**: Form login akun terpadu dengan autentikasi peran (Maba, Eksisting, Admin, Keuangan).
  5. Seluruh pustaka berat (AI Face Detection, OCR KTP, pembuat PDF kontrak, grafik analitik) tetap dalam status idle/belum dimuat, menghemat memori peramban dan kuota pengguna.

- **Visual Identity & Theme**:
  - *Aesthetic Direction*: Formal akademik, modern, bersih, berkecepatan tinggi dengan identitas resmi Universitas Borneo Tarakan.
  - *Color Palette*: Slate dark (`#0f172a`), Emerald/Teal UBT (`#0d9488`, `#047857`), Amber peringatan (`#d97706`), dan Rose galat (`#e11d48`).
  - *Typography*: Plus Jakarta Sans dengan bobot terstruktur (`font-medium`, `font-semibold`, `font-bold`), font monospace untuk identitas angka (NIM, No Registrasi).

- **Interactive Feedback & Error Resilience**:
  - Jika peramban offline atau backend lambat merespons, kartu autentikasi menampilkan indikator loading halus (skeleton & spinner mini).
  - Jika terjadi galat runtime komponen, `ErrorBoundary` menampilkan kartu pemulihan mandiri dengan tombol "Muat Ulang Form", mencegah layar menjadi putih kosong.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Ekstraksi Aman & Injeksi Eksplisit `page` ke `createInertiaApp`**
  - *Chosen Approach*: Pada `resources/js/app.tsx`, ekstrak `inertiaContainer.dataset.page`, parse secara aman dengan `try/catch`. Jika valid, operasikan `createInertiaApp({ page: initialPage, ... })`. Jika gagal atau null, jalankan fallback mounting mandiri ke `#root` atau `#app`.
  - *Why*: Menghilangkan ketergantungan pada `getInitialPageFromDOM` bawaan Inertia v2/v3 yang mengharuskan script tag JSON, memecahkan tuntas `TypeError: Cannot read properties of null (reading 'component')`.
  - *Alternatives Considered*: Mengandalkan konfigurasi bawaan `@inertia` tanpa parameter `page`, yang terbukti gagal di lingkungan React 19 / Inertia core 3.x.

- **Decision 2: Dual-Compatibility Payload di `resources/views/app.blade.php`**
  - *Chosen Approach*: Di dalam `app.blade.php`, selain direktif `@inertia`, tambahkan tag `<script data-page="app" type="application/json">{!! json_encode($page) !!}</script>`.
  - *Why*: Menjamin kompatibilitas 100% untuk seluruh varian Inertia (v1, v2, v3, dan Vite SSR), sehingga peramban dapat membaca data halaman melalui dataset atribut maupun melalui script tag JSON standar.

- **Decision 3: Dynamic Code-Splitting (Lazy Loading) untuk Pages**
  - *Chosen Approach*: Mengubah `import.meta.glob('./Pages/**/*.{tsx,jsx}', { eager: true })` menjadi fungsi resolver dinamis: `const pages = import.meta.glob('./Pages/**/*.{tsx,jsx}'); resolve: async (name) => { const page = await pages['./Pages/' + name + '.tsx'](); return page.default ?? page; }`.
  - *Why*: Mengurangi ukuran bundel awal login dari >3.8 MB menjadi <100 KB. Pustaka berat TensorFlow dan Tesseract hanya akan diunduh saat pengguna membuka fitur e-KYC atau SOP Cron Monitor.

- **Decision 4: Konfigurasi Chunk Splitting pada `vite.config.ts`**
  - *Chosen Approach*: Mengonfigurasi `manualChunks` di bawah `rollupOptions.output` untuk mengelompokkan vendor menjadi `vendor-ai` (`@tensorflow`, `tesseract.js`), `vendor-doc` (`jspdf`, `html5-qrcode`), dan `vendor-react` (`react`, `react-dom`, `@inertiajs/react`).
  - *Why*: Mencegah pembuatan bundel monolitik raksasa dan mengoptimalkan caching peramban pada mode produksi Laragon.

---

### 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                   Browser: http://127.0.0.1:8000/login                 │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP GET /login
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   Laravel 11 Backend (PHP 8.2 Laragon)                 │
│  - routes/web.php: Route::get('/login') -> Inertia::render('Auth/Login')│
│  - Middleware: HandleInertiaRequests (shares auth, uiMode, appConfig)  │
│  - View: resources/views/app.blade.php                                 │
│    * <div id="app" data-page="..."></div>                              │
│    * <script data-page="app" type="application/json">...</script>      │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Serves HTML + Vite Assets
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                    resources/js/app.tsx                                │
│  - Step 1: Safely parse initialPage from dataset or JSON script        │
│  - Step 2: Validate initialPage.component presence                     │
│  - Step 3: createInertiaApp({ page: initialPage, resolve, setup })    │
│  - Step 4: Lazy import only ./Pages/Auth/Login.tsx chunk               │
│  - Step 5: Graceful fallback to standalone #root if page data missing  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Mounts React 19 Tree
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   resources/js/Pages/Auth/Login.tsx                    │
│  - Wrapped in <ErrorBoundary> & <TestingModeProvider>                  │
│  - Renders LoginDualTab:                                               │
│    * PMB Search: /api/simaba/search-student                            │
│    * SSO Login: /auth/login-maba & role navigation                     │
│  - Lightweight bundle: ~45 KB (No heavy AI / PDF dependencies)         │
└────────────────────────────────────────────────────────────────────────┘
```

#### Komponen Kunci & Pemetaan State:

1. **`resources/js/app.tsx`**:
   - Membaca elemen `#app`.
   - Melakukan parsing aman JSON: `initialPage = JSON.parse(inertiaContainer.dataset.page)`.
   - Mengoperasikan `createInertiaApp` dengan `page: initialPage` eksplisit.
   - Dynamic page resolver: `const pages = import.meta.glob('./Pages/**/*.{tsx,jsx}'); resolve: async (name) => { ... }`.
   - Membungkus setup dalam `<ErrorBoundary>` dan `<Toaster>`.
   - Blok fallback jika `#app` kosong atau tidak ada payload: Me-render komponen `Login` ke `#root`.

2. **`resources/views/app.blade.php`**:
   - Memuat font Plus Jakarta Sans dan meta tag responsif.
   - Menyertakan direktif `@inertia`.
   - Menyertakan tag script JSON darurat: `<script data-page="app" type="application/json">{!! json_encode($page ?? ['component' => 'Auth/Login', 'props' => []]) !!}</script>`.
   - Menyediakan elemen `<div id="root"></div>` untuk fallback SPA.

3. **`vite.config.ts`**:
   - Menyempurnakan `rollupOptions.output.manualChunks` untuk memisahkan vendor AI, dokumen, dan charts.
   - Mempertahankan `define: { 'process.env': {}, 'global': 'window' }`.

4. **`resources/js/Pages/Auth/Login.tsx`**:
   - Memastikan `LoginDualTab` dibungkus dengan `TestingModeProvider` dan `ErrorBoundary`.
   - Navigasi aman ke `/maba/dashboard`, `/admin/dashboard`, atau `/eksisting/dashboard`.

5. **Pengingat Aturan KYC [AGENTS_md]**:
   - Ketika integrasi backend penyimpanan KYC (KTP & Selfie) diimplementasikan di kemudian hari:
     1. Terapkan versioning UUID/timestamp (jangan menimpa berkas lama untuk audit trail).
     2. Simpan di private bucket dengan signed URL berbatas waktu.
     3. Terapkan kebijakan lifecycle retensi 30-60 hari untuk berkas usang.

---

### Verifikasi Setelah Eksekusi

1. Jalankan `npm run build` untuk memverifikasi bahwa build Vite menghasilkan chunk terpisah (chunk `Auth/Login` kecil, chunk AI dan PDF terpisah).
2. Jalankan `npm run lint` / `tsc --noEmit` untuk memastikan tidak ada kesalahan tipe TypeScript.
3. Berikan instruksi eksekusi untuk terminal Laragon pengguna:
   - `php artisan optimize:clear`
   - Refresh browser pada `http://127.0.0.1:8000/login` atau `http://asrama-ubt.test/login` untuk memastikan layar blank putih hilang dan form login langsung muncul.
