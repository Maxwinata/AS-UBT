# Rancang Bangun "Clean UI / Testing Mode" untuk Portal Asrama UBT (Laravel 11 + Inertia.js + React)

Dokumen rencana arsitektur ini merinci implementasi mode antarmuka bersih (*Clean UI / Testing Mode*) pada Portal Asrama Universitas Bunda Thamrin (UBT). Solusi ini dirancang untuk environment pengujian (UAT/QA/Testing) agar evaluator dan tester dapat berfokus 100% pada alur bisnis utama (*happy path & edge cases*) pendaftaran asrama tanpa terdistraksi oleh banner promosi, widget statistik berlebih, sidebar dev tools, modal onboarding, maupun kredensial publik di layar.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> Berdasarkan jawaban klarifikasi, implementasi Clean UI / Testing Mode berlandaskan 3 pilar keputusan:

- **Confirmed Decision 1: Mekanisme Aktivasi Fleksibel (Env & URL Query Parameter)**  
  Mode pengujian dapat diaktifkan melalui konfigurasi server `APP_UI_MODE=clean` (atau `TEST_MODE=true` di file `.env`), sekaligus mendukung aktivasi on-demand melalui URL query parameter (misal: `?ui_mode=clean` atau `?testing=true`) khusus pada environment non-production (`local`, `testing`, `staging`).
- **Confirmed Decision 2: Tata Letak Minimal (*MinimalTestingLayout*)**  
  Alih-alih sekadar menyembunyikan elemen satu per satu, sistem menyediakan komponen layout khusus `MinimalTestingLayout`. Layout ini meniadakan header banner promosi, widget navigasi multi-persona dev tools, floating sidebar, dan footer statistik, serta menyajikan satu kanvas terfokus dengan breadcrumbs progres 4-tahap pendaftaran.
- **Confirmed Decision 3: Sanitasi Kredensial Publik & Form Input Bersih**  
  Semua tombol preset akun sampel, kredensial demo hardcoded, dan dump database publik pada form login disembunyikan secara ketat pada mode testing. Form login kembali menjadi input bersih (*clean input fields*) demi menjaga keamanan data dan mencerminkan interaksi nyata pengguna.

---

## 1. Overview & Core Concept

- **What It Does**: Menyediakan *toggleable clean testing environment* yang secara otomatis menonaktifkan seluruh noise visual (banner promosi, dev tools selector, floating telemetry, modal onboarding, chip badge berlebih) dan memusatkan antarmuka pada alur operasional esensial:
  `Login Instan` → `Pengisian Biodata & KYC` → `Penguncian Kamar (Tahap 2)` → `Kalkulasi Tagihan & Upload Struk (Tahap 3)` → `Tanda Tangan Kontrak Digital & OTP (Tahap 4)` → `Verifikasi Admin & Penerbitan e-Ticket`.
- **Target Audience / Persona**:
  - **QA Engineers & UAT Testers**: Menjalankan skenario pengujian fungsional dan verifikasi alur registrasi tanpa hambatan popup atau gangguan visual.
  - **Auditor & Stakeholder Kampus**: Meninjau kepatuhan alur data dan hukum (UU ITE / e-KYC) dalam tampilan bersih berstandar korporat/institusi.
  - **Pengembang (Developers)**: Memverifikasi integritas state Inertia.js dan konsistensi form validation tanpa terganggu oleh widget overlay.
- **Key Value**: Mengurangi cognitive load penguji, mencegah kebocoran data akun demo ke ranah publik, menjamin keamanan production (*zero risk of testing clutter in prod*), serta mempermudah pengujian otomatis (E2E testing via Cypress / Playwright).

---

## 2. User Experience & Visual Design

Mengikuti prinsip **Universal Frontend Design Constitution** dan domain **SaaS & Dashboards**:

