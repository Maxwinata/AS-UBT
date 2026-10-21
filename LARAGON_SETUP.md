# Panduan Praktis Pengembangan Langsung di Laragon (Laravel 11 + Inertia.js + React)

> **Pilihan Bahasa / Language:** 🇮🇩 **Bahasa Indonesia (Utama)** | [🇬🇧 English Version](LARAGON_SETUP.en.md)

Proyek ini telah dikondisikan secara penuh (**turnkey full-stack ready**) agar dapat langsung dijalankan di lingkungan **Laragon (Windows / MySQL / PHP 8.2+ / Apache/Nginx)** menggunakan arsitektur **Laravel 11 + Inertia.js + React**.

---

## 🚀 Cara Menjalankan di Laragon (Paling Cepat - 1 Klik)

1. Clone repositori ini langsung ke dalam folder root Laragon:
   ```bash
   cd C:\laragon\www
   git clone <URL_REPO_GITHUB_ANDA> asrama-ubt
   cd asrama-ubt
   ```
2. Pastikan servis **MySQL** & **Apache/Nginx** di aplikasi Laragon sudah dalam keadaan **Start All**.
3. Di dalam folder `asrama-ubt`, cukup **klik 2x file `laragon-setup.bat`** (atau jalankan via Terminal Laragon).
   * Script otomatis:
     - Meng-copy `.env.example` ke `.env`
     - Menjalankan `composer install`
     - Men-generate `APP_KEY`
     - Menyiapkan dual database MySQL (`asrama_ubt_db` & `u540633926_simaba`)
     - **Pilihan Seeder Terkalibrasi**:
       * **[1] Mode Produksi Riil (Default / Disarankan)**: Menjalankan `ProductionSeeder` (100% bebas akun dummy mahasiswa; hanya menginisialisasi Master Tarif SK Rektor, 64 Kamar Fisik Riil Roemah 54, dan akun staf resmi).
       * **[2] Mode Simulasi**: Menjalankan `DatabaseSeeder` (menyertakan akun sampel mahasiswa untuk keperluan QA).
     - Menjalankan `npm install`
4. Jalankan Vite frontend di terminal:
   ```bash
   npm run dev
   ```
5. Buka browser:
   * **Domain otomatis Laragon**: `http://asrama-ubt.test`
   * Atau via server lokal: `http://127.0.0.1:8000` (jika menggunakan `php artisan serve`).

> ⚡ **Uji Live CRUD MySQL (1-Klik Tanpa Browser)**:  
> Jalankan file **`laragon-test-crud.bat`** di root folder untuk menguji operasi Create, Read, Update, Delete nyata langsung ke tabel MySQL `asrama_ubt_db` dan memverifikasi koneksi handshake dual-database.

> 🧪 **Langkah Pengujian Logika Program (Data Real)**:  
> Untuk panduan rinci langkah-demi-langkah menguji alur pendaftaran mahasiswa baru dari formulir hingga migrasi otomatis ke tabel master di MySQL Laragon, silakan baca:  
> 👉 [**Panduan Testing Data Real di Laragon (`docs/TESTING_DATA_REAL_LARAGON.md`)**](docs/TESTING_DATA_REAL_LARAGON.md)

---

## 📁 Struktur Berkas Terkondisi (Laravel + Inertia)

Struktur kode telah terorganisir rapi mengikuti konvensi resmi Laravel + Inertia:

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
│   │   ├── app.tsx                                     # Inisialisasi createInertiaApp
│   │   └── bootstrap.ts                                # Axios & CSRF Setup
│   └── views/
│       └── app.blade.php                               # Root Blade Layout Inertia (@inertia, @vite)
├── routes/
│   ├── web.php                                         # Rute Halaman Web Inertia.js
│   ├── api.php                                         # Rute Webhook BSI & Virtual Account
│   └── console.php                                     # Jadwal CRON Eksekusi Otomatis Harian Pukul 00:01 WIB
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
