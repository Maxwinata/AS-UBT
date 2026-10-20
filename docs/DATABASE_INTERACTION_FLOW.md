# Panduan Implementasi: Database Interaction Flow (CRUD Master Tables)
## Portal SI-GABUNG 54 — Asrama Universitas Bunda Thamrin (UBT)

Dokumen ini memuat **spesifikasi alur interaksi basis data (*Database Interaction Flow*)** dan **langkah-langkah nyata implementasi operasi CRUD (*Create, Read, Update, Delete*)** pada tabel-tabel master utama:
1. **`pembayaran`** (dan `pembayaran_detail` serta `transaksi` kas asrama)
2. **`penyewa`** (dan relasi ke tabel master `rooms`/kamar hunian)
3. **`contracts`** (dokumen perjanjian sewa digital & penandatanganan OTP)

Implementasi menggunakan **Laravel 11 Eloquent ORM** dan **Query Builder (`DB::table`)** dengan transaksi atomik berstandar perbankan (*ACID compliant*), terhubung langsung ke basis data MySQL di Laragon maupun server *live production*.

---

## 1. Peta Arsitektur Alur Interaksi Data (*Interaction Flow Diagram*)

Sistem pendaftaran mahasiswa baru di Portal SI-GABUNG 54 menerapkan arsitektur **Hybrid Auto-Save Draft Database dan Staged CRUD 4 Tahap**. Setiap langkah perpindahan form mengeksekusi operasi basis data nyata pada database MySQL (`asrama_ubt_db`), menjamin data pendaftar tidak hilang saat gangguan jaringan dan mencegah perebutan kamar (*race condition*).

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│             HYBRID AUTO-SAVE DRAFT & STAGED CRUD 4 TAHAP PENDAFTARAN             │
└──────────────────────────────────────────────────────────────────────────────────┘

 [MAHASISWA (FRONTEND)]              [LARAVEL BACKEND CONTROLLER]          [DATABASE MYSQL]
           │                                      │                               │
  [TAHAP 1: e-KYC & Biodata Draft]                │                               │
  • Input NIK, Kontak Wali, Alamat KTP            │                               │
  • Auto-save berkala (LocalStorage fallback)     │                               │
  • Unggah Foto KTP & Pasfoto Selfie ────────────>│ POST /maba/profile (is_draft) │
                                                  │ POST /maba/kyc                │
                                                  │───> UPSERT maba_profiles ────>│ asrama_ubt_db.
                                                  │───> INSERT kyc_documents ────>│ maba_profiles
                                                  │     (private disk v1/v2)      │ kyc_documents
                                                  │───> INSERT modification_logs ─>│ modification_logs
                                                  │                               │
  [TAHAP 2: Pemilihan Kamar & Gedung]             │                               │
  • Pilih Gedung, Lantai, & Ranjang ─────────────>│ POST /maba/room/reserve       │
  • Kunci slot kamar di database staging          │───> INSERT request_pembayaran >│ asrama_ubt_db.
    (Status: BOOKED_STAGING)                      │     (status=BOOKED_STAGING)   │ request_pembayaran
                                                  │───> UPDATE rooms (terisi++) ─>│ rooms
                                                  │                               │
  [TAHAP 3: Billing & Bukti Bayar Mandiri]        │                               │
  • Pilih durasi sewa & cicilan deposit ─────────>│ POST /maba/invoice/configure  │
  • Terbit rincian tagihan staging                │───> INSERT request_detail ───>│ request_detail
  • Unggah struk transfer Bank Mandiri ──────────>│ POST /maba/invoice/{id}/upload│
                                                  │───> INSERT request_transaksi ─>│ request_transaksi
                                                  │     (status=PENDING_VERIF)    │
  [PENGESAHAN ADMIN KEUANGAN]                     │                               │
  [ADMIN KEUANGAN]                                │                               │
       ├─────────────────────────────────────────>│ POST /admin/invoice/{id}/verify
       │                                          │ (action: APPROVE_AND_MIGRATE) 
       │                                          │                               │
       │                                          │== [DB::transaction START] ===>│
       │                                          │ 1. INSERT pembayaran (Master) │ asrama_ubt_db.
       │                                          │ 2. INSERT pembayaran_detail   │ pembayaran
       │                                          │ 3. INSERT transaksi (Kas)     │ pembayaran_detail
       │                                          │ 4. INSERT / UPDATE penyewa    │ transaksi
       │                                          │ 5. UPDATE rooms (OCCUPIED)    │ penyewa
       │                                          │ 6. UPDATE request_pembayaran  │ rooms
       │                                          │    (status_verifikasi = 1)    │ modification_logs
       │                                          │== [DB::transaction COMMIT] ==>│
       │<─────────────────────────────────────────┤                               │
                                                  │                               │
  [TAHAP 4: Kontrak Digital & OTP WhatsApp]       │                               │
  • Tanda Tangan Canvas Mahasiswa                 │                               │
  • Dual-Factor OTP Mahasiswa & Orang Tua ───────>│ POST /maba/contract/sign      │
                                                  │───> UPDATE / INSERT contracts>│ asrama_ubt_db.
                                                  │     (status = FULLY_SIGNED)   │ contracts
                                                  │───> INSERT modification_logs ─>│ modification_logs
