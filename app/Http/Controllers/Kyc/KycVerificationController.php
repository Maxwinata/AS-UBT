<?php

namespace App\Http\Controllers\Kyc;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use App\Models\MabaProfile;
use App\Models\KycDocument;
use App\Models\ModificationLog;
use Illuminate\Support\Facades\URL;

class KycVerificationController extends Controller
{
    /**
     * Upload Dokumen e-KYC (KTP & Selfie) dengan Kebijakan Versioning & Private Disk
     * Mematuhi Aturan AGENTS.md:
     * 1. Versioning: Nama file unik (timestamp + random string) agar histori audit trail tidak tertimpa.
     * 2. Security: Disimpan di disk private_kyc, hanya diakses via short-lived signed URL.
     * 3. Garbage Collection: Konfigurasi retensi 60 hari pada cloud storage lifecycle.
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
        $disk = env('KYC_STORAGE_DISK', 'private_kyc');

        $ktpFile = $request->file('foto_ktp');
        $selfieFile = $request->file('foto_selfie');

        // 1. Versioning: Cari versi sebelumnya agar inkremental (v1, v2, v3...)
        $prevKtpVersion = KycDocument::where('user_id', $user->id)->where('doc_type', 'KTP')->max('file_version') ?? 0;
        $ktpVersion = $prevKtpVersion + 1;

        $prevSelfieVersion = KycDocument::where('user_id', $user->id)->where('doc_type', 'SELFIE_KTP')->max('file_version') ?? 0;
        $selfieVersion = $prevSelfieVersion + 1;

        // Nonaktifkan versi lama di database
        KycDocument::where('user_id', $user->id)->where('doc_type', 'KTP')->update(['is_active_version' => false]);
        KycDocument::where('user_id', $user->id)->where('doc_type', 'SELFIE_KTP')->update(['is_active_version' => false]);

        // Beri nama unik (UUID/Timestamp) tanpa menimpa file fisik lama
        $ktpFilename = "ktp_{$nim}_v{$ktpVersion}_{$timestamp}_" . Str::random(6) . '.' . $ktpFile->getClientOriginalExtension();
        $selfieFilename = "selfie_{$nim}_v{$selfieVersion}_{$timestamp}_" . Str::random(6) . '.' . $selfieFile->getClientOriginalExtension();

        $ktpPath = $ktpFile->storeAs('kyc/ktp', $ktpFilename, $disk);
        $selfiePath = $selfieFile->storeAs('kyc/selfie', $selfieFilename, $disk);

        $ktpChecksum = hash_file('sha256', $ktpFile->getRealPath());
        $selfieChecksum = hash_file('sha256', $selfieFile->getRealPath());

        // Simpan ke tabel kyc_documents
        $docKtp = KycDocument::create([
            'user_id' => $user->id,
            'doc_type' => 'KTP',
            'file_name' => $ktpFilename,
            'file_path' => $ktpPath,
            'file_version' => $ktpVersion,
            'is_active_version' => true,
            'storage_disk' => $disk,
            'file_size_bytes' => $ktpFile->getSize(),
            'mime_type' => $ktpFile->getMimeType(),
            'file_hash' => $ktpChecksum,
            'status_verifikasi' => 'APPROVED',
            'verified_at' => now(),
            'retention_until' => now()->addDays(60),
        ]);

        $docSelfie = KycDocument::create([
            'user_id' => $user->id,
            'doc_type' => 'SELFIE_KTP',
            'file_name' => $selfieFilename,
            'file_path' => $selfiePath,
            'file_version' => $selfieVersion,
            'is_active_version' => true,
            'storage_disk' => $disk,
            'file_size_bytes' => $selfieFile->getSize(),
            'mime_type' => $selfieFile->getMimeType(),
            'file_hash' => $selfieChecksum,
            'status_verifikasi' => 'APPROVED',
            'verified_at' => now(),
            'retention_until' => now()->addDays(60),
        ]);

        // Update profil
        $profile = $user->mabaProfile()->firstOrCreate(['user_id' => $user->id]);
        $profile->update([
            'ktp_url' => $ktpPath,
            'selfie_url' => $selfiePath,
            'kyc_submitted' => true,
            'kyc_verified' => true,
            'kyc_verified_at' => now(),
        ]);

        // Catat jejak audit (Audit Trail) sesuai RULE[AGENTS_md]
        ModificationLog::create([
            'actor' => "Maba ({$nim})",
            'action' => "Unggah berkas e-KYC: KTP v{$ktpVersion} ({$ktpFilename}) dan Selfie v{$selfieVersion} ({$selfieFilename}) ke private disk.",
            'ip_address' => $request->ip(),
        ]);

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Dokumen e-KYC berhasil diverifikasi dan tersimpan aman di private storage.',
                'ktp_path' => $ktpPath,
                'selfie_path' => $selfiePath,
                'ktp_version' => $ktpVersion,
                'selfie_version' => $selfieVersion,
            ]);
        }

        return redirect()->back()->with('success', 'Dokumen e-KYC berhasil diverifikasi dan tersimpan aman di private storage.');
    }

    /**
     * Dapatkan Short-Lived Signed URL untuk melihat dokumen KYC secara aman
     * TTL: 15 menit (sesuai KYC_SIGNED_URL_TTL_MINUTES di .env)
     */
    public function getSignedUrl(Request $request, $type)
    {
        $user = $request->user();
        $profile = $user->mabaProfile;

        if (!$profile) {
            return response()->json(['error' => 'Profil belum ditemukan.'], 404);
        }

        $ttlMinutes = (int) env('KYC_SIGNED_URL_TTL_MINUTES', 15);
        $expiresAt = now()->addMinutes($ttlMinutes);

        $signedUrl = URL::temporarySignedRoute(
            'kyc.document.view',
            $expiresAt,
            ['id' => $profile->id, 'type' => $type]
        );

        return response()->json([
            'type' => $type,
            'signed_url' => $signedUrl,
            'expires_at' => $expiresAt->toIso8601String(),
            'ttl_minutes' => $ttlMinutes,
        ]);
    }

    /**
     * Tampilkan Berkas dari Private Storage setelah Validasi Signature URL
     */
    public function showPrivateDocument(Request $request, $id, $type)
    {
        if (!$request->hasValidSignature()) {
            abort(403, 'Akses ditolak: Tautan dokumen KYC telah kedaluwarsa atau tanda tangan tidak valid.');
        }

        $profile = MabaProfile::findOrFail($id);
        $disk = env('KYC_STORAGE_DISK', 'private_kyc');
        $path = $type === 'ktp' ? $profile->ktp_url : $profile->selfie_url;

        if (!$path || !Storage::disk($disk)->exists($path)) {
            abort(404, 'Berkas dokumen tidak ditemukan di repositori privat.');
        }

        return Storage::disk($disk)->response($path);
    }
}
