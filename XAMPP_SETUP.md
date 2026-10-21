# Panduan Menjalankan Sistem di XAMPP (Laravel 11 + Inertia.js + React)

> **Pilihan Bahasa / Language:** 🇮🇩 **Bahasa Indonesia (Utama)** | [🇬🇧 English Version](XAMPP_SETUP.en.md)

Panduan ini ditujukan bagi pengembang yang menggunakan lingkungan **XAMPP (Apache + MySQL + PHP)** di Windows.

---

## ⚠️ Perbedaan Penting XAMPP vs Laragon

| Komponen | Laragon | XAMPP | Solusi di XAMPP |
| :--- | :--- | :--- | :--- |
| **Versi PHP** | Otomatis PHP 8.2+ | Bergantung installer XAMPP | Wajib **PHP >= 8.2** (kebutuhan Laravel 11) |
| **Composer** | Terpasang bawaan | Belum ada | Install dari [getcomposer.org](https://getcomposer.org/) |
| **Node.js & NPM** | Terpasang bawaan | Belum ada | Install dari [nodejs.org](https://nodejs.org/) |
| **Folder Proyek** | `C:\laragon\www\` | `C:\xampp\htdocs\` | Letakkan di `C:\xampp\htdocs\asrama-ubt` |
| **Akses Browser** | `http://asrama-ubt.test` | `http://localhost/asrama-ubt/public` | Gunakan **`php artisan serve`** (`http://127.0.0.1:8000`) |

---

## 🚀 Langkah Instalasi Cepat di XAMPP

### 1. Prasyarat:
- Pastikan XAMPP Anda menggunakan **PHP 8.2 ke atas** (cek via command prompt: `php -v`).
- Pastikan **Composer** dan **Node.js** sudah terinstal di Windows Anda.
- Buka **XAMPP Control Panel**, lalu klik **Start** pada modul **Apache** dan **MySQL**.

### 2. Buat Database di phpMyAdmin:
- Buka browser ke `http://localhost/phpmyadmin`
- Buat database operasional: `asrama_ubt_db` (Collation: `utf8mb4_unicode_ci`)
- (Opsional jika ingin dual database PMB lokal): Buat database `u540633926_simaba`

### 3. Eksekusi Script Otomatis:
- Buka folder proyek di `C:\xampp\htdocs\asrama-ubt`.
- Buka **XAMPP Shell** (klik tombol **Shell** di XAMPP Control Panel) atau Command Prompt biasa di folder tersebut.
- Jalankan file:
  ```cmd
  xampp-setup.bat
  ```
  *Skrip akan menanyakan pilihan seeder:*
  * **[1] Mode Produksi Riil (Default)**: Menjalankan `ProductionSeeder` (100% bebas dummy mahasiswa, hanya master tarif resmi, kamar Roemah 54, dan akun staf resmi).
  * **[2] Mode Simulasi**: Menjalankan `DatabaseSeeder` dengan akun sampel mahasiswa untuk QA.

---

## 🏃 Menjalankan Aplikasi

Buka 2 jendela terminal:

1. **Terminal 1 (Vite Frontend):**
   ```bash
   npm run dev
   ```

2. **Terminal 2 (Laravel Backend):**
   ```bash
   php artisan serve
   ```

Buka peramban di:
👉 **`http://127.0.0.1:8000`**
