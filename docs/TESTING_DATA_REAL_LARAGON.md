# Panduan Praktis: Pengujian Logika Program dengan Data Real di Laragon (MySQL + Dual Database SIMABA + Laravel 11 + Inertia.js)

> **Pilihan Bahasa / Language:** 🇮🇩 **Bahasa Indonesia (Utama)** | [🇬🇧 English Version](TESTING_DATA_REAL_LARAGON.en.md)

Panduan ini disusun khusus untuk pengembang, penguji sistem (*QA*), dan staf pengelola Asrama Universitas Bunda Thamrin (UBT) guna **berpindah dari web simulasi prototipe (*client-side state*) menuju pengujian logika program secara nyata menggunakan basis data MySQL riil dan backend Laravel di lingkungan Laragon lokal**.

Fokus utama pengujian ini mencakup:
1. **Konfigurasi Dual Database**: Koneksi `mysql` (`asrama_ubt_db`) dan `simaba` (`u540633926_simaba`).
2. **Optimasi Indeks Basis Data MySQL**: Pemasangan indeks komposit B-Tree terkalibrasi untuk mempercepat query pencarian dan autentikasi jutaan/ribuan data pendaftaran mahasiswa menjadi sub-5 milidetik ($O(1)$).
3. **Peningkatan Kemudahan Pengguna (Maba UX)**: Live Search Auto-Suggest nama mahasiswa dengan debounce 200ms, micro-loading indicator, matched text highlighting (`<mark>`), navigasi keyboard lengkap (`↑`/`↓`/`Enter`/`Esc`), serta auto-formatting tanggal lahir `DD/MM/YYYY`.
4. **Deteksi Dini Penerbitan NIM Resmi**: Pengecekan otomatis di latar belakang ke SIAKAD/SIDARA untuk mahasiswa yang NIM resminya telah terbit.
5. **Integritas Alur Pendaftaran**: Dari pengisian mandiri mahasiswa (Langkah 1 s.d. 6) hingga **pemisahan tabel penampungan sementara (*staging*) menuju buku besar resmi (*running master tables*)** oleh Admin Keuangan.

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

Konfigurasi koneksi ini tersimpan di:
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
   *Catatan: Seeder `SimabaDatabaseSeeder` menyuntikkan skema terindeks dan data dump PMB langsung ke koneksi `simaba`.*

---

## 3. Optimasi Indeks Basis Data MySQL Skala Ribuan Data

Untuk menjamin eksekusi query tetap $\le 5\text{ms}$ saat menangani ribuan calon mahasiswa baru serentak, tabel `pendaftaranmahasiswa` dilengkapi 4 indeks B-Tree:

```sql
-- DDL Optimasi Indeks Tabel pendaftaranmahasiswa (u540633926_simaba)
ALTER TABLE `pendaftaranmahasiswa`
  ADD INDEX `idx_pmb_auth` (`nomor_pendaftaran`, `tanggal_lahir`),
  ADD INDEX `idx_pmb_nama` (`nama_mahasiswa`(50)),
  ADD INDEX `idx_pmb_nik` (`nik`),
  ADD INDEX `idx_pmb_prodi_jalur` (`program_studi`, `jenis_mahasiswa`);
```

### Cara Verifikasi Indeks di MySQL CLI / phpMyAdmin:
```sql
SHOW INDEX FROM u540633926_simaba.pendaftaranmahasiswa;
```
Periksa bahwa kolom `Key_name` mencantumkan `idx_pmb_auth`, `idx_pmb_nama`, `idx_pmb_nik`, dan `idx_pmb_prodi_jalur`.

### Uji Eksekusi Query Benchmark (`EXPLAIN`):
Jalankan perintah ini di phpMyAdmin atau MySQL CLI:
```sql
EXPLAIN SELECT id, nomor_pendaftaran, nama_mahasiswa 
FROM u540633926_simaba.pendaftaranmahasiswa 
WHERE nomor_pendaftaran = '260108001' AND tanggal_lahir = '2008-02-12';
```

