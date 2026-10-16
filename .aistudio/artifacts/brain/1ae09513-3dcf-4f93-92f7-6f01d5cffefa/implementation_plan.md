# Rencana Implementasi: Panduan Praktis Pengujian Logika Program dengan Data Real di Laragon (MySQL + Laravel + Inertia)

Rencana ini merangkum seluruh lokasi petunjuk yang telah ada di repositori dan menyusun panduan langkah-demi-langkah terintegrasi (baik dokumen teknis markdown maupun modul interaktif pada UI) untuk menguji logika program sistem asrama menggunakan basis data riil MySQL dan backend Laravel di lingkungan Laragon.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> Keputusan dan preferensi pengguna yang telah dikonfirmasi pada tahap klarifikasi:
> - **Bentuk Petunjuk**: Rangkuman lokasi dokumen yang ada dipadukan dengan pembuatan panduan langkah praktis transisi dari simulasi ke data riil.
> - **Lingkungan Backend**: **Laragon lokal (Windows, MySQL, PHP 8.2+)** dengan arsitektur Laravel 11 + Inertia.js + React.
> - **Fokus Logika Program**: **Alur lengkap pendaftaran mahasiswa baru (Langkah 1 s.d. 6)** dan mekanisme **migrasi/bridging data dari tabel penampungan sementara (*staging*) ke tabel buku besar resmi (*master running tables*)**.

---

## 1. Overview & Core Concept

### A. Rangkuman Peta Lokasi Dokumen yang Ada Saat Ini
Sebelumnya, petunjuk teknis telah tersebar di beberapa dokumen spesifik. Berikut peta lokasi dokumen yang telah ada di dalam repositori:

1. **Panduan Instalasi & Eksekusi Server Lokal (Turnkey 1-Klik)**:
   - File: `LARAGON_SETUP.md` (dan `LARAGON_SETUP.en.md`)
   - Isi: Skrip `laragon-setup.bat`, konfigurasi file `.env`, pembuatan database otomatis, migrasi, dan *seeding* master tarif.
2. **Arsitektur Staging vs Master & Logika Bisnis Bridging**:
   - File: `docs/ARCHITECTURE.md` (serta `ASRAMA_UBT_SYSTEM_DOCUMENTATION.md` Bab 6 & Bab 8)
   - Isi: Skema database `request_pembayaran` (`operator_id = 0`) menuju `pembayaran` (`operator_id = Admin ID`), pencegahan *race-condition* plotting kamar, dan audit log.
3. **Matriks Pengujian 5 Skenario Database**:
   - File: `docs/scenario-mappings.md`
   - Isi: Tabel skenario pengujian data calon mahasiswa (KIP, Reguler, Cicilan Deposit, Transisi NIM dari nomor registrasi PMB).
4. **Strategi Penyimpanan Privat e-KYC (KTP & Selfie)**:
   - File: `docs/SECURE_UPLOAD_STRATEGY.md`
   - Isi: Kebijakan *private disk storage*, *signed URL* bertenggat waktu (TTL 15 menit), dan kepatuhan *versioning* (tanpa *overwrite*).
5. **Implementasi Kode Nyata (Backend Laravel Controller & Migration)**:
   - Controller Maba: `app/Http/Controllers/Maba/MabaDashboardController.php`
   - Controller Admin Keuangan & Promosi Master: `app/Http/Controllers/Admin/AdminAsramaController.php` (fungsi `verifyInvoice` & `promoteToMaster`)
   - Migrasi Database: `database/migrations/2026_01_01_000005_create_web_admin_bridging_tables.php`

### B. Solusi yang Akan Dibuat
1. **Penyusunan Berkas Panduan Praktis Baru**:
   - Membuat `docs/TESTING_DATA_REAL_LARAGON.md` (dan `docs/TESTING_DATA_REAL_LARAGON.en.md`) yang menguraikan prosedur langkah-demi-langkah pengujian logika pendaftaran dan bridging data ke MySQL Laragon secara langsung.
2. **Indeksasi Terpadu**:
   - Memperbarui `README.md` dan `README.en.md` dengan menambahkan bab khusus panduan testing data real di Laragon.
3. **Integrasi UI Interaktif (In-App Testing Guide)**:
   - Menambahkan tab panduan / panel interaktif "Panduan Testing Data Real Laragon" di dalam komponen arsitektur web aplikasi (dapat diakses langsung melalui tombol navigasi *Blueprint Laravel / DDL SQL* di header aplikasi), lengkap dengan tombol salin query SQL verifikasi data dan checklist alur uji.

---

## 2. User Experience & Visual Design

