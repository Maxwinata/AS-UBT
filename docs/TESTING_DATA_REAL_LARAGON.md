# Panduan Pengujian Data Real SIMABA di Lingkungan Laragon

> **Pilihan Bahasa / Language:** 🇮🇩 **Bahasa Indonesia (Utama)** | [🇬🇧 English Version](TESTING_DATA_REAL_LARAGON.en.md)

Dokumen ini merupakan panduan teknis dan operasional untuk menguji fitur **Dual Database SIMABA (`u540633926_simaba`)**, **Live Search Auto-Suggest Nama Mahasiswa**, **Format Tanggal Lahir UX `DD/MM/YYYY`**, serta **Deteksi Dini (*Early Detection*) Penerbitan NIM Resmi via SIAKAD/SIDARA** secara langsung pada lingkungan **Laragon (MySQL, PHP 8.2+, Apache/Nginx, Vite)**.

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
1. Skrip akan otomatis membuat kedua database:
   ```sql
   CREATE DATABASE IF NOT EXISTS asrama_ubt_db;
   CREATE DATABASE IF NOT EXISTS u540633926_simaba;
   ```
2. Skrip membuat user `u540633926_simaba` dengan password `12345678Ab&` dan memberikan hak akses:
   ```sql
   CREATE USER IF NOT EXISTS 'u540633926_simaba'@'localhost' IDENTIFIED BY '12345678Ab&';
   CREATE USER IF NOT EXISTS 'u540633926_simaba'@'127.0.0.1' IDENTIFIED BY '12345678Ab&';
   GRANT ALL PRIVILEGES ON u540633926_simaba.* TO 'u540633926_simaba'@'localhost';
   GRANT ALL PRIVILEGES ON u540633926_simaba.* TO 'u540633926_simaba'@'127.0.0.1';
   FLUSH PRIVILEGES;
   ```
3. Menjalankan migrasi dan seeder data SIMABA nyata:
   ```bash
   php artisan migrate --seed
   ```
   *Catatan: Seeder `SimabaDatabaseSeeder` menyuntikkan data tabel `pendaftaranmahasiswa` dan `programstudi` langsung ke koneksi `simaba`.*

---

## 3. Matriks Data Pengujian Mahasiswa Baru Nyata (Data Dump SIMABA)

Gunakan salah satu dari akun calon mahasiswa baru berikut untuk menguji seluruh alur fungsional:

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
2. Pada kolom input **"Nomor Pendaftaran PMB / Cari Nama Lengkap"**, ketik minimal 2 karakter dari nama calon mahasiswa:
   - Contoh: Ketik **`Grace`**, **`Jenny`**, **`Maza`**, atau **`Alvin`**.
3. **Hasil yang Diharapkan**:
   - Menu saran interaktif (*live dropdown*) langsung muncul di bawah kolom input.
   - Kartu saran menampilkan:
     * Nama lengkap calon mahasiswa dengan font tebal (*bold*).
     * Lencana nomor pendaftaran (misal: `260108001`).
     * Nama program studi resmi (misal: *S1 Ilmu Keperawatan*).
     * Tombol aksi **`[PILIH]`**.
4. Klik tombol **`[PILIH]`** pada saran yang diinginkan:
   - Nomor pendaftaran otomatis terisi ke form input.
   - Tanggal lahir terformat otomatis terisi.
   - Dropdown saran tertutup secara halus.
   - Muncul kartu hijau konfirmasi identitas terverifikasi lengkap dengan tombol *"Ganti / Cari Ulang"*.

### B. Format Tanggal Lahir UX `DD/MM/YYYY`
1. Tanggal lahir menggunakan urutan ramah pengguna Indonesia: **Hari / Bulan / Tahun** (`DD/MM/YYYY`).
2. Kolom dilengkapi *input mask* otomatis: saat Anda mengetik `12022008`, kolom otomatis menampilkan `12/02/2008`.
3. Saat form dikirim (*Submit*):
   - Sistem secara cerdas mengonversi `12/02/2008` menjadi format ISO `2008-02-12` untuk query SQL:
     ```sql
     SELECT * FROM pendaftaranmahasiswa 
     WHERE nomor_pendaftaran = '260108001' 
       AND tanggal_lahir = '2008-02-12' 
       AND status = 1;
     ```

### C. Fitur Deteksi Dini Penerbitan NIM Resmi (Early Detection)
1. Pilih calon mahasiswa **Alvin Octavianus Hasiholan Hutasoit** (`260727002` / `07/08/2008`).
2. Klik **"Masuk Portal Pendaftaran"**.
3. **Hasil yang Diharapkan**:
   - Sistem di latar belakang melakukan pengecekan ke staging/API SIAKAD.
   - Sistem mendeteksi bahwa universitas telah menerbitkan **NIM Resmi: `260801004`**.
   - Muncul jendela modal **"Pemberitahuan Deteksi Dini: NIM Resmi Anda Telah Terbit di SIAKAD"**.
   - Pengguna diberikan pilihan praktis:
     * **Beralih ke Login SSO Mahasiswa** (menggunakan NIM resmi).
     * **Lanjutkan Masuk dengan Identitas Resmi** (langsung membuka dashboard dengan NIM terintegrasi).

---

## 5. Pengujian Langsung via Laravel Artisan & Tinker

Buka terminal Laragon di folder proyek (`C:\laragon\www\asrama-ubt`), kemudian jalankan perintah-perintah berikut:

### 1. Memeriksa Koneksi Database SIMABA via Tinker
```bash
php artisan tinker
```
Lalu jalankan kode PHP berikut di dalam prompt Tinker:
```php
// Test autentikasi model SimabaPendaftaran
$student = \App\Models\SimabaPendaftaran::authenticate('260108001', '12/02/2008');
echo $student->nama_mahasiswa . " | Prodi: " . $student->nama_prodi;
// Output yang diharapkan: GRACE MARLIN TELAUMBANUA | Prodi: S1 Ilmu Keperawatan

// Test pencarian nama
$results = \App\Models\SimabaPendaftaran::searchByNameOrReg('Alvin')->get();
foreach ($results as $r) { echo $r->nomor_pendaftaran . ' - ' . $r->nama_mahasiswa . PHP_EOL; }
// Output yang diharapkan: 260727002 - Alvin Octavianus Hasiholan Hutasoit
```

### 2. Menjalankan Ulang Seeder SIMABA Secara Spesifik
Jika Anda ingin menyetel ulang data dummy SIMABA sewaktu-waktu:
```bash
php artisan db:seed --class=SimabaDatabaseSeeder
```

---

## 6. Ringkasan Kunci Skenario Pengujian

| Komponen | Status | Hasil Verifikasi |
|:---|:---|:---|
| **Dual Database Configuration** | ✅ Terhubung | Laravel membaca `u540633926_simaba` tanpa mengganggu `asrama_ubt_db`. |
| **Live Search Nama Mahasiswa** | ✅ Aktif | Dropdown responsif menampilkan data PMB asli dan auto-fill nomor pendaftaran. |
| **UX Tanggal Lahir `DD/MM/YYYY`** | ✅ Terkalibrasi | Nyaman bagi pengguna lokal, terkonversi otomatis ke SQL ISO `YYYY-MM-DD`. |
| **Early Detection SIAKAD/SIDARA** | ✅ Otomatis | Deteksi penerbitan NIM resmi di latar belakang tanpa memblokir pendaftar yang belum terbit NIM. |
| **Kredensial Database Terstandarisasi** | ✅ Siap Pakai | `.env.example` dan `laragon-setup.bat` selaras dengan user `u540633926_simaba`. |
