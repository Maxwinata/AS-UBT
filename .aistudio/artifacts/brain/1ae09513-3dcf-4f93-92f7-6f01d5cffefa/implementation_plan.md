# Rencana Implementasi: Transisi Mode Produksi Riil (Non-Dummy) & Penyimpanan Permanen MySQL Laragon

Rencana kerja ini disusun untuk merespons kebutuhan pengguna: menjadikan Portal Asrama UBT beroperasi secara praktis, bersih, dan berorientasi produksi langsung (*production-first*), dengan penyimpanan data permanen ke basis data MySQL Laragon secara default, serta menyediakan kontrol elegan untuk beralih antara **Mode Produksi (Riil)** dan **Mode Simulasi (Demo/Uji Coba)**.

---

## 1. User Review Required (Keputusan & Konfirmasi Kunci)

- **Default Mode Aplikasi**: Sistem akan secara default berjalan dalam **Mode Produksi (Real Mode)**:
  - Formulir login, pendaftaran kamar, e-KYC, dan invoice tampil bersih tanpa banner simulasi, tanpa tombol preset nama demo (Maximilian, Jenny, dll.), dan tanpa bilah sandbox mengambang.
- **Mekanisme Switch / Toggle Mode**:
  - Diletakkan tombol switch profesional (*discreet toggle*) di header navigasi atau footer sistem: **[Mode: Produksi Riil 🟢]** $\leftrightarrow$ **[Mode: Simulasi / Sandbox 🧪]**.
  - Status tersimpan dalam `localStorage` dan session server (`HandleInertiaRequests.php`).
- **Penyimpanan Permanen MySQL Laragon**:
  - Memastikan seluruh form pada alur pendaftaran mahasiswa (Maba), unggah dokumen e-KYC, pemesanan kamar, dan persetujuan admin terkoneksi ke rute backend Laravel 11 (`routes/web.php` & `routes/api.php`) yang melakukan commit permanen ke tabel MySQL `asrama_ubt_db`.
  - Mengupdate `laragon-setup.bat` agar secara default menggunakan `ProductionSeeder.php` (hanya akun staf resmi, master tarif SK Rektor, dan 64 kamar fisik riil, 100% bebas dari akun dummy mahasiswa).

---

## 2. Rincian Perubahan Kode & Komponen

### A. Frontend UI & State Mode (`src/` & `resources/js/`)

1. **`src/context/TestingModeContext.tsx`**:
   - Mengubah nilai bawaan (`defaultState`) agar secara default `isCleanTesting: true` (Mode Produksi).
   - Menambahkan opsi eksplisit switch `activeMode: 'production' | 'simulation'`.
   - Mengintegrasikan deteksi environment server (Inertia shared props `props.uiMode`) agar otomatis sinkron dengan file `.env` di Laragon.

2. **Komponen Pengalih Mode (`src/components/layout/ProductionModeSwitch.tsx`)**:
   - Membuat komponen switch mode yang elegan dan non-intrusif di bilah navigasi atas atau sudut footer:
     - Badge status: `🟢 Mode Produksi (Data Riil MySQL)` dengan indikator koneksi.
     - Opsi dropdown/toggle: Beralih ke `🧪 Mode Simulasi / Demo Presets` jika pengguna membutuhkan demonstrasi pengujian cepat.

3. **Pembersihan Formulir Login (`src/components/auth/LoginDualTab.tsx`)**:
   - Di Mode Produksi (Default):
     - Menghilangkan deretan tombol preset demo (*Maximilian Wimin Winata*, *Jenny*, *Ahmad Zaky*, dll.) dari tampilan form login utama.
     - Menyediakan input bersih untuk Nomor Pendaftaran PMB / NIK / Nama Mahasiswa dan Tanggal Lahir (DD/MM/YYYY).
     - Menghilangkan badge floating sandbox simulasi dari area login.
   - Di Mode Simulasi (Saat Diaktifkan):
     - Membuka laci (*drawer*) alat bantu pengujian bagi evaluator atau pengembang.

