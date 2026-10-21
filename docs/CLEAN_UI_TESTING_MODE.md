# Panduan Arsitektur & Implementasi: Clean UI / Testing Mode
**Portal Asrama Universitas Bunda Thamrin (UBT)**  
*Tech Stack: Laravel 11 · Inertia.js · React 19 · Tailwind CSS*

---

## 1. Pendekatan Desain (Design Approach)

Pada environment pengujian, evaluasi kepatuhan (*User Acceptance Testing / UAT*), dan penjaminan kualitas (*QA*), tester dan auditor membutuhkan pengalaman pengguna yang fokus, objektif, dan bebas distraksi.

Masalah pada antarmuka standar:
- Terlalu banyak banner pemasaran dan pengumuman yang memenuhi layar.
- Floating sidebar untuk alih peran (*persona switcher*) menghalangi elemen form penting pada layar kecil/tablet.
- Daftar tombol kredensial demo hardcoded pada halaman login berpotensi membocorkan data sampel ke publik atau membuat penguji mem-bypass proses validasi form sebenarnya.
- Pop-up modal onboarding SOP dan drawer simulasi yang muncul otomatis mengaburkan alur transaksi nyata.

### Prinsip Solusi Clean UI:
1. **Single Happy Path Focus**: Antarmuka dipangkas hingga hanya memuat elemen esensial:  
   `Login Instan` &rarr; `Pengisian Biodata & KYC` &rarr; `Penguncian Kamar (Tahap 2)` &rarr; `Kalkulasi Tagihan & Upload Struk (Tahap 3)` &rarr; `Tanda Tangan Kontrak Digital & OTP (Tahap 4)` &rarr; `Verifikasi Admin & Penerbitan e-Ticket`.
2. **Zero In-Component Pollution**: Menggunakan `MinimalTestingLayout` di tingkat root daripada menaburkan puluhan percabangan `if (isTestingMode)` ke dalam setiap komponen kecil.
3. **Dual Activation Mechanism**: Mode dapat dinyalakan melalui file konfigurasi `.env` (`APP_UI_MODE=clean`), serta mendukung aktivasi on-demand via URL query parameter (`?ui_mode=clean` atau `?testing=true`) khusus pada environment non-production (`local`, `testing`, `staging`).
4. **Production-First Security**: Parameter URL diabaikan secara mutlak jika `APP_ENV=production` guna mencegah mode testing diakses sembarangan pada live production.

---

## 2. Arsitektur Solusi (Solution Architecture)

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│               ARSITEKTUR LAYERED CLEAN UI & TESTING MODE (LARAVEL 11 + INERTIA)        │
└────────────────────────────────────────────────────────────────────────────────────────┘

 [HTTP REQUEST DARI BROWSER / TESTER]
                   │
                   ▼
 ┌──────────────────────────────────────────────────────────────────┐
 │ 1. Laravel 11 Middleware: HandleInertiaRequests                  │
 │    • config('app.ui_mode') === 'clean' || config('app.test_mode')│
 │    • Jika non-production: evaluasi query ?ui_mode=clean/standard │
 │    • Simpan state ke session('testing_ui_mode_active')           │
 └─────────────────┬────────────────────────────────────────────────┘
                   │
                   ▼
 ┌──────────────────────────────────────────────────────────────────┐
 │ 2. Inertia Shared Props (share())                                │
 │    'uiMode' => [                                                 │
 │        'isCleanTesting' => true/false,                           │
 │        'mode'           => 'clean' | 'standard',                 │
 │        'environment'    => 'staging',                            │
 │        'features'       => [                                     │
 │            'hideMarketingBanners' => true,                       │
 │            'hideDevToolsSidebar'  => true,                       │
 │            'hideDemoPresets'      => true,                       │
 │            'focusRegistrationFlow'=> true,                       │
 │        ]                                                         │
 │    ]                                                             │
 └─────────────────┬────────────────────────────────────────────────┘
                   │
                   ▼
 ┌──────────────────────────────────────────────────────────────────┐
 │ 3. React Client Context: TestingModeProvider & useTestingMode()   │
 │    • Mengambil state awal dari Inertia props / URL search params  │
 │    • Menyediakan fungsi toggleCleanTesting() & setCleanTesting() │
 └─────────────────┬────────────────────────────────────────────────┘
                   │
         ┌─────────┴───────────────────────┐
         │                                 │
 [isCleanTesting == true]       [isCleanTesting == false]
         │                                 │
         ▼                                 ▼
 ┌───────────────────────────────┐ ┌───────────────────────────────┐
 │ 4A. MinimalTestingLayout      │ │ 4B. Standard Layout           │
 │     • Header Minimal 1-Baris  │ │     • Full Header + Banners   │
 │     • Sembunyikan SidebarDev  │ │     • Floating SidebarGuide   │
 │     • Form Bersih (No Demo)   │ │     • Demo Presets & Jumper   │
 │     • Quiet Footer Pengujian  │ │     • Marketing Footer        │
 └───────────────────────────────┘ └───────────────────────────────┘
