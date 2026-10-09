# Identity Transition & Communication Protocol
## From PMB Registration to Official SSO/NIM (Booking -> Tenant)

> **Language / Pilihan Bahasa:** [🇮🇩 Bahasa Indonesia (Primary)](identity-transition-protocol.md) | 🇬🇧 **English Version**

---

## 1. Overview & Purpose
This document outlines the standard operating procedure and communication protocol for transitioning a new student (Maba) from their temporary registration identity (No. Reg PMB) to their official university identity (NIM & SSO). 

This transition is structurally critical because **all legal dormitory contracts (Step 5) MUST be signed using a valid NIM**, not a temporary registration number.

---

## 2. Transition Timeline & Trigger Points

| Phase | System State | Authentication Method | Action/Trigger |
| :--- | :--- | :--- | :--- |
| **Phase 1: Onboarding** | `STAGING` (Step 1 to Step 3) | Temporary (`PMB-XXX`) | Student completes KYC and pays initial deposit. |
| **Phase 2: Holding Room** | `BOOKING` (Step 4) | Temporary (`PMB-XXX`) | Finance Admin approves payment. System awaits academic NIM from SIDARA. |
| **Phase 3: The Migration** | `SYNC_IN_PROGRESS` | **Transition Occurs** | Admin clicks "Sync NIM & Migrate". Backend maps NIM and provisions SSO email. |
| **Phase 4: Official Tenant** | `PENYEWA` (Step 5+) | **University SSO (NIM)** | Student logs in via SSO, executes digital contract, becomes active resident. |

---

## 3. Communication Strategy (3-Layered Approach)

To prevent user confusion when their temporary `PMB-XXX` credentials suddenly stop working, the system employs a 3-layered communication strategy:

### Layer A: Expectation Setting (In-App UI - Step 4)
While the student is waiting in Step 4, the UI explicitly communicates the impending identity transition:
* **Message:** *"Pembayaran deposit Anda telah diverifikasi. Kami sedang menunggu Nomor Induk Mahasiswa (NIM) resmi Anda diterbitkan oleh Universitas."*
* **Disclaimer:** *"Penting: Setelah NIM diterbitkan, sesi login pendaftaran ini akan diakhiri. Anda akan diminta untuk Login Ulang menggunakan SSO Universitas (NIM) untuk menandatangani kontrak."*

### Layer B: Active Notification (Email / WhatsApp)
* **Trigger:** Executed synchronously when the Finance Admin clicks "Sync NIM & Migrate".
* **Action:** The backend invalidates the PMB login credentials and dispatches an automated notification message to the student's personal contact.
* **Notification Content:** Informs the student that their official NIM has been assigned and prompts them to log in via the SSO portal to access and sign their digital contract.

### Layer C: Graceful Interception (Live Session Handling)
If a student happens to be actively logged into the Asrama dashboard using their PMB credentials at the exact moment the Admin executes the sync:
1. The frontend detects `isMigrated = true`.
2. The UI renders a blocking modal overlay.
3. **Modal Content:** *"Selamat! NIM resmi Anda telah diterbitkan. Demi keamanan dan legalitas penandatanganan kontrak, silakan masuk kembali menggunakan akun SSO Universitas Anda."*
4. **Action:** A single button labeled **"Logout & Pergi ke Halaman SSO"** clears the temporary session and redirects the student to the university SSO login gateway.

---

## 4. Why SSO is Mandatory Before Step 5
1. **Legal Non-Repudiation:** A housing contract is a legally binding financial instrument under Indonesian law. The PMB number is provisional; the NIM is the definitive university legal identifier.
2. **Security & Ownership:** Forcing SSO login proves the student has claimed their official university credentials, adding a critical layer of authentication before executing the binding housing agreement.
