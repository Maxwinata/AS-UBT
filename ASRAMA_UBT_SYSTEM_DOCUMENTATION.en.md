# Product & Technical Requirements Document (PRD & SAS)
**Bunda Thamrin University Dormitory Portal Information System (UBT)**

> **Language / Pilihan Bahasa:** [🇮🇩 Bahasa Indonesia (Primary)](ASRAMA_UBT_SYSTEM_DOCUMENTATION.md) | 🇬🇧 **English Version**

---

## 1. Product Vision & Objectives
**Vision:**
To provide a unified digital platform that facilitates the admission, payment, room allocation, and operational management processes of UBT Dormitory in an efficient, transparent, and automated manner.

**Objectives:**
- Eliminate physical queuing and manual paperwork in dormitory administration.
- Provide an intuitive 6-step admission flow for prospective students (Maba).
- Enforce strict separation of duties between the Finance Department (payment verification) and Dormitory Management (room plotting).
- Digitize legally binding housing agreements and codes of conduct using WhatsApp OTP verification.
- Facilitate checkout inspections and security deposit refunds for existing tenants.

---

## 2. Target User Personas
1. **Prospective / New Students (Maba)**
   - Needs: Register for dormitory, review invoice breakdowns, submit payments, select allocated rooms, and receive digital check-in e-Tickets.
2. **Existing Senior Tenants (Penghuni Lama)**
   - Needs: Monitor residency status, request tenancy renewals, file checkout applications, and track deposit refund processing.
3. **Finance Administrators**
   - Needs: Verify manual bank transfer slips quickly, review unique 3-digit verification codes, and transition billing statuses to *PAID*.
4. **Dormitory Administrators**
   - Needs: Monitor real-time room capacity, plot room allocations, approve checkouts, generate collective agreement ratification sheets, and access system developer tools.

---

## 3. System Architecture & Tech Stack
### A. Technology
- **Frontend (UI/UX):** React 19 + Tailwind CSS v4 (rendered as a Single Page Application via Inertia.js adapter).
- **Backend:** Laravel 11 (PHP 8.2+).
- **Monolith Bridge:** Inertia.js 2.0 (`@inertiajs/react` and `inertiajs/inertia-laravel`).
- **Database:** MySQL / MariaDB (managed via Eloquent ORM & calibrated migrations).
- **Icons & Typography:** Lucide Icons, Plus Jakarta Sans / Inter.

### B. Communication & Security
- **Protocol:** Frontend and Backend communicate seamlessly via the **Inertia Protocol** (Props Injection on `Inertia::render` and reactive form actions via `router.post`). Eliminates manual REST boilerplate and token handling for application views.
- **Pure REST API & Webhooks:** Pure REST is strictly reserved for third-party background integrations:
  - `POST /api/webhooks/bsi-mutation` (Manual bank transfer reconciliation)
  - `POST /api/webhooks/bni-va-callback` (Automated Virtual Account callback)
  - `GET /api/health` (Application health check)
- **Authentication & Sessions:** Laravel Session-based Auth & Role-Based Middleware (`EnsureUserRole`, `HandleInertiaRequests`).
- **e-KYC Document Security:** Complies with `AGENTS.md` guidelines: all National ID (KTP) and biometric selfie files are stored in an isolated private disk (`storage/app/private_kyc`), enforce immutable versioning naming (`ktp_{nim}_v{timestamp}_{uuid}`), and are gated by **Temporary Signed URLs** (15-minute TTL).

---

## 4. Authentication Flow (Dual Tab Login)
The login interface features a *Dual-Tab* design (`resources/js/Pages/Auth/Login.tsx` / `LoginDualTab.tsx`):

### A. New Student (Maba) Login Tab
- **Target:** Newly admitted students without full institutional SSO accounts.
- **Credentials:** PMB Registration Number & Date of Birth.
- **Behavior:** On validation, directs directly to the **Admission Dashboard (`GET /maba/dashboard`)**.

### B. Institutional SSO Login Tab (Existing Students)
- **Target:** Students with active university academic accounts (SIAKAD).
- **Credentials:** Username / NIM & SIAKAD Password.
- **Multi-Step Evaluation:**
  1. **SSO Auth:** Validates credentials against university academic gateway.
  2. **DB Query:** Verifies active tenant records in `penyewa` / `users`.
  3. **Status Routing:**
     - *Active Resident:* Redirects to Senior Resident Dashboard (`GET /eksisting/dashboard`).
     - *Non-Active Resident:* Prompts a **Redirect Modal** guiding them to the 6-step registration flow (`GET /maba/dashboard`).

