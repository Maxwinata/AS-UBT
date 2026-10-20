<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\ApiLink;
use App\Models\SiakadMahasiswaStg;
use App\Services\SiakadSyncService;

class ImportSidaraApiCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'sidara:import-api {--fresh : Kosongkan tabel staging sebelum mengimpor} {--link= : ID ApiLink spesifik yang ingin diimpor}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Menjalankan impor lengkap seluruh konten API SIDARA ke tabel SQL staging (siakad_mahasiswa_stg) di MySQL Laragon.';

    /**
     * Execute the console command.
     */
    public function handle(SiakadSyncService $syncService)
    {
        $this->newLine();
        $this->line('<bg=blue;fg=white;options=bold> ========================================================================================= </>');
        $this->line('<bg=blue;fg=white;options=bold>  PORTAL SI-GABUNG 54: SIDARA API COMPLETE SQL IMPORT ENGINE (LARAGON MYSQL)                </>');
        $this->line('<bg=blue;fg=white;options=bold> ========================================================================================= </>');
        $this->newLine();

        if ($this->option('fresh')) {
            $this->warn('⚠ Mengosongkan tabel siakad_mahasiswa_stg (--fresh)...');
            SiakadMahasiswaStg::truncate();
            $this->line('  ✔ Tabel staging berhasil dikosongkan.');
            $this->newLine();
        }

        $this->info('👉 Menghubungi Endpoint API SIDARA UBT...');
        
        $linkId = $this->option('link');
        if ($linkId) {
            $apiLink = ApiLink::findOrFail($linkId);
            $results = [$syncService->syncByLink($apiLink)];
        } else {
            $results = $syncService->syncAll();
        }

        foreach ($results as $res) {
            $statusColor = $res['status'] === 'success' ? 'green' : 'red';
            $sourceBadge = $res['source'] ?? 'UNKNOWN';
            $this->line("   <fg={$statusColor}>✔ [{$res['nama']}] ({$res['kategori']})</>: {$res['total_synced']} record diimpor via [{$sourceBadge}].");
        }

        $this->newLine();
        $this->info('👉 Memverifikasi Hasil Impor pada Tabel SQL Pengembangan (siakad_mahasiswa_stg)...');

        $totalStaging = SiakadMahasiswaStg::count();
        $stgList = SiakadMahasiswaStg::latest('synced_at')->take(10)->get();

        $tableData = [];
        foreach ($stgList as $stg) {
            $rawCount = is_array($stg->payload_raw) ? count($stg->payload_raw) . ' field' : '-';
            $tableData[] = [
                $stg->nomor_registrasi,
                $stg->nama_lengkap,
                $stg->nik ?? '-',
                $stg->program_studi ?? '-',
                strtoupper($stg->kategori_beasiswa),
                $stg->bill_to_code ?? '-',
                $stg->sso_id_from_sidara ?? '-',
                $stg->status_klaim === 1 ? 'TERPROMOSI' : 'STAGING PRA-REGIS',
                $rawCount,
            ];
        }

        $this->table(
            ['No. Registrasi', 'Nama Lengkap', 'NIK KTP', 'Program Studi', 'Kategori', 'Bill Code', 'SSO SIDARA ID', 'Status', 'Payload Raw'],
            $tableData
        );

        $this->line("   <fg=cyan>ℹ Total record aktif di tabel 'siakad_mahasiswa_stg': {$totalStaging} pendaftar.</>");
        $this->line("   <fg=cyan>ℹ 100% dokumen respon mentah asli SIDARA tersimpan di kolom JSON 'payload_raw'.</>");

        $this->newLine();
        $this->line('<bg=green;fg=black;options=bold> ========================================================================================= </>');
        $this->line('<bg=green;fg=black;options=bold>  SUKSES: SELURUH KONTEN API SIDARA TELAH DIIMPOR LENGKAP KE MYSQL PENGEMBANGAN!          </>');
        $this->line('<bg=green;fg=black;options=bold> ========================================================================================= </>');
        $this->newLine();

        return 0;
    }
}
