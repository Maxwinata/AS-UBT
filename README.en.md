# Portal SI-GABUNG 54 — UBT Dormitory Information System

> **Language Options / Pilihan Bahasa:**  
> [🇮🇩 Bahasa Indonesia (Primary)](README.md) | 🇬🇧 **English Version**

---

## 📌 About the Application

**Portal SI-GABUNG 54** (*Sistem Informasi Gerbang Administrasi Baru dan Unit Naungan Asrama Mahasiswa UBT* / Roemah 54) is a unified web platform engineered to digitize the complete dormitory administration lifecycle at Bunda Thamrin University (UBT). The system covers the 6-step admission flow for prospective students (PMB), real-time room plotting, unique-coded invoice generation, e-KYC identity verification with face liveness detection, digital contract execution backed by WhatsApp OTP (complying with JUKLAK-02 & JUKLAK-03 regulations), check-in barcode ticketing (BASTK), and an automated 5+5 day grace-period delinquency enforcement engine for senior residents.

The system is built on a full-stack **Laravel 11 + Inertia.js 2.0 + React 19 + Tailwind CSS v4** architecture with MySQL.

---

## 📚 System Documentation Index (Bilingual)

All technical and operational documentation is published primarily in **Bahasa Indonesia** with complete **English translations**:

| Document | Indonesian Version (Primary) | English Version | Brief Description |
| :--- | :--- | :--- | :--- |
| **System Specifications (PRD & SAS)** | [ASRAMA_UBT_SYSTEM_DOCUMENTATION.md](ASRAMA_UBT_SYSTEM_DOCUMENTATION.md) | [ASRAMA_UBT_SYSTEM_DOCUMENTATION.en.md](ASRAMA_UBT_SYSTEM_DOCUMENTATION.en.md) | Product requirements, 6-step flow, data models, and Inertia controller routes. |
| **Laragon Setup Guide (Automated)** | [LARAGON_SETUP.md](LARAGON_SETUP.md) | [LARAGON_SETUP.en.md](LARAGON_SETUP.en.md) | 1-click automated setup in Laragon via `laragon-setup.bat`. |
| **XAMPP Setup Guide (Automated)** | [XAMPP_SETUP.md](XAMPP_SETUP.md) | [XAMPP_SETUP.en.md](XAMPP_SETUP.en.md) | Automated setup steps for Windows XAMPP via `xampp-setup.bat`. |
| **Architecture & Logic Diagram** | [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | [docs/ARCHITECTURE.en.md](docs/ARCHITECTURE.en.md) | Staging vs Master database flow, room concurrency lock, and transactions. |
| **Dormitory Regulations & JUKLAK** | [docs/JUKLAK_REFERENCE.md](docs/JUKLAK_REFERENCE.md) | [docs/JUKLAK_REFERENCE.en.md](docs/JUKLAK_REFERENCE.en.md) | Legal compliance: JUKLAK-02 (e-Signature OTP), JUKLAK-03 & F-22 (Collective Ratification), F-19, and F-02. |
| **e-KYC Secure Upload Strategy** | [docs/SECURE_UPLOAD_STRATEGY.md](docs/SECURE_UPLOAD_STRATEGY.md) | [docs/SECURE_UPLOAD_STRATEGY.en.md](docs/SECURE_UPLOAD_STRATEGY.en.md) | Private storage disk, audit trail versioning, and Signed URLs (15-min TTL). |
| **Identity Transition Protocol** | [docs/identity-transition-protocol.md](docs/identity-transition-protocol.md) | [docs/identity-transition-protocol.en.md](docs/identity-transition-protocol.en.md) | Transition mechanism from temporary PMB registration to official university NIM & SSO. |
| **5 Database Scenarios Mapping** | [docs/scenario-mappings.md](docs/scenario-mappings.md) | [docs/scenario-mappings.en.md](docs/scenario-mappings.en.md) | Cross-reference state matrix for onboarding, active tenancy, installments, and renewals. |
| **SIDARA Synchronization Protocol** | [docs/sync-sidara-protocol.md](docs/sync-sidara-protocol.md) | [docs/sync-sidara-protocol.en.md](docs/sync-sidara-protocol.en.md) | Integration protocol connecting the campus academic system with internal dormitory DB. |

---

## ⚡ Quick Start (Running the System)

### Local Environment (Windows - Laragon / XAMPP)

1. Ensure MySQL and Apache/Nginx services are running.
2. Execute the automated setup script for your stack:
   - **Laragon**: Double-click `laragon-setup.bat`
   - **XAMPP**: Run `xampp-setup.bat` in the XAMPP Shell terminal
3. Open two terminal instances to launch the dev servers:
   - **Terminal 1 (Vite Frontend):** `npm run dev`
   - **Terminal 2 (Laravel Backend):** `php artisan serve`
4. Access via browser: `http://127.0.0.1:8000` or `http://asrama-ubt.test`

---

## 🛡️ Copyright & License
Bunda Thamrin University Student Dormitory Information System (UBT) © 2026. Internal proprietary license under UPA Dormitory Management UBT.