---

## 5. Core Features & Scope (Inertia Controller Actions)

All business logic is handled by standard Laravel controllers mapped in `routes/web.php`:

### A. Admission & e-KYC Module (Step 1)
- **Render View:** `GET /maba/dashboard` (`MabaDashboardController@index`) injects props: `profile`, `invoice`, `rooms`, `tariffs`.
- **Update Profile:** `POST /maba/profile` (`MabaDashboardController@updateProfile`) validates biodata, tiered Indonesian address hierarchies, and emergency contacts.
- **Upload e-KYC:** `POST /maba/kyc` (`KycVerificationController@store`) stores KTP & selfie into `private_kyc` storage with version tracking.
- **Access Document:** `GET /kyc/signed-url/{type}` (`KycVerificationController@getSignedUrl`) generates short-lived signed URLs.
- **Secure Stream:** `GET /kyc/view/{id}/{type}` (`KycVerificationController@showPrivateDocument`) verified by `signed` middleware.

### B. Billing & Payment Module (Steps 2 & 3)
- **Configure Invoice:** `POST /maba/invoice/configure` (`InvoiceController@configure`) calculates stay duration, deposit installment options, base administrative fees (Rp 100,000), and 3-digit verification codes.
- **Upload Payment Proof:** `POST /maba/invoice/{id}/upload-proof` (`InvoiceController@uploadTransferProof`) uploads bank transfer receipts.
- **Admin Verification:** `POST /admin/invoice/{id}/verify` (`AdminAsramaController@verifyInvoice`) approves invoices, confirms room bookings, or rejects invalid submissions.

### C. Room Plotting Module (Step 4)
- **Allocation & Selection:** Managed within `MabaDashboardController@index` and `AdminAsramaController@index` with real-time bed capacity calculations (`rooms.capacity` vs active reservations).

### D. Digital Contract & WhatsApp OTP Module (Step 5)
- **Contract Execution:** `POST /maba/contract/sign` (`MabaDashboardController@signContract`) validates 6-digit WhatsApp OTPs sent to student and parent/guardian phones, logging SHA-256 audit hashes (JUKLAK-02).
- **F-22 Collective Ratification:** Incorporates signatories into batch sheets for a single physical stamp duty endorsement (JUKLAK-03).

### E. SOP Delinquency & 5+5 Grace Period Enforcement
- **Monitor View:** `GET /sop/cron-monitor` (`CronSopController@index`).
- **Enforcement Execution:** `POST /sop/cron/run-enforcement` (`CronSopController@runDailyEnforcement`) automatically handles security deposit deductions for rent (D+6 to D+10) and acute breach penalties (Rp 500,000 fine / contract termination for > D+10).
- **Admin Enforcement Actions:** `POST /admin/delinquency/{id}/action` (`AdminAsramaController@handleDelinquencyAction`).

---

## 6. Database Field Mapping & Bridging Strategy (SQL Web Admin: `u540633926_asrama`)

The system implements a robust 2-tier database architecture: **Autonomous Freshman Staging Tables (`request_*`)** and **Official Running Master Tables (`pembayaran`, `transaksi`, `penyewa`)**.

### A. Autonomous Staging Tables (Student Frontend - `operator_id = 0`)
1. **`penyewa` (Draft Initial Applicant)**
   - Columns: `nim`, `namalengkap`, `noktp`, `nohp`, `email`, `alamat`, `jenis_kelamin`, `nama_bill_to`
   - Initial State: `status = 0`, `status_asrama = 0`, `operator_id = 0` (Autonomously registered by student)
2. **`request_pembayaran` (Autonomous Invoice Header)**
   - Columns: `no_request` (UK, e.g. `REQ-202610-0142`), `penyewa_id`, `kamar_id`, `durasi`, `tanggal_masuk`, `tanggal_keluar`
   - Financials: `total_tagihan`, `total_potongan_harga`, `total_bayar`
   - Lifecycle: `status_pembayaran = 'pending'`, `status_verifikasi = 0`, `operator_id = 0`
3. **`request_pembayaran_detail` (Itemized Tariff Breakdown)**
   - Columns: `no_request` (FK Index), `harga_id`, `jenissewa`, `harga`, `qty`, `jumlah_pembayaran`, `potongan_harga`
   - Transparently itemizes rent, security deposit, and administrative initial amenity fees.
