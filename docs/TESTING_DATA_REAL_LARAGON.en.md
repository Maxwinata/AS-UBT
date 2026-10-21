# Practical Guide: Testing Program Logic with Real Data in Laragon (MySQL + Dual SIMABA Database + Laravel 11 + Inertia.js)

> **Language Selection:** [🇮🇩 Versi Bahasa Indonesia (Utama)](TESTING_DATA_REAL_LARAGON.md) | 🇬🇧 **English Version**

This document serves as the comprehensive technical, testing, and operational guide for software engineers, QA testers, financial managers, and dormitory administrative staff at Universitas Bunda Thamrin (UBT). It is designed to facilitate a **seamless transition from client-side prototype simulations to testing real program logic using dual MySQL databases, Laravel 11 backend, and Inertia.js/React frontend in a local Laragon environment through to production deployment**.

---

## 📌 Related System Documentation

| Document | Location | Purpose |
| :--- | :--- | :--- |
| **1-Click Laragon Setup** | [`LARAGON_SETUP.en.md`](../LARAGON_SETUP.en.md) | Quick setup guide for PHP 8.2+, MySQL, and automation scripts. |
| **Staging & Master Architecture** | [`docs/ARCHITECTURE.md`](ARCHITECTURE.md) | Detailed rationale for unverified staging (`operator_id = 0`) vs master ledger (`operator_id = 1`). |
| **5 Testing Scenarios** | [`docs/scenario-mappings.en.md`](scenario-mappings.en.md) | Scenarios for regular applicants, KIP scholarships, installment plans, and NIM transitions. |
| **e-KYC Secure Storage** | [`docs/SECURE_UPLOAD_STRATEGY.en.md`](SECURE_UPLOAD_STRATEGY.en.md) | Verification guide for private disk storage and short-lived signed URLs for ID & selfie files. |
| **Pre-Production Readiness** | [`docs/PRE_PRODUCTION_READINESS.en.md`](PRE_PRODUCTION_READINESS.en.md) | Dummy data sanitization, real room master setup, 3-digit unique code cashier SOP, & go-live checklist. |
| **Complete System Specs** | [`ASRAMA_UBT_SYSTEM_DOCUMENTATION.md`](../ASRAMA_UBT_SYSTEM_DOCUMENTATION.md) | Business logic rules, JUKLAK-02, JUKLAK-03, lease contracts, and F-22 ratification sheets. |

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

> 🔒 **CRITICAL SECURITY & CREDENTIAL ISOLATION NOTICE:**
> - The password `12345678Ab&` is **STRICTLY AND EXCLUSIVELY** reserved for the production SIMABA SQL database (`u540633926_simaba`) connection on the live server.
> - **DO NOT** use this password generically for other system accounts (such as administrative user logins, local root MySQL, cPanel, or email accounts).
> - **DO NOT** commit or document this real server database password to public GitHub repositories (e.g., in `.env.example`).
> - The `.env` file holding real server credentials must always remain gitignored. The template `.env.example` in Git must remain empty (`DB_SIMABA_PASSWORD=`).
> - Local development administrative test accounts use a separate, isolated demo password: **`password123`**.

Connection credentials are configured in `config/database.php` and your private `.env`:
```ini
# PRIMARY DORMITORY DATABASE (OPERATIONS & LEDGER)
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=asrama_ubt_db
DB_USERNAME=root
DB_PASSWORD=

# SIMABA DATABASE (NEW STUDENT ADMISSIONS - DUAL DATABASE)
# NOTE: Store real server database passwords ONLY in your private .env file; NEVER commit to GitHub!
DB_SIMABA_CONNECTION=mysql
DB_SIMABA_HOST=127.0.0.1
DB_SIMABA_PORT=3306
DB_SIMABA_DATABASE=u540633926_simaba
DB_SIMABA_USERNAME=u540633926_simaba
DB_SIMABA_PASSWORD=12345678Ab&
```

---

## 2. 1-Click Automated Setup (Laragon)

Run `laragon-setup.bat` (or `bash laragon-setup.sh` in Git Bash/Linux):

```cmd
laragon-setup.bat
```

