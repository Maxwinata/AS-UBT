# Panduan Praktis: Pengujian Logika Program dengan Data Real di Laragon (MySQL + Dual Database SIMABA + Laravel 11 + Inertia.js)

> **Pilihan Bahasa / Language:** 🇮🇩 **Bahasa Indonesia (Utama)** | [🇬🇧 English Version](TESTING_DATA_REAL_LARAGON.en.md)

Panduan ini disusun khusus untuk pengembang, penguji sistem (*QA*), dan staf pengelola Asrama Universitas Bunda Thamrin (UBT) guna **berpindah dari web simulasi prototipe (*client-side state*) menuju pengujian logika program secara nyata menggunakan basis data MySQL riil dan backend Laravel di lingkungan Laragon lokal**.

Fokus utama pengujian ini mencakup:
1. **Konfigurasi Dual Database**: Koneksi `mysql` (`asrama_ubt_db`) dan `simaba` (`u540633926_simaba`).
2. **Fitur Antarmuka PMB**: Live Search Auto-Suggest nama mahasiswa, UX tanggal lahir `DD/MM/YYYY`, dan deteksi dini penerbitan NIM resmi di SIAKAD.
3. **Integritas Alur Pendaftaran**: Dari pengisian mandiri mahasiswa (Langkah 1 s.d. 6) hingga **pemisahan tabel penampungan sementara (*staging*) menuju buku besar resmi (*running master tables*)** oleh Admin Keuangan.

---

## 📌 Peta Lokasi Dokumentasi Sistem Terkait

Sebelum memulai pengujian, berikut referensi dokumen pendukung di dalam repositori:

| Dokumen | Lokasi | Manfaat Pengujian |
| :--- | :--- | :--- |
| **Instalasi Laragon 1-Klik** | [`LARAGON_SETUP.md`](../LARAGON_SETUP.md) | Panduan instalasi cepat stack PHP 8.2+, MySQL, dan script `laragon-setup.bat`. |
| **Arsitektur Staging & Master** | [`docs/ARCHITECTURE.md`](ARCHITECTURE.md) | Penjelasan logika pemisahan `operator_id = 0` (mandiri) dan `operator_id = 1` (admin). |
| **Matriks 5 Skenario Uji** | [`docs/scenario-mappings.md`](scenario-mappings.md) | Skenario uji untuk mahasiswa reguler, penerima KIP, cicilan deposit, dan transisi NIM. |
| **Keamanan Berkas e-KYC** | [`docs/SECURE_UPLOAD_STRATEGY.md`](SECURE_UPLOAD_STRATEGY.md) | Panduan pengujian *storage private disk* dan *signed URL* berkas KTP & Selfie. |
| **Spesifikasi Lengkap (PRD/SAS)**| [`ASRAMA_UBT_SYSTEM_DOCUMENTATION.md`](../ASRAMA_UBT_SYSTEM_DOCUMENTATION.md) | Definisi aturan bisnis JUKLAK-02, JUKLAK-03, dan lembar ratifikasi F-22. |

---

## 1. Konfigurasi Dual Database Laragon

Sistem Portal SI-GABUNG 54 Asrama UBT menggunakan dua koneksi basis data MySQL terpisah yang berjalan berdampingan pada port `3306`:

| Parameter | Database 1: Operasional Asrama (`mysql`) | Database 2: PMB Calon Mahasiswa (`simaba`) |
| :--- | :--- | :--- |
| **Nama Database** | `asrama_ubt_db` | `u540633926_simaba` |
| **Host & Port** | `127.0.0.1:3306` | `127.0.0.1:3306` |
| **Username** | `root` | `u540633926_simaba` (atau `root`) |
| **Password** | *(kosong secara default di Laragon)* | `12345678Ab&` |
| **Peran Sistem** | Master kamar, billing invoice, staging bukti transfer, e-KYC private storage, kontrak OTP, e-Ticket BASTK | Pembacaan data asli calon mahasiswa baru (tabel `pendaftaranmahasiswa` & `programstudi`) |
| **Model Eloquent** | `App\Models\User`, `App\Models\BillingInvoice`, `App\Models\Room`, dll. | `App\Models\SimabaPendaftaran` (`protected $connection = 'simaba';`) |

