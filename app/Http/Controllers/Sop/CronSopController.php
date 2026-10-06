<?php

namespace App\Http\Controllers\Sop;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Delinquency;
use Carbon\Carbon;

class CronSopController extends Controller
{
    /**
     * Tampilan Monitor Mesin CRON SOP Penegakan Toleransi 5+5 Hari & Pemotongan Deposit
     */
    public function index()
    {
        $delinquencies = Delinquency::latest()->get();
        return Inertia::render('Sop/CronMonitor', [
            'delinquencies' => $delinquencies,
            'cronStatus' => [
                'lastRun' => now()->subHours(2)->toIso8601String(),
                'nextRun' => now()->addHours(22)->toIso8601String(),
                'activeJobs' => 4,
            ],
        ]);
    }

    /**
     * Eksekusi Manual Mesin CRON SOP Toleransi 5+5 Hari (Dipanggil via artisan sop:enforce-grace atau HTTP test)
     */
    public function runDailyEnforcement()
    {
        $today = Carbon::today();
        $processed = 0;

        $activeDelinquencies = Delinquency::where('stage', '!=', 'WANPRESTASI_AKUT')->get();

        foreach ($activeDelinquencies as $item) {
            $dueDate = Carbon::parse($item->due_date);
            $daysOverdue = max(0, $today->diffInDays($dueDate, false) * -1);

            $item->days_overdue = $daysOverdue;

            // Tahap 1: Toleransi Sewa 5 Hari Kalender (D+1 s/d D+5)
            if ($daysOverdue <= 5) {
                $item->stage = 'TOLERANSI_SEWA';
                $item->stage_label = 'Toleransi Sewa (0-5 Hari, Tanpa Denda)';
                $item->notes = 'Masa tenggang sewa aktif. Kirim notifikasi pengingat via WhatsApp.';
            }
            // Tahap 2: Auto-Debet Deposit & Toleransi Top-Up 5 Hari (D+6 s/d D+10)
            else if ($daysOverdue > 5 && $daysOverdue <= 10) {
                if ($item->deposit_remaining > 0 && $item->stage === 'TOLERANSI_SEWA') {
                    $deduction = min($item->arrears_amount, $item->deposit_remaining);
                    $item->deposit_deducted_for_rent += $deduction;
                    $item->deposit_remaining -= $deduction;
                    $item->arrears_amount -= $deduction;
                }
                $item->stage = 'DEPOSIT_DIPAKAI_GRACE_TOPUP';
                $item->stage_label = 'Deposit Dipakai (Toleransi Top-up 5 Hari s/d D+10)';
                $item->notes = 'Uang sewa dipotong dari deposit. Wajib top-up deposit sebelum D+10.';
            }
            // Tahap 3: Wanprestasi Akut (> D+10, misal D+11 dst)
            else {
                $item->stage = 'WANPRESTASI_AKUT';
                $item->stage_label = 'Wanprestasi Akut (Denda Rp500rb & Terminasi Kontrak)';
                $item->fine_amount = 500000;
                $item->is_eviction_issued = true;
                $item->notes = 'Melewati batas akhir 5+5 hari. Dikenakan denda Rp500.000, kontrak diakhiri & sisa deposit hangus.';
            }

            $item->save();
            $processed++;
        }

        return response()->json([
            'status' => 'success',
            'message' => "CRON SOP Toleransi 5+5 hari selesai dieksekusi. {$processed} data diperbarui.",
        ]);
    }
}