The script automatically executes 7 setup phases:
1. Validates PHP 8.2+, Composer, Node.js, and MySQL services.
2. Initializes `.env` from `.env.example`.
3. Installs Composer dependencies and generates an Application Key (`php artisan key:generate`).
4. Installs Node.js frontend packages (`npm install`).
5. Ensures both database schemas (`asrama_ubt_db` and `u540633926_simaba`) and user `u540633926_simaba` exist with full privileges:
   ```sql
   CREATE DATABASE IF NOT EXISTS asrama_ubt_db;
   CREATE DATABASE IF NOT EXISTS u540633926_simaba;
   CREATE USER IF NOT EXISTS 'u540633926_simaba'@'localhost';
   CREATE USER IF NOT EXISTS 'u540633926_simaba'@'127.0.0.1';
   GRANT ALL PRIVILEGES ON u540633926_simaba.* TO 'u540633926_simaba'@'localhost';
   GRANT ALL PRIVILEGES ON u540633926_simaba.* TO 'u540633926_simaba'@'127.0.0.1';
   FLUSH PRIVILEGES;
   ```
6. Runs calibrated database migrations and seeders:
   - **Real Production Mode (Default / Recommended)**: `php artisan migrate --seed --seeder=ProductionSeeder` (100% free of dummy student accounts; initializes Rector Tariff Decree, 64 physical rooms at Roemah 54, and official staff accounts).
   - **Simulation Testing Mode**: `php artisan migrate --seed` (includes sample student personas for QA).
7. Creates the public storage symlink (`php artisan storage:link`).
8. Provides the **`laragon-test-crud.bat`** rapid test utility for immediate console verification of MySQL CRUD operations.

---

## 3. High-Performance MySQL Indexing Verification

To guarantee sub-5ms query times when serving thousands of prospective students simultaneously during peak admission periods, the `pendaftaranmahasiswa` table is equipped with 4 B-Tree indexes:

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
Ensure the `Key_name` output contains `idx_pmb_auth`, `idx_pmb_nama`, `idx_pmb_nik`, and `idx_pmb_prodi_jalur`.

### Query Benchmark Test (`EXPLAIN`):
```sql
EXPLAIN SELECT id, nomor_pendaftaran, nama_mahasiswa 
FROM u540633926_simaba.pendaftaranmahasiswa 
WHERE nomor_pendaftaran = '260108001' AND tanggal_lahir = '2008-02-12';
```
**Expected Performance Metrics:**
- `type`: `ref` or `const`
- `key`: **`idx_pmb_auth`**
- `rows`: `1` (instant $\mathcal{O}(1)$ index lookup; 0 full table scans)

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
3. Notice the search icon transitions into an animated micro-spinner (`Loader2 animate-spin`) during query debounce (200ms), then smoothly resets when data is ready.
4. Matched substring characters in names and registration numbers are highlighted (`<mark className="bg-teal-100 text-teal-950 font-black px-0.5">`).

### B. Keyboard Navigation (`↑`, `↓`, `Enter`, `Esc`)
1. Once suggestions appear:
   - Press `↓` (Arrow Down) to move active focus to the next student card with a distinctive left border highlight (`border-l-4 border-l-teal-600 bg-teal-50`).
   - Press `↑` (Arrow Up) to move focus to the previous card.
   - Press `Enter` to select the focused student and auto-fill registration number and birth date.
   - Press `Esc` to close the dropdown list.

### C. Birth Date Formatting (`DD/MM/YYYY`)
1. Input field enforces Indonesian date format: **Day / Month / Year** (`DD/MM/YYYY`).
2. Input mask formats numeric input automatically (e.g., `12022008` becomes `12/02/2008`).
3. Backspacing works naturally without cursor trap.
4. Backend converts `12/02/2008` to ISO format `2008-02-12` for SQL queries.

### D. Early Official NIM Detection
1. Select **Alvin Octavianus Hasiholan Hutasoit** (`260727002` / `07/08/2008`).
2. Click **"Masuk Portal Pendaftaran Asrama"**.
3. **Expected Behavior**:
   - System checks SIAKAD staging in background and detects **Official NIM: `260801004`**.
   - Modal alert appears offering immediate transition to SSO student login.

---

## 6. Dormitory Registration via SSO Login (Non-Resident University Students with SIAKAD Smart Pre-Fill)

In addition to prospective students from the PMB track (SIMABA), the SI-GABUNG 54 Portal accommodates **dormitory room registration for active university students** (Cohorts 2022 to 2026 or students who have received official university Single Sign-On accounts) who have not previously resided in the dormitories (*Non-Active Residents*).

