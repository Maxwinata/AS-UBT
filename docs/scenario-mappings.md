# Asrama Database Interaction & Scenario Mappings

This document defines the 5 primary database interaction scenarios for the Asrama (Dormitory) system. It outlines how the internal Asrama SQL Database routes different users based on their academic state (from SIDARA) and their tenancy state.

## 1. Cross-Reference Matrix: The 5 Scenarios

| Scenario | Target User | Database Interaction / Logic | UI / UX Routing |
| :--- | :--- | :--- | :--- |
| **1. Maba New (Onboarding)** | Mahasiswa Baru (No. Reg / New NIM) | **Check:** `master_penyewa` (NULL).<br>**Action:** Create `users` & `staging_pendaftaran`. | Routed to **Step 1-5 Onboarding**. Requires full KYC (KTP, Selfie) upload. |
| **2. Mahasiswa Eksisting (Non-Tenant)** | Existing Student (Valid NIM) | **Check:** `SIDARA_DB` (Must be Active).<br>**Check:** `master_penyewa` (NULL).<br>**Action:** Create `staging_pendaftaran`. | Routed to **Fast-Track Onboarding**. Skips extensive KYC if SIDARA data exists. |
| **3. Penghuni Aktif (Regular Tenant)** | Existing Room Inhabitant | **Check:** `master_penyewa` (FOUND, Status: AKTIF).<br>**Check:** Contract `tanggal_selesai` > 30 days. | Routed to **Tenant Dashboard**. Access to complaints, monthly bills, gate QR codes. |
| **4. Cicilan Deposit (Installments)** | Maba or Eksisting (with financial aid) | **Check:** `master_pembayaran` (`is_cicilan = TRUE`).<br>**Action:** Query `skema_cicilan` for termin progress. | Routed to **Installment Manager**. Dashboard highlights next due date and locks certain features until 100% paid. |
| **5. Draft Renewal** | Active Tenant (Contract near end) | **Check:** `master_penyewa` (Contract `tanggal_selesai` < 30 days).<br>**Action:** Query `draft_renewal`. | Routed to **Renewal Blocker/Pipeline**. User must sign the new draft or check out before accessing regular features. |

---

## 2. Transition State Flow: Student to Room Inhabitant

The following Mermaid state diagram visualizes the journey of both **Maba** and **Mahasiswa Eksisting** from their initial login towards becoming a fully integrated **Penghuni Aktif** (Room Inhabitant), including how they interact with the Cicilan and Renewal development paths.

```mermaid
stateDiagram-v2
    %% External Gate
    [*] --> SSO_Login : Access Asrama Web
    
    state SSO_Login {
        [*] --> Identify_User
        Identify_User --> MABA : Registration No / New NIM
        Identify_User --> MAHASISWA_EKSISTING : Valid NIM (SIDARA)
    }

    %% Staging / Onboarding Phase
    state Staging_Phase {
        MABA --> Staging_Pendaftaran : Full KYC Required
        
        MAHASISWA_EKSISTING --> Check_Tenant_Status : Query master_penyewa
        Check_Tenant_Status --> Staging_Pendaftaran : If NULL (Bukan Penghuni)
        
        Staging_Pendaftaran --> Invoice_Generated : Select Room & Book
    }

    %% Dev Path 1: Payment Branches
    state Payment_Branch <<choice>>
    Invoice_Generated --> Payment_Branch
    
    Payment_Branch --> Paid_In_Full : Regular Invoice
    Payment_Branch --> Jalur_Dev_1_Cicilan : is_cicilan = TRUE
    
    %% Master / Tenant Phase
    state Master_Phase {
        Check_Tenant_Status --> PENGHUNI_AKTIF : If FOUND (Status = AKTIF)
        
        Paid_In_Full --> Sync_SIDARA_Protocol : If NIM needs sync
        Sync_SIDARA_Protocol --> PENGHUNI_AKTIF : Migrate to Master
        
        Jalur_Dev_1_Cicilan --> PENGHUNI_AKTIF : Termin 1 Paid (Conditional Move)
    }

    %% Dev Path 2: Renewal Phase
    state Contract_Check <<choice>>
    PENGHUNI_AKTIF --> Contract_Check : Daily Cron / Login Check
    
    Contract_Check --> PENGHUNI_AKTIF : Contract > 30 Days
    Contract_Check --> Jalur_Dev_2_Renewal : Contract < 30 Days
    
    state Jalur_Dev_2_Renewal {
        [*] --> Draft_Created
        Draft_Created --> Signed_And_Paid : Tenant Agrees
        Draft_Created --> Check_Out : Tenant Declines
    }
    
    Signed_And_Paid --> PENGHUNI_AKTIF : Auto-extend date on D-1
    Check_Out --> ALUMNI : End of Tenancy
    
    ALUMNI --> [*]
```

