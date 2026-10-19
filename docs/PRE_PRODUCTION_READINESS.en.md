# Pre-Production Readiness Guide: Data Sanitization, Real Room Master Inventory, & Manual Bank Transfer SOP

> **Language Selection:** [🇮🇩 Versi Bahasa Indonesia (Utama)](PRE_PRODUCTION_READINESS.md) | 🇬🇧 **English Version**
>
> **Related Documentation:**
> - [Real Data Testing Guide on Laragon](TESTING_DATA_REAL_LARAGON.en.md)
> - [Staging & Master Ledger Architecture](ARCHITECTURE.en.md)
> - [e-KYC Secure Storage Strategy](SECURE_UPLOAD_STRATEGY.en.md)

This document provides the standard operating procedures (SOP) and technical specifications for **Pre-Production Readiness** for the SI-GABUNG 54 Dormitory Portal at Universitas Bunda Thamrin (UBT). It guides software engineers, system administrators (DevOps), university cashiers/finance staff, and dormitory managers in preparing the production environment prior to opening student admissions.

---

## 1. Overview & Pre-Production Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                 UBT DORMITORY PRE-PRODUCTION READINESS ARCHITECTURE          │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
     ┌─────────────────────────────────┼─────────────────────────────────┐
     ▼                                 ▼                                 ▼
┌──────────────────────────┐ ┌──────────────────────────┐ ┌──────────────────────────┐
│ 1. DATA SANITIZATION     │ │ 2. REAL ROOM INVENTORY   │ │ 3. CASHIER SOP & CODES   │
│                          │ │                          │ │                          │
│ • Clear staging records  │ │ • Male Building Roemah 54│ │ • 3-Digit Unique Code Gen│
│ • Purge mock e-KYC files │ │ • Female Bldg Roemah 54  │ │ • Match Mandiri Mutasi   │
│ • Pure ProductionSeeder  │ │ • 64 Rooms / 128 Beds    │ │ • 24-Hour Hold Timeout   │
│ • Official argon2 staff  │ │ • RealRoomSeeder.php     │ │ • Approval & Audit Trail │
└────────────┬─────────────┘ └────────────┬─────────────┘ └────────────┬─────────────┘
             │                            │                            │
             └────────────────────────────┼────────────────────────────┘
                                          ▼
                      ┌──────────────────────────────────────┐
                      │ PRODUCTION DATABASE (asrama_ubt_db)  │
                      │                                      │
                      │ • rooms: Real Room Inventory (100%)  │
                      │ • users: Isolated Official Staff     │
                      │ • request_pembayaran: Clean Staging  │
                      │ • pembayaran/transaksi: Ledger Books │
                      └──────────────────────────────────────┘
```

---

## 2. Data Sanitization Protocol

Prior to production launch, the operational dormitory database (`asrama_ubt_db`) must be completely sanitized of simulation records (such as test accounts *Maximilian*, *Jenny*, mock invoices, and synthetic e-KYC uploads) without damaging table schemas or database migrations.

### 2.1 MySQL Table Truncation Script
Execute the following SQL commands on the production operational database (`asrama_ubt_db`):

```sql
-- TEMPORARILY DISABLE FOREIGN KEY CHECKS
SET FOREIGN_KEY_CHECKS = 0;

-- 1. Sanitize application transactions & staging tables
TRUNCATE TABLE `request_pembayaran`;
TRUNCATE TABLE `pembayaran`;
TRUNCATE TABLE `transaksi`;
TRUNCATE TABLE `billing_invoices`;

-- 2. Clear digital contracts, ratification forms, and boarding passes
TRUNCATE TABLE `kontrak_digital`;
TRUNCATE TABLE `contracts`;
TRUNCATE TABLE `e_tickets`;
TRUNCATE TABLE `tickets`;
TRUNCATE TABLE `delinquencies`;

-- 3. Clear simulated student registration profiles
TRUNCATE TABLE `maba_profiles`;

-- 4. Remove non-admin test users (retain official administrative staff)
DELETE FROM `users` WHERE `role` NOT IN ('admin', 'superadmin');