- **Key User Flows**:
  1. **Akses Testing Mode**:
     - Tester mengakses portal via URL staging standar atau menambahkan parameter `?ui_mode=clean`.
     - Sistem mendeteksi konfigurasi dan menyajikan *MinimalTestingLayout*.
     - Header atas hanya menampilkan satu wordmark ringkas "Portal Asrama UBT" dan indikator status pengujian yang tenang (*subtle badge non-pulsing*).
  2. **Alur Autentikasi Bersih**:
     - Halaman login PMB & SSO tampil murni dengan label teks bersih, input nomor pendaftaran, dan tanggal lahir tanpa tombol cepat akun demo yang membingungkan alur pengujian.
  3. **Alur Pendaftaran Terfokus**:
     - Panel 4 langkah pendaftaran disajikan dalam satu container terpusat dengan tipografi *Plus Jakarta Sans* dan angka tabular *JetBrains Mono*.
     - Menghilangkan modal SOP bantuan otomatis saat awal render (tersedia tombol manual jika diperlukan).
     - Menghilangkan floating dev sidebar switch (`SidebarGuide`).
  4. **Penyelesaian & e-Ticket**:
     - Pengesahan admin langsung mengarahkan ke lembar e-Ticket bersih siap cetak/unduh tanpa widget feedback marketing.

- **Visual Identity & Theme**:
  - *Aesthetic Direction*: Utilitarian institusional perguruan tinggi, bersih (*monochrome canvas with teal accent*), kontras tinggi (WCAG AA compliant), bebas dari bayangan berlapis atau border berlebih.
  - *Color Palette*: Slate-900 untuk teks utama, Slate-50 untuk kanvas netral (60%), Slate-200 untuk batas hairline tipis (30%), dan Teal-700 untuk aksi utama (10%).
  - *Typography*: Plus Jakarta Sans untuk judul dan label form, JetBrains Mono untuk NIK/PMB/Nomor Invoice.
  - *Zero-Pill Discipline*: Seluruh status disajikan sebagai teks bersih bersekat titik (`·`) tanpa kapsul warna-warni berlapis.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Dual Activation Mechanism (Env + URL Query Parameter)**
  - *Chosen Approach*: Backend Laravel membaca `config('app.ui_mode')` (dari `.env`) dan memvalidasi `request()->query('ui_mode')` atau `session('ui_mode')` hanya jika `app()->environment('local', 'testing', 'staging')`.
  - *Why*: Memungkinkan automation test suite (Playwright/Cypress) atau tester manual menguji mode bersih tanpa perlu me-restart server atau mengubah file `.env`.
  - *Safety Guard*: Pada environment `production`, parameter URL diabaikan secara total sehingga UI production selalu sesuai konfigurasi resmi.

- **Decision 2: Layout Terpisah (*MinimalTestingLayout*) vs In-Component If-Else Flags**
  - *Chosen Approach*: Menggabungkan `MinimalTestingLayout` untuk struktur makro (header, sidebar, container), dan hook `useTestingMode()` untuk komponen mikro (tombol demo, banner promosi lokal).
  - *Why*: Mencegah kode komponen utama dipenuhi percabangan `if (isTestingMode)` yang rumit. Menjaga keterbacaan kode dan kemudahan perawatan jangka panjang.

- **Decision 3: Pembersihan Presets Akun Demo pada Login Form**
  - *Chosen Approach*: Menyembunyikan daftar tombol preset demo pendaftaran pada mode testing, namun tetap mempertahankan fungsi validasi pencocokan database SIMABA dan SIDARA.
  - *Why*: UAT yang efektif harus memvalidasi kemampuan pengguna mengetik atau menyalin data uji riil, bukan mengandalkan tombol bypass statis.

---

## 4. Technical Architecture & Data Strategy *(Technical Reference)*

