# Kesiapan Operasional Go-Live: Portal Registrasi & Booking Asrama Hari Ini di Web Hosting Terpadu

Dokumen rencana kerja ini merinci langkah-langkah konkret dan arsitektur operasional yang harus dijalankan **hari ini** agar portal pendaftaran dan reservasi kamar asrama berfungsi penuh (*production-ready*) untuk calon mahasiswa baru (Maba) dan Administrator Asrama/Keuangan di dalam satu lingkungan **Web Hosting terpadu yang sama**.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> Berdasarkan jawaban klarifikasi operasional dari pengguna, arsitektur go-live hari ini ditetapkan dengan 3 pilar utama:

- **Confirmed Decision 1: Satu Lingkungan Web Hosting Terpadu (*Unified Hosting*)**  
  Portal registrasi mahasiswa dan dashboard Web Admin beroperasi di server/domain web hosting yang sama. Tidak diperlukan instalasi server terpisah; navigasi antar-peran dilindungi otentikasi berbasis peran (*role-based gate*) dengan transisi mulus.
- **Confirmed Decision 2: Login Instan Nomor PMB / NIM Hasil Impor SIDARA**  
  Mahasiswa baru tidak perlu mendaftar akun dari nol. Mereka langsung masuk menggunakan Nomor Registrasi PMB atau NIM resmi yang telah tersinkronisasi di tabel staging `siakad_mahasiswa_stg`. Seluruh biodata akademik (nama, prodi, fakultas, NIK, jalur beasiswa/reguler) langsung terisi otomatis (*smart pre-fill*) tanpa risiko salah ketik.
- **Confirmed Decision 3: Verifikasi Admin Sebelum Kamar & Tiket Sah Dihuni**  
  Ketika mahasiswa memilih kamar di Tahap 2, sistem melakukan penguncian kamar permanen berstatus `BOOKED_STAGING` di database staging agar tidak diserobot pendaftar lain. Namun, kamar dan e-Ticket izin masuk asrama baru resmi diterbitkan (*dispatched*) setelah Admin Keuangan dan Admin Asrama mengesahkan bukti transfer serta berkas e-KYC melalui tombol *Approve & Migrate*.

---

## 1. Overview & Core Concept

- **What It Does**: Membuka layanan registrasi dan reservasi hunian asrama secara langsung (*live*) bagi ratusan calon mahasiswa baru Universitas Bunda Thamrin (UBT), memfasilitasi pemilihan gedung & kamar, kalkulasi otomatis tarif sewa/deposit berdasarkan hak beasiswa KIP atau Reguler, pengunggahan bukti bayar bank, pengesahan kontrak tinggal digital via OTP WhatsApp, serta penyediaan layar moderasi admin untuk mengesahkan hunian dan mencetak tiket barcode check-in.
- **Target Audience / Persona**:
  - **Calon Mahasiswa Baru (PMB / Maba)**: Mengakses portal dari smartphone atau laptop untuk mengamankan kamar asrama dengan pengalaman bebas ketik ulang (*zero redundant typing*).
  - **Admin Keuangan & Asrama**: Memeriksa antrean pembayaran di hari H, memverifikasi kesesuaian struk bank dengan rekening koran asrama, mengonfirmasi alokasi kamar, dan memvalidasi keaslian berkas e-KYC.
- **Key Value**: Mencegah kekacauan operasional (*race condition* perebutan kamar), menjamin transparansi tagihan tanpa manipulasi tarif, dan memastikan data pendaftaran terhubung langsung ke buku besar akuntansi asrama.

---

## 2. User Experience & Visual Design

