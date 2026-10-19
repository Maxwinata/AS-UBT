# Audit & Penyempurnaan Akurasi Pemetaan Skema Database (Database Schema Mapping)

Dokumen ini memuat hasil evaluasi akurasi skema basis data menyeluruh serta rencana aksi perbaikan untuk memastikan keselarasan 100% antara:
1. **Model Frontend (TypeScript Types)** di `src/types/asrama.ts`
2. **Visualisasi Interaktif (D3 Diagram & ERD)** di `SchemaDiagram.tsx` & `ERDDiagram.tsx`
3. **Dokumentasi Arsitektur & Blueprints** di `docs/ARCHITECTURE.md` & `LaravelBlueprint.tsx`
4. **Skrip Migrasi Laravel Asli** di folder `database/migrations/`

---

## 1. Analisis Akurasi Skema Saat Ini (Current State Audit)

Berdasarkan audit mendalam terhadap seluruh lapisan, berikut temuan akurasi dan kesenjangan (*gaps*) yang perlu disempurnakan:

### Lapisan 1: Staging Mandiri Maba (`request_*`) -> Master Berjalan (`pembayaran`, `transaksi`, `penyewa`)
* **Status:** **85% Akurat (Valid, but needs refinement)**.
* **Kelebihan:** 
  * Pemisahan domain otonom mahasiswa baru (`operator_id = 0`) dan domain master admin berjalan (`operator_id = ID Admin`) sudah diimplementasikan dengan baik di migration `2026_01_01_000005_create_web_admin_bridging_tables.php`.
  * Matriks pemetaan kolom `no_request` -> `no_invoice` telah konsisten di tabel header (`request_pembayaran` -> `pembayaran`), detail (`request_pembayaran_detail` -> `pembayaran_detail`), dan mutasi kasir (`request_transaksi` -> `transaksi`).
* **Kesenjangan (Discrepancies):**
  * Di `penyewa`, kolom foreign key `kamar_id` belum eksplisit ada di tabel `penyewa` pada migrasi `2026_01_01_000005` (hanya ada di `request_pembayaran` dan `pembayaran`), padahal di `ERDDiagram.tsx` tercantum `kamar_id (FK)` di `penyewa`.
  * Di `request_pembayaran`, belum ada kolom pelacakan status migrasi identitas `is_migrated` (boolean default false) untuk menandai mahasiswa yang telah beralih dari nomor PMB ke NIM resmi SIDARA.

### Lapisan 2: Dual Database SIMABA PMB (`u540633926_simaba`) -> Operasional Asrama (`asrama_ubt_db`)
* **Status:** **90% Akurat**.
* **Kelebihan:**
  * Hubungan antara `pendaftaranmahasiswa` (`nodaftar`, `nama`, `nik`, `nohp`, `email`, `jk`, `id_prodi`) dan tabel `penyewa` / `maba_profiles` telah terdokumentasi rapi di `docs/TESTING_DATA_REAL_LARAGON.md`.
* **Kesenjangan:**
  * Di migrasi `2026_01_01_000003_create_asrama_system_tables.php`, tabel `maba_profiles` belum memuat indeks khusus untuk `sso_id_from_sidara` dan `no_pmb` untuk mempercepat query pencarian saat sinkronisasi API.

### Lapisan 3: Integrasi API SIAKAD UBT (`api_link` & `siakad_mahasiswa_stg`)
* **Status:** **95% Akurat**.
* **Kelebihan:**
  * Migrasi `2026_01_01_000006_create_siakad_sync_tables.php` telah menyediakan endpoint `mahasiswa-btt-006` (Beasiswa Khusus Yayasan Non-KIP) dan `mahasiswa-btt-002` (KIP) serta tabel staging `siakad_mahasiswa_stg`.
* **Kesenjangan:**
  * Pada diagram interaktif `SchemaDiagram.tsx`, visualisasi link dan node relasi antara `siakad_mahasiswa_stg` ke `penyewa` dan `request_pembayaran` belum ditampilkan secara lengkap saat skenario skema dipilih.

### Lapisan 4: Penyimpanan Privat Berkas e-KYC Berversi & Jejak Audit (Audit Trail)
* **Status:** **Perlu Penguatan Struktural (Focus Priority)**.
* **Kelebihan:**
  * Frontend sudah memiliki `ModificationLog` dan tabel visual log koreksi data KYC.
* **Kesenjangan:**
  * Migrasi fisik untuk tabel `kyc_audit_trail` (atau tabel penyimpan riwayat versi berkas e-KYC: `ktp_file_version`, `selfie_file_version`, `storage_disk`, `checksum_sha256`, `signed_url_expiry`) belum dibuat secara terpisah di `database/migrations/`.
  * Sesuai aturan arsitektur sistem (`RULE[AGENTS_md]`), berkas e-KYC **TIDAK BOLEH ditimpa (*no overwrite/immutable*)**, harus memiliki UUID/timestamp unik, disimpan di private bucket, dan memiliki log audit riwayat saat mahasiswa melakukan revisi/koreksi.

---

## 2. Rencana Arsitektur & Perubahan Skema (Target Architecture)

