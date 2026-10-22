# Blueprint Kesiapan Produksi: Siklus Penuh Registrasi, Booking Asrama, & Integrasi Hostinger (Masa Tenggang 48 Jam)

Rencana komprehensif ini menyusun seluruh aspek teknis, regulasi, dan pengalaman pengguna (UX) yang wajib dipastikan agar proses registrasi dan booking asrama berfungsi secara normal, aman, dan aplikatif di lingkungan produksi Hostinger (berdampingan dengan SIDARA, SIMABA, dan Admin Asrama).

---

## Tinjauan Pengguna & Keputusan Kunci

> [!IMPORTANT]
> Berdasarkan arahan terbaru Anda, batas waktu reservasi disesuaikan menjadi **48 jam**:
> 1. **Prioritas Bertahap**: Mengintegrasikan seluruh aspek produksi (keamanan berkas, pembayaran, auto-release, dan notifikasi) secara terstruktur.
> 2. **Siklus Auto-Release 48 Jam (2 Hari Kalender)**: Kamar berstatus `BOOKED_STAGING` akan otomatis dilepas kembali ke pool kamar umum jika pembayaran dan konfirmasi tidak diselesaikan dalam kurun waktu **48 jam** sejak invoice diterbitkan. Mahasiswa diberikan waktu yang cukup untuk verifikasi transfer bank mandiri atau pembayaran virtual account.
> 3. **Infrastruktur Hostinger**: Penyimpanan berkas sensitif KTP dan swafoto dikelola pada direktori privat server Hostinger (di luar `public_html`), diakses melalui *stream controller* dengan token otorisasi berumur singkat, serta dilengkapi kebijakan *versioning* berkas agar rekam jejak audit (*Audit Trail*) tidak tertimpa.

- **Keputusan Terkonfirmasi 1 (Masa Berlaku 48 Jam)**: Periode penahanan kamar berlaku selama 48 jam dengan notifikasi pengingat otomatis pada 12 jam sebelum tenggat berakhir.
- **Keputusan Terkonfirmasi 2 (Infrastruktur Hostinger)**: Memanfaatkan stack Apache/Nginx + PHP 8.2 (Laravel) + MySQL yang sudah berjalan untuk SIMABA & SIDARA.
- **Keputusan Terkonfirmasi 3 (Manajemen KYC Aman)**: Menyimpan berkas di `storage/app/private/kyc/{nim}/` dengan penamaan bertanggal (`ktp_{nim}_{timestamp}_{hash}.jpg`) untuk menjamin kepatuhan audit.

---

## 1. Ikhtisar & 4 Pilar Kesiapan Produksi

Untuk beralih dari lingkungan simulasi ke operasional harian yang andal, terdapat 4 pilar yang harus dipastikan bekerja harmonis:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                     4 PILAR KESIAPAN PRODUKSI ASRAMA UBT (HOSTINGER)                   │
└────────────────────────────────────────────────────────────────────────────────────────┘

 ┌─────────────────────────┐  ┌─────────────────────────┐  ┌─────────────────────────┐  ┌─────────────────────────┐
 │   1. KEAMANAN KYC       │  │   2. AUTO-RELEASE 48H   │  │   3. PAYMENT GATEWAY    │  │   4. WHATSAPP GATEWAY   │
 │                         │  │                         │  │                         │  │                         │
 │ • Direktori Non-Public  │  │ • Lock Kamar 48 Jam     │  │ • Concurrency Lock DB   │  │ • OTP Legal Dokumen F-19│
 │ • File Versioning       │  │ • Timer Countdown UX    │  │ • Webhook Notifikasi    │  │ • Kwitansi & e-Ticket   │
 │ • Short-Lived Stream    │  │ • Cron Pelepasan Kuota  │  │ • Idempotensi Transaksi │  │ • Pengingat H-12 Jam    │
 └─────────────────────────┘  └─────────────────────────┘  └─────────────────────────┘  └─────────────────────────┘
