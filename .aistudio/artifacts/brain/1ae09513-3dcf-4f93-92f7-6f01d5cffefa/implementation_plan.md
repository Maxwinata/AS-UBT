# Rencana Implementasi: Redesain Responsif Modal Verifikasi OTP & Default Halaman Login Awal

Rencana ini mengatasi masalah tombol "Sahkan Kontrak Elektronik" yang terpotong pada tampilan mobile dan tablet melalui pendekatan tata letak **Sticky Bottom Bar** dengan **Preview Chat WhatsApp Ringkas**, serta mengatur halaman awal aplikasi agar secara default membuka **Halaman Login** saat URL diakses untuk alur simulasi yang realistis.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> Keputusan dan preferensi pengguna yang telah dikonfirmasi:
> - **Gaya Tampilan Mobile/Tablet**: **Sticky Bottom Action Bar** yang terkunci di bagian bawah viewport dipadukan dengan **Preview Chat WhatsApp Ringkas** di area atas, sehingga tombol pengesahan tidak akan pernah terpotong atau terdorong ke luar layar.
> - **Simulator WhatsApp Desktop vs Mobile**: Pada layar desktop (`md:` ke atas), simulator smartphone WhatsApp 3D tetap dipertahankan. Pada layar mobile/tablet, frame ponsel 520px digantikan dengan kartu pesan masuk WhatsApp yang ramping dan efisien.
> - **Tata Letak Tombol Isi Otomatis**: Tombol bantuan pengisian cepat ditempatkan secara **individual per kolom input** (`Isi 123456` untuk OTP Mahasiswa dan `Isi 654321` untuk OTP Wali).
> - **Halaman Awal Default**: Mengubah status awal `isLoggedIn` menjadi `false`, sehingga saat pengguna pertama kali membuka URL aplikasi, mereka diarahkan ke **Halaman Login Dual-Tab (Mahasiswa PMB / SSO SIDARA / Admin)** terlebih dahulu.

---

## 1. Overview & Core Concept

- **Problem Statement**:
  1. Pada modal verifikasi OTP (`showWaSimulator`), frame smartphone mockup WhatsApp memiliki tinggi tetap `520px` dan modal tidak memiliki pembatasan tinggi fleksibel (`max-h`) serta scrolling vertikal internal. Akibatnya, pada layar mobile dan tablet (portrait maupun landscape), modal memanjang melebihi tinggi layar sehingga tombol **"Sahkan Kontrak Elektronik (F-19 & F-02)"** terpotong di bagian bawah dan tidak dapat ditekan.
  2. Saat URL dibuka pada lingkungan simulasi, aplikasi langsung mendarat di Tahap 1 Formulir Mahasiswa Baru tanpa melalui proses autentikasi login awal, sehingga pengguna tidak dapat menguji alur login PMB, SSO SIDARA, maupun pergantian peran sejak awal.
- **Solusi**:
  1. Merombak modal verifikasi OTP WhatsApp menjadi modal responsif dengan arsitektur **Fixed Header + Scrollable Content + Sticky Action Footer**.
  2. Menyesuaikan tampilan simulasi WhatsApp pada mobile: chat bubble ringkas di bagian atas dengan tombol salin/isi cepat, sementara form input OTP tetap lega dengan tombol aksi utama selalu terlihat di area *natural thumb reach*.
  3. Mengubah inisialisasi state `isLoggedIn` pada `App.tsx` menjadi `false` agar alur dimulai dari halaman login.

---

## 2. User Experience & Visual Design

### A. Alur Interaksi Pengesahan Kontrak (Step 4 Modal OTP)

1. **Pemicu**: Pengguna menekan tombol "Verifikasi OTP WhatsApp" atau "Sahkan Kontrak" pada Tahap 4 (Kontrak Digital F-19 & F-02).
2. **Tampilan Desktop (`lg:` / `md:`)**:
   - Modal dua kolom proporsional (kiri: Simulator Smartphone WhatsApp, kanan: Formulir Input OTP & Pengesahan).
   - Scrollbar internal jika resolusi monitor di bawah standar, memastikan tombol submit selalu berada dalam batas jendela dialog.
3. **Tampilan Mobile & Tablet (`< md`)**:
   - **Header Dialog**: Ikon gembok keamanan digital, judul ringkas "Verifikasi OTP", dan tombol tutup silang (`X`) berukuran touch target $\ge 44\text{px}$.
   - **Area Preview WhatsApp Ringkas**: Banner hijau WhatsApp berikon `MessageSquare` yang menampilkan gelembung chat resmi Asrama UBT dengan kode OTP (123456 & 654321) secara langsung tanpa memakan ruang vertikal berlebih.
   - **Area Input OTP (Scrollable)**: Dua blok input 6 digit dengan spasi huruf lebar (`tracking-[0.5em]`), angka monospaced tebal, dan tombol aksi cepat `Isi 123456` serta `Isi 654321` tepat di atas masing-masing kolom.
   - **Sticky Bottom Action Bar**: Bilah aksi di bagian bawah modal berlatar putih dengan bayangan elevasi halus (`border-t border-slate-200 bg-white/95 backdrop-blur-md`). Tombol **"Sahkan Kontrak Elektronik (F-19 & F-02)"** selalu menempel di bagian bawah layar dan selalu siap diklik setelah OTP terisi lengkap.

