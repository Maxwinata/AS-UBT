# Arsitektur Data & Strategi Integrasi Bridging Database Portal Asrama UBT

> **Pilihan Bahasa / Language:** 🇮🇩 **Bahasa Indonesia (Utama)** | [🇬🇧 English Version](ARCHITECTURE.en.md)

Dokumen ini memuat rancangan arsitektur basis data dan alur logika bridging integrasi antara **Frontend Mahasiswa Baru (Pendaftaran Otonom Mandiri)** dan **Web Admin Laravel (Pencatatan Master Berjalan)**, diselaraskan 100% dengan skema SQL Web Admin Laravel (`u540633926_asrama`).

---

## 1. Filosofi Pemisahan: Proses Otonom Mandiri vs Master Berjalan

Di lingkungan operasional Asrama UBT, terdapat dua domain pencatatan data yang memiliki batas wewenang yang tegas:

1. **Domain Otonom Mandiri Maba (`request_*`)**:
   - Ditujukan untuk mahasiswa baru yang mendaftar secara independen melalui aplikasi web portal.
   - Karena diisi mandiri tanpa campur tangan langsung staf di awal, seluruh baris data ditandai dengan **`operator_id = 0`**.
   - Berstatus *staging / pending* (`status = 0`, `status_verifikasi = 0`, `status_pembayaran = 'pending'`).
   - Mencegah data kotor atau pendaftaran yang batal masuk mengotori buku besar resmi asrama.

2. **Domain Master Berjalan Admin (`pembayaran`, `pembayaran_detail`, `transaksi`, `penyewa`)**:
   - Struktur pencatatan isi tabel saat sistem running normal, di mana pendaftaran, penetapan tagihan, dan mutasi kas dilakukan/disahkan oleh staf admin asrama dan keuangan.
   - Seluruh baris data memiliki **`operator_id = ID Admin`** (akuntabilitas staf yang memverifikasi).
   - Menjadi *single source of truth* untuk laporan keuangan yayasan/universitas, audit BPK/internal, dan data operasional hunian aktif.

---

## 2. Analisa 3 Tabel Baru Bridging Pendaftaran Otonom

Tiga tabel baru berawalan `request_` berfungsi sebagai jembatan (*bridging interface*) antara frontend maba dengan database backend web admin:

### A. Tabel `request_pembayaran` (Staging Header Tagihan Mandiri)
Menampung komitmen awal tagihan saat Maba memilih kamar, durasi sewa (6/12 bulan), dan skema cicilan deposit.
- **Primary Key (PK)**: `id` (BIGINT AUTO_INCREMENT)
- **Unique Key (UK)**: `no_request` (VARCHAR 50, cth: `REQ-202610-0142`)
- **Foreign Key (FK)**:
  - `penyewa_id` ➔ mengarah ke `penyewa.id`
  - `kamar_id` ➔ mengarah ke `kamar.id`
- **Atribut Operasional**:
  - `tanggal_masuk`, `tanggal_keluar`, `durasi`
  - `total_tagihan`, `total_potongan_harga`, `total_bayar`
  - `status_pembayaran` (default: `'pending'`)
  - `status_verifikasi` (default: `0` = Menunggu Review Admin, `1` = Disahkan)
  - `operator_id` (default: `0` = Maba Mandiri)

### B. Tabel `request_pembayaran_detail` (Staging Rincian Item Tarif)
Menampung breakdown komponen biaya tagihan pendaftaran agar transparan dan sesuai dengan SK Tarif.
- **Primary Key (PK)**: `id` (BIGINT AUTO_INCREMENT)
- **Foreign Key (FK)**:
  - `no_request` ➔ mengarah ke `request_pembayaran.no_request` (Indexed)
  - `harga_id` ➔ mengarah ke master tarif (`harga.id` / `tariff.id`)
- **Atribut Rincian**:
  - Baris 1: Sewa Asrama (`jenissewa = 'Sewa Asrama'`, `harga = 500000`, `qty = 6/12`, `jumlah_pembayaran = sewa_total`)
  - Baris 2: Deposit Jaminan (`jenissewa = 'Deposit Jaminan Hunian'`, `harga = 500000/1000000`, `qty = 1`)
  - Baris 3: Fasilitas Awal (`jenissewa = 'Biaya Administrasi & Fasilitas Awal'`, `harga = 100000`, `qty = 1`)

