# Data Architecture & Bridging Database Integration Strategy for UBT Dormitory Portal

> **Language Selection / Pilihan Bahasa:** [🇮🇩 Versi Bahasa Indonesia (Utama)](ARCHITECTURE.md) | 🇬🇧 **English Version**

This document specifies the database architecture and bridging integration logic between the **Freshman Frontend (Autonomous Self-Registration)** and the **Laravel Web Admin (Running Master Ledger Records)**, 100% aligned with the production SQL schema (`u540633926_asrama`).

---

## 1. Architectural Philosophy: Autonomous Self-Process vs. Official Running Master

Within the UBT Dormitory operational ecosystem, data management is divided into two distinct authority domains:

1. **Autonomous Self-Registration Domain (`request_*`)**:
   - Designed for new students registering independently via the web portal interface.
   - Because data is inputted autonomously without immediate staff intervention, all rows are stamped with **`operator_id = 0`**.
   - Held in a *staging / pending* state (`status = 0`, `status_verifikasi = 0`, `status_pembayaran = 'pending'`).
   - Prevents unverified drafts, abandoned carts, or bad entries from contaminating the official master ledgers.

2. **Official Running Master Domain (`pembayaran`, `pembayaran_detail`, `transaksi`, `penyewa`)**:
   - The operational table structure when the system is running officially, where registration, billing commitments, and cash flows are handled and ratified by dorm and finance administrators.
   - Every row is tagged with **`operator_id = Admin ID`** (ensuring audit accountability for the approving officer).
   - Serves as the *single source of truth* for university/foundation financial reports, external audits, and active tenant occupancy management.

---

## 2. In-Depth Analysis of the 3 New Bridging Tables

The three new tables prefixed with `request_` function as the bridging interface between the student frontend and the backend web admin database:

### A. Table `request_pembayaran` (Staging Autonomous Invoice Header)
Captures the initial payment commitment when the freshman selects a room, lease duration (6 or 12 months), and deposit installment terms.
- **Primary Key (PK)**: `id` (BIGINT AUTO_INCREMENT)
- **Unique Key (UK)**: `no_request` (VARCHAR 50, e.g., `REQ-202610-0142`)
- **Foreign Keys (FK)**:
  - `penyewa_id` ➔ references `penyewa.id`
  - `kamar_id` ➔ references `kamar.id`
- **Operational Fields**:
  - `tanggal_masuk`, `tanggal_keluar`, `durasi`
  - `total_tagihan`, `total_potongan_harga`, `total_bayar`
  - `status_pembayaran` (default: `'pending'`)
  - `status_verifikasi` (default: `0` = Pending Admin Review, `1` = Approved)
  - `operator_id` (default: `0` = Autonomous Student)

### B. Table `request_pembayaran_detail` (Staging Line Items Breakdown)
Maintains the itemized pricing components of the registration invoice to ensure transparency and compliance with official tariff regulations.
- **Primary Key (PK)**: `id` (BIGINT AUTO_INCREMENT)
- **Foreign Keys (FK)**:
  - `no_request` ➔ references `request_pembayaran.no_request` (Indexed)
  - `harga_id` ➔ references tariff master (`harga.id`)
- **Detailed Line Items**:
  - Line 1: Dormitory Rent (`jenissewa = 'Sewa Asrama'`, `harga = 500000`, `qty = 6/12`, `jumlah_pembayaran = total_rent`)
  - Line 2: Security Deposit (`jenissewa = 'Deposit Jaminan Hunian'`, `harga = 500000/1000000`, `qty = 1`)
  - Line 3: Initial Amenities & Admin Fee (`jenissewa = 'Biaya Administrasi & Fasilitas Awal'`, `harga = 100000`, `qty = 1`)

### C. Table `request_transaksi` (Staging Payment Proof & Self-Reported Mutation)
Stores proof of transfer receipt uploads or initial manual transfer reports submitted by the student.
- **Primary Key (PK)**: `id` (BIGINT AUTO_INCREMENT)
- **Foreign Keys (FK)**:
  - `no_request` ➔ references `request_pembayaran.no_request` (Indexed)
- **Mutation Fields**:
  - `no_transaksi` (VARCHAR 50, provisional e.g. `TRX-REQ-202610-0142`)
  - `tanggal_transaksi` (DATETIME)
  - `jumlah_uang` (DECIMAL 15,2)
  - `metode_pembayaran` (VARCHAR 255, e.g. `'Transfer Manual Bank BSI'`)
  - `file_bukti` (VARCHAR 100, private storage receipt path)
  - `operator_id` (`0` = Autonomous Student)