- **Key User Flows**:
  1. **Gerbang Masuk Mahasiswa (Instant Login)**: Calon mahasiswa membuka portal -> memilih tab *Mahasiswa Baru* -> memasukkan Nomor Registrasi PMB (misal: `PMB2026-08942`, `PMB-BTT-002-001`, atau NIM) -> sistem mencocokkan data ke tabel `siakad_mahasiswa_stg` -> mahasiswa langsung masuk ke beranda registrasi dengan nama dan program studi yang telah terpasang resmi.
  2. **Tahap 1 (Biodata & e-KYC)**: Biodata utama terkunci otomatis dari SIDARA. Mahasiswa melengkapi kontak darurat orang tua/wali dan mengunggah foto KTP serta foto selfie. Berkas disimpan ke storage privat dengan penomoran versi yang tidak dapat ditimpa (*immutable audit trail*). Terdapat auto-save hybrid ke database dan local backup.
  3. **Tahap 2 (Kunci Kamar & Kuota Real-Time)**: Mahasiswa melihat denah kamar per gedung (Gedung A, B, C, D) dengan informasi kuota sisa. Memilih kamar mengunci kuota di staging (`BOOKED_STAGING`). Kartu status kamar menampilkan badge status terkunci.
  4. **Tahap 3 (Tagihan & Unggah Struk Transfer)**: Sistem mengalkulasi tagihan otomatis sesuai SK Rektor: tarif reguler Rp 500.000/bln atau subsidi KIP Rp 0 (sesuai status verifikasi subsidi SIDARA). Mahasiswa mengunggah foto struk transfer Bank Mandiri/BSI atau nomor Virtual Account.
  5. **Tahap 4 (Kontrak Digital & OTP)**: Mahasiswa menandatangani Pakta Integritas dan Kontrak Tinggal di atas canvas digital, memasukkan kode OTP verifikasi WhatsApp, lalu menekan *"Kirim Pendaftaran Final"*. Status berpindah ke *Menunggu Verifikasi Admin*.
  6. **Aksi Admin (One-Click Approval & e-Ticket Generation)**: Admin Keuangan membuka tab *Ledger & Bridging* -> melihat struk transfer -> mengklik *"Approve & Migrate"* -> data otomatis terpromosi ke master `pembayaran`, `transaksi`, dan `penyewa`. Status kamar berubah menjadi `OCCUPIED`. Dashboard mahasiswa seketika menerbitkan **e-Ticket Check-In Resmi Berbarcode**.

- **Visual Identity & Theme**:
  - *Aesthetic Direction*: Utilitarian institusional perguruan tinggi, bersih, kontras tinggi, tata letak informasi padat tanpa ornamen floating tak berfaedah (*anti-AI slop discipline*).
  - *Color Tokens*: Base slate (`slate-900`/`slate-950`), aksen institusi UBT (`indigo-700`/`teal-700`), indikator amber (`amber-600`) untuk penelaahan verifikasi, dan emerald (`emerald-600`) untuk data yang telah terpromosikan dan lunas.
  - *Typography*: Plus Jakarta Sans untuk teks antarmuka dan navigasi, JetBrains Mono untuk NIK, Nomor PMB, No. Invoice, dan kode barcode tiket.
  - *Zero-Pill Discipline*: Label metadata disajikan dengan tipografi bersih bersekat titik (`·`) tanpa kapsul statis berwarna-warni yang berlebihan.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Penyimpanan Hybrid Auto-Save (MySQL Backend + LocalStorage Offline Backup)**
  - *Chosen Approach*: Setiap ketukan data atau pemilihan kamar langsung memicu auto-save latar belakang ke database staging MySQL dan dicadangkan ke LocalStorage peramban.
  - *Why*: Calon mahasiswa sering mengalami putus koneksi saat mengisi formulir di ponsel; data tidak boleh hilang atau mengharuskan mereka mengisi ulang dari awal.
- **Decision 2: Kunci Kamar Permanen di Staging Sebelum Pembayaran Terverifikasi (`BOOKED_STAGING`)**
  - *Chosen Approach*: Segera setelah kamar dipilih di Tahap 2, kapasitas kamar di database staging dikunci dengan status `BOOKED_STAGING`.
  - *Why*: Mencegah dua mahasiswa memilih kamar yang sama di detik yang bersamaan (*double-booking prevention*). Kamar hanya akan dilepas jika pendaftaran dibatalkan atau ditolak admin.
