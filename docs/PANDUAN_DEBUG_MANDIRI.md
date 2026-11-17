# Panduan Struktur Kode Sederhana & Debug Manual (Untuk Pengelola & Programmer)

Dokumen ini merupakan **peta navigasi cepat** untuk memelihara, mengubah aturan bisnis, dan melakukan *debugging* manual pada **Portal SI-GABUNG 54 (Asrama Universitas Bunda Thamrin / Roemah 54)** tanpa harus menelusuri ribuan baris kode tampilan.

---

## 1. Satu Pusat Pengaturan Aturan Bisnis (*Single Source of Truth*)

Seluruh angka tarif, rumus perhitungan tagihan, aturan **Kode Unik 3 Digit**, dan batas waktu **48 Jam** telah dipusatkan ke dalam **satu file khusus**:

> **Lokasi File:** `src/config/asramaBusinessRules.ts`

Jika Anda ingin mengubah kebijakan harga atau waktu, **cukup edit file tersebut** tanpa perlu menyentuh file tampilan:

| Kebijakan / Parameter Bisnis | Nama Konstanta di `src/config/asramaBusinessRules.ts` | Nilai Standar Saat Ini |
| :--- | :--- | :--- |
| **Biaya Sewa Kamar Bulanan** | `ASRAMA_TARIFFS.SEWA_BULANAN` | `500_000` (Rp 500.000 / bulan) |
| **Deposit Mahasiswa Reguler** | `ASRAMA_TARIFFS.DEPOSIT_REGULER` | `1_000_000` (Rp 1.000.000) |
| **Deposit KIP (Bayar Lunas 1x)** | `ASRAMA_TARIFFS.DEPOSIT_KIP_LUNAS_1X` | `500_000` (Rp 500.000) |
| **Deposit KIP (Dicicil 1,5x)** | `ASRAMA_TARIFFS.DEPOSIT_KIP_CICILAN` | `750_000` (Rp 750.000) |
| **Biaya Administrasi Pendaftaran** | `ASRAMA_TARIFFS.BIAYA_ADMINISTRASI` | `100_000` (Rp 100.000) |
| **Masa Berlaku Tagihan & Hold Kamar** | `ASRAMA_SLA_TIMERS.INVOICE_EXPIRY_HOURS` | `48` Jam ($2 \times 24$ Jam) |
| **Rentang Kode Unik Transaksi** | `UNIQUE_CODE_RULES.MIN_CODE` s.d. `MAX_CODE` | `1` s.d. `999` (3 Digit) |
| **Mode Login Mahasiswa Eksisting** | `ASRAMA_IDENTITY.SSO_AUTH_MODE` | `PURE_NIM_SSO` (Murni NIM UBT) |

---

## 2. Peta Lokasi File Inti (*Jika Ingin Edit atau Debug Fitur Tertentu*)

Semua file duplikat yang tidak terpakai telah dibersihkan sehingga **setiap fitur hanya memiliki 1 file utama**:

| Fitur / Bagian Aplikasi | File Utama yang Harus Dicek | Fungsi Spesifik |
| :--- | :--- | :--- |
| **Pusat Rumus & Tarif** | `src/config/asramaBusinessRules.ts` | Mengatur tarif sewa, deposit, admin, kode unik, dan batas waktu 48 jam. |
| **Data Master & Simulasi Awal** | `src/data/initialData.ts` | Menyimpan daftar 36 kamar Roemah 54, data awal tarif, dan contoh pendaftar SIMABA. |
| **Gerbang Login (PMB & SSO NIM)** | `src/components/auth/LoginDualTab.tsx` | Mengatur tab Login Mahasiswa Baru (No. Pendaftaran + Tgl Lahir) & SSO Murni NIM Mahasiswa Lama. |
| **Alur 4 Tahap Mahasiswa Baru** | `src/components/maba/MabaDashboard.tsx` | Mengatur Step 1 (Data Diri & KTP), Step 2 (Pilih Kamar), Step 3 (Invoice & Kode Unik), Step 4 (Kontrak & e-Ticket). |
| **Pemilih Wilayah Indonesia** | `src/components/maba/IndonesianRegionSelector.tsx` | Dropdown bertingkat Provinsi $\rightarrow$ Kabupaten/Kota $\rightarrow$ Kecamatan $\rightarrow$ Kelurahan. |
| **Hitung Mundur Tagihan 48 Jam** | `src/components/maba/ReservationCountdownBanner.tsx` | Menampilkan *countdown timer* 48 jam dan simulasi *Auto-Release* kamar. |
| **Perpanjangan Sewa Bulanan** | `src/components/eksisting/EksistingDashboard.tsx` | Mengatur perpanjangan sewa bulanan (Rp 500rb/bulan + kode unik) mahasiswa penghuni lama. |
| **Panel Admin Asrama** | `src/components/admin/AdminAsrama.tsx` | Mengatur verifikasi e-KYC, *plotting* kamar, tiket keluhan fasilitas, dan sinkronisasi SIAKAD. |
| **Panel Admin Keuangan** | `src/components/admin/AdminKeuangan.tsx` | Mengatur rekonsiliasi mutasi kode unik 3 digit, manajemen tarif, dan pengembalian deposit. |
| **Pelindung Error Teknis** | `resources/js/Components/ErrorBoundary.tsx` | Menangkap *error* antarmuka dan menampilkan rincian baris kode teknis (*Stack Trace*) untuk programmer. |

---

## 3. Daftar File Duplikat yang Telah Dibersihkan

Agar programmer tidak salah mengedit file saat melakukan *debugging*, komponen-komponen lama/duplikat berikut telah dihapus secara permanen dari proyek:
- `src/components/maba/RegionSelector.tsx` *(digantikan sepenuhnya oleh `IndonesianRegionSelector.tsx`)*
- `src/components/maba/AddressForm.tsx` *(tidak digunakan; input alamat terintegrasi di `MabaDashboard.tsx`)*
- `src/components/maba/VerifikasiTrail.tsx` *(komponen yatim yang tidak dirender)*
- `src/components/maba/VisualProgressIndicator.tsx` *(komponen yatim yang tidak dirender)*

---

## 4. Cara Menggunakan Panel Error Teknis (Jika Terjadi Error di Layar)

Apabila suatu saat terjadi kesalahan data atau *bug* pada antarmuka:
1. Aplikasi **tidak akan menampilkan layar putih kosong**, melainkan membuka **Panel Diagnostik Teknis Programmer**.
2. Rincian **[1] Lokasi File & Baris Kode (Error Stack)** serta **[2] Hierarki Komponen React (Component Stack)** akan langsung terbuka secara otomatis di layar.
3. Klik tombol **"Salin Laporan untuk Programmer"** di pojok kanan atas panel.
4. Kirimkan hasil salinan tersebut kepada programmer — di dalamnya sudah tercantum nama file, nomor baris kode penyebab error, serta URL aktif.
5. Jika error disebabkan oleh *cache* sesi browser yang usang, klik tombol **"Reset State Sesi & Muat Ulang"** untuk memulihkan aplikasi seketika.
