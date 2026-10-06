# Product & Technical Requirements Document (PRD & SAS)
**Sistem Informasi Portal Asrama Universitas Bunda Thamrin (UBT)**

---

## 1. Visi & Objektif Produk
**Visi:**
Menyediakan platform digital terpadu untuk memfasilitasi proses admisi, pembayaran, penempatan kamar, dan manajemen operasional Asrama UBT secara efisien, transparan, dan terotomatisasi.

**Objektif:**
- Mengurangi antrean fisik dan proses manual administrasi asrama.
- Menyediakan alur admisi 6-langkah (6-steps admission) yang intuitif untuk Calon Mahasiswa (Maba).
- Memisahkan wewenang operasional antara bagian Keuangan (verifikasi pembayaran) dan bagian Asrama (penempatan kamar).
- Mendigitalkan kontrak/pakta integritas menggunakan verifikasi OTP WhatsApp.
- Memfasilitasi proses *check-out* dan pengembalian uang deposit (refund) untuk penghuni lama.

---

## 2. Target Pengguna (User Personas)
1. **Calon Mahasiswa / Mahasiswa Baru (Maba)**
   - Kebutuhan: Mendaftar asrama, melihat tagihan, melakukan pembayaran, mengetahui kamar yang didapat, dan mendapatkan e-Ticket.
2. **Mahasiswa Eksisting (Penghuni Lama)**
   - Kebutuhan: Memantau status hunian, mengajukan proses *check-out*, dan memantau status pengembalian deposit (refund).
3. **Admin Keuangan**
   - Kebutuhan: Memverifikasi bukti pembayaran transfer manual secara cepat dan mengubah status tagihan mahasiswa menjadi *PAID*.
4. **Admin Asrama**
   - Kebutuhan: Memantau ketersediaan kamar, melakukan *plotting* kamar, menyetujui *check-out*, dan mengakses *development tools*.

---

## 3. Arsitektur Sistem & Tech Stack
### A. Teknologi
- **Frontend (UI/UX):** React.js + Tailwind CSS (di production di-render via Inertia.js).
- **Backend:** Laravel (PHP 8.x+).
- **Database:** MySQL / MariaDB.
- **Ikon & Tipografi:** Lucide Icons, Google Fonts (Inter).

### B. Komunikasi & Keamanan
- **Protokol:** Frontend berinteraksi dengan backend menggunakan **RESTful API** (JSON) melalui AJAX/Axios (atau via Inertia).
- **Autentikasi:** Laravel Sanctum (Token API) atau Session-based Auth.
- **Keamanan File:** Dokumen sensitif (e-KYC KTP/Selfie) disimpan di folder `storage/app/private` (tidak publik) dan diakses via Signed URL.

---

## 4. Alur Autentikasi & Login (Dual Tab)
Halaman login menggunakan antarmuka *Dual Tab* untuk memisahkan jalur masuk:

### A. Tab Login Maba
- **Target:** Mahasiswa baru yang belum memiliki akses SSO penuh.
- **Kredensial:** Nomor Registrasi PMB & Tanggal Lahir.
- **Logika:** Jika valid, diarahkan ke **Dashboard Pendaftaran Maba (Langkah 1: e-KYC)**. Terhubung dengan `POST /api/auth/maba-login`.

### B. Tab Login SSO (Mahasiswa Eksisting)
- **Target:** Mahasiswa dengan akun SIAKAD aktif.
- **Kredensial:** Username / NIM & Password SSO SIAKAD.
- **Logika Multi-Tahap:**
  1. **SSO Auth:** Validasi ke gateway SIAKAD UBT.
  2. **Query DB_ASRAMA:** Cek status aktif di database asrama.
  3. **Evaluasi Status:**
     - *Active Resident:* Diarahkan ke Dashboard Mahasiswa Eksisting.
     - *Non-Active Resident:* Memunculkan **Modal Redirect** menuju proses Pendaftaran 6-Langkah. Terhubung dengan `POST /api/auth/sso-login`.

---

## 5. Fitur Utama & Ruang Lingkup (Modul & CRUD)

### A. Modul Pendaftaran & e-KYC (Langkah 1)
Mahasiswa mengisi form dan mengunggah dokumen identitas.
- **API Create:** `POST /api/admissions/register` -> validasi & simpan ke tabel `users` dan pindah file ke `storage/app/private/ekyc`.
- **API Read:** `GET /api/admissions/status`.
- **API Update:** `POST /api/admissions/ekyc/update` (Jika ditolak Admin).

