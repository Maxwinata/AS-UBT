# Practical Guide: Testing Program Logic with Real Data in Laragon (MySQL + Laravel 11 + Inertia.js)

> **Language Options:** [🇮🇩 Versi Bahasa Indonesia (Utama)](TESTING_DATA_REAL_LARAGON.md) | 🇬🇧 **English Version**

This guide is specifically designed for developers, system QA testers, and dormitory managers of Universitas Bunda Thamrin (UBT) to **transition from the prototype web simulation (client-side state) to testing program logic against a live MySQL database and Laravel backend in a local Laragon environment**.

The primary focus of this testing protocol is to **verify the complete student admission flow (Steps 1 to 6)** and the **architectural separation between temporary intake tables (*staging*) and the official financial general ledger (*running master tables*)**.

---

## 📌 Repository Documentation Map

Before executing the tests, refer to the following companion documents in the repository:

| Document | Location | Testing Relevance |
| :--- | :--- | :--- |
| **1-Click Laragon Setup** | [`LARAGON_SETUP.en.md`](../LARAGON_SETUP.en.md) | Quick installation guide for PHP 8.2+, MySQL, and `laragon-setup.bat`. |
| **Staging & Master Architecture** | [`docs/ARCHITECTURE.en.md`](ARCHITECTURE.en.md) | Explains `operator_id = 0` (autonomous) vs `operator_id = 1` (admin) separation. |
| **5-Scenario Testing Matrix** | [`docs/scenario-mappings.en.md`](scenario-mappings.en.md) | Test profiles for regular students, KIP scholarship, deposit installments, and NIM transition. |
| **e-KYC Storage Security** | [`docs/SECURE_UPLOAD_STRATEGY.en.md`](SECURE_UPLOAD_STRATEGY.en.md) | Verification guide for private disk storage and signed URLs (15-min TTL) for ID and selfie photos. |
| **System Specifications (PRD/SAS)**| [`ASRAMA_UBT_SYSTEM_DOCUMENTATION.en.md`](../ASRAMA_UBT_SYSTEM_DOCUMENTATION.en.md) | Comprehensive business rules for JUKLAK-02, JUKLAK-03, and F-22 collective ratification. |

---

## 🛠️ Step 1: Prepare Laragon Environment & Real Database

### 1.1. Start Laragon Services
1. Open the **Laragon** application on Windows.
2. Click **Start All** to launch:
   - **Apache / Nginx** (Port 80/443)
   - **MySQL** (Port 3306)

### 1.2. Initialize Database & Seed Master Data (1-Click)
Navigate to the project folder at `C:\laragon\www\asrama-ubt`:
1. Double click **`laragon-setup.bat`** (or open Laragon Terminal and run `./laragon-setup.sh`).
2. The script automatically executes:
   - Copies `.env.example` to `.env`.
   - Configures default MySQL credentials:
     ```env
     DB_CONNECTION=mysql
     DB_HOST=127.0.0.1
     DB_PORT=3306
     DB_DATABASE=asrama_ubt_db
     DB_USERNAME=root
     DB_PASSWORD=
     ```
   - Executes `composer install` and `php artisan key:generate`.
   - Executes `php artisan migrate --seed` to create all 15 system tables and insert baseline master records:
     - **Tariff Master**: Monthly Rent Rp 500,000, Administration Rp 100,000, Deposit Rp 500,000.
     - **Room Master**: Floor 1, 2, 3 inventory for male and female wings.
     - **Payment Schemes**: Full prepayment, monthly terms, and split deposit installments.

### 1.3. Run Dual Development Servers
Open two terminal windows:
```bash
# Terminal 1: Laravel Backend + API
php artisan serve

# Terminal 2: Frontend Inertia.js + React (Hot Module Replacement)
npm run dev
```
Open your browser at `http://127.0.0.1:8000` or `http://asrama-ubt.test`.

---

## 🧪 Step 2: Test Student Intake Flow (Real Data Input)

In this step, test self-service data entry by a new student candidate:

1. **Open Landing Page**:
   - Access `http://127.0.0.1:8000/login`.
   - Select **Tab 1: New Student Login**. Enter a registration number, e.g., `REG2026-001` or `PMB2026-08942`.