-- 5. Clear simulation audit trails
TRUNCATE TABLE `audit_trails`;

-- RE-ENABLE FOREIGN KEY CHECKS
SET FOREIGN_KEY_CHECKS = 1;
```

### 2.2 e-KYC Storage Sanitization
In accordance with the e-KYC security architecture, national ID (KTP) and selfie files are stored on a private disk (`storage/app/private_kyc/`). Purge all testing mock files on the live server:

```bash
# Clean mock files in private storage (retain directory and .gitignore)
rm -rf storage/app/private_kyc/*
touch storage/app/private_kyc/.gitignore

# Set strict permissions (accessible only by www-data)
chmod -R 750 storage/app/private_kyc
chown -R www-data:www-data storage/app/private_kyc
```

> 🔒 **e-KYC ARCHITECTURAL RULES (AUDIT TRAIL & LIFECYCLE):**
> 1. **Versioning over Overwriting**: In production, never overwrite existing KYC files when an applicant submits a correction. Always append unique timestamps or UUIDs (e.g., `ktp_260108001_v2_1713500.jpg`) to preserve historical verification logs.
> 2. **Private Buckets & Signed URLs**: Sensitive KYC data must reside in private storage buckets. Staff preview access must be gated via short-lived *Signed URLs* (maximum 15-minute validity).
> 3. **Garbage Collection**: Orphaned e-KYC files from cancelled or abandoned applications are pruned automatically after 30–60 days via `php artisan kyc:prune-orphans --days=60`.

---

## 3. Real Physical Room Master Inventory Initialization

The room master data must precisely match the physical architecture of Universitas Bunda Thamrin's Roemah 54 Dormitory (Male & Female Buildings).

### 3.1 Building Specifications & Bed Allocations

| Building | Floor | Room Numbers | Room Count | Capacity | Amenities & Facilities | Monthly Tariff |
| :--- | :---: | :---: | :---: | :---: | :--- | :--- |
| **Roemah 54 Male** | 1 | `PA-101` to `PA-108` | 8 | 16 (Bed A & B) | 1PK AC, External Bathroom, Desk, Wardrobe, Wi-Fi | IDR 500,000 / student |
| **Roemah 54 Male** | 2 | `PA-201` to `PA-212` | 12 | 24 (Bed A & B) | 1PK AC, Ensuite Bathroom, Ergonomic Desk, Wardrobe | IDR 600,000 / student |
| **Roemah 54 Male** | 3 | `PA-301` to `PA-312` | 12 | 24 (Bed A & B) | Wall Fan (Non-AC), External Bathroom, Desk | IDR 400,000 / student |
| **Roemah 54 Female** | 1 | `PI-101` to `PI-108` | 8 | 16 (Bed A & B) | 1PK AC, External Bathroom, Desk, Wardrobe, Wi-Fi | IDR 500,000 / student |
| **Roemah 54 Female** | 2 | `PI-201` to `PI-212` | 12 | 24 (Bed A & B) | 1.5PK AC, Ensuite Bath + Water Heater, Springbed | IDR 650,000 / student |
| **Roemah 54 Female** | 3 | `PI-301` to `PI-312` | 12 | 24 (Bed A & B) | Wall Fan (Non-AC), External Bathroom, Desk | IDR 400,000 / student |
| **TOTAL** | - | - | **64 Rooms** | **128 Beds** | - | Initial Status: `AVAILABLE` |

### 3.2 Executing the Production Seeder
Run the production seeder that injects official tariffs, real rooms, and administrative staff:

```bash
php artisan db:seed --class=ProductionSeeder --force
```

Expected Outcome:
- Creates/updates 3 official staff accounts (`keuangan@ubt.ac.id`, `asrama@ubt.ac.id`, `superadmin@ubt.ac.id`).
- Injects 8 official Rector-decreed tariffs (`TariffSeeder`).
- Injects 64 physical rooms with `terisi = 0` and status `AVAILABLE` (`RealRoomSeeder`).
- **Zero simulated student accounts**.

### 3.3 Verifying Room Inventory in MySQL:
```sql
SELECT gedung, lantai, count(*) as total_rooms, sum(kapasitas) as total_beds, sum(terisi) as occupied_beds
FROM rooms
GROUP BY gedung, lantai;
```
Ensure `occupied_beds = 0` and total rooms equal 64.

---

## 4. Manual Bank Transfer SOP & Cashier Reconciliation

Per institutional policy for early production release, student admissions payments **strictly utilize manual bank transfers with a 3-digit randomized unique code and manual cashier verification**, avoiding 3rd-party payment gateway transaction fees and maintaining 100% university control.

### 4.1 Official University Bank Account
All dormitory admissions manual transfer payments are valid only when transferred to:
- **Bank**: **Bank Mandiri** (Primary Manual Transfer Channel)
- **Account Number**: `1050508988809`
- **Account Name**: **Asrama Universitas Bunda Thamrin**
- **Bank Code (Inter-Bank Transfers)**: `008`

> **Virtual Account Channel Note**:
> For automated Virtual Account (VA) transactions, the institution connects via **Bank BNI** (Bank Code: `009`, sandbox test VA number: `9881 2345 6789 0123`). This VA channel is designated for automated Host-to-Host connectivity and sandbox simulations.

### 4.2 3-Digit Unique Nominal Code Generator
To distinguish transfers between students selecting the same rental scheme and nominal:
1. The system computes the base fee (e.g., 6-Month Standard Rent = IDR 3,000,000 + Deposit IDR 1,000,000 + Admin Fee IDR 100,000 = Subtotal IDR 4,100,000).
2. The generator picks a randomized 3-digit integer between `001` and `999` (e.g., `247`).
3. The system ensures no active `UNPAID` invoice shares the exact total of `IDR 4,100,247` on that day.
4. The exact payable amount is displayed: **`IDR 4,100,247`**.

### 4.3 Cashier & Finance Staff Operational Flow
Finance staff perform manual reconciliation daily:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    UBT CASHIER RECONCILIATION WORKFLOW                      │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
                 ┌───────────────────────────────────────────┐
                 │ 1. Login to keuangan@ubt.ac.id            │
                 │    Open "Bank Transfer Verification" Menu │
                 └─────────────────────┬─────────────────────┘
                                       │
                                       ▼
                 ┌───────────────────────────────────────────┐
                 │ 2. Access Kopra / Livin' by Mandiri       │
                 │    Download Today's Bank Statement        │
                 └─────────────────────┬─────────────────────┘
                                       │
                                       ▼
                 ┌───────────────────────────────────────────┐
                 │ 3. Quick Match via Last 3 Digits          │
                 │    Search Amount (e.g., 4,100,247)        │
                 └─────────────────────┬─────────────────────┘
                                       │
                    ┌──────────────────┴──────────────────┐
                    │                                     │
           [AMOUNT MATCHES]                       [DISCREPANCY FOUND]
                    ▼                                     ▼
     ┌─────────────────────────────┐       ┌─────────────────────────────┐
     │ 4. Click "APPROVE & MIGRATE"│       │ 5. Review Discrepancy Case  │
     │  • operator_id: [CASHIER_ID]│       │  • Underpaid: Request diff  │
     │  • Staging -> Master Ledger │       │  • Overpaid: Record deposit │
     │  • Room Status: OCCUPIED    │       │  • Illegible: Request re-up │
     │  • Applicant advances to F19│       └─────────────────────────────┘
     └─────────────────────────────┘
```

### 4.4 Discrepancy Resolution Protocol

| Case Scenario | Statement Appearance | Cashier Action |
| :--- | :--- | :--- |
| **Case A: Rounded Nominal** | Transferred `IDR 4,100,000` (forgot the unique code `247`). | Match sender account name with applicant identity. If verified, cashier adjusts the unique code variance and approves the invoice manually. |
| **Case B: Underpayment** | Transferred less than invoice amount (e.g., only IDR 3,000,000). | Mark invoice as `PARTIALLY_PAID`. System automatically notifies student of remaining balance. Digital contract remains locked until fully settled. |
| **Case C: Overpayment** | Student mistakenly entered a larger amount. | Verify surplus funds and record the credit to the student's security deposit account in `delinquencies` / ledger balance. |
| **Case D: Illegible / Fraudulent Slip** | Edited transfer receipt or transaction not found in Bank Mandiri statement. | Cashier clicks `REJECT` with reason: *"Transaction not found in university statement. Please contact cashier at 0812-3456-7001 or re-upload valid proof"*. |

### 4.5 24-Hour Room Hold Timeout
To prevent bed inventory hoarding by inactive applicants:
1. When an applicant selects a room in Step 2, the bed is marked `HELD` for 24 hours.
2. A Laravel cron worker runs hourly:
   ```bash
   php artisan rooms:release-expired-holds
   ```
3. If 24 hours elapse without payment proof, the system cancels the invoice and reverts room status to `AVAILABLE`.

---

## 5. Go-Live Day Checklist

Perform this sequential checklist on launch day before opening public registrations:

### Phase 1: Server & Security Validation (T-24 Hours)
- [ ] **Domain & SSL**: `asrama.ubt.ac.id` points to public IP with active A-Grade Let's Encrypt certificate.
- [ ] **Environment Configuration (`.env`)**:
  - `APP_ENV=production`
  - `APP_DEBUG=false`
  - `APP_URL=https://asrama.ubt.ac.id`
  - Strong randomized `DB_PASSWORD`.
- [ ] **SIMABA Database Password Isolation**:
  - The live SIMABA SQL database password (`12345678Ab&`) is entered privately on the server `.env`.
  - Confirmed **NEVER** committed to public GitHub repositories.
  - Repository template `.env.example` is empty (`DB_SIMABA_PASSWORD=`).
- [ ] **Private Storage Lockdown**: Public access to `storage/app/private_kyc` blocked in Nginx/Apache.

### Phase 2: Database Initialization & Asset Compilation (T-4 Hours)
- [ ] Execute clean migrations:
  ```bash
  php artisan migrate --force
  ```
- [ ] Execute data sanitization per Section 2 of this guide.
- [ ] Execute production seeder:
  ```bash
  php artisan db:seed --class=ProductionSeeder --force
  ```
- [ ] Compile production caches:
  ```bash
  php artisan config:cache
  php artisan route:cache
  php artisan view:cache
  composer install --optimize-autoloader --no-dev
  npm run build
  ```

### Phase 3: End-to-End Dry Run (T-2 Hours)
- [ ] Login using official cashier account `keuangan@ubt.ac.id`.
- [ ] Change cashier password immediately upon first login.
- [ ] Perform test login using real SIMABA credentials (e.g., `260108001` - GRACE MARLIN TELAUMBANUA).
- [ ] Verify reservation produces 3-digit unique code billing correctly.
- [ ] Cancel dry run test transaction prior to 08:00 AM public launch.

### Phase 4: Operational Monitoring (Launch Day)
- [ ] Verify Supervisor worker is active for WhatsApp OTP queue:
  ```bash
  supervisorctl status asrama-queue-worker:*
  ```
- [ ] Monitor real-time logs:
  ```bash
  tail -f /var/www/asrama-ubt/storage/logs/laravel.log
  ```
- [ ] Finance staff stationed on verification dashboard with Bank Mandiri (Kopra / Livin' by Mandiri) statement open.

---

## 6. Operational Emergency Contacts

| Role | Officer in Charge | Communication Channel | Contact |
| :--- | :--- | :--- | :--- |
| **Lead DevOps & IT** | UBT IT Systems Administrator | Internal Email / Telegram | it-support@ubt.ac.id |
| **Cashier & Finance** | Student Finance Administrator | Cashier Desk WhatsApp | +62 812-3456-7001 |
| **Dormitory Manager** | Head of Roemah 54 Housing | Roemah 54 Command Post | +62 812-3456-7002 |
| **Admissions Helpdesk** | UBT PMB Admissions Center | University Call Center | +62 812-3456-0000 |
