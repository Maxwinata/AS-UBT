# Rencana Evaluasi & Penyelarasan Dokumentasi Ekosistem Portal Asrama UBT

Evaluasi komprehensif untuk memutakhirkan dokumentasi teknis, menghapus spesifikasi ekosistem usang (legacy REST API & duplikasi panduan setup), serta membersihkan berkas sampah temporer di seluruh repositori.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> Berdasarkan hasil audit repositori, sistem telah sepenuhnya beroperasi pada stack **Laravel 11 + Inertia.js 2.0 + React 19 + Tailwind CSS v4**. Namun, terdapat beberapa ketidaksesuaian kritis pada dokumentasi yang perlu diselaraskan:
> 1. **Eliminasi Rute REST API Fiktif**: Bab 5 pada dokumen spesifikasi utama masih mencantumkan belasan endpoint REST API tradisional yang tidak ada di `routes/web.php` maupun `routes/api.php`. Kita akan menyelaraskannya dengan rute Controller Inertia nyata.
> 2. **Konsolidasi Panduan Setup**: Terdapat 5 dokumen setup terpisah yang saling tumpang tindih dan masih menulis instruksi usang seperti `composer create-project` (padahal repositori ini sudah merupakan aplikasi utuh siap jalan). Kita akan merapikannya menjadi panduan definitif.
> 3. **Pembersihan Root Artifacts**: Terdapat berkas `bun.lock` dan lebih dari 50 skrip patch `.cjs` sisa pengujian lama yang tidak lagi memiliki nilai fungsional.

- **Keputusan 1**: Menyelaraskan `ASRAMA_UBT_SYSTEM_DOCUMENTATION.md` dan `docs/ARCHITECTURE.md` agar 100% mencerminkan arsitektur Inertia Monolith dan model database Eloquent yang sebenarnya.
- **Keputusan 2**: Mengonsolidasikan panduan setup lokal (Laragon & XAMPP) menjadi satu panduan terpadu yang jelas, menghapus panduan duplikat yang membingungkan pengembang.
- **Keputusan 3**: Menghapus `bun.lock` serta seluruh skrip patch sementara (`*.cjs`, `*.txt`, `sourcemap.*`) dari root direktori.

---

## 1. Overview & Core Concept

- **Tujuan**: Menghadirkan dokumentasi teknis yang akurat, mutakhir, dan bebas kontradiksi, sehingga tim pengembang baru dapat langsung memahami alur data tanpa tersesat oleh spesifikasi lama yang sudah ditinggalkan.
- **Target Sasaran**: Pengembang backend Laravel, pengembang frontend React, auditor kepatuhan SOP asrama, dan DevOps/administrator server.
- **Manfaat**: Mencegah salah paham arsitektur (REST vs Inertia), mempercepat proses *onboarding* lokal di Laragon/XAMPP, dan menjaga kebersihan repositori produksi.

---

## 2. User Experience & Visual Design

### A. Alur Dokumentasi yang Bersih (Documentation Information Architecture)

1. **Root Readme & Quickstart**:
   - Menyediakan panduan 1-klik untuk menjalankan sistem baik di lingkungan **Laragon** (`laragon-setup.bat`) maupun **XAMPP** (`xampp-setup.bat`).
   - Panduan eksekusi ganda: Terminal 1 (`npm run dev`) dan Terminal 2 (`php artisan serve`).

2. **System Specification Document (`ASRAMA_UBT_SYSTEM_DOCUMENTATION.md`)**:
   - Bagian Tech Stack: Diperbarui menjadi Laravel 11, Inertia.js 2.0, React 19, Tailwind CSS v4.
   - Bagian Komunikasi: Menguraikan alur kerja Inertia.js (`Inertia::render`, Props Injection, `router.post`) dan membatasi REST API murni hanya untuk Webhook Bank & WhatsApp.
   - Bagian Field & Table Mapping: Diselaraskan dengan tabel migration aktual (`billing_invoices`, `maba_profiles`, `delinquencies`, `tariffs`, dll).