```

### 1.1. Keputusan Kritis Arsitektur (*Confirmed Architectural Decisions*)

1. **Hybrid Auto-Save Draft Database & Offline Backup**:
   - Setiap ketikan atau perpindahan form pada Tahap 1 dikirim secara asinkron ke endpoint `POST /maba/profile` dengan payload `is_draft: true` dan dicadangkan secara lokal di `localStorage`.
   - Jika sesi mahasiswa terputus atau beralih perangkat (dari ponsel ke laptop), sistem secara otomatis memulihkan isian draf (*auto-resume*) tanpa mengulang dari awal.
2. **Kunci Permanen Kamar di Database Staging**:
   - Ketika mahasiswa memilih kamar dan ranjang pada Tahap 2, kamar langsung dikunci dengan status `BOOKED_STAGING` pada tabel `request_pembayaran` dan kuota `kapasitas_terisi` bertambah pada tabel master `rooms`.
   - Hal ini menjamin perlindungan 24 jam dari *double-booking* atau perebutan kamar antar pendaftar lain selama menunggu proses transfer perbankan.
3. **Penyimpanan Berkas e-KYC Berversi & Private Storage Bucket**:
   - Berkas fisik KTP dan pasfoto selfie disimpan langsung di private storage bucket (`storage/app/private_kyc`) dengan penamaan unik berbasis timestamp dan UUID (misal: `ktp_260108001_v1_1713504000_abc123.jpg`).
   - Sesuai `RULE[AGENTS_md]`, sistem **DILARANG MENIMPA (OVERWRITE)** berkas koreksi lama agar histori audit forensik admin tetap utuh. Setiap versi berkas dicatat di tabel `kyc_documents` dan `modification_logs`.
   - Akses dokumen privat oleh admin digerbang melalui *short-lived signed URL* (berlaku 15 menit).

---

## 2. Operasi CRUD pada Tabel Master `pembayaran`

Tabel `pembayaran` merupakan buku besar (*general ledger*) resmi penerimaan kas asrama. Record pada tabel ini hanya boleh dibuat melalui otorisasi Admin Keuangan (`operator_id > 0`), bukan dibuat secara langsung oleh mahasiswa umum.

### 2.1. CREATE (Pencatatan Master Pembayaran Baru)

#### Pendekatan 1: Menggunakan Eloquent ORM & Atomic Transaction (Direkomendasikan)
```php
use Illuminate\Support\Facades\DB;
use App\Models\Pembayaran;
use App\Models\PembayaranDetail;
use App\Models\Transaksi;
use App\Models\RequestPembayaran;
use App\Models\ModificationLog;

public function approveAndMigratePayment(string $noRequest, int $adminUserId): Pembayaran
{
    return DB::transaction(function () use ($noRequest, $adminUserId) {
        // 1. Ambil data permohonan staging yang dikirim mahasiswa
        $staged = RequestPembayaran::with('details')->where('no_request', $noRequest)->lockForUpdate()->firstOrFail();

        // 2. Generate nomor invoice resmi asrama UBT
        $officialInvoiceNo = 'INV-' . date('Ym') . '-' . sprintf('%04d', rand(1, 9999));

        // 3. Simpan ke tabel master 'pembayaran'
        $pembayaran = Pembayaran::create([
            'no_invoice'           => $officialInvoiceNo,
            'no_request'           => $staged->no_request,
            'penyewa_id'           => $staged->penyewa_id,
            'kamar_id'             => $staged->kamar_id,
            'tanggal_pembayaran'   => now(),
            'tanggal_masuk'        => $staged->tanggal_masuk ?? now(),
            'tanggal_keluar'       => $staged->tanggal_keluar ?? now()->addMonths(6),
            'total_tagihan'        => $staged->total_tagihan,
            'total_potongan_harga' => $staged->total_potongan_harga ?? 0,
            'total_bayar'          => $staged->total_bayar,
            'status_asrama'        => 1, // Lunas / Aktif
            'status_catering'      => 0,
            'operator_id'          => $adminUserId, // ID Admin Pengesah
        ]);

        // 4. Salin rincian tagihan ke 'pembayaran_detail'
        foreach ($staged->details as $item) {
            PembayaranDetail::create([
                'no_invoice'       => $officialInvoiceNo,
                'no_request'       => $staged->no_request,
                'item_pembayaran'  => $item->item_pembayaran,
                'nominal'          => $item->nominal,
                'durasi_bulan'     => $item->durasi_bulan ?? 1,
                'keterangan'       => $item->keterangan,
            ]);
        }

        // 5. Catat mutasi penerimaan kas di tabel 'transaksi'
        Transaksi::create([
            'kode_transaksi'   => 'TRX-' . date('YmdHis') . '-' . rand(100, 999),
            'no_invoice'       => $officialInvoiceNo,
            'penyewa_id'       => $staged->penyewa_id,
            'tanggal'          => now(),
            'debet'            => $staged->total_bayar,
            'kredit'           => 0,
            'keterangan'       => "Penerimaan sewa asrama {$officialInvoiceNo} an. {$staged->penyewa->nama_penyewa}",
            'operator_id'      => $adminUserId,
        ]);

        // 6. Update status staging menjadi sah
        $staged->update([
            'status'            => 'PAID',
            'status_verifikasi' => 1,
            'paid_at'           => now(),
        ]);

        // 7. Catat jejak audit (Audit Trail)
        ModificationLog::create([
            'actor'  => 'Admin Keuangan',
            'action' => "Pengesahan tagihan {$noRequest} -> Master {$officialInvoiceNo} senilai Rp " . number_format($staged->total_bayar, 0, ',', '.'),
        ]);

        return $pembayaran;
    });
}
```

#### Pendekatan 2: Menggunakan Laravel Query Builder (`DB::table`)
```php
use Illuminate\Support\Facades\DB;

