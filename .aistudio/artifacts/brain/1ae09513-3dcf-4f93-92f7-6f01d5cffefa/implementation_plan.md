# Rencana Implementasi: Sinkronisasi Penuh Data Akademik Calon Mahasiswa ke Formulir Validasi Identitas & Isolasi Draf per Akun

Rencana kerja ini disusun untuk mengatasi kendala yang Anda temukan: pilihan calon mahasiswa / username saat di halaman login belum tersambung secara berkelanjutan ke data akademik yang bersangkutan pada formulir Validasi Identitas (Tahap 1) di Dashboard Maba.

---

## 1. Analisis Akar Masalah (Root Cause Analysis)

Setelah melakukan audit mendalam pada aliran data antara `LoginDualTab.tsx` → `App.tsx` → `MabaDashboard.tsx`, ditemukan 4 kendala utama:

1. **State `profile` di `MabaDashboard.tsx` Tidak Ter-sinkronisasi Ulang saat Berganti Akun**:
   - `MabaDashboard.tsx` hanya menginisialisasi state `profile` saat *mount* pertama melalui `useState(initialProfile)`.
   - Tidak ada `React.useEffect` yang mendengarkan perubahan prop `initialProfile`. Akibatnya, ketika pengguna login dengan akun berbeda (misalnya Grace Marlin, Alvin Hutasoit, atau Maza Aditiya), data di Tahap 1 tetap menampilkan data siswa sebelumnya atau data *default* Maximilian.
2. **Kunci Penyimpanan Draf `localStorage` Bercampur (*Draft Collision*)**:
   - Fungsi `getDraftStorageKey` menggunakan *fallback* `'default'` atau `'Belum tersedia'`. Jika satu mahasiswa menyimpan draf biodata, draf tersebut secara keliru dimuat oleh mahasiswa lain yang login berikutnya.
3. **Pemotongan Nilai NIM pada `App.tsx`**:
   - Pada `handleLoginSuccess`, terdapat aturan `/^\d{8,10}$/.test(nim)` yang secara keliru mengosongkan nilai `finalNim = ''` untuk seluruh nomor 8–10 digit (termasuk NIM resmi mahasiswa dari SSO SIAKAD).
   - Akibatnya, mahasiswa yang masuk lewat jalur SSO atau mahasiswa PMB dengan NIM resmi mendapati kolom NIM di formulir menjadi kosong (*"Belum tersedia"*).
4. **Kehilangan Metadata Akademik saat Transmisi Login**:
   - Callback `onLoginSuccess(role, nim, nama, notice, scenario)` hanya mengirimkan string nama dan nomor identitas dasar tanpa membawa objek data akademik lengkap (Program Studi, Fakultas, Tempat/Tanggal Lahir, Jenis Kelamin, Status Beasiswa KIP, No. HP, Email, dan Alamat asal).

---

## 2. Rencana Perubahan Arsitektur & Antarmuka

Mengacu pada prinsip desain *Universal Frontend Design Constitution* (integritas fungsional, hierarki informasi yang jelas, dan penolakan data tiruan):

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│               ALUR KONTINUITAS DATA AKADEMIK LOGIN KE VALIDASI IDENTITAS               │
└────────────────────────────────────────────────────────────────────────────────────────┘

 [HALAMAN LOGIN: LoginDualTab.tsx]
  • Pencarian Nama / No. PMB (SIMABA) atau Input NIM (SSO SIDARA)
  • Pengambilan Record Akademik Lengkap:
    (nama, no_pmb, nim, nik, prodi, fakultas, gender, phone, email, alamat, jalur KIP)
                   │
                   ▼
 [ORCHESTRATOR APP: App.tsx (handleLoginSuccess)]
  • Rekonstruksi MabaProfile utuh & spesifik untuk siswa terpilih
  • Pertahankan NIM resmi (tanpa pemotongan regex salah)
  • Inisialisasi Invoice & Billing sesuai kategori beasiswa (KIP vs Reguler)
  • Injeksi ke state mabaProfile
                   │
                   ▼
 [FORMULIR VALIDASI IDENTITAS: MabaDashboard.tsx (Tahap 1)]
  • useEffect Reaktif: Sync otomatis saat initialProfile berubah
  • Isolasi Draf: mabaProfileDraft_{nomor_pendaftaran}
  • Tampilan Data Akademik Terkunci & Terverifikasi:
    - Nama Lengkap (Sesuai SIMABA/SIDARA)
    - Nomor Pendaftaran PMB & NIM Resmi
    - NIK KTP & Tanggal Lahir Terkalibrasi
    - Program Studi & Fakultas Terkait
    - Kategori Pembayaran (Reguler / KIP-Kuliah)
