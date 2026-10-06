<?php

namespace App\Http\Controllers\Billing;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\BillingInvoice;
use App\Models\Tariff;
use App\Models\PaymentScheme;

class InvoiceController extends Controller
{
    /**
     * Konfigurasi Pilihan Durasi Sewa dan Skema Cicilan Deposit Mahasiswa
     */
    public function configure(Request $request)
    {
        $request->validate([
            'durasi_bayar' => 'required|integer|in:1,2,3,6,12',
            'opsi_deposit' => 'required|integer|in:1,2,3',
            'durasi_kontrak_total' => 'required|integer|min:6',
        ]);

        $user = $request->user();
        $isKip = $user->is_kip_student ?? false;
        $category = $isKip ? 'KIP' : 'REGULER';

        $tarifSewa = Tariff::where('category', 'SEWA')->first()->amount ?? 500000;
        $tarifDeposit = Tariff::where('category', 'DEPOSIT')->where('target', $category)->first()->amount ?? ($isKip ? 500000 : 1000000);
        
        // BIAYA ADMINISTRASI ACUAN (RP 100.000)
        $tarifPerlengkapan = Tariff::where('category', 'PERLENGKAPAN')->first()->amount ?? 100000;

        $scheme = PaymentScheme::where('target', $category)->first();
        $isDepositInstallmentAllowed = $scheme->allow_deposit_installment ?? false;
        $maxCicilan = $scheme->max_installments ?? 1;
        $multiplier = $scheme->installment_multiplier ?? 1.0;

        $validOpsiDeposit = $isDepositInstallmentAllowed ? min($request->opsi_deposit, $maxCicilan) : 1;
        $biayaSewaInitial = $request->durasi_bayar * $tarifSewa;
        $biayaSewaTotalKontrak = $request->durasi_kontrak_total * $tarifSewa;
        $sisaSewaKontrak = max(0, $biayaSewaTotalKontrak - $biayaSewaInitial);

        $isCicilanDeposit = $isDepositInstallmentAllowed && $validOpsiDeposit > 1;
        $biayaDepositTotal = $isCicilanDeposit ? ($tarifDeposit * $multiplier) : $tarifDeposit;
        $biayaDepositTermin1 = $biayaDepositTotal / $validOpsiDeposit;
        $sisaCicilanDeposit = $biayaDepositTotal - $biayaDepositTermin1;

        $kodeUnik = rand(100, 999);
        $totalBayar = $biayaSewaInitial + $biayaDepositTermin1 + $tarifPerlengkapan + $kodeUnik;

        $invoice = BillingInvoice::updateOrCreate(
            ['user_id' => $user->id, 'status' => 'UNPAID'],
            [
                'invoice_id' => 'INV-UBT-' . date('Y') . '-' . rand(1000, 9999),
                'nim' => $user->nim ?? $user->no_pmb,
                'nama' => $user->name,
                'is_kip' => $isKip,
                'durasi_bulan' => $request->durasi_kontrak_total,
                'skema_bayar_sewa' => $request->durasi_bayar >= $request->durasi_kontrak_total ? 'LUNAS_DIMUKA' : 'BULANAN',
                'tarif_per_bulan' => $tarifSewa,
                'biaya_sewa' => $biayaSewaInitial,
                'biaya_sewa_total_kontrak' => $biayaSewaTotalKontrak,
                'sisa_sewa_kontrak' => $sisaSewaKontrak,
                'is_cicilan_deposit' => $isCicilanDeposit,
                'opsi_cicilan' => $validOpsiDeposit,
                'biaya_deposit' => $biayaDepositTermin1,
                'biaya_deposit_total' => $biayaDepositTotal,
                'sisa_cicilan_deposit' => $sisaCicilanDeposit,
                'cicilan_deposit_allowed' => $isDepositInstallmentAllowed,
                'biaya_perlengkapan' => $tarifPerlengkapan, // Biaya Administrasi Rp 100.000
                'kode_unik' => $kodeUnik,
                'total_bayar' => $totalBayar,
            ]
        );

        return redirect()->back()->with('success', 'Rincian tagihan invoice berhasil diperbarui.');
    }

    /**
     * Upload Bukti Transfer Manual Bank BSI
     */
    public function uploadTransferProof(Request $request, $id)
    {
        $request->validate([
            'bukti_transfer' => 'required|image|mimes:jpeg,png,jpg|max:5120',
        ]);

        $invoice = BillingInvoice::findOrFail($id);
        $path = $request->file('bukti_transfer')->store('proofs/bsi', 'public');

        $invoice->update([
            'bukti_transfer_path' => $path,
            'status' => 'PENDING_VERIFICATION',
            'metode_bayar' => 'TRANSFER_MANUAL',
        ]);

        return redirect()->back()->with('success', 'Bukti transfer berhasil diunggah. Menunggu verifikasi Bagian Keuangan.');
    }
}
