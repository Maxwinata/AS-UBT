# Guide to Testing Real SIMABA Data in Laragon Environment

> **Language Selection:** [🇮🇩 Bahasa Indonesia (Main)](TESTING_DATA_REAL_LARAGON.md) | 🇬🇧 **English Version**

This document serves as the technical and operational guide for testing the **Dual Database SIMABA (`u540633926_simaba`)**, **Student Name Live Search Auto-Suggest**, **UX Date of Birth Format `DD/MM/YYYY`**, and **SIAKAD/SIDARA Early Official NIM Detection** features directly within the **Laragon (MySQL, PHP 8.2+, Apache/Nginx, Vite)** environment.

---

## 1. Dual Database Configuration in Laragon

The SI-GABUNG 54 UBT Dormitory Portal system uses two separate MySQL database connections running side-by-side on port `3306`:

| Parameter | Database 1: Dormitory Operations (`mysql`) | Database 2: New Student Registration (`simaba`) |
| :--- | :--- | :--- |
| **Database Name** | `asrama_ubt_db` | `u540633926_simaba` |
| **Host & Port** | `127.0.0.1:3306` | `127.0.0.1:3306` |
| **Username** | `root` | `u540633926_simaba` (or `root`) |
| **Password** | *(empty by default in Laragon)* | `12345678Ab&` |
| **System Role** | Room inventory, billing invoices, transfer proof staging, e-KYC private storage, OTP digital contracts, e-Ticket BASTK | Authentic PMB student data lookup (`pendaftaranmahasiswa` & `programstudi` tables) |
| **Eloquent Model** | `App\Models\User`, `App\Models\BillingInvoice`, `App\Models\Room`, etc. | `App\Models\SimabaPendaftaran` (`protected $connection = 'simaba';`) |

Connection settings are configured in:
- `config/database.php` (`'simaba'` connection)
- `.env.example` & `.env`:
  ```ini
  # PRIMARY DORMITORY DATABASE
  DB_CONNECTION=mysql
  DB_HOST=127.0.0.1
  DB_PORT=3306
  DB_DATABASE=asrama_ubt_db
  DB_USERNAME=root
  DB_PASSWORD=

  # SIMABA DATABASE (PMB - DUAL DATABASE)
  DB_SIMABA_CONNECTION=mysql
  DB_SIMABA_HOST=127.0.0.1
  DB_SIMABA_PORT=3306
  DB_SIMABA_DATABASE=u540633926_simaba
  DB_SIMABA_USERNAME=u540633926_simaba
  DB_SIMABA_PASSWORD=12345678Ab&
  ```

---

## 2. Automated Initialization (1-Click via Laragon)

Run `laragon-setup.bat` (or `bash laragon-setup.sh`):
1. Creates both databases:
   ```sql
   CREATE DATABASE IF NOT EXISTS asrama_ubt_db;
   CREATE DATABASE IF NOT EXISTS u540633926_simaba;
   ```
2. Provisions user `u540633926_simaba` with password `12345678Ab&`:
   ```sql
   CREATE USER IF NOT EXISTS 'u540633926_simaba'@'localhost' IDENTIFIED BY '12345678Ab&';
   CREATE USER IF NOT EXISTS 'u540633926_simaba'@'127.0.0.1' IDENTIFIED BY '12345678Ab&';
   GRANT ALL PRIVILEGES ON u540633926_simaba.* TO 'u540633926_simaba'@'localhost';
   GRANT ALL PRIVILEGES ON u540633926_simaba.* TO 'u540633926_simaba'@'127.0.0.1';
   FLUSH PRIVILEGES;
   ```
3. Executes migrations and seeds authentic SIMABA student records:
   ```bash
   php artisan migrate --seed
   ```

---

## 3. Real Student Testing Matrix (SIMABA SQL Dump)

| No | Full Name | Registration No. | Birth Date (`DD/MM/YYYY`) | Study Program | Track | Primary Test Scenario |
|:---|:---|:---|:---|:---|:---|:---|
| **1** | **GRACE MARLIN TELAUMBANUA** | `260108001` | `12/02/2008` | S1 Nursing | **KIP Scholarship** (100% Subsidy) | KIP flow: Rp 0 invoice, subsidy document review, subsidized room allocation |
| **2** | **Jenny Agustina Shellyana** | `250830001` | `29/08/2006` | D III Nursing | **Non-KIP / Regular** | Regular flow: Rent (Rp 500k) + Admin (Rp 100k) + Deposit (Rp 500k) = Rp 1,100,xxx with 3-digit code |
| **3** | **MAZA ADITIYA** | `250830002` | `19/06/2006` | S1 Public Health | **KIP Scholarship** | Test typing "Maza" -> live suggestions -> KIP registration |
| **4** | **Alvin Octavianus Hasiholan** | `260727002` | `07/08/2008` | S1 Law | **Non-KIP** | **EARLY NIM DETECTION**: Official NIM `260801004` detected from SIAKAD -> Transition modal |
| **5** | **Alfonso Vincent Husly** | `260704001` | `16/05/2008` | S1 Informatics | **Non-KIP** | Test typing "Alfonso" -> room reservation & billing |
| **6** | **Rizka mutiara** | `260421001` | `07/02/2008` | S1 Nursing | **Non-KIP** | Test name search "Rizka" -> birth date validation |
| **7** | **Azzahra Safa Musakinah** | `250830003` | `06/09/2007` | S1 Nursing | **KIP Scholarship** | Test KIP flow with Medan domicile |
| **8** | **Maximilian Wimin Winata** | `PMB2026-08942` | `12/04/2007` | S1 Informatics | **Non-KIP** | Test alphanumeric PMB format compatibility |

---

## 4. Interactive UX Features Guide

### A. Student Name Live Search Auto-Suggest
1. Click **"Pendaftaran Asrama"** on the login page.
2. In the registration input, type 2 or more characters of the candidate's name (e.g., `Grace`, `Jenny`, `Alvin`).
3. An interactive suggestion dropdown appears displaying candidate name, registration number badge, study program, and `[PILIH]` button.
4. Clicking `[PILIH]` autofills the registration number, populates the birth date, closes the dropdown, and displays a verified student card.

### B. User-Friendly Birth Date Format (`DD/MM/YYYY`)
1. Inputs follow local Indonesian ordering: **Day / Month / Year**.
2. Masked input automatically adds `/` as digits are typed.
3. Automatically converted to standard ISO `YYYY-MM-DD` on submission for the SQL database query.

### C. Background Early Official NIM Detection
1. Select candidate **Alvin Octavianus Hasiholan Hutasoit** (`260727002` / `07/08/2008`).
2. Click **"Masuk Portal Pendaftaran"**.
3. Background detection notifies the user that official NIM `260801004` has been issued in SIAKAD with options to switch to SSO or proceed with the official identity.
