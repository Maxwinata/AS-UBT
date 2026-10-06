# Panduan Lengkap Pengembangan Sistem di Habitat Laravel (Laragon + Inertia.js + React)

Dokumen ini disusun untuk memastikan bahwa **seluruh proses pengembangan, rancangan basis data, logika bisnis, dan purwarupa React kita saat ini dapat langsung dilanjutkan dengan mulus di habitat pengembangan Laravel (Laragon / MySQL / PHP 8.2+ / Inertia.js / React 18)** tanpa ada deviasi atau data yang terputus.

---

## 1. Ikhtisar Arsitektur (Turnkey Migration)

Sistem Web Portal Asrama UBT (**SI-GABUNG 54**) menggunakan pendekatan **Inertia.js Monolith**. Artinya:
- **Routing & Database**: Ditangani sepenuhnya oleh Laravel (Eloquent ORM, Migrations, Policies, Queues).
- **Frontend View**: Seluruh komponen React kita (`src/components/`, `src/types/`, `src/data/`) langsung dipindahkan ke dalam folder `resources/js/` di Laravel.
- **Penyuntikan Data**: Laravel Controller menyuntikkan data langsung sebagai **Props** ke komponen React tanpa perlu lagi membuat REST API endpoint manual dengan banyak loading spinner.

---

## 2. Langkah Setup di Lingkungan Laragon (Step-by-Step)

### Langkah 1: Buat Project Laravel Baru
Buka **Terminal Laragon** (klik tombol `Terminal` di Laragon) dan jalankan:
```bash
cd C:\laragon\www
composer create-project laravel/laravel asrama-ubt
cd asrama-ubt
```

### Langkah 2: Konfigurasi Database di HeidiSQL / phpMyAdmin
1. Buka database manager di Laragon (`http://localhost/phpmyadmin` atau HeidiSQL).
2. Buat database baru: `asrama_ubt_db` (Collation: `utf8mb4_unicode_ci`).
3. Sesuaikan file `.env` di root project `asrama-ubt`:
```env
APP_NAME="Portal SI-GABUNG 54"
APP_ENV=local
APP_KEY=base64:3m8k1X9ZpL2a4vQ7wR5tY8uI0oP1sD3fG5hJ7kL9mN0=
APP_DEBUG=true
APP_TIMEZONE="Asia/Jakarta"
APP_URL=http://asrama-ubt.test

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=asrama_ubt_db
DB_USERNAME=root
DB_PASSWORD=

# PRIVATE STORAGE UNTUK DOKUMEN KYC (KTP & SELFIE)
KYC_STORAGE_DISK=private_kyc
KYC_RETENTION_DAYS=60
KYC_SIGNED_URL_TTL_MINUTES=15

# WHATSAPP GATEWAY (UNTUK OTP KONTRAK & NOTIFIKASI TIKET)
WA_GATEWAY_PROVIDER=fonnte
WA_GATEWAY_URL=https://api.fonnte.com/send
WA_GATEWAY_TOKEN=your_fonnte_token_here
```

### Langkah 3: Instalasi Laravel Breeze (Inertia + React Stack)
Laravel Breeze menyediakan scaffolding resmi Inertia + React + Tailwind CSS:
```bash
composer require laravel/breeze --dev
php artisan breeze:install react
npm install
npm run build
```

### Langkah 4: Migrasi Aset Frontend
Salin folder dari project purwarupa ini ke project Laravel:
1. `src/components/` -> `resources/js/Components/`
2. `src/types/` -> `resources/js/types/`
3. `src/data/` -> `resources/js/data/`

---

## 3. Database Schema & Migration (Tersinkronisasi Penuh)

Buat file migration tunggal atau terpisah:
```bash
php artisan make:migration create_asrama_ubt_master_tables
```

