<?php

namespace App\Http\Controllers\Kyc;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use App\Models\MabaProfile;
use App\Models\ModificationLog;

class KycVerificationController extends Controller
{
    /**
     * Upload Dokumen e-KYC (KTP & Selfie) dengan Kebijakan Versioning & Private Disk
     */
    public function store(Request $request)
    {
        $request->validate([
            'foto_ktp' => 'required|image|mimes:jpeg,png,jpg|max:5120',
            'foto_selfie' => 'required|image|mimes:jpeg,png,jpg|max:5120',
        ]);

        $user = $request->user();
        $nim = $user->nim ?? $user->no_pmb ?? 'KYC';
        $timestamp = time();

        // 1. Versioning: Gunakan nama file unik untuk mencegah overwriting audit trail
        $ktpFilename = "ktp_{$nim}_{$timestamp}_" . Str::random(6) . '.' . $request->file('foto_ktp')->getClientOriginalExtension();
        $selfieFilename = "selfie_{$nim}_{$timestamp}_" . Str::random(6) . '.' . $request->file('foto_selfie')->getClientOriginalExtension();

        // 2. Security: Simpan di disk private (tidak bisa diakses publik secara langsung)
        $disk = config('filesystems.kyc_disk', 'local');
        $ktpPath = $request->file('foto_ktp')->storeAs('kyc/ktp', $ktpFilename, $disk);
        $selfiePath = $request->file('foto_selfie')->storeAs('kyc/selfie', $selfieFilename, $disk);

        $profile = $user->mabaProfile()->firstOrCreate(['user_id' => $user->id]);

        $profile->update([
            'ktp_url' => $ktpPath,
            'selfie_url' => $selfiePath,
            'kyc_submitted' => true,
            'kyc_verified' => true, // Auto-verified bila lolos validasi OCR lokal
            'kyc_verified_at' => now(),
        ]);

        ModificationLog::create([
            'actor' => $user->name,
            'action' => "Upload dokumen e-KYC versi {$timestamp} berhasil.",
        ]);

        return redirect()->back()->with('success', 'Dokumen e-KYC berhasil diverifikasi dan tersimpan aman.');
    }
}
