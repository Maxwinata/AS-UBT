# Panduan Praktis Pengembangan Langsung di Laragon (Laravel 11 + Inertia.js + React)

> **Pilihan Bahasa / Language:** 🇮🇩 **Bahasa Indonesia (Utama)** | [🇬🇧 English Version](LARAGON_SETUP.en.md)

Proyek ini telah dikondisikan secara penuh (**turnkey full-stack ready**) agar dapat langsung dijalankan di lingkungan **Laragon (Windows / MySQL / PHP 8.2+ / Apache/Nginx)** menggunakan arsitektur **Laravel 11 + Inertia.js + React**.

---

## 🚀 Cara Menjalankan di Laragon (Mode Stabil 1-Klik untuk Pengguna Awam)

Anda **tidak perlu** membuka terminal atau membiarkan perintah `npm run dev` terus menyala. Kedua file `.bat` di dalam folder proyek sudah dilengkapi **Auto-Detect PATH Laragon** sehingga dapat langsung **diklik 2x dari Windows File Explorer**:

### A. Persiapan Pertama Kali (Cukup Sekali Saja)
1. Letakkan atau *clone* folder proyek ini di dalam `C:\laragon\www\asrama-ubt`.
2. Buka aplikasi **Laragon** dan klik tombol **Start All** (agar MySQL & Apache aktif).
3. Di Windows Explorer, buka folder proyek lalu **klik 2x file `laragon-setup.bat`**.
   * Skrip ini bekerja otomatis dari awal sampai akhir:
     - Mendeteksi otomatis lokasi PHP, MySQL, Composer, dan Node.js di `C:\laragon\bin`.
     - Menyalin `.env` dan menghapus file pengganggu `public\hot` (pencegah layar putih).
     - Memasang paket PHP (`composer install`) & membuat kunci keamanan (`key:generate`).
     - Membuat database `asrama_ubt_db` dan `u540633926_simaba` di MySQL Laragon.
     - Mengisi **64 Kamar Fisik Roemah 54**, Tarif Resmi SK Rektor, dan Akun Staf (cukup tekan **Enter** saat ditanya pilihan seeder).
     - Mengompilasi tampilan permanen (`npm run build`) ke `public\build\manifest.json` sehingga aplikasi selalu aktif tanpa perlu `npm run dev`.
     - Langsung membuka aplikasi di Browser Anda!

---

### B. Penggunaan Harian & Pengujian Database (Klik 2x `laragon-test-crud.bat`)
Untuk penggunaan sehari-hari, Anda cukup **klik 2x file `laragon-test-crud.bat`**. Akan muncul **Pusat Kendali Harian** berbahasa awam dengan pilihan:

| Nomor Menu | Fungsi Utama (Cukup Ketik Angka lalu Enter) |
| :---: | :--- |
| **`[1]`** | **BUKA APLIKASI MODE STABIL (Disarankan untuk Harian)**<br>Otomatis mencegah layar putih (menghapus `public\hot`), membersihkan cache, dan langsung membuka aplikasi di Browser (`http://127.0.0.1:8000/login` atau `http://asrama-ubt.test/login`) tanpa perlu menyalakan `npm run dev`. |
| **`[2]`** | **PERBARUI TAMPILAN PERMANEN**<br>Pilih menu ini jika Anda baru saja menarik update kode baru agar perubahan tampilan disimpan permanen (`npm run build`). |
| **`[3]`** | **RESET & ISI ULANG DATABASE AWAL**<br>Mengembalikan database MySQL ke kondisi awal yang bersih beserta 64 kamar fisik Roemah 54 dan tarif SK Rektor. |
| **`[4]`** | **TES OTOMATIS 4 TAHAP PENDAFTARAN KE MYSQL**<br>Menjalankan pengujian otomatis alur Biodata e-KYC, Kunci Kamar, Tagihan, hingga Kontrak langsung ke MySQL (hasilnya bisa dilihat di phpMyAdmin). |
| **`[5]`** | **TES OTOMATIS 4 TAHAP + BERSIHKAN KEMBALI (`--cleanup`)**<br>Memastikan seluruh fungsi database sehat 100%, lalu menghapus kembali data tesnya. |
| **`[6]`** | **TARIK DATA MAHASISWA DARI SERVER KAMPUS (API SIDARA)**<br>Menyinkronkan data calon mahasiswa terbaru ke tabel staging `siakad_mahasiswa_stg`. |

> 🧪 **Langkah Pengujian Logika Program (Data Real)**:  
> Untuk panduan rinci langkah-demi-langkah menguji alur pendaftaran mahasiswa baru dari formulir hingga migrasi otomatis ke tabel master di MySQL Laragon, silakan baca:  
> 👉 [**Panduan Testing Data Real di Laragon (`docs/TESTING_DATA_REAL_LARAGON.md`)**](docs/TESTING_DATA_REAL_LARAGON.md)

---

## 📁 Struktur Berkas Terkondisi (Laravel + Inertia)

Struktur kode telah terorganisir rapi mengikuti konvensi resmi Laravel 11 + Inertia.js 2.0 + React 19:

