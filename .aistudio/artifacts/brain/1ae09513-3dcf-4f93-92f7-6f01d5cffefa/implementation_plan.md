# Rencana Implementasi: Panduan Lengkap Pengujian & Operasional Laragon (Langkah 1 s.d. 6, Development, hingga Production)

Rencana ini menyusun pembaruan komprehensif pada dokumen panduan teknis **`docs/TESTING_DATA_REAL_LARAGON.md`** beserta versi Bahasa Inggrisnya **`docs/TESTING_DATA_REAL_LARAGON.en.md`**. Panduan ini akan merinci setiap tahapan pendaftaran mahasiswa (Langkah 1 s.d. 6), pengujian peran manajerial (Multi-Role Admin), instrumen teknis *development & debugging*, arsitektur penyimpanan privat e-KYC, hingga *checklist* kesiapan *production deployment*.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> Keputusan dan preferensi pengguna yang telah dikonfirmasi:
> - **Cakupan Dokumen**: Melengkapi seluruh tahapan pendaftaran mahasiswa baru (Langkah 1 s.d. 6) tanpa terputus.
> - **Cakupan Pengembangan (*Development*)**: Menyediakan panduan menyeluruh mulai dari arsitektur e-KYC private storage, simulasi OTP WhatsApp, pengujian multi-role admin, manajemen log, hingga pengujian via Tinker/Artisan.
> - **Kesiapan Produksi (*Production Readiness*)**: Menyertakan konfigurasi pengerasan keamanan (*security hardening*), optimasi performa basis data, virtual host web server (Nginx/Apache), worker antrean (*queue workers*), dan strategi *backup/recovery*.
> - **Dukungan Dwi-Bahasa**: Menyinkronkan secara penuh dokumen Bahasa Indonesia (`docs/TESTING_DATA_REAL_LARAGON.md`) dan Bahasa Inggris (`docs/TESTING_DATA_REAL_LARAGON.en.md`).

---

## 1. Overview & Core Concept

### A. Latar Belakang & Nilai Tambah
1. **Transisi Prototipe ke Sistem Riil**:
   - Memastikan pengembang, penguji sistem (*QA*), staf keuangan, dan staf asrama memiliki rujukan operasional tunggal (*single source of truth*) yang mencakup logika bisnis Laravel 11, Inertia.js, dan basis data MySQL ganda (`asrama_ubt_db` & `u540633926_simaba`).
2. **Kepatuhan Aturan Bisnis & Audit Trail**:
   - Menjamin setiap tahapan dari input mandiri e-KYC hingga *check-in* fisik di gerbang asrama tercatat dengan integritas data tinggi, termasuk pemisahan status penampungan sementara (*staging*, `operator_id = 0`) ke buku besar resmi (*running master tables*, `operator_id >= 1`).

---

## 2. Struktur Rinci Bab Panduan yang Akan Dilengkapi

```
┌─────────────────────────────────────────────────────────────────────────────┐
│              STRUKTUR PANDUAN PENGUJIAN & DEVELOPMENT LARAGON               │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
     ┌─────────────────────────────────┼─────────────────────────────────┐
     ▼                                 ▼                                 ▼
┌──────────────────────────┐ ┌──────────────────────────┐ ┌──────────────────────────┐
│ TAHAP 1 S.D. 6 MABA      │ │ ALUR MULTI-ROLE ADMIN    │ │ DEVELOPMENT & PRODUCTION │
│                          │ │                          │ │                          │
│ • Step 1: e-KYC Private  │ │ • Admin Keuangan         │ │ • Debugging & Logs       │
│ • Step 2: Pilih Kamar    │ │   (Staging -> Master)    │ │ • Tinker Inspection     │
│ • Step 3: Billing & Bayar│ │ • Admin Kamar/Asrama     │ │ • e-KYC Private Disk     │
│ • Step 4: Kontrak OTP WA │ │   (Alokasi & BASTK)      │ │ • Production Hardening   │
│ • Step 5: Ratifikasi F22 │ │ • Super Admin Monitoring │ │ • Queue & Nginx VHost    │
│ • Step 6: e-Ticket Gate  │ │                          │ │                          │
└──────────────────────────┘ └──────────────────────────┘ └──────────────────────────┘
```

### Bab 1: Fondasi Dual Database & Skrip Otomasi 1-Klik
- Konfigurasi parameter koneksi `mysql` dan `simaba`.
- Eksekusi skrip otomatisasi `laragon-setup.bat` dan `.sh`.
- Verifikasi 4 indeks B-Tree (`idx_pmb_auth`, `idx_pmb_nama`, `idx_pmb_nik`, `idx_pmb_prodi_jalur`) dan uji eksekusi `EXPLAIN`.

### Bab 2: Matriks Data Pengujian PMB Real (Data Dump SIMABA)
- Profil mahasiswa pengujian lengkap (KIP Kuliah Subsidi 100%, Reguler Mandiri, Deteksi Dini NIM Resmi, Format Registrasi Alphanumeric).
- UX Live Search Auto-Suggest (Debounce 200ms, matched highlight `<mark>`, navigasi keyboard `↑`/`↓`/`Enter`/`Esc`, dan masking tanggal lahir `DD/MM/YYYY`).

### Bab 3: Panduan Uji Rinci Setiap Tahapan Mahasiswa (Langkah 1 s.d. 6)
1. **Langkah 1 — Pengisian Identitas & Unggah e-KYC**:
   - Unggah KTP & Selfie Biometrik ke disk privat (`storage/app/private_kyc`).
   - Verifikasi penamaan file non-overwriting (versioning UUID/timestamp) untuk audit trail.
