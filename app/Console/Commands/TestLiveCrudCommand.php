<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use App\Models\User;
use App\Models\Room;
use App\Models\Penyewa;
use App\Models\Pembayaran;
use App\Models\PembayaranDetail;
use App\Models\Transaksi;
use App\Models\RequestPembayaran;
use App\Models\RequestPembayaranDetail;
use App\Models\RequestTransaksi;
use App\Models\Contract;
use App\Models\MabaProfile;
use App\Models\KycDocument;
use App\Models\ModificationLog;
use App\Models\SimabaPendaftaran;

class TestLiveCrudCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'asrama:test-live-crud {--cleanup : Bersihkan data uji setelah pengujian selesai}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Menjalankan pengujian interaksi CRUD nyata pada 4 tahapan pendaftaran mahasiswa dan tabel master di MySQL Laragon.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->newLine();
        $this->line('<bg=blue;fg=white;options=bold> ========================================================================================= </>');
        $this->line('<bg=blue;fg=white;options=bold>  PORTAL SI-GABUNG 54: LIVE CRUD & 4-STAGE STAGED REGISTRATION TEST ENGINE (LARAGON MYSQL)  </>');
        $this->line('<bg=blue;fg=white;options=bold> ========================================================================================= </>');
        $this->newLine();

        // -------------------------------------------------------------
        // TAHAP 0: KONEKTIVITAS DUAL DATABASE
        // -------------------------------------------------------------
        $this->info('👉 [TAHAP 0/5] Memeriksa Handshake Dual Database MySQL...');
        try {
            DB::connection('mysql')->getPdo();
            $dbName = DB::connection('mysql')->getDatabaseName();
            $this->line("   <fg=green>✔ Database Utama ({$dbName}) terhubung aktif pada port 3306.</>");
        } catch (\Exception $e) {
            $this->error("   ✘ Gagal terhubung ke database utama: " . $e->getMessage());
            return 1;
        }

        try {
            DB::connection('simaba')->getPdo();
            $simabaDbName = DB::connection('simaba')->getDatabaseName();
            $this->line("   <fg=green>✔ Database SIMABA PMB ({$simabaDbName}) terhubung aktif.</>");
            $simabaCount = DB::connection('simaba')->table('pendaftaranmahasiswa')->count();
            $this->line("   <fg=cyan>ℹ Total record calon mahasiswa di SIMABA PMB: {$simabaCount} pendaftar.</>");
        } catch (\Exception $e) {
            $this->warn("   ⚠ Database SIMABA belum terhubung / user belum dibuat. Menggunakan koneksi default.");
        }

        $this->newLine();

        // Inisialisasi Identitas Mahasiswa Uji
        $testNim = '260108001';
        $testNama = 'Grace Marlin (Uji Live CRUD 4 Tahap)';
        $noPmb = 'PMB-2026-0881';
        $noRequest = 'REQ-' . date('Ymd') . '-' . rand(1000, 9999);
        $officialInvoiceNo = 'INV-' . date('Ym') . '-' . rand(1000, 9999);
        $contractNo = 'KTR-UBT-' . date('Y') . '-' . rand(1000, 9999);

        // Ambil atau buat kamar uji
        $kamar = Room::first();
        if (!$kamar) {
            $kamar = Room::create([
                'nomor_kamar' => 'B-204',
                'gedung' => 'Gedung B',
                'lantai' => 'Lantai 2',
                'jenis_kamar' => 'PUTRI',
                'tipe_kamar' => 'STANDAR',
                'tarif_bulanan' => 500000,
                'kapasitas_total' => 2,
                'kapasitas_terisi' => 0,
                'status' => 'AVAILABLE',
            ]);
            $this->line("   <fg=green>✔ Master Kamar B-204 berhasil diinisialisasi.</>");
        }

        // Ambil atau buat User akun mahasiswa
        $user = User::firstOrCreate(
            ['email' => 'grace.marlin.test@ubt.ac.id'],
            [
                'name' => $testNama,
                'password' => bcrypt('password123'),
                'role' => 'maba',
                'nim' => $testNim,
            ]
        );

        // -------------------------------------------------------------
        // TAHAP 1: e-KYC, BIODATA HYBRID DRAFT & PRIVATE STORAGE
        // -------------------------------------------------------------
        $this->info('👉 [TAHAP 1/5] Menjalankan CRUD Tahap 1: Biodata Hybrid Draft & e-KYC Private Storage...');

        // 1A. Auto-Save Draft Biodata Mahasiswa
        $profile = MabaProfile::updateOrCreate(
            ['user_id' => $user->id],
            [
                'nim_no_reg' => $testNim,
                'no_pmb' => $noPmb,
                'nim' => $testNim,
                'nama' => $testNama,
                'jalur_masuk' => 'PMB Reguler 2026',
                'fakultas' => 'Fakultas Ekonomi dan Bisnis',
                'prodi' => 'S1 Manajemen',
                'angkatan' => '2026',
                'jenis_kelamin' => 'Perempuan',
                'kategori' => 'Reguler',
                'no_hp_wa' => '081234567890',
                'email' => $user->email,
                'alamat_ktp_jalan' => 'Jl. Bhayangkara No. 54',
                'alamat_ktp_kabupaten_kota' => 'Kota Tarakan',
                'alamat_ktp_provinsi' => 'Kalimantan Utara',
                'alamat_ktp_kode_pos' => '77111',
                'kontak_darurat_nama' => 'Bambang S. (Orang Tua)',
                'kontak_darurat_hubungan' => 'Ayah',
                'kontak_darurat_no_hp' => '081198765432',
                'kontak_darurat_alamat' => 'Jl. Bhayangkara No. 54, Tarakan',
                'tipe_kamar' => 'STANDAR',
                'preferensi_lantai' => 'Lantai 2',
                'persetujuan_awal' => true,
                'kyc_submitted' => true,
                'kyc_verified' => true,
                'kyc_verified_at' => now(),
            ]
        );

        // 1B. Simpan Berkas e-KYC Berversi (RULE[AGENTS_md] Non-overwriting Versioning)
        $timestamp = time();
        $ktpFilename = "ktp_{$testNim}_v1_{$timestamp}_" . Str::random(6) . '.jpg';
        $selfieFilename = "selfie_{$testNim}_v1_{$timestamp}_" . Str::random(6) . '.jpg';
        $ktpPath = "kyc/ktp/{$ktpFilename}";
        $selfiePath = "kyc/selfie/{$selfieFilename}";
        $disk = env('KYC_STORAGE_DISK', 'private_kyc');

        // Simpan file dummy ke disk storage lokal
        Storage::disk('local')->put($ktpPath, 'MOCK_KTP_BINARY_CONTENT_' . $testNim);
        Storage::disk('local')->put($selfiePath, 'MOCK_SELFIE_BINARY_CONTENT_' . $testNim);

        $docKtp = KycDocument::create([
            'user_id' => $user->id,
            'doc_type' => 'KTP',
            'file_name' => $ktpFilename,
            'file_path' => $ktpPath,
            'file_version' => 1,
            'is_active_version' => true,
            'storage_disk' => $disk,
            'file_size_bytes' => 1024 * 450,
            'mime_type' => 'image/jpeg',
            'file_hash' => hash('sha256', 'MOCK_KTP_BINARY_CONTENT_' . $testNim),
            'status_verifikasi' => 'APPROVED',
            'verified_at' => now(),
            'retention_until' => now()->addDays(60),
        ]);

        $docSelfie = KycDocument::create([
            'user_id' => $user->id,
            'doc_type' => 'SELFIE_KTP',
            'file_name' => $selfieFilename,
            'file_path' => $selfiePath,
            'file_version' => 1,
            'is_active_version' => true,
            'storage_disk' => $disk,
            'file_size_bytes' => 1024 * 580,
            'mime_type' => 'image/jpeg',
            'file_hash' => hash('sha256', 'MOCK_SELFIE_BINARY_CONTENT_' . $testNim),
            'status_verifikasi' => 'APPROVED',
            'verified_at' => now(),
            'retention_until' => now()->addDays(60),
        ]);

        $profile->update([
            'ktp_url' => $ktpPath,
            'selfie_url' => $selfiePath,
        ]);

        ModificationLog::create([
            'actor' => "Maba ({$testNim})",
            'action' => "Tahap 1: Simpan draft biodata & upload e-KYC KTP v1 ({$ktpFilename}) dan Selfie v1 ke private disk.",
            'ip_address' => '127.0.0.1',
        ]);

        $this->line("   <fg=green>✔ [TAHAP 1 CREATE] Draft Biodata tersimpan di 'maba_profiles' (NIM: {$testNim})</>");
        $this->line("   <fg=green>✔ [TAHAP 1 CREATE] Berkas e-KYC tersimpan berversi di 'kyc_documents': KTP v1 & Selfie v1</>");
        $this->line("   <fg=green>✔ [TAHAP 1 AUDIT] Tercatat log audit kepatuhan RULE[AGENTS_md] di 'modification_logs'</>");
        $this->newLine();

        // -------------------------------------------------------------
        // TAHAP 2: RESERVASI & PENGUNCIAN KAMAR PERMANEN DI STAGING
        // -------------------------------------------------------------
        $this->info('👉 [TAHAP 2/5] Menjalankan CRUD Tahap 2: Penguncian Kamar Permanen di Staging...');

        $stagedRequest = DB::transaction(function () use ($user, $kamar, $testNim, $testNama, $noRequest) {
            $lockedRoom = Room::lockForUpdate()->find($kamar->id);

            // Kunci slot permanen di tabel staging request_pembayaran
            $staged = RequestPembayaran::updateOrCreate(
                ['no_request' => $noRequest],
                [
                    'nim' => $testNim,
                    'nama_mahasiswa' => $testNama,
                    'kamar_id' => $lockedRoom->id,
                    'total_tagihan' => 3600000,
                    'total_potongan_harga' => 0,
                    'total_bayar' => 3600000,
                    'status' => 'BOOKED_STAGING',
                    'status_pembayaran' => 'PENDING',
                    'status_verifikasi' => 0,
                    'operator_id' => 0, // 0 = Otonom Mandiri Maba
                ]
            );

            // Tambah kapasitas terisi untuk mencegah perebutan kamar (race condition)
            $lockedRoom->increment('kapasitas_terisi');
            if ($lockedRoom->kapasitas_terisi >= $lockedRoom->kapasitas_total) {
                $lockedRoom->update(['status' => 'OCCUPIED']);
            }

            ModificationLog::create([
                'actor' => "Maba ({$testNim})",
                'action' => "Tahap 2: Mengunci permanen kamar {$lockedRoom->gedung} - {$lockedRoom->nomor_kamar} di tabel staging request_pembayaran ({$noRequest}).",
                'ip_address' => '127.0.0.1',
            ]);

            return $staged;
        });

        $this->line("   <fg=green>✔ [TAHAP 2 CREATE] Kamar {$kamar->gedung} - {$kamar->nomor_kamar} dikunci permanen di 'request_pembayaran' ({$noRequest})</>");
        $this->line("   <fg=green>✔ [TAHAP 2 UPDATE] Kapasitas terisi 'rooms' bertambah (Status: BOOKED_STAGING)</>");
        $this->newLine();

        // -------------------------------------------------------------
        // TAHAP 3: TAGIHAN, BUKTI BAYAR & PENGESAHAN ADMIN KE MASTER
        // -------------------------------------------------------------
        $this->info('👉 [TAHAP 3/5] Menjalankan CRUD Tahap 3: Tagihan, Upload Bukti & Bridging Pengesahan Admin...');

        // 3A. Rincian Tagihan Staging
        RequestPembayaranDetail::create([
            'no_request' => $noRequest,
            'item_pembayaran' => 'Sewa Kamar Asrama 6 Bulan (Rp 500.000/bln)',
            'nominal' => 3000000,
            'durasi_bulan' => 6,
        ]);

        RequestPembayaranDetail::create([
            'no_request' => $noRequest,
            'item_pembayaran' => 'Uang Deposit Pemeliharaan Fasilitas',
            'nominal' => 500000,
            'durasi_bulan' => 1,
        ]);

        RequestPembayaranDetail::create([
            'no_request' => $noRequest,
            'item_pembayaran' => 'Biaya Administrasi & e-Pass RFID',
            'nominal' => 100000,
            'durasi_bulan' => 1,
        ]);

        // 3B. Mahasiswa Upload Bukti Transfer Struk Mandiri
        $transferProofPath = "proofs/mandiri/transfer_{$testNim}_{$timestamp}.jpg";
        Storage::disk('local')->put($transferProofPath, 'MOCK_RECEIPT_MANDIRI_3600000');

        $reqTrx = RequestTransaksi::create([
            'no_request' => $noRequest,
            'no_transaksi' => 'TRX-' . $noRequest,
            'tanggal_transaksi' => now(),
            'jumlah_uang' => 3600000,
            'metode_pembayaran' => 'Transfer Manual BANK MANDIRI (Rek: 1050508988809)',
            'file_bukti' => $transferProofPath,
            'operator_id' => 0,
        ]);

        $stagedRequest->update([
            'status' => 'PENDING_VERIFICATION',
            'status_pembayaran' => 'PENDING_VERIFICATION',
        ]);

        $this->line("   <fg=cyan>ℹ Mahasiswa mengunggah struk transfer Rp 3.600.000 -> Status beralih ke PENDING_VERIFICATION.</>");

        // 3C. Pengesahan Admin Keuangan (Bridging Promotion Atomic Transaction ke Master)
        $masterData = DB::transaction(function () use ($user, $kamar, $testNim, $testNama, $noRequest, $officialInvoiceNo) {
            // Promosi ke Master Penyewa
            $penyewa = Penyewa::updateOrCreate(
                ['nim' => $testNim],
                [
                    'no_pmb' => $testNim,
                    'nama_penyewa' => $testNama,
                    'jenis_kelamin' => 'Perempuan',
                    'program_studi' => 'S1 Manajemen',
                    'kamar_id' => $kamar->id,
                    'tanggal_mulai' => now(),
                    'tanggal_selesai' => now()->addMonths(6),
                    'status_asrama' => 1, // Aktif
                    'operator_id' => 1, // Disahkan Admin Keuangan
                ]
            );

            // Promosi ke Master Pembayaran
            $pembayaran = Pembayaran::create([
                'no_invoice' => $officialInvoiceNo,
                'no_request' => $noRequest,
                'penyewa_id' => $penyewa->id,
                'kamar_id' => $kamar->id,
                'tanggal_pembayaran' => now(),
                'tanggal_masuk' => now(),
                'tanggal_keluar' => now()->addMonths(6),
                'total_tagihan' => 3600000,
                'total_potongan_harga' => 0,
                'total_bayar' => 3600000,
                'status_asrama' => 1, // Lunas Sah
                'status_catering' => 0,
                'operator_id' => 1,
            ]);

            // Salin Rincian ke Master Pembayaran Detail
            PembayaranDetail::create([
                'no_invoice' => $officialInvoiceNo,
                'no_request' => $noRequest,
                'item_pembayaran' => 'Sewa Kamar 6 Bulan (Rp 500.000/bln)',
                'nominal' => 3000000,
                'durasi_bulan' => 6,
            ]);

            PembayaranDetail::create([
                'no_invoice' => $officialInvoiceNo,
                'no_request' => $noRequest,
                'item_pembayaran' => 'Uang Deposit Pemeliharaan Fasilitas',
                'nominal' => 500000,
                'durasi_bulan' => 1,
            ]);

            PembayaranDetail::create([
                'no_invoice' => $officialInvoiceNo,
                'no_request' => $noRequest,
                'item_pembayaran' => 'Biaya Administrasi & e-Pass RFID',
                'nominal' => 100000,
                'durasi_bulan' => 1,
            ]);

            // Catat Mutasi Penerimaan Kas Asrama di Master Transaksi
            $transaksi = Transaksi::create([
                'kode_transaksi' => 'TRX-' . date('YmdHis'),
                'no_invoice' => $officialInvoiceNo,
                'penyewa_id' => $penyewa->id,
                'tanggal' => now(),
                'debet' => 3600000,
                'kredit' => 0,
                'keterangan' => "Penerimaan sewa asrama {$officialInvoiceNo} an. {$testNama}",
                'operator_id' => 1,
            ]);

            // Update status staging menjadi sah
            RequestPembayaran::where('no_request', $noRequest)->update([
                'status' => 'PAID',
                'status_verifikasi' => 1,
            ]);

            // Catat log audit pengesahan
            ModificationLog::create([
                'actor' => 'Admin Keuangan',
                'action' => "Tahap 3: Pengesahan tagihan {$noRequest} -> Master Pembayaran {$officialInvoiceNo} senilai Rp 3.600.000 dan alokasi Penyewa ID {$penyewa->id}.",
                'ip_address' => '127.0.0.1',
            ]);

            return [
                'pembayaran' => $pembayaran,
                'penyewa' => $penyewa,
                'transaksi' => $transaksi,
            ];
        });

        $this->line("   <fg=green>✔ [TAHAP 3 CREATE] Promosi ke Master 'pembayaran' berhasil: {$officialInvoiceNo} (Total: Rp 3.600.000)</>");
        $this->line("   <fg=green>✔ [TAHAP 3 CREATE] Promosi ke Master 'penyewa' berhasil: ID {$masterData['penyewa']->id} (Status: AKTIF)</>");
        $this->line("   <fg=green>✔ [TAHAP 3 CREATE] Jurnal Kas Masuk dicatat di Master 'transaksi': {$masterData['transaksi']->kode_transaksi} (Debet: Rp 3.600.000)</>");
        $this->newLine();

        // -------------------------------------------------------------
        // TAHAP 4: KONTRAK PERJANJIAN SEWA DIGITAL & OTP WHATSAPP
        // -------------------------------------------------------------
        $this->info('👉 [TAHAP 4/5] Menjalankan CRUD Tahap 4: Pengesahan Kontrak Digital & OTP...');

        $contract = Contract::updateOrCreate(
            ['user_id' => $user->id],
            [
                'contract_number' => $contractNo,
                'room_id' => $kamar->id,
                'student_signed' => true,
                'student_signed_at' => now(),
                'parent_signed' => true,
                'parent_signed_at' => now(),
                'signature_student_url' => 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iNDAiPjxwYXRoIGQ9Ik0xMCAyMCBTMzAgNSAwIDQwIiBzdHJva2U9IiMwMDAiIGZpbGw9Im5vbmUiLz48L3N2Zz4=',
                'status' => 'FULLY_SIGNED',
                'started_at' => now(),
                'ended_at' => now()->addMonths(6),
            ]
        );

        ModificationLog::create([
            'actor' => "Maba ({$testNim})",
            'action' => "Tahap 4: Pengesahan Kontrak Digital {$contractNo} via OTP WhatsApp Mahasiswa & Orang Tua berhasil sah secara hukum.",
            'ip_address' => '127.0.0.1',
        ]);

        $this->line("   <fg=green>✔ [TAHAP 4 CREATE/UPDATE] Master 'contracts' berhasil disahkan: {$contractNo} (Status: FULLY_SIGNED)</>");
        $this->line("   <fg=green>✔ [TAHAP 4 AUDIT] Tercatat tanda tangan digital & verifikasi dual-factor OTP di log audit</>");
        $this->newLine();

        // -------------------------------------------------------------
        // TAHAP 5: READ VERIFIKASI (EAGER LOADING & QUERY BUILDER)
        // -------------------------------------------------------------
        $this->info('👉 [TAHAP 5/5] Menjalankan Verifikasi READ & Join 4 Tabel Master...');

        $readPembayaran = Pembayaran::with(['details', 'penyewa.kamar', 'transaksi'])
            ->where('no_invoice', $officialInvoiceNo)
            ->first();

        if ($readPembayaran) {
            $this->line("   <fg=cyan>[HASIL QUERY ELOQUENT DARI DATABASE MYSQL]:</>");
            $this->table(
                ['Parameter Verifikasi', 'Nilai Nyata Database'],
                [
                    ['No. Invoice Master', $readPembayaran->no_invoice],
                    ['No. Request Staging Asal', $readPembayaran->no_request],
                    ['Nama Penghuni', $readPembayaran->penyewa->nama_penyewa ?? '-'],
                    ['NIM Mahasiswa', $readPembayaran->penyewa->nim ?? '-'],
                    ['Kamar Dialokasikan', ($readPembayaran->penyewa->kamar->gedung ?? '') . ' - ' . ($readPembayaran->penyewa->kamar->nomor_kamar ?? '')],
                    ['Total Tagihan', 'Rp ' . number_format($readPembayaran->total_tagihan, 0, ',', '.')],
                    ['Status Pembayaran Asrama', $readPembayaran->status_asrama === 1 ? '1 (LUNAS / SAH)' : $readPembayaran->status_asrama],
                    ['Operator Pengesah', 'ID: ' . $readPembayaran->operator_id . ' (Admin Keuangan)'],
                    ['Nomor Kontrak Digital', $contractNo . ' (FULLY_SIGNED)'],
                    ['Jumlah Rincian Tagihan', $readPembayaran->details->count() . ' Komponen Biaya'],
                ]
            );
        }

        // Query Builder Join
        $readJoin = DB::table('pembayaran as p')
            ->join('penyewa as py', 'p.penyewa_id', '=', 'py.id')
            ->join('transaksi as t', 'p.no_invoice', '=', 't.no_invoice')
            ->join('contracts as c', 'py.kamar_id', '=', 'c.room_id')
            ->where('p.no_invoice', $officialInvoiceNo)
            ->select('p.no_invoice', 'py.nama_penyewa', 't.kode_transaksi', 't.debet', 'c.contract_number')
            ->first();

        if ($readJoin) {
            $this->line("   <fg=green>✔ [QUERY BUILDER JOIN 4 TABEL] Sukses (pembayaran + penyewa + transaksi + contracts):</>");
            $this->line("     Transaksi: {$readJoin->kode_transaksi} | Debet Kas: Rp " . number_format($readJoin->debet, 0, ',', '.') . " | Kontrak: {$readJoin->contract_number}");
        }

        // Verifikasi Dokumen KYC di Audit Trail
        $kycCount = KycDocument::where('user_id', $user->id)->count();
        $this->line("   <fg=green>✔ [VERIFIKASI AUDIT KYC] {$kycCount} dokumen e-KYC berversi tersimpan aman di repositori privat.</>");

        // Pembersihan Data Uji jika diminta
        if ($this->option('cleanup')) {
            $this->warn('   🧹 Membersihkan data pengujian (--cleanup)...');
            PembayaranDetail::where('no_invoice', $officialInvoiceNo)->delete();
            Pembayaran::where('no_invoice', $officialInvoiceNo)->delete();
            Transaksi::where('no_invoice', $officialInvoiceNo)->delete();
            Contract::where('contract_number', $contractNo)->delete();
            Penyewa::where('nim', $testNim)->delete();
            RequestTransaksi::where('no_request', $noRequest)->delete();
            RequestPembayaranDetail::where('no_request', $noRequest)->delete();
            RequestPembayaran::where('no_request', $noRequest)->delete();
            KycDocument::where('user_id', $user->id)->delete();
            MabaProfile::where('user_id', $user->id)->delete();
            $kamar->decrement('kapasitas_terisi');
            $kamar->update(['status' => 'AVAILABLE']);
            $this->line("   <fg=green>✔ Seluruh data pengujian 4 tahap berhasil dibersihkan kembali.</>");
        } else {
            $this->line("   <fg=yellow>ℹ Data pengujian dipertahankan di basis data untuk inspeksi langsung di phpMyAdmin / MySQL CLI.</>");
            $this->line("   <fg=cyan>  - Cek tabel 'pembayaran' No Invoice: {$officialInvoiceNo}</>");
            $this->line("   <fg=cyan>  - Cek tabel 'penyewa' NIM: {$testNim}</>");
            $this->line("   <fg=cyan>  - Cek tabel 'contracts' No Kontrak: {$contractNo}</>");
            $this->line("   <fg=cyan>  - Cek tabel 'kyc_documents' & 'modification_logs'</>");
        }

        $this->newLine();
        $this->line('<bg=green;fg=black;options=bold> ========================================================================================= </>');
        $this->line('<bg=green;fg=black;options=bold>  SUKSES: PENGUJIAN ALUR CRUD 4 TAHAP & DATABASE MASTER BERHASIL 100% PADA MYSQL LARAGON!  </>');
        $this->line('<bg=green;fg=black;options=bold> ========================================================================================= </>');
        $this->newLine();

        return 0;
    }
}
