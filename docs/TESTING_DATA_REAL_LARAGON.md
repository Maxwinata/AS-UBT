# Panduan Praktis: Pengujian Logika Program dengan Data Real di Laragon (MySQL + Dual Database SIMABA + Laravel 11 + Inertia.js)

> **Pilihan Bahasa / Language:** 🇮🇩 **Bahasa Indonesia (Utama)** | [🇬🇧 English Version](TESTING_DATA_REAL_LARAGON.en.md)

Dokumen ini merupakan panduan teknis, pengujian, dan pengembangan operasional lengkap untuk pengembang (*software engineers*), penguji sistem (*QA*), staf keuangan, dan staf asrama Universitas Bunda Thamrin (UBT). Panduan ini dirancang untuk **berpindah secara mulus dari web simulasi prototipe (*client-side state*) menuju pengujian logika program secara riil menggunakan basis data MySQL ganda, backend Laravel 11, dan frontend Inertia.js/React di lingkungan lokal Laragon hingga siap dideploy ke server *production***.

---

## 📌 Peta Lokasi Dokumentasi Sistem Terkait

Sebelum memulai pengujian, berikut referensi dokumen pendukung di dalam repositori:

| Dokumen | Lokasi | Manfaat Pengujian & Operasional |
| :--- | :--- | :--- |
| **Instalasi Laragon 1-Klik** | [`LARAGON_SETUP.md`](../LARAGON_SETUP.md) | Panduan instalasi cepat stack PHP 8.2+, MySQL, dan script `laragon-setup.bat`. |
| **Arsitektur Staging & Master** | [`docs/ARCHITECTURE.md`](ARCHITECTURE.md) | Rincian pemisahan penampungan sementara (`operator_id = 0`) dan buku besar resmi (`operator_id = 1`). |
| **Matriks 5 Skenario Uji** | [`docs/scenario-mappings.md`](scenario-mappings.md) | Skenario uji untuk mahasiswa reguler, penerima KIP, cicilan deposit, dan transisi NIM. |
| **Keamanan Berkas e-KYC** | [`docs/SECURE_UPLOAD_STRATEGY.md`](SECURE_UPLOAD_STRATEGY.md) | Panduan teknis penyimpanan *private storage disk* dan generasi *signed URL* berkas KTP & Selfie. |
| **Spesifikasi Lengkap (PRD/SAS)**| [`ASRAMA_UBT_SYSTEM_DOCUMENTATION.md`](../ASRAMA_UBT_SYSTEM_DOCUMENTATION.md) | Definisi aturan bisnis JUKLAK-02, JUKLAK-03, kontrak sewa, dan lembar ratifikasi F-22. |

---

## 1. Konfigurasi Dual Database Laragon

Sistem Portal SI-GABUNG 54 Asrama UBT menggunakan dua koneksi basis data MySQL terpisah yang berjalan bersamaan pada port `3306`:

| Parameter | Database 1: Operasional Asrama (`mysql`) | Database 2: PMB Calon Mahasiswa (`simaba`) |
| :--- | :--- | :--- |
| **Nama Database** | `asrama_ubt_db` | `u540633926_simaba` |
| **Host & Port** | `127.0.0.1:3306` | `127.0.0.1:3306` |
| **Username** | `root` | `u540633926_simaba` (atau `root`) |
| **Password** | *(kosong secara default di Laragon)* | `12345678Ab&` |
| **Peran Sistem** | Master kamar, billing invoice, staging bukti transfer, e-KYC private storage, kontrak OTP, e-Ticket BASTK | Pembacaan data asli calon mahasiswa baru (tabel `pendaftaranmahasiswa` & `programstudi`) |
| **Model Eloquent** | `App\Models\User`, `App\Models\BillingInvoice`, `App\Models\Room`, dll. | `App\Models\SimabaPendaftaran` (`protected $connection = 'simaba';`) |

