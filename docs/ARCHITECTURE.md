# Arsitektur Data & Logika Bisnis (Logic Chart) Portal Asrama UBT

> **Pilihan Bahasa / Language:** 🇮🇩 **Bahasa Indonesia (Utama)** | [🇬🇧 English Version](ARCHITECTURE.en.md)

Dokumen ini memuat rancangan arsitektur basis data dan alur logika sistem (Backend) untuk membawa purwarupa Portal Asrama UBT ke tahap produksi, **diselaraskan dengan skema database dari Sistem Admin Asrama (Manajemen Hunian) yang sudah ada**.

Karena database web portal ini akan berinteraksi dengan tabel-tabel tersebut, sistem portal Maba akan melakukan operasi *staging* (Baca/Tulis) ke struktur tabel *existing* berikut untuk diproses lebih lanjut oleh Admin Asrama.

## 1. Pemetaan Skema Basis Data (Sistem Manajemen Hunian ERD)

Berdasarkan *existing database*, berikut adalah pemetaan entitas yang akan digunakan oleh aplikasi *Front-End* Maba:

### A. Tabel `staging_penyewa` & `penyewa` (Data Mahasiswa/Maba)
Tabel profil pendaftar dipisahkan menjadi dua lapisan untuk memastikan kelengkapan data.
- **`staging_penyewa` (Portal Area)**: Digunakan saat Maba berproses di web portal. Data di tabel ini **di-sync/download secara berkala dari API SIAKAD** pada setiap fase pendaftaran, karena data awal seringkali belum lengkap.
- **`penyewa` (Master Admin)**: Tabel master yang bersih dan lengkap. Aturan migrasi dari *staging*: 
  1. **Mahasiswa Baru (Maba)**: Migrasi HANYA terjadi jika tagihan pendaftaran sudah berstatus LUNAS.
  2. **Mahasiswa Eksisting (SSO)**: Jika saat dicek Maba/Mahasiswa berstatus **"Bukan Penghuni"**, maka migrasi/update data ke tabel master tetap **menunggu tagihan berstatus LUNAS**. Data tidak akan mengotori tabel master jika mereka sekadar login dan membatalkan pendaftaran.
- Field penting: `nim`, `nama`, `jenis_kelamin` (filter gedung), `no_hp` (OTP), relasi akademik.

### B. Tabel `tipe_asrama`, `lantai`, dan `kamar` (Infrastruktur Asrama)
Tabel relasional untuk menampung data gedung dan kamar yang bisa dipilih saat *Room Plotting*.
- **`tipe_asrama`**: Gedung asrama (Misal: Asrama Putra, Asrama Putri). Memiliki field `jenis_kelamin`.
- **`lantai`**: Mengatur hierarki lantai di setiap gedung.
- **`kamar`**: Menyimpan detail kamar, termasuk `tipe_asrama_id`, `lantai_id`, `nomor` kamar, dan `kapasitas` (jumlah maksimal ranjang).

### C. Tabel `transaksi` & `request_transaksi` (Sistem Booking & Plotting)
Alih-alih menggunakan tabel `beds` secara terpisah, *concurrency* (perebutan kuota) dihitung berdasarkan jumlah `transaksi` aktif dalam suatu `kamar`.
- **`request_transaksi`**: Digunakan saat Maba melakukan plot kamar (Langkah 4). Mengunci kuota kamar sementara.
- **`transaksi`**: Data konfirmasi saat tagihan sudah dibayar. Mencatat `penyewa_id` yang terikat pada `kamar_id` beserta `tgl_masuk` dan `status`.
- *Logic Concurrency*: Kapasitas Tersedia = `kamar.kapasitas` - (Jumlah `transaksi` aktif + `request_transaksi` pending di `kamar_id` tersebut).