2. **Step 1 (e-KYC & Personal Details)**:
   - Complete personal biodata (national ID NIK, emergency contact, multi-tier address).
   - Upload test ID photo (KTP) and selfie photo.
   - *Logic Verification*: Files are stored inside `storage/app/private_kyc` and cannot be browsed publicly without signed URLs.
3. **Step 2 (Room Selection & Bed Plotting)**:
   - Select gender wing and preferred room type.
   - Verify real bed availability queried from the `kamar` table.
4. **Step 3 (Billing & Proof of Payment)**:
   - Select lease duration (e.g., 6 months + full upfront payment).
   - System calculates fees and attaches a **3-digit unique verification code** (e.g., Rp 3,600,042).
   - Upload bank transfer proof or confirm via simulated Mandiri Virtual Account.
   - Click **Submit Payment Confirmation**.

---

## 🔍 Step 3: Verify Staging Database in phpMyAdmin / HeidiSQL

After the student submits Step 3, open phpMyAdmin (`http://localhost/phpmyadmin`) or HeidiSQL and select `asrama_ubt_db`.

Run the following SQL audit query:

```sql
-- 1. Verify that data entered the STAGING TABLE (Not Master)
SELECT 
    id, 
    no_request, 
    penyewa_id, 
    total_bayar, 
    status_pembayaran, 
    status_verifikasi, 
    operator_id 
FROM request_pembayaran 
ORDER BY id DESC LIMIT 1;
```

### ✅ Expected Staging State:
- `no_request` follows the format `REQ-YYYYMM-XXXX`.
- **`operator_id` equals `0`**: Proves that the entry was autonomously registered by the candidate and **is not yet part of the official general ledger**.
- `status_verifikasi` equals `0` (Awaiting admin review).
- Verify the master table `pembayaran`:
  ```sql
  -- The master table MUST NOT contain this transaction yet
  SELECT * FROM pembayaran WHERE no_request = (SELECT no_request FROM request_pembayaran ORDER BY id DESC LIMIT 1);
  -- Result: 0 rows (Strict accounting compliance)
  ```

---

## ⚖️ Step 4: Test Finance Admin Verification & Master Promotion

1. Open a new private/incognito browser window.
2. Log into the Finance Admin Dashboard at `http://127.0.0.1:8000/admin/dashboard`.
3. Under the **Staged Payment Requests** tab, find the pending registration request.
4. Verify the transfer proof slip and exact 3-digit unique code match.
5. Click **"Sahkan & Promosi ke Master" (Approve & Promote to Master)**.
6. The system executes `promoteToMaster()` in `AdminAsramaController.php`:
   - Issues an official billing invoice number (`INV-YYYYMM-XXXX`).
   - Copies fee line items to `pembayaran_detail`.
   - Records revenue cash inflow into the `transaksi` table.
   - Updates student status to active tenant and locks the room to `OCCUPIED`.
   - Assigns `operator_id` to the logged-in administrator ID (e.g., `1`).

---

## 📊 Step 5: Final Database Verification on Master Ledger

Run this audit query in MySQL to confirm the transition:

```sql
-- 1. Proof of entry into OFFICIAL GENERAL LEDGER
SELECT 
    id, 
    no_invoice, 
    no_request, 
    total_bayar, 
    operator_id, 
    created_at 
FROM pembayaran 
ORDER BY id DESC LIMIT 1;

-- 2. Proof of dormitory cash account ledger record
SELECT 
    id, 
    no_transaksi, 
    kode_transaksi, 
    jumlah_bayar, 
    operator_id 
FROM transaksi 
ORDER BY id DESC LIMIT 1;

-- 3. Proof of physical room occupancy lock
SELECT 
    kode_kamar, 
    status, 
    nama_penghuni 
FROM kamar 
WHERE id = (SELECT kamar_id FROM request_pembayaran ORDER BY id DESC LIMIT 1);
```

### 🎯 Success Criteria:
1. `operator_id` in `pembayaran` and `transaksi` is $\ge 1$ (Finance Officer ID).
2. Official invoice number `INV-...` references the original request `REQ-...`.
3. Room status changes from `AVAILABLE` to `OCCUPIED`.
4. When the student candidate refreshes their portal, the view automatically unlocks **Step 4 (Digital Contract F-19 & F-02 via WhatsApp OTP)**.
