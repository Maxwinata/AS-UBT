# Manual Implementasi & Pengujian CRUD Database Nyata Menuju Live Production
## Portal SI-GABUNG 54 — Asrama Universitas Bunda Thamrin (UBT)

Dokumen ini adalah **manual teknis operasional langsung (*direct implementation guide*)** untuk mengaktifkan dan menguji interaksi **CRUD (Create, Read, Update, Delete) nyata** antara frontend antarmuka pengguna dengan basis data MySQL ganda (`asrama_ubt_db` & `u540633926_simaba`), dari lingkungan lokal Laragon hingga tahap siap rilis (*Live Production*).

---

## 1. Analisis Akar Masalah: Mengapa Pengujian Sebelumnya Belum Melakukan CRUD Nyata?

Sebelum melangkah ke panduan eksekusi, berikut adalah penjelasan teknis mengapa pada pengujian prototipe sebelumnya belum terjadi penulisan data ke MySQL:

| Lapisan Sistem | Kondisi Pada Prototipe Pratinjau | Kondisi Pada Implementasi CRUD Nyata (Production) |
| :--- | :--- | :--- |
| **Penyimpanan State** | Berjalan di memori browser (*Client-Side React State* / `useState`). Seluruh data awal dimuat dari file `src/data/initialData.ts`. | Tersimpan permanen di basis data MySQL (`asrama_ubt_db` & `u540633926_simaba`). |
| **Eksekusi Tombol / Aksi** | Memanggil fungsi lokal seperti `setInvoices(prev => ...)` dan menampilkan notifikasi visual Toast. | Mengirimkan request HTTP (`POST` / `PUT`) melalui Inertia `router.post()` atau `fetch()` ke endpoint Laravel di port 8000. |
| **Pengecekan Login PMB** | Mencari kecocokan data pada array statis JavaScript `INITIAL_SIMABA_STUDENTS.find(...)`. | Menjalankan query SQL nyata melalui Eloquent Model `SimabaPendaftaran::authenticate($noReg, $birthDate)` ke tabel `pendaftaranmahasiswa`. |
| **Pengesahan Admin** | Mengubah atribut status invoice di memori menjadi `PAID` dan `isMigrated: true`. | Mengeksekusi transaksi basis data `DB::transaction(...)` untuk memindahkan data dari tabel penampung `request_pembayaran` ke tabel master buku besar `pembayaran`, `transaksi`, dan mengunci kamar di tabel `penyewa`. |

---

## 2. Arsitektur Dual Database MySQL

Sistem menggunakan 2 database MySQL yang berjalan berdampingan pada port `3306`:

```
┌─────────────────────────────────┐        ┌──────────────────────────────────┐
│   DATABASE 1: asrama_ubt_db     │        │ DATABASE 2: u540633926_simaba    │
├─────────────────────────────────┤        ├──────────────────────────────────┤
│ • users & maba_profiles         │        │ • pendaftaranmahasiswa (PMB UBT) │
│ • request_pembayaran (Staging)  │  <---  │ • programstudi                   │
│ • pembayaran & transaksi (Master)│ (Read) │                                  │
│ • kamar & penyewa (Alokasi)     │        │ Hak Akses: SELECT ONLY (Privat)  │
│ • kyc_documents (Private Disk)  │        │ User: u540633926_simaba          │
└─────────────────────────────────┘        └──────────────────────────────────┘
```

---

## 3. Langkah Instalasi & Konfigurasi Lingkungan (Laragon / Server Lokal)

### Langkah 3.1: Konfigurasi File `.env`
Buka file `.env` di direktori utama proyek, pastikan blok database terkonfigurasi sebagai berikut:

```ini
APP_NAME="Portal SI-GABUNG 54"
APP_ENV=local
APP_KEY=base64:3m8k1X9ZpL2a4vQ7wR5tY8uI0oP1sD3fG5hJ7kL9mN0=
APP_DEBUG=true
APP_URL=http://127.0.0.1:8000

# KONEKSI 1: DATABASE OPERASIONAL ASRAMA
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=asrama_ubt_db
DB_USERNAME=root
DB_PASSWORD=

# KONEKSI 2: DATABASE PENDAFTARAN PMB SIMABA
DB_SIMABA_CONNECTION=mysql
DB_SIMABA_HOST=127.0.0.1
DB_SIMABA_PORT=3306
DB_SIMABA_DATABASE=u540633926_simaba
DB_SIMABA_USERNAME=root
DB_SIMABA_PASSWORD=

# PENYIMPANAN PRIVAT DOKUMEN e-KYC (KTP & SELFIE)
KYC_STORAGE_DISK=private_kyc
KYC_RETENTION_DAYS=45
KYC_SIGNED_URL_TTL_MINUTES=15
```

