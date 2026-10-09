# Running the System in XAMPP (Laravel 11 + Inertia.js + React)

> **Language / Pilihan Bahasa:** [🇮🇩 Bahasa Indonesia (Primary)](XAMPP_SETUP.md) | 🇬🇧 **English Version**

This guide is designed for developers running the **XAMPP (Apache + MySQL + PHP)** environment on Windows.

---

## ⚠️ Key Differences: XAMPP vs Laragon

| Component | Laragon | XAMPP | Solution in XAMPP |
| :--- | :--- | :--- | :--- |
| **PHP Version** | Automatic PHP 8.2+ | Depends on XAMPP installer | Must be **PHP >= 8.2** (required for Laravel 11) |
| **Composer** | Pre-installed | Not included by default | Download & install from [getcomposer.org](https://getcomposer.org/) |
| **Node.js & NPM** | Pre-installed | Not included by default | Download & install LTS from [nodejs.org](https://nodejs.org/) |
| **Project Folder** | `C:\laragon\www\` | `C:\xampp\htdocs\` | Place inside `C:\xampp\htdocs\asrama-ubt` |
| **Browser URL** | `http://asrama-ubt.test` | `http://localhost/asrama-ubt/public` | Prefer **`php artisan serve`** (`http://127.0.0.1:8000`) |

---

## 🚀 Quick Setup Steps in XAMPP

### 1. Prerequisites:
- Ensure your XAMPP installation uses **PHP 8.2 or newer** (verify via terminal: `php -v`).
- Ensure **Composer** and **Node.js** are installed in your Windows system.
- Open the **XAMPP Control Panel** and click **Start** for both **Apache** and **MySQL**.

### 2. Create the Database in phpMyAdmin:
- Navigate to `http://localhost/phpmyadmin` in your browser.
- Create a new database named: **`asrama_ubt_db`** (Collation: `utf8mb4_unicode_ci`).

### 3. Run the Automated Script:
- Open your terminal / Command Prompt inside the project folder: `C:\xampp\htdocs\asrama-ubt` (or click **Shell** in the XAMPP Control Panel).
- Execute:
  ```cmd
  xampp-setup.bat
  ```
  *(The script will automatically verify PHP, Composer, and Node.js availability, duplicate `.env`, install dependencies, generate the app key, and run migrations with seeders).*

---

## 🏃 Running the Application

Open two separate terminal windows:

1. **Terminal 1 (Vite Frontend):**
   ```bash
   npm run dev
   ```

2. **Terminal 2 (Laravel Backend):**
   ```bash
   php artisan serve
   ```

Open your browser and navigate to:  
👉 **`http://127.0.0.1:8000`**