### A. Tabel Baru: `kyc_documents` & `modification_logs` (Audit Trail)
Menambahkan migrasi Laravel `2026_01_01_000007_create_kyc_audit_trail_tables.php`:
* **`kyc_documents`**:
  * `id` (PK, BigInt)
  * `user_id` (FK to `users`)
  * `penyewa_id` (FK to `penyewa`, nullable)
  * `doc_type` (`KTP`, `SELFIE_KTP`, `SURAT_PERNYATAAN_ORTU`, `SURAT_KIP`)
  * `file_name` (e.g. `ktp_NIM2026001_v1_1713589200_a8f9.jpg`)
  * `file_path` (path di private storage bucket)
  * `file_version` (int: 1, 2, 3...)
  * `is_active_version` (boolean, default true)
  * `storage_disk` (string, default: `private_kyc`)
  * `file_size_bytes` (bigint)
  * `mime_type` (string, `image/jpeg`, `image/png`, `application/pdf`)
  * `file_hash` (string, SHA256 checksum)
  * `status_verifikasi` (`PENDING`, `APPROVED`, `REJECTED`)
  * `verified_by` (FK to `users`, nullable)
  * `verified_at` (timestamp, nullable)
  * `rejection_reason` (text, nullable)
  * `retention_until` (date, lifecycle policy 60 hari untuk versi lama)
  * `timestamps`
* **`modification_logs`**:
  * `id` (PK, BigInt)
  * `trackable_type` (string: `maba_profiles`, `penyewa`, `billing_invoices`, `kyc_documents`)
  * `trackable_id` (bigint)
  * `actor_type` (`User`, `Admin`, `System`)
  * `actor_id` (FK to `users`, nullable)
  * `action` (string, e.g. `KYC_INITIAL_UPLOAD`, `KYC_CORRECTION_RESUBMIT`, `KYC_VERIFICATION_APPROVAL`, `SIDARA_MANUAL_NIM_SYNC`)
  * `old_values` (json, nullable)
  * `new_values` (json, nullable)
  * `ip_address` (string, 45 chars)
  * `user_agent` (string)
  * `created_at` (timestamp)

### B. Sinkronisasi Kolom Bridging Staging & Master
* Memperbarui `database/migrations/2026_01_01_000005_create_web_admin_bridging_tables.php`:
  * Menambahkan `kamar_id` (nullable FK) di tabel `penyewa`.
  * Menambahkan `is_migrated` (boolean default false) dan `migrated_at` di tabel `request_pembayaran`.
  * Menambahkan foreign key index yang tepat pada `request_transaksi` dan `request_pembayaran_detail`.

### C. Pembaruan Komponen Frontend & ERD Diagram
* **`src/components/architecture/ERDDiagram.tsx`**:
  * Menambahkan tabel `kyc_documents` dan `modification_logs` ke daftar node D3.
  * Menghubungkan relasi antara `penyewa` -> `kyc_documents` dan `users` -> `modification_logs`.
* **`src/components/architecture/SchemaDiagram.tsx`**:
  * Menambahkan skenario baru: `5. e-KYC Private Storage & Audit Trail`.
  * Menambahkan kolom-kolom baru di `colsMap`.
* **`src/components/architecture/LaravelBlueprint.tsx`**:
  * Menyertakan kode migrasi `2026_01_01_000007_create_kyc_audit_trail_tables.php` di tab Migrations.
  * Memperbarui tab `kyc_storage` dengan skema controller penyimpanan privat dan pembentukan Signed URL berdurasi 15 menit.

---

## 3. Tahapan Eksekusi Bertahap (Step-by-Step Implementation)

### Tahap 1: Pembuatan Skrip Migrasi Laravel untuk e-KYC & Audit Trail
1. Buat file `database/migrations/2026_01_01_000007_create_kyc_audit_trail_tables.php` yang mencakup:
   - Skema tabel `kyc_documents` dengan versioning immutable dan metadata retensi 60 hari.
   - Skema tabel `modification_logs` untuk mencatat riwayat perubahan data e-KYC dan aksi sinkronisasi SIDARA.
2. Sempurnakan kolom pada `database/migrations/2026_01_01_000005_create_web_admin_bridging_tables.php` (`kamar_id` di `penyewa`, `is_migrated` di `request_pembayaran`).

### Tahap 2: Sinkronisasi Tipe Data TypeScript
1. Perbarui `src/types/asrama.ts` untuk menambahkan tipe `KycDocumentRecord` dan menyelaraskan `ModificationLog` dengan skema database Laravel.

### Tahap 3: Pembaruan Diagram Interaktif (ERDDiagram & SchemaDiagram)
1. Perbarui `src/components/architecture/ERDDiagram.tsx` dengan tabel baru `kyc_documents` dan `modification_logs`.
2. Perbarui `src/components/architecture/SchemaDiagram.tsx` dengan skenario e-KYC & Audit Trail dan penyesuaian visual keterkaitan tabel.

### Tahap 4: Pembaruan Blueprint & Dokumentasi Arsitektur
1. Perbarui `src/components/architecture/LaravelBlueprint.tsx` (tab Migrations, Models, dan KYC Storage Guide) agar mencerminkan migrasi baru dan controller penyimpanan privat.
2. Perbarui `docs/ARCHITECTURE.md` pada tabel matriks pemetaan kolom untuk menyertakan lapisan e-KYC dan Audit Trail.

---

## 4. Kriteria Keberhasilan & Pengujian (Verification Checklist)

- [ ] Skrip migrasi Laravel baru lolos sintaks validasi PHP.
- [ ] TypeScript build/kompilasi berjalan sukses (`npm run build` / `compile_applet`) tanpa error tipe.
- [ ] D3 ERD Diagram merender seluruh tabel bridging, master, SIAKAD sync, dan KYC audit trail tanpa overlapping.
- [ ] Tab Laravel Blueprint menampilkan migration, model Eloquent, dan panduan private storage KYC yang siap pakai di Laragon.
- [ ] Aturan immutability dan retensi 60 hari terdokumentasi dan terpetakan secara presisi di skema.