Konfigurasi koneksi ini tersimpan di `config/database.php` dan file `.env` proyek Anda:
```ini
# KONEKSI DATABASE UTAMA ASRAMA (OPERASIONAL & TRANSAKSI)
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=asrama_ubt_db
DB_USERNAME=root
DB_PASSWORD=

# KONEKSI DATABASE SIMABA (PENDAFTARAN MAHASISWA BARU - DUAL DATABASE)
DB_SIMABA_CONNECTION=mysql
DB_SIMABA_HOST=127.0.0.1
DB_SIMABA_PORT=3306
DB_SIMABA_DATABASE=u540633926_simaba
DB_SIMABA_USERNAME=u540633926_simaba
DB_SIMABA_PASSWORD=12345678Ab&
```

---

## 2. Inisialisasi Otomatis (1-Klik via Laragon)

Cukup jalankan file `laragon-setup.bat` (atau `bash laragon-setup.sh` di terminal Linux/Git Bash):

```cmd
laragon-setup.bat
```

Skrip ini secara otomatis mengeksekusi 7 langkah instalasi:
1. Mengecek lingkungan PHP 8.2+, Composer, Node.js, dan MySQL.
2. Memvalidasi file `.env` dari `.env.example`.
3. Memasang dependensi PHP (`composer install`) dan mengenerate Application Key (`php artisan key:generate`).
4. Memasang dependensi frontend (`npm install`).
5. Memastikan kedua database (`asrama_ubt_db` dan `u540633926_simaba`) serta akun MySQL `u540633926_simaba` siap dengan izin akses penuh:
   ```sql
   CREATE DATABASE IF NOT EXISTS asrama_ubt_db;
   CREATE DATABASE IF NOT EXISTS u540633926_simaba;
   CREATE USER IF NOT EXISTS 'u540633926_simaba'@'localhost' IDENTIFIED BY '12345678Ab&';
   CREATE USER IF NOT EXISTS 'u540633926_simaba'@'127.0.0.1' IDENTIFIED BY '12345678Ab&';
   GRANT ALL PRIVILEGES ON u540633926_simaba.* TO 'u540633926_simaba'@'localhost';
   GRANT ALL PRIVILEGES ON u540633926_simaba.* TO 'u540633926_simaba'@'127.0.0.1';
   FLUSH PRIVILEGES;
   ```
6. Menjalankan migrasi dan seeder data riil (`php artisan migrate --seed`).
7. Melakukan *symlink* direktori publik (`php artisan storage:link`).

---

## 3. Optimasi Indeks Basis Data MySQL Skala Ribuan Mahasiswa

Untuk menangani ribuan calon mahasiswa baru yang mengakses sistem secara serentak pada musim PMB, tabel `pendaftaranmahasiswa` telah dilengkapi 4 indeks B-Tree performa tinggi:

```sql
-- DDL Optimasi Indeks Tabel pendaftaranmahasiswa (u540633926_simaba)
ALTER TABLE `pendaftaranmahasiswa`
  ADD INDEX `idx_pmb_auth` (`nomor_pendaftaran`, `tanggal_lahir`),
  ADD INDEX `idx_pmb_nama` (`nama_mahasiswa`(50)),
  ADD INDEX `idx_pmb_nik` (`nik`),
  ADD INDEX `idx_pmb_prodi_jalur` (`program_studi`, `jenis_mahasiswa`);
```

### Verifikasi Indeks di MySQL:
```sql
SHOW INDEX FROM u540633926_simaba.pendaftaranmahasiswa;
```
Pastikan kolom `Key_name` memuat `idx_pmb_auth`, `idx_pmb_nama`, `idx_pmb_nik`, dan `idx_pmb_prodi_jalur`.