### Langkah 3.2: Eksekusi Migrasi & Database Seeding
Jalankan perintah berikut di terminal Laragon (atau cukup jalankan `laragon-setup.bat`):

```bash
# 1. Pastikan Apache & MySQL Laragon dalam status "Start All"
# 2. Masuk ke folder proyek
cd C:\laragon\www\asrama-ubt

# 3A. MODE PRODUKSI RIIL (DEFAULT & DISARANKAN - Bebas Akun Dummy Mahasiswa):
php artisan migrate:fresh --seed --seeder=ProductionSeeder

# 3B. MODE SIMULASI PENGUJIAN (Menyertakan Akun Sampel Mahasiswa untuk QA):
php artisan migrate:fresh --seed
```

Perintah di atas akan:
1. Membangun seluruh tabel di `asrama_ubt_db` (users, kamar, tarif, skema bayar, request_pembayaran, pembayaran, transaksi).
2. Membangun tabel simulasi `pendaftaranmahasiswa` di database `u540633926_simaba`.
3. Memasukkan data master kamar hunian riil Roemah 54 (64 kamar / 128 ranjang), tarif sewa resmi SK Rektor UBT, dan akun staf berwenang.

> ⚡ **Verifikasi Cepat Tanpa Menunggu Browser**:  
> Anda dapat langsung menjalankan file `laragon-test-crud.bat` untuk memverifikasi bahwa operasi Create, Read, Update, Delete berjalan mulus di MySQL.

### Langkah 3.3: Menjalankan Server Aplikasi
Untuk menjalankan interaksi CRUD nyata, Anda membutuhkan dua proses terminal yang aktif bersamaan:

* **Terminal 1 (Backend Laravel API & Inertia Server)**:
  ```bash
  php artisan serve --port=8000
  ```
* **Terminal 2 (Frontend Vite Asset Compiler)**:
  ```bash
  npm run dev
  ```

Buka peramban (*browser*) Anda pada URL: **`http://127.0.0.1:8000/login`** atau **`http://asrama-ubt.test/login`**.

---

## 4. Pengkabelan (*Wiring*) Endpoint HTTP untuk CRUD Nyata

Berikut adalah matriks endpoint Laravel yang memproses data nyata ke basis data:

### A. Alur Mahasiswa Baru (Maba)
| Aksi Frontend | Metode & URL Route | Controller & Method | Operasi Basis Data MySQL |
| :--- | :--- | :--- | :--- |
| **Login PMB** | `POST /auth/login-maba` | Route Closure (`routes/web.php`) | `SELECT * FROM u540633926_simaba.pendaftaranmahasiswa WHERE nomor_pendaftaran = ?` |
| **Simpan Biodata (Langkah 1)** | `POST /maba/profile` | `MabaDashboardController@updateProfile` | `INSERT / UPDATE INTO asrama_ubt_db.maba_profiles` |
| **Unggah e-KYC (KTP & Selfie)** | `POST /maba/kyc` | `KycVerificationController@store` | Simpan file fisik ke disk privat `storage/app/private_kyc/` & `INSERT INTO kyc_documents` |
| **Pilih Kamar & Buat Tagihan (Langkah 2 & 3)** | `POST /maba/invoice/configure` | `InvoiceController@configure` | `INSERT INTO request_pembayaran` (`status = 'UNPAID'`, `operator_id = 0`) & `INSERT INTO request_pembayaran_detail` |
| **Unggah Bukti Bayar** | `POST /maba/invoice/{id}/upload-proof` | `InvoiceController@uploadTransferProof` | `UPDATE request_pembayaran SET status = 'PENDING_VERIFICATION', bukti_bayar_path = ?` |
| **Tanda Tangan Kontrak (Langkah 4)** | `POST /maba/contract/sign` | `MabaDashboardController@signContract` | `INSERT INTO contracts` (`status = 'FULLY_SIGNED'`) |

