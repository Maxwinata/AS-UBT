<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use App\Models\RequestPembayaran;
use App\Models\Room;
use App\Models\ModificationLog;
use Carbon\Carbon;

class ReleaseExpiredReservationsCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'asrama:release-expired-reservations 
                            {--dry-run : Menampilkan reservasi kedaluwarsa tanpa mengubah data}
                            {--hours=48 : Batas waktu toleransi jam (default 48 jam)}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Melepas kuota kamar yang terkunci pada tahap staging jika pendaftar belum menyelesaikan pembayaran dalam kurun waktu 48 jam (Pilar 2 Hostinger)';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $hours = (int) $this->option('hours');
        $isDryRun = $this->option('dry-run');
        $cutoffTime = Carbon::now()->subHours($hours);

        $this->newLine();
        $this->line('<bg=cyan;fg=black;options=bold> ========================================================================= </>');
        $this->line("<bg=cyan;fg=black;options=bold>  CRON OPERASIONAL HOSTINGER: AUTO-RELEASE RESERVASI KAMAR (TENGGAT {$hours} JAM)  </>");
        $this->line('<bg=cyan;fg=black;options=bold> ========================================================================= </>');
        $this->newLine();

        $this->info("🔍 Memeriksa antrean reservasi berstatus UNPAID / BOOKED_STAGING sebelum: {$cutoffTime->format('Y-m-d H:i:s')} WIB");

        try {
            // Cari data staging yang telah melampaui 48 jam
            $expiredReservations = DB::table('request_pembayaran')
                ->where('status', 'UNPAID')
                ->where(function ($query) use ($cutoffTime) {
                    $query->where('expires_at', '<=', Carbon::now())
                          ->orWhere(function ($q) use ($cutoffTime) {
                              $q->whereNull('expires_at')
                                ->where('created_at', '<=', $cutoffTime);
                          });
                })
                ->get();

            $totalExpired = $expiredReservations->count();

            if ($totalExpired === 0) {
                $this->line('   <fg=green>✔ Tidak ada reservasi yang melewati batas waktu 48 jam. Semua alokasi kamar aktif dan valid.</>');
                $this->newLine();
                return 0;
            }

            $this->warn("⚠️  Ditemukan {$totalExpired} reservasi yang melewati batas waktu {$hours} jam.");

            foreach ($expiredReservations as $res) {
                $nim = $res->nim ?? 'Unknown';
                $kamarId = $res->kamar_id ?? null;
                $noRequest = $res->no_request ?? "REQ-{$res->id}";

                $this->line("   -> Memproses Request: <fg=yellow>{$noRequest}</> | Mahasiswa: <fg=white>{$nim}</> | Kamar ID: {$kamarId}");

                if ($isDryRun) {
                    $this->line("      <fg=cyan>[DRY-RUN]</> Kamar {$kamarId} akan dilepas kembali ke pool umum.");
                    continue;
                }

                DB::beginTransaction();
                try {
                    // 1. Update status tagihan staging menjadi EXPIRED
                    DB::table('request_pembayaran')
                        ->where('id', $res->id)
                        ->update([
                            'status' => 'EXPIRED',
                            'updated_at' => Carbon::now(),
                        ]);

                    // 2. Lepaskan kuota terisi pada kamar jika ada
                    if ($kamarId) {
                        DB::table('kamar')
                            ->where('id', $kamarId)
                            ->where('terisi', '>', 0)
                            ->decrement('terisi');
                    }

                    // 3. Catat ke rekam jejak audit (Audit Trail)
                    DB::table('modification_logs')->insert([
                        'actor' => 'System (Hostinger Cron Auto-Release)',
                        'action' => "Auto-Release 48 Jam: Kamar ID {$kamarId} otomatis dilepas kembali ke kuota umum karena tagihan {$noRequest} ({$nim}) tidak diselesaikan dalam 48 jam.",
                        'timestamp' => Carbon::now()->toIso8601String(),
                        'created_at' => Carbon::now(),
                        'updated_at' => Carbon::now(),
                    ]);

                    DB::commit();
                    $this->line("      <fg=green>✔ Berhasil dilepas.</> Kamar {$kamarId} kembali tersedia untuk calon penghuni lain.");
                } catch (\Exception $e) {
                    DB::rollBack();
                    $this->error("      ✘ Gagal memproses request {$noRequest}: " . $e->getMessage());
                }
            }

            $this->newLine();
            $this->line("<fg=green;options=bold>Pelepasan otomatis 48 jam selesai. Kuota kamar telah disinkronkan kembali.</>");
            $this->newLine();

            return 0;
        } catch (\Exception $e) {
            $this->error("✘ Terjadi kesalahan saat menjalankan cron auto-release: " . $e->getMessage());
            return 1;
        }
    }
}