---

## 3. Field-by-Field Transformation Matrix: Staging ➔ Running Master

When the Finance/Dorm Admin clicks **"Approve & Promote to Master"**, the system executes the following atomic database transaction:

| No | Source Table (Autonomous Staging) | Source Field | Target Table (Running Master) | Target Field | Transformation Rule / Notes |
|---|---|---|---|---|---|
| 1 | `request_pembayaran` | `no_request` | `pembayaran` | `no_invoice` | **Newly generated** official invoice number (e.g., `INV-202610-0012`). |
| 2 | `request_pembayaran` | `penyewa_id` | `pembayaran` | `penyewa_id` | Copied 1:1. |
| 3 | `request_pembayaran` | `kamar_id` | `pembayaran` | `kamar_id` | Permanently locks the room allocation in master. |
| 4 | `request_pembayaran` | `durasi`, `tanggal_masuk`, `tanggal_keluar` | `pembayaran` | `durasi`, `tanggal_masuk`, `tanggal_keluar` | Copied 1:1. |
| 5 | `request_pembayaran` | `total_tagihan`, `total_bayar` | `pembayaran` | `total_tagihan`, `total_bayar` | Copied 1:1. |
| 6 | `request_pembayaran` | `status_pembayaran` | `pembayaran` | `status_pembayaran` | Transitions from `'pending'` to `'paid'`. |
| 7 | `request_pembayaran` | `operator_id = 0` | `pembayaran` | `operator_id` | **Assigned with Staff Admin ID** who verified (`auth()->id()`). |
| 8 | `request_pembayaran_detail` | `no_request` | `pembayaran_detail` | `no_invoice` | Bound to the newly issued official `no_invoice`. |
| 9 | `request_pembayaran_detail` | `harga_id`, `jenissewa`, `harga`, `qty`, `jumlah_pembayaran` | `pembayaran_detail` | `harga_id`, `jenissewa`, `harga`, `qty`, `jumlah_pembayaran` | All breakdown items duplicated 1:1. |
| 10 | `request_transaksi` | `no_request` | `transaksi` | `no_invoice` | Bound to official `no_invoice`. |
| 11 | `request_transaksi` | `penyewa_id` (via req) | `transaksi` | `penyewa_id` | Populated with tenant ID. |
| 12 | `request_transaksi` | `no_transaksi` | `transaksi` | `no_transaksi` | Official transaction receipt number issued (e.g., `TRX-202610-0012`). |
| 13 | `request_transaksi` | `jumlah_uang`, `tanggal_transaksi`, `file_bukti` | `transaksi` | `jumlah_uang`, `tanggal_transaksi`, `file_bukti` | Copied 1:1 into the official cash ledger. |
| 14 | - | - | `transaksi` | `jenis_transaksi` | Set to `'Asrama'`. |
| 15 | `request_transaksi` | `operator_id = 0` | `transaksi` | `operator_id` | **Assigned with Staff Admin ID** who verified. |
| 16 | `penyewa` | `status = 0`, `status_asrama = 0` | `penyewa` | `status = 1`, `status_asrama = 1` | Tenant status activated to official active resident. |
| 17 | `request_pembayaran` | `status_verifikasi = 0` | `request_pembayaran` | `status_verifikasi = 1` | Staging record updated; sets `tanggal_verifikasi = now()`. |

---

## 4. End-to-End Lifecycle & Concurrency Flow

```
[ FRESHMAN FRONTEND ]
       │
       ▼ (1. Complete Profile Biodata)
INSERT / UPDATE penyewa (status = 0, operator_id = 0)
       │
       ▼ (2. Select Room & Configure Billing)
INSERT request_pembayaran (no_request, operator_id = 0)
INSERT request_pembayaran_detail (rent, deposit, admin fees)
       │
       ▼ (3. Upload Transfer Proof)
INSERT request_transaksi (file_bukti, jumlah_uang, operator_id = 0)
       │
       ▼ (Status: Awaiting Financial Verification)
─────────────────────────────────────────────────────────────
[ LARAVEL WEB ADMIN DASHBOARD ]
       │
       ▼ (4. Admin Verifies Unique Code & Bank Mutation)
Click: "Approve & Promote to Master"
       │
       ├──► INSERT pembayaran (official no_invoice, operator_id = Admin ID)
       ├──► INSERT pembayaran_detail (bound to no_invoice)
       ├──► INSERT transaksi (official cash ledger, operator_id = Admin ID)
       ├──► UPDATE penyewa (status = 1, status_asrama = 1)
       └──► UPDATE request_pembayaran (status_verifikasi = 1, status_pembayaran = 'paid')
       │
       ▼ (5. Permanent Room Quota Decrement)
Available Capacity = kamar.kapasitas - COUNT(transaksi.kamar_id)
       │
       ▼ (6. Freshman Receives Digital Contract & e-Ticket)
Student verifies WhatsApp OTP and receives digital BASTK and e-Ticket QR Code.
```