### B. Modul Keuangan & Pembayaran (Langkah 2 & 3)
- **API Create (Upload Bukti):** `POST /api/payments/manual-transfer`. Data path gambar & kode unik 3 digit disimpan.
- **API Read:** `GET /api/bills/my-bill` (Maba) dan `GET /api/admin/payments/pending` (Admin).
- **API Update:** `PUT /api/admin/payments/{id}/verify` (Admin Setuju).

### C. Modul Penetapan Kamar / Plotting (Langkah 4)
- **API Read:** `GET /api/admin/rooms/availability` (Admin memantau kuota).
- **API Create:** `POST /api/admin/rooms/plot` (Menetapkan kamar).
- **API Update/Delete:** `PUT /api/admin/rooms/move/{id}` atau `DELETE /api/admin/rooms/plot/{id}`.

### D. Modul Kontrak Digital & OTP WhatsApp (Langkah 5)
- **API Create (Request):** `POST /api/contracts/request-otp` (trigger webhook WA).
- **API Create (Verify):** `POST /api/contracts/verify-otp`. Jika valid, generate barcode string.

### E. Modul Aktivasi / Check-In (Langkah 6)
- **API Read:** `GET /api/tickets/active` (Maba melihat QR Code).
- **API Update:** `POST /api/admin/checkin/scan/{ticket_code}` (Security scan QR).

---

## 6. Pemetaan Database (Field Mapping)

### Fase 1: Pendaftaran & e-KYC
*Form pendaftaran terbagi menjadi 5 kelompok data:*

**Kelompok 1: Data Akademik**
| Field Frontend | Target Tabel | Kolom | Keterangan |
| --- | --- | --- | --- |
| Nama Lengkap | `users` | `name` | Biodata login |
| NIM | `admission_applications` / `users` | `nim` | Identifier |
| Fakultas/Prodi | `admission_applications` | `faculty` | - |
| Jenis Kelamin | `admission_applications` | `gender` | ENUM('L','P') |

**Kelompok 2: Kontak Pribadi**
| Field Frontend | Target Tabel | Kolom | Keterangan |
| --- | --- | --- | --- |
| Email | `users` | `email` | Kontak & login |
| No HP / WA | `admission_applications` | `whatsapp_number` | OTP WA |
| Alamat Domisili | `admission_applications` | `alamat_domisili` | - |
| Alamat Asal | `admission_applications` | `alamat_asal` | - |

**Kelompok 3: Kontak Darurat**
| Field Frontend | Target Tabel | Kolom | Keterangan |
| --- | --- | --- | --- |
| Nama Kontak | `admission_applications` | `emergency_contact_name` | - |
| Hubungan | `admission_applications` | `emergency_contact_relation`| Ayah/Ibu/Wali |
| No HP Darurat | `admission_applications` | `emergency_contact_phone` | - |
| Alamat Darurat | `admission_applications` | `emergency_contact_address` | - |

**Kelompok 4: Preferensi Hunian**
| Field Frontend | Target Tabel | Kolom | Keterangan |
| --- | --- | --- | --- |
| Tipe Kamar | `admission_applications` | `room_preference_type` | - |
| Pref. Lantai | `admission_applications` | `room_preference_floor` | - |
| Keb. Khusus | `admission_applications` | `special_needs` | Disabilitas (opsional) |
| Catatan Sehat | `admission_applications` | `health_notes` | Penyakit bawaan |

**Kelompok 5: Upload Dokumen / e-KYC**
| Field Frontend | Target Tabel | Kolom | Keterangan |
| --- | --- | --- | --- |
| KTP | `admission_identity_verifications` | `ktp_image_path` | Storage private |
| Selfie+KTP | `admission_identity_verifications` | `selfie_image_path`| Storage private |
| Status KYC | `admission_identity_verifications` | `status` | ENUM(PENDING, VERIFIED) |

### Fase 2: Pembayaran
| Field Frontend | Target Tabel | Kolom | Keterangan |
| --- | --- | --- | --- |
| Total Tagihan | `admission_bills` | `total_amount` | Nominal + 3 Digit Unik |
| File Struk | `admission_payment_proofs` | `proof_image_path` | Upload bukti bayar |
| Status | `admission_bills` | `payment_status` | ENUM(UNPAID, PENDING, PAID) |

