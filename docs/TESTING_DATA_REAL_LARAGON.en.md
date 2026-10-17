# Practical Guide: Testing Program Logic with Real Data in Laragon (MySQL + Dual SIMABA Database + Laravel 11 + Inertia.js)

> **Language Selection:** [🇮🇩 Versi Bahasa Indonesia (Utama)](TESTING_DATA_REAL_LARAGON.md) | 🇬🇧 **English Version**

This guide is specifically designed for developers, system QA testers, and dormitory managers of Universitas Bunda Thamrin (UBT) to **transition from the prototype web simulation (client-side state) to testing program logic against a live MySQL database and Laravel backend in a local Laragon environment**.

Primary testing focus areas include:
1. **Dual Database Configuration**: Live connection between `mysql` (`asrama_ubt_db`) and `simaba` (`u540633926_simaba`).
2. **PMB User Interface Features**: Student name live search auto-suggest, user-friendly `DD/MM/YYYY` birth date format, and early official NIM issuance detection via SIAKAD.
3. **End-to-End Admission Integrity**: Autonomous candidate data entry (Steps 1 to 6) through to **staging-to-master transaction promotion** by Finance Administrators.

---

## 📌 Repository Documentation Map

| Document | Location | Testing Relevance |
| :--- | :--- | :--- |
| **1-Click Laragon Setup** | [`LARAGON_SETUP.en.md`](../LARAGON_SETUP.en.md) | Quick installation guide for PHP 8.2+, MySQL, and `laragon-setup.bat`. |
| **Staging & Master Architecture** | [`docs/ARCHITECTURE.en.md`](ARCHITECTURE.en.md) | Explains `operator_id = 0` (autonomous) vs `operator_id = 1` (admin) separation. |
| **5-Scenario Testing Matrix** | [`docs/scenario-mappings.en.md`](scenario-mappings.en.md) | Test profiles for regular students, KIP scholarship, deposit installments, and NIM transition. |
| **e-KYC Storage Security** | [`docs/SECURE_UPLOAD_STRATEGY.en.md`](SECURE_UPLOAD_STRATEGY.en.md) | Verification guide for private disk storage and signed URLs (15-min TTL) for ID and selfie photos. |
| **System Specifications (PRD/SAS)**| [`ASRAMA_UBT_SYSTEM_DOCUMENTATION.en.md`](../ASRAMA_UBT_SYSTEM_DOCUMENTATION.en.md) | Comprehensive business rules for JUKLAK-02, JUKLAK-03, and F-22 collective ratification. |

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

Configured in `config/database.php` and `.env.example`:
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
3. Runs migrations and seeds authentic SIMABA student records:
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
2. Type $\ge 2$ characters of the student name (e.g., `Grace`, `Jenny`, `Alvin`).
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

---

## 5. Testing Transaction Flow & Staging-to-Master Promotion

### A. Student Self-Service Intake
1. Login with a registration number (e.g., `260108001` or `250830001`).
2. **Step 1 (e-KYC)**: Upload ID card and selfie photos (stored in `storage/app/private_kyc`).
3. **Step 2 (Room Selection)**: Select floor and room bed.
4. **Step 3 (Payment)**: Select leasing scheme, receive 3-digit verification code, upload bank transfer proof, and submit.

### B. Verify Staging Table in MySQL
In phpMyAdmin (`http://localhost/phpmyadmin`) or HeidiSQL under `asrama_ubt_db`:
```sql
SELECT id, no_request, penyewa_id, total_bayar, status_pembayaran, status_verifikasi, operator_id 
FROM request_pembayaran ORDER BY id DESC LIMIT 1;
```
**Success Criteria:**
- `no_request` follows `REQ-YYYYMM-XXXX`.
- `operator_id = 0` indicates autonomous candidate submission.
- `status_verifikasi = 0` (pending admin verification).
- The official `pembayaran` table remains clean (0 matching rows).

### C. Admin Verification & Promotion
1. Open the Admin Portal at `http://127.0.0.1:8000/admin/dashboard`.
2. Locate the pending staging request row.
3. Review proof, amount, and 3-digit code.
4. Click **"Sahkan & Promosi ke Master"** (`promoteToMaster()` in `AdminAsramaController.php`).
5. Generates official invoice number `INV-...`, posts accounting ledger entries, locks room status to `OCCUPIED`, and sets `operator_id = 1`.

---

## 6. Testing via Laravel Artisan & Tinker

In your Laragon terminal at `C:\laragon\www\asrama-ubt`:
```bash
php artisan tinker
```
```php
// Test SIMABA authentication
$student = \App\Models\SimabaPendaftaran::authenticate('260108001', '12/02/2008');
echo $student->nama_mahasiswa . " | Prodi: " . $student->nama_prodi;

// Test live search query
$results = \App\Models\SimabaPendaftaran::searchByNameOrReg('Alvin')->get();
foreach ($results as $r) { echo $r->nomor_pendaftaran . ' - ' . $r->nama_mahasiswa . PHP_EOL; }
```

---

## 7. Troubleshooting Common Issues

| Symptom | Likely Cause | Solution |
| :--- | :--- | :--- |
| `SQLSTATE[HY000] [2002] Connection refused` | MySQL service not running. | Open Laragon control panel and verify MySQL is active on port 3306. |
| `Table 'u540633926_simaba.pendaftaranmahasiswa' doesn't exist` | SIMABA seeder not executed. | Run `php artisan db:seed --class=SimabaDatabaseSeeder`. |
| `Access denied for user 'u540633926_simaba'@'localhost'` | Database user missing. | Re-run `laragon-setup.bat` or run SQL grant queries from Section 2. |
