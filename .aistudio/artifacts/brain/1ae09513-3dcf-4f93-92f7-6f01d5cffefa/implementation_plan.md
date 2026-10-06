# Roadmap Kelanjutan Pengembangan Portal Asrama UBT (Laravel + Inertia.js + React)

Rencana pengembangan berkelanjutan untuk mentransisikan purwarupa interaktif portal pendaftaran dan operasional asrama menuju arsitektur monolit produksi penuh berbasis Laravel 11, Inertia.js 2.0, dan React 19.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> Sistem saat ini telah dirancang dengan arsitektur hibrida siap-migrasi (*Turnkey Scaffolding*):
> 1. **Fondasi Laravel + Inertia.js + React**: Struktur direktori Controller, Model Eloquent, Migration, Routes `web.php`, Blade view `app.blade.php`, dan Inertia Page wrappers (`resources/js/Pages/*`) sudah lengkap dan saling terhubung.
> 2. **Prototyping Sandbox vs Habitat Produksi**: Di lingkungan dev cloud (container Node.js), UI berjalan via Vite SPA interaktif (`src/`) agar verifikasi kamera, upload, alur 6-langkah, dan kalkulator tagihan berjalan instan. Di habitat lokal (Laragon/PHP 8.2+/MySQL), aplikasi berjalan sebagai monolit Inertia penuh.

- **Konfirmasi Stack**: Stack sistem resmi menggunakan **Laravel 11 (Backend & ORM)** + **Inertia.js 2.0 (Bridge & Routing)** + **React 19 & Tailwind CSS (Frontend Views)**.
- **Strategi Penyimpanan KYC (Sesuai AGENTS.md)**: Dokumen KTP dan swafoto biometrik wajib menggunakan *file versioning* (audit trail), disimpan di *private storage*, dan hanya diakses menggunakan *Short-Lived Signed URLs* (TTL 15 menit).

---

## 1. Overview & Core Concept

- **Tujuan Sistem**: Menyediakan platform terpadu untuk penerimaan mahasiswa baru (admisi 6-langkah), penempatan kamar (*room plotting* dengan *concurrency lock*), penerbitan tagihan berkode unik, penandatanganan kontrak digital kolektif dengan OTP WhatsApp (JUKLAK-02 & JUKLAK-03), serta penegakan SOP otomatis (auto-debet deposit & denda).
- **Target Persona**: Calon Mahasiswa Baru (Maba), Mahasiswa Senior/Eksisting, Admin Keuangan (verifikator billing), Admin Asrama (pengelola kamar & ratifikasi F-22), dan Petugas Keamanan (scanner e-Ticket BASTK).
- **Nilai Utama**: Menghilangkan antrean fisik pendaftaran, memotong biaya meterai digital melalui skema Master Kontrak Kolektif Hibrida, serta menjamin integritas data pembayaran dan status legalitas hunian.

---

## 2. User Experience & Visual Design

### A. Alur Pengalaman Pengguna (Key User Flows)

1. **Jalur Masuk Dual-Tab & e-KYC**:
   - Maba masuk menggunakan No. Registrasi PMB dan tanggal lahir.
   - Mengisi biodata lengkap (Data Diri, Alamat KTP/Domisili berjenjang, Kontak Darurat tingkat 1 & 2) yang divalidasi oleh sistem validasi form.
   - Pengambilan foto KTP & Swafoto biometrik langsung via kamera peramban atau berkas lokal dengan auto-resume draft.

2. **Konfigurasi Billing & Pembayaran Berkode Unik**:
   - Maba memilih durasi sewa (6 / 12 bulan) dan skema pembayaran deposit (lunas atau cicilan bertahap).
   - Sistem menerbitkan tagihan dengan kode unik 3 digit (atau Virtual Account Bank) dengan toleransi waktu transfer.
   - Maba dapat mengubah pilihan selama status tagihan belum terverifikasi (*UNPAID*).

3. **Plotting Kamar & Kuota Real-time**:
   - Maba memilih kamar berdasarkan filter gedung (Putra/Putri), lantai, dan kapasitas ranjang yang tersedia.
   - Sistem melakukan penguncian kuota sementara (*reservation lock*) selama proses transaksi berlangsung.