### Uji Benchmark Query (`EXPLAIN`):
```sql
EXPLAIN SELECT id, nomor_pendaftaran, nama_mahasiswa 
FROM u540633926_simaba.pendaftaranmahasiswa 
WHERE nomor_pendaftaran = '260108001' AND tanggal_lahir = '2008-02-12';
```
**Hasil Evaluasi yang Diharapkan:**
- `type`: `ref` atau `const`
- `key`: **`idx_pmb_auth`**
- `rows`: `1` (eksekusi langsung $\mathcal{O}(1)$ tanpa *Full Table Scan*)

---

## 4. Matriks Data Pengujian Mahasiswa Baru Nyata (Data Dump SIMABA)

Gunakan akun calon mahasiswa baru berikut untuk menguji seluruh skenario fungsional:

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

### A. Live Search Auto-Suggest dengan Debounce 200ms
1. Di halaman login, klik tombol **"Pendaftaran Asrama (Jalur PMB)"**.
2. Pada kolom input **"Nomor Pendaftaran PMB atau Ketik Nama"**, ketik 2 atau 3 karakter dari nama mahasiswa (contoh: **`Gra`**, **`Jen`**, **`Maz`**, atau **`Alv`**).
3. **Uji Micro-Loading State**:
   - Amati ikon di sebelah kiri kolom input: saat mengetik, ikon pencarian bertransisi menjadi spinner mikro animasi (`Loader2 animate-spin`) selama 200ms debounce, kemudian kembali menjadi ikon lup saat data siap.
4. **Uji Matched Text Highlighting (`<mark>`)**:
   - Huruf yang cocok pada nama mahasiswa dan nomor pendaftaran ditandai dengan sorotan teks tebal (`bg-teal-100 text-teal-950 font-black px-0.5`).

### B. Uji Navigasi Keyboard Lengkap (`↑`, `↓`, `Enter`, `Esc`)
1. Setelah mengetik nama mahasiswa hingga menu dropdown saran muncul:
   - Tekan **Panah Bawah (`↓`)**: Sorotan berpindah ke calon mahasiswa berikutnya dengan garis aksen tebal (`border-l-4 border-l-teal-600 bg-teal-50`).
   - Tekan **Panah Atas (`↑`)**: Sorotan berpindah ke item sebelumnya.
   - Tekan **`Enter`**: Memilih mahasiswa terpilih, mengisi otomatis nomor pendaftaran dan tanggal lahir, serta menutup dropdown.
   - Tekan **`Esc`**: Menutup menu dropdown saran seketika tanpa mengubah input.

### C. Format Tanggal Lahir UX `DD/MM/YYYY`
1. Kolom tanggal lahir menggunakan format ramah pengguna Indonesia: **Hari / Bulan / Tahun** (`DD/MM/YYYY`).
2. Kolom dilengkapi *input mask* otomatis: mengetik angka `12022008` otomatis terformat menjadi `12/02/2008`.
3. Menghapus dengan tombol *Backspace* tidak tersangkut pada garis miring `/`.
4. Sistem backend mengonversi `12/02/2008` menjadi format ISO `2008-02-12` untuk query SQL database SIMABA.

### D. Fitur Deteksi Dini Penerbitan NIM Resmi (Early Detection)
1. Pilih calon mahasiswa **Alvin Octavianus Hasiholan Hutasoit** (`260727002` / `07/08/2008`).
2. Klik **"Masuk Portal Pendaftaran Asrama"**.
3. **Hasil yang Diharapkan**:
   - Sistem mendeteksi **NIM Resmi: `260801004`** di SIAKAD.
   - Muncul dialog modal **"Pemberitahuan Deteksi Dini: NIM Resmi Anda Telah Terbit di SIAKAD"**.
   - Pengguna dapat memilih untuk beralih ke login SSO atau melanjutkan masuk.

---