### Diagram Arsitektur Solusi Clean UI Testing Mode

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                   ARSITEKTUR CLEAN UI / TESTING MODE (LARAVEL 11 + INERTIA)            │
└────────────────────────────────────────────────────────────────────────────────────────┘

 [REQUEST MASUK]
       │
       ▼
 ┌──────────────────────────────────────────────────────────────────┐
 │ 1. Laravel Middleware: CheckUiMode & HandleInertiaRequests        │
 │    • Evaluasi config('app.ui_mode') dari .env                    │
 │    • Jika env != 'production', cek query param ?ui_mode=clean    │
 │    • Set session testing_mode jika valid                         │
 └──────────────────────────────────┬───────────────────────────────┘
                                    │
                                    ▼
 ┌──────────────────────────────────────────────────────────────────┐
 │ 2. Inertia Shared Props (AppServiceProvider / Middleware)        │
 │    'uiMode' => [                                                 │
 │        'isCleanTesting' => true/false,                           │
 │        'environment'    => 'staging',                            │
 │        'features'       => ['hidePromo', 'hideDevTools', ...]    │
 │    ]                                                             │
 └──────────────────────────────────┬───────────────────────────────┘
                                    │
                                    ▼
 ┌──────────────────────────────────────────────────────────────────┐
 │ 3. React Client Layer: TestingModeContext & useTestingMode()     │
 │    • Menyediakan state reaktif isTestingMode ke seluruh pohon UI │
 └──────────────────┬───────────────────────────────┬───────────────┘
                    │                               │
        [isTestingMode == true]         [isTestingMode == false]
                    │                               │
                    ▼                               ▼
 ┌──────────────────────────────────────┐  ┌──────────────────────────────────────┐
 │ 4A. MinimalTestingLayout             │  │ 4B. Standard Layout                  │
 │     • Header Ringkas (Brand only)    │  │     • Full Header with Banners       │
 │     • Sembunyikan SidebarGuide       │  │     • SidebarGuide (Persona Switch)  │
 │     • Container Terfokus (Max 4xl)   │  │     • SOP Modals & Promo Popups      │
 │     • Form Murni (No Demo Presets)   │  │     • Demo Presets & Sample Pickers  │
 └──────────────────────────────────────┘  └──────────────────────────────────────┘
```

### Data Model & Shared Props Schema

```typescript
export interface UiModeConfig {
  isCleanTesting: boolean;
  environment: 'local' | 'testing' | 'staging' | 'production';
  features: {
    hideMarketingBanners: boolean;
    hideDevToolsSidebar: boolean;
    hideDemoPresets: boolean;
    hideStatisticsCards: boolean;
    hideOnboardingModals: boolean;
    focusRegistrationFlow: boolean;
  };
}
```

### File-File yang Dibuat / Dimodifikasi

1. **Backend Laravel**:
   - `config/app.php`: Menambahkan key `'ui_mode' => env('APP_UI_MODE', 'standard')`.
   - `app/Http/Middleware/HandleInertiaRequests.php`: Membagikan props `'uiMode'` ke Inertia.
   - `.env.example`: Menambahkan panduan variabel `APP_UI_MODE=clean` dan `TEST_MODE=true`.
2. **Frontend React**:
   - `src/context/TestingModeContext.tsx`: Context & hook `useTestingMode()` untuk conditional rendering modular.
   - `src/components/layout/MinimalTestingLayout.tsx`: Layout minimalis khusus testing/UAT.
   - `src/App.tsx`: Integrasi layout kondisional berdasarkan `isCleanTesting`.
   - `src/components/auth/LoginDualTab.tsx`: Kondisional rendering tombol preset sampel akun demo.
   - `src/components/maba/MabaDashboard.tsx`: Menonaktifkan auto-popup onboarding SOP dan dev scenario jumper saat testing mode aktif.

---

## 5. Rencana Verifikasi Teknis

- **Pemeriksaan Kompilasi & Linter**: Menjalankan `compile_applet` dan `lint_applet` untuk memastikan tidak ada kesalahan tipe TypeScript atau impor komponen.
- **Uji Coba URL Query Toggle**: Menguji rendering aplikasi dengan `?ui_mode=clean` dan memverifikasi hilangnya `SidebarGuide` dan banner promosi secara mulus.
- **Uji Keamanan Production**: Memastikan bila `APP_ENV=production`, `isCleanTesting` tetap `false` secara default dan tidak dapat di-bypass sembarangan.