public function insertPaymentRaw(array $data, int $adminId): int
{
    return DB::transaction(function () use ($data, $adminId) {
        $invoiceId = DB::table('pembayaran')->insertGetId([
            'no_invoice'         => $data['no_invoice'],
            'no_request'         => $data['no_request'],
            'penyewa_id'         => $data['penyewa_id'],
            'kamar_id'           => $data['kamar_id'],
            'tanggal_pembayaran' => now(),
            'total_tagihan'      => $data['total_tagihan'],
            'total_bayar'        => $data['total_bayar'],
            'status_asrama'      => 1,
            'operator_id'        => $adminId,
            'created_at'         => now(),
            'updated_at'         => now(),
        ]);

        return $invoiceId;
    });
}
```

### 2.2. READ (Membaca & Melaporkan Data Pembayaran)

```php
// Query Eloquent dengan Eager Loading lengkap
$daftarLunas = Pembayaran::with(['details', 'penyewa.kamar', 'transaksi'])
    ->where('status_asrama', 1)
    ->whereYear('tanggal_pembayaran', 2026)
    ->orderByDesc('id')
    ->paginate(15);

// Query Builder dengan Join kompleks (Untuk rekap kasir)
$rekapKasir = DB::table('pembayaran as p')
    ->join('penyewa as py', 'p.penyewa_id', '=', 'py.id')
    ->join('rooms as r', 'p.kamar_id', '=', 'r.id')
    ->join('transaksi as t', 'p.no_invoice', '=', 't.no_invoice')
    ->select([
        'p.no_invoice',
        'p.tanggal_pembayaran',
        'py.nim',
        'py.nama_penyewa',
        'r.gedung',
        'r.nomor_kamar',
        'p.total_bayar',
        't.kode_transaksi',
    ])
    ->where('p.operator_id', '>', 0)
    ->get();
```

### 2.3. UPDATE (Perubahan Status / Pelunasan Sisa Cicilan)

```php
// Update status invoice pelunasan sewa via Eloquent
public function markAsFullySettled(string $noInvoice): bool
{
    $pembayaran = Pembayaran::where('no_invoice', $noInvoice)->firstOrFail();
    
    return $pembayaran->update([
        'status_asrama'      => 2, // Lunas Penuh (Full Term Settlement)
        'tanggal_pembayaran' => now(),
        'updated_at'         => now(),
    ]);
}

// Update via Query Builder
DB::table('pembayaran')
    ->where('no_invoice', $noInvoice)
    ->update([
        'status_asrama' => 2,
        'updated_at'    => now()
    ]);
