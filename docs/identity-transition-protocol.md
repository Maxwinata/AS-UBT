# Identity Transition & Communication Protocol
## From PMB Registration to Official SSO/NIM (Booking -> Penyewa)

## 1. Overview & Purpose
This document outlines the standard operating procedure and communication protocol for transitioning a new student (Maba) from their temporary registration identity (No. Reg PMB) to their official university identity (NIM & SSO). 

This transition is structurally critical because **all legal dormitory contracts (Step 5) MUST be signed using a valid NIM**, not a temporary registration number.

## 2. Transition Timeline & Trigger Points

| Phase | System State | Authentication Method | Action/Trigger |
| :--- | :--- | :--- | :--- |
| **Phase 1: Onboarding** | `STAGING` (Step 1 to Step 3) | Temporary (`PMB-XXX`) | Student completes KYC and pays deposit. |
| **Phase 2: Holding Room** | `BOOKING` (Step 4) | Temporary (`PMB-XXX`) | Finance Admin approves payment. Wait for SIDARA. |
| **Phase 3: The Migration** | `SYNC_IN_PROGRESS` | **Transition Occurs** | Admin clicks "Sync NIM & Migrate". Backend maps NIM and provisions SSO email. |
| **Phase 4: Official Tenant** | `PENYEWA` (Step 5+) | **University SSO (NIM)** | Student logs in via SSO, signs contract, becomes active tenant. |

## 3. Communication Strategy (3-Layered Approach)

To prevent user confusion when their temporary `PMB-XXX` credentials suddenly stop working, the system employs a 3-layered communication strategy.

### Layer A: Expectation Setting (In-App UI - Step 4)
While the student is waiting in Step 4, the UI must explicitly state the impending identity transition.
* **Message:** "Pembayaran deposit Anda telah diverifikasi. Kami sedang menunggu Nomor Induk Mahasiswa (NIM) resmi Anda diterbitkan oleh Universitas."
* **Disclaimer Add-on:** *"Penting: Setelah NIM diterbitkan, sesi login pendaftaran ini akan diakhiri. Anda akan diminta untuk Login Ulang menggunakan SSO Universitas (NIM) untuk menandatangani kontrak."*

### Layer B: Active Notification (Email / WhatsApp)
**Trigger:** Executed synchronously when the Finance Admin clicks "Sync NIM & Migrate".
**Action:** The backend invalidates the PMB login credentials and dispatches an automated message to the student's personal email (collected during KYC).

**Notification Template:**
> **Subject:** [Asrama UBTSU] NIM Anda Telah Terbit! Akses Kontrak Asrama
> 
> Halo [Nama Mahasiswa],
> 
> Nomor Induk Mahasiswa (NIM) resmi Anda **[NIM_BARU]** telah terbit dan berhasil disinkronisasi dengan Sistem Asrama UBTSU.
> 
> Mulai saat ini, akses login menggunakan Nomor Pendaftaran (PMB) telah **dinonaktifkan**. 
> 
> Silakan login kembali ke portal Asrama (http://asrama.ubtsu.ac.id) menggunakan tombol **"Login with SSO"** dengan kredensial email universitas Anda yang baru untuk menyelesaikan penandatanganan kontrak kamar.

### Layer C: Graceful Interception (Live Session Handling)
If a student happens to be actively logged into the Asrama dashboard using their PMB credentials at the exact moment the Admin executes the sync:
1. The frontend (via polling or WebSocket) detects `isMigrated = true`.
2. The UI renders a blocking modal overlay.
3. **Modal Content:** *"Selamat! NIM resmi Anda telah diterbitkan. Demi keamanan dan legalitas penandatanganan kontrak, silakan masuk kembali menggunakan akun SSO Universitas Anda."*
4. **Action:** A single button labeled **"Logout & Pergi ke Halaman SSO"** forces the session to clear and redirects the user to the SSO login gateway.

## 4. Why SSO is Mandatory Before Step 5
1. **Legal Non-Repudiation:** A digital contract requires verified identity. The PMB number is provisional; the NIM is the legally binding university identifier.
2. **Security & Ownership:** Forcing SSO login proves the student has successfully claimed their official university email address and possesses the credentials, adding a layer of Multi-Factor Authentication (MFA) before signing a financial liability document.
