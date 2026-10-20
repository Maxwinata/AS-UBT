<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ApiLink;
use App\Models\SiakadMahasiswaStg;
use App\Services\SiakadSyncService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class SiakadSyncController extends Controller
{
    protected SiakadSyncService $syncService;

    public function __construct(SiakadSyncService $syncService)
    {
        $this->syncService = $syncService;
    }

    /**
     * Mengambil daftar link API SIAKAD yang terdaftar beserta status koneksi
     */
    public function index(): JsonResponse
    {
        $links = ApiLink::withCount(['mahasiswaStaging'])->get();
        return response()->json([
            'status' => 'success',
            'data' => $links,
        ]);
    }

    /**
     * Memicu proses penarikan data dari seluruh endpoint API SIAKAD
     */
    public function triggerSync(Request $request): JsonResponse
    {
        $results = $this->syncService->syncAll();

        return response()->json([
            'status' => 'success',
            'message' => 'Proses sinkronisasi API SIAKAD UBT berhasil dijalankan.',
            'results' => $results,
        ]);
    }

    /**
     * Mengambil daftar data calon mahasiswa di staging pra-registrasi
     */
    public function getStagingData(Request $request): JsonResponse
    {
        $query = SiakadMahasiswaStg::with('apiLink')->latest('synced_at');

        if ($request->filled('kategori')) {
            $query->where('kategori_beasiswa', $request->kategori);
        }

        if ($request->filled('status_subsidi')) {
            $query->where('status_verifikasi_subsidi', $request->status_subsidi);
        }

        if ($request->filled('search')) {
            $query->lookup($request->search);
        }

        $staging = $query->paginate($request->get('per_page', 50));

        return response()->json([
            'status' => 'success',
            'data' => $staging,
        ]);
    }

    /**
     * Memverifikasi hak subsidi beasiswa calon mahasiswa (KIP / Beasiswa Khusus)
     */
    public function verifySubsidi(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'required|in:1,-1', // 1 = Disetujui, -1 = Ditolak / Standar
            'catatan' => 'nullable|string|max:500',
        ]);

        $stg = SiakadMahasiswaStg::findOrFail($id);
        $adminName = $request->user() ? $request->user()->name : 'Staf Keuangan Asrama';

        $stg->update([
            'status_verifikasi_subsidi' => (int) $validated['status'],
            'verified_by' => $adminName,
            'verified_at' => now(),
            'catatan_admin' => $validated['catatan'] ?? null,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Status verifikasi hak subsidi beasiswa berhasil diperbarui.',
            'data' => $stg,
        ]);
    }

    /**
     * Mempromosikan record mahasiswa pra-registrasi staging ke tabel master (users, maba_profiles, penyewa)
     */
    public function promote(Request $request, int $id): JsonResponse
    {
        $operatorId = $request->user() ? $request->user()->id : 1;
        $result = $this->syncService->promoteToMaster($id, $operatorId);

        return response()->json([
            'status' => 'success',
            'message' => "Mahasiswa {$result['staging']->nomor_registrasi} ({$result['staging']->nama_lengkap}) berhasil dipromosikan ke tabel master.",
            'data' => $result,
        ]);
    }
}