```

### 2.4. DELETE / VOID (Pembatalan Transaksi dengan Audit Trail)

> ⚠️ **Prinsip Audit Keuangan UBT:** Record pada tabel `pembayaran` **DILARANG DIHAPUS FISIK (`HARD DELETE`)** agar pembukuan tidak selisih. Pembatalan dilakukan dengan status `VOID` / `CANCELLED` disertai mutasi balik di tabel transaksi kas.

```php
public function voidPayment(string $noInvoice, string $alasanPembatalan, int $adminId): void
{
    DB::transaction(function () use ($noInvoice, $alasanPembatalan, $adminId) {
        $pembayaran = Pembayaran::where('no_invoice', $noInvoice)->firstOrFail();

        // 1. Ubah status menjadi dibatalkan
        $pembayaran->update([
            'status_asrama' => 9, // 9 = VOID / Dibatalkan
            'keterangan'    => "DIBATALKAN: {$alasanPembatalan}",
        ]);

        // 2. Buat mutasi kas pembalik (Jurnal Balik / Refund)
        Transaksi::create([
            'kode_transaksi' => 'REV-' . date('YmdHis'),
            'no_invoice'     => $noInvoice,
            'penyewa_id'     => $pembayaran->penyewa_id,
            'tanggal'        => now(),
            'debet'          => 0,
            'kredit'         => $pembayaran->total_bayar, // Kas keluar untuk pengembalian
            'keterangan'     => "Koreksi/Pembatalan {$noInvoice}: {$alasanPembatalan}",
            'operator_id'    => $adminId,
        ]);

        // 3. Catat di Log Modifikasi
        ModificationLog::create([
            'actor'  => 'Admin Keuangan',
            'action' => "VOID Transaksi {$noInvoice} senilai Rp " . number_format($pembayaran->total_bayar, 0, ',', '.') . " (Alasan: {$alasanPembatalan})",
        ]);
    });
}
```

---

## 3. Operasi CRUD pada Tabel Master `penyewa`

Tabel `penyewa` menyimpan data induk seluruh mahasiswa yang memiliki hak menempati kamar di asrama UBT.

### 3.1. CREATE (Pendaftaran & Alokasi Kamar Master)

```php
use App\Models\Penyewa;
use App\Models\Room;

public function createMasterTenant(array $studentData, int $kamarId, int $operatorId): Penyewa
{
    return DB::transaction(function () use ($studentData, $kamarId, $operatorId) {
        // 1. Kunci kamar dan pastikan kapasitas tersedia
        $kamar = Room::lockForUpdate()->findOrFail($kamarId);
        if ($kamar->kapasitas_terisi >= $kamar->kapasitas_total) {
            throw new \Exception("Kamar {$kamar->nomor_kamar} sudah penuh!");
        }

        // 2. Buat master penyewa
        $penyewa = Penyewa::create([
            'nim'             => $studentData['nim'],
            'no_pmb'          => $studentData['no_pmb'] ?? null,
            'nama_penyewa'    => $studentData['nama'],
            'jenis_kelamin'   => $studentData['jenis_kelamin'],
            'program_studi'   => $studentData['prodi'],
            'kamar_id'        => $kamarId,
            'tanggal_mulai'   => now(),
            'tanggal_selesai' => now()->addMonths(6),
            'status_asrama'   => 1, // 1 = Penghuni Aktif
            'status_catering' => 0,
            'operator_id'     => $operatorId,
        ]);

        // 3. Tambah hitungan kapasitas kamar
        $kamar->increment('kapasitas_terisi');
        if ($kamar->kapasitas_terisi >= $kamar->kapasitas_total) {
            $kamar->update(['status' => 'OCCUPIED']);
        }

        return $penyewa;
    });
}
```

### 3.2. READ (Pencarian & Relasi Data Penghuni)

```php
// Pencarian penyewa aktif beserta kamar dan kontrak
$penyewa = Penyewa::with(['kamar', 'pembayaran', 'transaksi'])
    ->where('nim', '2240101004')
    ->first();

// Query Builder untuk pencarian per lantai / gedung
$daftarGedungA = DB::table('penyewa as p')
    ->join('rooms as r', 'p.kamar_id', '=', 'r.id')
    ->where('r.gedung', 'Gedung A')
    ->where('p.status_asrama', 1)
    ->select('p.id', 'p.nim', 'p.nama_penyewa', 'r.nomor_kamar', 'r.lantai')
    ->get();