### Alur Pengujian Pengembang / Tim Penguji:
```
┌─────────────────────────────────────────────────────────────────────────────┐
│                   ALUR PENGUJIAN LOGIKA SISTEM DATA REAL                    │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. PERSIAPAN LINGKUNGAN LARAGON                                             │
│    • Buka Laragon -> Klik "Start All" (MySQL & Apache/Nginx aktif)          │
│    • Jalankan laragon-setup.bat (migrate --seed: tarif, skema, kamar)       │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 2. PENGISIAN DATA NYATA PENDAFTARAN MABA (FRONTEND & INERTIA CONTROLLER)   │
│    • Maba login dengan No. PMB atau NIK                                     │
│    • Mengisi biodata, pilih kamar, upload bukti transfer / simulasi VA      │
│    • Data tersimpan di TABEL STAGING:                                       │
│      - request_pembayaran (operator_id = 0, status_verifikasi = 0)         │
│      - request_pembayaran_detail                                            │
│      - request_transaksi (bukti transfer tersimpan)                         │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 3. VERIFIKASI KEBERADAAN DATA DI MYSQL (PHPMyAdmin / HeidiSQL)              │
│    • SELECT * FROM request_pembayaran WHERE status_verifikasi = 0;          │
│    • Memastikan tabel master (pembayaran) masih KOSONG / belum tercampur    │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 4. EKSEKUSI BRIDGING / PROMOSI KE MASTER (ADMIN KEUANGAN)                   │
│    • Buka Portal Admin Keuangan (/admin/dashboard)                          │
│    • Klik "Sahkan & Promosi ke Master" pada tagihan yang diajukan           │
│    • AdminAsramaController mengeksekusi method promoteToMaster()            │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 5. VALIDASI HASIL AKHIR PADA BUKU BESAR RESMI MYSQL                         │
│    • Tabel pembayaran terisi record resmi (operator_id = Admin ID)          │
│    • Kamar ter-update statusnya menjadi BOOKED / OCCUPIED                   │
│    • Audit trail mencatat waktu dan identitas admin pengesah                │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Visualisasi Panduan pada UI Web:
- Pada panel **Blueprint Laravel / DDL SQL**, ditambahkan tab navigasi baru: **"Panduan Data Real Laragon"**.
- Dilengkapi dengan *Step-by-Step Card* beraksen warna status (Slate, Emerald, Indigo), blok kode terminal yang dapat disalin dengan 1-klik, dan query SQL interaktif untuk memverifikasi kondisi tabel sebelum dan sesudah verifikasi admin.

---

## 3. Key Product Decisions & Trade-Offs

- **Penyediaan Panduan Mandiri di `docs/TESTING_DATA_REAL_LARAGON.md`**:
  - *Pendekatan Dipilih*: Membuat dokumen panduan mandiri (*dedicated guide*) alih-alih hanya menumpuknya di `README.md`.
  - *Alasan*: Pengujian logika sistem dengan data real melibatkan perintah terminal, konfigurasi database MySQL, query SQL verifikasi, dan skenario validasi yang panjang. Menyatukannya dalam satu berkas terpisah menjaga `README.md` tetap ringkas sekaligus memberikan instruksi mendalam bagi pengembang.
- **Penyertaan Panduan Langsung di UI Aplikasi**:
  - *Pendekatan Dipilih*: Memperkaya modal/panel arsitektur di antarmuka web dengan tab panduan interaktif.
  - *Alasan*: Memungkinkan staf asrama, auditor, dan penguji perangkat lunak menguji logika aplikasi tanpa harus selalu membuka editor teks untuk membaca berkas `.md`.
- **Fokus Utama pada Pemisahan Staging vs Master**:
  - *Pendekatan Dipilih*: Menegaskan validasi kolom `operator_id = 0` (mandiri oleh calon mahasiswa) dan transformasinya menjadi `operator_id = 1` (disahkan oleh petugas resmi) sebagai indikator keberhasilan logika program.
  - *Alasan*: Inilah inti integritas arsitektur buku besar keuangan asrama Universitas Bunda Thamrin sesuai regulasi JUKLAK-02 & JUKLAK-03.

---

## 4. Technical Architecture & Data Strategy

### Matriks Verifikasi Database (MySQL Laragon)

| Tahapan Uji | Tabel Target | Kondisi Record yang Diharapkan | Query SQL Pembuktian |
| :--- | :--- | :--- | :--- |
| **Tahap A: Pasca Pendaftaran Maba** | `request_pembayaran` | `status_verifikasi = 0`, `operator_id = 0`, `no_request = 'REQ-...'` | `SELECT no_request, total_bayar, status_pembayaran, operator_id FROM request_pembayaran ORDER BY id DESC LIMIT 1;` |
| **Tahap A (Penyewa)** | `penyewa` | `status = 0`, `nim = NULL` (jika PMB), data nama dan kontak valid | `SELECT id, namalengkap, noktp, nohp, status FROM penyewa ORDER BY id DESC LIMIT 1;` |
| **Tahap B: Buku Besar Master Sebelum Promosi** | `pembayaran` | Tidak boleh ada tagihan yang masuk sebelum disahkan admin | `SELECT COUNT(*) FROM pembayaran WHERE no_invoice = 'REQ-...';` *(Harus bernilai 0)* |
| **Tahap C: Pasca Promosi Admin** | `pembayaran` | Terbit nomor tagihan resmi `INV-...`, `operator_id = 1` (Admin), status `lunas` | `SELECT no_invoice, total_bayar, operator_id, created_at FROM pembayaran ORDER BY id DESC LIMIT 1;` |
| **Tahap C (Kamar)** | `kamar` / `rooms` | `status = 'OCCUPIED'` / penghuni terisi | `SELECT kode_kamar, status FROM kamar WHERE id = :kamar_id;` |

### Rincian Rencana Berkas yang Akan Dibuat / Diperbarui:
1. **`docs/TESTING_DATA_REAL_LARAGON.md`** *(Dokumen Utama Baru)*:
   - Panduan instalasi dan persiapan Laragon.
   - Langkah simulasi input data real via UI / endpoint Inertia.
   - Skrip SQL verifikasi staging dan promosi master.
   - Troubleshooting jika database MySQL tidak merespons atau migrasi gagal.
2. **`docs/TESTING_DATA_REAL_LARAGON.en.md`** *(Versi Bahasa Inggris)*:
   - Terjemahan lengkap standar bilingual proyek.
3. **`README.md` & `README.en.md`**:
   - Pembaruan tabel indeks dokumentasi sistem untuk menyertakan dokumen panduan baru.
4. **`src/components/architecture/LaravelBlueprint.tsx`** & **`src/components/Header.tsx`**:
   - Integrasi tab / modal panduan testing data real di antarmuka web dengan sintaks terminal dan *interactive SQL copy buttons*.
