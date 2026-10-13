# Rencana Implementasi: Integrasi SIAKAD & Protokol Sinkronisasi SIDARA (Skenario 1 & 2)

Rencana arsitektur dan teknis penerapan keterhubungan satu pintu antara API SIAKAD UBT dan ekosistem SIDARA Synchronization & Booking Migration Protocol mengacu pada **SCENARIO-mappings.md** serta keputusan klarifikasi pengguna:
1. **Skenario 1 (Maba Baru Onboarding - Deteksi NIM Resmi)**:
   - Jika calon mahasiswa mendaftar via form PMB namun di API SIAKAD/SIDARA telah diterbitkan NIM resmi, sistem menampilkan **Modal Notifikasi Pengalihan SSO** yang memandu mahasiswa masuk melalui jalur SSO Kampus terintegrasi.
2. **Skenario 2 (Mahasiswa Eksisting Bukan Penghuni via SSO)**:
   - Mahasiswa aktif kampus yang login via SSO dan terverifikasi di SIAKAD/SIDARA namun belum tercatat di master `penyewa` diarahkan ke **Fast-Track Pendaftaran** (langsung ke Step 2 Pemilihan Kamar & Tagihan) **hanya jika field output API memadai** (Nama, NIK, No. HP, Prodi, Fakultas lengkap). Jika belum memadai, diarahkan ke Step 1 untuk melengkapi field yang kurang.
3. **Mekanisme Pencocokan**:
   - Pencocokan otomatis dilakukan pada level data staging `siakad_mahasiswa_stg` via korelasi nomor registrasi PMB dan NIK.

---

## 1. Arsitektur Ekosistem SIAKAD, SIDARA & Asrama UBT

```
                    [ PANGKALAN DATA SIAKAD & SIDARA KAMPUS UBT ]
                           (Satu-Satunya Pintu Data Akademik)
                                           │
                                           ▼ (Protokol Sinkronisasi Terjadwal / On-Demand)
                   [ BACKEND LARAVEL: SiakadSyncService & SIDARA Engine ]
                                           │
                        ┌──────────────────┴──────────────────┐
                        ▼                                     ▼
             [ TABEL MASTER: api_link ]          [ TABEL STAGING: siakad_mahasiswa_stg ]
             - endpoint mahasiswa-btt-006        - nomor_registrasi (PMB) & nik
             - endpoint mahasiswa-btt-002        - nim_resmi & has_active_nim
                                                 - is_api_fields_complete (Kelengkapan Data)
                                           │
         ┌─────────────────────────────────┴─────────────────────────────────┐
         ▼                                                                   ▼
┌─────────────────────────────────────────┐       ┌─────────────────────────────────────────┐
│     SKENARIO 1: MABA BARU ONBOARDING    │       │     SKENARIO 2: MAHASISWA EKSISTING     │
│       (Login via Formulir PMB)          │       │           (Login via SSO UBT)           │
├─────────────────────────────────────────┤       ├─────────────────────────────────────────┤
│ 1. Input Nomor PMB                      │       │ 1. Login Kredensial SSO (NIM Valid)     │
│ 2. Cek apakah NIM Resmi terbit?         │       │ 2. Cek status di tabel penyewa:         │
│    ├── SUDAH (has_active_nim = true):   │       │    ├── AKTIF: Masuk Dashboard Eksisting │
│    │   Modal: "NIM Resmi Terbit!" ──────┼──────►│    └── NULL (Bukan Penghuni):            │
│    │   Alihkan ke SSO (NIM Terisi)      │       │        Evaluasi kelengkapan field API:  │
│    └── BELUM: Lanjut Onboarding Reguler │       │        ├── LENGKAP: Fast-Track (Step 2) │
│        (Admisi 6-Langkah Standar)       │       │        └── BELUM: Form Step 1 (Lengkapi)│
└─────────────────────────────────────────┘       └─────────────────────────────────────────┘
```

---

## 2. Struktur Data & Perubahan Model

### A. Penambahan Atribut pada `SiakadMahasiswaStgRecord` (`src/types/asrama.ts`)
* `nim_resmi?: string`: Nomor Induk Mahasiswa resmi yang telah diterbitkan sistem SIAKAD/SIDARA (contoh: `2601015001`).
* `has_active_nim: boolean`: Penanda apakah mahasiswa sudah memiliki NIM aktif sehingga wajib menggunakan SSO.
* `is_api_fields_complete: boolean`: Flag evaluasi apakah data dasar (Nama, NIK, No. HP, Prodi, Fakultas, Jenis Kelamin) sudah lengkap dari payload API SIAKAD.

### B. Pembaruan Initial Data (`src/data/initialData.ts`)
* Menambahkan variasi data uji coba pada `INITIAL_SIAKAD_STAGING`:
  1. **PMB2026-08942 (Maximilian)**: Terdeteksi memiliki NIM resmi `2601015001` (`has_active_nim = true`) untuk menguji pemicu Skenario 1 (Modal Pengalihan ke SSO).
  2. **PMB-BTT-002-001 (Muhammad Fadhil)**: Maba murni belum memiliki NIM resmi (`has_active_nim = false`, `nim_resmi = undefined`) untuk menguji alur pendaftaran PMB standar.
  3. **2240101088 (Ahmad Zaky)**: Mahasiswa aktif kampus di SIDARA, bukan penghuni asrama (`penyewa = null`), data API lengkap (`is_api_fields_complete = true`) untuk menguji Fast-Track Step 2.
  4. **2240101099 (Rina Anggraini)**: Mahasiswa aktif kampus di SIDARA, data API belum lengkap NIK/kontak (`is_api_fields_complete = false`) untuk menguji fallback pengisian Step 1.