- **Decision 3: Pemisahan Otoritas Admin Keuangan & Admin Asrama dalam Satu Portal**
  - *Chosen Approach*: Admin Keuangan mengesahkan validitas mutasi uang masuk dan hak subsidi tarif; Admin Asrama mengawasi keaslian berkas KYC fisik, penempatan ranjang, dan penerbitan BASTK.
  - *Why*: Memenuhi prinsip *Separation of Duties* (SoD) sesuai rekomendasi audit universitas tanpa memerlukan dua aplikasi terpisah.

---

## 4. Technical Architecture & Data Strategy *(Technical Reference)*

### Diagram Alur Registrasi, Reservasi, dan Pengesahan Hari Ini

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│              PORTAL ASRAMA UBT - ALUR GO-LIVE REGISTRASI & BOOKING HARI INI            │
└────────────────────────────────────────────────────────────────────────────────────────┘

 [CALON MAHASISWA BARU (PMB)]                                [ADMINISTRATOR KEUANGAN & ASRAMA]
               │                                                            │
               ▼                                                            │
  1. Halaman Login Mahasiswa Baru                                           │
     • Input No. PMB / NIM (cth: PMB2026-08942)                             │
     • Validasi instan ke tabel `siakad_mahasiswa_stg`                      │
               │                                                            │
               ▼                                                            │
  2. Tahap 1: Biodata & e-KYC                                               │
     • Smart Pre-fill Nama, NIK, Prodi dari SIDARA                          │
     • Simpan KTP & Selfie ke Private Storage Berversi                      │
     • Auto-save Hybrid ke DB + LocalStorage                                │
               │                                                            │
               ▼                                                            │
  3. Tahap 2: Kunci Reservasi Kamar                                         │
     • Pilih Gedung (A/B/C/D) & Nomor Kamar                                 │
     • SQL Staging Lock: `status = 'BOOKED_STAGING'`                        │
     • Mencegah race-condition bentrok kamar                                │
               │                                                            │
               ▼                                                            │
  4. Tahap 3: Tagihan & Upload Struk Transfer                               │
     • Deteksi otomatis Subsidi KIP (Rp 0) vs Reguler (SK Rektor)           │
     • Upload bukti bayar Bank Mandiri / BSI / VA                           │
               │                                                            │
               ▼                                                            │
  5. Tahap 4: Kontrak Digital & OTP WA                                      │
     • Tanda tangan digital Pakta Integritas (F-02)                         │
     • Verifikasi OTP WhatsApp                                              │
     • Submit Final Pendaftaran                                             │
               │                                                            │
               └───────────────> [ANTREAN VERIFIKASI ADMIN] ────────────────┘
                                            │
                                            ▼
                               6. Panel Admin: Review & Pengesahan
                                  • Verifikasi Bukti Bayar & Hak Subsidi
                                  • Verifikasi Kecocokan Wajah e-KYC
                                  • Klik tombol: [APPROVE & MIGRATE]
                                            │
                                            ▼
                               7. Promosi Transaksional ke Master:
                                  • INSERT / UPDATE `pembayaran`
                                  • INSERT / UPDATE `pembayaran_detail`
                                  • INSERT / UPDATE `transaksi` (Ledger Kas)
                                  • INSERT / UPDATE `penyewa` (Kamar Terisi)
                                  • UPDATE `rooms` (`kapasitas_terisi` +1)
                                            │
               ┌────────────────────────────┘
               ▼
  8. Penerbitan e-Ticket Check-In Resmi
     • Tiket berbarcode muncul otomatis di HP Maba
     • Nomor kamar sah dan izin masuk asrama aktif