## 6. Panduan Lengkap Setiap Tahapan Pendaftaran (Langkah 1 s.d. 6)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    ALUR TAHAPAN PENDAFTARAN MAHASISWA BARU                  │
├─────────────┬─────────────┬─────────────┬─────────────┬─────────────┬───────┤
│  LANGKAH 1  │  LANGKAH 2  │  LANGKAH 3  │  LANGKAH 4  │  LANGKAH 5  │LANGKAH│
│    e-KYC    │ Pilih Kamar │  Billing &  │ Kontrak OTP │ Ratifikasi  │   6   │
│  Biometrik  │  & Ranjang  │ Transaksi   │  WhatsApp   │ F-22 & BASTK│ e-Pass│
└─────────────┴─────────────┴─────────────┴─────────────┴─────────────┴───────┘
```

### Langkah 1: Input Mandiri Identitas & Unggah Dokumen e-KYC
1. Masuk sebagai calon mahasiswa baru (misal: `260108001` - GRACE MARLIN).
2. Periksa data diri yang otomatis terisi dari database SIMABA: Nama, NIK, Tempat/Tanggal Lahir, Asal Sekolah, Program Studi.
3. Unggah Berkas Identitas:
   - **Foto KTP Asli**: Format JPG/PNG, ukuran maksimal 2 MB.
   - **Foto Selfie Biometrik Memegang KTP**: Pastikan wajah dan teks KTP terbaca jelas.
   - *(Khusus Mahasiswa KIP)*: Unggah Kartu KIP Kuliah atau Surat Keterangan Subsidi.
4. **Verifikasi Keamanan Penyimpanan Disk Privat**:
   - Berkas tersimpan di `storage/app/private_kyc/{nomor_pendaftaran}/`.
   - **Aturan Versioning Non-Overwriting (Sesuai Konvensi Audit Trail)**: Nama file menyertakan timestamp atau UUID (contoh: `ktp_260108001_v1_171800.jpg`). Jika pengguna mengunggah ulang perbaikan berkas, file lama **TIDAK DITIMPA** agar riwayat verifikasi admin tetap valid.
   - Berkas **TIDAK DAPAT** diakses langsung via URL publik (`/storage/...`), melainkan melalui endpoint backend terotentikasi yang menghasilkan *Signed URL* sementara.

### Langkah 2: Pemilihan Kamar & Ranjang
1. Sistem menampilkan denah lantai asrama sesuai jenis kelamin mahasiswa (Mahasiswi $\rightarrow$ Asrama Putri; Mahasiswa $\rightarrow$ Asrama Putra).
2. Pilih Gedung, Lantai (contoh: Lantai 2), dan Kamar (contoh: Kamar `P-204`).
3. Pilih Ranjang yang berstatus `AVAILABLE` (contoh: Ranjang B - Dekat Jendela).
4. Klik **"Kunci Kamar & Lanjutkan"**.
5. **Verifikasi Sistem**:
   - Status ranjang berubah menjadi `HELD` (*Room Hold*) dengan batas waktu 2 jam untuk menyelesaikan pembayaran, mencegah dua mahasiswa memilih ranjang yang sama (*double booking*).

### Langkah 3: Skema Sewa, Billing, & Bukti Transfer (Pemisahan Staging)
1. **Penerbitan Invoice**:
   - **Jalur KIP Kuliah**: Tagihan sewa kamar bersubsidi 100% (Rp 0). Mahasiswa langsung diarahkan ke konfirmasi verifikasi dokumen subsidi.
   - **Jalur Reguler**: Rincian tagihan terbentuk:
     - Biaya Sewa Semester 1: Rp 3.000.000,- (atau opsi cicilan Rp 500.000/bln).
     - Biaya Deposit Jaminan Fasilitas: Rp 500.000,- (dapat dikembalikan saat lulus).
     - Biaya Administrasi: Rp 100.000,-.
     - **Kode Unik 3 Digit**: Contoh `482` $\rightarrow$ Total Transfer: `Rp 3.600.482,-`.
2. **Unggah Bukti Transfer**:
   - Mahasiswa mentransfer ke rekening Virtual Account / Bank BNI Asrama UBT.
   - Unggah struk transfer / screenshot m-Banking.
   - Klik tombol **"Kirim Konfirmasi Pembayaran"**.
3. **Verifikasi Data Staging di MySQL (`asrama_ubt_db`)**:
   ```sql
   SELECT id, no_request, no_pmb, status, total_bayar, bukti_bayar_path, operator_id, created_at 
   FROM request_pembayaran 
   ORDER BY id DESC LIMIT 1;
   ```
   - `operator_id = 0`: Menandakan transaksi mandiri mahasiswa yang menunggu verifikasi admin.
   - `status = 'WAITING_VERIFICATION'`.
   - Data **BELUM** masuk ke buku besar `pembayaran` dan `transaksi`.

### Langkah 4: Tanda Tangan Kontrak Digital F-19 & F-02 via OTP WhatsApp
1. Setelah pembayaran diverifikasi oleh Admin Keuangan, dashboard mahasiswa otomatis berprogres ke **Langkah 4**.
2. **Klausul Perjanjian**: Mahasiswa membaca Tata Tertib Asrama (Formulir F-19) dan Surat Pernyataan Kesanggupan (Formulir F-02).
3. Klik tombol **"Minta Kode OTP Verifikasi WhatsApp"**.
4. **Simulasi Pengujian Sandbox**:
   - Nomor WhatsApp yang terdaftar menerima kode OTP 6 digit.
   - Pada lingkungan pengujian lokal, gunakan kode OTP sandbox: **`123456`**.
5. Masukkan kode `123456` lalu klik **"Tanda Tangani Kontrak Secara Digital"**.
6. **Verifikasi Integritas Kontrak**:
   - Sistem mencatat hash SHA-256 dokumen perjanjian, nomor telepon penerima, alamat IP, dan *timestamp* penandatanganan ke tabel `kontrak_digital`.
   - Dokumen F-19 & F-02 berstatus `SIGNED_VALID`.

### Langkah 5: Dokumen Ratifikasi F-22 & BASTK
1. Sistem menghasilkan dua dokumen resmi:
   - **Formulir Ratifikasi Penempatan F-22**: Ditandatangani secara digital oleh Kepala Unit Pengelola Asrama UBT.
   - **Berita Acara Serah Terima Kamar (BASTK)**: Berisi checklist inventaris fasilitas (kunci kamar fisik, kasur busa, lemari 2 pintu, meja belajar, kursi, dan kartu akses gerbang).
2. Mahasiswa memeriksa checklist fasilitas dan memberikan persetujuan penerimaan fasilitas.
3. Dokumen dapat diunduh dalam format PDF resmi dengan stempel QR validasi universitas.

### Langkah 6: Penerbitan Tiket Masuk Digital (e-Ticket QR Pass) & Check-In Fisik
1. Setelah Langkah 5 rampung, sistem secara otomatis menerbitkan **Tiket Masuk Digital (e-Ticket / Boarding Pass Asrama)**.
2. Kartu e-Ticket memuat:
   - Kode Unik Akses: Contoh `PASS-2026-8831-UBT`.
   - QR Code Terenkripsi untuk dipindai di pos penjagaan gerbang utama asrama.
   - Alokasi: Gedung, Lantai, Nomor Kamar, dan Tanggal Efektif Mulai Huni.
3. **Simulasi Check-In di Gerbang Masuk Asrama**:
   - Petugas keamanan/pengelola asrama memindai QR Code via tablet pos gerbang.
   - Sistem memvalidasi identitas mahasiswa dan mengubah status hunian menjadi `ACTIVE_IN_HOUSE`.
   - Mahasiswa menerima kunci kamar fisik dan resmi menjadi penghuni asrama.

---

## 7. Pengujian Operasional Panel Multi-Role Admin

Untuk menguji pemisahan tugas (*Segregation of Duties*), masuk menggunakan akun staf sesuai peran di URL `/login`:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       MATRIKS PERAN & AKSES ADMIN                           │
├──────────────────────┬────────────────────────┬─────────────────────────────┤
│ PERAN ADMIN          │ KREDENSIAL LOGIN       │ TANGGUNG JAWAB PENGUJIAN    │
├──────────────────────┼────────────────────────┼─────────────────────────────┤
│ 1. Admin Keuangan    │ keuangan@ubt.ac.id     │ Verifikasi transfer bank &  │
│    (Operator Kasir)  │ Pass: 12345678Ab&      │ Promosi Staging ke Master   │
├──────────────────────┼────────────────────────┼─────────────────────────────┤
│ 2. Admin Kamar       │ asrama@ubt.ac.id       │ Manajemen okupansi, kunci,  │
│    (Pengelola Fisik) │ Pass: 12345678Ab&      │ inventaris kamar, BASTK     │
├──────────────────────┼────────────────────────┼─────────────────────────────┤
│ 3. Super Admin       │ superadmin@ubt.ac.id   │ Audit trail e-KYC, dual DB  │
│    (System Admin)    │ Pass: 12345678Ab&      │ sync, bridging SIAKAD       │
└──────────────────────┴────────────────────────┴─────────────────────────────┘
```