```

---

## 3. Rincian Modifikasi Berkas

### A. `src/types/asrama.ts`
- Perluas antarmuka `LoginDualTabProps.onLoginSuccess` agar menerima payload opsional `studentProfileData?: Partial<MabaProfile>`.

### B. `src/components/auth/LoginDualTab.tsx`
- **Pendaftaran PMB**: Saat calon mahasiswa memilih hasil pencarian nama atau melakukan *submit*, bangun payload akademik lengkap (`nama`, `noPmb`, `nik`, `prodi`, `fakultas`, `jenisKelamin`, `noHpWa`, `email`, `alamat`, `isKipStudent`, `tanggalLahirFormatted`) dan kirimkan langsung via `onLoginSuccess`.
- **Login SSO SIAKAD**: Saat mahasiswa SSO masuk dan dialihkan ke pendaftaran, lakukan pencocokan ke `effectiveSiakad` atau `INITIAL_SIMABA_STUDENTS` dan kirimkan data akademik resminya (termasuk NIM 10 digit, Prodi, Fakultas, dan Email).

### C. `src/App.tsx`
- Modifikasi `handleLoginSuccess`:
  - Tangkap payload profil akademik langsung dari login.
  - Perbaiki evaluasi NIM: Jika input adalah nomor mahasiswa (misal: 10 digit NIM SSO atau nomor pendaftaran), petakan secara akurat:
    - `noPmb`: Nomor Pendaftaran PMB siswa.
    - `nim`: NIM resmi jika sudah diterbitkan, atau string kosong jika calon mahasiswa murni.
  - Set `mabaProfile` dengan seluruh data akademik siswa terpilih (Nama, Prodi, Fakultas, Angkatan, NIK, Gender, No HP, Alamat).
  - Sinkronkan `invoices[0]` dengan nama dan status KIP/Reguler siswa.

### D. `src/components/maba/MabaDashboard.tsx`
- **Reaktifitas Prop `initialProfile`**:
  Tambahkan `useEffect` yang memantau perubahan `initialProfile`:
  ```tsx
  React.useEffect(() => {
    const draftKey = getDraftStorageKey(initialProfile.nim, initialProfile.noPmb);
    const saved = localStorage.getItem(draftKey);
    if (saved && (!initialProfile.kycSubmitted || initialProfile.correctionStatus === 'unlocked')) {
      try {
        const parsed = JSON.parse(saved);
        const draftProfile = parsed.profile ? parsed.profile : parsed;
        setProfile({ ...initialProfile, ...draftProfile });
        return;
      } catch {}
    }
    setProfile(initialProfile);
  }, [initialProfile.noPmb, initialProfile.nim, initialProfile.nama]);
  ```
- **Isolasi Draf per Akun (`getDraftStorageKey`)**:
  Pastikan setiap akun memiliki kunci draf terpisah berbasis `noPmb` atau `nim` spesifik (`mabaProfileDraft_${cleanId}`). Cegah penggunaan kunci global yang dapat membocorkan draf antar akun pengujian.

---

## 4. Rencana Verifikasi & Pengujian Kasus Nyata

1. **Kasus Uji 1 (Mahasiswa Reguler SIMABA - Grace Marlin)**:
   - Login via pencarian nama "Grace Marlin" (`260108001`).
   - Verifikasi di Tahap 1:
     - Nama Lengkap: `GRACE MARLIN TELAUMBANUA`
     - No. PMB: `260108001`
     - Program Studi: `S1 Gizi`
     - Fakultas: `Fakultas Ilmu Kesehatan`
     - Status: `Reguler`

2. **Kasus Uji 2 (Mahasiswa Hukum - Alvin Hutasoit)**:
   - Login via pencarian nama "Alvin" (`260727002`).
   - Verifikasi di Tahap 1:
     - Nama Lengkap: `Alvin Octavianus Hasiholan Hutasoit`
     - No. PMB: `260727002`
     - Program Studi: `S1 Hukum`
     - Fakultas: `Fakultas Hukum`

3. **Kasus Uji 3 (Penerima Beasiswa KIP - Maza Aditiya)**:
   - Login via nama "Maza" (`250830002`).
   - Verifikasi di Tahap 1:
     - Nama Lengkap: `MAZA ADITIYA`
     - Status Kategori: `KIP-Kuliah` (Badge KIP otomatis terpasang)
     - Nomor KIP: `1125102647611790758`

4. **Kasus Uji 4 (Login SSO SIAKAD - Ahmad Zaky / Nurhaliza)**:
   - Login via SSO NIM `2240101088`.
   - Verifikasi di Tahap 1:
     - NIM: `2240101088` (tidak terpotong kosong)
     - Nama: `Ahmad Zaky`
     - Program Studi: `S1 Teknik Informatika`

5. **Kompilasi & Linting**:
   - Jalankan `npm run lint` (`tsc --noEmit`) dan `compile_applet` untuk memastikan nol error tipe atau sintaks.
