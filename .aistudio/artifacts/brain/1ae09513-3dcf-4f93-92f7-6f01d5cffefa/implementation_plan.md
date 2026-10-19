# Rencana Penyelarasan Rekening Bank: Bank Mandiri 1050508988809 (Transfer Manual) & Bank BNI (Virtual Account)

Rencana ini menetapkan langkah penyesuaian dan standardisasi informasi rekening perbankan di seluruh dokumen operasional, pedoman pra-implementasi produksi (*Pre-Production Readiness*), dokumentasi pengujian Laragon, serta arsitektur sistem agar selaras 100% dengan antarmuka UI aplikasi.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> Keputusan dan preferensi perbankan yang telah dikonfirmasi oleh pengguna:
> 1. **Kanal Transfer Manual (Kanal Utama Produksi)**:
>    - **Nama Bank**: **Bank Mandiri** (Kode Bank: `008`)
>    - **Nomor Rekening**: **`1050508988809`**
>    - **Atas Nama**: **Asrama Universitas Bunda Thamrin**
>    - **Mekanisme**: Transfer manual via ATM/M-Banking dengan **3 digit kode unik acak (`001` - `999`)** yang diverifikasi oleh kasir/staf keuangan (`keuangan@ubt.ac.id`) melalui pencocokan mutasi rekening koran Kopra by Mandiri / Livin' by Mandiri.
> 2. **Kanal Virtual Account (Kanal Khusus VA)**:
>    - **Nama Bank**: **Bank Negara Indonesia (BNI)**
>    - **Peruntukan**: Khusus kanal Virtual Account (VA Sandbox / Integrasi Host-to-Host) dengan verifikasi otomatis callback/webhook API.
> 3. **Sinkronisasi Dokumen Teknis & Operasional**:
>    - Mengoreksi seluruh kekeliruan pencantuman rekening di `docs/PRE_PRODUCTION_READINESS.md` dan `docs/PRE_PRODUCTION_READINESS.en.md` (yang sebelumnya sempat tertulis BNI `084-554-1234` a.n. Yayasan UBT) agar berganti ke **Bank Mandiri 1050508988809 a.n. Asrama Universitas Bunda Thamrin**.
>    - Memperbarui panduan pengujian `docs/TESTING_DATA_REAL_LARAGON.md` dan `docs/TESTING_DATA_REAL_LARAGON.en.md` pada Langkah 3 (Pembayaran) untuk merinci dual-channel: Mandiri untuk Transfer Manual dan BNI untuk Virtual Account.
>    - Menyelaraskan catatan arsitektur `docs/ARCHITECTURE.md` dan `docs/ARCHITECTURE.en.md`.

---

## 1. Overview & Core Concept

- **What It Does**: Menyelaraskan identitas rekening bank penampung dana sewa asrama di seluruh repositori (dokumen panduan pra-produksi, panduan pengujian Laragon, spesifikasi arsitektur bridging database) sehingga tidak terjadi kebingungan antara developer, kasir universitas, maupun calon mahasiswa baru.
- **Target Audience**:
  - **Kasir / Staf Keuangan (`keuangan@ubt.ac.id`)**: Memastikan staf kasir mengacu pada mutasi harian rekening Bank Mandiri `1050508988809` a.n. Asrama Universitas Bunda Thamrin saat mencocokkan kode unik 3 digit.
  - **Calon Mahasiswa Baru**: Mengetahui dengan pasti nomor rekening tujuan transfer manual (Mandiri) serta rekening Virtual Account (BNI).
  - **Tim Pengembang & Auditor**: Menjamin konsistensi antara kode frontend (`MabaDashboard.tsx`, `AdminKeuangan.tsx`), skema bridging database, dan SOP resmi tertulis.

---

## 2. User Experience & Visual Alignment

### Komponen UI Terkait (Sudah Sesuai)
- **`src/components/maba/MabaDashboard.tsx`**:
  - Label: `Transfer Manual (BANK MANDIRI)`
  - Nomor Rekening: `1050508988809` (dilengkapi tombol *Copy to Clipboard*)
  - Atas Nama: `Asrama Universitas Bunda Thamrin`
  - Tombol aksi: `Simulasikan Kirim Bukti Transfer (Utama)`
  - Tab Kedua: `Virtual Account BNI` (Kanal Opsional Sandbox / Host-to-Host)
- **`src/components/admin/AdminKeuangan.tsx`**:
  - Pilihan metode: `{inv.metodeBayar === 'VIRTUAL_ACCOUNT' ? 'Virtual Account BNI' : 'Transfer Manual Bank Mandiri'}`
  - Kolom mutasi: `Upload Bukti Transfer Bank Mandiri`

### Target Penyelarasan Dokumen
Dokumen yang akan diperbaiki agar mencerminkan spesifikasi di atas secara akurat:
- **`docs/PRE_PRODUCTION_READINESS.md`** & **`docs/PRE_PRODUCTION_READINESS.en.md`**
- **`docs/TESTING_DATA_REAL_LARAGON.md`** & **`docs/TESTING_DATA_REAL_LARAGON.en.md`**
- **`docs/ARCHITECTURE.md`** & **`docs/ARCHITECTURE.en.md`**

