# Strategi Pengelolaan Unggah Berkas Aman (e-KYC)

> **Pilihan Bahasa / Language:** 🇮🇩 **Bahasa Indonesia (Utama)** | [🇬🇧 English Version](SECURE_UPLOAD_STRATEGY.en.md)

Dokumen ini memuat panduan arsitektur dan praktik terbaik untuk mengelola berkas unggahan sensitif pengguna secara aman, khususnya Kartu Tanda Penduduk (KTP) dan swafoto biometrik pada Sistem Admisi Asrama UBT. Dokumen ini berfokus pada penanganan berkas saat pendaftaran awal serta alur perbaikan berkas parsial.

---

## 1. Penyimpanan & Enkripsi (Keamanan Data)

Dokumen identitas seperti KTP memuat Data Pribadi Sensitif (PII - *Personally Identifiable Information*). Berkas ini dilarang keras dapat diakses secara publik.

*   **Penyimpanan Privat Penuh:** Seluruh berkas e-KYC wajib disimpan dalam disk/repositori penyimpanan terisolasi yang bersifat *strictly private* (misalnya `storage/app/private_kyc`, Google Cloud Storage, AWS S3, atau Firebase Storage Private Bucket). Izin baca publik (`public-read`) dinonaktifkan total di tingkat direktori/bucket.
*   **Enkripsi saat Tersimpan (*Encryption at Rest*):** Memastikan disk/bucket menerapkan enkripsi standar industri (misalnya AES-256).
*   **Enkripsi saat Transit (*Encryption in Transit*):** Seluruh proses unggah dan unduh dipaksa menggunakan protokol HTTPS/TLS 1.2+.
*   **Mekanisme Akses (Signed URLs):**
    *   Tautan berkas statis langsung (misal: `https://.../ktp.jpg`) harus menghasilkan galat `403 Forbidden`.
    *   Agar Admin Keuangan dapat memverifikasi berkas atau Mahasiswa dapat mempratinjau dokumennya sendiri, API Backend menerbitkan **Short-lived Signed URLs** (URL bertanda tangan digital dengan batas kedaluwarsa singkat).
    *   Masa aktif Signed URL dibatasi ketat (TTL 15 menit sesuai `.env` `KYC_SIGNED_URL_TTL_MINUTES`) guna mencegah penyebaran tautan tanpa izin.

---

## 2. Strategi Penomoran Versi (*Versioning* untuk Jejak Audit)

Pada **Alur Koreksi Parsial**, mahasiswa mungkin diminta mengunggah ulang KTP yang buram atau tidak valid.

*   **Prinsip: JANGAN PERNAH Menimpa (*Overwrite*) Berkas.** Menimpa berkas bernama `ktp_12345.jpg` dengan berkas baru akan memusnahkan konteks historis audit trail. Ketika auditor memeriksa alasan penolakan berkas terdahulu, mereka hanya akan melihat foto baru, yang merusak kesinambungan log pengawasan.
*   **Konvensi Penamaan Unik:** Berkas yang diunggah harus menyertakan penanda unik (UUID atau stempel waktu) pada nama berkasnya:
    *   *Buruk:* `/uploads/ktp/123456.jpg`
    *   *Baik:* `/kyc/ktp/ktp_123456_v169456789_a7b2c9.jpg`
    *   *Baik:* `/kyc/ktp/ktp_123456_550e8400-e29b-41d4-a716-446655440000.jpg`
*   **Pemetaan Basis Data:** Rekord utama mahasiswa (`MabaProfile`) selalu menunjuk ke URL berkas *terbaru/aktif*. Sedangkan riwayat berkas terdahulu dicatat di dalam entri log mutasi (`ModificationLog`), memastikan foto lama yang ditolak tetap dapat ditinjau ulang oleh verifikator.

---

## 3. Manajemen Daur Hidup & Pembersihan Berkas Usang (*Garbage Collection*)

Karena sistem menerapkan strategi *versioning* (tanpa penimpaan), repositori penyimpanan akan menampung berkas lama atau berkas yang ditolak seiring berjalannya waktu.

*   **Aturan Daur Hidup Cloud (*Lifecycle Rules*):** Konfigurasikan kebijakan daur hidup otomatis pada bucket penyimpanan cloud.
*   **Pembersihan Berkas Versi Lama (*Garbage Collection*):**
    *   Versi berkas yang sudah tidak lagi berstatus "aktif" pada profil mahasiswa utama diberi label usang (*stale*).
    *   *Penghapusan:* Berkas usang dapat dihapus secara permanen setelah masa tenggang kepatuhan audit (misalnya 30 hingga 60 hari setelah koreksi disetujui, sesuai `KYC_RETENTION_DAYS=60` di `.env`). Hal ini memberikan waktu yang cukup bagi pengelola untuk mengaudit riwayat sekaligus mencegah pembengkakan biaya penyimpanan.

---

## 4. Validasi Pra-Unggah (Mitigasi Serangan)

Untuk mencegah berkas berbahaya membahayakan integritas sistem:

*   **Pengecekan MIME-Type Ketat:** Tidak hanya mengandalkan ekstensi nama berkas (misal `.jpg`). Backend memeriksa *magic numbers* biner dari berkas untuk memastikan berkas tersebut benar-benar bertipe `image/jpeg` atau `image/png`.
*   **Batasan Ukuran File:** Menerapkan batas maksimal (maks. 5MB per gambar) baik di sisi klien (*frontend*) untuk menghemat kuota, maupun di sisi server (*backend*) untuk mencegah serangan *Denial of Service* via kehabisan ruang disk.
*   **Header Keamanan:** Penayangan dokumen privat dilengkapi header `X-Content-Type-Options: nosniff` serta `Content-Disposition` yang aman guna mencegah serangan *stored Cross-Site Scripting* (XSS).