### D. Tabel Keuangan (`tagih`, `request_pembayaran`, `pembayaran`, `deposit`)
Menangani pembuatan Invoice (Langkah 2 & 3).
- **`tagih` / `harga`**: Komponen dasar biaya (sewa, perlengkapan).
- **`request_pembayaran`**: Tabel *staging* saat sistem menerbitkan tagihan (Invoice) dengan *kode unik* ke Maba sebelum dana ditransfer. Mencatat `no_request`, `nominal`, dan `status`.
- **`pembayaran`**: Data permanen saat *Webhook* mutasi bank mendeteksi dana masuk. Mengubah status di `request_pembayaran` menjadi lunas (`status_bayar = 1`).
- **`deposit` & `deposit_pembayaran`**: Mengelola *logic* skema cicilan/lunas deposit terpisah dari biaya sewa utama.

---

## 2. Alur Logika Sistem (Logic Chart Web Portal Staging)

### Alur 1: Autentikasi & e-KYC (Sinkronisasi SIAKAD)
1. **Frontend:** Maba *Login* menggunakan Nomor PMB/NIM.
2. **Backend (SSO/SIAKAD):** Memvalidasi status Maba dan men-download/sync profil terbaru dari SIAKAD.
3. **Backend Asrama:** Melakukan `UPSERT` ke tabel **`staging_penyewa`**.
4. **Proses Berkelanjutan:** Di setiap perpindahan langkah di web portal, *Backend* kembali melakukan *sync* dari SIAKAD ke `staging_penyewa` untuk memastikan kekosongan data di master terisi secara bertahap seiring berjalannya pendaftaran Maba di kampus.

### Alur 2: *Concurrency* Plotting Kamar (Tabel `request_transaksi`)
1. **Frontend:** Maba meminta list kamar yang tersedia (Langkah 4).
2. **Backend:** *Query* tabel `kamar` yang `tipe_asrama.jenis_kelamin` cocok dengan Maba. Hitung kuota: `kapasitas` - `COUNT(transaksi.kamar_id)`.
3. **Frontend:** Maba memilih Kamar 101.
4. **Backend:** Mem-buat entri di tabel `request_transaksi` (Booking) dengan batas waktu tertentu (misal 24 Jam). Hal ini akan mengurangi sisa kuota yang bisa dilihat Maba lain.
5. **Cron Job:** Menghapus `request_transaksi` jika melewati batas waktu tanpa ada entri di tabel `pembayaran`.

### Alur 3: Penerbitan Tagihan & Webhook (Tabel `request_pembayaran`)
1. **Backend:** Setelah `request_transaksi` dibuat, sistem mem-buat entri `request_pembayaran` (Sewa + Perlengkapan + Kode Unik) dan `deposit_pembayaran` (Jika ada skema deposit).
2. **Frontend:** Menampilkan Nominal + Kode Unik kepada Maba (Langkah 3).
3. **Webhook (Bank/Payment Gateway):** Saat dana masuk, PING ke Backend.
4. **Backend:** *Query* `request_pembayaran` berdasarkan nominal bersih (termasuk kode unik). Jika cocok, buat data di `pembayaran` dan konversi `request_transaksi` menjadi `transaksi` permanen.

### Alur 4: Tanda Tangan Digital & e-Ticket
1. **Backend:** Saat Maba meminta OTP (Langkah 5), kirim pesan WA ke `penyewa.no_hp`.
2. **Frontend:** Maba memasukkan OTP.
3. **Backend:** Verifikasi OTP. Jika benar, catat stempel waktu persetujuan.
4. **Frontend:** Terbitkan e-Ticket dengan data `transaksi.id`, `penyewa.nim`, dan `kamar.nomor` (dapat ditambahkan parameter *Hash* rahasia agar QR Code aman).

### Alur 5: Kepatuhan Hukum & Kontrak Elektronik Kolektif (Hibrida)
Berdasarkan Pasal 39 Peraturan Asrama dan Pasal 11 UU ITE, serta mematuhi UU Bea Meterai No. 10/2020 tentang efisiensi meterai fisik, portal ini mengadopsi arsitektur **"Master Kontrak Kolektif (Hibrida Digital-Fisik) & WhatsApp Gateway"**. Arsitektur ini bertujuan menghemat biaya dengan mencetak 1 Master Agreement massal yang dibubuhi 1 meterai fisik Rp10.000 untuk batch mahasiswa.

