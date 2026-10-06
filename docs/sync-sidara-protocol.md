# SIDARA Synchronization & Booking Migration Protocol

## 1. System Architecture Boundaries
* **SIDARA**: The university's central academic information system. This acts as the external **Source of Truth** for the official student database and valid NIMs.
* **Asrama SQL Database**: The dormitory's internal, localized operational database (accessed via the Web Admin at `http://asrama.ubtsu.ac.id`). This system manages `penyewa` (tenants), billing, and room allocations.

## 2. State Machine Transition: BOOKING -> PENYEWA

The dormitory admission process utilizes a state machine to handle students who register on the Asrama platform before their official Student Identification Number (NIM) is issued by SIDARA.

### State: `BOOKING`
* **Condition**: A student registers using a temporary registration number (e.g., `PMB2026-xxx` or `REG-xxx`) and completes the deposit payment.
* **Trigger**: Finance Admin approves the payment via the "Approve Booking (Tanpa NIM)" action.
* **System State**: 
  * Invoice `status` = `PAID`.
  * Invoice `isMigrated` = `false`.
  * Student Dashboard is locked at Step 4, displaying a generic "Menunggu Sinkronisasi Data Akademik" message.

### State: `PENYEWA` (Migrated)
* **Condition**: The official NIM is issued by SIDARA and mapped to the student's profile.
* **Trigger**: Finance Admin executes the "Sync NIM & Migrate" action, providing the valid NIM.
* **System State**:
  * Invoice `isMigrated` = `true`.
  * Student Dashboard unlocks Step 5 (Digital Contract Execution).
  * Staging data is fully migrated to master tables.

## 3. Database Migration Procedure

Upon a successful "Sync NIM & Migrate" action (where the Admin inputs the valid NIM sourced from SIDARA), the backend must execute the following operations within a single atomic database transaction on the **Asrama SQL database** (`http://asrama.ubtsu.ac.id`):

1. **Staging Update**: Replace the temporary registration number with the official SIDARA NIM in the temporary staging profile.
2. **Master `penyewa` Insertion**: Create a formal tenant record in the Asrama's `penyewa` master table using the official NIM as the primary key. Map the allocated room, faculty, and biodata.
3. **Master `pembayaran` Insertion**: Record the approved deposit payment in the Asrama's `pembayaran` ledger, linked to the new NIM.
4. **SSO `users` Creation**: Provision a Single Sign-On (SSO) account in the Asrama's `users` table bound to the official NIM.
5. **Finalize Invoice**: Update the original staging invoice record to set `isMigrated = true`.

## 4. Required Audit Log Entries

To maintain strict accountability and historical tracking, every execution of the manual NIM sync MUST generate an immutable audit log entry in the `audit_logs` table.

The audit log entry must capture the following payload:

* **`action`**: `SIDARA_MANUAL_NIM_SYNC`
* **`timestamp`**: ISO 8601 UTC timestamp of the execution.
* **`admin_user_id`**: The UUID or username of the Finance Admin who performed the action.
* **`invoice_id`**: The ID of the billing invoice tied to the booking.
* **`old_identifier`**: The temporary registration number (e.g., `PMB2026-08942`).
* **`new_nim`**: The official SIDARA NIM mapped to the student.
* **`ip_address`**: The IP address of the admin initiating the request.
* **`status`**: `SUCCESS` (or `FAILED` if the transaction rolled back).

*Note: This log is critical for resolving disputes if a payment is linked to the wrong student NIM during the manual input process.*

## 5. UI & Security Considerations
* The term "SIDARA" is for internal administrative use only. Client-side UI for students must abstract this as "Sistem Akademik Universitas" to prevent end-user confusion.
* The UI must block input of temporary prefixes (`PMB`, `REG`) during the manual sync prompt to prevent recursive booking states.
