# Rencana Implementasi: Penyederhanaan Narasi & Redesain Estetik Modal SSO & Banner Tahap 1

Rencana ini merombak teks naratif yang terlalu panjang dan bertumpuk pada Modal Verifikasi SSO dan Banner Dashboard Tahap 1, menggantikannya dengan format satu baris teks padat (*compact single-line microcopy*) dan menyediakan modal bantuan kebijakan terpisah agar tampilan antarmuka bersih, estetik, dan mudah dipindai (*scannable*).

---

## User Review & Critical Decisions

> [!IMPORTANT]
> Keputusan pengguna yang dikonfirmasi pada tahap klarifikasi:
> - **Cakupan Pemangkasan**: Modal Verifikasi SSO (`LoginDualTab.tsx`) dan Banner Dashboard Tahap 1 (`MabaDashboard.tsx`).
> - **Gaya Pengganti Paragraf Panjang**: Format **satu baris teks padat** (*dense single-line text*) tanpa detail panjang atau paragraf ganda.
> - **Penanganan Regulasi Asrama**: Regulasi detail tidak lagi dipaksakan tampil di halaman utama, melainkan dipindahkan ke **tombol info/bantuan kebijakan terpisah** yang dapat dibuka sesuai kebutuhan.

---

## 1. Overview & Core Concept

- **Problem Statement**: Pengguna menghadapi "dinding teks" (*walls of text*) berukuran 9px–11px di modal SSO dan banner Step 1 yang menjelaskan latar belakang regulasi, pengulangan NIM/nama, dan kebijakan kepenghunian secara berulang sehingga merusak estetika visual dan memperlambat interaksi.
- **Solusi**: 
  1. Mentransformasikan modal verifikasi SSO menjadi kartu konfirmasi yang ringkas, elegan, dan fokus pada aksi.
  2. Memangkas banner Smart Pre-Fill di Tahap 1 menjadi strip info ramping satu baris dengan tombol aksi cepat dan tautan bantuan kebijakan asrama terpisah.
  3. Memastikan kepatuhan terhadap prinsip *Frontend Design Constitution* (penghapusan font 9px kerdil, hierarki tipografi proporsional, dan penataan whitespace yang lega).

---

## 2. User Experience & Visual Design

### A. Modal Verifikasi SSO (`LoginDualTab.tsx`)
1. **Header & Identitas**:
   - Status badge ringkas: `SSO Terverifikasi · Pendaftaran Asrama` (bukan badge peringatan bernada cemas).
   - Judul bersih: `Konfirmasi Pendaftaran Asrama`.
   - Subkicker satu baris: `NIM: {ssoUsername} · {studentName} ({prodi})`.
2. **Keterangan Satu Baris Padat (Menggantikan 2 Paragraf Panjang)**:
   - *"Data akademik telah tersinkron otomatis. Silakan lengkapi e-KTP dan data wali pada Tahap 1."*
3. **Akses Regulasi Terpisah**:
   - Tautan teks ringkas: `[Lihat Ketentuan Kepenghunian]` untuk membuka modal kebijakan asrama jika pengguna menginginkan rincian pasal regulasi.
4. **Tombol Aksi**:
   - `Batal` dan `Lanjut ke Tahap 1 →` dengan tata letak proporsional dan responsif.

### B. Banner Smart Pre-Fill SIAKAD (`MabaDashboard.tsx`)
1. **Pembersihan Dinding Teks**:
   - Menghapus blok paragraf 4-baris tentang kebijakan asrama dari kartu banner utama.
2. **Struktur Banner Ramping Satu Baris**:
   - Baris 1: Ikon teal minimalis + Judul `Data Akademik Terhubung (SIAKAD UBT)` + Tag NIM.
   - Baris 2: Satu baris teks padat: *"Sinkronisasi aktif. Lengkapi e-KTP & kontak wali untuk validasi kepenghunian."*
   - Baris Aksi: Tombol `Simulasi Tarif (Step 2) →` bersanding dengan tombol `Info Kebijakan` berikon informasi.
