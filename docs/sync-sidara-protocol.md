# Protokol Sinkronisasi SIDARA & Migrasi Status Booking

> **Pilihan Bahasa / Language:** 🇮🇩 **Bahasa Indonesia (Utama)** | [🇬🇧 English Version](sync-sidara-protocol.en.md)

---

## 1. Batasan Arsitektur Sistem
* **SIDARA**: Sistem informasi akademik pusat universitas. Bertindak sebagai **Sumber Kebenaran Tunggal (*Source of Truth*)** eksternal untuk basis data kemahasiswaan dan keabsahan Nomor Induk Mahasiswa (NIM).
* **Basis Data Operasional Asrama**: Basis data internal pengelolaan asrama kampus. Sistem ini mengelola data penghuni (`penyewa`), tagihan, penempatan kamar, dan inventaris.

---

## 2. Mesin Status Transisi: BOOKING -> PENYEWA

Alur pendaftaran asrama menerapkan mesin status (*state machine*) untuk mengelola calon penghuni yang mendaftar di sistem asrama sebelum NIM resmi mereka diterbitkan oleh SIDARA:

### Status: `BOOKING` (Pemesanan Tertahan)
* **Kondisi:** Mahasiswa mendaftar menggunakan nomor pendaftaran sementara (contoh: `PMB2026-08942` atau `REG-xxx`) dan telah melunasi tagihan awal.
* **Pemicu:** Admin Keuangan menyetujui pembayaran melalui aksi "Setujui Booking (Tanpa NIM)".
* **Status Sistem:**
  * Tagihan `status` = `PAID`.
  * Tagihan `isMigrated` = `false`.
  * Dashboard Mahasiswa terkunci pada Langkah 4 dengan status menanti sinkronisasi data akademik resmi kampus.

### Status: `PENYEWA` (Resmi Terdaftar di Master)
* **Kondisi:** NIM resmi telah diterbitkan oleh SIDARA dan dipetakan ke profil mahasiswa.
* **Pemicu:** Admin Keuangan menjalankan aksi "Sinkronisasi NIM & Migrasi" dengan memasukkan NIM resmi dari SIDARA.
* **Status Sistem:**
  * Tagihan `isMigrated` = `true`.
  * Dashboard Mahasiswa membuka Langkah 5 (Penandatanganan Kontrak Digital).
  * Data pada tabel penampungan sementara (*staging*) dipromosikan penuh ke tabel master asrama.

---

## 3. Prosedur Eksekusi Migrasi Basis Data

Saat aksi "Sinkronisasi NIM & Migrasi" dijalankan, backend Laravel mengeksekusi transaksi basis data tunggal yang bersifat atomik:

1. **Pembaruan Staging:** Mengganti nomor registrasi sementara dengan NIM resmi SIDARA pada profil pendaftar (`maba_profiles`).
2. **Penyisipan Master `penyewa`:** Membuat rekord penghuni definitif pada tabel `penyewa` menggunakan NIM sebagai identifier utama. Memetakan kamar yang dialokasikan, fakultas, dan biodata.
3. **Penyisipan Master `pembayaran`:** Mencatat pembayaran sewa dan deposit yang telah diverifikasi ke buku besar pembayaran permanen.
4. **Penyediaan Akun SSO `users`:** Menyediakan akun Single Sign-On (SSO) asrama yang terikat pada NIM resmi mahasiswa.
5. **Finalisasi Tagihan:** Memperbarui status tagihan menjadi `isMigrated = true`.

---

## 4. Pencatatan Jejak Audit Wajib (*Audit Log*)

Demi menjaga akuntabilitas, setiap eksekusi sinkronisasi NIM manual WAJIB menghasilkan entri log audit permanen di tabel `modification_logs` yang merekam:
* **`action`**: `SIDARA_MANUAL_NIM_SYNC`
* **`timestamp`**: Waktu stempel UTC ISO 8601.
* **`actor`**: Nama/ID Admin Keuangan yang mengeksekusi sinkronisasi.
* **`invoice_id`**: Nomor tagihan terkait.
* **`old_identifier`**: Nomor registrasi sementara (misal: `PMB2026-08942`).
* **`new_nim`**: NIM resmi universitas yang dipetakan.