```

### 3.3. UPDATE (Pindah Kamar & Perpanjangan Kontrak)

```php
// Pindah Kamar (Room Reallocation)
public function moveRoom(int $penyewaId, int $newKamarId, int $adminId): void
{
    DB::transaction(function () use ($penyewaId, $newKamarId, $adminId) {
        $penyewa = Penyewa::lockForUpdate()->findOrFail($penyewaId);
        $oldKamar = Room::lockForUpdate()->findOrFail($penyewa->kamar_id);
        $newKamar = Room::lockForUpdate()->findOrFail($newKamarId);

        if ($newKamar->kapasitas_terisi >= $newKamar->kapasitas_total) {
            throw new \Exception("Kamar tujuan sudah penuh.");
        }

        // Pindahkan hunian
        $oldKamar->decrement('kapasitas_terisi');
        $oldKamar->update(['status' => 'AVAILABLE']);

        $newKamar->increment('kapasitas_terisi');
        if ($newKamar->kapasitas_terisi >= $newKamar->kapasitas_total) {
            $newKamar->update(['status' => 'OCCUPIED']);
        }

        $penyewa->update([
            'kamar_id'    => $newKamarId,
            'operator_id' => $adminId,
        ]);

        ModificationLog::create([
            'actor'  => 'Admin Asrama',
            'action' => "Mutasi Kamar: {$penyewa->nama_penyewa} dipindahkan dari Kamar {$oldKamar->nomor_kamar} ke {$newKamar->nomor_kamar}.",
        ]);
    });
}
```

### 3.4. DELETE / CHECKOUT (Pengakhiran Masa Tinggal)

```php
// Checkout Penghuni & Pelepasan Kamar
public function checkOutTenant(int $penyewaId, string $beritaAcaraKerusakan, int $adminId): void
{
    DB::transaction(function () use ($penyewaId, $beritaAcaraKerusakan, $adminId) {
        $penyewa = Penyewa::findOrFail($penyewaId);
        $kamar = Room::findOrFail($penyewa->kamar_id);

        // 1. Ubah status menjadi ALUMNI / CHECKOUT (Bukan menghapus baris)
        $penyewa->update([
            'status_asrama'   => 0, // 0 = Non-Aktif / Checkout
            'tanggal_keluar'  => now(),
            'catatan'         => $beritaAcaraKerusakan,
        ]);

        // 2. Kosongkan slot ranjang di kamar
        $kamar->decrement('kapasitas_terisi');
        $kamar->update(['status' => 'AVAILABLE']);

        // 3. Catat Log
        ModificationLog::create([
            'actor'  => 'Admin Asrama',
            'action' => "Check-Out Resmi: {$penyewa->nama_penyewa} keluar dari Kamar {$kamar->nomor_kamar}. Kamar kembali tersedia.",
        ]);
    });
}
```

---

## 4. Operasi CRUD pada Tabel Master `contracts`

Tabel `contracts` mengelola dokumen hukum perjanjian tinggal asrama (Format F-19 dan Pakta Integritas F-02).

### 4.1. CREATE (Penerbitan Draf Kontrak Digital)

```php
use App\Models\Contract;

public function generateContract(int $userId, int $roomId): Contract
{
    $contractNumber = 'KTR-UBT-' . date('Y') . '-' . sprintf('%04d', rand(1, 9999));

    return Contract::create([
        'contract_number'       => $contractNumber,
        'user_id'               => $userId,
        'room_id'               => $roomId,
        'student_signed'        => false,
        'parent_signed'         => false,
        'status'                => 'DRAFT',
        'started_at'            => now(),
        'ended_at'              => now()->addMonths(6),
    ]);
}
```

### 4.2. READ (Pengambilan Kontrak Aktif & Verifikasi Tanda Tangan)

```php
// Mencari kontrak aktif mahasiswa
$contract = Contract::with(['user', 'room'])
    ->where('user_id', $userId)
    ->where('status', 'FULLY_SIGNED')
    ->latest()
    ->first();
```

### 4.3. UPDATE (Pengesahan Tanda Tangan OTP & Meterai Kolektif F-22)

```php
public function signContractWithOtp(int $contractId, string $otpStudent, string $otpParent, string $signatureData): Contract
{
    $contract = Contract::findOrFail($contractId);

    // Validasi OTP di sini (misal via Session atau WA Gateway cache)

    $contract->update([
        'student_signed'        => true,
        'student_signed_at'     => now(),
        'parent_signed'         => true,
        'parent_signed_at'      => now(),
        'signature_student_url' => $signatureData,
        'status'                => 'FULLY_SIGNED', // Sah secara hukum
    ]);

    ModificationLog::create([
        'actor'  => 'Mahasiswa',
        'action' => "Pengesahan Kontrak Digital {$contract->contract_number} via OTP WhatsApp berhasil.",
    ]);

    return $contract;
}
```

### 4.4. DELETE / TERMINASI (Pemutusan Hubungan Sewa)

```php
public function terminateContract(int $contractId, string $reason, int $adminId): void
{
    $contract = Contract::findOrFail($contractId);

    $contract->update([
        'status'             => 'TERMINATED',
        'ended_at'           => now(),
        'termination_reason' => $reason,
    ]);

    ModificationLog::create([
        'actor'  => 'Admin Asrama',
        'action' => "Terminasi Kontrak {$contract->contract_number} (Alasan: {$reason}).",
    ]);
}
```

---

## 5. Query Verifikasi SQL untuk Pengujian di phpMyAdmin / MySQL CLI

Jalankan kueri berikut untuk memeriksa hasil penulisan data secara transparan:

```sql
-- 1. Verifikasi Data Master Pembayaran
SELECT p.id, p.no_invoice, p.no_request, p.total_bayar, p.status_asrama, p.operator_id, p.created_at
FROM asrama_ubt_db.pembayaran p
ORDER BY p.id DESC LIMIT 5;

