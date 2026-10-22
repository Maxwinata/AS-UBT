# Perbaikan 4 Bug Kritis Proyek AS-UBT (Laravel 11 + React / Laragon)

Rencana aksi menyeluruh untuk menuntaskan 4 isu kritis instalasi dan eksekusi pada lingkungan Laragon Windows (PHP 8.2, MySQL 8.0, Node.js):

### User Review & Critical Decisions

> [!IMPORTANT]
> Keputusan yang telah dikonfirmasi oleh pengguna pada sesi tanya-jawab:
> - **Build Output Vite**: Mengarahkan `build.outDir` secara tepat ke `public/build` dengan file `manifest.json` standar Laravel 11 Vite Plugin, dan mendukung fallback SPA server.
> - **Alur Eksekusi Database**: Memisahkan pemanggilan `php artisan migrate --force` dengan `php artisan db:seed --class=ProductionSeeder --force`, memvalidasi keberhasilan masing-masing langkah secara independen.

---

### 1. Overview & Core Concept

- **Tujuan**: Menghilangkan seluruh hambatan instalasi dan kompilasi pada `laragon-setup.bat`, menjamin migrasi SIMABA idempoten tanpa error duplicate key, memastikan bundle Vite tidak gagal karena `prop-types`, dan menyajikan 64 kamar fisik riil Roemah 54 ke seluruh antarmuka React.
- **Target Komponen**:
  1. `database/migrations/2026_10_17_000001_add_indexes_to_simaba_pendaftaran.php`
  2. `package.json`, `.npmrc`, dan `vite.config.ts`
  3. `laragon-setup.bat` (Fase [5/7] & [6/7])
  4. Komponen Form Pemilihan Kamar & Master Tarif (`src/data/initialData.ts`, `src/App.tsx`, `resources/js/Pages/Maba/Dashboard.tsx`)

---

### 2. Rincian Solusi Teknis Per Isu

#### 1. Idempotensi Migrasi SIMABA (Error 1061 Duplicate Key Name)
- **File**: `database/migrations/2026_10_17_000001_add_indexes_to_simaba_pendaftaran.php`
- **Penyebab**: Saat migrasi dijalankan ulang, indeks `idx_pmb_auth`, `idx_pmb_nama`, `idx_pmb_nik`, dan `idx_pmb_prodi_jalur` sudah ada di tabel `pendaftaranmahasiswa` pada database `u540633926_simaba`, memicu exception SQL 1061.
- **Solusi**:
  - Pada method `up()`: Ambil daftar indeks yang sudah ada via `SHOW INDEXES FROM pendaftaranmahasiswa` pada koneksi `simaba`. Lakukan penambahan indeks hanya jika nama indeks belum terdaftar.
  - Pada method `down()`: Lakukan pengecekan keberadaan indeks sebelum memanggil `$table->dropIndex(...)`.
  - Migrasi menjadi aman dijalankan berkali-kali (*idempotent*).

#### 2. Dependensi `prop-types` & Konfigurasi Vite Build
- **File**: `package.json`, `.npmrc`, `vite.config.ts`, `server.ts`
- **Penyebab**: Paket `react-signature-canvas` membutuhkan `prop-types` pada waktu bundling Rollup. Ketiadaan paket ini menyebabkan `vite build` gagal dan `public/build/manifest.json` tidak terbentuk.
- **Solusi**:
  - Tambahkan `"prop-types": "^15.8.1"` ke dalam blok `"dependencies"` di `package.json`.
  - Konfigurasikan `vite.config.ts` dengan `build: { outDir: 'public/build', manifest: 'manifest.json' }` dan input entrypoints `resources/js/app.tsx` & `resources/css/app.css` serta `index.html`.
  - Buat file `.npmrc` dengan `ignore-scripts=false`, `legacy-peer-deps=true`, dan `audit=false`.
  - Sesuaikan `server.ts` agar menyajikan aset produksi dari `public/build` saat running production.

#### 3. Penataan Skrip Installer Otomatis (`laragon-setup.bat`)
- **Penyebab**: Pemanggilan `migrate --seed` tergabung dalam satu instruksi sehingga kegagalan migrasi koneksi sekunder membuat seeder terlewati tanpa peringatan.
- **Solusi**:
  - Langkah `[5/7]`: Jalankan `call php artisan migrate --force`. Kemudian secara eksplisit jalankan `call php artisan db:seed --class=ProductionSeeder --force` (untuk opsi 1) atau `call php artisan db:seed --force` (untuk opsi 2) dan periksa `%ERRORLEVEL%`.
  - Langkah `[6/7]`: Setelah `call npm run build`, verifikasi langsung keberadaan `public\build\manifest.json`. Lanjutkan dengan `call php artisan optimize:clear`.

#### 4. Form Pendaftaran & Kamar Menggunakan 64 Kamar Fisik Riil Roemah 54
- **Penyebab**: Frontend masih memiliki fallback ke 3 kamar dummy lama (`RM-A101`, `RM-B204`, `RM-C302`).
- **Solusi**:
  - Ganti seluruh array `INITIAL_ROOMS` di `src/data/initialData.ts` dengan 64 kamar fisik riil Roemah 54 sesuai `RealRoomSeeder` (PA-101 s.d. PA-312 untuk Gedung Putra, PI-101 s.d. PI-312 untuk Gedung Putri).
  - Hubungkan `MabaDashboard` dan `RoomSelectionStep` dengan props `rooms` dan `tariffs` dari database hasil seeder, dengan fallback ke struktur 64 kamar riil yang identik.

---

### 3. Key Product Decisions & Trade-Offs

- **Keputusan 1: Dual-Output Support (Laravel Blade Manifest & SPA Preview)**
  - *Pendekatan*: Menghasilkan `public/build/manifest.json` yang berisi entri `resources/js/app.tsx` dan `resources/css/app.css` sekaligus `index.html`.
  - *Alasan*: Memenuhi kebutuhan Laravel `@vite()` di Laragon tanpa merusak preview SPA port 3000.
- **Keputusan 2: Query Raw SHOW INDEXES pada Migrasi SIMABA**
  - *Pendekatan*: Menggunakan query `SHOW INDEXES FROM pendaftaranmahasiswa` pada koneksi `simaba`.
  - *Alasan*: Metode bawaan `Schema::hasIndex` di beberapa versi driver MySQL/Laravel terkadang memerlukan nama database secara eksplisit; query raw terbukti 100% konsisten di MySQL 8 Laragon.

---

### 4. Technical Architecture & File Modification Plan

```
┌─────────────────────────────────────────────────────────────┐
│                 Alur Eksekusi Terintegrasi                  │
│                                                             │
│   laragon-setup.bat                                         │
│     │                                                       │
│     ├─► [5/7] php artisan migrate --force                   │
│     │         (Migrasi SIMABA Idempoten - No Error 1061)    │
│     │         php artisan db:seed --class=ProductionSeeder  │
│     │         (64 Kamar Fisik Riil & Master SK Rektor)      │
│     │                                                       │
│     └─► [6/7] npm install --legacy-peer-deps                │
│               (prop-types terpasang, no missing rollup)     │
│               npm run build -> public/build/manifest.json   │
│               php artisan optimize:clear                    │
└─────────────────────────────────────────────────────────────┘
```

- **File yang Akan Diperbarui Secara Lengkap**:
  1. `/database/migrations/2026_10_17_000001_add_indexes_to_simaba_pendaftaran.php`
  2. `/package.json`
  3. `/.npmrc`
  4. `/vite.config.ts`
  5. `/server.ts`
  6. `/laragon-setup.bat`
  7. `/src/data/initialData.ts`