2. **Langkah 2 — Pemilihan Kamar & Ranjang**:
   - Filter lantai dan ketersediaan ranjang (Gedung Putra/Putri).
   - Penguncian status kamar sementara (*room hold*).
3. **Langkah 3 — Skema Sewa, Billing, & Bukti Bayar**:
   - Penetapan tarif sewa (KIP: Rp 0; Reguler: Sewa + Deposit + Admin + Kode Unik 3 Digit).
   - Unggah bukti transfer ke tabel staging `request_pembayaran` (`operator_id = 0`).
4. **Langkah 4 — Penandatanganan Kontrak Digital via OTP WhatsApp**:
   - Penandatanganan klausul kontrak sewa (Formulir F-19 & F-02).
   - Simulasi pengiriman OTP WhatsApp (kode sandbox `123456`).
   - Perekaman hash digital dokumen, nomor HP penerima, dan timestamp penandatanganan.
5. **Langkah 5 — Pengesahan Ratifikasi F-22 & BASTK**:
   - Penerbitan Lembar Ratifikasi F-22 dan Berita Acara Serah Terima Kamar (BASTK).
   - Verifikasi tanda tangan digital dua pihak (Mahasiswa & Kepala Pengelola Asrama).
6. **Langkah 6 — Penerbitan Tiket Masuk Digital & Validasi Check-In Gerbang**:
   - Penerbitan e-Ticket / Boarding Pass Asrama dilengkapi kode QR digital.
   - Simulasi pemindaian QR code di pos gerbang masuk asrama untuk aktivasi status penghuni resmi.

### Bab 4: Pengujian Operasional Panel Multi-Role Admin
1. **Admin Keuangan**:
   - Membuka menu *Verifikasi Pembayaran*.
   - Mengeksekusi aksi `APPROVE_AND_MIGRATE`.
   - Memverifikasi mutasi data dari `request_pembayaran` (`operator_id = 0`) menuju buku besar resmi `pembayaran` & `transaksi` (`operator_id >= 1`).
2. **Admin Kamar / Fasilitas Asrama**:
   - Pemantauan okupansi kamar real-time (kamar berubah menjadi `OCCUPIED`).
   - Penerbitan inventaris kamar (kunci, kasur, lemari) pada lembar BASTK.
3. **Super Admin**:
   - Monitoring sinkronisasi dual database SIMABA dan status bridging SIAKAD/SIDARA.
   - Pengecekan audit trail perubahan profil dan riwayat e-KYC.

### Bab 5: Panduan Teknis Development & Debugging di Laragon
1. **Manajemen Berkas e-KYC Private Storage**:
   - Alur pengujian generator *Signed URLs* sementara (berlaku 10–15 menit).
   - Pencegahan akses publik langsung (`403 Forbidden` pada akses URL statis tanpa otorisasi).
   - Kebijakan pembersihan berkas yatim piatu (*garbage collection lifecycle*).
2. **Pengecekan Log & Debugging Error**:
   - Memantau log backend secara langsung: `tail -f storage/logs/laravel.log`.
   - Penanganan *error handling* standar (koneksi ditolak, kredensial salah, upload melebihi batas).
3. **Inspeksi Interaktif via Laravel Tinker**:
   - Perintah query pengujian model `SimabaPendaftaran`, `BillingInvoice`, dan `Room`.
   - Skrip simulasi mutasi status kamar via CLI.

### Bab 6: Panduan Kesiapan Menuju Lingkungan Production (*Production Readiness*)
1. **Pengerasan Keamanan (*Security Hardening*)**:
   - Konfigurasi `.env.production` (`APP_DEBUG=false`, `APP_ENV=production`, `SESSION_SECURE_COOKIE=true`).
   - Proteksi kunci enkripsi aplikasi (`php artisan key:generate`).
2. **Optimasi Kinerja Laravel & Basis Data**:
   - Kompilasi cache rute dan konfigurasi: `php artisan config:cache`, `php artisan route:cache`, `php artisan view:cache`.
   - Pemeliharaan indeks basis data MySQL untuk query skala puluhan ribu mahasiswa.
3. **Konfigurasi Web Server (Virtual Host Nginx / Apache)**:
   - Pengaturan *DocumentRoot* mengarah ke folder `/public`.
   - Konfigurasi rewrite rule untuk SPA Inertia.js dan routing REST API.
4. **Worker Antrean & Penjadwal Tugas (*Queue Workers & Cron*)**:
   - Menjalankan queue worker untuk background notification OTP WhatsApp (`php artisan queue:work`).
   - Menjadwalkan cron job Laravel (`* * * * * php /path/to/artisan schedule:run`).
5. **Strategi Backup & Disaster Recovery**:
   - Skrip backup otomatis basis data `asrama_ubt_db` dan `u540633926_simaba` menggunakan `mysqldump`.
   - Prosedur pemulihan data (*restore*) saat terjadi insiden.

---

## 3. Rencana Eksekusi File

1. **`docs/TESTING_DATA_REAL_LARAGON.md`**:
   - Menulis ulang dan melengkapi dokumen utama dalam Bahasa Indonesia dengan seluruh bab di atas secara terstruktur, jelas, dan dapat langsung dipraktikkan.
2. **`docs/TESTING_DATA_REAL_LARAGON.en.md`**:
   - Menulis ulang dan melengkapi dokumen pendamping dalam Bahasa Inggris dengan konten yang identik dan konsisten.
3. **Verifikasi Build & Integritas**:
   - Menjalankan `compile_applet` dan `lint_applet` untuk memastikan seluruh aplikasi tetap dalam kondisi hijau dan bebas galat.