-- 2. Verifikasi Rincian Detail Invoice Pembayaran
SELECT pd.id, pd.no_invoice, pd.item_pembayaran, pd.nominal, pd.durasi_bulan
FROM asrama_ubt_db.pembayaran_detail pd
ORDER BY pd.id DESC LIMIT 5;

-- 3. Verifikasi Mutasi Kas Transaksi Asrama
SELECT t.id, t.kode_transaksi, t.no_invoice, t.debet, t.kredit, t.keterangan
FROM asrama_ubt_db.transaksi t
ORDER BY t.id DESC LIMIT 5;

-- 4. Verifikasi Master Penyewa dan Alokasi Kamar
SELECT py.id, py.nim, py.nama_penyewa, py.kamar_id, r.gedung, r.nomor_kamar, py.status_asrama
FROM asrama_ubt_db.penyewa py
LEFT JOIN asrama_ubt_db.rooms r ON py.kamar_id = r.id
ORDER BY py.id DESC LIMIT 5;

-- 5. Verifikasi Kontrak Digital
SELECT c.id, c.contract_number, c.user_id, c.status, c.student_signed, c.parent_signed, c.started_at
FROM asrama_ubt_db.contracts c
ORDER BY c.id DESC LIMIT 5;

-- 6. Verifikasi Berkas e-KYC Berversi & Jejak Audit
SELECT k.id, k.user_id, k.doc_type, k.file_name, k.file_version, k.is_active_version, k.status_verifikasi
FROM asrama_ubt_db.kyc_documents k
ORDER BY k.id DESC LIMIT 5;

SELECT l.id, l.actor, l.action, l.ip_address, l.created_at
FROM asrama_ubt_db.modification_logs l
ORDER BY l.id DESC LIMIT 5;
```

---

## 6. Panduan Pengujian Nyata Live CRUD di Laragon (`laragon-test-crud.bat`)

Untuk menguji seluruh alur CRUD secara nyata di komputer lokal dengan Laragon MySQL, gunakan file batch `laragon-test-crud.bat` yang telah disediakan di *root project*.

### 6.1. Langkah Cepat Menjalankan Pengujian (Quick Run)
1. Buka **Laragon** dan pastikan service **MySQL (Port 3306)** aktif (*Start All*).
2. Buka folder proyek di Windows Explorer: `C:\laragon\www\portal-asrama` (atau direktori kerja Anda).
3. Klik ganda pada berkas **`laragon-test-crud.bat`**, atau jalankan melalui Terminal Laragon:
   ```cmd
   laragon-test-crud.bat
   ```
4. Menu interaktif akan muncul di konsol:
   - Ketik **`1`** lalu tekan **Enter** untuk menjalankan **Uji Live CRUD Nyata 4 Tahap & Tabel Master**.
   - Skrip akan mengeksekusi operasi nyata:
     - Tahap 1: Menyimpan draf profil ke `maba_profiles` & berkas e-KYC ke `kyc_documents`.
     - Tahap 2: Mengunci kamar permanen di staging `request_pembayaran` (`status = 'BOOKED_STAGING'`).
     - Tahap 3: Menerbitkan rincian tagihan, struk Bank Mandiri, dan pengesahan Admin ke `pembayaran` & `transaksi`.
     - Tahap 4: Mengesahkan perjanjian sewa digital di `contracts` (`status = 'FULLY_SIGNED'`).
     - Validasi: Melakukan Join query 4 tabel master dan menampilkan tabel ringkasan data nyata.
   - Ketik **`2`** untuk menjalankan uji CRUD penuh disertai pembersihan otomatis (*auto-cleanup*).
   - Ketik **`5`** untuk membuka Laravel Tinker interaktif.

### 6.2. Eksekusi Langsung via Laravel Artisan CLI
Anda juga dapat mengeksekusi perintah Artisan secara langsung:
```bash
# Menjalankan uji CRUD dan mempertahankan data di MySQL untuk inspeksi phpMyAdmin
php artisan asrama:test-live-crud

