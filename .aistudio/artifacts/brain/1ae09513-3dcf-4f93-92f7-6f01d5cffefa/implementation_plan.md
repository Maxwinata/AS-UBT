# Perbaikan Sintaks Batch Script & Penanganan Install-Scripts NPM (Laragon)

Menyelesaikan kendala eksekusi Windows CMD pada fase seeder `[5/7]` dengan mengganti blok `if-else` bersarang menjadi label percabangan `goto` anti-konflik karakter kurung, serta memastikan eksekusi biner native `esbuild` berjalan mandiri untuk membypass pemblokiran `npm install-scripts` di Laragon.

### User Review & Critical Decisions

> [!IMPORTANT]
> Keputusan yang telah dikonfirmasi oleh pengguna pada sesi tanya-jawab:
> - **Perbaikan Sintaks CMD**: Mengganti seluruh blok `if (...) else (...)` yang berisi karakter tanda kurung dan titik-titik dengan struktur label `goto` murni (`:SEED_PRODUKSI`, `:SEED_SIMULASI`, `:SEED_DONE`) agar terbebas 100% dari error `... was unexpected at this time`.
> - **Bypass Blokir Install-Scripts NPM**: Mengeksekusi `node node_modules\esbuild\install.js` secara langsung dan eksplisit melalui skrip batch segera setelah `npm install --legacy-peer-deps` selesai, sehingga biner native `esbuild.exe` Windows tetap terbentuk sempurna tanpa terpengaruh proteksi `allowScripts` npm.

---

### 1. Overview & Core Concept

- **Apa yang Dikerjakan**:
  1. Memperbaiki kelemahan parser `cmd.exe` Windows di mana teks `(Mode Produksi Riil Tanpa Dummy)...` menyebabkan interpreter mengira blok perintah telah tertutup prematur pada tanda kurung `)`, lalu crash saat menemukan token `...`.
  2. Mengamankan rantai instalasi frontend: npm tetap berjalan dengan `--legacy-peer-deps` (tanpa merusak React 19 / Vite 6), dan skrip secara otomatis memasang biner esbuild yang sempat ditahan oleh `npm warn install-scripts`.
- **Target Pengguna**: Pengembang yang menjalankan inisialisasi lingkungan Laragon di Windows 10/11.
- **Nilai Utama**: Menjamin skrip `laragon-setup.bat` berjalan mulus dari tahap `[1/7]` hingga `[7/7]` tanpa terhenti (*zero interruption*).

---

### 2. User Experience & Visual Design

- **Alur yang Ditingkatkan pada Layar CMD**:
  ```cmd
  [5/7] Memastikan database asrama_ubt_db dan u540633926_simaba siap di MySQL Laragon...

        PILIHAN SEEDER BASIS DATA:
        [1] Mode Produksi Riil (Default / Disarankan) - 100% Bebas Akun Dummy Mahasiswa
            (Mengisi Master Tarif SK Rektor, 64 Kamar Fisik Riil Roemah 54, dan Akun Staf Resmi)
        [2] Mode Simulasi Pengujian - Menyertakan 1 akun sampel mahasiswa untuk QA

  Pilih mode seeder [1 atau 2, default: 1]: 1
        + Menjalankan migrasi dengan ProductionSeeder - Mode Produksi Riil Bebas Dummy...
        + Database asrama_ubt_db berhasil di-seed!

  [6/7] Menginstal dependensi Node.js / NPM...
        + Menjalankan npm install --legacy-peer-deps...
        + Memasang dan meregistrasi binary native esbuild Windows...
        + Memverifikasi build aset Vite untuk portal...
        + Kompilasi aset Vite sukses siap pakai!

  [7/7] SETUP SELESAI DENGAN SUKSES!
  ```

---

### 3. Key Product Decisions & Trade-Offs

- **Keputusan 1: Penggunaan Struktur `goto` dibanding Escaping Karakter `^)`**
  - *Pendekatan*: Menggunakan label percabangan `goto :SEED_PRODUKSI` dan `goto :SEED_SIMULASI`.
  - *Alasan*: Karakter escape caret `^` di Windows batch sering kali tidak konsisten jika terdapat variabel atau tanda kutip ganda. Label `goto` adalah standar paling stabil di semua versi Windows `cmd.exe`.
  - *Alternatif yang Ditolak*: Mempertahankan `if () else ()` dengan escape caret `^(Mode Produksi Riil^)...` yang rentan rusak jika teks diedit kemudian hari.

- **Keputusan 2: Eksekusi Biner esbuild Langsung dibanding `npm audit fix --force`**
  - *Pendekatan*: Menjalankan `call node node_modules\esbuild\install.js` langsung setelah npm.
  - *Alasan*: `npm audit fix --force` akan menurunkan atau mengubah versi paket React 19 dan Tailwind v4 ke versi lama yang tidak kompatibel. Menjalankan `install.js` secara manual menyelesaikan akar masalah hilangnya biner esbuild tanpa efek samping.

---

### 4. Technical Architecture & Data Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                 Alur Eksekusi Aman Windows CMD              │
│                                                             │
│   Input: set /p seederchoice=                               │
│     │                                                       │
│     ├── if "%seederchoice%"=="2" goto SEED_SIMULASI        │
│     │                                                       │
│     └── (default) :SEED_PRODUKSI                            │
│           ├── php artisan migrate --seed --seeder=...       │
│           └── goto SEED_DONE                                │
│                                                             │
│         :SEED_SIMULASI                                      │
│           ├── php artisan migrate --seed                    │
│           └── goto SEED_DONE                                │
│                                                             │
│   :SEED_DONE                                                │
│     ├── npm install --legacy-peer-deps                      │
│     ├── node node_modules\esbuild\install.js                │
│     └── npm run build (verifikasi kompilasi)                │
└─────────────────────────────────────────────────────────────┘
```

- **Langkah Verifikasi**:
  1. Perbarui `laragon-setup.bat` dengan percabangan `goto` yang aman.
  2. Periksa kembali `laragon-test-crud.bat` agar bebas dari potensi error serupa.
  3. Uji kompilasi applet (`compile_applet`) dan validasi linter (`lint_applet`).