### C. Tabel `request_transaksi` (Staging Bukti & Mutasi Bayar Mandiri)
Menampung unggahan struk transfer manual atau notifikasi awal transaksi yang dilakukan oleh Maba.
- **Primary Key (PK)**: `id` (BIGINT AUTO_INCREMENT)
- **Foreign Key (FK)**:
  - `no_request` ➔ mengarah ke `request_pembayaran.no_request` (Indexed)
- **Atribut Mutasi**:
  - `no_transaksi` (VARCHAR 50, sementara cth: `TRX-REQ-202610-0142`)
  - `tanggal_transaksi` (DATETIME)
  - `jumlah_uang` (DECIMAL 15,2)
  - `metode_pembayaran` (VARCHAR 255, cth: `'Transfer Manual Bank BSI'`)
  - `file_bukti` (VARCHAR 100, path berkas struk di storage privat)
  - `operator_id` (`0` = Maba Mandiri)

---

## 3. Matriks Pemetaan Kolom: Staging ➔ Master Berjalan (Field-by-Field)

Saat Admin Keuangan/Asrama menekan tombol **"Verifikasi & Sahkan ke Master" (Approve & Promote)**, sistem mengeksekusi migrasi atomik (Database Transaction) berikut:

| No | Tabel Sumber (Staging Otonom) | Field Sumber | Tabel Target (Master Berjalan) | Field Target | Aturan Transformasi / Catatan |
|---|---|---|---|---|---|
| 1 | `request_pembayaran` | `no_request` | `pembayaran` | `no_invoice` | **Digenerate baru** oleh sistem admin (cth: `INV-202610-0012`). |
| 2 | `request_pembayaran` | `penyewa_id` | `pembayaran` | `penyewa_id` | Disalin 1:1 langsung. |
| 3 | `request_pembayaran` | `kamar_id` | `pembayaran` | `kamar_id` | Mengunci plotting kamar secara resmi di master. |
| 4 | `request_pembayaran` | `durasi`, `tanggal_masuk`, `tanggal_keluar` | `pembayaran` | `durasi`, `tanggal_masuk`, `tanggal_keluar` | Disalin 1:1 langsung. |
| 5 | `request_pembayaran` | `total_tagihan`, `total_bayar` | `pembayaran` | `total_tagihan`, `total_bayar` | Disalin 1:1 langsung. |
| 6 | `request_pembayaran` | `status_pembayaran` | `pembayaran` | `status_pembayaran` | Berubah dari `'pending'` menjadi `'paid'`. |
| 7 | `request_pembayaran` | `operator_id = 0` | `pembayaran` | `operator_id` | **Diisi ID Staf Admin** yang melakukan approval (`auth()->id()`). |
| 8 | `request_pembayaran_detail` | `no_request` | `pembayaran_detail` | `no_invoice` | Diikat ke `no_invoice` resmi yang baru diterbitkan. |
| 9 | `request_pembayaran_detail` | `harga_id`, `jenissewa`, `harga`, `qty`, `jumlah_pembayaran` | `pembayaran_detail` | `harga_id`, `jenissewa`, `harga`, `qty`, `jumlah_pembayaran` | Seluruh baris rincian tarif diduplikasi 1:1. |
| 10 | `request_transaksi` | `no_request` | `transaksi` | `no_invoice` | Diikat ke `no_invoice` resmi. |
| 11 | `request_transaksi` | `penyewa_id` (via req) | `transaksi` | `penyewa_id` | Diisi ID penyewa terkait. |
| 12 | `request_transaksi` | `no_transaksi` | `transaksi` | `no_transaksi` | Diterbitkan nomor mutasi kas resmi (cth: `TRX-202610-0012`). |
| 13 | `request_transaksi` | `jumlah_uang`, `tanggal_transaksi`, `file_bukti` | `transaksi` | `jumlah_uang`, `tanggal_transaksi`, `file_bukti` | Disalin 1:1 ke mutasi buku kas resmi. |
| 14 | - | - | `transaksi` | `jenis_transaksi` | Diisi default `'Asrama'`. |
| 15 | `request_transaksi` | `operator_id = 0` | `transaksi` | `operator_id` | **Diisi ID Staf Admin** yang memverifikasi. |
| 16 | `penyewa` | `status = 0`, `status_asrama = 0` | `penyewa` | `status = 1`, `status_asrama = 1` | Status penyewa diaktifkan menjadi penghuni resmi. |
| 17 | `request_pembayaran` | `status_verifikasi = 0` | `request_pembayaran` | `status_verifikasi = 1` | Status staging diperbarui; mencatat `tanggal_verifikasi = now()`. |