```
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Maba/MabaDashboardController.php        # Controller Alur Pendaftaran PMB / Maba
│   │   │   ├── Admin/AdminAsramaController.php         # Controller Panel Pengelola Asrama & Keuangan
│   │   │   ├── Eksisting/EksistingDashboardController.php # Controller Mahasiswa Senior Penghuni
│   │   │   ├── Billing/InvoiceController.php           # Controller Tagihan, Mutasi BSI & VA
│   │   │   ├── Kyc/KycVerificationController.php       # Controller Upload e-KYC (KTP & Selfie)
│   │   │   └── Sop/CronSopController.php               # Controller Mesin CRON Toleransi 5+5 Hari
│   │   └── Middleware/
│   │       ├── HandleInertiaRequests.php               # Middleware Pengiriman Shared Props Inertia
│   │       └── EnsureUserRole.php                      # Role-Based Access Control (RBAC)
│   └── Models/                                         # Eloquent Models (User, MabaProfile, BillingInvoice, Room, Contract, Ticket, Delinquency, Tariff, PaymentScheme)
├── config/                                             # filesystems.php (Private KYC Disk), database.php, app.php, auth.php
├── database/
│   ├── migrations/                                     # 4 Berkas migrasi database MySQL terkalibrasi lengkap
│   └── seeders/                                        # ProductionSeeder (Non-Dummy Default), DatabaseSeeder (Simulasi), TariffSeeder, RealRoomSeeder
├── resources/
│   ├── js/
│   │   ├── Pages/                                      # Inertia Page Views (Maba/Dashboard, Admin/Dashboard, Eksisting/Dashboard, Auth/Login, Sop/CronMonitor)
│   │   ├── app.tsx                                     # Single Entry Point React 19, createInertiaApp, Error Boundary & Dynamic Lazy Loading
│   │   └── bootstrap.ts                                # Axios & CSRF Setup
│   └── views/
│       └── app.blade.php                               # Root Blade Layout Inertia (#app dual payload data-page/script + fallback #root)
├── routes/
│   ├── web.php                                         # Rute Halaman Web Inertia.js
│   ├── api.php                                         # Rute Webhook BSI & Virtual Account
│   └── console.php                                     # Jadwal CRON Eksekusi Otomatis Harian Pukul 00:01 WIB
├── vite.config.ts                                      # Konfigurasi Single-Entry Vite, manualChunks dynamic splitting & process.env shim
├── laragon-setup.bat                                   # Skrip Otomatisasi 1-Klik Setup Laragon
├── laragon-test-crud.bat                              # Skrip Pengujian Live CRUD Dual Database MySQL
├── composer.json                                       # Dependensi PHP Laravel 11 & Inertia
└── .env.example                                        # Konfigurasi Lingkungan Laragon Presets
```

---

## 🔒 Kebijakan Penyimpanan Dokumen e-KYC (KTP & Selfie)
Sesuai audit trail SOP:
1. **Versioning**: File KTP/Selfie tidak ditimpa (*no overwrite*), melainkan diberi timestamp unik (`ktp_{nim}_{timestamp}_{random}.jpg`) untuk menjaga keabsahan riwayat audit log.
2. **Private Storage**: Tersimpan pada `storage/app/private_kyc` (tidak bisa diakses publik langsung secara bebas).
3. **Signed URLs**: Akses pratinjau staf admin menggunakan Signed URL sementara dengan masa kedaluwarsa 15 menit.

---

## ⏰ Mesin CRON SOP Penegakan Toleransi 5+5 Hari
Bisa diuji coba secara manual melalui artisan:
```bash
php artisan sop:enforce-grace
```
Atau memantau lewat antarmuka web di rute `/sop/cron-monitor`.
Alur 3 tingkat otomatis:
* **Hari 1–5**: Toleransi sewa kalender (tanpa denda).
* **Hari 6–10**: Pemotongan sewa dari deposit jaminan & masa tenggang 5 hari isi ulang (*top-up*) deposit.
* **Hari 11+**: Wanprestasi akut (Denda Rp 500.000, pengakhiran sewa kamar & sisa deposit dinyatakan hangus).

---

## 🛠️ Panduan Solusi Kendala (Troubleshooting)

### Kendala: `npm warn install-scripts` atau `npm run dev` Error esbuild Native Binary
**Penyebab:**
Versi npm modern pada lingkungan Windows sering memblokir skrip lifecycle otomatis (`postinstall`) demi alasan keamanan sistem (`allowScripts`). Akibatnya, paket `esbuild` belum sempat mengunduh atau menautkan berkas *native executable* Windows (`esbuild.exe`). Ketika `npm run dev` dijalankan, server `tsx` / `vite` gagal memanggil esbuild.

**Solusi Cepat (Cukup 1 Baris Perintah):**
Jalankan perintah ini di terminal Laragon pada folder proyek:
```bash
node node_modules/esbuild/install.js
```
Setelah proses selesai dalam 1-2 detik, langsung jalankan server:
```bash
npm run dev
```

**Solusi Alternatif (Jika Menggunakan Fitur npm install-scripts):**
```bash
npm install-scripts approve esbuild
npm rebuild esbuild
```
*Catatan: Paket lain seperti `@google/genai`, `core-js`, `protobufjs`, dan `tesseract.js` yang muncul di log peringatan hanyalah skrip donasi/telemetri opsional, sehingga TIDAK mempengaruhi jalannya server sama sekali.*