### Key Takeaways from the Diagram:
1. **Convergence at Staging**: Both Maba and non-tenant Existing Students converge at the `Staging_Pendaftaran` state. The difference is solely in UI friction (Maba requires full KYC, Existing students might bypass it via SIDARA sync).
2. **Branching at Payment (Dev Path 1)**: The system branches out to handle regular payments versus the `is_cicilan` logic before letting the user into the `PENGHUNI_AKTIF` master state.
3. **Looping at Renewal (Dev Path 2)**: The `PENGHUNI_AKTIF` state is not final; it continuously monitors the contract date, triggering the `Jalur_Dev_2_Renewal` sub-state to either cycle them back into active tenants or exit them to `ALUMNI`.

---

## 3. Database Schema Mapping (ERD)

The following Entity-Relationship Diagram maps how the internal Asrama SQL Database handles the 5 scenarios described above while maintaining clean state separation from the external SIDARA Source of Truth.

```mermaid
erDiagram
    %% EKSTERNAL SOURCE OF TRUTH
    SIDARA_DB {
        string NIM PK 
        string StatusAkademik "Aktif/Lulus/Cuti"
        json DataBiodata
    }

    %% CORE IDENTITIES & STAGING (Skenario 1 & 2)
    ASRAMA_USERS {
        uuid id_user PK
        string identifier "NIM/PMB-xxx"
        datetime last_login
    }

    STAGING_PENDAFTARAN {
        uuid id_staging PK
        uuid id_user FK
        string tipe_pendaftar "MABA / EKSISTING"
        string status_onboarding "STEP_1 to STEP_5"
    }

    %% MASTER OPERASIONAL (Skenario 3)
    MASTER_PENYEWA {
        uuid id_penyewa PK
        string NIM FK "Harus valid dr SIDARA"
        string id_kamar FK
        date tanggal_mulai
        date tanggal_selesai
        string status "AKTIF / ALUMNI / SUSPENDED"
    }

    MASTER_PEMBAYARAN {
        uuid id_invoice PK
        uuid id_penyewa FK "NULL jika msh staging"
        string tipe_tagihan "DEPOSIT / BULANAN / RENEWAL"
        string status "UNPAID / PAID / PARTIAL"
        boolean is_cicilan "Trigger Skenario 4"
    }

    %% JALUR DEV 1: CICILAN (Skenario 4)
    SKEMA_CICILAN {
        uuid id_cicilan PK
        uuid id_invoice FK "Induk dari Master Pembayaran"
        int termin_ke
        decimal nominal_termin
        date jatuh_tempo
        string status_termin "PAID / UNPAID / OVERDUE"
    }

    %% JALUR DEV 2: RENEWAL (Skenario 5)
    DRAFT_RENEWAL {
        uuid id_draft PK
        uuid id_penyewa FK "Relasi ke Master Penyewa"
        date periode_baru_mulai
        date periode_baru_selesai
        string status_draft "PENDING_TTD / SIGNED / REJECTED"
        uuid id_invoice_renewal FK "Relasi ke Tagihan Baru"
    }

    %% RELASI ANTAR TABEL
    SIDARA_DB ||--o{ ASRAMA_USERS : "Verifikasi Identitas & Status"
    ASRAMA_USERS ||--o| STAGING_PENDAFTARAN : "Skenario 1 & 2"
    ASRAMA_USERS ||--o| MASTER_PENYEWA : "Skenario 3, 4, 5"
    
    STAGING_PENDAFTARAN ||--o{ MASTER_PEMBAYARAN : "Tagihan Pendaftaran"
    MASTER_PENYEWA ||--o{ MASTER_PEMBAYARAN : "Tagihan Operasional"
    
    MASTER_PEMBAYARAN ||--o{ SKEMA_CICILAN : "Skenario 4 (Jika is_cicilan)"
    MASTER_PENYEWA ||--o{ DRAFT_RENEWAL : "Skenario 5 (Masa Kritis Kontrak)"
    DRAFT_RENEWAL ||--|| MASTER_PEMBAYARAN : "Tagihan Perpanjangan"
```