---

## 4. Alur Siklus Pendaftaran & Concurrency Kamar

```
[ FRONTEND MABA ]
       │
       ▼ (1. Isi Biodata Profil)
INSERT / UPDATE penyewa (status = 0, operator_id = 0)
       │
       ▼ (2. Pilih Kamar & Konfigurasi Tagihan)
INSERT request_pembayaran (no_request, operator_id = 0)
INSERT request_pembayaran_detail (rincian sewa, deposit, admin)
       │
       ▼ (3. Unggah Struk Bukti Bayar)
INSERT request_transaksi (file_bukti, jumlah_uang, operator_id = 0)
       │
       ▼ (Status: Menunggu Review Keuangan)
─────────────────────────────────────────────────────────────
[ WEB ADMIN LARAVEL DASHBOARD ]
       │
       ▼ (4. Admin Keuangan Review Kode Unik & Mutasi Rekening)
Klik: "Approve & Sahkan ke Master (Promote)"
       │
       ├──► INSERT pembayaran (no_invoice resmi, operator_id = Admin ID)
       ├──► INSERT pembayaran_detail (diikat ke no_invoice)
       ├──► INSERT transaksi (buku kas resmi, operator_id = Admin ID)
       ├──► UPDATE penyewa (status = 1, status_asrama = 1)
       └──► UPDATE request_pembayaran (status_verifikasi = 1, status_pembayaran = 'paid')
       │
       ▼ (5. Kamar Resmi Terisi & Kuota Berkurang Permanen)
Kapasitas Tersedia = kamar.kapasitas - COUNT(transaksi.kamar_id)
       │
       ▼ (6. Frontend Maba Menerima Tiket Masuk & BASTK)
Maba menandatangani kontrak digital dan menerima e-Ticket QR Code.
```

---

## 5. Ringkasan Relasi Kunci (PK / FK)

- **`penyewa`**:
  - `id` (PK)
  - `nim` (UK)
- **`request_pembayaran`**:
  - `id` (PK)
  - `no_request` (UK)
  - `penyewa_id` ➔ FK ke `penyewa.id`
  - `kamar_id` ➔ FK ke `kamar.id`
- **`request_pembayaran_detail`**:
  - `id` (PK)
  - `no_request` ➔ FK ke `request_pembayaran.no_request`
  - `harga_id` ➔ FK ke master tarif
- **`request_transaksi`**:
  - `id` (PK)
  - `no_request` ➔ FK ke `request_pembayaran.no_request`
- **`pembayaran`**:
  - `id` (PK)
  - `no_invoice` (UK)
  - `penyewa_id` ➔ FK ke `penyewa.id`
  - `kamar_id` ➔ FK ke `kamar.id`
- **`pembayaran_detail`**:
  - `id` (PK)
  - `no_invoice` ➔ FK ke `pembayaran.no_invoice`
- **`api_link`**:
  - `id` (PK)
  - `kategori` (`nonkip` / `kip`)
  - `link` (URL endpoint SIAKAD)
- **`siakad_mahasiswa_stg`**:
  - `id` (PK)
  - `api_link_id` ➔ FK ke `api_link.id`
  - `nomor_registrasi` (UK, No PMB / NIM Calon)
  - `status_klaim` (0 = Belum Registrasi Asrama, 1 = Telah Mengisi Formulir)
  - `status_verifikasi_subsidi` (0 = Menunggu Review, 1 = Disetujui, -1 = Standar)

---

## 6. Arsitektur Integrasi API SIAKAD UBT (api_link & siakad_mahasiswa_stg)

### A. Endpoint Terdaftar
Sistem mengintegrasikan dua endpoint resmi dari pangkalan data SIAKAD UBT:
1. **Beasiswa Khusus / Non-KIP**: `https://siakad.ubtsu.ac.id/api/mahasiswa-btt-006` (Kategori: `nonkip`)
2. **KIP-Kuliah**: `https://siakad.ubtsu.ac.id/api/mahasiswa-btt-002` (Kategori: `kip`)