Konfigurasi koneksi ini tersimpan rapi di:
- `config/database.php` (koneksi `'simaba'`)
- `.env.example` & `.env`:
  ```ini
  # KONEKSI DATABASE UTAMA ASRAMA
  DB_CONNECTION=mysql
  DB_HOST=127.0.0.1
  DB_PORT=3306
  DB_DATABASE=asrama_ubt_db
  DB_USERNAME=root
  DB_PASSWORD=

  # KONEKSI DATABASE SIMABA (PMB - DUAL DATABASE)
  DB_SIMABA_CONNECTION=mysql
  DB_SIMABA_HOST=127.0.0.1
  DB_SIMABA_PORT=3306
  DB_SIMABA_DATABASE=u540633926_simaba
  DB_SIMABA_USERNAME=u540633926_simaba
  DB_SIMABA_PASSWORD=12345678Ab&
  ```

---

## 2. Inisialisasi Otomatis (1-Klik via Laragon)

Cukup jalankan file `laragon-setup.bat` (atau `bash laragon-setup.sh`):
1. Skrip otomatis membuat kedua database:
   ```sql
   CREATE DATABASE IF NOT EXISTS asrama_ubt_db;
   CREATE DATABASE IF NOT EXISTS u540633926_simaba;
   ```
2. Skrip otomatis membuat user `u540633926_simaba` dengan kata sandi `12345678Ab&` dan memberikan hak akses:
   ```sql
   CREATE USER IF NOT EXISTS 'u540633926_simaba'@'localhost' IDENTIFIED BY '12345678Ab&';
   CREATE USER IF NOT EXISTS 'u540633926_simaba'@'127.0.0.1' IDENTIFIED BY '12345678Ab&';
   GRANT ALL PRIVILEGES ON u540633926_simaba.* TO 'u540633926_simaba'@'localhost';
   GRANT ALL PRIVILEGES ON u540633926_simaba.* TO 'u540633926_simaba'@'127.0.0.1';
   FLUSH PRIVILEGES;
   ```
3. Menjalankan migrasi dan seeder:
   ```bash
   php artisan migrate --seed
   ```
   *Catatan: Seeder `SimabaDatabaseSeeder` menyuntikkan data tabel `pendaftaranmahasiswa` dan `programstudi` langsung ke koneksi `simaba`.*

---

## 3. Matriks Data Pengujian Mahasiswa Baru Nyata (Data Dump SIMABA)

Gunakan akun calon mahasiswa baru berikut untuk menguji seluruh alur fungsional:

| No | Nama Lengkap Mahasiswa | No. Pendaftaran | Tanggal Lahir (UX: `DD/MM/YYYY`) | Program Studi | Jalur PMB | Skenario Pengujian Utama |
|:---|:---|:---|:---|:---|:---|:---|
| **1** | **GRACE MARLIN TELAUMBANUA** | `260108001` | `12/02/2008` | S1 Ilmu Keperawatan | **KIP Kuliah** (Subsidi 100%) | Uji Maba KIP: Tagihan otomatis Rp 0, validasi berkas subsidi KIP, penempatan kamar subsidi |
| **2** | **Jenny Agustina Shellyana** | `250830001` | `29/08/2006` | D III Keperawatan | **Non-KIP / Reguler** | Uji Maba Reguler: Tagihan Sewa (Rp 500rb) + Admin (Rp 100rb) + Deposit (Rp 500rb) = Rp 1.100.xxx dengan kode unik 3 digit |
| **3** | **MAZA ADITIYA** | `250830002` | `19/06/2006` | S1 Kesehatan Masyarakat | **KIP Kuliah** | Uji pencarian nama "Maza" -> live suggest -> verifikasi pendaftaran KIP |
| **4** | **Alvin Octavianus Hasiholan** | `260727002` | `07/08/2008` | S1 Hukum | **Non-KIP** | **DETEKSI DINI NIM RESMI**: NIM `260801004` terdeteksi sudah terbit di SIAKAD -> Pop-up transisi akun SSO |
| **5** | **Alfonso Vincent Husly** | `260704001` | `16/05/2008` | S1 Informatika | **Non-KIP** | Uji pencarian nama "Alfonso" / "Vincent" -> registrasi kamar & billing |
| **6** | **Rizka mutiara** | `260421001` | `07/02/2008` | S1 Ilmu Keperawatan | **Non-KIP** | Uji pencarian nama "Rizka" -> validasi tanggal lahir 07/02/2008 |
| **7** | **Azzahra Safa Musakinah** | `250830003` | `06/09/2007` | S1 Ilmu Keperawatan | **KIP Kuliah** | Uji jalur KIP dengan alamat Medan |
| **8** | **Maximilian Wimin Winata** | `PMB2026-08942` | `12/04/2007` | S1 Informatika | **Non-KIP** | Uji kompatibilitas format nomor registrasi alphanumeric `PMB...` |

---

## 4. Panduan Uji Fitur Interaktif pada Antarmuka (UX)

