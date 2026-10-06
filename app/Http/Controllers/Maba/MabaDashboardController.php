<?php

namespace App\Http\Controllers\Maba;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\MabaProfile;
use App\Models\BillingInvoice;
use App\Models\Room;
use App\Models\Contract;
use App\Models\Ticket;
use App\Models\Tariff;
use App\Models\PaymentScheme;

class MabaDashboardController extends Controller
{
    /**
     * Render Halaman Utama Dashboard Mahasiswa Baru via Inertia.js
     */
    public function index(Request $request)
    {
        $user = $request->user();
        
        $profile = $user ? $user->mabaProfile : null;
        $invoice = $user ? $user->invoices()->latest()->first() : null;
        $contract = $user ? $user->contract : null;
        $ticket = $user ? $user->ticket : null;

        $tariffs = Tariff::all();
        $paymentSchemes = PaymentScheme::all();
        $rooms = Room::where('status', 'AVAILABLE')->get();

        return Inertia::render('Maba/Dashboard', [
            'profile' => $profile,
            'invoice' => $invoice,
            'contract' => $contract,
            'ticket' => $ticket,
            'tariffs' => $tariffs,
            'paymentSchemes' => $paymentSchemes,
            'rooms' => $rooms,
        ]);
    }

    /**
     * Update Biodata Profil Mahasiswa Baru
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();
        $validated = $request->validate([
            'nama' => 'required|string|max:255',
            'no_hp_wa' => 'required|string|max:20',
            'is_kip_student' => 'nullable|boolean',
            'tipe_kamar' => 'required|string',
            'preferensi_lantai' => 'required|string',
            'alamat_ktp_jalan' => 'required|string',
            'alamat_ktp_kabupaten_kota' => 'required|string',
            'kontak_darurat_nama' => 'required|string',
            'kontak_darurat_no_hp' => 'required|string',
        ]);

        $profile = $user->mabaProfile()->updateOrCreate(
            ['user_id' => $user->id],
            $validated
        );

        return redirect()->back()->with('success', 'Data biodata profil berhasil disimpan.');
    }

    /**
     * Tanda Tangan Kontrak Digital (OTP WhatsApp)
     */
    public function signContract(Request $request)
    {
        $request->validate([
            'otp_student' => 'required|string|size:6',
            'otp_parent' => 'required|string|size:6',
            'signature_student_data' => 'nullable|string',
        ]);

        $user = $request->user();
        $contract = $user->contract()->firstOrCreate([
            'contract_number' => 'KTR-UBT-' . date('Y') . '-' . rand(1000, 9999),
        ]);

        $contract->update([
            'student_signed' => true,
            'student_signed_at' => now(),
            'parent_signed' => true,
            'parent_signed_at' => now(),
            'status' => 'FULLY_SIGNED',
            'started_at' => now(),
            'ended_at' => now()->addMonths(6),
        ]);

        return redirect()->back()->with('success', 'Kontrak Hunian Asrama berhasil ditandatangani secara digital.');
    }
}
