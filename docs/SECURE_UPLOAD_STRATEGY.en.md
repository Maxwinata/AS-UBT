# Secure File Upload Management Strategy (e-KYC)

> **Language / Pilihan Bahasa:** [🇮🇩 Bahasa Indonesia (Primary)](SECURE_UPLOAD_STRATEGY.md) | 🇬🇧 **English Version**

This document outlines the architectural guidelines and best practices for securely managing sensitive user file uploads, specifically National ID cards (KTP) and selfies, within the Asrama Admission System. It focuses on the handling of these files during initial submission and subsequent partial correction flows.

---

## 1. Storage & Encryption (Data Security)

Sensitive documents like KTPs contain highly confidential Personally Identifiable Information (PII). They must never be exposed publicly.

*   **Private Buckets Only:** All e-KYC files must be stored in strictly private storage disks/buckets (e.g., `storage/app/private_kyc`, Google Cloud Storage, AWS S3, or Firebase Storage). Public read access must be completely disabled at the bucket/directory level.
*   **Encryption at Rest:** Ensure the cloud provider or filesystem is configured to encrypt all objects at rest (e.g., using AES-256). 
*   **Encryption in Transit:** All uploads and downloads must be forced over HTTPS/TLS 1.2+.
*   **Access Mechanism (Signed URLs):** 
    *   Direct object URLs (e.g., `https://storage.../ktp.jpg`) must return a `403 Forbidden` error.
    *   To allow Admins to verify documents or Users to preview their own uploaded files, the backend API must generate **Short-lived Signed URLs**. 
    *   These Signed URLs should have a strict expiration time (TTL 15 minutes) to prevent unauthorized link sharing.

---

## 2. Versioning Strategy (Audit Trail Integrity)

During the **Partial Correction Flow**, a user may be asked to re-upload a blurry or invalid KTP. 

*   **Rule: NEVER Overwrite Files.** Overwriting a file named `ktp_12345.jpg` with a new upload permanently destroys the historical context. If an admin reviews the audit trail to see why the previous submission was rejected, they will only see the new file, breaking the logical continuity.
*   **Unique Naming Convention:** File uploads must use unique identifiers (UUIDs) or timestamps in their file paths.
    *   *Bad:* `/uploads/ktp/123456.jpg`
    *   *Good:* `/kyc/ktp/ktp_123456_v169456789_a7b2c9.jpg`
    *   *Good:* `/kyc/ktp/ktp_123456_550e8400-e29b-41d4-a716-446655440000.jpg`
*   **Database Mapping:** The primary user record (`MabaProfile`) should always point to the *latest/active* file URL. The historical file URLs must be preserved inside the `ModificationLog` payload, ensuring the exact image reviewed at that specific point in time is retained in the history.

---

## 3. Lifecycle Management (Cost & Compliance Optimization)

Because we use a strict versioning (no-overwrite) strategy, storage buckets will accumulate "orphaned" or "rejected" files over time, increasing storage costs.

*   **Cloud Lifecycle Rules:** Configure the storage bucket with automated lifecycle policies.
*   **Garbage Collection of Stale Versions:** 
    *   Any file version that is no longer the "active" version in the user's main profile should be tagged or moved to a cold storage tier.
    *   *Deletion:* Permanently delete orphaned versions after a compliance grace period (e.g., 30 to 60 days after the correction was approved). This gives admins enough time to audit recent changes while keeping cloud costs minimal.

---

## 4. Pre-Upload Validation (Attack Mitigation)

To prevent malicious payloads from compromising the system:

*   **Strict MIME-Type Checking:** Do not rely solely on the file extension (e.g., `.jpg`). The backend must inspect the file's binary magic numbers to ensure it is a genuine `image/jpeg` or `image/png`.
*   **Size Limits:** Enforce strict file size limits (e.g., Max 5MB per image) both on the client-side (to save bandwidth) and the server-side (to prevent Denial of Service via storage exhaustion).
*   **Security Headers:** Deliver temporary streams with `X-Content-Type-Options: nosniff` and proper Content-Disposition to prevent stored cross-site scripting (XSS).
