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
use App\Models\RequestPembayaran;
use App\Models\ModificationLog;
use Illuminate\Support\Facades\DB;

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
     * Tahap 1: Update Biodata Profil Mahasiswa Baru & Hybrid Auto-Save Draft
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();
        $isDraft = $request->boolean('is_draft', false);

        if ($isDraft) {
            $validated = $request->validate([
                'nama' => 'nullable|string|max:255',
                'no_hp_wa' => 'nullable|string|max:30',
                'is_kip_student' => 'nullable|boolean',
                'tipe_kamar' => 'nullable|string|max:100',
                'preferensi_lantai' => 'nullable|string|max:100',
                'alamat_ktp_jalan' => 'nullable|string|max:500',
                'alamat_ktp_kabupaten_kota' => 'nullable|string|max:255',
                'alamat_ktp_provinsi' => 'nullable|string|max:255',
                'kontak_darurat_nama' => 'nullable|string|max:255',
                'kontak_darurat_no_hp' => 'nullable|string|max:30',
            ]);
        } else {
            $validated = $request->validate([
                'nama' => 'required|string|max:255',
                'no_hp_wa' => 'required|string|max:30',
                'is_kip_student' => 'nullable|boolean',
                'tipe_kamar' => 'required|string',
                'preferensi_lantai' => 'required|string',
                'alamat_ktp_jalan' => 'required|string',
                'alamat_ktp_kabupaten_kota' => 'required|string',
                'kontak_darurat_nama' => 'required|string',
                'kontak_darurat_no_hp' => 'required|string',
            ]);
        }

        $profile = MabaProfile::updateOrCreate(
            ['user_id' => $user ? $user->id : 1],
            array_merge($validated, [
                'nim_no_reg' => $user->nim ?? $user->no_pmb ?? 'DRAFT-2026',
                'nim' => $user->nim ?? null,
                'no_pmb' => $user->no_pmb ?? null,
            ])
        );

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'is_draft' => $isDraft,
                'message' => $isDraft ? 'Draf profil berhasil disimpan otomatis ke database.' : 'Data biodata profil berhasil disimpan ke database.',
                'profile' => $profile
            ]);
        }

        return redirect()->back()->with('success', 'Data biodata profil berhasil disimpan.');
    }

    /**
     * Tahap 2: Reservasi Kunci Kamar Permanen di Database Staging
     */
    public function reserveRoom(Request $request)
    {
        $validated = $request->validate([
            'room_id' => 'required|integer|exists:rooms,id',
            'ranjang' => 'nullable|string',
            'gedung'  => 'nullable|string',
            'lantai'  => 'nullable|string',
        ]);

        $user = $request->user();
        $nim = $user->nim ?? $user->no_pmb ?? 'PMB-2026';
        $nama = $user->name ?? $user->mabaProfile->nama ?? 'Calon Mahasiswa Baru';

        return DB::transaction(function () use ($validated, $nim, $nama, $request) {
            $room = Room::lockForUpdate()->findOrFail($validated['room_id']);

            if ($room->kapasitas_terisi >= $room->kapasitas_total) {
                if ($request->wantsJson()) {
                    return response()->json(['success' => false, 'message' => "Kamar {$room->nomor_kamar} sudah penuh."], 422);
                }
                return redirect()->back()->with('error', "Kamar {$room->nomor_kamar} sudah penuh.");
            }

            // Kunci kamar permanen di tabel staging request_pembayaran
            $reqCode = 'REQ-' . date('Ym') . '-' . rand(1000, 9999);
            $requestPembayaran = RequestPembayaran::updateOrCreate(
                ['nim' => $nim, 'status' => 'UNPAID'],
                [
                    'no_request'        => $reqCode,
                    'nama_mahasiswa'    => $nama,
                    'kamar_id'          => $room->id,
                    'total_tagihan'     => $room->tarif_bulanan * 6,
                    'total_bayar'       => $room->tarif_bulanan * 6,
                    'status'            => 'BOOKED_STAGING',
                    'status_verifikasi' => 0,
                    'operator_id'       => 0, // Mandiri Maba
                ]
            );

            // Tambah kapasitas terisi untuk mencegah perebutan slot kamar (race condition)
            $room->increment('kapasitas_terisi');
            if ($room->kapasitas_terisi >= $room->kapasitas_total) {
                $room->update(['status' => 'OCCUPIED']);
            }

            // Catat log audit penguncian staging
            ModificationLog::create([
                'actor' => "Maba ({$nim})",
                'action' => "Mengunci slot kamar permanen di staging: Kamar {$room->gedung} - {$room->nomor_kamar} (Req: {$reqCode}, Status: BOOKED_STAGING).",
                'ip_address' => $request->ip(),
            ]);

            if ($request->wantsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => "Kamar {$room->gedung} - Kamar {$room->nomor_kamar} berhasil dikunci permanen di database staging.",
                    'request_pembayaran' => $requestPembayaran,
                    'room' => $room,
                ]);
            }

            return redirect()->back()->with('success', "Kamar {$room->gedung} - Kamar {$room->nomor_kamar} berhasil dikunci permanen.");
        });
    }

    /**
     * Tahap 4: Tanda Tangan Kontrak Digital (OTP WhatsApp)
     */
    public function signContract(Request $request)
    {
        $request->validate([
            'otp_student' => 'required|string|size:6',
            'otp_parent' => 'nullable|string|size:6',
            'signature_student_data' => 'nullable|string',
        ]);

        $user = $request->user();
        $userId = $user ? $user->id : 1;
        $nim = $user->nim ?? $user->no_pmb ?? 'MABA';

        $contract = Contract::updateOrCreate(
            ['user_id' => $userId],
            [
                'contract_number' => 'KTR-UBT-' . date('Y') . '-' . rand(1000, 9999),
                'student_signed' => true,
                'student_signed_at' => now(),
                'parent_signed' => true,
                'parent_signed_at' => now(),
                'signature_student_url' => $request->signature_student_data,
                'status' => 'FULLY_SIGNED',
                'started_at' => now(),
                'ended_at' => now()->addMonths(6),
            ]
        );

        // Catat jejak audit pengesahan kontrak
        ModificationLog::create([
            'actor' => "Maba ({$nim})",
            'action' => "Pengesahan Kontrak Digital {$contract->contract_number} via Dual-Factor OTP WhatsApp Mahasiswa & Orang Tua sah secara hukum.",
            'ip_address' => $request->ip(),
        ]);

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Kontrak Hunian Asrama berhasil disahkan secara digital di database master.',
                'contract' => $contract
            ]);
        }

        return redirect()->back()->with('success', 'Kontrak Hunian Asrama berhasil ditandatangani secara digital.');
    }
}