---

## 3. Komponen Antarmuka & UX Design (Sesuai Frontend Design Skill)

### A. Modal Notifikasi "NIM Resmi Terbit" di `LoginDualTab.tsx`
* **Trigger**: Calon mahasiswa submit form PMB atau memilih nomor registrasi yang memiliki `has_active_nim === true`.
* **Visual**:
  - Dialog modal fokus dengan backdrop blur halus (`bg-slate-900/60 backdrop-blur-sm`).
  - Badge identitas: `SIAKAD & SIDARA INTEGRATION PROTOCOL`.
  - Informasi kartu transparan berisi perbandingan No. PMB lama vs NIM resmi baru yang terbit.
  - Aksi 1-klik: *"Masuk via SSO Menggunakan NIM Ini →"* yang secara otomatis:
    1. Menutup modal.
    2. Mengalihkan tampilan ke Tab Login SSO.
    3. Mengisi kolom username SSO dengan NIM resmi secara instan.
    4. Memberikan toast feedback bantuan kredensial.

### B. Evaluasi & Fast-Track Mahasiswa Eksisting (Bukan Penghuni) via SSO
* **Trigger**: Mahasiswa aktif login via SSO dan query `penyewa` menghasilkan NULL (Bukan Penghuni Aktif).
* **Percabangan Logika**:
  - **Jika Field API Memadai (`is_api_fields_complete === true`)**:
    - Dialog konfirmasi pengalihan menampilkan opsi: *"Biodata Akademik SIAKAD Lengkap — Langsung Pilih Kamar (Fast-Track)"*.
    - Sistem mengarahkan langsung ke **Step 2 (Rincian Tagihan & Pemilihan Kamar)**, mengunci biodata Step 1 sebagai data terverifikasi SIAKAD, memotong friksi pengisian ulang.
  - **Jika Field API Belum Memadai (`is_api_fields_complete === false`)**:
    - Sistem menampilkan banner informatif: *"Data Akademik SIAKAD Terhubung — Mohon lengkapi NIK dan Kontak Darurat"*.
    - Sistem mengarahkan ke **Step 1** dengan kolom yang tersedia terisi otomatis, dan menandai kolom yang belum lengkap dengan border aksen lembut.

---

## 4. Proposed Changes by Files

### Frontend & Logic Integration
- **`src/types/asrama.ts`**:
  - Tambahkan field `nim_resmi`, `has_active_nim`, dan `is_api_fields_complete` pada interface `SiakadMahasiswaStgRecord`.
- **`src/data/initialData.ts`**:
  - Perbarui mock data `INITIAL_SIAKAD_STAGING` agar mencakup kasus uji Skenario 1 dan 2 (lengkap vs belum lengkap).
- **`src/components/auth/LoginDualTab.tsx`**:
  - Tambahkan pengecekan `has_active_nim` pada `handleMabaSubmit`.
  - Buat komponen modal notifikasi `NimDetectedModal` dengan auto-redirect ke SSO.
  - Tambahkan evaluasi `is_api_fields_complete` pada modal `showRedirectModal` SSO untuk membedakan Fast-Track (Step 2) vs Form Melengkapi Biodata (Step 1).
- **`src/App.tsx`**:
  - Perbarui handler `handleLoginSuccess` untuk mendukung rute awal `initialStep = 2` saat mahasiswa eksisting bukan penghuni memenuhi syarat Fast-Track.
- **`src/components/maba/MabaDashboard.tsx`**:
  - Berikan visual penanda khusus saat mahasiswa masuk via Fast-Track SSO (misal: badge *"Data Akademik Terverifikasi Penuh dari SIDARA"*).

### Dokumentasi
- **`docs/scenario-mappings.md` & `docs/scenario-mappings.en.md`**:
  - Perbarui matriks Skenario 1 dan 2 dengan klausul deteksi NIM resmi dan evaluasi kelengkapan field API.
- **`docs/ARCHITECTURE.md` & `ASRAMA_UBT_SYSTEM_DOCUMENTATION.md`**:
  - Tambahkan alur teknis integrasi SIDARA Synchronization Protocol.

---

## 5. Verification Plan

1. **Pengujian Skenario 1 (Maba Memiliki NIM Resmi)**:
   - Pilih preset PMB `PMB2026-08942` pada form pendaftaran maba.
   - Verifikasi modal *"NIM Resmi SIAKAD Terbit"* muncul dan menampilkan NIM `2601015001`.
   - Klik tombol pengalihan dan verifikasi tab SSO aktif dengan NIM terisi otomatis.
2. **Pengujian Skenario 2A (Eksisting Bukan Penghuni - Data Lengkap)**:
   - Login SSO dengan akun mahasiswa bukan penghuni yang datanya lengkap.
   - Verifikasi sistem langsung melompati Step 1 dan membuka Step 2 (Pemilihan Kamar & Durasi Sewa).
3. **Pengujian Skenario 2B (Eksisting Bukan Penghuni - Data Belum Lengkap)**:
   - Login SSO dengan akun mahasiswa bukan penghuni yang datanya belum lengkap.
   - Verifikasi sistem membuka Step 1 dengan notifikasi untuk melengkapi field yang kurang.
4. **Verifikasi Build**:
   - Jalankan `lint_applet` (`tsc --noEmit`) dan `compile_applet` untuk memastikan tidak ada galat kompilasi.