### B. Alur Penarikan & Staging Data
```
[ SERVER SIAKAD UBT ]
       │
       ▼ (Cron Worker / Manual Trigger Admin)
[ LARAVEL BACKEND: SiakadSyncService ]
       │
       ▼ (Upsert Payload JSON)
[ TABEL STAGING: siakad_mahasiswa_stg ]
       │
       ├─────────────────────────────────┐
       ▼                                 ▼
[ FRONTEND MABA ]               [ WEB ADMIN KEUANGAN ]
- Auto-fill biodata saat login   - Panel Manajemen API SIAKAD
- Deteksi otomatis beasiswa     - Audit kelayakan subsidi (1-Klik)
- Validasi data pendaftaran     - Proteksi audit keuangan kampus
```

### C. Auto-Fill Formulir & Tata Kelola Subsidi
1. **Auto-Fill Saat Login**: Saat calon mahasiswa memasukkan Nomor Registrasi PMB (misal: `PMB2026-08942` atau `PMB-BTT-002-001`), frontend secara instan mencocokkan ke `siakad_mahasiswa_stg` dan mengisi otomatis: Nama Lengkap, NIK, No. HP, Program Studi, Fakultas, dan Kategori Beasiswa.
Dengan arsitektur ini, integrasi database antara kemandirian pendaftaran Maba, sinkronisasi SIAKAD, dan kepatuhan akuntansi Web Admin berjalan harmonis tanpa risiko inkonsistensi data.

---

## 7. Arsitektur Penyimpanan Privat Berkas e-KYC & Jejak Audit Forensik (RULE[AGENTS_md])

Sesuai dengan ketentuan ketat kepatuhan sistem dan audit forensik pendaftaran (`RULE[AGENTS_md]`), tata kelola berkas identitas e-KYC (KTP & Selfie) diimplementasikan melalui arsitektur khusus:

### A. Matriks Pemetaan Entitas e-KYC & Audit Trail

| No | Entitas Database | Field Kunci | Tipe Data & Sifat | Fungsi & Aturan Arsitektur |
|---|---|---|---|---|
| 1 | `kyc_documents` | `file_name` | `VARCHAR(255)` | Format berversi unik: `ktp_{nim}_v{version}_{timestamp}.{ext}`. |
| 2 | `kyc_documents` | `file_version` | `INT UNSIGNED` | **Immutable Versioning**: Tidak boleh menimpa (*no overwrite*) berkas lama saat mahasiswa melakukan koreksi. |
| 3 | `kyc_documents` | `is_active_version` | `BOOLEAN` | Hanya bernilai `true` untuk versi mutakhir yang sedang di-review/disetujui. |
| 4 | `kyc_documents` | `storage_disk` | `VARCHAR(50)` | Default `private_kyc` (Strictly Private Bucket / Non-public Storage). |
| 5 | `kyc_documents` | `file_hash` | `CHAR(64)` | Checksum SHA-256 untuk memvalidasi integritas berkas dari manipulasi bit data. |
| 6 | `kyc_documents` | `retention_until` | `DATE` | **Garbage Collection Policy**: Jadwal penghapusan otomatis setelah 60 hari untuk berkas versi lama/tergantikan (*orphaned*). |
| 7 | `modification_logs` | `trackable_type` & `trackable_id` | `VARCHAR` & `BIGINT` | Relasi polymorphic ke entitas yang diubah (`maba_profiles`, `kyc_documents`, dll). |
| 8 | `modification_logs` | `action` | `VARCHAR(100)` | Kode aksi: `KYC_INITIAL_UPLOAD`, `KYC_CORRECTION_RESUBMIT`, `KYC_VERIFICATION_APPROVAL`. |
| 9 | `modification_logs` | `old_values` & `new_values` | `JSON` | Snapshot kondisi sebelum dan sesudah perubahan data untuk kebutuhan investigasi. |
| 10 | `modification_logs` | `ip_address` & `user_agent` | `VARCHAR(45)` & `TEXT` | Jejak koneksi aktor pengubah data (Mahasiswa / Staf Admin / Sistem). |

### B. Alur Akses Berkas Privat (Temporary Signed URL)
1. **Penyimpanan Tertutup**: Berkas KTP dan Selfie disimpan di direktori privat non-publik (`storage/app/private_kyc/kyc/{nim}/`). Berkas **tidak dapat diakses langsung via URL statis** (`/storage/...`).
2. **Signed URL Berdurasi Terbatas**: Admin atau mahasiswa yang berhak melihat berkas meminta token akses sementara dari backend API via controller `KycStorageService::getTemporaryViewUrl()`.
3. **Masa Berlaku 15 Menit**: Signed URL kadaluarsa dalam 15 menit, mencegah kebocoran link identitas sensitif (kepatuhan UU Perlindungan Data Pribadi).