---

## 5. Summary of Primary Keys & Foreign Keys (PK / FK)

- **`penyewa`**:
  - `id` (PK)
  - `nim` (UK)
- **`request_pembayaran`**:
  - `id` (PK)
  - `no_request` (UK)
  - `penyewa_id` ➔ FK to `penyewa.id`
  - `kamar_id` ➔ FK to `kamar.id`
- **`request_pembayaran_detail`**:
  - `id` (PK)
  - `no_request` ➔ FK to `request_pembayaran.no_request`
  - `harga_id` ➔ FK to tariff master
- **`request_transaksi`**:
  - `id` (PK)
  - `no_request` ➔ FK to `request_pembayaran.no_request`
- **`pembayaran`**:
  - `id` (PK)
  - `no_invoice` (UK)
  - `penyewa_id` ➔ FK to `penyewa.id`
  - `kamar_id` ➔ FK to `kamar.id`
- **`pembayaran_detail`**:
  - `id` (PK)
  - `no_invoice` ➔ FK to `pembayaran.no_invoice`
- **`api_link`**:
  - `id` (PK)
  - `kategori` (`nonkip` / `kip`)
  - `link` (SIAKAD API Endpoint URL)
- **`siakad_mahasiswa_stg`**:
  - `id` (PK)
  - `api_link_id` ➔ FK to `api_link.id`
  - `nomor_registrasi` (UK, Registration / Student ID)
  - `status_klaim` (0 = Unclaimed, 1 = Onboarding Started)
  - `status_verifikasi_subsidi` (0 = Pending Review, 1 = Approved, -1 = Standard Rate)

---

## 6. SIAKAD API Integration Architecture (api_link & siakad_mahasiswa_stg)

### A. Registered Endpoints
The platform interfaces directly with UBT SIAKAD academic database:
1. **Special Scholarship / Non-KIP**: `https://siakad.ubtsu.ac.id/api/mahasiswa-btt-006` (Category: `nonkip`)
2. **KIP-Kuliah**: `https://siakad.ubtsu.ac.id/api/mahasiswa-btt-002` (Category: `kip`)

### B. Ingestion & Staging Flow
```
[ UBT SIAKAD SERVER ]
       │
       ▼ (Cron Worker / Admin Instant Trigger)
[ LARAVEL BACKEND: SiakadSyncService ]
       │
       ▼ (Normalized Upsert)
[ STAGING TABLE: siakad_mahasiswa_stg ]
       │
       ├─────────────────────────────────┐
       ▼                                 ▼
[ FRESHMAN FRONTEND ]           [ FINANCE WEB ADMIN ]
- Instant Auto-Fill on login     - SIAKAD Sync Management Panel
- Automatic scholarship badges  - 1-Click subsidy qualification audit
- Form identity validation      - Foundation audit trail compliance
```

### C. Auto-Fill & Subsidy Governance
1. **Instant Auto-Fill on Login**: When new applicants enter their PMB Registration Number (e.g. `PMB2026-08942` or `PMB-BTT-002-001`), the frontend looks up `siakad_mahasiswa_stg` and auto-populates: Full Name, NIK, Phone, Study Program, Faculty, and Scholarship Status.
2. **Subsidy Audit Verification**: In accordance with user decisions (Options 2 & 3), scholarship flags are honored as official student identity attributes. However, rate waivers and subsidized deposits require explicit approval by Financial Staff in the `SiakadSyncManager` panel to ensure strict regulatory accounting compliance.

With this architecture, the bridge between autonomous freshman onboarding, SIAKAD campus database synchronization, and Web Admin accounting compliance operates seamlessly without data anomalies.
