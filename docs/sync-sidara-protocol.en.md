# SIDARA Synchronization & Booking Migration Protocol

> **Language / Pilihan Bahasa:** [🇮🇩 Bahasa Indonesia (Primary)](sync-sidara-protocol.md) | 🇬🇧 **English Version**

---

## 1. System Architecture Boundaries
* **SIDARA**: The university's central academic information system. This acts as the external **Source of Truth** for the official student database and valid student identification numbers (NIM).
* **Asrama Operational Database**: The dormitory internal operational database. This system manages tenants (`penyewa`), billing, and room allocations.

---

## 2. State Machine Transition: BOOKING -> TENANT

The dormitory admission process utilizes a state machine to handle students who register on the dormitory platform before their official Student Identification Number (NIM) is issued by SIDARA:

### State: `BOOKING`
* **Condition**: A student registers using a temporary registration number (e.g., `PMB2026-xxx`) and completes the initial invoice payment.
* **Trigger**: Finance Admin approves the payment via the "Approve Booking (Without NIM)" action.
* **System State**: 
  * Invoice `status` = `PAID`.
  * Invoice `isMigrated` = `false`.
  * Student Dashboard is placed in Step 4 holding status, displaying a waiting message for official academic data synchronization.

### State: `PENYEWA` (Migrated Tenant)
* **Condition**: The official NIM is issued by SIDARA and mapped to the student profile.
* **Trigger**: Finance Admin executes the "Sync NIM & Migrate" action, providing the valid university NIM.
* **System State**:
  * Invoice `isMigrated` = `true`.
  * Student Dashboard unlocks Step 5 (Digital Contract Execution).
  * Staging data is promoted to master tables.

---

## 3. Database Migration Procedure

Upon executing the "Sync NIM & Migrate" action, the backend executes the following atomic database transaction:

1. **Staging Update**: Replaces the temporary registration number with the official SIDARA NIM in the temporary staging profile (`maba_profiles`).
2. **Master `penyewa` Insertion**: Creates an official tenant record in the `penyewa` master table using the official NIM.
3. **Master `pembayaran` Insertion**: Records the approved deposit and rent payment into the permanent ledger.
4. **SSO `users` Creation**: Provisions an official Single Sign-On (SSO) account bound to the official NIM.
5. **Finalize Invoice**: Updates the original invoice to set `isMigrated = true`.

---

## 4. Required Audit Log Entries

To maintain strict accountability, every execution of the manual NIM sync generates an immutable audit log entry in the `modification_logs` table capturing:
* **`action`**: `SIDARA_MANUAL_NIM_SYNC`
* **`timestamp`**: ISO 8601 UTC timestamp.
* **`actor`**: Name/ID of the administrator who performed the sync.
* **`invoice_id`**: Billing invoice identifier.
* **`old_identifier`**: Temporary registration number (`PMB2026-08942`).
* **`new_nim`**: Official university NIM.