### B. Alur Pengesahan Admin Keuangan & Asrama
| Aksi Frontend | Metode & URL Route | Controller & Method | Operasi Basis Data MySQL |
| :--- | :--- | :--- | :--- |
| **Verifikasi & Sahkan Tagihan** | `POST /admin/invoice/{id}/verify` (body: `action: 'APPROVE_AND_MIGRATE'`) | `AdminAsramaController@verifyInvoice` | **Transaksi Bridging**: Memindahkan record dari `request_pembayaran` ➔ `pembayaran`, `request_transaksi` ➔ `transaksi`, serta alokasi `penyewa` dan status `kamar` = `OCCUPIED`. |

---

## 5. Skenario Pengujian Nyata Langkah-demi-Langkah (Hands-on CRUD)

Gunakan skenario pengujian langsung berikut untuk membuktikan penulisan data ke dalam MySQL:

### Skenario Uji 1: Pendaftaran Mahasiswa Baru Reguler

#### Tahap 1: Login Akun PMB Asli
1. Di halaman login (`http://127.0.0.1:8000/login`), pilih tab **"Mahasiswa Baru (PMB)"**.
2. Masukkan data uji:
   - **Nomor Pendaftaran / PMB:** `260108001`
   - **Tanggal Lahir:** `15/08/2007` (atau pilih kalender: 15 Agustus 2007)
3. Klik tombol **"Masuk Portal Mahasiswa Baru"**.
4. **Verifikasi SQL di Terminal MySQL / phpMyAdmin:**
   ```sql
   SELECT id, nodaftar, nama, id_prodi, jk, tgllahir 
   FROM u540633926_simaba.pendaftaranmahasiswa 
   WHERE nodaftar = '260108001';
   ```
   *Hasil:* Data profil Grace Marlin berhasil ditarik langsung dari database SIMABA.

#### Tahap 2: Pengisian Biodata Profil (Langkah 1)
1. Isi nomor WhatsApp aktif: `081234567890`.
2. Masukkan nama kontak darurat: `Bambang S.` dan nomor telepon: `081198765432`.
3. Klik tombol **"Simpan & Lanjutkan"**.
4. **Verifikasi SQL di MySQL:**
   ```sql
   SELECT id, user_id, nama, no_hp_wa, kontak_darurat_nama 
   FROM asrama_ubt_db.maba_profiles 
   ORDER BY id DESC LIMIT 1;
   ```
   *Hasil:* Record baru berhasil tersimpan (`INSERT`) di tabel `maba_profiles`.

#### Tahap 3: Pemilihan Kamar & Konfigurasi Tagihan (Langkah 2 & 3)
1. Pilih **Gedung B (Asrama Putri)** ➔ **Lantai 2** ➔ **Kamar B-204** ➔ **Ranjang A**.
2. Pilih skema pembayaran: **Durasi 6 Bulan** dengan **Opsi Cicilan Deposit 1 Kali**.
3. Klik **"Kunci Kamar & Terbitkan Tagihan"**.
4. Unggah foto bukti transfer bank (sembarang file JPG/PNG dummy).
5. Klik **"Kirim Bukti Pembayaran untuk Diverifikasi"**.
6. **Verifikasi SQL di MySQL (Pembuktian Staging Mandiri):**
   ```sql
   -- 1. Periksa penulisan data di tabel staging request_pembayaran
   SELECT id, no_request, nim, total_bayar, status, operator_id, created_at 
   FROM asrama_ubt_db.request_pembayaran 
   ORDER BY id DESC LIMIT 1;

   -- 2. Pastikan tabel master pembayaran resmi MASIH KOSONG (Belum disahkan Admin)
   SELECT COUNT(*) AS total_master 
   FROM asrama_ubt_db.pembayaran 
   WHERE no_request LIKE 'REQ-%';
   ```
   *Hasil:* Record tersimpan di `request_pembayaran` dengan `operator_id = 0` (mandiri mahasiswa) dan `status = 'PENDING_VERIFICATION'`. Tabel buku besar `pembayaran` masih bersih (0 record).

