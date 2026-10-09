# Data Architecture & Business Logic Chart — UBT Dormitory Portal

> **Language / Pilihan Bahasa:** [🇮🇩 Bahasa Indonesia (Primary)](ARCHITECTURE.md) | 🇬🇧 **English Version**

This document details the database architecture and backend business logic flow required to operate the UBT Dormitory Web Portal in production, **aligned with the existing Dormitory Management Administration Database schema**.

Because this web portal interacts directly with the institution's operational records, the student registration portal executes *staging* (Read/Write) transactions that are subsequently verified and promoted into the master tables by Dormitory & Finance Administrators.

---

## 1. Database Schema Mapping (Housing Management ERD)

Based on the existing database, the following entities are used by the student admission application:

### A. Tables `staging_penyewa` & `penyewa` (Student/Tenant Profiles)
Applicant profile records are partitioned into two architectural layers to ensure data integrity:
- **`staging_penyewa` (Portal Staging Area)**: Used while prospective students progress through the 6-step online registration. This data is periodically synchronized with the university's academic system (SIAKAD).
- **`penyewa` (Master Records)**: Clean, validated tenant records. Promotion rules from staging:
  1. **New Students (Maba)**: Migration to master occurs ONLY once the registration billing invoice has achieved *PAID* status.
  2. **Existing Students (SSO)**: If an active student logs in with "Non-Resident" status, their data remains in staging until their housing invoice is confirmed as *PAID*, preventing uncommitted attempts from polluting master records.
- Key columns: `nim`, `nama`, `jenis_kelamin` (building gender filter), `no_hp` (WhatsApp OTP), and academic department relations.

### B. Tables `tipe_asrama`, `lantai`, and `kamar` (Dormitory Infrastructure)
Relational hierarchy representing buildings, floors, and rooms available during Room Plotting:
- **`tipe_asrama`**: Building type (e.g., Male Dormitory, Female Dormitory) with a `jenis_kelamin` attribute.
- **`lantai`**: Manages floor levels within each building.
- **`kamar`**: Individual room records containing `tipe_asrama_id`, `lantai_id`, room number (`nomor`), and maximum bed capacity (`kapasitas`).

### C. Tables `transaksi` & `request_transaksi` (Booking & Plotting System)
Concurrency and quota locks are computed dynamically based on active bookings per room:
- **`request_transaksi`**: Temporary quota lock created when a student selects a room (Step 4), expiring after a designated reservation window (e.g., 24 hours).
- **`transaksi`**: Permanent confirmation record created once payment is verified, binding `penyewa_id` to `kamar_id` along with occupancy start dates and contract statuses.
- *Concurrency Logic*: Available Beds = `kamar.kapasitas` - (Count of active `transaksi` + pending `request_transaksi`).

### D. Financial Tables (`tagih`, `request_pembayaran`, `pembayaran`, `deposit`)
Handles invoice generation and payment settlement (Steps 2 & 3):
- **`tagih` / `harga`**: Standard fee references (monthly room rent, initial bedding supplies, administrative charges).
- **`request_pembayaran`**: Staging invoices generated with unique 3-digit verification codes prior to funds transfer.
- **`pembayaran`**: Permanent ledger entry created when a bank webhook or manual admin review approves the transaction (`status_bayar = 1`).
- **`deposit` & `deposit_pembayaran`**: Handles security deposit accounting, separating lump-sum payments from multi-month installment schedules.

---

## 2. System Logic Chart (Web Portal Staging Flows)

### Flow 1: Authentication & e-KYC (SIAKAD Synchronization)
1. **Frontend:** Student logs in using PMB Registration Number or official NIM.
2. **Backend (SSO/SIAKAD):** Validates credentials and synchronizes the latest student biodata.
3. **Backend Asrama:** Performs an `UPSERT` into `staging_penyewa`.
4. **Continuous Sync:** As students advance through admission steps, missing academic fields are progressively filled via background sync.

### Flow 2: Room Plotting Concurrency (`request_transaksi`)
1. **Frontend:** Student requests available room listings (Step 4).
2. **Backend:** Filters rooms where building gender matches the student profile. Computes: `kapasitas` - active reservations.
3. **Frontend:** Student selects an available room (e.g., Room 101).
4. **Backend:** Inserts a temporary reservation into `request_transaksi` with an expiration countdown, decrementing visible capacity for other users.
5. **Cron Scheduler:** Releases and purges expired reservations if payment is not initiated within the tolerance window.

### Flow 3: Invoice Issuance & Bank Webhooks (`request_pembayaran`)
1. **Backend:** Generates an invoice containing base rent, security deposit, base administrative fee (Rp 100,000), and a random 3-digit code.
2. **Frontend:** Renders the exact payable amount and bank account details (Step 3).
3. **Bank Webhook:** When bank reconciliation confirms incoming funds matching the exact total, the bank pings the backend.
4. **Backend:** Transitions invoice to `PAID`, records a permanent `pembayaran`, and converts `request_transaksi` into a permanent tenancy `transaksi`.

### Flow 4: Digital Contract & e-Ticket Generation
1. **Backend:** Generates a 6-digit random OTP and dispatches it via WhatsApp to the student (and parent/guardian).
2. **Frontend:** Student submits the OTP.
3. **Backend:** Validates OTP, records the SHA-256 audit timestamp, and seals the agreement under JUKLAK-02.
4. **Frontend:** Issues an official digital e-Ticket with encrypted QR code parameters for gate check-in.

### Flow 5: Legal Compliance & Hybrid Collective Agreement (JUKLAK-03)
Under Dormitory Regulation Article 39, UU ITE Article 11, and the Indonesian Stamp Duty Law (UU Bea Meterai No. 10/2020), this system employs a **"Hybrid Master Collective Agreement & WhatsApp Gateway"** model:
1. **Electronic Consent**: Students verify their acceptance individually via WhatsApp OTP, authorizing inclusion into the collective dormitory agreement roster.
2. **Physical Master Ratification**: Dormitory management compiles signatories into an official batch PDF (F-22 Collective Ratification Sheet, up to 40 students per sheet). A single physical Rp 10,000 duty stamp is affixed and signed by the Dormitory Director.
3. **Digital Distribution**: The executed master sheet is scanned and made available on student dashboards as legally binding proof of residency.
4. **Cost & Legal Efficiency**: Saves millions of rupiah in third-party e-signature subscriptions while maintaining full legal standing under Indonesian law.