---

## 3. Detailed Scope of Work

### Langkah 1: Pembaruan `docs/PRE_PRODUCTION_READINESS.md` (Bahasa Indonesia)
- **Sub-bab 4.1 (Rekening Bank Resmi Institusi)**:
  - Mengubah rekening transfer manual menjadi:
    - **Nama Bank**: Bank Mandiri
    - **Nomor Rekening**: `1050508988809`
    - **Atas Nama**: `Asrama Universitas Bunda Thamrin`
    - **Kode Bank untuk Transfer Antar-Bank**: `008`
  - Menambahkan sub-bagian **4.1.2 Kanal Virtual Account (Kanal Khusus BNI)**:
    - **Penyedia Layanan VA**: Bank Negara Indonesia (BNI)
    - **Prefix Institusi**: `988` (Khusus simulasi Sandbox / integrasi Host-to-Host otomatis)
- **Sub-bab 4.3 (Alur Kerja Operasional Staf Kasir)**:
  - Mengubah langkah 2 diagram: `Buka Internet Banking Mandiri (Kopra by Mandiri / Livin' by Mandiri) atau Portal VA BNI`.
- **Sub-bab 4.4 & Kasus D**:
  - Mengubah rujukan mutasi bank menjadi rekening koran Bank Mandiri.
- **Sub-bab 5 (Checklist Go-Live Day)**:
  - Memastikan staf kasir bersiap dengan mutasi rekening Bank Mandiri `1050508988809` di layar monitor rekonsiliasi.

### Langkah 2: Pembaruan `docs/PRE_PRODUCTION_READINESS.en.md` (English Version)
- Menerjemahkan dan menyelaraskan seluruh perubahan sub-bab 4.1, 4.3, 4.4, dan Checklist Go-Live Day ke dalam Bahasa Inggris secara presisi:
  - Manual Transfer Account: Bank Mandiri `1050508988809` a.n. Asrama Universitas Bunda Thamrin (Bank Code: `008`).
  - Virtual Account Channel: Dedicated BNI Virtual Account (Bank Code: `009`).
  - Reconciliation Source: Kopra by Mandiri / Livin' by Mandiri internet banking.

### Langkah 3: Penyelarasan `docs/TESTING_DATA_REAL_LARAGON.md` & `TESTING_DATA_REAL_LARAGON.en.md`
- Pada **Langkah 3: Skema Sewa, Billing, & Bukti Transfer**:
  - Memperbarui butir 2 (Unggah Bukti Transfer):
    - *Sebelumnya*: `Mahasiswa mentransfer ke rekening Virtual Account / Bank BNI Asrama UBT.`
    - *Diperbarui menjadi*: `Mahasiswa mentransfer ke rekening resmi Bank Mandiri (1050508988809 a.n. Asrama Universitas Bunda Thamrin) untuk transfer manual dengan 3 digit kode unik, atau Virtual Account BNI (kanal khusus VA).`
- Menyesuaikan versi Bahasa Inggris (`TESTING_DATA_REAL_LARAGON.en.md`) pada Step 3:
  - *Updated to*: `Transfer to official Bank Mandiri account (1050508988809 a.n. Asrama Universitas Bunda Thamrin) with 3-digit unique code, or dedicated BNI Virtual Account.`

### Langkah 4: Penyelarasan `docs/ARCHITECTURE.md` & `docs/ARCHITECTURE.en.md`
- Memastikan contoh nilai kolom `metode_pembayaran` pada tabel `request_transaksi` mengacu pada `'Transfer Manual Bank Mandiri'` atau `'Virtual Account BNI'`.

### Langkah 5: Verifikasi Build & Sintaks
- Menjalankan `compile_applet` untuk memastikan kompilasi bundle Vite React berjalan tanpa error.
- Menjalankan `lint_applet` untuk menjamin tidak ada regresi tipe TypeScript.

---

## 4. Acceptance Criteria

- [x] Seluruh kemunculan rekening lama `084-554-1234` atau nama `Yayasan Universitas Bunda Thamrin` telah digantikan secara konsisten dengan **Bank Mandiri `1050508988809` a.n. `Asrama Universitas Bunda Thamrin`**.
- [x] Kanal BNI tetap tercatat secara spesifik sebagai **Kanal Khusus Virtual Account (VA)**.
- [x] Panduan pra-implementasi produksi (`PRE_PRODUCTION_READINESS.md` & `PRE_PRODUCTION_READINESS.en.md`) memuat detail kode bank yang tepat (`008` untuk Mandiri dan `009` untuk BNI).
- [x] Panduan pengujian data riil Laragon (`TESTING_DATA_REAL_LARAGON.md` & `TESTING_DATA_REAL_LARAGON.en.md`) selaras dengan alur pembayaran dual-channel di UI mahasiswa.
- [x] Kompilasi dan linter TypeScript lulus 100%.