Isi migration mencakup seluruh tabel yang telah dikalibrasi:
1. **`users`**: Multi-role (`maba`, `eksisting`, `maintenance_ticketing`, `admin_keuangan`, `admin_asrama`, `super_admin`), status KIP, data diri, kontak darurat.
2. **`ekyc_records` & `kyc_audit_logs`**: Mendukung riwayat versi (*versioning*) dan audit trail perubahan data.
3. **`payment_schemes`**: Pengaturan skema cicilan dengan kolom kunci:
   - `allow_deposit_installment` (BOOLEAN DEFAULT `false`) -> **Secara default opsi cicilan deposit berstatus NONAKTIF (OFF)**, dan dapat diaktifkan sewaktu-waktu oleh Admin Keuangan.
4. **`tariffs`**: Master referensi tarif biaya sewa, deposit, perlengkapan awal, dan denda.
5. **`rooms` & `room_reservations`**: Master kamar (Gedung A & B) dan penguncian kuota sementara (*concurrency lock*) saat Maba memilih kamar.
6. **`invoices`**: Tagihan pendaftaran dengan kode unik 3 digit, pemisahan termin deposit, durasi sewa, dan status pelunasan.
7. **`digital_contracts` & `bastk_records`**: Master Kontrak Kolektif (Pasal 39 Peraturan Asrama & UU ITE Pasal 11), OTP WhatsApp, persetujuan wali, dan inspeksi inventaris BASTK.
8. **`maintenance_tickets`**: Tiket pelaporan perbaikan sarana/prasarana dengan:
   - Klasifikasi kerusakan (`category`)
   - 4 Level urgensi (`urgency`: low, medium, high, emergency)
   - **Selector Prioritas Tiket (`priority`: Low, Medium, High)** dengan pewarnaan visual (Badge Red/Amber/Slate)
   - Riwayat penanganan teknisi dan foto bukti resolusi.
9. **`delinquencies`**: Mesin penegakan tunggakan sewa (Toleransi 5 hari s/d 6 Sept, auto-debet deposit & toleransi 5 hari top-up s/d 11 Sept, denda Rp 500.000 & pemutusan kontrak jika lewat 11 Sept tanpa top-up deposit).
10. **`deposit_refunds` & `checkout_inspections`**: Perhitungan refund deposit akhir masa tinggal berdasarkan prioritas potongan 5 tingkat (P1 s.d P5).

Jalankan migrasi di terminal Laragon:
```bash
php artisan migrate:fresh --seed
```

---

## 4. Peringatan Krusial Manajemen KYC Storage (Pedoman Wajib)

Sesuai dengan ketentuan arsitektur keamanan:
Saat mengintegrasikan penyimpanan fisik untuk file KYC (KTP & Foto Selfie), pengembang Laravel **WAJIB** menerapkan 3 prinsip berikut:

1. **Versioning over Overwriting (Krusial untuk Audit Trail)**:
   - **JANGAN PERNAH** menimpa (*overwrite*) file KTP/Selfie lama ketika mahasiswa mengajukan koreksi data!
   - Gunakan nama file unik berbasis timestamp/UUID: `ktp_{nim}_v{version}_{timestamp}.enc`.
   - *Alasan*: Fitur Audit Trail dan log pengawasan admin membutuhkan akses ke foto lama untuk memverifikasi perubahan riwayat.

2. **Security (Private Disk & Signed URLs)**:
   - File KTP & Selfie **DILARANG KERAS** disimpan di folder `public/` atau dapat diakses langsung via URL statis publik.
   - Simpan pada disk private: `storage/app/private/kyc/` atau Private Cloud Bucket (AWS S3 / Google Cloud Storage Private Bucket).
   - Akses untuk Admin Asrama/Keuangan untuk melihat file harus melalui **Temporary Signed URL** berdurasi pendek (maksimal 15 menit):
     ```php
     URL::temporarySignedRoute('admin.kyc.view', now()->addMinutes(15), ['recordId' => $id]);
     ```

3. **Garbage Collection (Siklus Pembersihan Otomatis)**:
   - Buat perintah konsol terjadwal (Command) untuk membersihkan file KYC lama yang sudah tidak aktif setelah **30-60 hari**:
     ```bash
     php artisan kyc:prune-orphans
     ```
   - Ini mencegah pembengkakan biaya media penyimpanan (*storage cost*).

---

## 5. Implementasi Kontrak Inertia Controller

