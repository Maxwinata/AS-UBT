# Practical Guide: Testing Program Logic with Real Data in Laragon (MySQL + Dual SIMABA Database + Laravel 11 + Inertia.js)

> **Language Selection:** [🇮🇩 Versi Bahasa Indonesia (Utama)](TESTING_DATA_REAL_LARAGON.md) | 🇬🇧 **English Version**

This document serves as the technical and operational guide for developers, QA testers, and dormitory management staff at Universitas Bunda Thamrin (UBT) to **transition from client-side prototype simulations to testing real program logic using production-grade MySQL databases and a Laravel backend in a local Laragon environment**.

Key testing highlights:
1. **Dual Database Architecture**: Connecting operational `mysql` (`asrama_ubt_db`) and student admissions `simaba` (`u540633926_simaba`).
2. **High-Performance MySQL Indexing**: Installing calibrated B-Tree composite indexes to accelerate search queries and authentication lookups across thousands of applicant records to sub-5ms ($O(1)$).
3. **Enhanced New Student Interface (Maba UX)**: Live Search Auto-Suggest with 200ms debounce, micro-loading spinner, matched substring highlighting (`<mark>`), full keyboard navigation (`↑`/`↓`/`Enter`/`Esc`), and intuitive `DD/MM/YYYY` birth date formatting.
4. **Early Official NIM Detection**: Automatic background check against SIAKAD/SIDARA for matriculated students with official student identification numbers already generated.
5. **Registration Integrity**: Complete transactional flow from student self-service (Steps 1–6) through **staging buffer isolation to official running master ledgers** verified by Financial Administrators.

---

## 📌 Related System Documentation

| Document | Location | Purpose |
| :--- | :--- | :--- |
| **1-Click Laragon Setup** | [`LARAGON_SETUP.en.md`](../LARAGON_SETUP.en.md) | Quick setup guide for PHP 8.2+, MySQL, and automation scripts. |
| **Staging & Master Architecture** | [`docs/ARCHITECTURE.md`](ARCHITECTURE.md) | Detailed rationale for `operator_id = 0` (unverified staging) vs `operator_id = 1` (master). |
| **5 Testing Scenarios** | [`docs/scenario-mappings.en.md`](scenario-mappings.en.md) | Scenarios for regular applicants, KIP scholarships, installment plans, and NIM transitions. |
| **e-KYC Secure Storage** | [`docs/SECURE_UPLOAD_STRATEGY.en.md`](SECURE_UPLOAD_STRATEGY.en.md) | Verification guide for private disk storage and short-lived signed URLs for ID & selfie files. |

---

## 1. Dual Database Configuration in Laragon

The SI-GABUNG 54 portal operates two distinct MySQL database schemas concurrently on port `3306`:

| Parameter | Database 1: Dormitory Ops (`mysql`) | Database 2: PMB Admissions (`simaba`) |
| :--- | :--- | :--- |
| **Database Name** | `asrama_ubt_db` | `u540633926_simaba` |
| **Host & Port** | `127.0.0.1:3306` | `127.0.0.1:3306` |
| **Username** | `root` | `u540633926_simaba` (or `root`) |
| **Password** | *(empty by default on Laragon)* | `12345678Ab&` |
| **System Role** | Rooms, billing invoices, payment staging, e-KYC private storage, OTP contracts, e-Tickets | Reading real applicant admissions data (`pendaftaranmahasiswa` & `programstudi`) |
| **Eloquent Model** | `App\Models\User`, `App\Models\BillingInvoice`, `App\Models\Room`, etc. | `App\Models\SimabaPendaftaran` (`protected $connection = 'simaba';`) |

Connection credentials are configured in `.env.example` and `.env`:
```ini
# PRIMARY DORMITORY DATABASE
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=asrama_ubt_db
DB_USERNAME=root
DB_PASSWORD=

# SIMABA DATABASE (ADMISSIONS - DUAL DATABASE)
DB_SIMABA_CONNECTION=mysql
DB_SIMABA_HOST=127.0.0.1
DB_SIMABA_PORT=3306
DB_SIMABA_DATABASE=u540633926_simaba
DB_SIMABA_USERNAME=u540633926_simaba
DB_SIMABA_PASSWORD=12345678Ab&
```

---

## 2. 1-Click Automated Setup

Run `laragon-setup.bat` (or `bash laragon-setup.sh`):
1. Creates both database schemas automatically:
   ```sql
   CREATE DATABASE IF NOT EXISTS asrama_ubt_db;
   CREATE DATABASE IF NOT EXISTS u540633926_simaba;
   ```
2. Provisions user `u540633926_simaba` with password `12345678Ab&` and grants privileges:
   ```sql
   CREATE USER IF NOT EXISTS 'u540633926_simaba'@'localhost' IDENTIFIED BY '12345678Ab&';
   CREATE USER IF NOT EXISTS 'u540633926_simaba'@'127.0.0.1' IDENTIFIED BY '12345678Ab&';
   GRANT ALL PRIVILEGES ON u540633926_simaba.* TO 'u540633926_simaba'@'localhost';
   GRANT ALL PRIVILEGES ON u540633926_simaba.* TO 'u540633926_simaba'@'127.0.0.1';
   FLUSH PRIVILEGES;
   ```
3. Executes migrations and seeders:
   ```bash
   php artisan migrate --seed
   ```

---

## 3. High-Performance MySQL Indexing Verification

To guarantee sub-5ms query times when serving thousands of prospective students simultaneously, the `pendaftaranmahasiswa` table is fortified with four B-Tree indexes:

```sql
ALTER TABLE `pendaftaranmahasiswa`
  ADD INDEX `idx_pmb_auth` (`nomor_pendaftaran`, `tanggal_lahir`),
  ADD INDEX `idx_pmb_nama` (`nama_mahasiswa`(50)),
  ADD INDEX `idx_pmb_nik` (`nik`),
  ADD INDEX `idx_pmb_prodi_jalur` (`program_studi`, `jenis_mahasiswa`);
```

### Verifying Indexes in MySQL:
```sql
SHOW INDEX FROM u540633926_simaba.pendaftaranmahasiswa;
```
Ensure the `Key_name` list includes `idx_pmb_auth`, `idx_pmb_nama`, `idx_pmb_nik`, and `idx_pmb_prodi_jalur`.

### Query Benchmark Test (`EXPLAIN`):
```sql
EXPLAIN SELECT id, nomor_pendaftaran, nama_mahasiswa 
FROM u540633926_simaba.pendaftaranmahasiswa 
WHERE nomor_pendaftaran = '260108001' AND tanggal_lahir = '2008-02-12';
```
**Expected Performance Metrics:**
- `type`: `ref` or `const`
- `key`: `idx_pmb_auth`
- `rows`: `1` (instant $O(1)$ index lookup; 0 full table scans)

---

## 4. Real PMB Student Test Accounts

| No | Full Name | Registration No. | Birth Date (`DD/MM/YYYY`) | Study Program | Admission Track | Key Test Scenario |
|:---|:---|:---|:---|:---|:---|:---|
| **1** | **GRACE MARLIN TELAUMBANUA** | `260108001` | `12/02/2008` | Nursing (S1) | **KIP Scholarship** (100% Subsidy) | Automatic Rp 0 billing, document subsidy check, subsidized room placement |
| **2** | **Jenny Agustina Shellyana** | `250830001` | `29/08/2006` | Nursing (D III) | **Non-KIP / Regular** | Standard billing: Rent + Deposit + Admin Fee with 3-digit unique transfer code |
| **3** | **MAZA ADITIYA** | `250830002` | `19/06/2006` | Public Health (S1) | **KIP Scholarship** | Auto-suggest name "Maza" -> KIP validation flow |
| **4** | **Alvin Octavianus Hasiholan** | `260727002` | `07/08/2008` | Law (S1) | **Non-KIP** | **EARLY NIM DETECTION**: Official NIM `260801004` detected -> seamless SSO modal redirect |
| **5** | **Alfonso Vincent Husly** | `260704001` | `16/05/2008` | Informatics (S1) | **Non-KIP** | Name search "Alfonso" -> room allocation & billing |
| **6** | **Rizka mutiara** | `260421001` | `07/02/2008` | Nursing (S1) | **Non-KIP** | Search "Rizka" -> birth date validation |
| **7** | **Azzahra Safa Musakinah** | `250830003` | `06/09/2007` | Nursing (S1) | **KIP Scholarship** | Scholarship student verification |
| **8** | **Maximilian Wimin Winata** | `PMB2026-08942` | `12/04/2007` | Informatics (S1) | **Non-KIP** | Alphanumeric registration number compatibility |

---

## 5. Maba UX Feature Testing Guide

### A. Live Search Auto-Suggest (200ms Debounce)
1. On login, click **"Pendaftaran Asrama (Jalur PMB)"**.
2. Type at least 2 characters (e.g. `Gra`, `Jen`, `Maz`, `Alv`).
3. Notice the search icon transitions smoothly into a spinning micro-indicator (`Loader2`) during query debounce (200ms).
4. Matched characters in name and registration numbers are highlighted (`<mark>`).

### B. Keyboard Navigation (`↑`, `↓`, `Enter`, `Esc`)
1. Press `↓` (Arrow Down) to move highlight to the next student item.
2. Press `↑` (Arrow Up) to move highlight to previous item.
3. Press `Enter` to select highlighted student and auto-fill form.
4. Press `Esc` to close suggestion dropdown.

### C. Birth Date Formatting (`DD/MM/YYYY`)
1. Enter numeric birth date (e.g., `12022008`). It auto-formats as `12/02/2008`.
2. Backspacing works naturally without cursor trap.
3. Automatically converted to ISO `2008-02-12` for SQL queries.

---

## 6. Staging-to-Master Ledger Verification

### Student Self-Service:
1. Complete e-KYC (KTP & Selfie).
2. Choose room & payment scheme.
3. Upload bank receipt.

### SQL Staging Check:
```sql
SELECT id, no_request, no_pmb, status, total_bayar, operator_id 
FROM request_pembayaran 
ORDER BY id DESC LIMIT 1;
```
- `operator_id = 0` (unverified student input).

### Admin Verification:
- Financial Admin logs into `/login`, verifies transfer proof, and approves.

### Master Ledger Check:
```sql
SELECT id, no_invoice, total_bayar, operator_id FROM pembayaran ORDER BY id DESC LIMIT 1;
SELECT id, no_transaksi, operator_id FROM transaksi ORDER BY id DESC LIMIT 1;
SELECT kode_kamar, status, nama_penghuni FROM kamar WHERE id = ...;
```
- `operator_id >= 1` (verified and committed by staff).
- Room locked to `OCCUPIED`.
- Student progresses to Step 4 (OTP WhatsApp contract).

---

## 7. Troubleshooting

| Symptom | Cause | Resolution |
| :--- | :--- | :--- |
| `SQLSTATE[HY000] [2002] Connection refused` | MySQL not running | Start MySQL in Laragon (green icon on port 3306). |
| `Table 'u540633926_simaba.pendaftaranmahasiswa' doesn't exist` | Seeds unpopulated | Run `php artisan db:seed --class=SimabaDatabaseSeeder`. |
| `Access denied for user 'u540633926_simaba'@'localhost'` | User permissions missing | Re-run `laragon-setup.bat` or grant SQL statements in section 2. |
