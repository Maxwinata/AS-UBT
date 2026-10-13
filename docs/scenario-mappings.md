# Interaksi Basis Data & Pemetaan 5 Skenario Pengguna Asrama

> **Pilihan Bahasa / Language:** 🇮🇩 **Bahasa Indonesia (Utama)** | [🇬🇧 English Version](scenario-mappings.en.md)

Dokumen ini mendefinisikan 5 skenario utama interaksi basis data pada sistem Asrama UBT. Dokumen ini memetakan bagaimana basis data operasional asrama mengarahkan alur pengguna berdasarkan status akademiknya (dari SIDARA) dan status huniannya.

---

## 1. Matriks Silang: 5 Skenario Utama

| Skenario | Target Pengguna | Logika / Interaksi Basis Data | Pengalihan Antarmuka (UI/UX) |
| :--- | :--- | :--- | :--- |
| **1. Maba Baru (Onboarding)** | Mahasiswa Baru (No. Reg PMB / NIM Baru) | **Cek:** `penyewa` (NULL).<br>**Cek SIAKAD & SIDARA:** Apakah NIM resmi telah diterbitkan?<br>- Jika YA (`has_active_nim = true`): Munculkan modal notifikasi & alihkan ke SSO.<br>- Jika BELUM: Buat rekord di `users` & `maba_profiles` (staging). | Jika NIM resmi terdeteksi, diarahkan login via **SSO UBT**. Jika belum, diarahkan ke **Admisi 6-Langkah** reguler dengan verifikasi e-KYC. |
| **2. Mahasiswa Eksisting (Bukan Penghuni)** | Mahasiswa Aktif Kampus (NIM Valid via SSO) | **Cek:** `SIDARA_DB` (Wajib Aktif).<br>**Cek:** `penyewa` (NULL).<br>**Evaluasi Output API SIAKAD:**<br>- Jika field memadai (`is_api_fields_complete = true`): Lewati biodata.<br>- Jika belum lengkap: Wajib isi field yang kurang. | **Fast-Track Pendaftaran** langsung ke **Step 2 (Pilih Kamar & Tagihan)** jika data API memadai. Diarahkan ke **Step 1 (Lengkapi Biodata)** jika data API belum lengkap. |
| **3. Penghuni Aktif (Senior Tenant)** | Penghuni Kamar Saat Ini | **Cek:** `penyewa` (DITEMUKAN, Status: AKTIF).<br>**Cek:** Kontrak `tanggal_selesai` > 30 hari. | Diarahkan ke **Dashboard Eksisting**. Akses ke pelaporan perbaikan (tiket), tagihan bulanan, dan barcode gerbang. |
| **4. Cicilan Uang Deposit** | Maba / Penghuni dengan skema termin | **Cek:** `billing_invoices` (`is_cicilan_deposit = TRUE`).<br>**Aksi:** Query `payment_schemes` untuk progres termin. | Diarahkan ke **Manajer Cicilan**. Dashboard menyoroti batas jatuh tempo bulan ke-2 dan membatasi aksi tertentu hingga 100% lunas. |
| **5. Draf Perpanjangan Sewa (Renewal)** | Penghuni Aktif (Kontrak mendekati akhir) | **Cek:** `penyewa` (Kontrak `tanggal_selesai` < 30 hari).<br>**Aksi:** Query antrean draf perpanjangan. | Diarahkan ke **Alur Perpanjangan Kontrak**. Pengguna harus mengonfirmasi perpanjangan atau memulai checkout sebelum mengakses fitur reguler. |

---

## 2. Diagram Alur Transisi Status Mahasiswa Menjadi Penghuni

```mermaid
stateDiagram-v2
    [*] --> SSO_Login : Akses Web Asrama
    
    state SSO_Login {
        [*] --> Identifikasi_Pengguna
        Identifikasi_Pengguna --> MABA : Nomor Pendaftaran / NIM Baru
        Identifikasi_Pengguna --> MAHASISWA_EKSISTING : NIM Valid (SIDARA)
    }

    state Fase_Staging {
        MABA --> Staging_Pendaftaran : Wajib Lengkapi e-KYC
        MAHASISWA_EKSISTING --> Cek_Status_Hunian : Query tabel penyewa
        Cek_Status_Hunian --> Staging_Pendaftaran : Jika NULL (Bukan Penghuni)
        Staging_Pendaftaran --> Invoice_Diterbitkan : Pilih Kamar & Booking
    }

    state Percabangan_Bayar <<choice>>
    Invoice_Diterbitkan --> Percabangan_Bayar
    Percabangan_Bayar --> Lunas_Dimuka : Tagihan Reguler
    Percabangan_Bayar --> Jalur_Cicilan : is_cicilan = TRUE

    state Fase_Master {
        Cek_Status_Hunian --> PENGHUNI_AKTIF : Jika DITEMUKAN (Status = AKTIF)
        Lunas_Dimuka --> Protokol_Sync_SIDARA : Jika butuh sinkronisasi NIM
        Protokol_Sync_SIDARA --> PENGHUNI_AKTIF : Migrasi ke Tabel Master
        Jalur_Cicilan --> PENGHUNI_AKTIF : Termin 1 Lunas (Pindah Bersyarat)
    }

    PENGHUNI_AKTIF --> Cek_Masa_Kontrak
    state Cek_Masa_Kontrak <<choice>>
    Cek_Masa_Kontrak --> Operasional_Reguler : Sisa Waktu > 30 Hari
    Cek_Masa_Kontrak --> Jalur_Perpanjangan_Sewa : Sisa Waktu < 30 Hari
```