### A. Dashboard Maba (`app/Http/Controllers/Maba/DashboardController.php`)
```php
public function index(Request $request)
{
    $user = $request->user();
    return Inertia::render('Maba/Dashboard', [
        'profile' => $user->toMabaProfileArray(),
        'invoice' => Invoice::where('user_id', $user->id)->latest()->first(),
        'tariffs' => Tariff::where('is_active', true)->get(),
        'paymentSchemes' => PaymentScheme::all(), // allow_deposit_installment = false secara default
        'room' => Room::find($user->current_room_id),
        'contract' => DigitalContract::where('user_id', $user->id)->first(),
    ]);
}
```

### B. Admin Keuangan Toggle Cicilan Deposit (`AdminKeuanganController.php`)
```php
public function toggleDepositInstallment(Request $request, $id)
{
    $scheme = PaymentScheme::findOrFail($id);
    $scheme->update(['allow_deposit_installment' => $request->boolean('allow')]);
    return back()->with('success', 'Kebijakan cicilan deposit berhasil diperbarui.');
}
```

### C. Maintenance Ticketing dengan Priority Selector (`MaintenanceTicketController.php`)
```php
public function store(Request $request)
{
    $validated = $request->validate([
        'title' => 'required|string',
        'category' => 'required',
        'urgency' => 'required|in:low,medium,high,emergency',
        'priority' => 'required|in:Low,Medium,High', // Nilai selector baru
        'description' => 'required',
        'location_building' => 'required',
        'location_room' => 'required',
    ]);

    $ticket = MaintenanceTicket::create([
        'ticket_code' => 'TKT-' . date('Y') . '-' . strtoupper(Str::random(5)),
        'user_id' => $request->user()->id,
        'priority' => $validated['priority'],
        // ... field lainnya
    ]);

    return back()->with('success', 'Laporan berhasil dibuat.');
}
```

---

## 6. Penjadwalan Tugas Otomatis (Laravel Scheduler di Laragon)

Tambahkan perintah harian di `routes/console.php`:
```php
use Illuminate\Support\Facades\Schedule;
use App\Http\Controllers\CronSopController;

// Eksekusi Mesin CRON SOP Sanksi & Denda Tunggakan Setiap Hari Pukul 22.00 WIB
Schedule::call([CronSopController::class, 'executeDailySop'])->dailyAt('22:00');

// Eksekusi Pembersihan Dokumen KYC Orphaned Setiap Minggu
Schedule::command('kyc:prune-orphans')->weekly();
```

Di Laragon, jalankan worker:
```bash
php artisan schedule:work
```

---

## 7. Rangkuman Kesiapan

| Komponen Fitur | Status di React Purwarupa | Kesiapan di Habitat Laravel |
| :--- | :--- | :--- |
| **Maintenance Ticketing (Priority Selector & Color-Coding)** | ✅ Aktif (Low, Medium, High) | ✅ Kolom `priority` di migration, model, dan controller |
| **Opsi Deposit Dicicil** | ✅ Default OFF (Dapat diaktifkan Admin) | ✅ Default `allow_deposit_installment = false` di seeder & skema |
| **Manajemen e-KYC (KTP & Selfie)** | ✅ Verifikasi, Rejection, Audit Trail | ✅ Layanan `KycStorageService` (Versioning, Signed URL, Pruning) |
| **Plotting Kamar & Concurrency** | ✅ Matriks Kamar Real-Time | ✅ Tabel `room_reservations` dengan timer kedaluwarsa |
| **Master Kontrak Kolektif (Pasal 39)** | ✅ OTP WA, Persetujuan Ortu, BASTK | ✅ Tabel `digital_contracts` & controller WhatsApp Gateway |
| **Buku Besar Keuangan & Status Tagihan** | ✅ Lunas/Cicilan Indicator | ✅ Tabel `invoices`, sinkronisasi kode unik 3 digit |
| **Mesin CRON SOP Tunggakan** | ✅ Toleransi 5+5 Hari & Pemotongan Deposit | ✅ `CronSopController` & Laravel Scheduler |

Seluruh file dan blueprint siap dieksekusi langsung pada Laragon!