#### Tahap 4: Pengesahan Admin Keuangan (Bridging Staging ➔ Master)
1. Buka sesi browser baru atau jendela *Incognito* di `http://127.0.0.1:8000/login`.
2. Masuk sebagai **Admin Keuangan** (`admin.keuangan@ubt.ac.id` / `password123`).
3. Pada tabel tagihan mahasiswa, temukan nama **Grace Marlin** (`REQ-2026-XXXX`).
4. Klik tombol **"Verifikasi & Sahkan"** (`APPROVE_AND_MIGRATE`).
5. **Verifikasi SQL di MySQL (Pembuktian Promosi Master):**
   ```sql
   -- 1. Record dipromosikan ke buku besar resmi pembayaran
   SELECT id, no_invoice, no_request, total_bayar, status, operator_id, created_at 
   FROM asrama_ubt_db.pembayaran 
   ORDER BY id DESC LIMIT 1;

   -- 2. Transaksi kas asrama bertambah
   SELECT id, kode_transaksi, debet, kredit, keterangan 
   FROM asrama_ubt_db.transaksi 
   ORDER BY id DESC LIMIT 1;

   -- 3. Kamar hunian terkunci di master penyewa
   SELECT id, kamar_id, status_sewa, tanggal_mulai, tanggal_selesai 
   FROM asrama_ubt_db.penyewa 
   ORDER BY id DESC LIMIT 1;
   ```
   *Hasil:* Data berhasil bermigrasi secara atomik (`ACID Transaction`) dari tabel penampung sementara ke tabel master dengan `operator_id = 1` (Admin Keuangan).

---

## 6. Panduan Menuju Server Produksi (Live Production Deployment)

Saat sistem dipindahkan dari komputer lokal ke server VPS / Cloud Server (Ubuntu 22.04 / 24.04 LTS):

### 6.1. Build Aset Frontend
Di server produksi, jangan jalankan `npm run dev`. Bangun aset teroptimasi:
```bash
npm run build
```

### 6.2. Optimasi Konfigurasi & Routing Laravel
Kunci file konfigurasi agar dibaca langsung dari memori tanpa scanning file `.env` setiap request:
```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### 6.3. Konfigurasi Hak Akses Direktori (*File Permissions*)
Pastikan web server (Nginx / Apache) memiliki izin tulis ke folder cache dan penyimpanan berkas privat:
```bash
sudo chown -R www-data:www-data /var/www/asrama-ubt
sudo chmod -R 775 /var/www/asrama-ubt/storage
sudo chmod -R 775 /var/www/asrama-ubt/bootstrap/cache
```

### 6.4. Inisialisasi Storage Symlink
Hubungkan aset publik dengan tetap mengisolasi dokumen privat:
```bash
php artisan storage:link
```
> **Catatan Keamanan:** Folder `storage/app/private_kyc` **TIDAK TERLINK** ke folder `/public`, sehingga foto KTP dan selfie mahasiswa terlindung 100% dari akses URL langsung.

### 6.5. Konfigurasi Crontab Otomatisasi SOP Asrama
Buka editor crontab server dengan perintah:
```bash
crontab -e
```
Tambahkan satu baris berikut di bagian paling bawah:
```cron
* * * * * cd /var/www/asrama-ubt && php artisan schedule:run >> /dev/null 2>&1
```
Crontab ini otomatis mengeksekusi:
- Sinkronisasi data PMB SIMABA setiap 15 menit.
- Deteksi penerbitan NIM resmi dari SIAKAD setiap 1 jam.
- Penegakan SOP tunggakan sewa (toleransi 5+5 hari & auto-debet deposit) setiap hari pukul 00:01.
- Pembersihan file e-KYC yatim piatu (*orphan*) berusia > 45 hari setiap hari Minggu.

### 6.6. Menjalankan Queue Worker (Background Jobs)
Untuk pengiriman pesan notifikasi WhatsApp dan kompresi PDF secara non-blocking, jalankan worker via Supervisor:
```ini
[program:asrama-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/asrama-ubt/artisan queue:work --daemon --tries=3
autostart=true
autorestart=true
user=www-data
numprocs=2
redirect_stderr=true
stdout_logfile=/var/www/asrama-ubt/storage/logs/worker.log
```

---

## 7. Ringkasan Perintah Penting (Quick Reference)

| Kebutuhan | Perintah Terminal |
| :--- | :--- |
| **Reset Database & Seeder Awal** | `php artisan migrate:fresh --seed` |
| **Periksa Status Migrasi** | `php artisan migrate:status` |
| **Jalankan Terminal Interaktif Eloquent** | `php artisan tinker` |
| **Cek Daftar Jadwal Otomasi SOP** | `php artisan schedule:list` |
| **Jalankan Eksekusi SOP Manual** | `php artisan asrama:enforce-delinquency-grace` |
| **Bersihkan Seluruh Cache Sistem** | `php artisan optimize:clear` |