### Fase 3: Kontrak Digital
| Field Frontend | Target Tabel | Kolom | Keterangan |
| --- | --- | --- | --- |
| Checkbox Setuju | `admission_contracts` | `is_agreed` | BOOLEAN |
| Kode OTP | `admission_contract_otp_logs` | `otp_code` | VARCHAR rahasia |
| Status OTP | `admission_contract_otp_logs` | `status_verified`| BOOLEAN |

### Fase 4: e-Ticket
| Field Frontend | Target Tabel | Kolom | Keterangan |
| --- | --- | --- | --- |
| String Barcode | `admission_checkin_tickets` | `ticket_code` | TKT-UBT-XYZ |
| Status Scan | `admission_checkin_tickets` | `status` | ENUM(PENDING, SCANNED) |

---

## 7. Fase Proyek & Siklus Pengembangan (SDLC)
Dokumen ini menguraikan tahapan pengembangan berkelanjutan (Continuous Development) untuk Sistem Informasi Portal Asrama UBT. Pendekatan ini menggabungkan praktik Agile dan proses non-linear untuk memastikan kualitas, keamanan, dan skalabilitas aplikasi.

### DISCOVERY & PLANNING *(Non-linear)*
- **Requirement gathering:** Mengumpulkan kebutuhan spesifik dari stakeholder (Admin Asrama, Admin Keuangan, Mahasiswa) terkait alur pendaftaran 6-langkah, e-KYC, dan integrasi SIAKAD/SSO.
- **Architecture discussion:** Mendiskusikan pola arsitektur (Frontend React, Backend Laravel) dan perlindungan penyimpanan *private storage* untuk e-KYC.
- **Tech stack selection:** Menetapkan penggunaan React.js, Tailwind CSS, Laravel, dan MySQL/MariaDB.
- **Feasibility analysis:** Menganalisis kelayakan teknis integrasi gateway SSO SIAKAD, verifikasi pembayaran, dan *geofencing*.
- **Risk assessment:** Mengidentifikasi risiko *fraud* e-KYC, kegagalan verifikasi OTP, celah keamanan *endpoint*, serta merancang prosedur mitigasinya.

### SETUP & SCAFFOLDING *(Parallel)*
- **Repository setup:** Inisialisasi Git repository untuk Frontend dan Backend beserta strategi *branching* (seperti GitFlow).
- **Environment configuration:** Menyiapkan konfigurasi variabel lingkungan (`.env`) untuk fase *development*, *staging*, dan *production*.
- **Database planning:** Merancang Entity Relationship Diagram (ERD), skema *migration* Laravel, dan memetakan relasi antar tabel utama.
- **API contract definition:** Membuat draf dan menyepakati spesifikasi RESTful API (*request/response payload* JSON) sebagai jembatan komunikasi Frontend dan Backend.
- **Component design:** Merancang hierarki komponen UI berbasis *atomic design*, sistem desain Tailwind, dan prototipe *dashboard* interaktif.

### DEVELOPMENT *(Concurrent/Iterative)*
- **Backend:** Implementasi *Models* (ORM Eloquent) → *Controllers* (Logika Bisnis) → *Routes* (Endpoints API dan Middleware/Sanctum).
- **Frontend:** Membangun *Components* (UI terisolasi) → *Pages* (Integrasi tata letak penuh) → *Integration* (Koneksi fungsional ke REST API via Axios).
- **Testing:** Pelaksanaan *Unit Testing* (validasi logika murni), *Integration Testing* (interaksi basis data dan API), dan *E2E Testing* (simulasi perjalanan pengguna utuh dari awal hingga akhir).
- **DevOps:** Membangun *CI/CD pipeline* (Continuous Integration/Continuous Deployment) untuk otomatisasi pengujian, *linting*, dan *build*.
- **Documentation:** Memperbarui dokumen PRD, spesifikasi teknis, rancangan struktur data, dan arsitektur sistem yang bersifat hidup (berkelanjutan).

