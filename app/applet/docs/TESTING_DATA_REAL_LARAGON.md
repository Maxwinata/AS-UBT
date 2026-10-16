# Panduan Praktis: Pengujian Logika Program dengan Data Real di Laragon (MySQL + Laravel 11 + Inertia.js)

> **Pilihan Bahasa / Language:** 🇮🇩 **Bahasa Indonesia (Utama)** | [🇬🇧 English Version](TESTING_DATA_REAL_LARAGON.en.md)

Panduan ini disusun khusus untuk pengembang, penguji sistem (*QA*), dan staf pengelola Asrama Universitas Bunda Thamrin (UBT) guna **berpindah dari web simulasi prototipe (*client-side state*) menuju pengujian logika program secara nyata menggunakan basis data MySQL riil dan backend Laravel di lingkungan Laragon lokal**.

Fokus utama pengujian ini adalah **membuktikan integritas alur pendaftaran mahasiswa baru (Langkah 1 s.d. 6)** serta mekanisme **pemisahan tabel penampungan sementara (*staging*) menuju buku besar resmi (*running master tables*)**.

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

## 🛠️ Langkah 1: Persiapan Lingkungan Laragon & Database Riil

### 1.1. Menjalankan Servis Laragon
1. Buka aplikasi **Laragon** di komputer Windows Anda.
2. Klik tombol **Start All** untuk mengaktifkan:
   - **Apache / Nginx** (Port 80/443)
   - **MySQL** (Port 3306)

### 1.2. Menyiapkan Database dan Master Data (1-Klik)
Repositori ini telah dilengkapi dengan script otomatisasi instalasi. Buka folder proyek di `C:\laragon\www\asrama-ubt`:
1. Klik ganda file **`laragon-setup.bat`** (atau buka Terminal Laragon dan jalankan `./laragon-setup.sh`).
2. Script akan secara otomatis:
   - Membuat file `.env` dari `.env.example`.
   - Mengisi kredensial database MySQL:
     ```env
     DB_CONNECTION=mysql
     DB_HOST=127.0.0.1
     DB_PORT=3306
     DB_DATABASE=asrama_ubt_db
     DB_USERNAME=root
     DB_PASSWORD=
     ```
   - Menjalankan `composer install` dan `php artisan key:generate`.
   - Menjalankan `php artisan migrate --seed` untuk membuat 15 tabel database dan menyuntikkan master data awal:
     - **Master Tarif**: Sewa Rp 500.000/bln, Administrasi Rp 100.000, Deposit Rp 500.000.
     - **Master Kamar**: Data kamar Lantai 1, 2, 3 (Gedung Putra & Putri).
     - **Master Skema**: Pelunasan di muka, termin bulanan, dan skema cicilan deposit.

### 1.3. Menjalankan Dual Development Server
Jalankan dua jendela terminal:
```bash
# Terminal 1: Backend Laravel + API
php artisan serve

# Terminal 2: Frontend Inertia.js + React (Hot Reload)
npm run dev
```
Akses aplikasi melalui peramban: `http://127.0.0.1:8000` atau `http://asrama-ubt.test`.

---

## 🧪 Langkah 2: Pengujian Alur Pendaftaran Mahasiswa Baru (Input Data Real)

Pada tahap ini, kita menguji logika penulisan data calon penghuni secara mandiri:

1. **Buka Halaman Utama**:
   - Masuk ke URL `http://127.0.0.1:8000/login`.
   - Pilih **Tab 1: Login Mahasiswa Baru**. Masukkan nomor registrasi uji, misalnya: `REG2026-001` atau `PMB2026-08942`.
2. **Langkah 1 (e-KYC & Profil)**:
   - Isi formulir biodata lengkap (NIK, nama lengkap, kontak darurat, alamat KTP berjenjang).
   - Unggah berkas KTP dan foto selfie.
   - *Poin Uji Logika*: Berkas tersimpan di folder aman `storage/app/private_kyc` dan tidak dapat diakses secara publik tanpa *Signed URL*.
3. **Langkah 2 (Pemilihan Kamar & Plotting)**:
   - Pilih gedung (Putra/Putri) dan tipe kamar.
   - Sistem melakukan pengecekan ketersediaan ranjang riil dari tabel `kamar`.
4. **Langkah 3 (Penerbitan Tagihan & Bukti Pembayaran)**:
   - Pilih skema sewa (misal: 6 Bulan + Pembayaran Penuh).
   - Sistem mengkalkulasi tarif dan menghasilkan **Kode Unik 3 Digit** (misal: Rp 3.600.042).
   - Unggah bukti transfer bank atau pilih simulasi konfirmasi Virtual Account Mandiri.
   - Klik **Kirim Konfirmasi Pembayaran**.

---

## 🔍 Langkah 3: Verifikasi Database Staging di phpMyAdmin / HeidiSQL

Setelah mahasiswa baru menyelesaikan Langkah 3, buka phpMyAdmin (`http://localhost/phpmyadmin`) atau HeidiSQL, lalu pilih database `asrama_ubt_db`.