4. **Pembersihan Dashboard Mahasiswa Baru (`src/components/maba/MabaDashboard.tsx`)**:
   - Di Mode Produksi (Default):
     - Menyembunyikan banner promosi demo dan *floating quick sandbox bar*.
     - Alur langsung fokus pada 4 tahap pendaftaran resmi (Tahap 1: Profil & e-KYC, Tahap 2: Pilih Kamar Riil, Tahap 3: Tagihan BSI & Bukti Transfer, Tahap 4: Kontrak Digital).
     - Status data mencerminkan data aktual dari database.

5. **Konektor API & Sinkronisasi Form (`src/services/apiSync.ts` atau Axios Helper)**:
   - Memastikan saat berjalan di peramban yang terhubung ke backend Laravel Laragon (`http://asrama-ubt.test` atau `http://127.0.0.1:8000`), seluruh pengiriman formulir memicu HTTP request POST/PUT ke rute Laravel dengan proteksi CSRF.

### B. Backend Laravel 11 & Laragon Database Setup (`app/`, `database/`, `laragon-setup.bat`)

1. **`laragon-setup.bat` & `laragon-setup.sh`**:
   - Memodifikasi langkah migrasi: Menyediakan pilihan otomatis atau menjadikan `ProductionSeeder` sebagai pilihan seeder utama untuk lingkungan produksi riil.
   - Memastikan pembuatan tabel MySQL `asrama_ubt_db` siap menerima data pendaftar baru tanpa konflik ID dengan data dummy.

2. **Middleware Inertia (`app/Http/Middleware/HandleInertiaRequests.php`)**:
   - Memastikan pembacaan konfigurasi `APP_UI_MODE` dan `APP_ENV`:
     - Jika `APP_ENV=production` atau `APP_UI_MODE=production`: Menyajikan props `isCleanTesting: true` dan menyembunyikan semua artefak pengujian.
     - Mengizinkan session toggle `testing_ui_mode_active` jika pengguna secara sadar mengaktifkannya via switch UI.

3. **Pengendali Pendaftaran Mahasiswa (`app/Http/Controllers/Maba/MabaDashboardController.php`)**:
   - Memastikan metode `updateProfile`, `reserveRoom`, dan `signContract` menyimpan data lengkap ke tabel `maba_profiles`, `rooms`, `billing_invoices`, dan `contracts`.

---

## 3. Arah Desain & Disiplin Visual (Sesuai `frontend-design` & SaaS Standards)

- **Tone & Persona**: Utilitarian, bersih, formal institusional Universitas Bunda Thamrin.
- **Palette**:
  - Primary: Deep Slate (`#0f172a`), Dark Charcoal (`#1e293b`), Crisp Institutional Border (`#e2e8f0`).
  - Accent: Medical/Academic Teal (`#0d9488` / `#0f766e`) untuk aksi primer dan indikator status aktif.
  - Background: Crisp Slate 50 (`#f8fafc`) dengan kontras kartu putih murni (`#ffffff`).
- **Zero-Pill Discipline**:
  - Menghindari tombol pill oval bulat penuh ala prototipe mainan.
  - Menggunakan sudut melengkung mikro modern (`rounded-md` atau `rounded-lg`) dengan ketegasan hierarki tipografi.
- **Visual Clarity**:
  - Tidak ada floating badges animasi yang mengganggu fokus kerja kasir dan pendaftar.
  - Status koneksi database ditampilkan sebagai badge status profesional kecil (misal: `🟢 Terhubung ke MySQL Laragon`).

---

## 4. Rencana Verifikasi & Validasi

1. **Uji Kompilasi & Build**:
   - Menjalankan `compile_applet` untuk memastikan tidak ada kesalahan kompilasi TypeScript/Vite.
   - Menjalankan `lint_applet` untuk memastikan kepatuhan kode dan kebersihan imports.
2. **Uji Mode Switch (Client & Laragon)**:
   - Memverifikasi saat mode "Produksi" aktif: seluruh tombol preset dummy dan floating sandbox hilang 100%.
   - Memverifikasi saat mode dialihkan ke "Simulasi": panel pengujian dapat dibuka kembali secara aman.
3. **Uji Integritas MySQL Laragon**:
   - Menjalankan skrip `laragon-test-crud.bat` untuk memverifikasi kesiapan tabel master (`asrama_ubt_db`) dan model Eloquent.