### A. Fitur Live Search Auto-Suggest Nama Calon Mahasiswa
1. Di halaman login, klik tombol **"Pendaftaran Asrama"** atau tab PMB.
2. Pada kolom input **"Nomor Pendaftaran PMB / Cari Nama Lengkap"**, ketik minimal 2 karakter dari nama calon mahasiswa (contoh: **`Grace`**, **`Jenny`**, **`Maza`**, atau **`Alvin`**).
3. **Hasil yang Diharapkan**:
   - Menu saran interaktif (*live dropdown*) langsung muncul di bawah kolom input.
   - Kartu saran menampilkan: Nama lengkap tebal (*bold*), lencana nomor pendaftaran, program studi resmi, dan tombol aksi **`[PILIH]`**.
4. Klik tombol **`[PILIH]`**:
   - Nomor pendaftaran dan tanggal lahir terformat otomatis terisi ke form input.
   - Dropdown saran tertutup halus dan muncul kartu hijau konfirmasi identitas mahasiswa terverifikasi.

### B. Format Tanggal Lahir UX `DD/MM/YYYY`
1. Input tanggal lahir menggunakan format ramah pengguna Indonesia: **Hari / Bulan / Tahun** (`DD/MM/YYYY`).
2. Kolom dilengkapi *input mask* otomatis: mengetik `12022008` otomatis tertata menjadi `12/02/2008`.
3. Sistem secara otomatis mengonversi `12/02/2008` menjadi format ISO `2008-02-12` untuk query SQL backend SIMABA.

### C. Fitur Deteksi Dini Penerbitan NIM Resmi (Early Detection)
1. Pilih calon mahasiswa **Alvin Octavianus Hasiholan Hutasoit** (`260727002` / `07/08/2008`).
2. Klik **"Masuk Portal Pendaftaran"**.
3. **Hasil yang Diharapkan**:
   - Sistem di latar belakang mengecek ke staging/API SIAKAD dan mendeteksi **NIM Resmi: `260801004`**.
   - Muncul dialog modal **"Pemberitahuan Deteksi Dini: NIM Resmi Anda Telah Terbit di SIAKAD"**.
   - Pengguna dapat memilih untuk **Beralih ke Login SSO Mahasiswa** atau **Lanjutkan Masuk dengan Identitas Resmi**.

---

## 5. Pengujian Alur Transaksi & Promosi Staging ke Master di MySQL

### A. Input Pendaftaran Mandiri Mahasiswa Baru
1. Masuk menggunakan nomor registrasi pendaftar (misal: `260108001` atau `250830001`).
2. **Langkah 1 (e-KYC)**: Unggah KTP dan foto selfie biometrik (tersimpan di `storage/app/private_kyc`).
3. **Langkah 2 (Kamar)**: Pilih lantai dan nomor ranjang kamar.
4. **Langkah 3 (Pembayaran)**: Pilih skema sewa dan dapatkan **Kode Unik 3 Digit**. Unggah bukti transfer bank, lalu klik **Kirim Konfirmasi Pembayaran**.

### B. Verifikasi Data Staging di phpMyAdmin / HeidiSQL
Buka phpMyAdmin (`http://localhost/phpmyadmin`) atau HeidiSQL pada database `asrama_ubt_db`:
```sql
-- 1. Verifikasi Data Permintaan Masuk ke TABEL STAGING (Bukan Master)
SELECT 
    id, 
    no_request, 
    penyewa_id, 
    total_bayar, 
    status_pembayaran, 
    status_verifikasi, 
    operator_id 
FROM request_pembayaran 
ORDER BY id DESC LIMIT 1;
```
**Indikator Keberhasilan Tahap Staging:**
- `no_request` memiliki format `REQ-YYYYMM-XXXX`.
- **`operator_id` bernilai `0`**: Membuktikan bahwa transaksi ini dibuat secara mandiri oleh calon mahasiswa baru (*self-service*) dan **belum masuk ke buku besar resmi**.
- `status_verifikasi` bernilai `0` (Menunggu verifikasi admin keuangan).
- Periksa tabel master `pembayaran`:
  ```sql
  SELECT * FROM pembayaran WHERE no_request = (SELECT no_request FROM request_pembayaran ORDER BY id DESC LIMIT 1);
  -- Hasil: 0 baris (Sesuai SOP Keuangan Asrama)
  ```