### ITERATION & REFINEMENT *(Agile sprints)*
- **Code review:** Pemeriksaan kode sejawat (*Peer Review*) untuk menjaga standar kualitas struktur dan mengurangi potensi kutu (*bug*).
- **Refactoring:** Mengelola *technical debt* dengan merapikan struktur kode agar lebih bersih dan mudah dipelihara tanpa mengubah fungsionalitas aslinya.
- **Performance optimization:** Pencegahan inefisiensi seperti kendala N+1 Query pada ORM, pengaktifan sistem *caching*, serta minimalisasi ukuran *bundle* untuk performa perenderan UI.
- **Security audit:** Audit komprehensif mendeteksi kerentanan SQL *Injection*, XSS, CSRF, dan kebocoran akses terhadap berkas KTP mahasiswa.
- **Feedback implementation:** Sinkronisasi penyesuaian fungsional berbekal wawasan dari hasil *User Acceptance Testing* (UAT).

### DEPLOYMENT *(Continuous)*
- **Staging environment:** Pemutakhiran bertahap (*Deployment*) ke dalam *server staging* agar replika operasional bisa diverifikasi dan diuji secara final tanpa mengganggu sistem nyata.
- **Production rollout:** Mempublikasikan kode aplikasi termutakhir ke *production server* demi memfasilitasi penggunaan mahasiswa yang sebenarnya.
- **Monitoring:** Pengawasan proaktif mengandalkan *System Audit Logs*, jejak *error*, pantauan aktivitas anomali log masuk (*login event*), serta performa server (*uptime/latency*).
- **Maintenance:** Eksekusi kegiatan perawatan termasuk *patch* keamanan (*security patch*), pencadangan pangkalan data (rutin), serta pembaruan versi ketergantungan modul sistem (*library dependencies*).

---

## 8. Strategi Integrasi Database (Frontend Maba & Web Admin Laravel)
Berdasarkan kesepakatan arsitektur (**Opsi 1: Staging Tables & Migration via API**), integrasi antara portal pendaftaran (Frontend React) dengan sistem manajemen asrama (Web Admin Laravel) dilakukan dengan skema berikut:

### 1. Konsep "Staging Tables" (Tabel Penampungan Sementara)
Portal pendaftaran (Frontend) **TIDAK AKAN** menimpa atau menulis langsung ke tabel master (`penyewa`, `pembayaran`, `users`). Sebaliknya, data pendaftaran akan disimpan di tabel *staging* (sementara), seperti:
- `stg_maba` (Menyimpan profil pendaftaran, e-KYC KTP, preferensi).
- `stg_invoices` (Menyimpan tagihan, bukti transfer, dan kode unik).
- `stg_contracts` (Menyimpan OTP WA dan persetujuan tata tertib).

### 2. Alur Migrasi (Mapping to Master)
Ketika **Admin Keuangan** memverifikasi bukti transfer dan e-KYC di Web Admin (Laravel), sistem backend akan memicu proses persetujuan (*Approve Action*). Proses ini secara otomatis akan memigrasikan data dari tabel *staging* ke tabel master:
- **`stg_maba` -> `penyewa`**: Data NIM, Nama Lengkap, No KTP, Email, dan Alamat di-insert ke tabel `penyewa`.
- **`stg_invoices` -> `pembayaran`**: Data Total Bayar, No Invoice, dan Status Pembayaran di-insert ke tabel `pembayaran`.
- **`stg_maba` -> `users`**: Dibuatkan akun otentikasi login/SSO di tabel `users` dengan `identifier` = NIM.

### 3. Keuntungan Pendekatan Ini
- **Aman**: Data master (penghuni eksisting) tidak berisiko korup atau tertimpa oleh *spam* pendaftaran palsu.
- **Terisolasi**: Proses administrasi pendaftaran maba berjalan mandiri tanpa membebani tabel relasional operasional asrama sehari-hari.
- **Verifikasi Kokoh**: Memaksa adanya gerbang persetujuan admin keuangan sebelum maba resmi dianggap sebagai "Penyewa".

### 4. Tabel Master & Referensi (Reference Tables)
Sesuai struktur dari database SQL Web Admin, data yang diinput oleh maba pada tabel staging (`stg_maba`) akan merujuk (ForeignKey reference) kepada tabel referensi master:
- **`provinces`** & **`regencies`**: Digunakan untuk dropdown pengisian data alamat/kontak pribadi Maba saat pendaftaran, memastikan standarisasi format wilayah di Indonesia.
- **`lantai`** & **`kamar`**: Referensi kapasitas, jenis (tipe_asrama), dan nomor kamar untuk keperluan plotting asrama bagi pendaftar yang sudah membayar dan diverifikasi. `stg_contracts` akan berelasi langsung dengan `kamar` (room_id).