3. **Modal Bantuan Kebijakan Terpisah**:
   - Dialog bantuan mandiri yang rapi, berisi poin-poin regulasi kepenghunian kampus UBT bagi mahasiswa yang membutuhkan referensi resmi.

---

## 3. Key Product Decisions & Trade-Offs

- **Trade-Off Keterbukaan Informasi vs Kerapihan Visual**:
  - *Pendekatan Dipilih*: Memisahkan *operasional langsung* (alur pendaftaran cepat) dari *dokumentasi regulasi* (bantuan on-demand). Mahasiswa mayoritas hanya ingin melanjutkan pendaftaran tanpa membaca paragraf panjang, sementara aspek legalitas tetap tersedia melalui tombol bantuan.
- **Tipografi & Skala Font**:
  - Menghilangkan font berukuran 9px dan 10px yang terlalu kecil dan sulit dibaca. Menstandarkan ke skala 12px (teks pendukung) dan 14px–16px (teks utama/judul).

---

## 4. Technical Architecture & Component Structure

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          ALUR INTERAKSI TERESTETIK                          │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
            ┌──────────────────────────┴──────────────────────────┐
            ▼                                                     ▼
┌──────────────────────────────────────┐  ┌──────────────────────────────────┐
│      MODAL SSO (LoginDualTab)        │  │     BANNER STEP 1 (Dashboard)    │
│ • Badge: Terverifikasi SIAKAD        │  │ • Title: Data Akademik Terhubung │
│ • Identitas: NIM · Nama · Prodi      │  │ • 1 Baris Padat: Lengkapi KTP &  │
│ • 1 Baris Padat Instruksi Step 1     │  │   data wali untuk validasi.      │
│ • [Tautan Kebijakan Asrama]          │  │ • [Simulasi Tarif] + [Info Rules]│
│ • Tombol: [Batal] [Lanjut Step 1]    │  └────────────────┬─────────────────┘
└──────────────────┬───────────────────┘                   │
                   │                                       │
                   └───────────────────┬───────────────────┘
                                       ▼ (Klik Info Kebijakan)
┌─────────────────────────────────────────────────────────────────────────────┐
│                   MODAL BANTUAN KEBIJAKAN KEPENGHUNIAN ASRAMA               │
│ • Poin ringkas regulasi alokasi kamar & kewajiban e-KYC                     │
│ • Informasi ketentuan kontrak dan pembayaran resmi                          │
│ • Tombol: [Tutup Panduan]                                                   │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Rincian Perubahan File:
1. **`src/components/auth/LoginDualTab.tsx`**:
   - Merombak `showRedirectModal`: menghapus paragraf narasi ganda dan menggantinya dengan satu baris padat instruksi.
   - Menambahkan state modal bantuan kebijakan ringkas jika mahasiswa mengklik tautan info ketentuan.
2. **`src/components/maba/MabaDashboard.tsx`**:
   - Memangkas paragraf tebal pada banner `SMART PRE-FILL SIAKAD`.
   - Menambahkan tombol `Info Kebijakan` di samping tombol `Lihat Simulasi Tarif`.
   - Menyediakan modal pop-up `PolicyInfoModal` yang elegan untuk menampilkan ketentuan asrama secara terpisah.

---

## 5. Verification Plan

1. **Uji Tampilan Modal SSO**:
   - Memilih akun mahasiswa eksisting (NIM: `2240101088` / `2240101099`) saat login SSO.
   - Memverifikasi modal tampil estetik, bersih, teks 1 baris terbaca jelas tanpa paragraf bertumpuk.
   - Memverifikasi klik tautan info kebijakan membuka pop-up bantuan dengan benar.
2. **Uji Tampilan Banner Tahap 1**:
   - Masuk ke dashboard pendaftaran mahasiswa.
   - Memverifikasi banner Smart Pre-Fill berdimensi ramping dan tidak memakan separuh tinggi layar.
   - Menguji tombol `Info Kebijakan` dan tombol navigasi `Simulasi Tarif (Step 2)`.
3. **Kompilasi & Validasi**:
   - Menjalankan `compile_applet` untuk memastikan tidak ada error sintaksis atau regresi build.