```

1. **Pilar 1: Keamanan Berkas Identitas (e-KYC) & Integritas Jejak Audit**:
   - Berkas KTP dan swafoto tidak dapat diakses langsung melalui URL publik browser.
   - Koreksi data oleh mahasiswa tidak boleh menimpa file lama agar rekam jejak admin di *Audit Trail View* tetap valid.
2. **Pilar 2: Manajemen Reservasi & Auto-Release Kamar 48 Jam**:
   - Memberikan kelonggaran wajar 48 jam (2 hari) bagi calon mahasiswa dan orang tua untuk menyelesaikan transaksi pembayaran bank (terutama saat akhir pekan atau kliring antardaerah).
   - Menghindari kamar terkunci permanen jika calon mahasiswa membatalkan pendaftaran.
3. **Pilar 3: Keandalan Transaksi Pembayaran & Concurrency Lock**:
   - Menjamin 2 mahasiswa tidak dapat memilih/membayar 1 slot tempat tidur yang sama pada milidetik yang bersamaan (*race condition*).
   - Verifikasi mutasi otomatis via IPN/Webhook Bank atau rekonsiliasi manual oleh Admin Keuangan.
4. **Pilar 4: Notifikasi Terpadu & Otentikasi OTP WhatsApp**:
   - Validasi nomor kontak aktif untuk penandatanganan Kontrak Hunian (F-19) & Pakta Integritas (F-02).
   - Pengiriman otomatis PDF e-Ticket dan panduan kedatangan saat pembayaran terverifikasi.

---

## 2. Pengalaman Pengguna (UX) & Desain Antarmuka

Mengikuti pedoman *Universal Frontend Design Constitution* (antarmuka bersih, tanpa elemen dekoratif buatan, dan penataan tipografi bermakna):

### A. Indikator Waktu Reservasi Kamar (48-Hour Expiration Banner)
- **Letak**: Ditampilkan pada Tahap 2 (Skema Pembayaran) dan Tahap 3 (Pembayaran & Tagihan).
- **Format**: Komponen bilah informasi monokromatik/amber elegan dengan angka tabular (`font-mono tabular-nums`):
  ```
  Sisa Waktu Reservasi Kamar 204: 47 jam 58 menit 30 detik · Batas Akhir: 23 Okt 2026, 09:30 WIB
  ```
- **Aksi Cerdas**: Jika waktu 48 jam terlewati tanpa pembayaran/bukti setor, sistem menampilkan status `EXPIRED` secara ramah dengan tombol satu-klik: `"Pilih Ulang Kamar & Buat Permintaan Baru"`.

### B. Pratinjau Berkas e-KYC Terproteksi (Secure Stream Viewer)
- Gambar KTP dan selfie mahasiswa pada portal admin dan dashboard mahasiswa dimuat melalui URL blob yang aman:
  `GET /api/maba/kyc/stream?file={encrypted_name}&expires={timestamp}&token={hmac}`
- Gambar dilindungi dari *hotlinking* pihak ketiga dan tidak memiliki indeks publik di mesin pencari.

### C. Status Tagihan & Riwayat Pembayaran Bersih
- Tidak menggunakan lencana statis berlapis-lapis; rincian tagihan menggunakan tabel tipografi berjarak rapi dengan format mata uang rupiah standar (`IDR`).

---

## 3. Keputusan Produk & Arsitektur Teknis

### A. Arsitektur Penyimpanan Hostinger (Laravel / PHP)

```
/home/u1234567/
  ├── domains/
  │    └── asrama.ubtsu.ac.id/
  │         ├── public_html/          <-- HANYA index.php, assets, css, js (Public Web Root)
  │         │    └── uploads/temp/    <-- File upload sementara sebelum divalidasi
  │         │
  │         └── storage/app/private/  <-- DI LUAR public_html (Aman & Tidak Terjangkau Publik)
  │              └── kyc/
  │                   ├── 260108001/  <-- Folder terisolasi per NIM/No. Pendaftaran
  │                   │    ├── ktp_260108001_v1_1729501200.jpg
  │                   │    ├── ktp_260108001_v2_1729504800.jpg  (Koreksi tetap tersimpan untuk audit)
  │                   │    └── selfie_260108001_v1_1729501200.jpg
  │                   └── 260727002/
