# Protokol Transisi Identitas & Komunikasi
## Dari Nomor Registrasi PMB Menuju NIM / SSO Resmi (Booking -> Penyewa)

> **Pilihan Bahasa / Language:** 🇮🇩 **Bahasa Indonesia (Utama)** | [🇬🇧 English Version](identity-transition-protocol.en.md)

---

## 1. Ikhtisar & Tujuan
Dokumen ini menguraikan prosedur operasional standar (SOP) dan protokol komunikasi untuk mentransisikan mahasiswa baru (Maba) dari identitas pendaftaran sementara (No. Registrasi PMB) menuju identitas resmi universitas (NIM & akun SSO).

Transisi ini sangat krusial secara struktural karena **seluruh kontrak perjanjian hunian asrama (Langkah 5) WAJIB ditandatangani menggunakan NIM resmi yang sah**, bukan nomor registrasi pendaftaran sementara.

---

## 2. Lini Masa Transisi & Titik Pemicu

| Fase | Status Sistem | Metode Masuk | Aksi / Pemicu Transisi |
| :--- | :--- | :--- | :--- |
| **Fase 1: Pendaftaran Awal** | `STAGING` (Langkah 1 - 3) | Akun Sementara (`PMB-XXX`) | Maba melengkapi e-KYC dan membayar tagihan awal. |
| **Fase 2: Pemesanan Kamar** | `BOOKING` (Langkah 4) | Akun Sementara (`PMB-XXX`) | Admin Keuangan menyetujui pembayaran. Menunggu terbitnya NIM dari sistem akademik (SIDARA). |
| **Fase 3: Eksekusi Migrasi** | `SYNC_IN_PROGRESS` | **Transisi Berlangsung** | Admin mengklik "Sinkronisasi NIM & Migrasi". Backend memetakan NIM dan membuat akun SSO. |
| **Fase 4: Penyewa Resmi** | `PENYEWA` (Langkah 5+) | **SSO Universitas (NIM)** | Mahasiswa masuk via SSO, menandatangani kontrak digital, dan resmi menjadi penghuni aktif. |

---

## 3. Strategi Komunikasi 3 Lapis (3-Layered Approach)

Untuk mencegah kebingungan pengguna saat kredensial pendaftaran sementara (`PMB-XXX`) mereka dinonaktifkan, sistem menerapkan strategi komunikasi 3 lapis:

### Lapis A: Pengkondisian Informasi (Antarmuka Langkah 4)
Saat mahasiswa berada di Langkah 4 menunggu penerbitan NIM, sistem menampilkan pemberitahuan proaktif:
* **Pesan UI:** *"Pembayaran deposit Anda telah diverifikasi. Kami sedang menunggu Nomor Induk Mahasiswa (NIM) resmi Anda diterbitkan oleh Universitas."*
* **Catatan Penting:** *"Setelah NIM resmi diterbitkan, sesi pendaftaran ini akan diakhiri secara otomatis. Anda akan diminta untuk masuk kembali menggunakan SSO Universitas (NIM) untuk menandatangani kontrak."*

### Lapis B: Notifikasi Otomatis (Email / WhatsApp)
* **Pemicu:** Dieksekusi seketika (*synchronously*) saat Admin Keuangan menekan tombol "Sinkronisasi NIM & Migrasi".
* **Aksi:** Sistem menonaktifkan login PMB dan mengirimkan notifikasi resmi ke nomor kontak dan email pribadi mahasiswa.
* **Isi Pesan:** Memberitahukan bahwa NIM resmi telah terbit dan menginstruksikan mahasiswa untuk masuk ke portal melalui tombol "Login SSO" guna menyelesaikan penandatanganan kontrak kamar.

### Lapis C: Intersepsi Sesi Aktif (*Graceful Live Interception*)
Jika mahasiswa sedang membuka antarmuka portal asrama saat Admin menjalankan migrasi:
1. Sisi antarmuka mendeteksi perubahan status `isMigrated = true`.
2. Sistem memunculkan jendela modal pemblokir (*blocking overlay*).
3. **Pesan Modal:** *"Selamat! NIM resmi Anda telah diterbitkan. Demi keamanan dan legalitas penandatanganan kontrak, silakan masuk kembali menggunakan akun SSO Universitas Anda."*
4. **Tindakan Pengguna:** Tombol **"Keluar & Menuju Portal SSO"** menghapus sesi sementara dan mengarahkan mahasiswa ke gerbang login SSO kampus.

---

## 4. Mengapa SSO Diwajibkan Sebelum Langkah 5?
1. **Keabsahan Hukum (*Non-Repudiation*):** Kontrak hunian asrama adalah perjanjian finansial dan legal yang mengikat. Nomor registrasi PMB bersifat sementara, sedangkan NIM adalah identitas hukum resmi di lingkungan universitas.
2. **Keamanan & Kepemilikan Akun:** Mewajibkan login SSO membuktikan bahwa mahasiswa telah mengklaim akun email resmi kampus dan memegang kredensialnya sendiri, menambahkan lapisan verifikasi identitas sebelum menandatangani pakta tanggung jawab sewa.
