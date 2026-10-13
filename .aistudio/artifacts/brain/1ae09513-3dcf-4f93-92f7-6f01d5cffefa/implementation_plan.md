# Rencana Implementasi: Standarisasi & Penyesuaian Skema API SIAKAD UBT (BTT-006 & BTT-002)

Dokumen ini memuat rencana teknis penyesuaian sistem Asrama UBT berdasarkan hasil audit dan analisis langsung dari payload API resmi:
- `https://siakad.ubtsu.ac.id/api/mahasiswa-btt-006` (133 mahasiswa, Beasiswa Khusus, Angkatan 2025)
- `https://siakad.ubtsu.ac.id/api/mahasiswa-btt-002` (297 mahasiswa, KIP-Kuliah, Multi-Angkatan: 2026, 2025, 2024, 2023)

Serta arahan keputusan pengguna:
1. **Field Pelengkap**: Menyediakan form ringkas untuk melengkapi 2 field krusial yang tidak disediakan API: **Nomor WhatsApp** (untuk OTP kontrak) dan **Jenis Kelamin** (untuk alokasi Gedung Putra/Putri).
2. **Kunci Penghubung**: Memanfaatkan `sso_id_from_sidara` sebagai *foreign key* penghubung langsung antara akun SSO SIDARA dan rekord pendaftaran asrama.
3. **Klasifikasi Maba vs Eksisting**: Menentukan kategori pengguna berdasarkan format dan awalan Nomor Induk Mahasiswa (NIM) yang dimasukkan saat login (`26xxxx` / `PMB` = Maba Baru; `25xxxx`, `24xxxx`, `23xxxx`, `22xxxx` = Mahasiswa Eksisting).

---

## 1. Arsitektur Pemetaan Data (SIAKAD ➔ Staging Asrama)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       PAYLOAD RESMI API SIAKAD UBT                          │
│ id_siakad | sso_id_from_sidara | nim | nik_ktp | nama_mahasiswa | angkatan  │
│ unit: { id, name } | bill_to_type: { id, code, name }                       │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼ (Engine Pemetaan & Sanitasi)
┌─────────────────────────────────────────────────────────────────────────────┐
│                  TABEL STAGING: siakad_mahasiswa_stg                        │
│ • sso_id_from_sidara (FK ke akun SSO SIDARA)                                │
│ • id_siakad (ID unik pangkalan data kampus)                                 │
│ • nomor_registrasi / nim (Format Standar Kampus)                            │
│ • nama_lengkap (Auto-Trim spasi berlebih)                                   │
│ • nik (Dukungan NIK valid & penanganan null)                                │
│ • program_studi (Dari unit.name)                                            │
│ • angkatan (Tahun akademik masuk)                                           │
│ • kategori_beasiswa & nama_beasiswa (Dari bill_to_type)                     │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
           ┌───────────────────────────┴───────────────────────────┐
           ▼                                                       ▼
┌──────────────────────────────────────┐  ┌──────────────────────────────────┐
│      LOGIKA DETEKSI KELAS NIM        │  │     MINI-FORM PELENGKAP DATA     │
│ Awalan 26xxxx / PMB ➔ Maba Baru      │  │ Input 2 field yang tidak ada API:│
│ Awalan <=25xxxx ➔ Eksisting Non-Host │  │ 1. No. WhatsApp (Untuk OTP)      │
└──────────────────────────────────────┘  │ 2. Jenis Kelamin (Putra/Putri)   │
                                          └──────────────────────────────────┘