Jalankan query pembuktian berikut:

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

### ✅ Indikator Keberhasilan Tahap Staging:
- `no_request` memiliki format `REQ-YYYYMM-XXXX`.
- **`operator_id` bernilai `0`**: Membuktikan bahwa transaksi ini dibuat secara mandiri oleh calon mahasiswa baru (*self-service*) dan **belum menjadi buku besar resmi**.
- `status_verifikasi` bernilai `0` (Menunggu verifikasi admin).
- Periksa tabel master `pembayaran`:
  ```sql
  -- Tabel Master pembayaran HARUS MASIH BERSIH dari nomor transaksi ini
  SELECT * FROM pembayaran WHERE no_request = (SELECT no_request FROM request_pembayaran ORDER BY id DESC LIMIT 1);
  -- Hasil: 0 baris (Sesuai SOP Keuangan Asrama)
  ```

---

## ⚖️ Langkah 4: Pengujian Logika Verifikasi & Promosi Master oleh Admin Keuangan

1. Buka peramban baru atau tab penyamaran (*incognito*).
2. Masuk ke Portal Admin Keuangan di `http://127.0.0.1:8000/admin/dashboard`.
3. Pada tab **Verifikasi Pembayaran Masuk (Staging Requests)**, temukan baris permintaan `REG2026-001` yang baru saja diajukan.
4. Periksa kecocokan bukti bayar, nominal total, dan 3-digit kode unik.
5. Klik tombol **"Sahkan & Promosi ke Master"**.
6. Sistem akan mengeksekusi metode `promoteToMaster()` di `AdminAsramaController.php`:
   - Menerbitkan Nomor Invoice Resmi (`INV-YYYYMM-XXXX`).
   - Memindahkan rincian biaya ke `pembayaran_detail`.
   - Mencatat arus kas masuk ke tabel `transaksi`.
   - Mengubah status master `penyewa` menjadi aktif dan mengunci kamar menjadi `OCCUPIED`.
   - Menetapkan `operator_id` menjadi ID staf admin yang sedang login (misal: `1`).

---

## 📊 Langkah 5: Pembuktian Akhir Integritas Buku Besar Master

Jalankan query audit berikut di MySQL untuk membuktikan bahwa promosi data berjalan 100% sempurna:

```sql
-- 1. Bukti bahwa data resmi telah masuk ke BUKU BESAR RESMI
SELECT 
    id, 
    no_invoice, 
    no_request, 
    total_bayar, 
    operator_id, 
    created_at 
FROM pembayaran 
ORDER BY id DESC LIMIT 1;

-- 2. Bukti mutasi kas asrama resmi tercatat
SELECT 
    id, 
    no_transaksi, 
    kode_transaksi, 
    jumlah_bayar, 
    operator_id 
FROM transaksi 
ORDER BY id DESC LIMIT 1;

-- 3. Bukti status kamar terkunci secara riil
SELECT 
    kode_kamar, 
    status, 
    nama_penghuni 
FROM kamar 
WHERE id = (SELECT kamar_id FROM request_pembayaran ORDER BY id DESC LIMIT 1);
```

### 🎯 Hasil yang Diharapkan:
1. Kolom `operator_id` pada tabel `pembayaran` dan `transaksi` bernilai $\ge 1$ (ID Staf Keuangan).
2. Terdapat nomor invoice resmi `INV-...` yang tersambung dengan nomor asal `REQ-...`.
3. Status kamar berubah dari `AVAILABLE` menjadi `OCCUPIED`.
4. Mahasiswa baru saat membuka kembali dashboard-nya langsung otomatis terbuka ke **Langkah 4 (Tanda Tangan Kontrak Digital F-19 & F-02 via OTP WhatsApp)**.

---

## 🛠️ Ringkasan Pemecahan Masalah (*Troubleshooting*)

| Gejala Kendala | Kemungkinan Penyebab | Tindakan Solusi |
| :--- | :--- | :--- |
| `SQLSTATE[HY000] [2002] Connection refused` | Servis MySQL di Laragon belum berjalan. | Buka Laragon, pastikan tombol MySQL berwarna hijau (*Running* pada port 3306). |
| `Table 'asrama_ubt_db.request_pembayaran' doesn't exist` | Migrasi database belum dijalankan. | Buka terminal di folder proyek, jalankan `php artisan migrate:fresh --seed`. |
| `The stream or file ".../logs/laravel.log" could not be opened` | Izin folder log pada Windows. | Jalankan terminal Laragon sebagai Administrator atau buat folder `storage/logs`. |
| Tombol pengesahan admin tidak memindahkan data | Status invoice masih `UNPAID` di database. | Pastikan bukti bayar diunggah dan aksi yang dipilih adalah `APPROVE_AND_MIGRATE`. |

---

## 📞 Hubungan Antar Tim & Bantuan Teknis
Jika menemukan anomali logika selama pengujian data real, laporkan ID Request (`no_request`) beserta tangkapan layar tabel MySQL ke tim pengembang atau rujuk ke dokumen [`docs/ARCHITECTURE.md`](ARCHITECTURE.md).