### 5. Struktur Pengisian Alamat
Data alamat pada formulir profil (tahap e-KYC) dipecah menjadi dua bagian (KTP dan Domisili) dengan format terstruktur:
- `alamatKtpJalan` (Jalan/Dusun)
- `alamatKtpRtRw` (RT/RW)
- `alamatKtpKelurahan` (Desa/Kelurahan)
- `alamatKtpKecamatan` (Kecamatan)
- `alamatKtpKabupatenKota` (Kabupaten/Kota - *Referensial Database*)
- `alamatKtpProvinsi` (Provinsi - *Referensial Database*)
- `alamatKtpKodePos` (Kode Pos)

Pengguna diberikan opsi **"Sama dengan KTP"** untuk menyalin otomatis alamat KTP ke Alamat Domisili (Kontak Surat).

### 6. Kontak Darurat (Emergency Contacts)
Sistem mendata dua tingkat kontak darurat penghuni asrama:
- **Kontak Utama**: Bersifat wajib diisi (Nama, Hubungan, No HP, Alamat).
- **Kontak Alternatif**: Bersifat opsional.

### 7. Relasi Preferensi Hunian dengan Master Data
Pada form preferensi hunian, field **Tipe Kamar** dan **Preferensi Lantai** berkorelasi dengan skema database SQL Web Admin:
- **Tipe Kamar (Tipe Asrama)**: Berkorelasi dengan tabel `tipe_asrama` yang menjadi `tipe_asrama_id` (ForeignKey) pada tabel `kamar`.
- **Preferensi Lantai**: Berkorelasi dengan tabel `lantai` dan kolom `lantai` pada tabel `kamar`. Database merekam lantai dalam bentuk integer yang menjadi referensi pada proses *plotting* kamar asrama.

### 8. Komponen Formulir Alamat (`AddressForm`)
Komponen `AddressForm.tsx` menangani antarmuka pengisian Alamat KTP dan Alamat Domisili. Komponen ini merender field alamat yang terstruktur beserta referensial dropdown Provinsi dan Kabupaten/Kota.

### 9. Validasi Data Pendaftaran (`useFormValidation`)
Validasi tahap pendaftaran dikelola secara terpusat oleh *custom hook* `useFormValidation.ts`. Hook ini mengevaluasi seluruh isian wajib (Data Diri, Kontak Darurat, Alamat KTP/Domisili, dan dokumen e-KYC) dengan spesifikasi:
- Menghasilkan state `isValid` yang menentukan apakah formulir pendaftaran (tombol submit) siap diproses.
- Mencegah pengguna berpindah ke `currentStep > 1` (melalui klik tab navigasi maupun tombol lanjut) apabila masih ada field wajib yang belum diisi.
- Mengelola state pesan galat validasi (`formErrors`) yang ditampilkan ketika pengguna mencoba berpindah ke tahap berikutnya tanpa melengkapi data.

### 11. Alur Modifikasi Rincian Tagihan
Sistem mengakomodasi fleksibilitas bagi calon penghuni (maba) untuk mengubah pilihan pada menu Rincian Tagihan (durasi sewa kamar dan skema uang deposit) sebelum pembayaran terkonfirmasi.
- **Navigasi Modifikasi:** Pada tahap Pembayaran (Langkah 3), tersedia opsi "Ubah Pilihan Tagihan" yang mengizinkan maba untuk kembali ke Langkah 2.
- **Batasan Status (State Lock):** Modifikasi durasi sewa dan skema deposit hanya dapat dilakukan selama status tagihan (`invoice.status`) adalah `UNPAID`. Apabila transaksi telah diproses (`PENDING_VERIFICATION`) atau berhasil dibayar (`PAID`), maka seluruh kontrol pilihan tagihan akan otomatis dinonaktifkan (*disabled*) dan dibekukan demi menjaga integritas data pembayaran dan sinkronisasi dengan sistem keuangan.