### Prosedur Verifikasi Staging ke Master oleh Admin Keuangan:
1. Masuk ke akun `keuangan@ubt.ac.id`.
2. Buka menu **"Verifikasi Pembayaran & Bukti Transfer"**.
3. Cari pendaftar mahasiswa baru yang baru saja mengunggah bukti transfer di Langkah 3.
4. Periksa kecocokan nominal transfer bank dengan kode unik 3 digit.
5. Klik tombol **"Verifikasi & Sahkan Pembayaran"** (eksekusi aksi `APPROVE_AND_MIGRATE`).
6. **Verifikasi Buku Besar Resmi di MySQL (`asrama_ubt_db`)**:
   ```sql
   -- 1. Verifikasi promosi ke buku besar resmi
   SELECT id, no_invoice, no_request, total_bayar, operator_id, created_at 
   FROM pembayaran ORDER BY id DESC LIMIT 1;

   -- 2. Verifikasi pencatatan arus kas asrama
   SELECT id, no_transaksi, kode_transaksi, jumlah_bayar, operator_id 
   FROM transaksi ORDER BY id DESC LIMIT 1;

   -- 3. Verifikasi penguncian status kamar
   SELECT kode_kamar, status, nama_penghuni 
   FROM kamar WHERE id = (SELECT kamar_id FROM request_pembayaran ORDER BY id DESC LIMIT 1);
   ```
   - Kolom `operator_id >= 1` (membuktikan disahkan oleh staf keuangan, bukan input liar).
   - Terdapat `no_invoice` resmi `INV-2026-...` yang terhubung ke `REQ-...`.
   - Status kamar terkunci menjadi `OCCUPIED`.