```

---

## 2. Struktur Data & Penyesuaian Skema

### A. Update Tipe TypeScript (`src/types/asrama.ts`)
Pembaruan interface `SiakadMahasiswaStgRecord`:
```typescript
export interface SiakadMahasiswaStgRecord {
  id: number;
  api_link_id: number;
  id_siakad?: number;              // ID unik dari SIAKAD
  sso_id_from_sidara?: number;     // Foreign key ke akun SSO SIDARA
  kategori_beasiswa: 'nonkip' | 'kip';
  nama_beasiswa: string;
  bill_to_code?: string;           // BTT-006 / BTT-002
  nomor_registrasi: string;        // NIM mahasiswa
  nim_resmi?: string;              // Alias NIM
  has_active_nim?: boolean;
  nama_lengkap: string;            // Trimmed
  nik: string;                     // NIK KTP (atau string kosong jika null)
  angkatan?: string;               // 2026, 2025, 2024, 2023
  program_studi: string;           // Dari unit.name
  fakultas: string;
  email?: string;
  nomor_telepon?: string;          // Diisi lewat mini-form
  jenis_kelamin?: 'L' | 'P';       // Diisi lewat mini-form
  status_klaim: number;
  status_verifikasi_subsidi: number;
  is_api_fields_complete?: boolean;
  synced_at: string;
}
```

### B. Update Migrasi Laravel (`database/migrations/2026_01_01_000006_create_siakad_sync_tables.php`)
Menambahkan kolom `sso_id_from_sidara`, `id_siakad`, `angkatan`, dan `bill_to_code` pada tabel `siakad_mahasiswa_stg`.

### C. Update Service Sinkronisasi (`app/Services/SiakadSyncService.php`)
Memperbarui fungsi parsing agar membaca struktur JSON payload asli:
- Menyimpan `sso_id_from_sidara` dan `id_siakad`.
- Menarik `unit.name` ke kolom `program_studi`.
- Menarik `bill_to_type.code` dan `bill_to_type.name` ke kolom beasiswa.
- Melakukan pembersihan string `trim($item['nama_mahasiswa'])`.

---

## 3. Komponen Antarmuka & UX Flow

### A. Klasifikasi Berdasarkan Format NIM saat Login
* **NIM Baru (Angkatan 2026, misal `2606001`, `2603040`, `2607018`)**:
  - Dikenali sebagai **Maba Baru (Jalur KIP/Beasiswa 2026)**.
  - Masuk ke alur Admisi Mahasiswa Baru dengan biodata terisi otomatis.
* **NIM Eksisting (Angkatan 2025, 2024, 2023, misal `2503034`, `24301001`, `2240101088`)**:
  - Dikenali sebagai **Mahasiswa Eksisting (Bukan Penghuni)**.
  - Masuk ke alur Fast-Track Asrama dengan verifikasi SSO SIDARA.

### B. Mini-Form Pelengkap Data (WhatsApp & Gender)
* Saat data ditarik dari SIAKAD (baik saat login maupun klik tombol Auto-Fill), jika `nomor_telepon` atau `jenis_kelamin` belum ada:
* Menampilkan dialog/modal ringkas elegan:
  - Judul: **"Lengkapi 2 Data Kontak & Hunian"**
  - Kolom 1: **Nomor WhatsApp Aktif** (dengan info: *"Dibutuhkan untuk verifikasi OTP kontrak digital"*).
  - Kolom 2: **Jenis Kelamin (Laki-laki / Perempuan)** (dengan info: *"Dibutuhkan untuk penentuan alokasi Gedung Putra / Putri"*).
  - Tombol simpan: *"Simpan & Lanjutkan"*.

---

## 4. Proposed Changes by Files

### Backend & Migrations
- **`database/migrations/2026_01_01_000006_create_siakad_sync_tables.php`**: Tambahkan kolom `sso_id_from_sidara`, `id_siakad`, `angkatan`, `bill_to_code`.
- **`app/Models/SiakadMahasiswaStg.php`**: Daftarkan atribut baru ke casts dan fillable.
- **`app/Services/SiakadSyncService.php`**: Sesuaikan pemetaan payload response JSON dari endpoint SIAKAD.

### Frontend
- **`src/types/asrama.ts`**: Update interface `SiakadMahasiswaStgRecord` sesuai atribut API.
- **`src/data/initialData.ts`**: Masukkan sampel data otentik dari API asli (`2606001` Dania Sifa, `2503034` Ferniati Lani, `24301001` Amanda Sheira) dengan `sso_id_from_sidara`.
- **`src/components/auth/LoginDualTab.tsx`**: Update logika deteksi Maba vs Eksisting berdasarkan awalan NIM, serta preset uji coba akun asli.
- **`src/components/maba/MabaDashboard.tsx`**: Tambahkan komponen modal pelengkap ringkas (WhatsApp & Gender) saat auto-fill dipicu.
- **`src/components/admin/SiakadSyncManager.tsx`**: Tampilkan kolom `sso_id_from_sidara` dan `angkatan` pada tabel audit admin keuangan.

### Dokumentasi
- **`docs/ARCHITECTURE.md` & `ASRAMA_UBT_SYSTEM_DOCUMENTATION.md`**: Perbarui spesifikasi integrasi API dengan skema final.

---

## 5. Verification Plan

1. **Uji Pemetaan Data API**:
   - Sinkronisasi data dan verifikasi field `sso_id_from_sidara`, `nim`, `unit.name`, dan `bill_to_type` tersimpan dengan benar.
2. **Uji Login Klasifikasi NIM**:
   - Login dengan NIM angkatan 2026 (`2606001`) ➔ terklasifikasi sebagai Maba.
   - Login dengan NIM angkatan 2025 (`2503034`) ➔ terklasifikasi sebagai Mahasiswa Eksisting.
3. **Uji Mini-Form Pelengkap**:
   - Verifikasi dialog pengisian No. WhatsApp dan Jenis Kelamin muncul jika kedua field belum terisi, dan berhasil disimpan ke profil.
4. **Verifikasi Build**:
   - Jalankan `lint_applet` dan `compile_applet`.