**Hasil yang Diharapkan:**
- Kolom `type`: bernilai `ref` atau `const`.
- Kolom `key`: bernilai **`idx_pmb_auth`**.
- Kolom `rows`: bernilai `1` (tidak melakukan *Full Table Scan*).
- Kompleksitas pencocokan: $\mathcal{O}(1)$ langsung menemukan record tanpa membaca ribuan baris lain.

---

## 4. Matriks Data Pengujian Mahasiswa Baru Nyata (Data Dump SIMABA)

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

## 5. Panduan Uji Fitur Interaktif pada Antarmuka Mahasiswa Baru (Maba UX)

### A. Fitur Live Search Auto-Suggest dengan Debounce 200ms
1. Di halaman login, klik tombol **"Pendaftaran Asrama (Jalur PMB)"**.
2. Pada kolom input **"Nomor Pendaftaran PMB atau Ketik Nama"**, ketik 2 atau 3 huruf pertama dari nama mahasiswa (contoh: **`Gra`**, **`Jen`**, **`Maz`**, atau **`Alv`**).
3. **Uji Micro-Loading State**:
   - Amati ikon di sebelah kiri kolom input: saat mengetik, ikon pencarian bertransisi menjadi spinner mikro animasi (`Loader2 animate-spin`) selama 200ms debounce, kemudian kembali normal saat data siap.
4. **Uji Matched Text Highlighting (`<mark>`)**:
   - Huruf yang cocok pada nama mahasiswa dan nomor pendaftaran ditandai dengan sorotan teks tebal (`bg-teal-100 text-teal-950 font-black px-0.5`).
   - Memastikan calon mahasiswa yakin bahwa data yang muncul sesuai dengan ketikannya.

### B. Uji Navigasi Keyboard Lengkap (`↑`, `↓`, `Enter`, `Esc`)
1. Setelah mengetik nama mahasiswa hingga menu dropdown saran muncul:
   - Tekan tombol **Panah Bawah (`↓`)**: Sorotan aktif berpindah ke item calon mahasiswa berikutnya. Kartu item yang terpilih mendapat aksen garis tepi teal tebal (`border-l-4 border-l-teal-600 bg-teal-50`).
   - Tekan tombol **Panah Atas (`↑`)**: Sorotan aktif berpindah ke item sebelumnya.
   - Tekan tombol **`Enter`**: Memilih mahasiswa yang sedang disorot. Seluruh field pendaftaran dan tanggal lahir terisi otomatis, dan dropdown tertutup.
   - Tekan tombol **`Esc`**: Menutup dropdown saran tanpa memilih.
2. Fitur ini dirancang setara kenyamanan *command palette* modern bagi calon mahasiswa yang menggunakan laptop/keyboard fisik.

### C. Format Tanggal Lahir UX `DD/MM/YYYY`
1. Input tanggal lahir menggunakan format ramah pengguna Indonesia: **Hari / Bulan / Tahun** (`DD/MM/YYYY`).
2. Kolom dilengkapi *input mask* otomatis: mengetik angka `12022008` otomatis tertata menjadi `12/02/2008`.
3. Menghapus menggunakan tombol *Backspace* tidak tersangkut pada karakter pemisah `/`.
4. Sistem secara otomatis mengonversi `12/02/2008` menjadi format ISO `2008-02-12` untuk query SQL backend SIMABA.

### D. Fitur Deteksi Dini Penerbitan NIM Resmi (Early Detection)
1. Pilih calon mahasiswa **Alvin Octavianus Hasiholan Hutasoit** (`260727002` / `07/08/2008`).
2. Klik **"Masuk Portal Pendaftaran Asrama"**.
3. **Hasil yang Diharapkan**:
   - Sistem di latar belakang mengecek ke staging/API SIAKAD dan mendeteksi **NIM Resmi: `260801004`**.
   - Muncul dialog modal **"Pemberitahuan Deteksi Dini: NIM Resmi Anda Telah Terbit di SIAKAD"**.
   - Pengguna dapat memilih untuk **Beralih ke Login SSO Mahasiswa** atau **Lanjutkan Masuk dengan Identitas Resmi**.

