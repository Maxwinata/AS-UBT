<?php

namespace App\Services;

use App\Models\ApiLink;
use App\Models\SiakadMahasiswaStg;
use App\Models\User;
use App\Models\MabaProfile;
use App\Models\Penyewa;
use App\Models\ModificationLog;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

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
     * Sinkronisasi spesifik untuk satu record ApiLink dengan ekstraksi lengkap seluruh field
     * dan smart fallback ke data seeder/lokal jika HTTP endpoint tidak terjangkau.
     */
    public function syncByLink(ApiLink $apiLink): array
    {
        $items = [];
        $isFallback = false;

        try {
            $response = Http::timeout(8)->get($apiLink->link);

            if ($response->successful()) {
                $payload = $response->json();
                $items = is_array($payload) ? ($payload['data'] ?? $payload) : [];
            } else {
                throw new \Exception("HTTP Status " . $response->status());
            }
        } catch (\Throwable $e) {
            Log::warning("SIAKAD Live API Unreachable [{$apiLink->nama}]: " . $e->getMessage() . " -> Mengaktifkan Fallback Seeder Dataset.");
            $isFallback = true;
            $items = $this->getFallbackDataset($apiLink);
        }

        $savedCount = 0;

        foreach ($items as $item) {
            $noReg = $item['nim'] ?? $item['nomor_registrasi'] ?? $item['no_pmb'] ?? $item['nomor_pendaftaran'] ?? null;
            if (!$noReg) continue;

            $namaMahasiswa = trim($item['nama_mahasiswa'] ?? $item['nama'] ?? $item['namalengkap'] ?? $item['nama_lengkap'] ?? 'Tanpa Nama');
            $prodiName = $item['unit']['name'] ?? $item['prodi'] ?? $item['program_studi'] ?? null;
            $fakultasName = $item['fakultas'] ?? $item['nama_fakultas'] ?? null;
            $billToCode = $item['bill_to_type']['code'] ?? ($apiLink->kategori === 'kip' ? 'BTT-002' : 'BTT-006');
            $billToName = $item['bill_to_type']['name'] ?? $apiLink->nama;
            
            $angkatan = isset($item['angkatan']) 
                ? (string)$item['angkatan'] 
                : (str_starts_with($noReg, '26') ? '2026' : (str_starts_with($noReg, '25') ? '2025' : (str_starts_with($noReg, '24') ? '2024' : '2026')));

            $nik = $item['nik_ktp'] ?? $item['nik'] ?? $item['noktp'] ?? null;
            $email = $item['email'] ?? null;
            $nomorTelepon = $item['no_hp'] ?? $item['nohp'] ?? $item['telepon'] ?? $item['nomor_telepon'] ?? null;
            $tempatLahir = $item['tempat_lahir'] ?? null;
            $tanggalLahir = isset($item['tanggal_lahir']) ? substr($item['tanggal_lahir'], 0, 10) : null;
            $alamatLengkap = $item['alamat'] ?? $item['alamat_lengkap'] ?? null;
            $namaAyah = $item['nama_ayah'] ?? $item['ayah'] ?? null;
            $namaIbu = $item['nama_ibu'] ?? $item['ibu'] ?? null;
            $noHpOrtu = $item['no_hp_ortu'] ?? $item['kontak_darurat_no_hp'] ?? null;
            $nomorKip = $item['nomorkip'] ?? $item['no_kip'] ?? null;
            $jalurMasuk = $item['jalur_masuk'] ?? ($apiLink->kategori === 'kip' ? 'KIP-Kuliah' : 'PMB Reguler 2026');
            $nimResmi = $item['nim_resmi'] ?? (str_starts_with($noReg, '26') ? $noReg : null);
            $gender = isset($item['jenis_kelamin']) ? strtoupper(substr($item['jenis_kelamin'], 0, 1)) : null;

            $ssoId = $item['sso_id_from_sidara'] ?? $item['sso_id'] ?? ("SSO-UBT-" . $noReg);

            // UPSERT ke tabel staging SQL pengembangan
            SiakadMahasiswaStg::updateOrCreate(
                ['nomor_registrasi' => $noReg],
                [
                    'api_link_id' => $apiLink->id,
                    'id_siakad' => $item['id'] ?? null,
                    'sso_id_from_sidara' => $ssoId,
                    'kategori_beasiswa' => $apiLink->kategori,
                    'nama_beasiswa' => $billToName,
                    'bill_to_code' => $billToCode,
                    'nama_lengkap' => $namaMahasiswa,
                    'nik' => $nik,
                    'angkatan' => $angkatan,
                    'email' => $email,
                    'nomor_telepon' => $nomorTelepon,
                    'program_studi' => $prodiName,
                    'fakultas' => $fakultasName,
                    'jenis_kelamin' => $gender,
                    'tempat_lahir' => $tempatLahir,
                    'tanggal_lahir' => $tanggalLahir,
                    'alamat_lengkap' => $alamatLengkap,
                    'nama_ayah' => $namaAyah,
                    'nama_ibu' => $namaIbu,
                    'no_hp_ortu' => $noHpOrtu,
                    'nomorkip' => $nomorKip,
                    'jalur_masuk' => $jalurMasuk,
                    'nim_resmi' => $nimResmi,
                    'payload_raw' => $item, // Menyimpan 100% konten dokumen mentah dari SIDARA
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
            'source' => $isFallback ? 'SEEDER_FALLBACK_DATASET' : 'LIVE_HTTP_ENDPOINT',
        ];
    }

    /**
     * Promosi Staging SIDARA ke Tabel Master (users, maba_profiles, penyewa)
     */
    public function promoteToMaster(int $stagingId, int $operatorId = 1): array
    {
        return DB::transaction(function () use ($stagingId, $operatorId) {
            $stg = SiakadMahasiswaStg::findOrFail($stagingId);

            // 1. Akun Login User
            $user = User::updateOrCreate(
                ['email' => $stg->email ?? "mhs_{$stg->nomor_registrasi}@ubtsu.ac.id"],
                [
                    'name' => $stg->nama_lengkap,
                    'password' => Hash::make('password123'),
                    'role' => 'maba',
                    'nim' => $stg->nomor_registrasi,
                    'no_pmb' => $stg->nomor_registrasi,
                    'is_kip_student' => $stg->kategori_beasiswa === 'kip',
                    'phone' => $stg->nomor_telepon ?? '081234567890',
                ]
            );

            // 2. Profil Lengkap Mahasiswa Baru
            $profile = MabaProfile::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'nim_no_reg' => $stg->nomor_registrasi,
                    'no_pmb' => $stg->nomor_registrasi,
                    'nim' => $stg->nim_resmi ?? (str_starts_with($stg->nomor_registrasi, '26') ? $stg->nomor_registrasi : null),
                    'nama' => $stg->nama_lengkap,
                    'jalur_masuk' => $stg->jalur_masuk ?? ($stg->kategori_beasiswa === 'kip' ? 'Jalur KIP-Kuliah' : 'PMB Reguler 2026'),
                    'fakultas' => $stg->fakultas ?? 'Fakultas Terkait',
                    'prodi' => $stg->program_studi ?? 'Program Studi',
                    'angkatan' => $stg->angkatan ?? '2026',
                    'jenis_kelamin' => $stg->jenis_kelamin === 'P' ? 'Perempuan' : 'Laki-laki',
                    'kategori' => $stg->kategori_beasiswa === 'kip' ? 'KIP-Kuliah' : 'Reguler',
                    'no_hp_wa' => $stg->nomor_telepon ?? '081234567890',
                    'email' => $user->email,
                    'alamat_ktp_jalan' => $stg->alamat_lengkap ?? 'Jl. Bhayangkara No. 54',
                    'alamat_ktp_kabupaten_kota' => 'Kota Tarakan',
                    'alamat_ktp_provinsi' => 'Kalimantan Utara',
                    'kontak_darurat_nama' => $stg->nama_ayah ?? $stg->nama_ibu ?? 'Orang Tua / Wali',
                    'kontak_darurat_no_hp' => $stg->no_hp_ortu ?? '081198765432',
                    'is_kip_student' => $stg->kategori_beasiswa === 'kip',
                    'persetujuan_awal' => true,
                ]
            );

            // 3. Master Penyewa
            $penyewa = Penyewa::updateOrCreate(
                ['nim' => $stg->nomor_registrasi],
                [
                    'no_pmb' => $stg->nomor_registrasi,
                    'nama_penyewa' => $stg->nama_lengkap,
                    'jenis_kelamin' => $stg->jenis_kelamin === 'P' ? 'Perempuan' : 'Laki-laki',
                    'program_studi' => $stg->program_studi,
                    'status_asrama' => 1,
                    'operator_id' => $operatorId,
                ]
            );

            // 4. Update status klaim staging
            $stg->update([
                'status_klaim' => 1,
                'status_verifikasi_subsidi' => 1,
                'verified_by' => 'Admin Asrama',
                'verified_at' => now(),
            ]);

            // 5. Jejak Audit
            ModificationLog::create([
                'actor' => 'Admin Asrama',
                'action' => "Promosi Data SIDARA: {$stg->nomor_registrasi} an. {$stg->nama_lengkap} berhasil dipromosikan ke master users, maba_profiles, dan penyewa.",
            ]);

            return [
                'user' => $user,
                'profile' => $profile,
                'penyewa' => $penyewa,
                'staging' => $stg,
            ];
        });
    }

    /**
     * Dataset komprehensif cadangan (Seeder Fallback) untuk uji offline di Laragon
     */
    protected function getFallbackDataset(ApiLink $apiLink): array
    {
        if ($apiLink->kategori === 'kip') {
            return [
                [
                    'id' => 102,
                    'nomor_pendaftaran' => 'PMB-BTT-002-001',
                    'nim' => '260108002',
                    'nama_mahasiswa' => 'Muhammad Fadhil Ramadhan',
                    'nik_ktp' => '1271011504030005',
                    'tempat_lahir' => 'MEDAN',
                    'tanggal_lahir' => '2005-04-15',
                    'jenis_kelamin' => 'L',
                    'program_studi' => 'Agribisnis',
                    'fakultas' => 'Pertanian',
                    'angkatan' => '2026',
                    'email' => 'm.fadhil.ramadhan@ubtsu.ac.id',
                    'no_hp' => '081298765432',
                    'alamat' => 'Jl. Pangeran Antasari No. 18, Tarakan',
                    'nama_ayah' => 'Bpk. Ramadhan',
                    'no_hp_ortu' => '081233445566',
                    'nomorkip' => '1125700270941799926',
                    'sso_id_from_sidara' => 'SSO-UBT-PMB-BTT-002-001',
                    'unit' => ['name' => 'Agribisnis'],
                    'bill_to_type' => ['code' => 'BTT-002', 'name' => 'KIP'],
                ],
                [
                    'id' => 103,
                    'nomor_pendaftaran' => 'PMB-BTT-002-002',
                    'nim' => '260108003',
                    'nama_mahasiswa' => 'Siti Aisyah Nurfadilah',
                    'nik_ktp' => '1271026509040003',
                    'tempat_lahir' => 'TARAKAN',
                    'tanggal_lahir' => '2006-09-25',
                    'jenis_kelamin' => 'P',
                    'program_studi' => 'Manajemen',
                    'fakultas' => 'Ekonomi & Bisnis',
                    'angkatan' => '2026',
                    'email' => 'siti.aisyah@ubtsu.ac.id',
                    'no_hp' => '081277889900',
                    'alamat' => 'Jl. Kusuma Bangsa No. 24, Tarakan',
                    'nama_ayah' => 'Bpk. Nurfadilah',
                    'no_hp_ortu' => '081266554433',
                    'nomorkip' => '1125700270941799927',
                    'sso_id_from_sidara' => 'SSO-UBT-PMB-BTT-002-002',
                    'unit' => ['name' => 'Manajemen'],
                    'bill_to_type' => ['code' => 'BTT-002', 'name' => 'KIP'],
                ],
            ];
        }

        // Non-KIP / Beasiswa Khusus / Reguler
        return [
            [
                'id' => 101,
                'nomor_pendaftaran' => 'PMB2026-08942',
                'nim' => '260108001',
                'nama_mahasiswa' => 'Maximilian Wimin Winata',
                'nik_ktp' => '1271040809980001',
                'tempat_lahir' => 'MEDAN',
                'tanggal_lahir' => '2005-09-08',
                'jenis_kelamin' => 'L',
                'program_studi' => 'Teknik Informatika',
                'fakultas' => 'Teknologi Informasi',
                'angkatan' => '2026',
                'email' => 'maximilian.winata@ubtsu.ac.id',
                'no_hp' => '081234567890',
                'alamat' => 'Jl. MH Thamrin No. 45, Medan',
                'nama_ayah' => 'Bpk. Bambang Winata',
                'no_hp_ortu' => '081299999999',
                'sso_id_from_sidara' => 'SSO-UBT-2026-08942',
                'unit' => ['name' => 'Teknik Informatika'],
                'bill_to_type' => ['code' => 'BTT-006', 'name' => 'Beasiswa Khusus'],
            ],
            [
                'id' => 104,
                'nomor_pendaftaran' => 'REG2026-001',
                'nim' => '260108004',
                'nama_mahasiswa' => 'Budi Santoso Nugroho',
                'nik_ktp' => '3271012304030008',
                'tempat_lahir' => 'JAKARTA',
                'tanggal_lahir' => '2005-04-23',
                'jenis_kelamin' => 'L',
                'program_studi' => 'Teknik Elektro',
                'fakultas' => 'Teknologi Informasi',
                'angkatan' => '2026',
                'email' => 'budi.santoso@ubtsu.ac.id',
                'no_hp' => '081387654321',
                'alamat' => 'Jl. Gatot Subroto No. 12, Tarakan',
                'nama_ayah' => 'Bpk. Nugroho',
                'no_hp_ortu' => '081399887766',
                'sso_id_from_sidara' => 'SSO-UBT-REG2026-001',
                'unit' => ['name' => 'Teknik Elektro'],
                'bill_to_type' => ['code' => 'BTT-REG', 'name' => 'Reguler Mandiri'],
            ],
        ];
    }
}