3. **Domain Legal & Regulasi (`docs/JUKLAK_REFERENCE.md` & `AGENTS.md`)**:
   - Dipertahankan secara ketat: Aturan penomoran versi e-KYC KTP/Selfie, private storage bucket, signed URLs 15 menit, dan regulasi Lembar Ratifikasi Kolektif F-22 (JUKLAK-02 & JUKLAK-03).

---

## 3. Keputusan Teknis & Evaluasi Ekosistem

- **Evaluasi 1: REST API vs Inertia Monolith**
  - *Kondisi Lama*: Dokumen mencantumkan `POST /api/admissions/register`, `POST /api/payments/manual-transfer`, dsb.
  - *Kondisi Nyata*: Seluruh komunikasi form menggunakan Inertia Controller (`MabaDashboardController@updateProfile`, `InvoiceController@configure`, `AdminAsramaController@verifyInvoice`).
  - *Tindakan*: Menghapus tabel REST API fiktif dan menggantinya dengan **Inertia Endpoint & Props Contract Table**.

- **Evaluasi 2: Panduan Setup Terfragmentasi**
  - *Kondisi Lama*: Ada `LARAGON_SETUP.md`, `XAMPP_SETUP.md`, `LARAVEL_INERTIA_REACT_GUIDE.md`, `docs/LARAVEL_DEVELOPMENT_ECOSYSTEM_GUIDE.md`, `docs/LARAVEL_INERTIA_SETUP.md`.
  - *Tindakan*: Mengonsolidasikan instruksi ke dalam panduan terstruktur, menghapus berkas redundan yang masih memuat langkah usang `composer create-project laravel/laravel`.

- **Evaluasi 3: Berkas Ekosistem Bun & Skrip Patch .cjs**
  - *Kondisi Lama*: Ada `bun.lock` dan 50+ berkas patch seperti `patch_maba_step1.cjs`, `fix_comma.cjs`, `patch_tariff_manager.cjs`.
  - *Kondisi Nyata*: Perubahan kode telah permanen tersimpan di dalam berkas sumber `src/` dan `resources/`. Skrip patch tersebut sudah tidak pernah dijalankan lagi.
  - *Tindakan*: Menghapus `bun.lock` dan seluruh berkas `.cjs` serta `.txt` sampah di root direktori.

---

## 4. Rencana Kerja Bertahap (Execution Roadmap)

### Tahap 1: Pemutakhiran Dokumen Induk Sistem
- Perbarui `ASRAMA_UBT_SYSTEM_DOCUMENTATION.md` untuk mengoreksi Tech Stack, menghapus endpoint REST API usang di Bagian 5, dan menggantinya dengan spesifikasi Inertia Controller & Props.
- Sinkronkan `docs/ARCHITECTURE.md` dengan entitas model Eloquent aktual.

### Tahap 2: Konsolidasi Panduan Lingkungan Pengembang
- Rapikan panduan Laragon dan XAMPP agar langsung merujuk pada script otomasi yang sudah ada (`laragon-setup.bat` dan `xampp-setup.bat`).
- Hapus panduan-panduan migrasi mentah yang redundan (`LARAVEL_INERTIA_REACT_GUIDE.md`, `docs/LARAVEL_INERTIA_SETUP.md`).

### Tahap 3: Pembersihan Berkas Sampah (Repository Hygiene)
- Hapus `bun.lock`.
- Hapus seluruh berkas temporary patch (`*.cjs`, `patch.txt`, `patch2.txt`, `plan.txt`, `temp.txt`, `tariff_backup.txt`, `sourcemap.*`).

### Tahap 4: Verifikasi & Uji Integritas Sistem
- Jalankan `compile_applet` dan `lint_applet` untuk memastikan pembersihan berkas tidak memengaruhi build runtime aplikasi.
