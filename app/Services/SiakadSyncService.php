<?php

namespace App\Services;

use App\Models\ApiLink;
use App\Models\SiakadMahasiswaStg;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SiakadSyncService
{
    /**
     * Sinkronisasi seluruh link API yang terdaftar di tabel api_link
     */
    public function syncAll(): array
    {
        $links = ApiLink::all();
        $results = [];

        foreach ($links as $apiLink) {
            $results[] = $this->syncByLink($apiLink);
        }

        return $results;
    }

    /**
     * Sinkronisasi spesifik untuk satu record ApiLink
     */
    public function syncByLink(ApiLink $apiLink): array
    {
        try {
            $response = Http::timeout(15)->get($apiLink->link);

            if (!$response->successful()) {
                throw new \Exception("Gagal menghubungi API SIAKAD: HTTP Status " . $response->status());
            }

            $payload = $response->json();
            $items = is_array($payload) ? ($payload['data'] ?? $payload) : [];

            $savedCount = 0;

            foreach ($items as $item) {
                $noReg = $item['nim'] ?? $item['nomor_registrasi'] ?? $item['no_pmb'] ?? null;
                if (!$noReg) continue;

                SiakadMahasiswaStg::updateOrCreate(
                    ['nomor_registrasi' => $noReg],
                    [
                        'api_link_id' => $apiLink->id,
                        'kategori_beasiswa' => $apiLink->kategori,
                        'nama_beasiswa' => $apiLink->nama,
                        'nama_lengkap' => $item['nama'] ?? $item['namalengkap'] ?? 'Tanpa Nama',
                        'nik' => $item['nik'] ?? $item['noktp'] ?? null,
                        'email' => $item['email'] ?? null,
                        'nomor_telepon' => $item['no_hp'] ?? $item['nohp'] ?? $item['telepon'] ?? null,
                        'program_studi' => $item['prodi'] ?? $item['program_studi'] ?? null,
                        'fakultas' => $item['fakultas'] ?? null,
                        'jenis_kelamin' => strtoupper(substr($item['jenis_kelamin'] ?? 'L', 0, 1)),
                        'payload_raw' => $item,
                        'synced_at' => now(),
                    ]
                );

                $savedCount++;
            }

            $apiLink->update([
                'last_synced_at' => now(),
                'total_records' => $savedCount,
            ]);

            return [
                'status' => 'success',
                'api_id' => $apiLink->id,
                'nama' => $apiLink->nama,
                'kategori' => $apiLink->kategori,
                'total_synced' => $savedCount,
            ];
        } catch (\Throwable $e) {
            Log::error("SIAKAD Sync Error [{$apiLink->nama}]: " . $e->getMessage());

            return [
                'status' => 'error',
                'api_id' => $apiLink->id,
                'nama' => $apiLink->nama,
                'message' => $e->getMessage(),
            ];
        }
    }
}