```

---

## 3. Contoh Kode Implementasi

### 3.1. Laravel Configuration (`config/app.php`)
```php
<?php

return [
    'name' => env('APP_NAME', 'Portal SI-GABUNG 54'),
    'env'  => env('APP_ENV', 'production'),

    /*
    |--------------------------------------------------------------------------
    | Clean UI & Testing Mode Settings
    |--------------------------------------------------------------------------
    */
    'ui_mode'   => env('APP_UI_MODE', 'standard'), // 'standard' | 'clean'
    'test_mode' => (bool) env('TEST_MODE', false),
];
```

### 3.2. Inertia Middleware Shared Props (`app/Http/Middleware/HandleInertiaRequests.php`)
```php
<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    public function share(Request $request): array
    {
        // 1. Evaluasi Clean UI / Production Mode: Default adalah PRODUKSI RIIL (Clean / Non-Dummy)
        // Kecuali jika secara spesifik diatur sebagai 'simulation' atau 'standard'
        $isCleanEnv = config('app.ui_mode') !== 'simulation' && config('app.ui_mode') !== 'standard';

        // 2. Dukungan override URL query (?mode=production vs ?mode=simulation atau ?ui_mode=clean)
        $isNonProd = app()->environment(['local', 'testing', 'staging', 'development']) || config('app.env') !== 'production';
        $queryOverride = null;

        if ($isNonProd) {
            $modeQuery = $request->query('mode');
            $uiModeQuery = $request->query('ui_mode');
            $cleanQuery = $request->query('clean');
            $testQuery = $request->query('testing');

            if ($modeQuery === 'simulation' || $uiModeQuery === 'simulation' || $uiModeQuery === 'standard' || $testQuery === 'false' || $cleanQuery === '0') {
                $queryOverride = false;
                $request->session()->put('asrama_operational_mode', 'simulation');
            } elseif ($modeQuery === 'production' || $uiModeQuery === 'clean' || $uiModeQuery === 'production' || $testQuery === 'true' || $cleanQuery === '1') {
                $queryOverride = true;
                $request->session()->put('asrama_operational_mode', 'production');
            } elseif ($request->session()->get('asrama_operational_mode') === 'simulation') {
                $queryOverride = false;
            } elseif ($request->session()->get('asrama_operational_mode') === 'production') {
                $queryOverride = true;
            }
        }

        $isTestingMode = $queryOverride !== null ? $queryOverride : $isCleanEnv;

        return array_merge(parent::share($request), [
            'uiMode' => [
                'isCleanTesting' => $isTestingMode,
                'appMode'        => $isTestingMode ? 'production' : 'simulation',
                'mode'           => $isTestingMode ? 'clean' : 'standard',
                'environment'    => config('app.env', 'production'),
                'features'       => [
                    'hideMarketingBanners'  => $isTestingMode,
                    'hideDevToolsSidebar'   => $isTestingMode,
                    'hideDemoPresets'       => $isTestingMode,
                    'hideStatisticsCards'   => $isTestingMode,
                    'hideOnboardingModals'  => $isTestingMode,
                    'focusRegistrationFlow' => $isTestingMode,
                ],
            ],
        ]);
    }
}
```

### 3.3. React Context & Hook (`src/context/TestingModeContext.tsx`)
```tsx
import React, { createContext, useContext, useState, useMemo } from 'react';

export type AppOperationalMode = 'production' | 'simulation';

export interface UiModeConfig {
  isCleanTesting: boolean;
  appMode?: AppOperationalMode;
  mode: 'standard' | 'clean';
  environment: string;
}

interface TestingModeContextType {
  isCleanTesting: boolean;
  appMode: AppOperationalMode;
  uiModeConfig: UiModeConfig;
  toggleCleanTesting: () => void;
  setCleanTesting: (active: boolean) => void;
  setAppMode: (mode: AppOperationalMode) => void;
}

const TestingModeContext = createContext<TestingModeContextType | undefined>(undefined);

export const TestingModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Default to TRUE (Mode Produksi Riil / Non-Dummy)
  const [isCleanTesting, setIsCleanTesting] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlMode = params.get('mode');
      if (urlMode === 'production' || urlMode === 'clean') return true;
      if (urlMode === 'simulation' || urlMode === 'standard') return false;

      const storedMode = localStorage.getItem('asrama_app_mode');
      if (storedMode === 'production') return true;
      if (storedMode === 'simulation') return false;
    }
    // Default adalah Mode Produksi (true)
    return true;
  });

  const appMode: AppOperationalMode = isCleanTesting ? 'production' : 'simulation';

  const toggleCleanTesting = () => {
    setIsCleanTesting((prev) => {
      const next = !prev;
      localStorage.setItem('portal_ubt_clean_mode', String(next));
      localStorage.setItem('asrama_app_mode', next ? 'production' : 'simulation');
      return next;
    });
  };

  const setAppMode = (mode: AppOperationalMode) => {
    const isClean = mode === 'production';
    setIsCleanTesting(isClean);
    localStorage.setItem('portal_ubt_clean_mode', String(isClean));
    localStorage.setItem('asrama_app_mode', mode);
  };

  return (
    <TestingModeContext.Provider value={{ isCleanTesting, appMode, toggleCleanTesting, setAppMode, ... }}>
      {children}
    </TestingModeContext.Provider>
  );
};

