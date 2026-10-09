# Practical Development Guide for Laragon (Laravel 11 + Inertia.js + React)

> **Language / Pilihan Bahasa:** [🇮🇩 Bahasa Indonesia (Primary)](LARAGON_SETUP.md) | 🇬🇧 **English Version**

This project is pre-configured as a **turnkey full-stack application** designed to run immediately in a **Laragon environment (Windows / MySQL / PHP 8.2+ / Apache/Nginx)** using the **Laravel 11 + Inertia.js 2.0 + React 19** architecture.

---

## 🚀 How to Run in Laragon (Fastest - 1-Click Setup)

1. Clone or extract this repository into your Laragon root directory:
   ```bash
   cd C:\laragon\www
   git clone <YOUR_GITHUB_REPO_URL> asrama-ubt
   cd asrama-ubt
   ```
2. Ensure both **MySQL** and **Apache/Nginx** services are active (**Start All**) in the Laragon Control Panel.
3. Inside the `asrama-ubt` folder, simply **double-click the `laragon-setup.bat` script** (or execute it via Laragon Terminal):
   * What the automated script executes:
     - Copies `.env.example` to `.env` (if not present)
     - Installs PHP packages: `composer install`
     - Generates encryption key: `php artisan key:generate`
     - Runs database migrations & seeds initial tariffs: `php artisan migrate --seed` (Creates tables, sets admin fee Rp 100,000, standard rent Rp 500,000, deposit schemes, and rooms)
     - Installs frontend packages: `npm install`
4. Start the Vite development server in your terminal:
   ```bash
   npm run dev
   ```
5. Open your web browser at:
   * **Laragon automatic virtual host**: `http://asrama-ubt.test`
   * Or local PHP development server: `http://127.0.0.1:8000` (if running `php artisan serve`).

---

## 📁 Pre-Configured File Structure (Laravel + Inertia)

The codebase strictly adheres to standard Laravel 11 + Inertia conventions:

```
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Maba/MabaDashboardController.php        # Admission & Step 1-6 Flow
│   │   │   ├── Admin/AdminAsramaController.php         # Dormitory & Finance Management
│   │   │   ├── Eksisting/EksistingDashboardController.php # Senior Resident Portal
│   │   │   ├── Billing/InvoiceController.php           # Invoices, Calculations & Proofs
│   │   │   ├── Kyc/KycVerificationController.php       # e-KYC Private Upload & Signed URLs
│   │   │   └── Sop/CronSopController.php               # Automated 5+5 Grace Period Delinquency
│   │   └── Middleware/
│   │       ├── HandleInertiaRequests.php               # Inertia Shared Props Pipeline
│   │       └── EnsureUserRole.php                      # RBAC Role Protection
│   └── Models/                                         # Eloquent Models (User, MabaProfile, BillingInvoice, Room, Contract, etc.)
├── config/                                             # filesystems.php (private_kyc disk), database.php, app.php
├── database/
│   ├── migrations/                                     # 4 calibrated MySQL migrations
│   └── seeders/                                        # DatabaseSeeder, TariffSeeder, RoomSeeder
├── public/
│   ├── index.php                                       # Front Controller for Apache/PHP server
│   └── .htaccess                                       # Apache rewrite rules for Laragon
├── resources/
│   ├── js/
│   │   ├── Pages/                                      # Inertia Page Components (Maba, Admin, Eksisting, Auth, Sop)
│   │   ├── app.tsx                                     # Inertia client bootstrap
│   │   └── bootstrap.ts                                # Axios & CSRF configurations
│   └── views/
│       └── app.blade.php                               # Master Inertia Blade layout
└── routes/
    ├── web.php                                         # Full Inertia application routes
    └── api.php                                         # BSI & BNI Webhook background endpoints
```

---

## 🔧 Useful Artisan Commands in Laragon

- **Re-run fresh database migrations with seed data:**
  ```bash
  php artisan migrate:fresh --seed
  ```
- **Test manual CRON delinquency enforcement (5+5 day grace period):**
  ```bash
  php artisan sop:enforce-grace
  ```
- **Clear application and route caches:**
  ```bash
  php artisan optimize:clear
  ```
