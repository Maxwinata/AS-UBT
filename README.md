# Portal SI-GABUNG 54 — Sistem Informasi Asrama UBT

> **Pilihan Bahasa / Language Options:**  
> 🇮🇩 **Bahasa Indonesia (Utama)** | [🇬🇧 English Version](README.en.md)

---

## 📌 Tentang Aplikasi

**Portal SI-GABUNG 54** (Sistem Informasi Gerbang Administrasi Baru dan Unit Naungan Asrama Mahasiswa UBT / Roemah 54) adalah platform web terpadu untuk mendigitalkan seluruh siklus hidup administrasi asrama di Universitas Bunda Thamrin. Sistem ini mencakup alur penerimaan 6-langkah calon mahasiswa baru (PMB), penempatan kamar secara *real-time*, penerbitan tagihan berkode unik, verifikasi identitas e-KYC dengan *face liveness*, penandatanganan kontrak digital berbasis OTP WhatsApp (JUKLAK-02 & JUKLAK-03), tiket check-in kode batang (BASTK), hingga penegakan SOP toleransi keterlambatan 5+5 hari bagi penghuni senior.

Aplikasi ini dibangun menggunakan arsitektur **Laravel 11 + Inertia.js 2.0 + React 19 + Tailwind CSS v4** dengan MySQL.

---

## 📚 Indeks Dokumentasi Sistem (Bilingual Index)

Seluruh dokumentasi teknis dan operasional disediakan dalam **Bahasa Indonesia (Utama)** dan **Bahasa Inggris (English Version)**:

| Dokumen | Versi Bahasa Indonesia (Utama) | English Version | Deskripsi Singkat |
| :--- | :--- | :--- | :--- |
| **Spesifikasi Sistem (PRD & SAS)** | [ASRAMA_UBT_SYSTEM_DOCUMENTATION.md](ASRAMA_UBT_SYSTEM_DOCUMENTATION.md) | [ASRAMA_UBT_SYSTEM_DOCUMENTATION.en.md](ASRAMA_UBT_SYSTEM_DOCUMENTATION.en.md) | Dokumen kebutuhan produk, alur 6-langkah, model data, dan rute Inertia controller. |
| **Panduan Laragon (Otomatis)** | [LARAGON_SETUP.md](LARAGON_SETUP.md) | [LARAGON_SETUP.en.md](LARAGON_SETUP.en.md) | Langkah instalasi 1-klik di Laragon via `laragon-setup.bat`. |
| **Panduan XAMPP (Otomatis)** | [XAMPP_SETUP.md](XAMPP_SETUP.md) | [XAMPP_SETUP.en.md](XAMPP_SETUP.en.md) | Langkah instalasi di XAMPP Windows via `xampp-setup.bat`. |
| **Arsitektur & Diagram Logika** | [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | [docs/ARCHITECTURE.en.md](docs/ARCHITECTURE.en.md) | Alur *staging* vs *master*, *concurrency lock* kamar, dan logika transaksi. |
| **Regulasi & JUKLAK Asrama** | [docs/JUKLAK_REFERENCE.md](docs/JUKLAK_REFERENCE.md) | [docs/JUKLAK_REFERENCE.en.md](docs/JUKLAK_REFERENCE.en.md) | Landasan hukum JUKLAK-02 (TTE OTP), JUKLAK-03 & F-22 (Ratifikasi Kolektif), F-19, dan F-02. |
| **Strategi Unggah Aman e-KYC** | [docs/SECURE_UPLOAD_STRATEGY.md](docs/SECURE_UPLOAD_STRATEGY.md) | [docs/SECURE_UPLOAD_STRATEGY.en.md](docs/SECURE_UPLOAD_STRATEGY.en.md) | Kebijakan *private disk*, *versioning audit trail*, dan *Signed URLs* (TTL 15 menit). |
| **Protokol Transisi Identitas** | [docs/identity-transition-protocol.md](docs/identity-transition-protocol.md) | [docs/identity-transition-protocol.en.md](docs/identity-transition-protocol.en.md) | Mekanisme migrasi identitas pendaftaran PMB menuju NIM resmi & SSO kampus. |
| **Pemetaan 5 Skenario Database** | [docs/scenario-mappings.md](docs/scenario-mappings.md) | [docs/scenario-mappings.en.md](docs/scenario-mappings.en.md) | Matriks alur status mahasiswa baru, penghuni aktif, cicilan deposit, dan perpanjangan sewa. |
| **Protokol Sinkronisasi SIDARA** | [docs/sync-sidara-protocol.md](docs/sync-sidara-protocol.md) | [docs/sync-sidara-protocol.en.md](docs/sync-sidara-protocol.en.md) | SOP integrasi sistem akademik kampus dengan basis data operasional asrama. |

---

## ⚡ Quick Start (Menjalankan Sistem)

### Lingkungan Lokal (Windows - Laragon / XAMPP)

1. Pastikan modul MySQL dan Apache/Nginx sudah berjalan.
2. Jalankan skrip setup otomatis sesuai stack Anda:
   - **Laragon**: Klik 2x file `laragon-setup.bat`
   - **XAMPP**: Jalankan `xampp-setup.bat` di terminal XAMPP Shell
3. Buka dua terminal untuk menjalankan dev server:
   - **Terminal 1 (Frontend Vite):** `npm run dev`
   - **Terminal 2 (Backend Laravel):** `php artisan serve`
4. Akses melalui peramban: `http://127.0.0.1:8000` atau `http://asrama-ubt.test`

---

## 🛡️ Hak Cipta & Lisensi
Sistem Informasi Portal Asrama Universitas Bunda Thamrin (UBT) © 2026. Lisensi tertutup di bawah naungan UPA Asrama Mahasiswa UBT.