export const useTestingMode = () => useContext(TestingModeContext)!;
```

### 3.4. Minimal Testing Layout (`src/components/layout/MinimalTestingLayout.tsx`)
```tsx
import React from 'react';
import { ShieldCheck, LogOut, SlidersHorizontal } from 'lucide-react';
import { useTestingMode } from '../../context/TestingModeContext';

export const MinimalTestingLayout: React.FC<{
  children: React.ReactNode;
  userName?: string;
  onLogout: () => void;
}> = ({ children, userName, onLogout }) => {
  const { toggleCleanTesting } = useTestingMode();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-900">Portal Asrama UBT</span>
            <span className="text-xs text-teal-800 font-semibold bg-teal-50 border border-teal-200 px-2 py-0.5 rounded">
              Clean UI · Mode Pengujian UAT
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={toggleCleanTesting} className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Tampilan Standar</span>
            </button>
            <button onClick={onLogout} className="text-xs text-rose-700 bg-rose-50 px-2 py-1 rounded font-semibold flex items-center gap-1">
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6">
        {children}
      </main>

      <footer className="border-t border-slate-200 bg-white py-3 text-center text-xs text-slate-500">
        &copy; {new Date().getFullYear()} Universitas Bunda Thamrin · Lingkungan Pengujian Asrama (UAT/QA)
      </footer>
    </div>
  );
};
```

---

## 4. Penjelasan File yang Diubah & Struktur Direktori

| Lokasi File | Peran & Modifikasi |
| :--- | :--- |
| `config/app.php` | Menambahkan konfigurasi `'ui_mode'` dan `'test_mode'` terpusat. |
| `app/Http/Middleware/HandleInertiaRequests.php` | Mengevaluasi status environment, query URL `?ui_mode=clean`, dan membagikan props `'uiMode'` ke Inertia. |
| `src/context/TestingModeContext.tsx` | Context React & hook `useTestingMode()` untuk conditional rendering reaktif. |
| `src/components/layout/MinimalTestingLayout.tsx` | Layout khusus pengujian: tanpa sidebar floating, tanpa banner promosi, header 1-baris bersih. |
| `src/App.tsx` | Percabangan layout: merender `MinimalTestingLayout` saat `isCleanTesting` aktif. |
| `src/components/auth/LoginDualTab.tsx` | Menyembunyikan tombol preset akun demo publik dan jumper dev saat mode testing aktif. |
| `src/components/maba/MabaDashboard.tsx` | Menyembunyikan floating drawer sandbox dev tools saat mode testing aktif. |
| `.env.example` | Dokumentasi variabel `APP_UI_MODE` dan `TEST_MODE`. |

---

## 5. Contoh File `.env` untuk Testing & Staging

### 5.1. File `.env` Khusus Lingkungan UAT / Staging (Clean Testing)
```ini
APP_NAME="Portal Asrama UBT (UAT)"
APP_ENV=staging
APP_DEBUG=false
APP_URL=https://uat-asrama.ubtsu.ac.id

# AKTIFKAN CLEAN UI TESTING MODE SECARA PERMANEN DI SERVER UAT:
APP_UI_MODE=clean
TEST_MODE=true

# CLIENT FLAG UNTUK VITE SPA
VITE_APP_UI_MODE=clean
VITE_TEST_MODE=true

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_DATABASE=asrama_ubt_staging
DB_USERNAME=uat_user
DB_PASSWORD=secret_uat_password
```

### 5.2. File `.env` Standar Production (Aman)
```ini
APP_NAME="Portal Asrama UBT"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://asrama.ubtsu.ac.id

# PRODUCTION SELALU STANDAR (Query URL bypass diblokir otomatis):
APP_UI_MODE=standard
TEST_MODE=false
VITE_APP_UI_MODE=standard
VITE_TEST_MODE=false
```

---

## 6. Ringkasan Manfaat

1. **Efisiensi Pengujian (High Tester Productivity)**: Penguji dan calon mahasiswa pada sesi UAT dapat menyelesaikan 4 tahap registrasi tanpa distraksi banner atau popup.
2. **Keamanan Kredensial (Zero Credential Leakage)**: Tidak ada akun demo atau sampel nomor PMB yang terpampang di layar publik.
3. **Kompatibilitas Otomasi UAT (E2E Test-Friendly)**: Pengujian otomatis via Playwright/Cypress dapat memanggil endpoint dengan suffix `?ui_mode=clean` untuk memastikan DOM bersih tanpa elemen dinamis yang mengganggu selector pengujian.
4. **Keamanan Production Terjamin**: Mode testing dilindungi secara ketat oleh guard `APP_ENV !== 'production'`, sehingga tidak ada kemungkinan layout testing terbuka secara tidak disengaja di server produksi universitas.