```

- **Mekanisme Akses**:
  Controller Laravel membaca file dari direktori privat dan mengalirkan respons biner (*stream response*) hanya jika sesi login user cocok atau role adalah `admin_asrama` / `admin_keuangan`.
- **Kebijakan Retensi (Garbage Collection)**:
  Cron job bulanan membersihkan berkas draf yang tidak pernah di-submit melewati 30 hari untuk mencegah kepenuhan ruang penyimpanan Hostinger.

### B. Siklus Transisi Status Kamar & Pembayaran (Tenggat 48 Jam)

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                     SIKLUS STATUS RESERVASI KAMAR & INVOICE (48 JAM)                   │
└────────────────────────────────────────────────────────────────────────────────────────┘

 [MAHASISWA TAHAP 1 SELESAI]
              │
              ▼
    (Pilih Skema Sewa) ──▶ [KAMAR: BOOKED_STAGING] ──▶ Invoice UNPAID (Timer 48 Jam Aktif)
                                     │                               │
                ┌────────────────────┴────────────────┐              │
                ▼                                     ▼              ▼
     [Bayar dalam 48 Jam]                  [Lewat 48 Jam Belum Bayar]
                │                                     │
                ▼                                     ▼
     Admin / Gateway Approve               CRON: Auto-Release Triggered
                │                                     │
                ▼                                     ▼
    [KAMAR: OCCUPIED_MASTER]              [KAMAR: AVAILABLE (Kembali ke Pool)]
    • Invoice: PAID                       • Invoice: EXPIRED
    • e-Ticket: ACTIVE                    • Kamar dibuka untuk pendaftar lain
    • BASTK: Siap Diunduh                 • Mahasiswa dapat memilih ulang kamar
```

### C. Pencegahan Double-Booking (Database Concurrency Lock)
Pada saat mahasiswa memilih kamar di Tahap 2, query database menggunakan transaksi dengan penguncian baris (*Pessimistic Locking*) dan durasi tenggat 48 jam:
```sql
START TRANSACTION;
SELECT id, status, terisi, kapasitas 
FROM kamar 
WHERE id = :kamar_id FOR UPDATE;

-- Validasi kuota ketersediaan tempat tidur
UPDATE kamar SET terisi = terisi + 1 WHERE id = :kamar_id;
INSERT INTO booking_staging (nim, kamar_id, expires_at) 
VALUES (:nim, :kamar_id, NOW() + INTERVAL 48 HOUR);
COMMIT;
```

---

## 4. Rencana Kerja Implementasi Bertahap

### Tahap 1: Antarmuka Timer Reservasi 48 Jam & Manajemen Status Expired (Frontend Prototype)
1. Menambahkan atribut `expiresAt` pada state `BillingInvoice` (48 jam sejak invoice dibuat).
2. Membangun visual *Countdown Timer 48 Jam* yang tenang, stabil, dan presisi di Tahap 2 & 3 Dashboard Maba.
3. Menambahkan status simulasi `EXPIRED` pada sandbox untuk menguji skenario kamar dilepas otomatis setelah 48 jam dan tata cara mahasiswa melakukan booking ulang.

### Tahap 2: Standardisasi Penyimpanan Berkas KYC & Integrasi Stream Hostinger
1. Memperbarui mock & helper pengunggahan agar menghasilkan format nama berkas versioning (`ktp_{nim}_{timestamp}.jpg`).
2. Menyiapkan skema endpoint dan dokumentasi controller Laravel untuk *secure streaming* KTP & selfie di server Hostinger.
3. Memastikan komponen Audit Trail mencatat riwayat versi dokumen secara kronologis.

### Tahap 3: Simulasi Webhook Pembayaran & Pelepasan Kuota Otomatis
1. Menambahkan tombol simulasi pemicu Cron Auto-Release di panel Admin Asrama (untuk menguji pelepasan kamar kedaluwarsa lewat 48 jam).
2. Mengintegrasikan simulasi notifikasi WhatsApp pengingat pada H-12 jam sebelum kamar dilepas.

---

## 5. Verifikasi & Pengujian Kesiapan

1. **Uji Transparansi Timer**: Memastikan mahasiswa melihat sisa waktu pembayaran dengan basis 48 jam dalam format jam:menit:detik yang stabil tanpa jitter.
2. **Uji Versioning Audit Trail**: Melakukan koreksi foto KTP dan memastikan foto lama tetap tercatat dalam log riwayat tanpa tertimpa.
3. **Uji Auto-Release 48 Jam**: Memajukan waktu simulasi lewat 48 jam dan memastikan kamar kembali terbuka untuk mahasiswa lain.
4. **Kompilasi & Linting**: Memastikan tidak ada error TypeScript (`tsc --noEmit`) dan build aplikasi berjalan sempurna.