### A. Working Concept & Multi-Tier DB Check Handler
When a student submits their student ID (NIM) and SSO password in the portal, the system automatically runs a tiered membership check:
1. **Tier 1 (SSO Credential Authentication)**: System verifies student NIM and credentials against university SIAKAD/SIDARA directory.
2. **Tier 2 (Dormitory Operations Database Query)**: System queries `asrama_ubt_db` to determine if the student currently occupies an active room or holds an approved lease contract:
   ```sql
   SELECT id, kode_kamar, status, nama_penghuni, nim 
   FROM kamar 
   WHERE nim = '2240101088' AND status = 'OCCUPIED';
   ```
3. **Tier 3 (Evaluation & Registration Redirection Modal)**:
   - If **NO ACTIVE OCCUPANCY RECORD IS FOUND** (i.e., an active university student without a dormitory room), the system displays the **Registration Redirection Modal**:
     > *"Your SSO account is verified in SIAKAD (NIM: 2240101088), but you are not currently registered as an active resident of UBT Dormitory. You are being redirected to the Dormitory Room Registration process."*
   - Student clicks **"Continue to Dormitory Registration (Smart Pre-Fill)"** to initiate the room allocation flow.

---

### B. Real Student Test Accounts for SSO Registration (SIAKAD Staging Data)

Use these active student test accounts to verify the SSO registration pathway:

| No | Student Name | Official SIAKAD NIM | SIAKAD Profile Status | Billing Track | Key SSO Registration Test Scenario |
|:---|:---|:---|:---|:---|:---|
| **1** | **Ahmad Zaky** | `2240101088` | **Complete** (GPA 3.82, S1 Management, Medan) | **Regular Track** | **Complete Smart Pre-Fill**: Demographic & academic profile locked automatically from SIAKAD. Per JUKLAK-02 regulations, student must upload physical national ID card & selfie biometrics in Step 1 before selecting room. |
| **2** | **Rina Anggraini** | `2240101099` | **Partial** (S1 Nursing, KIP Scholarship) | **KIP Scholarship** (Rp 0) | **Partial Smart Pre-Fill**: Academic data pre-filled, but national ID (NIK) & guardian contact pending. Student completes missing demographic info and attaches subsidy proof in Step 1. |
| **3** | **Alvin Octavianus Hasiholan** | `260801004` *(PMB Reg: 260727002)* | **Official NIM Migrated** (S1 Law, Cohort 2026) | **Regular Track** | **PMB-to-SSO Identity Transition**: Verification of new students transitioning from PMB registration numbers to official university NIMs. System binds legacy PMB room requests to official SSO profile. |

---

### C. Step-by-Step SSO Registration Testing Walkthrough

1. **Login via UBT SSO**:
   - On the login page (`/login`), click **"Login SSO UBT"**.
   - Select the simulator option: **`Ahmad Zaky • Data SIAKAD Lengkap`** (or enter NIM: **`2240101088`** and SSO password: `••••••••••••`).
   - Click **"Masuk via SSO UBT & Check Status Database"**.
   - Observe the 3-step animated database status check (*Credential Auth* $\rightarrow$ *Querying DB Asrama* $\rightarrow$ *Result Evaluated*).

2. **Registration Redirection Modal**:
   - A modal prompt confirms active university enrollment without current resident status.
   - Click the green button: **"Lanjutkan Pendaftaran Asrama (Smart Pre-Fill)"**.

3. **Step 1 (Identity Validation & Physical e-KYC)**:
   - Notice that **NIM: `2240101088`**, **Name: `Ahmad Zaky`**, **Faculty: `Economics & Business`**, and **Program: `S1 Management`** are locked in read-only mode with the `[Terverifikasi SIAKAD]` verification badge.
   - **Compliance with Rule JUKLAK-02**: Student must physically upload original ID card and biometric selfie. This prevents shared accounts or proxy booking.
   - Click **"Simpan & Lanjutkan ke Pemilihan Kamar"**.

4. **Steps 2 to 6**:
   - Progress through room selection (Step 2), invoice & staging payment proof (Step 3), WhatsApp OTP digital contract (Step 4), BASTK ratification (Step 5), and e-Ticket gate boarding pass issuance (Step 6).

---

### D. MySQL Database Verification for SSO Registration (`asrama_ubt_db`)

Verify the staging records in MySQL CLI or phpMyAdmin:

