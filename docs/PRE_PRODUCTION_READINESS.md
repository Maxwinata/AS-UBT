# Panduan Pra-Implementasi Produksi: Sanitasi Data, Master Kamar Riil, & SOP Rekonsiliasi Transfer Bank Manual

> **Pilihan Bahasa / Language:** 🇮🇩 **Bahasa Indonesia (Utama)** | [🇬🇧 English Version](PRE_PRODUCTION_READINESS.en.md)
>
> **Dokumen Terkait:**
> - [Panduan Pengujian Laragon Data Real](TESTING_DATA_REAL_LARAGON.md)
> - [Arsitektur Staging & Master Ledger](ARCHITECTURE.md)
> - [Keamanan e-KYC Private Storage](SECURE_UPLOAD_STRATEGY.md)

Panduan ini merupakan standar operasional prosedur (SOP) dan pedoman teknis **Pra-Implementasi Produksi (*Pre-Production Readiness*)** untuk Portal SI-GABUNG 54 Asrama Universitas Bunda Thamrin (UBT). Dokumen ini memandu tim pengembang (*software engineers*), administrator sistem (*DevOps*), kasir/staf administrasi keuangan, dan pengelola asrama dalam mempersiapkan lingkungan *production* sebelum pendaftaran resmi dibuka untuk mahasiswa baru.

---

## 1. Ikhtisar & Arsitektur Pra-Produksi

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                 ARSITEKTUR PRA-IMPLEMENTASI PRODUKSI ASRAMA UBT             │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
     ┌─────────────────────────────────┼─────────────────────────────────┐
     ▼                                 ▼                                 ▼
┌──────────────────────────┐ ┌──────────────────────────┐ ┌──────────────────────────┐
│ 1. DATA SANITIZATION     │ │ 2. REAL ROOM INVENTORY   │ │ 3. SOP KASIR & KODE UNIK │
│                          │ │                          │ │                          │
│ • Bersihkan data staging │ │ • Gedung Roemah 54 Putra │ │ • Generator Kode 3 Digit │
│ • Hapus berkas mock e-KYC│ │ • Gedung Roemah 54 Putri │ │ • Match Mutasi Mandiri   │
│ • ProductionSeeder murni │ │ • 64 Kamar / 128 Ranjang │ │ • Timeout 24 Jam Reservasi│
│ • Akun staf resmi argon2 │ │ • RealRoomSeeder.php     │ │ • Approval Kasir & Audit │
└────────────┬─────────────┘ └────────────┬─────────────┘ └────────────┬─────────────┘
             │                            │                            │
             └────────────────────────────┼────────────────────────────┘
                                          ▼
                      ┌──────────────────────────────────────┐
                      │ BASIS DATA PRODUKSI (asrama_ubt_db)  │
                      │                                      │
                      │ • rooms: Master Kamar Riil (100% Ok) │
                      │ • users: Akun Staf Resmi Terisolasi  │
                      │ • request_pembayaran: Staging Bersih │
                      │ • pembayaran/transaksi: Buku Besar   │
                      └──────────────────────────────────────┘
```

---

## 2. Protokol Pembersihan Data Dummy (*Data Sanitization Protocol*)

Sebelum meluncurkan sistem ke server produksi, basis data operasional asrama (`asrama_ubt_db`) harus dibersihkan secara tuntas dari data simulasi testing (seperti data akun *Maximilian*, *Jenny*, dummy invoice, dan berkas e-KYC mock) tanpa merusak skema tabel maupun migrasi database.

### 2.1 Skrip Pembersihan Tabel Transaksi & Staging MySQL
Eksekusi perintah SQL berikut pada database operasional produksi `asrama_ubt_db`:

```sql
-- NONAKTIFKAN SEMENTARA PEMERIKSAAN FOREIGN KEY
SET FOREIGN_KEY_CHECKS = 0;

-- 1. Bersihkan tabel transaksi pendaftaran & staging pembayaran
TRUNCATE TABLE `request_pembayaran`;
TRUNCATE TABLE `pembayaran`;
TRUNCATE TABLE `transaksi`;
TRUNCATE TABLE `billing_invoices`;