### C. Pengesahan & Promosi ke Master oleh Admin Keuangan
1. Masuk ke Portal Admin Keuangan di `http://127.0.0.1:8000/admin/dashboard`.
2. Pada tab **Verifikasi Pembayaran Masuk (Staging Requests)**, temukan baris permintaan yang diajukan.
3. Periksa kecocokan bukti bayar, nominal total, dan 3-digit kode unik.
4. Klik tombol **"Sahkan & Promosi ke Master"**.
5. Sistem mengeksekusi metode `promoteToMaster()` di `AdminAsramaController.php`:
   - Menerbitkan Nomor Invoice Resmi (`INV-YYYYMM-XXXX`).
   - Memindahkan rincian biaya ke `pembayaran_detail`.
   - Mencatat arus kas masuk ke tabel `transaksi`.
   - Mengubah status master `penyewa` menjadi aktif dan mengunci kamar menjadi `OCCUPIED`.
   - Menetapkan `operator_id` menjadi ID staf admin yang sedang login (misal: `1`).

### D. Pembuktian Akhir Integritas Buku Besar Master
Jalankan query audit berikut di MySQL:
```sql
-- 1. Bukti data resmi telah masuk ke BUKU BESAR RESMI
SELECT id, no_invoice, no_request, total_bayar, operator_id, created_at 
FROM pembayaran ORDER BY id DESC LIMIT 1;

-- 2. Bukti mutasi kas asrama resmi tercatat
SELECT id, no_transaksi, kode_transaksi, jumlah_bayar, operator_id 
FROM transaksi ORDER BY id DESC LIMIT 1;

-- 3. Bukti status kamar terkunci secara riil
SELECT kode_kamar, status, nama_penghuni 
FROM kamar WHERE id = (SELECT kamar_id FROM request_pembayaran ORDER BY id DESC LIMIT 1);
```
**Hasil yang Diharapkan:**
- Kolom `operator_id` pada tabel `pembayaran` dan `transaksi` bernilai $\ge 1$ (ID Staf Keuangan).
- Terdapat nomor invoice resmi `INV-...` yang tersambung dengan nomor asal `REQ-...`.
- Status kamar berubah dari `AVAILABLE` menjadi `OCCUPIED`.
- Mahasiswa baru saat membuka kembali dashboard-nya otomatis terbuka ke **Langkah 4 (Tanda Tangan Kontrak Digital F-19 & F-02 via OTP WhatsApp)**.

---

## 6. Pengujian Langsung via Laravel Artisan & Tinker

Buka terminal Laragon di folder proyek (`C:\laragon\www\asrama-ubt`):

### 1. Memeriksa Koneksi Database SIMABA via Tinker
```bash
php artisan tinker
```
Jalankan kode PHP berikut di prompt Tinker:
```php
// Test autentikasi model SimabaPendaftaran
$student = \App\Models\SimabaPendaftaran::authenticate('260108001', '12/02/2008');
echo $student->nama_mahasiswa . " | Prodi: " . $student->nama_prodi;
// Output: GRACE MARLIN TELAUMBANUA | Prodi: S1 Ilmu Keperawatan

// Test pencarian nama
$results = \App\Models\SimabaPendaftaran::searchByNameOrReg('Alvin')->get();
foreach ($results as $r) { echo $r->nomor_pendaftaran . ' - ' . $r->nama_mahasiswa . PHP_EOL; }
// Output: 260727002 - Alvin Octavianus Hasiholan Hutasoit
```

### 2. Menjalankan Ulang Seeder SIMABA Secara Spesifik
```bash
php artisan db:seed --class=SimabaDatabaseSeeder
```

---

## 7. Pemecahan Masalah (*Troubleshooting*)

| Gejala Kendala | Kemungkinan Penyebab | Tindakan Solusi |
| :--- | :--- | :--- |
| `SQLSTATE[HY000] [2002] Connection refused` | Servis MySQL di Laragon belum berjalan. | Buka Laragon, pastikan tombol MySQL berwarna hijau (*Running* pada port 3306). |
| `Table 'u540633926_simaba.pendaftaranmahasiswa' doesn't exist` | Basis data SIMABA belum dimigrasikan/diseed. | Jalankan `php artisan db:seed --class=SimabaDatabaseSeeder` di terminal. |
| `Access denied for user 'u540633926_simaba'@'localhost'` | User database belum dibuat di MySQL lokal. | Jalankan `laragon-setup.bat` ulang atau jalankan query `CREATE USER` pada seksi 2. |
| `Table 'asrama_ubt_db.request_pembayaran' doesn't exist` | Migrasi database asrama belum dijalankan. | Buka terminal Laragon, jalankan `php artisan migrate:fresh --seed`. |
| Tombol pengesahan admin tidak memindahkan data | Status invoice masih `UNPAID` di database. | Pastikan bukti bayar diunggah dan aksi yang dipilih adalah `APPROVE_AND_MIGRATE`. |
