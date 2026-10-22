# Penyatuan Skrip Resmi Laragon & Pembersihan Repositori (Asrama UBT)

Mengintegrasikan seluruh perbaikan optimalisasi (penanganan flag `--legacy-peer-deps`, registrasi native binary esbuild Windows, validasi manifest build aset, dan alur server ganda) langsung ke dalam 2 skrip batch resmi standar sesuai dokumentasi arsitektur awal: `laragon-setup.bat` dan `laragon-test-crud.bat`, serta menghapus file patch terpisah (`laragon-quick-repair.bat`) untuk menjaga kebersihan repositori.

### User Review & Critical Decisions

> [!IMPORTANT]
> Keputusan yang telah dikonfirmasi oleh pengguna pada sesi tanya-jawab:
> - **Integrasi Utuh**: Seluruh perbaikan dan optimalisasi terakhir dilebur secara permanen ke dalam `laragon-setup.bat` (setup end-to-end) dan `laragon-test-crud.bat` (eksekusi pengujian & server).
> - **Pembersihan Repositori**: Menghapus file `laragon-quick-repair.bat` agar struktur direktori bersih dan kembali sesuai cetak biru (*blueprint*) awal tanpa ada file patch parsial.

---

### 1. Overview & Core Concept

- **Apa yang Dikerjakan**: Mengembalikan struktur otomasi Laragon ke 2 file skrip standar resmi yang kuat (*robust*), mandiri, dan bebas fragmentasi file perbaikan.
- **Standar Arsitektur**:
  1. `laragon-setup.bat`: Skrip instalasi awal komprehensif 7-tahap (Environment, Direktori, Composer, Key, Database MySQL, Node.js + esbuild + Build, dan Launch Prompt).
  2. `laragon-test-crud.bat`: Runner interaktif 7-menu untuk pengujian langsung ke database nyata, impor staging SIDARA, Tinker, dan peluncuran server lengkap.

---

### 2. User Experience & Visual Design

- **Alur Penggunaan Bersih**:
  - Pengguna hanya melihat 2 file batch resmi di direktori root:
    ```
    /
    ├── laragon-setup.bat       (Jalankan 1x saat inisialisasi awal proyek)
    └── laragon-test-crud.bat   (Jalankan untuk testing CRUD live & peluncuran server)
    ```
  - **Menu `laragon-test-crud.bat` (Standar 7 Menu Resmi)**:
    - `[1]` Jalankan Uji Live CRUD Nyata 4 Tahap Pendaftaran dan Tabel Master
    - `[2]` Jalankan Uji Live CRUD 4 Tahap + Pembersihan Data Otomatis (--cleanup)
    - `[3]` Eksekusi Migrasi dan Database Seeder Bersih (Fresh Seed)
    - `[4]` Jalankan Server Lengkap (Backend Laravel 8000 + Frontend Vite Port 3000)
    - `[5]` Buka Konsol Interaktif Laravel Tinker
    - `[6]` Tampilkan Panduan Database Interaction Flow di Layar
    - `[7]` Impor dan Sinkronisasi Lengkap API SIDARA ke Tabel Staging (siakad_mahasiswa_stg)
    - `[0]` Keluar

---

### 3. Key Product Decisions & Trade-Offs

- **Keputusan 1: Optimalisasi Tertanam Otomatis (Embedded Optimization)**
  - *Pendekatan*: Menu `[4]` di `laragon-test-crud.bat` secara otomatis melakukan *self-healing* (memastikan binary native esbuild terpasang dan bundle `dist`/`public` siap) sebelum memanggil server, tanpa memerlukan menu terpisah.
  - *Alasan*: Menjamin kemudahan maksimal bagi pengguna tanpa menambah opsi menu yang membingungkan.

- **Keputusan 2: Penghapusan File Patch Sementara**
  - *Pendekatan*: Menghapus `laragon-quick-repair.bat` secara permanen.
  - *Alasan*: Menghilangkan duplikasi logika perintah dan memastikan hanya ada satu alur instruksi tunggal yang dapat dipercaya (*single source of truth*).

---

### 4. Technical Architecture & Data Strategy

```
┌──────────────────────────────────────────────────────────────────┐
│                   Struktur Skrip Resmi Laragon                   │
│                                                                  │
│   laragon-setup.bat                                              │
│   └── Inisialisasi Database + Dependensi Composer/NPM + Build    │
│                                                                  │
│   laragon-test-crud.bat                                          │
│   ├── Menu [1-3]: Uji CRUD Live Eloquent & Seeding               │
│   ├── Menu [4]  : Cek esbuild/build -> Jalankan Port 8000 & 3000 │
│   ├── Menu [5-6]: Tinker & Dokumentasi                           │
│   └── Menu [7]  : Sinkronisasi API SIDARA ke Tabel Staging       │
└──────────────────────────────────────────────────────────────────┘
```

- **File yang Dimodifikasi/Dihapus**:
  1. Hapus: `/laragon-quick-repair.bat`
  2. Modifikasi: `/laragon-test-crud.bat` (kembalikan ke struktur 7 menu resmi dengan pengecekan mandiri pada menu [4])
  3. Modifikasi: `/laragon-setup.bat` (pastikan langkah [6/7] mencakup `--legacy-peer-deps`, biner esbuild, dan kompilasi build bersih)