**1. Alur Tanda Tangan Dokumen Mahasiswa (Persetujuan Masuk Batch Kolektif)**
1. **Generate OTP (Internal)**: Saat Maba menekan tombol "Kirim OTP", sistem Laravel secara mandiri menghasilkan 6-digit angka acak dan menyimpannya (kedaluwarsa 5 menit).
2. **Delivery (Pihak Ketiga)**: Laravel memanggil API Gateway WhatsApp untuk mengirimkan OTP ke HP mahasiswa (dan Wali jika disyaratkan).
3. **Validasi & Persetujuan Khusus (Internal)**: Mahasiswa menginput OTP sambil menyetujui klausul spesifik pemberian kuasa agar identitasnya dimasukkan ke Lampiran Dokumen Perjanjian Kolektif.
4. **Penyegelan Antrean (Internal)**: Sistem mencatat *Audit Trail* (Waktu, IP, Nomor WA, Metode Otentikasi) dan memasukkan mahasiswa ke antrean *"Batch Bulan Ini"*.

**2. Alur Pengesahan Master Kontrak (Fisik-Digital)**
1. **Sistem Batching**: Pada waktu *cut-off* tertentu (misal akhir bulan/kuota 50), backend Laravel mengompilasi data mahasiswa menjadi satu file PDF tunggal (Kontrak Induk + Tabel Daftar Penghuni di bagian lampiran).
2. **Eksekusi Fisik (Admin)**: Pengelola mengunduh dan mencetak PDF tersebut. Satu lembar Meterai Fisik Rp10.000 ditempelkan di akhir lembar tabel kolektif dan ditandatangani basah oleh Pengelola.
3. **Digitalisasi & Distribusi (Sistem)**: Dokumen fisik yang telah sah di-scan dan diunggah kembali ke sistem. Sistem secara otomatis mendistribusikan salinan *Master Kontrak* ini ke dasbor seluruh mahasiswa yang berada di batch tersebut sebagai bukti hukum yang sah.

**3. Alur Revisi Nomor WA Wali yang Tidak Akurat (Pasal 39 Ayat 11 huruf b)**
Sesuai regulasi, Maba tidak dapat mengubah nomor WA wali secara sepihak. Namun, untuk mencegah *bottleneck*:
1. **Pengajuan via Portal**: Maba menekan tombol "Ganti Nomor?" di Panel Kontrak.
2. **Formulir Ringkas**: Muncul modal input Nomor Baru + unggah KK/Surat Wali.
3. **Status Pending**: OTP ditangguhkan sementara. Notifikasi *Review* masuk ke Dasbor UPA.
4. **Verifikasi UPA**: Admin memeriksa keabsahan dokumen dan menyetujui.
5. **Resume Flow**: Sistem portal Maba diperbarui otomatis; Maba dapat mengirim ulang OTP.

**Keuntungan Arsitektur Hibrida WhatsApp & Master Kolektif:**
*   **Efisiensi Biaya Maksimal**: Menghindari langganan E-Signature mahal per pengguna dan menghemat jutaan rupiah dengan menggunakan 1 meterai fisik untuk ratusan mahasiswa per batch.
*   **Keabsahan Hukum Sempurna**: Sesuai UU Bea Meterai (1 dokumen kolektif = 1 meterai) dan bukti otentikasi log OTP tersimpan secara aman di database.
*   **Kendali & Fleksibilitas**: Terbebas dari vendor pihak ketiga (kecuali API WhatsApp yang sangat murah). Seluruh siklus hukum dikendalikan internal oleh UPA UBT.

Dengan arsitektur ini, sistem otonom asrama setara dengan standar persetujuan aplikasi kelas perusahaan besar (banking/enterprise) namun dengan kearifan efisiensi anggaran universitas negeri.