```sql
-- 1. Check academic demographic record in SIAKAD staging table
SELECT id, nim_resmi, nomor_registrasi, nama_lengkap, program_studi, fakultas, has_active_nim 
FROM siakad_mahasiswa_stg 
WHERE nim_resmi = '2240101088';

-- 2. Verify payment request staging entry for the SSO applicant
SELECT id, no_request, nim, nama_mahasiswa, total_bayar, status, operator_id, created_at 
FROM request_pembayaran 
WHERE nim = '2240101088' 
ORDER BY id DESC LIMIT 1;
```

**Expected Results:**
- `Ahmad Zaky` confirmed in `siakad_mahasiswa_stg` with `has_active_nim = 1`.
- Staging record in `request_pembayaran` created with `operator_id = 0` (awaiting financial administrator verification before migration to master ledger).

---

## 7. Complete Registration Stages (Steps 1 to 6)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    STUDENT REGISTRATION WORKFLOW STAGES                     │
├─────────────┬─────────────┬─────────────┬─────────────┬─────────────┬───────┤
│   STEP 1    │   STEP 2    │   STEP 3    │   STEP 4    │   STEP 5    │STEP 6 │
│    e-KYC    │ Select Room │  Billing &  │ WhatsApp OTP│ Ratification│e-Pass │
│  Biometrics │   & Bed     │ Transaction │  Contract   │ F-22 & BASTK│ Gate  │
└─────────────┴─────────────┴─────────────┴─────────────┴─────────────┴───────┘
```

### Step 1: Self-Service Identity & e-KYC Verification
1. Login as an applicant (e.g., `260108001` - GRACE MARLIN).
2. Review pre-filled demographic data from SIMABA.
3. Upload required documents:
   - **Original National ID (KTP)**: JPG/PNG, max 2MB.
   - **Selfie Biometric holding ID**: Clear facial photo with legible ID text.
   - *(KIP Applicants)*: Official scholarship subsidy verification card.
4. **Private Disk Storage Security Verification**:
   - Files are stored in `storage/app/private_kyc/{registration_no}/`.
   - **Non-Overwriting Versioning Rule**: Filenames use timestamps or UUIDs (e.g., `ktp_260108001_v1_171800.jpg`). Re-uploads **NEVER OVERWRITE** previous versions, preserving the audit trail.
   - Files are **NEVER** accessible via static public URLs; access is gated via short-lived temporary Signed URLs.

### Step 2: Room & Bed Allocation
1. Room map renders filtered by gender (Female $\rightarrow$ Women's Hall; Male $\rightarrow$ Men's Hall).
2. Select Building, Floor, and Room (e.g., Room `P-204`).
3. Select an `AVAILABLE` bed (e.g., Bed B - Window Side).
4. Click **"Kunci Kamar & Lanjutkan"**.
5. **System Verification**:
   - Bed status updates to `HELD` (Room Hold) for 2 hours to prevent double-booking.

### Step 3: Rental Scheme, Billing & Staging Proof of Transfer
1. **Invoice Generation**:
   - **KIP Scholarship**: 100% subsidized room charge (Rp 0).
   - **Regular Track**: Semester rent (Rp 3.000.000,-) + Security Deposit (Rp 500.000,-) + Admin Fee (Rp 100.000,-) + 3-Digit Unique Code (e.g., `482`) $\rightarrow$ Total: `Rp 3.600.482,-`.
2. **Upload Bank Transfer Receipt**:
   - Transfer to official university account **Bank Mandiri `1050508988809` a.n. `Asrama Universitas Bunda Thamrin`** matching exact invoice total with 3-digit unique code (optional BNI Virtual Account simulation also available).
   - Upload transfer slip and submit.
3. **Verify Staging Data in MySQL (`asrama_ubt_db`)**:
   ```sql
   SELECT id, no_request, no_pmb, status, total_bayar, bukti_bayar_path, operator_id, created_at 
   FROM request_pembayaran 
   ORDER BY id DESC LIMIT 1;
   ```
   - `operator_id = 0`: Demonstrates unverified student submission.
   - `status = 'WAITING_VERIFICATION'`.
   - Data has **NOT YET** entered official `pembayaran` or `transaksi` ledgers.

### Step 4: Digital Contract Signing via WhatsApp OTP
1. Once financial admin approves Step 3, student dashboard advances to **Step 4**.
2. Review Dormitory Code of Conduct (Form F-19) and Statement of Compliance (Form F-02).
3. Click **"Minta Kode OTP Verifikasi WhatsApp"**.
4. **Sandbox Testing Simulation**:
   - Use universal sandbox code: **`123456`**.
5. Submit OTP code.
6. **Integrity Check**:
   - System registers SHA-256 hash of agreement text, recipient phone number, IP address, and timestamp in `kontrak_digital`. Status: `SIGNED_VALID`.

### Step 5: F-22 Ratification & Room Handover Record (BASTK)
1. System produces two official legal documents:
   - **F-22 Allocation Ratification Sheet**: Digitally countersigned by Dormitory Director.
   - **BASTK (Room Facility Handover Record)**: Inventory checklist (physical key, mattress, wardrobe, study desk, gate access card).
2. Student reviews checklist and accepts facility condition.
3. Official printable PDF with digital verification QR stamp is unlocked.

### Step 6: Digital Gate Pass Issuance (e-Ticket QR) & Physical Check-In
1. System automatically generates the **e-Ticket / Dormitory Boarding Pass**.
2. Pass includes:
   - Unique Access Code: e.g., `PASS-2026-8831-UBT`.
   - Encrypted QR Code for gate security post.
   - Room number, building, floor, and move-in effective date.
3. **Physical Gate Check-In Simulation**:
   - Security staff scans QR code at entrance post.
   - Resident status transitions to `ACTIVE_IN_HOUSE`.
   - Physical room key is issued.

---

## 8. Multi-Role Admin Operational Testing

Test administrative role segregation at `/login`:

| Admin Role | Login Credentials | Testing Responsibilities |
| :--- | :--- | :--- |
| **1. Financial Admin** | `keuangan@ubt.ac.id` / `password123` | Bank receipt verification & Staging-to-Master migration |
| **2. Room Admin** | `asrama@ubt.ac.id` / `password123` | Occupancy management, key dispatch, inventory BASTK |
| **3. Super Admin** | `superadmin@ubt.ac.id` / `password123` | e-KYC audit trail, dual DB sync, SIAKAD bridging |

### Financial Approval Verification (Staging to Master):
1. Log in as `keuangan@ubt.ac.id`.
2. Open **"Verifikasi Pembayaran & Bukti Transfer"**.
3. Select the pending applicant and match bank transfer with 3-digit code.
4. Click **"Verifikasi & Sahkan Pembayaran"** (`APPROVE_AND_MIGRATE`).
5. **Verify Master Database Tables in MySQL (`asrama_ubt_db`)**:
   ```sql
   SELECT id, no_invoice, no_request, total_bayar, operator_id, created_at 
   FROM pembayaran ORDER BY id DESC LIMIT 1;

   SELECT id, no_transaksi, kode_transaksi, jumlah_bayar, operator_id 
   FROM transaksi ORDER BY id DESC LIMIT 1;

   SELECT kode_kamar, status, nama_penghuni 
   FROM kamar WHERE id = (SELECT kamar_id FROM request_pembayaran ORDER BY id DESC LIMIT 1);
   ```
   - `operator_id >= 1` (confirms authoritative staff endorsement).
   - Official invoice `INV-2026-...` generated.
   - Room status locked to `OCCUPIED`.

---

## 9. Development & Debugging in Laragon

### 1. Private e-KYC Storage & Signed URLs
- Sensitive files reside in `storage/app/private_kyc/`.
- Download endpoint requires authentication middleware and validates signature:
  ```php
  use Illuminate\Support\Facades\URL;

  public function getKtpPreviewUrl($studentId)
  {
      return URL::temporarySignedRoute(
          'admin.kyc.download',
          now()->addMinutes(15),
          ['student' => $studentId, 'type' => 'ktp']
      );
  }
  ```

### 2. Live Log Monitoring
```bash
# Windows PowerShell in Laragon
Get-Content -Path storage/logs/laravel.log -Wait -Tail 30

