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

                $namaMahasiswa = trim($item['nama_mahasiswa'] ?? $item['nama'] ?? $item['namalengkap'] ?? 'Tanpa Nama');
                $prodiName = $item['unit']['name'] ?? $item['prodi'] ?? $item['program_studi'] ?? null;
                $billToCode = $item['bill_to_type']['code'] ?? ($apiLink->kategori === 'kip' ? 'BTT-002' : 'BTT-006');
                $billToName = $item['bill_to_type']['name'] ?? $apiLink->nama;
                $angkatan = isset($item['angkatan']) 
                    ? (string)$item['angkatan'] 
                    : (str_starts_with($noReg, '26') ? '2026' : (str_starts_with($noReg, '25') ? '2025' : (str_starts_with($noReg, '24') ? '2024' : null)));

                SiakadMahasiswaStg::updateOrCreate(
                    ['nomor_registrasi' => $noReg],
                    [
                        'api_link_id' => $apiLink->id,
                        'id_siakad' => $item['id'] ?? null,
                        'sso_id_from_sidara' => $item['sso_id_from_sidara'] ?? null,
                        'kategori_beasiswa' => $apiLink->kategori,
                        'nama_beasiswa' => $billToName,
                        'bill_to_code' => $billToCode,
                        'nama_lengkap' => $namaMahasiswa,
                        'nik' => $item['nik_ktp'] ?? $item['nik'] ?? $item['noktp'] ?? null,
                        'angkatan' => $angkatan,
                        'email' => $item['email'] ?? null,
                        'nomor_telepon' => $item['no_hp'] ?? $item['nohp'] ?? $item['telepon'] ?? null,
                        'program_studi' => $prodiName,
                        'fakultas' => $item['fakultas'] ?? null,
                        'jenis_kelamin' => isset($item['jenis_kelamin']) ? strtoupper(substr($item['jenis_kelamin'], 0, 1)) : null,
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