### B. Alur Halaman Awal (Login Gateway)

1. Pengguna membuka URL aplikasi.
2. Aplikasi menampilkan **Portal Login Dual-Tab**:
   - Tab 1: Login Mahasiswa Baru (Nomor PMB / Registrasi).
   - Tab 2: Single Sign-On (SSO SIDARA) untuk Mahasiswa Eksisting / Pra-Registrasi.
   - Tombol Role Switcher Cepat (Bypass Demo/Dev) di pojok untuk kemudahan pengujian staf.
3. Setelah login berhasil, pengguna masuk ke Dasbor Mahasiswa / Admin sesuai kredensial yang dipilih.

---

## 3. Key Product Decisions & Trade-Offs

- **Trade-Off Menghilangkan Frame Smartphone di Mobile**:
  - *Pendekatan Dipilih*: Menyembunyikan frame fisik smartphone (bezel hitam tebal, notch, padding ganda) pada layar mobile/tablet, dan menggantikannya dengan komponen kartu pesan chat WhatsApp native yang responsif.
  - *Alasan*: Frame fisik ponsel di dalam layar ponsel nyata adalah redundan visual (*skeuomorphic nesting*) yang menghabiskan 520px ruang vertikal berharga. Menggantinya dengan kartu chat ringkas menghemat ruang sebesar 65%, memastikan kolom input dan tombol aksi muat dengan nyaman.
- **Penerapan Sticky Bottom Bar**:
  - *Pendekatan Dipilih*: Memisahkan tombol submit dari alur scroll formulir, menempatkannya di kontainer `sticky bottom-0`.
  - *Alasan*: Memastikan pengguna tidak perlu mencari atau menebak keberadaan tombol pengesahan, serta memenuhi prinsip ergonomi *Natural Thumb Zone* (area 40% bawah layar ponsel).

---

## 4. Technical Architecture & Component Structure

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           ALUR NAVIGASI & DIALOG                            │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
            ┌──────────────────────────┴──────────────────────────┐
            ▼                                                     ▼
┌──────────────────────────────────────┐  ┌──────────────────────────────────┐
│   URL DIBUKA (isLoggedIn: false)     │  │      STEP 4: KONTRAK DIGITAL     │
│ • Menampilkan <LoginDualTab />       │  │ • Klik "Verifikasi OTP WhatsApp" │
│ • Pilihan Login PMB / SSO / Admin    │  └────────────────┬─────────────────┘
└──────────────────┬───────────────────┘                   │
                   │ (Login Sukses)                        ▼
                   ▼                      ┌──────────────────────────────────┐
┌──────────────────────────────────────┐  │     MODAL VERIFIKASI OTP BARU    │
│    MabaDashboard (Tahap 1 s/d 6)     │  │  (Responsive Max-Height + Scroll)│
└──────────────────────────────────────┘  └────────────────┬─────────────────┘
                                                           │
                      ┌────────────────────────────────────┴────────────────────────────────────┐
                      ▼ (Mobile & Tablet < md)                                                  ▼ (Desktop >= md)
┌──────────────────────────────────────────────────────────┐  ┌─────────────────────────────────────────────────────────┐
│ • Banner WhatsApp Ringkas (Pesan Mahasiswa & Wali)       │  │ • Kolom Kiri: Simulator Smartphone WhatsApp Realistis   │
│ • Scrollable Form Body (Input OTP + Tombol Isi Cepat)    │  │ • Kolom Kanan: Form Input OTP + Tombol Bantuan          │
│ • STICKY BOTTOM BAR: [Sahkan Kontrak Elektronik]         │  │ • STICKY BOTTOM BAR: [Sahkan Kontrak Elektronik]        │
└──────────────────────────────────────────────────────────┘  └─────────────────────────────────────────────────────────┘
```

### Rincian Perubahan Kode:

1. **`src/App.tsx`**:
   - Mengubah `const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);` menjadi `useState<boolean>(false);` agar saat URL dibuka pertama kali, aplikasi menampilkan halaman login terlebih dahulu.
2. **`src/components/maba/MabaDashboard.tsx`**:
   - Merestrukturisasi modal `showWaSimulator`:
     - Container luar: `fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm`.
     - Container dialog: `w-full max-w-3xl max-h-[92vh] sm:max-h-[88vh] bg-white rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden relative`.
     - Layout adaptif: Sembunyikan frame smartphone tebal pada layar `< md` (`hidden md:flex md:w-1/2`), ganti dengan banner chat bubble ringkas di bagian atas form pada mobile.
     - Pembagian vertikal: Area konten formulir diberi `flex-1 overflow-y-auto px-4 py-4 sm:p-6 md:p-8 space-y-4`.
     - Sticky Footer: Membungkus tombol `"Sahkan Kontrak Elektronik"` di dalam `sticky bottom-0 bg-white/95 backdrop-blur-xs border-t border-slate-200 p-4 sm:p-5 mt-auto z-10` dengan touch target $\ge 48\text{px}$.
     - Tombol bantuan input: Menjaga tombol individual `Isi 123456` dan `Isi 654321` dengan ukuran sentuh yang ramah jari.