# Git Bash / Linux
tail -f storage/logs/laravel.log
```

### 3. Interactive Laravel Tinker Inspection
```bash
php artisan tinker
```
```php
// Test Simaba authentication model
$student = \App\Models\SimabaPendaftaran::authenticate('260108001', '12/02/2008');
echo "Name: {$student->nama_mahasiswa} | Track: {$student->jenis_mahasiswa}\n";

// Test indexed name search scope
$results = \App\Models\SimabaPendaftaran::searchByNameOrReg('Alvin')->get();
foreach ($results as $r) {
    echo "PMB: {$r->nomor_pendaftaran} - {$r->nama_mahasiswa}\n";
}
```

### 4. Cache Clearing
```bash
php artisan config:clear
php artisan route:clear
php artisan view:clear
php artisan cache:clear
```

---

## 10. Production Readiness Guide

> 📘 **DEDICATED PRE-PRODUCTION OPERATIONAL GUIDE:**
> For comprehensive specifications covering the data sanitization protocol, real physical room master initialization (`RealRoomSeeder.php`), 3-digit randomized unique code cashier reconciliation SOP, and go-live day checklist, please refer to:
> 👉 **[`docs/PRE_PRODUCTION_READINESS.en.md`](PRE_PRODUCTION_READINESS.en.md)** (or [🇮🇩 Versi Bahasa Indonesia](PRE_PRODUCTION_READINESS.md)).

### 1. Security Configuration (`.env.production`)
```ini
APP_NAME="Portal SI-GABUNG 54 Asrama UBT"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://asrama.ubt.ac.id