---

## 8. Panduan Teknis Development & Debugging di Laragon

Buka terminal Laragon pada direktori proyek (`C:\laragon\www\asrama-ubt`):

### 1. Manajemen Berkas e-KYC Private Storage & Signed URLs
- Berkas sensitif (KTP, Selfie) tidak boleh disimpan di folder `public/`.
- File disimpan di `storage/app/private_kyc/`.
- Endpoint backend untuk melihat berkas dilindungi middleware autentikasi dan menghasilkan *Signed URL*:
  ```php
  // Contoh pembuatan temporary signed URL di Controller Laravel
  use Illuminate\Support\Facades\URL;

  public function getKtpPreviewUrl($studentId)
  {
      return URL::temporarySignedRoute(
          'admin.kyc.download',
          now()->addMinutes(15),
          ['student' => $studentId, 'type' => 'ktp']
      );
  }
  ```
- **Uji Keamanan**: Coba akses URL file langsung via browser tanpa token signed. Sistem harus mengembalikan kode respon `403 Forbidden`.

### 2. Memantau Log Backend Secara Real-Time
Untuk melihat pesan error, query SQL, atau jejak exception:
```bash
# Windows PowerShell di Laragon
Get-Content -Path storage/logs/laravel.log -Wait -Tail 30

# Git Bash / Linux
tail -f storage/logs/laravel.log
```