# Menjalankan uji CRUD lalu membersihkan record pengujian kembali bersih
php artisan asrama:test-live-crud --cleanup
```

Dengan langkah-langkah di atas, pengembang dan tim administrator dapat memvalidasi integritas basis data, kepatuhan audit trail, dan relasi tabel master secara instan sebelum melakukan migrasi ke server *live production*.

---

## 7. Arsitektur Impor Lengkap API SIDARA ke Tabel SQL Pengembangan (`siakad_mahasiswa_stg`)

Untuk menjamin seluruh pendaftar dari sistem penerimaan kampus terimpor tanpa kehilangan metadata satupun, sistem menggunakan tabel staging pra-registrasi `asrama_ubt_db.siakad_mahasiswa_stg` dengan penyimpanan terstruktur kolom fisik dan penyimpanan dokumen mentah asli pada kolom JSON `payload_raw`.

### 7.1. Struktur Tabel SQL Staging (`siakad_mahasiswa_stg`)

```sql
CREATE TABLE `siakad_mahasiswa_stg` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `api_link_id` bigint unsigned NOT NULL,
  `id_siakad` bigint unsigned DEFAULT NULL,
  `sso_id_from_sidara` varchar(50) DEFAULT NULL,
  `kategori_beasiswa` varchar(50) NOT NULL COMMENT 'nonkip / kip',
  `nama_beasiswa` varchar(100) DEFAULT NULL,
  `bill_to_code` varchar(50) DEFAULT NULL COMMENT 'BTT-006 / BTT-002',
  `nomor_registrasi` varchar(50) NOT NULL COMMENT 'PMB / NIM Calon (Unique Index)',
  `nama_lengkap` varchar(191) NOT NULL,
  `nik` varchar(16) DEFAULT NULL,
  `angkatan` varchar(10) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `nomor_telepon` varchar(50) DEFAULT NULL,
  `program_studi` varchar(100) DEFAULT NULL,
  `fakultas` varchar(100) DEFAULT NULL,
  `jenis_kelamin` char(1) DEFAULT NULL,
  `tempat_lahir` varchar(100) DEFAULT NULL,
  `tanggal_lahir` date DEFAULT NULL,
  `alamat_lengkap` text DEFAULT NULL,
  `nama_ayah` varchar(150) DEFAULT NULL,
  `nama_ibu` varchar(150) DEFAULT NULL,
  `no_hp_ortu` varchar(50) DEFAULT NULL,
  `nomorkip` varchar(100) DEFAULT NULL,
  `jalur_masuk` varchar(100) DEFAULT NULL,
  `nim_resmi` varchar(50) DEFAULT NULL,
  `status_klaim` int NOT NULL DEFAULT '0' COMMENT '0=Staging Pra-Registrasi, 1=Terpromosi Master',
  `status_verifikasi_subsidi` int NOT NULL DEFAULT '0' COMMENT '0=Pending, 1=Disetujui, -1=Ditolak',
  `verified_by` varchar(191) DEFAULT NULL,
  `verified_at` datetime DEFAULT NULL,
  `catatan_admin` text DEFAULT NULL,
  `payload_raw` json DEFAULT NULL COMMENT '100% Seluruh Konten Asli Respon JSON API SIDARA',
  `synced_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `siakad_mahasiswa_stg_nomor_registrasi_unique` (`nomor_registrasi`),
  KEY `siakad_mahasiswa_stg_sso_id_from_sidara_index` (`sso_id_from_sidara`),
  KEY `siakad_mahasiswa_stg_api_link_id_foreign` (`api_link_id`),
  CONSTRAINT `siakad_mahasiswa_stg_api_link_id_foreign` FOREIGN KEY (`api_link_id`) REFERENCES `api_link` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 7.2. Logika Eloquent Idempoten & Penyimpanan Raw JSON

Ekstraksi seluruh payload API dijalankan menggunakan `updateOrCreate` pada `nomor_registrasi` sehingga aman dijalankan berkali-kali tanpa duplikasi (*idempotent*):

```php
use App\Models\SiakadMahasiswaStg;

SiakadMahasiswaStg::updateOrCreate(
    ['nomor_registrasi' => $noReg],
    [
        'api_link_id'        => $apiLink->id,
        'id_siakad'          => $item['id'] ?? null,
        'sso_id_from_sidara' => $ssoId,
        'kategori_beasiswa'  => $apiLink->kategori,
        'nama_beasiswa'      => $billToName,
        'bill_to_code'       => $billToCode,
        'nama_lengkap'       => $namaMahasiswa,
        'nik'                => $nik,
        'angkatan'           => $angkatan,
        'email'              => $email,
        'nomor_telepon'      => $nomorTelepon,
        'program_studi'      => $prodiName,
        'fakultas'           => $fakultasName,
        'jenis_kelamin'      => $gender,
        'tempat_lahir'       => $tempatLahir,
        'tanggal_lahir'      => $tanggalLahir,
        'alamat_lengkap'     => $alamatLengkap,
        'nama_ayah'          => $namaAyah,
        'nama_ibu'           => $namaIbu,
        'no_hp_ortu'         => $noHpOrtu,
        'nomorkip'           => $nomorKip,
        'jalur_masuk'        => $jalurMasuk,
        'nim_resmi'          => $nimResmi,
        'payload_raw'        => $item, // 100% dokumen respon mentah asli SIDARA
        'synced_at'          => now(),
    ]
);
```

### 7.3. Transaksi Atomik Promosi Staging ke Tabel Master (`promoteToMaster`)

Admin dapat mengklik tombol **"Promosikan ke Master"** di portal admin untuk memindahkan data pendaftar terverifikasi ke 3 tabel master inti:

```php
use Illuminate\Support\Facades\DB;
use App\Models\User;
use App\Models\MabaProfile;
use App\Models\Penyewa;
use App\Models\SiakadMahasiswaStg;
use App\Models\ModificationLog;