---

## 6. Pengujian Alur Transaksi & Promosi Staging ke Master di MySQL

### A. Input Pendaftaran Mandiri Mahasiswa Baru
1. Masuk menggunakan nomor registrasi pendaftar (misal: `260108001` atau `250830001`).
2. **Langkah 1 (e-KYC)**: Unggah KTP dan foto selfie biometrik (tersimpan di `storage/app/private_kyc`).
3. **Langkah 2 (Kamar)**: Pilih lantai dan nomor ranjang kamar.
4. **Langkah 3 (Pembayaran)**: Pilih skema sewa dan dapatkan **Kode Unik 3 Digit**. Unggah bukti transfer bank, lalu klik **Kirim Konfirmasi Pembayaran**.

### B. Verifikasi Data Staging di phpMyAdmin / HeidiSQL
Setelah mahasiswa klik kirim, periksa database `asrama_ubt_db`:
```sql
-- Memeriksa data antrean penampungan sementara (staging)
SELECT id, no_request, no_pmb, status, total_bayar, bukti_bayar_path, operator_id, created_at 
FROM request_pembayaran 
ORDER BY id DESC LIMIT 1;
```
**Hasil yang Diharapkan:**
- Kolom `operator_id` bernilai `0` (menandakan input mandiri mahasiswa, belum disahkan admin).
- Kolom `status` bernilai `PENDING` atau `WAITING_VERIFICATION`.
- Data **BELUM** masuk ke tabel `pembayaran` dan `transaksi` resmi.

### C. Eksekusi Pengesahan oleh Admin Keuangan
1. Buka tab baru, masuk ke panel admin: `http://asrama.test/login` (atau URL dev server) dengan role **Admin Keuangan** / Operator Kasir.
2. Buka menu **Verifikasi Pembayaran & Bukti Transfer**.
3. Klik tombol **"Verifikasi & Sahkan Pembayaran"** pada transaksi mahasiswa tadi.

### D. Verifikasi Promosi ke Buku Besar Resmi
Periksa kembali database `asrama_ubt_db`:
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

## 7. Pengujian Langsung via Laravel Artisan & Tinker

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

// Test pencarian nama dengan lean projection
$results = \App\Models\SimabaPendaftaran::searchByNameOrReg('Alvin')->get();
foreach ($results as $r) { echo $r->nomor_pendaftaran . ' - ' . $r->nama_mahasiswa . PHP_EOL; }
// Output: 260727002 - Alvin Octavianus Hasiholan Hutasoit
```

### 2. Menjalankan Ulang Seeder SIMABA Secara Spesifik
```bash
php artisan db:seed --class=SimabaDatabaseSeeder
```

---

## 8. Pemecahan Masalah (*Troubleshooting*)

| Gejala Kendala | Kemungkinan Penyebab | Tindakan Solusi |
| :--- | :--- | :--- |
| `SQLSTATE[HY000] [2002] Connection refused` | Servis MySQL di Laragon belum berjalan. | Buka Laragon, pastikan tombol MySQL berwarna hijau (*Running* pada port 3306). |
| `Table 'u540633926_simaba.pendaftaranmahasiswa' doesn't exist` | Basis data SIMABA belum dimigrasikan/diseed. | Jalankan `php artisan db:seed --class=SimabaDatabaseSeeder` di terminal. |
| `Access denied for user 'u540633926_simaba'@'localhost'` | User database belum dibuat di MySQL lokal. | Jalankan `laragon-setup.bat` ulang atau jalankan query `CREATE USER` pada seksi 2. |
| `Table 'asrama_ubt_db.request_pembayaran' doesn't exist` | Migrasi database asrama belum dijalankan. | Buka terminal Laragon, jalankan `php artisan migrate:fresh --seed`. |
| Tombol pengesahan admin tidak memindahkan data | Status invoice masih `UNPAID` di database. | Pastikan bukti bayar diunggah dan aksi yang dipilih adalah `APPROVE_AND_MIGRATE`. |