### 3. Perintah Inspeksi Interaktif via Laravel Tinker
Jalankan Tinker untuk menguji model Eloquent tanpa melalui antarmuka web:
```bash
php artisan tinker
```
Eksekusi pengujian berikut:
```php
// 1. Cek koneksi & autentikasi model SimabaPendaftaran
$student = \App\Models\SimabaPendaftaran::authenticate('260108001', '12/02/2008');
echo "Nama: {$student->nama_mahasiswa} | Prodi: {$student->nama_prodi} | Jalur: {$student->jenis_mahasiswa}\n";

// 2. Cek efisiensi scope pencarian nama berindeks
$results = \App\Models\SimabaPendaftaran::searchByNameOrReg('Alvin')->get();
foreach ($results as $r) {
    echo "PMB: {$r->nomor_pendaftaran} - {$r->nama_mahasiswa}\n";
}

// 3. Cek ketersediaan kamar di database asrama
$emptyRooms = \App\Models\Room::where('status', 'AVAILABLE')->count();
echo "Kamar Tersedia: {$emptyRooms}\n";
```

### 4. Pembersihan Cache Saat Modifikasi Skrip
Jika ada perubahan pada file `.env` atau routes yang tidak terdeteksi:
```bash
php artisan config:clear
php artisan route:clear
php artisan view:clear
php artisan cache:clear
```

---

## 9. Panduan Kesiapan Menuju Lingkungan Production (*Production Readiness*)

Sebelum mendeploy aplikasi ke server *production* (VPS Ubuntu / Cloud Server):

### 1. Pengerasan Keamanan File Konfigurasi (`.env.production`)
Pastikan parameter lingkungan diatur secara ketat:
```ini
APP_NAME="Portal SI-GABUNG 54 Asrama UBT"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://asrama.ubt.ac.id

# Enkripsi & Keamanan Sesi Cookie
SESSION_DRIVER=database
SESSION_LIFETIME=120
SESSION_ENCRYPT=true
SESSION_SECURE_COOKIE=true
SESSION_HTTP_ONLY=true
SESSION_SAME_SITE=lax

# Kredensial Database Production (Gunakan Password Kuat)
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=asrama_ubt_prod
DB_USERNAME=asrama_prod_user
DB_PASSWORD=GantiDenganPasswordSuperAman99#

DB_SIMABA_CONNECTION=mysql
DB_SIMABA_HOST=10.0.0.5
DB_SIMABA_PORT=3306
DB_SIMABA_DATABASE=u540633926_simaba
DB_SIMABA_USERNAME=u540633926_simaba
DB_SIMABA_PASSWORD=12345678Ab&
```

### 2. Optimasi Cache & Kinerja Produksi
Jalankan kompilasi cache untuk kecepatan eksekusi sub-milidetik:
```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
composer install --optimize-autoloader --no-dev
npm run build
```

### 3. Konfigurasi Web Server (Virtual Host Nginx)
Contoh blok server Nginx dengan proteksi SSL/TLS dan routing Inertia.js:
```nginx
server {
    listen 80;
    server_name asrama.ubt.ac.id;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name asrama.ubt.ac.id;

    root /var/www/asrama-ubt/public;
    index index.php index.html;

    ssl_certificate /etc/letsencrypt/live/asrama.ubt.ac.id/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/asrama.ubt.ac.id/privkey.pem;

    client_max_body_size 10M;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    # Blokir akses langsung ke file tersembunyi & konfigurasi
    location ~ /\.(?!well-known).* {
        deny all;
    }

    # Blokir akses langsung ke storage privat
    location ^~ /storage/app/private_kyc {
        deny all;
        return 403;
    }
}
```