-- 2. Bersihkan kontrak digital, ratifikasi, dan tiket asrama
TRUNCATE TABLE `kontrak_digital`;
TRUNCATE TABLE `contracts`;
TRUNCATE TABLE `e_tickets`;
TRUNCATE TABLE `tickets`;
TRUNCATE TABLE `delinquencies`;

-- 3. Bersihkan profil pendaftar dummy mahasiswa
TRUNCATE TABLE `maba_profiles`;

-- 4. Bersihkan akun pendaftar non-admin (hanya sisakan jika sudah ada admin)
DELETE FROM `users` WHERE `role` NOT IN ('admin', 'superadmin');

-- 5. Bersihkan jejak audit pengujian staging
TRUNCATE TABLE `audit_trails`;

-- AKTIFKAN KEMBALI PEMERIKSAAN FOREIGN KEY
SET FOREIGN_KEY_CHECKS = 1;
```

### 2.2 Pembersihan Berkas Dummy e-KYC (*Storage Sanitization*)
Sesuai arsitektur keamanan e-KYC, berkas KTP dan swafoto tersimpan pada direktori *private storage disk* (`storage/app/private_kyc/`). Bersihkan seluruh berkas mock pengujian di server:

```bash
# Bersihkan file mock di private storage (pertahankan direktori dan .gitignore)
rm -rf storage/app/private_kyc/*
touch storage/app/private_kyc/.gitignore

# Verifikasi izin akses direktori privat (hanya dapat dibaca oleh www-data)
chmod -R 750 storage/app/private_kyc
chown -R www-data:www-data storage/app/private_kyc
```

> 🔒 **PENGINGAT ARSITEKTUR e-KYC (AUDIT TRAIL & LIFECYCLE):**
> 1. **Versioning over Overwriting**: Saat sistem produksi aktif, jangan pernah menimpa (*overwrite*) berkas KYC yang diunggah koreksinya oleh mahasiswa. Gunakan penamaan berbasis UUID atau timestamp (misal: `ktp_260108001_v2_1713500.jpg`) agar jejak audit riwayat verifikasi admin tetap valid.
> 2. **Private Buckets & Signed URLs**: Berkas KYC wajib berada di disk privat. Akses pratinjau staf kasir/admin digenerate via *Temporary Signed URL* (maksimal masa berlaku 15 menit).
> 3. **Garbage Collection**: Berkas draf e-KYC mahasiswa yang membatalkan pendaftaran dibersihkan otomatis setelah 30–60 hari menggunakan scheduler `php artisan kyc:prune-orphans --days=60`.

---

## 3. Inisialisasi Master Data Kamar Fisik Riil Asrama UBT

Master data kamar harus mencerminkan denah fisik riil Asrama UBT (Gedung Roemah 54 Putra dan Roemah 54 Putri).

### 3.1 Spesifikasi Gedung & Alokasi Ranjang

| Gedung | Lantai | Nomor Kamar | Jml Kamar | Kapasitas | Tipe Fasilitas | Tarif Sewa / Bulan |
| :--- | :---: | :---: | :---: | :---: | :--- | :--- |
| **Roemah 54 Putra** | 1 | `PA-101` s.d. `PA-108` | 8 | 16 (Bed A & B) | AC 1PK, Kamar Mandi Luar, Meja, Lemari, Wi-Fi | Rp 500.000 / mhs |
| **Roemah 54 Putra** | 2 | `PA-201` s.d. `PA-212` | 12 | 24 (Bed A & B) | AC 1PK, Kamar Mandi Dalam, Meja Ergonomis, Lemari | Rp 600.000 / mhs |
| **Roemah 54 Putra** | 3 | `PA-301` s.d. `PA-312` | 12 | 24 (Bed A & B) | Non-AC (Kipas Angin), Kamar Mandi Luar, Meja | Rp 400.000 / mhs |
| **Roemah 54 Putri** | 1 | `PI-101` s.d. `PI-108` | 8 | 16 (Bed A & B) | AC 1PK, Kamar Mandi Luar, Meja, Lemari, Wi-Fi | Rp 500.000 / mhs |
| **Roemah 54 Putri** | 2 | `PI-201` s.d. `PI-212` | 12 | 24 (Bed A & B) | AC 1.5PK, KM Dalam + Water Heater, Springbed | Rp 650.000 / mhs |
| **Roemah 54 Putri** | 3 | `PI-301` s.d. `PI-312` | 12 | 24 (Bed A & B) | Non-AC (Kipas Angin), Kamar Mandi Luar, Meja | Rp 400.000 / mhs |
| **TOTAL** | - | - | **64 Kamar** | **128 Ranjang** | - | Status Awal: `AVAILABLE` |

### 3.2 Menjalankan Seeder Produksi Resmi
Jalankan seeder khusus produksi yang menginjeksi master tarif, kamar riil, dan akun staf resmi:

```bash
php artisan db:seed --class=ProductionSeeder --force
```

Output yang diharapkan:
- Mengupdate atau membuat 3 akun staf resmi (`keuangan@ubt.ac.id`, `asrama@ubt.ac.id`, `superadmin@ubt.ac.id`).
- Menginjeksi 8 master tarif resmi SK Rektor UBT (`TariffSeeder`).
- Menginjeksi 64 master kamar fisik riil dengan `terisi = 0` dan status `AVAILABLE` (`RealRoomSeeder`).
- **Nol akun mahasiswa simulasi**.

### 3.3 Verifikasi Master Kamar di MySQL:
```sql
SELECT gedung, lantai, count(*) as jumlah_kamar, sum(kapasitas) as total_ranjang, sum(terisi) as total_terisi
FROM rooms
GROUP BY gedung, lantai;
```
Pastikan `total_terisi = 0` dan `jumlah_kamar` berjumlah total 64.

---

## 4. SOP Pembayaran Transfer Bank Manual & Verifikasi Kasir

Sesuai arahan operasional rilis awal produksi, pembayaran pendaftaran asrama **tetap menggunakan mekanisme transfer bank manual dengan kode unik 3 digit acak dan verifikasi kasir/admin keuangan**, bukan payment gateway otomatis pihak ketiga.

### 4.1 Rekening Bank Resmi Institusi
Seluruh transaksi pembayaran asrama transfer manual hanya sah apabila ditransfer ke rekening resmi:
- **Nama Bank**: **Bank Mandiri** (Kanal Transfer Manual Utama)
- **Nomor Rekening**: `1050508988809`
- **Atas Nama**: **Asrama Universitas Bunda Thamrin**
- **Kode Bank untuk Transfer Antar-Bank**: `008`

> **Catatan Kanal Virtual Account**:
> Untuk opsi pembayaran otomatis berbasis Virtual Account (VA), institusi menggunakan integrasi **Bank BNI** (Kode Bank: `009`, nomor VA sandbox `9881 2345 6789 0123`). Kanal VA ini dikhususkan untuk otomasi Host-to-Host dan pengujian sandbox.

### 4.2 Logika Generator Kode Unik 3 Digit Acak
Untuk membedakan transaksi antar mahasiswa yang memilih skema sewa dan nominal yang sama persis:
1. Sistem mengambil nominal tagihan pokok (misal: Sewa Kamar Standar 6 Bulan = `Rp 3.000.000` + Deposit `Rp 1.000.000` + Admin `Rp 100.000` = Subtotal `Rp 4.100.000`).
2. Generator menghasilkan angka acak 3 digit antara `001` hingga `999` (contoh: `247`).
3. Sistem memvalidasi bahwa tidak ada invoice berstatus `UNPAID` lain yang memiliki total bayar `Rp 4.100.247` pada hari berjalan.
4. Total nominal yang wajib ditransfer mahasiswa ditampilkan jelas: **`Rp 4.100.247`**.

### 4.3 Alur Kerja Operasional Staf Kasir / Admin Keuangan
Staf Kasir melakukan rekonsiliasi manual setiap hari kerja:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    ALUR REKONSILIASI MUTASI KASIR UBT                       │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
                 ┌───────────────────────────────────────────┐
                 │ 1. Login ke Akun keuangan@ubt.ac.id       │
                 │    Buka Menu "Verifikasi Bukti Transfer"  │
                 └─────────────────────┬─────────────────────┘
                                       │
                                       ▼
                 ┌───────────────────────────────────────────┐
                 │ 2. Buka Kopra / Livin' by Mandiri         │
                 │    Unduh Mutasi Rekening Giro Hari Ini    │
                 └─────────────────────┬─────────────────────┘
                                       │
                                       ▼
                 ┌───────────────────────────────────────────┐
                 │ 3. Pencocokan Cepat via 3 Digit Terakhir  │
                 │    Cari Nominal Mutasi (misal: 4.100.247) │
                 └─────────────────────┬─────────────────────┘
                                       │
                    ┌──────────────────┴──────────────────┐
                    │                                     │
           [NOMINAL COCOK]                       [NOMINAL TIDAK COCOK]
                    ▼                                     ▼
     ┌─────────────────────────────┐       ┌─────────────────────────────┐
     │ 4. Klik "APPROVE & MIGRATE" │       │ 5. Periksa Status Selisih   │
     │  • operator_id: [ID_KASIR]  │       │  • Kurang: Minta kekurangan │
     │  • Staging -> Buku Besar    │       │  • Lebih: Catat ke deposit  │
     │  • Status Kamar: OCCUPIED   │       │  • Buram: Minta unggah ulang│
     │  • Maba lanjut ke Kontrak   │       └─────────────────────────────┘
     └─────────────────────────────┘
```

### 4.4 Penanganan Kasus Selisih Nominal Transfer
Apabila calon mahasiswa melakukan kesalahan saat melakukan transfer bank:

| Kasus Kendala | Gejala di Mutasi Koran | Tindakan Operasional Kasir |
| :--- | :--- | :--- |
| **Kasus A: Mentransfer Nominal Bulat** | Transfer `Rp 4.100.000` (lupa menambahkan kode unik `247`). | Kasir mencocokkan nama pengirim di mutasi bank dengan nama pendaftar. Jika identitas valid, kasir menginput penyesuaian catatan (*waive / adjust unique code*) dan melakukan approval manual. |
| **Kasus B: Kurang Bayar** | Transfer kurang dari total invoice (misal hanya Rp 3.000.000). | Kasir mengubah status request menjadi `PARTIALLY_PAID`, sistem otomatis mengirimkan tagihan kekurangan via WhatsApp/Email pendaftar. Kontrak digital belum dapat diakses sebelum lunas. |
| **Kasus C: Lebih Bayar** | Mahasiswa salah ketik nominal lebih besar. | Kasir memverifikasi kelebihan dana dan mencatatkannya ke saldo kredit deposit mahasiswa di tabel `delinquencies` / buku besar deposit. |
| **Kasus D: Bukti Bayar Buram / Palsu** | Bukti editan atau tidak ada mutasi masuk di rekening koran Bank Mandiri. | Kasir menekan tombol `REJECT`, mencantumkan catatan: *"Mutasi bank tidak ditemukan pada tanggal terkait. Silakan hubungi kasir di 0812-3456-7001 atau unggah bukti sah"* |

### 4.5 Mekanisme Pelepasan Kamar Otomatis (*Room Hold Timeout 24 Jam*)
Untuk mencegah penahanan (*holding*) kamar oleh pendaftar yang tidak melanjutkan pembayaran:
1. Saat mahasiswa memilih kamar di Langkah 2, sistem menandai ranjang sebagai `HELD` selama $1 \times 24$ jam.
2. Scheduler Laravel mengeksekusi pemeriksaan setiap jam:
   ```bash
   php artisan rooms:release-expired-holds
   ```
3. Jika waktu 24 jam terlampaui dan mahasiswa belum mengunggah bukti transfer, sistem membatalkan invoice dan mengembalikan status kamar menjadi `AVAILABLE` agar dapat dipilih oleh mahasiswa lain.

---

## 5. Checklist Kesiapan Hari Peluncuran (*Go-Live Day Checklist*)

Lakukan pemeriksaan checklist berurutan pada hari peluncuran resmi sebelum gerbang pendaftaran dibuka untuk publik:

### Fase 1: Validasi Server & Keamanan (H-1 Peluncuran)
- [ ] **Domain & SSL**: Domain `asrama.ubt.ac.id` telah mengarah ke IP server publik dan sertifikat Let's Encrypt aktif (*A-Grade SSL*).
- [ ] **Variabel Lingkungan `.env`**:
  - `APP_ENV=production`
  - `APP_DEBUG=false`
  - `APP_URL=https://asrama.ubt.ac.id`
  - `DB_PASSWORD` menggunakan kata sandi kuat acak.
- [ ] **Isolasi Password Database SIMABA**:
  - Kata sandi database SQL SIMABA server riil (`12345678Ab&`) telah diinput secara privat di file `.env` server.
  - Dipastikan **TIDAK PERNAH** terdorong (*committed*) ke GitHub publik.
  - File `.env.example` di repositori dipastikan bersih (`DB_SIMABA_PASSWORD=`).
- [ ] **Proteksi Direktori Privat**: Blok akses publik ke `storage/app/private_kyc` pada konfigurasi Nginx/Apache.

### Fase 2: Inisialisasi Database & Kompilasi Aset (H-4 Jam)
- [ ] Jalankan migrasi basis data murni:
  ```bash
  php artisan migrate --force
  ```
- [ ] Jalankan pembersihan data dummy sesuai Bagian 2 panduan ini.
- [ ] Jalankan seeder produksi:
  ```bash
  php artisan db:seed --class=ProductionSeeder --force
  ```
- [ ] Jalankan kompilasi cache produksi:
  ```bash
  php artisan config:cache
  php artisan route:cache
  php artisan view:cache
  composer install --optimize-autoloader --no-dev
  npm run build
  ```

### Fase 3: Simulasi Transaksi Kasir (*End-to-End Dry Run*) (H-2 Jam)
- [ ] Login menggunakan akun staf kasir `keuangan@ubt.ac.id` (password default dari `INITIAL_ADMIN_PASSWORD`).
- [ ] Ubah kata sandi staf kasir segera setelah login pertama kali.
- [ ] Uji coba login pendaftar maba menggunakan Nomor Pendaftaran SIMABA asli (misal: `260108001` - GRACE MARLIN TELAUMBANUA).
- [ ] Pastikan alur reservasi kamar menghasilkan tagihan dengan kode unik 3 digit yang presisi.
- [ ] Batalkan transaksi uji coba dry run menggunakan fitur pembatalan kasir sebelum pukul 08:00 WIB pembukaan publik.

### Fase 4: Pengawasan Operasional (Hari-H Peluncuran)
- [ ] Pastikan Supervisor Worker berjalan untuk antrean WhatsApp OTP:
  ```bash
  supervisorctl status asrama-queue-worker:*
  ```
- [ ] Monitor log sistem secara berkala:
  ```bash
  tail -f /var/www/asrama-ubt/storage/logs/laravel.log
  ```
- [ ] Staf kasir bersiaga pada dashboard verifikasi pembayaran dengan mutasi rekening Bank Mandiri (Kopra / Livin' by Mandiri) terbuka di layar kedua.

---

## 6. Kontak Darurat Tim Operasional

| Peran | Penanggung Jawab | Kanal Komunikasi | Kontak |
| :--- | :--- | :--- | :--- |
| **Lead DevOps & IT** | Tim Administrator IT UBT | Email / Telegram Internal | it-support@ubt.ac.id |
| **Kasir & Keuangan** | Staf Administrasi Keuangan | WhatsApp Meja Kasir | 0812-3456-7001 |
| **Pengelola Asrama** | Kepala Asrama Roemah 54 | Posko Asrama Roemah 54 | 0812-3456-7002 |
| **Pusat Informasi PMB** | Helpdesk SIMABA UBT | Call Center Kampus | 0812-3456-0000 |