public function promoteToMaster(int $stagingId, int $operatorId = 1): array
{
    return DB::transaction(function () use ($stagingId, $operatorId) {
        $stg = SiakadMahasiswaStg::findOrFail($stagingId);

        // 1. Buat / Update Akun User Master
        $user = User::updateOrCreate(
            ['email' => $stg->email ?? "mhs_{$stg->nomor_registrasi}@ubtsu.ac.id"],
            [
                'name'           => $stg->nama_lengkap,
                'password'       => bcrypt('password123'),
                'role'           => 'maba',
                'nim'            => $stg->nomor_registrasi,
                'no_pmb'         => $stg->nomor_registrasi,
                'is_kip_student' => $stg->kategori_beasiswa === 'kip',
                'phone'          => $stg->nomor_telepon ?? '081234567890',
            ]
        );

        // 2. Buat / Update Master Profil Maba
        $profile = MabaProfile::updateOrCreate(
            ['user_id' => $user->id],
            [
                'nim_no_reg'       => $stg->nomor_registrasi,
                'no_pmb'            => $stg->nomor_registrasi,
                'nim'               => $stg->nim_resmi ?? (str_starts_with($stg->nomor_registrasi, '26') ? $stg->nomor_registrasi : null),
                'nama'              => $stg->nama_lengkap,
                'jalur_masuk'       => $stg->jalur_masuk ?? ($stg->kategori_beasiswa === 'kip' ? 'Jalur KIP-Kuliah' : 'PMB Reguler 2026'),
                'fakultas'          => $stg->fakultas ?? 'Fakultas Terkait',
                'prodi'             => $stg->program_studi ?? 'Program Studi',
                'angkatan'          => $stg->angkatan ?? '2026',
                'jenis_kelamin'     => $stg->jenis_kelamin === 'P' ? 'Perempuan' : 'Laki-laki',
                'kategori'          => $stg->kategori_beasiswa === 'kip' ? 'KIP-Kuliah' : 'Reguler',
                'no_hp_wa'          => $stg->nomor_telepon ?? '081234567890',
                'email'             => $user->email,
                'alamat_ktp_jalan'  => $stg->alamat_lengkap ?? 'Jl. Bhayangkara No. 54',
                'is_kip_student'    => $stg->kategori_beasiswa === 'kip',
                'persetujuan_awal'  => true,
            ]
        );

        // 3. Buat / Update Master Penyewa
        $penyewa = Penyewa::updateOrCreate(
            ['nim' => $stg->nomor_registrasi],
            [
                'no_pmb'        => $stg->nomor_registrasi,
                'nama_penyewa'  => $stg->nama_lengkap,
                'jenis_kelamin' => $stg->jenis_kelamin === 'P' ? 'Perempuan' : 'Laki-laki',
                'program_studi' => $stg->program_studi,
                'status_asrama' => 1,
                'operator_id'   => $operatorId,
            ]
        );

        // 4. Update Status Staging Menjadi Terpromosi
        $stg->update([
            'status_klaim'              => 1,
            'status_verifikasi_subsidi' => 1,
            'verified_by'               => 'Admin Asrama',
            'verified_at'               => now(),
        ]);

        // 5. Audit Log
        ModificationLog::create([
            'actor'  => 'Admin Asrama',
            'action' => "Promosi Data SIDARA: {$stg->nomor_registrasi} an. {$stg->nama_lengkap} resmi dipromosikan ke master users, maba_profiles, dan penyewa.",
        ]);

        return compact('user', 'profile', 'penyewa', 'stg');
    });
}
```

### 7.4. Eksekusi Menu File BAT di Laragon

Jalankan `laragon-test-crud.bat` dari terminal Windows / Laragon:
- Pilih **`[7] Impor & Sinkronisasi Lengkap API SIDARA ke Tabel Staging (siakad_mahasiswa_stg)`**.
- Skrip akan memanggil Artisan `php artisan sidara:import-api`.
- Hasil impor akan mencetak tabel rekapitulasi data pendaftar, jumlah field mentah JSON yang tersimpan, serta total record aktif.