### 4. Background Queue Worker (Notifikasi OTP WhatsApp & Email)
Gunakan `supervisor` pada server Linux untuk menjaga worker antrean tetap menyala:
```ini
[program:asrama-queue-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/asrama-ubt/artisan queue:work --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=2
redirect_stderr=true
stdout_logfile=/var/www/asrama-ubt/storage/logs/queue-worker.log
```

### 5. Penjadwal Tugas Rutin (Laravel Cron Job)
Tambahkan entri crontab sistem:
```bash
crontab -e
```
Isi dengan baris berikut:
```cron
* * * * * cd /var/www/asrama-ubt && php artisan schedule:run >> /dev/null 2>&1
```

### 6. Kebijakan Retensi Berkas e-KYC (*Garbage Collection*)
Sesuai aturan keamanan audit trail:
- Berkas e-KYC aktif disimpan permanen selama masa tinggal mahasiswa.
- Berkas draf e-KYC yang dibatalkan / mahasiswa tidak jadi mendaftar dibersihkan otomatis setelah 30–60 hari menggunakan scheduled task:
  ```bash
  php artisan kyc:prune-orphans --days=60
  ```

### 7. Strategi Backup Otomatis Basis Data
Jalankan skrip dump terjadwal setiap malam:
```bash
#!/bin/bash
BACKUP_DIR="/var/backups/asrama-db"
DATE=$(date +"%Y%m%d_%H%M%S")
mkdir -p $BACKUP_DIR

# Backup Database Utama
mysqldump -u root asrama_ubt_db | gzip > "$BACKUP_DIR/asrama_ubt_db_$DATE.sql.gz"

# Backup Database SIMABA
mysqldump -u root u540633926_simaba | gzip > "$BACKUP_DIR/u540633926_simaba_$DATE.sql.gz"

# Hapus backup lebih dari 30 hari
find $BACKUP_DIR -type f -name "*.sql.gz" -mtime +30 -delete
```

---

## 10. Pemecahan Masalah (*Troubleshooting Komprehensif*)

| Gejala Kendala | Kemungkinan Penyebab | Tindakan Solusi Konkret |
| :--- | :--- | :--- |
| `SQLSTATE[HY000] [2002] Connection refused` | Servis MySQL di Laragon belum berjalan. | Buka Laragon, pastikan tombol MySQL berwarna hijau (*Running* pada port 3306). |
| `Table 'u540633926_simaba.pendaftaranmahasiswa' doesn't exist` | Basis data SIMABA belum dimigrasikan/diseed. | Jalankan `php artisan db:seed --class=SimabaDatabaseSeeder` di terminal. |
| `Access denied for user 'u540633926_simaba'@'localhost'` | User database belum dibuat di MySQL lokal. | Jalankan `laragon-setup.bat` ulang atau jalankan query `CREATE USER` pada Bab 2. |
| `Table 'asrama_ubt_db.request_pembayaran' doesn't exist` | Migrasi database asrama belum dijalankan. | Buka terminal Laragon, jalankan `php artisan migrate:fresh --seed`. |
| Tombol verifikasi admin tidak memindahkan data | Status invoice masih `UNPAID` di database. | Pastikan bukti bayar diunggah dan aksi yang dipilih adalah `APPROVE_AND_MIGRATE`. |
| OTP WhatsApp tidak sampai pada lingkungan uji | Layanan gateway pihak ketiga belum aktif di lokal. | Gunakan kode sandbox universal pengujian: **`123456`**. |
| Pratinjau berkas e-KYC gagal dimuat (*403 Forbidden*) | Token *Signed URL* kedaluwarsa atau belum login. | Masuk sebagai staf admin yang berhak dan refresh halaman verifikasi berkas. |
| Perubahan kode frontend tidak tampil di browser | Cache build Vite atau browser belum ter-refresh. | Jalankan `npm run build` dan lakukan *hard reload* di browser (`Ctrl + Shift + R`). |
