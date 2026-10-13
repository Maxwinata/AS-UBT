<?php

namespace App\Http\Controllers\Billing;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\BillingInvoice;
use App\Models\Tariff;
use App\Models\PaymentScheme;
use App\Models\Penyewa;
use App\Models\RequestPembayaran;
use App\Models\RequestPembayaranDetail;
use App\Models\RequestTransaksi;

class InvoiceController extends Controller
{
    /**
     * Konfigurasi Pilihan Durasi Sewa dan Skema Cicilan Deposit Mahasiswa
     * Menyimpan ke BillingInvoice dan tabel Bridging Staging Otonom:
     * - penyewa (operator_id = 0, status = 0)
     * - request_pembayaran (operator_id = 0, status_verifikasi = 0)
     * - request_pembayaran_detail (rincian komponen sewa, deposit, admin)
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
        $reqCode = 'REQ-' . date('Ym') . '-' . rand(1000, 9999);

        // 1. Simpan / Perbarui BillingInvoice untuk state Inertia
        $invoice = BillingInvoice::updateOrCreate(
            ['user_id' => $user->id, 'status' => 'UNPAID'],
            [
                'invoice_id' => $reqCode,
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

        // 2. Sinkronkan ke Tabel Penyewa (Staging Maba, operator_id = 0)
        $penyewa = Penyewa::updateOrCreate(
            ['nim' => $user->nim ?? $user->no_pmb],
            [
                'jenis_penyewa' => 'mahasiswa',
                'angkatan' => date('Y'),
                'namalengkap' => $user->name,
                'noktp' => $user->mabaProfile->nik ?? null,
                'nohp' => $user->mabaProfile->no_hp_wa ?? $user->phone ?? null,
                'kip' => $isKip ? 'KIP-KULIAH' : null,
                'email' => $user->email,
                'alamat' => $user->mabaProfile->alamat_ktp_jalan ?? null,
                'nama_bill_to' => $user->name,
                'status_asrama' => 0,
                'status' => 0,
                'operator_id' => 0, // Didaftarkan mandiri oleh Maba
            ]
        );

        // 3. Simpan ke Tabel Bridging: request_pembayaran
        $requestPembayaran = RequestPembayaran::updateOrCreate(
            ['no_request' => $invoice->invoice_id],
            [
                'tanggal_pembayaran' => null,
                'tanggal_masuk' => now(),
                'tanggal_keluar' => now()->addMonths($request->durasi_kontrak_total),
                'durasi' => $request->durasi_kontrak_total,
                'penyewa_id' => $penyewa->id,
                'nama_bill_to' => $user->name,
                'kamar_id' => null,
                'total_tagihan' => $totalBayar,
                'total_potongan_harga' => 0.00,
                'total_bayar' => $totalBayar,
                'status_pembayaran' => 'pending',
                'status_asrama' => 0,
                'status_catering' => 0,
                'status_verifikasi' => 0, // Menunggu review Admin
                'operator_id' => 0, // Otonom Maba
            ]
        );

        // 4. Simpan ke Tabel Bridging: request_pembayaran_detail
        // Hapus detail lama jika ada
        RequestPembayaranDetail::where('no_request', $invoice->invoice_id)->delete();

        // Baris 1: Biaya Sewa
        RequestPembayaranDetail::create([
            'no_request' => $invoice->invoice_id,
            'harga_id' => 1,
            'jenissewa' => "Sewa Asrama ({$request->durasi_bayar} Bulan)",
            'harga' => $tarifSewa,
            'qty' => $request->durasi_bayar,
            'jumlah_pembayaran' => (int) $biayaSewaInitial,
            'potongan_harga' => 0.00,
            'status' => 1,
        ]);

        // Baris 2: Deposit Jaminan
        RequestPembayaranDetail::create([
            'no_request' => $invoice->invoice_id,
            'harga_id' => 2,
            'jenissewa' => $isCicilanDeposit ? "Deposit Jaminan (Termin 1/{$validOpsiDeposit})" : 'Deposit Jaminan Hunian (Lunas)',
            'harga' => $biayaDepositTermin1,
            'qty' => 1,
            'jumlah_pembayaran' => (int) $biayaDepositTermin1,
            'potongan_harga' => 0.00,
            'status' => 1,
        ]);

        // Baris 3: Perlengkapan Awal & Biaya Administrasi
        RequestPembayaranDetail::create([
            'no_request' => $invoice->invoice_id,
            'harga_id' => 3,
            'jenissewa' => 'Biaya Administrasi & Fasilitas Awal',
            'harga' => $tarifPerlengkapan,
            'qty' => 1,
            'jumlah_pembayaran' => (int) $tarifPerlengkapan,
            'potongan_harga' => 0.00,
            'status' => 1,
        ]);

        return redirect()->back()->with('success', 'Rincian permintaan pembayaran mandiri (request_pembayaran) berhasil dibuat.');
    }

    /**
     * Upload Bukti Transfer Manual Bank BSI
     * Menyimpan ke storage dan mencatat ke tabel bridging: request_transaksi
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

        // Catat ke request_transaksi
        RequestTransaksi::updateOrCreate(
            ['no_request' => $invoice->invoice_id],
            [
                'no_transaksi' => 'TRX-' . $invoice->invoice_id,
                'tanggal_transaksi' => now(),
                'jumlah_uang' => $invoice->total_bayar,
                'metode_pembayaran' => 'Transfer Manual Bank BSI',
                'file_bukti' => $path,
                'operator_id' => 0, // Mandiri Maba
            ]
        );

        // Update status di request_pembayaran
        RequestPembayaran::where('no_request', $invoice->invoice_id)->update([
            'status_pembayaran' => 'pending_verification',
        ]);

        return redirect()->back()->with('success', 'Bukti transfer berhasil dicatat di request_transaksi. Menunggu verifikasi Bagian Keuangan.');
    }
}