4. **Kontrak Kolektif & Ratifikasi F-22 (JUKLAK-02/03)**:
   - Pengiriman OTP melalui WhatsApp Gateway ke nomor mahasiswa dan wali.
   - Perekaman jejak audit SHA-256 dan penggabungan mahasiswa ke dalam antrean batch lembar ratifikasi kolektif bermeterai tunggal.

5. **Aktivasi e-Ticket & Serah Terima Kunci (BASTK)**:
   - Terbit QR Code barcode terenkripsi untuk pemindaian di pos keamanan asrama saat kedatangan fisik.

### B. Identitas Visual & Hirarki Antarmuka

- **Aesthetic Direction**: Desain utilitarian institusional modern dengan kerapatan data tinggi (*high-density administrative dashboard*).
- **Palet Warna**:
  - Dominan Latar: Slate netral bersih (`bg-slate-50` hingga `bg-slate-100`) untuk kontras dokumen administrasi.
  - Aksen Utama: Teal formal (`#0d9488` / `text-teal-700` / `bg-teal-600`) mencerminkan integritas institusi akademik.
  - Peringatan & Status: Amber hangat (`text-amber-700`, `bg-amber-50`) untuk status pending/verifikasi, Emerald (`text-emerald-700`) untuk status lunas/aktif, dan Rose tegas (`text-rose-700`) untuk tunggakan/pelanggaran.
- **Tipografi**: Menggunakan angka tabular (`tabular-nums` atau `font-mono`) pada seluruh nominal uang, tanggal jatuh tempo, kode kamar, dan nomor tiket guna mencegah pergeseran tata letak antarmuka.
- **Zero-Pill Discipline**: Status dan tanggal disajikan dengan pemisah tipografis yang rapi dan elegan, bukan badge kapsul mengambang yang berlebihan.

---

## 3. Keputusan Produk & Trade-Offs

- **Keputusan 1: Arsitektur Inertia Monolith vs REST API Terpisah**
  - *Pendekatan*: Inertia.js Monolith menghubungkan Laravel dan React langsung melalui Controllers dan Props.
  - *Rasional*: Menghilangkan overhead pembuatan ratusan endpoint REST API manual dan token handling yang rumit, sambil tetap mempertahankan pengalaman UX interaktif Single Page Application (SPA).
  - *Pengecualian*: REST API murni hanya dipertahankan untuk webhook bank (Virtual Account callback) dan webhook WhatsApp gateway.

- **Keputusan 2: Penanganan Berkas e-KYC (KTP & Selfie)**
  - *Pendekatan*: Penyimpanan di direktori privat (`storage/app/private/kyc`) dengan URL sementara tertanda tangan digital (*Signed URLs* TTL 15 menit) dan pengindeksan versi (*versioning* UUID).
  - *Rasional*: Mencegah kebocoran data identitas pribadi (NIK/KTP) ke publik dan menjamin riwayat perubahan berkas pada audit trail verifikator tidak terhapus (*immutable logs*).

- **Keputusan 3: Lembar Ratifikasi Kontrak Kolektif F-22**
  - *Pendekatan*: Mahasiswa menandatangani persetujuan secara digital via OTP WA, lalu digabungkan ke dalam 1 lembar fisik ratifikasi kolektif (maks. 40 mahasiswa) yang dibubuhi 1 meterai fisik Rp10.000 saat check-in loket.
  - *Rasional*: Memenuhi UU ITE Pasal 11 dan UU Bea Meterai No. 10/2020 dengan penghematan anggaran universitas hingga puluhan juta rupiah dibandingkan biaya meterai elektronik per orang.

---

## 4. Arsitektur Teknis & Strategi Data