```

---

## 5. Checklist Konkret & Langkah yang Harus Dilakukan Hari Ini

Agar portal registrasi dan booking dapat langsung digunakan hari ini di web hosting terpadu, berikut daftar tindakan teknis dan operasional yang harus dijalankan:

### Langkah 1: Persiapan Database & Migrasi SQL di Web Hosting
1. Pastikan database MySQL (`asrama_ubt_db`) telah menjalankan migrasi terbaru:
   ```bash
   php artisan migrate
   ```
2. Pastikan tabel master referensi telah terisi:
   - `rooms` (Daftar Gedung A, B, C, D beserta kapasitas dan status)
   - `tariffs` & `payment_schemes` (Master tarif SK Rektor & cicilan)
   - `api_link` (Konfigurasi endpoint SIDARA)

### Langkah 2: Impor Lengkap Data Calon Mahasiswa dari SIDARA
Tarik seluruh data pendaftar SIDARA agar mahasiswa dapat langsung login:
- Jalankan di terminal hosting / Laragon:
  ```bash
  php artisan sidara:import-api
  ```
  *Atau gunakan tombol **"Tarik & Impor Lengkap SIDARA"** di tab Integrasi SIDARA pada portal admin.*
- Hasil: 100% data pendaftar (Beasiswa Khusus `BTT-006` dan KIP `BTT-002`) tersimpan di `siakad_mahasiswa_stg`.

### Langkah 3: Konfigurasi Endpoint Publik & Environment Hosting
1. Periksa berkas `.env` di web hosting:
   - `APP_URL=https://nama-domain-asrama-ubt.ac.id` (atau URL preview aktif)
   - `DB_DATABASE=asrama_ubt_db`
   - `FILESYSTEM_DISK=private_kyc` (atau local storage private dengan akses signed URL)
2. Pastikan symbolic link storage telah dibuat:
   ```bash
   php artisan storage:link
   ```

### Langkah 4: Penyempurnaan Sinkronisasi Data Registrasi ke Antrean Admin
1. Pastikan setiap pengajuan pendaftaran Maba yang selesai (Tahap 1–4) langsung muncul di:
   - **Admin Keuangan**: Tab *Verifikasi Pembayaran & Ledger* dengan badge antrean belum diverifikasi.
   - **Admin Asrama**: Tab *Verifikasi Masal e-KYC* dan *Room Plotting*.
2. Memastikan tombol aksi admin **"Approve & Migrate"** mengeksekusi transaksi migrasi ke tabel master (`pembayaran`, `transaksi`, `penyewa`, `rooms`).

### Langkah 5: Penerbitan Otomatis e-Ticket di Sisi Mahasiswa
1. Ketika status verifikasi diubah menjadi disetujui (`status_verifikasi = 1`), layar mahasiswa secara reaktif menampilkan **Lembar e-Ticket Check-In Asrama** yang memuat:
   - Barcode identitas check-in
   - Alokasi definitif gedung & nomor kamar
   - Tanggal jadwal kedatangan dan perlengkapan asrama yang wajib dibawa

### Langkah 6: Uji Coba Simulasi Pendaftaran Lengkap (*Smoke Test*)
1. Uji login calon mahasiswa dengan No. PMB: `PMB2026-08942` (Jalur Beasiswa Khusus) dan `PMB-BTT-002-001` (Jalur KIP).
2. Simulasikan pengisian dari Tahap 1 hingga Tahap 4.
3. Beralih ke layar Admin Keuangan, lakukan persetujuan (*Approve & Migrate*).
4. Verifikasi kembalinya mahasiswa ke beranda untuk melihat e-Ticket resmi yang telah terbit.
5. Jalankan `npm run build` dan pastikan kompilasi bebas eror.

---

## 6. Rencana Verifikasi Teknis

- **Kompilasi & Linter**: Menjalankan `compile_applet` dan `lint_applet` untuk menjamin tidak ada regresi kode atau eror TypeScript.
- **Uji Coba Alur Nyata**: Memastikan alur mulai dari login PMB SIDARA -> booking kamar -> verifikasi admin -> tiket check-in terhubung secara mulus tanpa *dead-end*.