### 12. State Restoration & Initial Step (Auto-Resume)
Sistem pendaftaran telah dilengkapi mekanisme kalkulasi cerdas (`getInitialStep`) untuk mengembalikan calon penghuni (maba) secara otomatis ke langkah (step) terakhir mereka jika terjadi jeda (misalnya logout, refresh halaman, atau menutup browser). 
Ketika maba belum menyelesaikan pendaftaran, sistem akan mengevaluasi progres data pendaftaran:
- **e-Ticket Aktif:** Jika maba sudah mendapatkan tiket check-in, ia akan langsung diarahkan ke **Langkah 6**.
- **Kontrak Digital / Plotting Kamar:** Jika maba sudah memiliki plot kamar (atau sudah tanda tangan kontrak), ia diarahkan ke **Langkah 5 (Kontrak Digital)** atau **Langkah 4**.
- **Jeda Pembayaran Transfer:** Jika maba telah melengkapi formulir e-KYC dan tagihan berstatus `UNPAID` (belum transfer / mengunggah bukti bayar), pada saat ia melakukan login ulang, sistem akan secara otomatis membawanya ke **Langkah 3: Pembayaran**. Dari Langkah 3, ia siap melihat nomor rekening/VA tujuan. (Tentu maba juga masih tetap bisa mengklik opsi "Ubah Pilihan Tagihan" untuk mundur kembali ke Langkah 2 apabila berubah pikiran mengenai paket sewa asrama sebelum transfer).
- **Proses Verifikasi Pembayaran:** Jika maba sudah mengunggah bukti bayar namun sedang menunggu validasi admin (`PENDING_VERIFICATION`), maba tetap diarahkan ke **Langkah 3** yang akan menampilkan status "Menunggu Verifikasi Bank/Admin".

### 13. Opsi Pengujian Skenario Resume Jeda Pembayaran (Login)
Untuk menunjang pengujian skenario di mana *"invoice sudah terbentuk namun maba belum melakukan upload bukti transfer"*, telah ditambahkan sebuah menu pilihan "Simulasi Skenario Resume" pada panel login maba (Tab Mahasiswa Baru). 
- Pengguna dapat memilih skenario **"Tagihan Sudah Terbentuk & Belum Transfer"**, yang secara instruksional akan menyimulasikan data maba yang sudah melewati Step 1 dan Step 2.
- Ketika berhasil login menggunakan opsi skenario ini, maba akan **otomatis melompat ke Langkah 3 (Pembayaran)** menggunakan logika `getInitialStep()`, siap untuk mengunggah bukti bayar atau kembali mengintip rincian tagihan tanpa harus mengisi seluruh form profil awal berulang kali.

### 14. Peningkatan Auto-Resume pada Fitur Lainnya (Poin 1-3)
Selain Resume Step Pendaftaran (Langkah 1 s.d 6), mekanisme auto-resume telah diperluas ke berbagai titik di sistem menggunakan `localStorage`:
1. **Penyimpanan Draft Form e-KYC (Maba Dashboard - Step 1)**: Semua input biodata pendaftaran (serta progres unggah KTP/Selfie) akan disimpan sementara (draft). Jika Maba tidak sengaja mereload halaman atau menutup browser sebelum menekan "Simpan & Lanjut ke Pembayaran", data yang sudah diinput tidak akan hilang.
2. **Auto-Resume Proses Perpanjangan Sewa (Mahasiswa Eksisting)**: Skenario: Mahasiswa Eksisting ingin memperpanjang sewa kamar (Fase B). Mereka sudah memilih durasi sewa, namun belum mengkonfirmasi pembayaran bulan berikutnya. Solusi: Ketika masuk kembali ke Dashboard Eksisting, sistem dapat menampilkan komponen banner/pop-up persisten yang memberi tahu "Anda memiliki draf perpanjangan sewa yang belum diselesaikan", dan memberikan tombol yang membawa mereka langsung ke tahap pembayaran akhir tagihan tanpa harus mengulang navigasi.
3. **Auto-Resume Skema Cicilan Deposit Bulan Berikutnya**: Skenario: Maba sebelumnya memilih opsi skema Cicilan Uang Deposit (membayar Rp 375.000 awal, lalu sisanya Rp 375.000 di bulan ke-2). Solusi: Pada saat memasuki bulan kedua, ketika Maba (yang sudah resmi menjadi Penghuni Aktif) login ke dalam sistem portal, alur login secara otomatis akan diarahkan terlebih dahulu ke halaman pelunasan tagihan sisa cicilan deposit tersebut sebelum mengizinkan mereka masuk ke Beranda utama (Fase B/Dashboard Eksisting).