### A. Diagram Arsitektur Sistem

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CLIENT / BROWSER RUNTIME                        │
│                                                                        │
│  ┌───────────────────────┐             ┌────────────────────────────┐  │
│  │   Portal Mahasiswa    │             │      Portal Pengelola      │  │
│  │  (Admisi 6-Langkah)   │             │ (Keuangan, Asrama, SOP)    │  │
│  └──────────┬────────────┘             └─────────────┬──────────────┘  │
│             │                                        │                 │
│             └───────────────────┬────────────────────┘                 │
│                                 ▼                                      │
│               ┌───────────────────────────────────┐                    │
│               │   Inertia.js Client & Form Hooks  │                    │
│               │ (useForm, Router, Auto-Resume)    │                    │
│               └─────────────────┬─────────────────┘                    │
└─────────────────────────────────┼──────────────────────────────────────┘
                                  │ HTTP / Inertia Protocol
                                  ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        LARAVEL BACKEND RUNTIME                         │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │   Inertia Middleware & Route Pipeline (routes/web.php)           │  │
│  └──────────────────────────────┬───────────────────────────────────┘  │
│                                 ▼                                      │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                     App HTTP Controllers                         │  │
│  │  • MabaDashboardController       • AdminAsramaController         │  │
│  │  • InvoiceController             • CronSopController             │  │
│  │  • KycVerificationController     • EksistingDashboardController  │  │
│  └──────────────┬───────────────────────────────┬───────────────────┘  │
│                 │                               │                      │
│                 ▼                               ▼                      │
│  ┌─────────────────────────────┐  ┌─────────────────────────────────┐  │
│  │     Private KYC Storage     │  │      External Webhook APIs      │  │
│  │  (Signed URLs & Versioning) │  │  • WhatsApp Gateway (OTP WA)    │  │
│  │                             │  │  • Bank VA Callback Listener    │  │
│  └──────────────┬──────────────┘  └─────────────────┬───────────────┘  │
│                 │                                   │                  │
│                 └─────────────────┬─────────────────┘                  │
│                                   ▼                                    │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                 Eloquent ORM & MySQL Database                    │  │
│  │  • users (Multi-role & KIP)      • tariffs & payment_schemes     │  │
│  │  • rooms & reservations          • billing_invoices & mutasi     │  │
│  │  • digital_contracts & bastk     • delinquencies & SOP engine    │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

### B. Tahapan Lanjutan Pengembangan (Roadmap Eksekusi)

1. **Tahap 1: Pengikatan State React ke Form Helper Inertia (`useForm`)**
   - Mentransformasi submit form biodata, e-KYC, dan konfigurasi tagihan dari handler lokal menjadi pengiriman reaktif via `useForm` dari `@inertiajs/react`.
   - Mengintegrasikan error flash Laravel dan validasi form server-side ke dalam komponen pesan peringatan antarmuka.

2. **Tahap 2: Manajemen Penyimpanan Privat & Signed URL e-KYC**
   - Mengaktifkan disk `private_kyc` pada konfigurasi Laravel filesystem.
   - Membuat generator URL bertanda tangan waktu singkat (`Storage::temporaryUrl()`) untuk review admin keuangan dan maba, mencegah URL gambar diakses publik secara bebas.
   - Menerapkan format penamaan berkas dengan UUID berversi untuk mendukung *Audit Trail* modifikasi.

3. **Tahap 3: Penyempurnaan Alur Gateway WhatsApp & Ratifikasi F-22**
   - Menghubungkan tombol "Kirim Kode OTP" ke service pengiriman pesan WhatsApp (Fonnte API / mock gateway).
   - Menyimpan jejak hash audit SHA-256 pada tabel kontrak dan menyiapkan modul ekspor PDF Lembar Ratifikasi Kolektif F-22 untuk tanda tangan basah Kepala Asrama.

4. **Tahap 4: Mesin Otomatisasi SOP & Delinquency Engine**
   - Menjalankan penegakan toleransi 5 hari pembayaran, pemotongan otomatis uang deposit, pengenaan denda keterlambatan Rp 500.000, serta surat pemutusan sewa.
   - Memastikan dashboard SOP Cron Monitor dapat menjalankan simulasi pergantian tanggal penagihan dengan visualisasi log yang presisi.

5. **Tahap 5: Verifikasi Lint, Build, dan Uji Lingkungan Laragon**
   - Memverifikasi kestabilan build frontend dan rute controller.
   - Memastikan berkas setup otomatis (`laragon-setup.bat` dan dokumentasi) dapat dijalankan satu klik oleh tim pengembang di Windows/Linux.
