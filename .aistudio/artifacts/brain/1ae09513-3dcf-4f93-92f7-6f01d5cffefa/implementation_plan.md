# Rencana Implementasi: Integrasi Dual Database SIMABA, Live Search Nama Maba & Deteksi Dini NIM SIAKAD di Laragon

Rencana ini mengonfigurasikan arsitektur sistem Asrama UBT untuk membaca data calon mahasiswa baru langsung dari basis data **SIMABA (`u540633926_simaba` - tabel `pendaftaranmahasiswa`)** melalui koneksi dual database di Laravel, melengkapi halaman login dengan **fitur pencarian otomatis nomor pendaftaran langsung via nama calon mahasiswa dengan saran dropdown interaktif**, mempertahankan format **`DD/MM/YYYY`** pada UX tanggal lahir, serta memfungsikan **API SIAKAD/SIDARA murni untuk deteksi dini (*early-detection*) status penerbitan NIM resmi** secara otomatis di latar belakang saat login.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> Keputusan dan preferensi pengguna yang telah dikonfirmasi dan diperbarui:
> - **Integrasi Database SIMABA**: Menggunakan **Konfigurasi Dual Database di Laravel** (`config/database.php` dengan koneksi `mysql` untuk operasional asrama dan koneksi `simaba` untuk membaca database `u540633926_simaba`).
> - **Fitur Pencarian Nama Mahasiswa (BARU)**: Menyediakan **pencarian otomatis langsung (*live search auto-suggest*)** dengan saran dropdown saat calon mahasiswa mengetik nama pada kolom input atau tombol bantuan, untuk memudahkan mahasiswa yang tidak mengingat/menyimpan nomor pendaftarannya.
> - **Informasi pada Kartu Saran Dropdown**: Menampilkan **Nama Lengkap Mahasiswa**, **Nomor Pendaftaran PMB**, **Program Studi**, serta **Tombol Pilih** (klik langsung mengisi nomor pendaftaran dan memindahkan fokus ke tanggal lahir).
> - **Format Tanggal Lahir pada UX**: Tetap menggunakan format **`DD/MM/YYYY` (Hari/Bulan/Tahun)** pada antarmuka formulir login seperti desain saat ini. Sistem secara otomatis mengonversi input `DD/MM/YYYY` menjadi `YYYY-MM-DD` saat mencocokkan ke database SQL SIMABA.
> - **Peran API SIAKAD/SIDARA**: Berjalan **otomatis di latar belakang saat Maba berhasil login** untuk mendeteksi apakah mahasiswa yang bersangkutan sudah diterbitkan NIM resminya oleh universitas (transisi dari status *Booking* ke *Penyewa Definitif*).

---

## 1. Overview & Core Concept

### A. Tiga Pilar Arsitektur Terintegrasi:
1. **SIMABA (`u540633926_simaba`) — Otoritas PMB & Identitas Awal**:
   - Sumber primer autentikasi awal calon mahasiswa: membaca tabel `pendaftaranmahasiswa` (didukung tabel `programstudi` untuk nama prodi resmi).
   - Menyediakan data nama, nomor pendaftaran, NIK, tanggal lahir, jenis kelamin, jalur KIP/Non-KIP, kontak, dan alamat.
2. **PORTAL ASRAMA (`asrama_ubt_db` / `u540633926_asrama`) — Operasional Asrama**:
   - Mengelola pemesanan kamar (*room booking*), kalkulasi tagihan kode unik 3 digit, penyimpanan bukti transfer di tabel penampungan sementara (*staging*), verifikasi admin keuangan, promosi ke buku besar master, kontrak digital OTP WhatsApp, dan check-in e-Ticket BASTK.
3. **API SIAKAD / SIDARA — Otoritas Akademik & NIM**:
   - Dijalankan secara otomatis di latar belakang saat login Maba untuk mendeteksi: *"Apakah calon mahasiswa dengan NIK / No. Pendaftaran ini sudah memiliki NIM resmi?"*
   - Jika **Sudah**: Mengaktifkan alur transisi NIM resmi dan membuka akun SSO.
   - Jika **Belum**: Calon mahasiswa tetap berstatus pendaftar awal (*Booking*) yang sah untuk memilih kamar dan memproses pembayaran asrama.

---

## 2. User Experience & Visual Design