4. **`request_transaksi` (Self-Reported Mutation & Transfer Slip)**
   - Columns: `no_request` (FK Index), `no_transaksi` (Provisional), `tanggal_transaksi`, `jumlah_uang`, `metode_pembayaran`, `file_bukti`, `operator_id = 0`

### B. Official Running Master Tables (Laravel Web Admin - `operator_id = Admin ID`)
1. **`penyewa` (Active Resident Master)**
   - Promoted State: `status = 1`, `status_asrama = 1`, `operator_id = Admin ID`
2. **`pembayaran` (Official Invoice Ledger)**
   - Columns: `no_invoice` (Generated: `INV-202610-xxxx`), `penyewa_id`, `kamar_id`, `durasi`, `total_tagihan`, `total_bayar`, `status_pembayaran = 'paid'`, `operator_id = Admin ID`
3. **`pembayaran_detail` (Official Line Items Master)**
   - Columns: `no_invoice` (FK Index), `harga_id`, `jenissewa`, `harga`, `qty`, `jumlah_pembayaran`, `status = 1`
4. **`transaksi` (Official Cash & Payment Mutation Ledger)**
   - Columns: `no_invoice` (FK Index), `penyewa_id`, `no_transaksi` (Official), `tanggal_transaksi`, `jumlah_uang`, `metode_pembayaran`, `file_bukti`, `jenis_transaksi = 'Asrama'`, `operator_id = Admin ID`

---

## 7. Auto-Resume & State Restoration
The system includes an intelligent state calculation mechanism (`getInitialStep`) that automatically restores students to their exact step upon reconnection:
- **Active e-Ticket:** Navigates directly to **Step 6 (Check-In)**.
- **Allocated Room / Contract:** Navigates to **Step 5 (Digital Contract)**.
- **Unpaid Invoice / Pending Verification:** Restores to **Step 3 (Payment)** while retaining the option to modify billing preferences in Step 2.
- **Draft Persistence:** Unsubmitted biodata is cached in browser storage, preventing data loss on accidental page refreshes.

---

## 8. Regulatory Compliance (JUKLAK-02 & JUKLAK-03)
- **Hybrid Collective Agreement:** Avoids expensive individual e-signature subscriptions. Students consent electronically via WhatsApp OTP, and their identities are batched into the F-22 Collective Ratification Sheet, validated with a single physical Rp 10,000 duty stamp by the Dormitory Director.
- **Audit Trail Immutability:** SHA-256 hashes, timestamps, and IP addresses are recorded to guarantee document authenticity under Article 11 of the Indonesian Electronic Information and Transactions Law (UU ITE).

---

## 9. SIAKAD API Database Integration (`api_link` & `siakad_mahasiswa_stg`)

The dormitory platform connects to UBT's official SIAKAD academic database across two endpoints:
1. **Endpoint 1 (Special Scholarship / Non-KIP)**:
   - URL: `https://siakad.ubtsu.ac.id/api/mahasiswa-btt-006`
   - Category: `nonkip`, Name: `Beasiswa Khusus`
2. **Endpoint 2 (KIP-Kuliah)**:
   - URL: `https://siakad.ubtsu.ac.id/api/mahasiswa-btt-002`
   - Category: `kip`, Name: `KIP`

### Architecture & Workflows:
- **Pre-Registration Staging Table**: Ingested payloads are saved to `siakad_mahasiswa_stg` linked with `api_link`. Raw API data never pollutes active ledger tables (`penyewa`) until students formally initiate onboarding.
- **Login-Time Auto-Fill**: Entering the PMB Registration Number (e.g., `PMB2026-08942` or `PMB-BTT-002-001`) automatically looks up the student's academic record and populates: Name, NIK, Phone, Study Program, Faculty, and Scholarship Track.
- **Subsidy Qualification & Audit Governance**: While scholarship flags are recognized instantly on student profiles, fee waivers and subsidized deposits require manual ratification (1-click) by the Financial Admin in the `SiakadSyncManager` panel to ensure complete audit compliance for university accounts.

---

## 10. Real Data Testing Guide in Laragon (MySQL + Laravel + Inertia)

> 🧪 **Real Data Testing Protocol**:  
> For complete instructions on testing real database transactions, intake staging records, and their automatic promotion to master accounting ledgers in Laragon MySQL, refer to:  
> 👉 [**Real Data Testing Guide (`docs/TESTING_DATA_REAL_LARAGON.en.md`)**](docs/TESTING_DATA_REAL_LARAGON.en.md) (or Indonesian: [`docs/TESTING_DATA_REAL_LARAGON.md`](docs/TESTING_DATA_REAL_LARAGON.md)).