SESSION_DRIVER=database
SESSION_LIFETIME=120
SESSION_ENCRYPT=true
SESSION_SECURE_COOKIE=true
SESSION_HTTP_ONLY=true
SESSION_SAME_SITE=lax

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=asrama_ubt_prod
DB_USERNAME=asrama_prod_user
DB_PASSWORD=StrongProductionPassword99#

DB_SIMABA_CONNECTION=mysql
DB_SIMABA_HOST=10.0.0.5
DB_SIMABA_PORT=3306
DB_SIMABA_DATABASE=u540633926_simaba
DB_SIMABA_USERNAME=u540633926_simaba
# NOTE: Store real server database passwords ONLY in your private .env file; NEVER commit to GitHub!
DB_SIMABA_PASSWORD=<ENTER_PRODUCTION_SQL_SIMABA_PASSWORD_IN_PRIVATE_ENV>
```

### 2. Production Optimization Commands
```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
composer install --optimize-autoloader --no-dev
npm run build
```

### 3. Nginx Virtual Host Configuration
```nginx
server {
    listen 80;
    server_name asrama.ubt.ac.id;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name asrama.ubt.ac.id;

    root /var/www/asrama-ubt/public;
    index index.php index.html;

    ssl_certificate /etc/letsencrypt/live/asrama.ubt.ac.id/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/asrama.ubt.ac.id/privkey.pem;

    client_max_body_size 10M;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }

    location ^~ /storage/app/private_kyc {
        deny all;
        return 403;
    }
}
```

### 4. Background Queue Worker (Supervisor)
```ini
[program:asrama-queue-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/asrama-ubt/artisan queue:work --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=2
redirect_stderr=true
stdout_logfile=/var/www/asrama-ubt/storage/logs/queue-worker.log
```

### 5. Automated Database Backups
```bash
#!/bin/bash
BACKUP_DIR="/var/backups/asrama-db"
DATE=$(date +"%Y%m%d_%H%M%S")
mkdir -p $BACKUP_DIR

mysqldump -u root asrama_ubt_db | gzip > "$BACKUP_DIR/asrama_ubt_db_$DATE.sql.gz"
mysqldump -u root u540633926_simaba | gzip > "$BACKUP_DIR/u540633926_simaba_$DATE.sql.gz"
find $BACKUP_DIR -type f -name "*.sql.gz" -mtime +30 -delete
```

---

## 11. Comprehensive Troubleshooting

| Symptom | Cause | Concrete Solution |
| :--- | :--- | :--- |
| `SQLSTATE[HY000] [2002] Connection refused` | MySQL service not running | Start MySQL in Laragon (green icon on port 3306). |
| `Table 'u540633926_simaba.pendaftaranmahasiswa' doesn't exist` | Seeds unpopulated | Run `php artisan db:seed --class=SimabaDatabaseSeeder`. |
| `Access denied for user 'u540633926_simaba'@'localhost'` | User permissions missing | Re-run `laragon-setup.bat` or grant SQL statements in Chapter 2. |
| `Table 'asrama_ubt_db.request_pembayaran' doesn't exist` | Migrations unexecuted | Run `php artisan migrate:fresh --seed`. |
| Financial approval button fails to migrate data | Invoice remains `UNPAID` in DB | Ensure transfer proof uploaded and action is `APPROVE_AND_MIGRATE`. |
| WhatsApp OTP not arriving in local test | Gateway inactive in sandbox | Use universal sandbox OTP code: **`123456`**. |
| e-KYC preview returns `403 Forbidden` | Expired Signed URL or unauthenticated | Log in with authorized staff account and refresh page. |
| Frontend changes not rendering | Browser/Vite build cache | Run `npm run build` and hard reload browser (`Ctrl + Shift + R`). |