### Alur Pencarian Nama & Login MABA:
```
┌─────────────────────────────────────────────────────────────────────────────┐
│                 ALUR LOGIN MABA DENGAN LIVE SEARCH NAMA                     │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. INPUT NOMOR PENDAFTARAN ATAU KETIK NAMA MAHASISWA                        │
│    • Calon mahasiswa mengetik nomor pendaftaran (misal: 260108001)           │
│      ATAU mengetik nama (misal: "Grace", "Jenny", "Maza", "Rizka")          │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼ (Jika mengetik nama >= 2 karakter)
┌─────────────────────────────────────────────────────────────────────────────┐
│ 2. LIVE SUGGESTION DROPDOWN (Saran Otomatis SIMABA)                         │
│    ┌─────────────────────────────────────────────────────────────────────┐  │
│    │ GRACE MARLIN TELAUMBANUA                               [PILIH]      │  │
│    │ No. Pendaftaran: 260108001  •  D III Keperawatan                    │  │
│    ├─────────────────────────────────────────────────────────────────────┤  │
│    │ Jenny Agustina Shellyana                               [PILIH]      │  │
│    │ No. Pendaftaran: 250830001  •  D III Keperawatan                    │  │
│    └─────────────────────────────────────────────────────────────────────┘  │
│    • Klik kartu atau tombol [PILIH]                                         │
│    • Nomor Pendaftaran otomatis terisi ke form (misal: 260108001)           │
│    • Dropdown otomatis tertutup & fokus kursor pindah ke Tanggal Lahir      │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 3. INPUT TANGGAL LAHIR (FORMAT UX: DD/MM/YYYY)                              │
│    • Mahasiswa menginput tanggal lahir: 12/02/2008                          │
│    • Sistem mengonversi menjadi '2008-02-12' untuk query database SIMABA    │
│    • Klik "Masuk Portal Pendaftaran"                                        │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 4. AUTENTIKASI SIMABA & BACKGROUND DETEKSI DINI NIM SIAKAD                  │
│    • Query: pendaftaranmahasiswa WHERE nomor_pendaftaran = '260108001'       │
│             AND tanggal_lahir = '2008-02-12' AND status = 1                 │
│    • Background API SIAKAD UBT cek status penomoran NIM resmi               │
│    • Buka Dashboard Mahasiswa Baru dengan data profil terisi otomatis       │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Detail Antarmuka (UX Design):
- **Live Search Dropdown**:
  - Tampil tepat di bawah kolom Nomor Pendaftaran saat pengguna mengetik huruf (bukan format digit nomor).
  - Dilengkapi *debounce* 200ms untuk performa cepat dan responsif.
  - Kartu saran dirancang bersih dengan font Plus Jakarta Sans: nama mahasiswa tebal (*bold*), lencana nomor pendaftaran berlatar abu-abu netral, nama program studi berwarna biru/teal, dan tombol "Pilih" yang ramah sentuhan layar sentuh mobile/tablet ($\ge 44\text{px}$).
- **Form Tanggal Lahir (DD/MM/YYYY)**:
  - Input teks terformat dengan pembatas otomatis `/` (`DD/MM/YYYY`) dan *placeholder* `Contoh: 12/02/2008`.
  - Dilengkapi helper text: *"Masukkan tanggal lahir sesuai data saat pendaftaran PMB"*.
- **Banner Status Deteksi Dini NIM**:
  - Banner hijau jika NIM resmi telah terbit di SIAKAD.
  - Banner biru/teal jika masih berstatus calon mahasiswa baru (*Booking* asrama).

---

## 3. Key Product Decisions & Trade-Offs

- **Live Suggestion Dropdown Terintegrasi pada Kolom Input Utama**:
  - *Pendekatan*: Menggabungkan kemampuan input nomor registrasi langsung dan pencarian nama pada satu kontrol input intuitif, dilengkapi dropdown saran yang langsung dapat diklik.
  - *Alasan*: Memberikan pengalaman pengguna yang sangat mulus tanpa mengharuskan pengguna membuka popup/modal terpisah hanya untuk mencari nomor pendaftarannya.
- **Tampilan Tanggal Lahir `DD/MM/YYYY` vs Penyimpanan SQL `YYYY-MM-DD`**:
  - *Pendekatan*: Menjaga kenyamanan pengguna lokal Indonesia (format tanggal/bulan/tahun), dengan konversi otomatis dua arah (*two-way parser*) saat pengiriman form ke query SQL `WHERE tanggal_lahir = 'YYYY-MM-DD'`.
  - *Alasan*: Menghindari frustrasi pengguna yang terbiasa mengetik hari terlebih dahulu daripada tahun.
- **Konfigurasi Dual Database di Laravel**:
  - *Pendekatan*: Mengonfigurasikan koneksi `simaba` di `config/database.php` membaca database `u540633926_simaba` di port MySQL yang sama (3306), sedangkan koneksi `mysql` tetap mengelola `asrama_ubt_db`.
  - *Alasan*: Mengeliminasi kebutuhan sinkronisasi manual atau duplikasi tabel.

---

## 4. Technical Architecture & Data Strategy

### A. Endpoint API Live Search Nama Mahasiswa (`routes/web.php`)
```php
// routes/web.php
Route::get('/api/simaba/search-student', function (\Illuminate\Http\Request $request) {
    $q = trim($request->input('q', ''));
    if (strlen($q) < 2) {
        return response()->json([]);
    }

    $results = \App\Models\SimabaPendaftaran::on('simaba')
        ->where('nama_mahasiswa', 'LIKE', "%{$q}%")
        ->orWhere('nomor_pendaftaran', 'LIKE', "%{$q}%")
        ->take(10)
        ->get(['id', 'nomor_pendaftaran', 'nama_mahasiswa', 'program_studi', 'jenis_mahasiswa', 'tanggal_lahir']);

    return response()->json($results);
});
```

### B. Helper Parser Tanggal Lahir pada Model Eloquent
```php
// app/Models/SimabaPendaftaran.php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SimabaPendaftaran extends Model
{
    protected $connection = 'simaba';
    protected $table = 'pendaftaranmahasiswa';
    protected $guarded = ['id'];

    public static function authenticate(string $noPendaftaran, string $birthDateInput)
    {
        // Konversi dari DD/MM/YYYY ke YYYY-MM-DD jika diperlukan
        if (preg_match('/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/', $birthDateInput, $matches)) {
            $day = str_pad($matches[1], 2, '0', STR_PAD_LEFT);
            $month = str_pad($matches[2], 2, '0', STR_PAD_LEFT);
            $year = $matches[3];
            $formattedDate = "{$year}-{$month}-{$day}";
        } else {
            $formattedDate = $birthDateInput;
        }

        return self::where('nomor_pendaftaran', $noPendaftaran)
            ->where('tanggal_lahir', $formattedDate)
            ->first();
    }
}
```

### C. Pemetaan Program Studi SIMABA (Database `u540633926_simaba`):
- `6`: S1 Ilmu Keperawatan
- `7`: S1 Kesehatan Masyarakat
- `8`: S1 Hukum
- `9`: S1 Manajemen
- `10`: S1 Informatika
- `11`: D III Keperawatan
- `12`: D III Kebidanan

### D. Rincian Berkas yang Akan Dibuat / Diperbarui:
1. **`app/Models/SimabaPendaftaran.php`**: Model Eloquent terhubung ke database `simaba` dengan fungsi `authenticate()` dan pembantu relasi program studi.
2. **`config/database.php`**: Penambahan konfigurasi koneksi `simaba`.
3. **`.env.example`**: Penambahan variabel `DB_SIMABA_*`.
4. **`database/seeders/SimabaDatabaseSeeder.php`**: Seeder penyedia data `pendaftaranmahasiswa` dari dump SQL nyata SIMABA lengkap dengan relasi program studi.
5. **`laragon-setup.bat` & `laragon-setup.sh`**: Pembuatan database `u540633926_simaba` dan eksekusi seeder otomatis.
6. **`src/components/auth/LoginDualTab.tsx`**: Implementasi komponen Live Search Auto-Suggest Nama Mahasiswa, format tanggal lahir `DD/MM/YYYY`, dan deteksi dini penerbitan NIM.
7. **`src/data/initialData.ts`**: Sinkronisasi dataset calon mahasiswa dengan data dump nyata SIMABA (Jenny Agustina, Maza Aditiya, Grace Marlin, Rizka Mutiara, dkk).
8. **`docs/TESTING_DATA_REAL_LARAGON.md`**: Pembaruan panduan teknis dengan dokumentasi fitur live search nama dan format tanggal lahir.
