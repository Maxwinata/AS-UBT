# Otomasi Penuh Batch Script (.BAT) untuk Laragon & Asrama UBT

Mengintegrasikan seluruh proses instalasi dependensi npm, perbaikan plugin Vite, registrasi native binary esbuild, build aset produksi, dan verifikasi koneksi database ke dalam skrip `.bat` otomatis sekali-klik tanpa perlu mengetik perintah secara manual di terminal.

### User Review & Critical Decisions

> [!IMPORTANT]
> Keputusan yang telah dikonfirmasi oleh pengguna pada sesi tanya-jawab:
> - **Struktur Skrip**: Memperbarui skrip yang sudah ada (`laragon-setup.bat` & `laragon-test-crud.bat`) dan membuat file batch perbaikan terpadu (`laragon-quick-repair.bat`).
> - **Verifikasi Otomatis**: Skrip batch akan secara otomatis memverifikasi binary esbuild, mengeksekusi kompilasi `npm run build`, dan menguji koneksi basis data MySQL via Laravel Artisan.

---

### 1. Overview & Core Concept

- **Apa yang Dikerjakan**: Menghilangkan kebutuhan bagi pengguna untuk mengingat atau mengetik perintah CLI yang kompleks (`npm install -D laravel-vite-plugin@^1.2.0 --legacy-peer-deps`, `node node_modules\esbuild\install.js`, dll.). Seluruh konfigurasi dijalankan melalui file batch Windows dengan penanganan error interaktif.
- **Target Pengguna**: Pengembang atau staf IT Asrama UBT yang mengelola aplikasi pada Windows Laragon.
- **Nilai Utama**: Menjamin lingkungan Laragon selalu konsisten dan siap pakai (*zero-friction execution*), mencegah *human-error* pada flag peer-dependency, dan memberikan status keberhasilan yang jelas secara visual.

---

### 2. User Experience & Visual Design

- **Alur Penggunaan Berbasis Batch (.bat)**:
  1. Pengguna cukup mengklik ganda file `laragon-quick-repair.bat` di File Explorer Laragon atau memilih menu di `laragon-test-crud.bat`.
  2. Layar konsol menampilkan progres berurutan dengan indikator status:
     - `[1/5]` Pemeriksaan lingkungan Laragon (PHP, MySQL, Node.js).
     - `[2/5]` Pemasangan dependensi npm + `laravel-vite-plugin@^1.2.0` (`--legacy-peer-deps`).
     - `[3/5]` Pemasangan & verifikasi binary native `esbuild` Windows.
     - `[4/5]` Kompilasi aset Vite produksi (`npm run build`) untuk Blade.
     - `[5/5]` Uji koneksi database MySQL (`php artisan db:show` / query test).
  3. Di akhir proses, pengguna disajikan pilihan langsung untuk menyalakan server (Port 8000 + Vite) atau kembali ke menu pengujian.

---

### 3. Key Product Decisions & Trade-Offs

- **Keputusan 1: Skrip Mandiri `laragon-quick-repair.bat` vs Hanya Memperbarui Skrip Setup**
  - *Pendekatan*: Menyediakan `laragon-quick-repair.bat` sebagai skrip mandiri, sekaligus memperbarui `laragon-setup.bat` dan menu di `laragon-test-crud.bat`.
  - *Alasan*: Pengguna tidak perlu mengulang proses migrasi database atau seeding yang memakan waktu hanya untuk memperbaiki aset frontend atau dependensi npm.
  - *Alternatif yang Ditolak*: Mengharuskan pengguna menjalankan ulang `laragon-setup.bat` dari awal setiap kali ada masalah pada node_modules.

- **Keputusan 2: Penanganan Otomatis Kasus Gagal Kompilasi**
  - *Pendekatan*: Setiap tahapan di batch mengecek `%ERRORLEVEL%`. Jika terjadi error, skrip memberikan pesan diagnosis dalam bahasa Indonesia dan tidak langsung menutup jendela konsol (`pause`).

---

### 4. Technical Architecture & Data Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                 Alur Otomasi Batch Script                   │
│                                                             │
│   laragon-quick-repair.bat                                  │
│     │                                                       │
│     ├─► [1] Cek Lingkungan (PHP 8.2+, MySQL 3306, Node.js)   │
│     ├─► [2] npm install --legacy-peer-deps                  │
│     │       + laravel-vite-plugin@^1.2.0                    │
│     ├─► [3] node node_modules\esbuild\install.js            │
│     ├─► [4] npm run build (verifikasi public/build manifest)│
│     └─► [5] php artisan asrama:test-live-crud               │
│                                                             │
│   Terintegrasi ke dalam:                                    │
│   - laragon-setup.bat (Langkah 6)                           │
│   - laragon-test-crud.bat (Menu [8] & Pra-syarat Menu [4])   │
└─────────────────────────────────────────────────────────────┘
```

- **File yang Akan Dibuat/Diperbarui**:
  1. `laragon-quick-repair.bat`: File batch terpadu untuk instalasi, perbaikan esbuild, build aset, dan tes koneksi.
  2. `laragon-setup.bat`: Penambahan langkah instalasi `laravel-vite-plugin@^1.2.0` dan verifikasi build.
  3. `laragon-test-crud.bat`: Penambahan opsi menu `[8]` untuk perbaikan dependensi & kompilasi cepat, serta validasi otomatis pada menu `[4]` sebelum menyalakan server.

- **Langkah Verifikasi**:
  1. Pengujian sintaks skrip batch untuk kompatibilitas Windows cmd.
  2. Verifikasi status `compile_applet` dan `lint_applet`.
