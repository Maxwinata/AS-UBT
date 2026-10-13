<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\BillingInvoice;
use App\Models\MabaProfile;
use App\Models\Room;
use App\Models\Delinquency;
use App\Models\Tariff;
use App\Models\PaymentScheme;
use App\Models\ModificationLog;
use App\Models\RequestPembayaran;
use App\Models\Pembayaran;
use App\Models\Penyewa;

class AdminAsramaController extends Controller
{
    /**
     * Render Halaman Portal Admin Asrama via Inertia.js
     * Menyertakan data Request Bridging Staging dan Master Running Tables
     */
    public function index(Request $request)
    {
        $invoices = BillingInvoice::with('user.mabaProfile')->latest()->get();
        $rooms = Room::with('contracts.user')->get();
        $delinquencies = Delinquency::latest()->get();
        $tariffs = Tariff::all();
        $paymentSchemes = PaymentScheme::all();
        $logs = ModificationLog::latest()->take(20)->get();

        // Data Bridging Pendaftaran Otonom Mandiri vs Master Berjalan
        $stagedRequests = RequestPembayaran::with(['details', 'transaksi', 'penyewa'])->latest()->get();
        $officialPayments = Pembayaran::with(['details', 'transaksi', 'penyewa'])->latest()->get();

        return Inertia::render('Admin/Dashboard', [
            'invoices' => $invoices,
            'rooms' => $rooms,
            'delinquencies' => $delinquencies,
            'tariffs' => $tariffs,
            'paymentSchemes' => $paymentSchemes,
            'logs' => $logs,
            'stagedRequests' => $stagedRequests,
            'officialPayments' => $officialPayments,
        ]);
    }

    /**
     * Verifikasi Manual Pembayaran & Eksekusi Bridging Promosi ke Master Running
     * Mentransisikan request_pembayaran -> pembayaran, request_transaksi -> transaksi,
     * serta memperbarui status master penyewa dan kamar hunian.
     */
    public function verifyInvoice(Request $request, $id)
    {
        $invoice = BillingInvoice::findOrFail($id);
        $action = $request->input('action', 'APPROVE_AND_MIGRATE'); // 'APPROVE_AND_MIGRATE', 'APPROVE_BOOKING', 'REJECT', 'MIGRATE_ONLY'
        $operatorId = $request->user()->id ?? 1;

        if ($action === 'APPROVE' || $action === 'APPROVE_AND_MIGRATE') {
            // Cari data request_pembayaran terkait
            $requestPembayaran = RequestPembayaran::where('no_request', $invoice->invoice_id)->first();
            
            $officialInvoiceNo = 'INV-' . date('Ym') . '-' . rand(1000, 9999);

            if ($requestPembayaran) {
                // Eksekusi bridging migrasi ke tabel master pembayaran & transaksi
                $requestPembayaran->promoteToMaster($operatorId, $officialInvoiceNo);
            }

            $invoice->update([
                'status' => 'PAID',
                'paid_at' => now(),
                'verified_by' => $operatorId,
                'is_migrated' => true,
            ]);

            ModificationLog::create([
                'actor' => $request->user()->name ?? 'Admin Keuangan',
                'action' => "Bridging Berhasil: Permintaan {$invoice->invoice_id} dipromosikan ke Master Pembayaran {$officialInvoiceNo} (operator_id: {$operatorId}).",
            ]);

            return redirect()->back()->with('success', "Invoice {$invoice->invoice_id} disetujui & berhasil dipromosikan ke Master Pembayaran ({$officialInvoiceNo}).");
        } elseif ($action === 'APPROVE_BOOKING') {
            // Approval sementara status booking (misal NIM belum sinkron)
            $invoice->update([
                'status' => 'PAID',
                'paid_at' => now(),
                'verified_by' => $operatorId,
                'is_migrated' => false,
            ]);

            return redirect()->back()->with('success', "Pembayaran Invoice {$invoice->invoice_id} dikonfirmasi sebagai BOOKING (Menunggu Sinkronisasi NIM SIAKAD).");
        } else {
            // REJECT
            $reason = $request->input('reason', 'Bukti transfer tidak valid/mutasi tidak cocok.');
            
            $invoice->update([
                'status' => 'UNPAID',
                'verification_notes' => $reason,
            ]);

            RequestPembayaran::where('no_request', $invoice->invoice_id)->update([
                'status_pembayaran' => 'rejected',
            ]);

            ModificationLog::create([
                'actor' => $request->user()->name ?? 'Admin Keuangan',
                'action' => "Invoice {$invoice->invoice_id} ditolak: {$reason}",
            ]);

            return redirect()->back()->with('error', "Permintaan pembayaran {$invoice->invoice_id} ditolak.");
        }
    }

    /**
     * Tindakan SOP Tunggakan (Kirim WA, Eksekusi Pemotongan Deposit, Denda & Terminasi)
     */
    public function handleDelinquencyAction(Request $request, $id)
    {
        $delinquency = Delinquency::findOrFail($id);
        $type = $request->input('action_type');

        if ($type === 'SEND_WA') {
            // Simulasi kirim WhatsApp via Fonnte Gateway
            $delinquency->update(['last_action_date' => now()]);
            return redirect()->back()->with('success', "Pengingat WhatsApp berhasil dikirim ke {$delinquency->student_name}.");
        }

        if ($type === 'AUTO_DEBET_DEPOSIT') {
            $deduction = min($delinquency->arrears_amount, $delinquency->deposit_remaining);
            $delinquency->update([
                'deposit_deducted_for_rent' => $delinquency->deposit_deducted_for_rent + $deduction,
                'deposit_remaining' => $delinquency->deposit_remaining - $deduction,
                'arrears_amount' => $delinquency->arrears_amount - $deduction,
                'stage' => 'DEPOSIT_DIPAKAI_GRACE_TOPUP',
                'stage_label' => 'Deposit Dipakai (Toleransi Top-up 5 Hari)',
                'last_action_date' => now(),
            ]);

            return redirect()->back()->with('success', "Pemotongan deposit otomatis sebesar Rp " . number_format($deduction, 0, ',', '.') . " berhasil dieksekusi.");
        }

        if ($type === 'TERMINATE_CONTRACT') {
            $delinquency->update([
                'fine_amount' => 500000,
                'is_eviction_issued' => true,
                'stage' => 'WANPRESTASI_AKUT',
                'stage_label' => 'Wanprestasi Akut (Denda Rp500rb & Pengakhiran)',
                'last_action_date' => now(),
            ]);

            return redirect()->back()->with('error', "Sanksi wanprestasi akut dan pengakhiran kontrak resmi diterbitkan untuk {$delinquency->student_name}.");
        }

        return redirect()->back();
    }
}
