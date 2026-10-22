# Rencana Perbaikan 3 Bug Tersisa Proyek AS-UBT (Laragon Windows)

Menuntaskan 3 kendala residual pada proses kompilasi aset frontend, mekanisme caching backend Laravel 11, dan interpretasi baris perintah pada Windows CMD:

### User Review & Critical Decisions

> [!IMPORTANT]
> Keputusan yang telah dikonfirmasi oleh pengguna pada sesi tanya-jawab:
> - **Strategi Cache**: Menyediakan file migrasi tabel `cache` dan `cache_locks` pada database `asrama_ubt_db` sekaligus menetapkan `CACHE_STORE=file` dan `SESSION_DRIVER=file` sebagai nilai default di `.env.example` untuk menjamin kompatibilitas ganda (*fail-safe dual compatibility*).
> - **Sanitasi Skrip Batch**: Mengganti seluruh karakter ampersand (`&`) pada file `.bat` menjadi kata `dan` untuk mencegah parser Windows CMD memperlakukannya sebagai pemisah perintah (*command separator*).

---

### 1. Overview & Core Concept

- **Tujuan**:
  1. Menghilangkan kegagalan bundling Rollup pada `recharts` dengan menginstal paket `react-is`.
  2. Menjamin perintah `php artisan optimize:clear` berjalan 100% sukses tanpa error `Table 'asrama_ubt_db.cache' doesn't exist`.
  3. Menjamin skrip `.bat` tidak memicu pesan error `'Portal' is not recognized` atau `'rute' is not recognized` di terminal Laragon.
- **Target File**:
  1. `package.json`
  2. `database/migrations/2026_01_01_000000_create_cache_table.php` (file migrasi baru)
  3. `.env.example`
  4. `laragon-setup.bat`
  5. `laragon-test-crud.bat`

---

### 2. Rincian Teknis Perbaikan

#### 1. Pemasangan `react-is` (`package.json`)
- **Masalah**: `[vite]: Rollup failed to resolve import "react-is" from "node_modules/recharts/es6/util/ReactUtils.js"`.
- **Solusi**:
  - Instal `"react-is": "^18.3.1"` ke dalam blok `"dependencies"` di `package.json`.
  - Uji ulang `compile_applet` untuk memastikan Rollup sukses mengompilasi seluruh modul `recharts` ke dalam `public/build`.

#### 2. Migrasi Tabel `cache` & Konfigurasi Cache Default
- **Masalah**: `SQLSTATE[42S02]: Table 'asrama_ubt_db.cache' doesn't exist` saat `optimize:clear`.
- **Solusi**:
  - Buat file migrasi `database/migrations/2026_01_01_000000_create_cache_table.php` yang membuat tabel `cache` (`key`, `value`, `expiration`) dan `cache_locks` (`key`, `owner`, `expiration`) dengan proteksi idempoten `Schema::hasTable`.
  - Di `.env.example`, pastikan `CACHE_STORE=file` dan `SESSION_DRIVER=file`. Dengan demikian, jika sistem beralih ke cache database pun, tabelnya sudah tersedia di MySQL.

#### 3. Sanitasi Karakter `&` pada Skrip Batch Windows
- **Masalah**: CMD Windows mengeksekusi karakter `&` yang tidak dikutip sebagai tanda pemisah perintah berikutnya.
  - Teks `Blade & Portal` menyebabkan Windows mengeksekusi perintah `Portal`.
  - Teks `konfigurasi & rute` menyebabkan Windows mengeksekusi perintah `rute`.
- **Solusi**:
  - Periksa dan ganti semua karakter `&` pada kalimat `echo` dan `title` di `laragon-setup.bat` dan `laragon-test-crud.bat` dengan kata `dan`.

---

### 3. Technical Architecture & File Plan

```
┌─────────────────────────────────────────────────────────────┐
│                 Alur Penyelesaian 3 Bug                     │
│                                                             │
│   package.json                                              │
│   └── Tambah "react-is": "^18.3.1"                          │
│                                                             │
│   database/migrations/                                      │
│   └── 2026_01_01_000000_create_cache_table.php (Baru)       │
│                                                             │
│   .env.example                                              │
│   └── CACHE_STORE=file, SESSION_DRIVER=file                 │
│                                                             │
│   laragon-setup.bat & laragon-test-crud.bat                 │
│   └── Sanitasi seluruh karakter '&' -> 'dan'                │
└─────────────────────────────────────────────────────────────┘
```

- **Status Eksekusi & Hasil Verifikasi**:
  1. [SELESAI] Eksekusi `npm run build` dan `compile_applet`: Sukses 100%, seluruh 3919 modul ditransformasikan dan dibundel tanpa error, file `public/build/manifest.json` terbentuk.
  2. [SELESAI] Eksekusi `lint_applet` (`tsc --noEmit`): Sukses tanpa ada error TypeScript.
  3. [SELESAI] Migrasi `cache` dan `cache_locks` dibuat dengan proteksi idempoten `Schema::hasTable`.
  4. [SELESAI] Konfigurasi `.env.example` diatur ke `CACHE_STORE=file` dan `SESSION_DRIVER=file`.
  5. [SELESAI] Karakter ampersand di `laragon-setup.bat` dan `laragon-test-crud.bat` telah diganti dengan kata `dan`.
  6. [SELESAI] Dev server port 3000 terverifikasi aktif dengan respons `HTTP/1.1 200 OK`.

