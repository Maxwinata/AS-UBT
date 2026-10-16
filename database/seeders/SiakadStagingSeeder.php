<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SiakadStagingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * Mengisi data awal tabel penampungan sementara (staging) mahasiswa pra-registrasi
     * hasil sinkronisasi dari endpoint API SIAKAD UBT (mahasiswa-btt-006 & mahasiswa-btt-002).
     */
    public function run(): void
    {
        // Pastikan api_link ID 1 dan 2 tersedia
        $apiLink1 = DB::table('api_link')->where('id', 1)->first();
        if (!$apiLink1) {
            DB::table('api_link')->insert([
                'id' => 1,
                'jenis' => 'penyewa',
                'kategori' => 'nonkip',
                'link' => 'https://siakad.ubtsu.ac.id/api/mahasiswa-btt-006',
                'nama' => 'Beasiswa Khusus',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        $apiLink2 = DB::table('api_link')->where('id', 2)->first();
        if (!$apiLink2) {
            DB::table('api_link')->insert([
                'id' => 2,
                'jenis' => 'penyewa',
                'kategori' => 'kip',
                'link' => 'https://siakad.ubtsu.ac.id/api/mahasiswa-btt-002',
                'nama' => 'KIP',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        $sampleStudents = [
            [
                'id' => 1,
                'api_link_id' => 1,
                'id_siakad' => 101,
                'sso_id_from_sidara' => 'SSO-UBT-2026-08942',
                'kategori_beasiswa' => 'nonkip',
                'nama_beasiswa' => 'Beasiswa Khusus',
                'bill_to_code' => 'BTT-006',
                'nomor_registrasi' => 'PMB2026-08942',
                'nama_lengkap' => 'Maximilian Wimin Winata',
                'nik' => '1271040809980001',
                'angkatan' => '2026',
                'email' => 'maximilian.winata@ubtsu.ac.id',
                'nomor_telepon' => '081234567890',
                'program_studi' => 'Teknik Informatika',
                'fakultas' => 'Teknologi Informasi',
                'jenis_kelamin' => 'L',
                'status_klaim' => 0,
                'status_verifikasi_subsidi' => 1,
                'verified_by' => 'Staf Keuangan Asrama',
                'verified_at' => now(),
                'catatan_admin' => 'SK Beasiswa Khusus No. 104/UBT/2026 terverifikasi valid.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 2,
                'api_link_id' => 2,
                'id_siakad' => 102,
                'sso_id_from_sidara' => 'SSO-UBT-PMB-BTT-002-001',
                'kategori_beasiswa' => 'kip',
                'nama_beasiswa' => 'KIP',
                'bill_to_code' => 'BTT-002',
                'nomor_registrasi' => 'PMB-BTT-002-001',
                'nama_lengkap' => 'Muhammad Fadhil Ramadhan',
                'nik' => '1271011504030005',
                'angkatan' => '2026',
                'email' => 'm.fadhil.ramadhan@ubtsu.ac.id',
                'nomor_telepon' => '081298765432',
                'program_studi' => 'Agribisnis',
                'fakultas' => 'Pertanian',
                'jenis_kelamin' => 'L',
                'status_klaim' => 0,
                'status_verifikasi_subsidi' => 0,
                'verified_by' => null,
                'verified_at' => null,
                'catatan_admin' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 3,
                'api_link_id' => 2,
                'id_siakad' => 103,
                'sso_id_from_sidara' => 'SSO-UBT-PMB-BTT-002-002',
                'kategori_beasiswa' => 'kip',
                'nama_beasiswa' => 'KIP',
                'bill_to_code' => 'BTT-002',
                'nomor_registrasi' => 'PMB-BTT-002-002',
                'nama_lengkap' => 'Siti Aisyah Nurfadilah',
                'nik' => '1271026509040003',
                'angkatan' => '2026',
                'email' => 'siti.aisyah@ubtsu.ac.id',
                'nomor_telepon' => null, // Sengaja null untuk uji validasi nomor HP
                'program_studi' => 'Manajemen',
                'fakultas' => 'Ekonomi & Bisnis',
                'jenis_kelamin' => 'P',
                'status_klaim' => 0,
                'status_verifikasi_subsidi' => 0,
                'verified_by' => null,
                'verified_at' => null,
                'catatan_admin' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 4,
                'api_link_id' => 1,
                'id_siakad' => 104,
                'sso_id_from_sidara' => 'SSO-UBT-REG2026-001',
                'kategori_beasiswa' => 'nonkip',
                'nama_beasiswa' => 'Reguler Mandiri',
                'bill_to_code' => 'BTT-REG',
                'nomor_registrasi' => 'REG2026-001',
                'nama_lengkap' => 'Budi Santoso Nugroho',
                'nik' => '3271012304030008',
                'angkatan' => '2026',
                'email' => 'budi.santoso@ubtsu.ac.id',
                'nomor_telepon' => '081387654321',
                'program_studi' => 'Teknik Elektro',
                'fakultas' => 'Teknologi Informasi',
                'jenis_kelamin' => 'L',
                'status_klaim' => 0,
                'status_verifikasi_subsidi' => 0,
                'verified_by' => null,
                'verified_at' => null,
                'catatan_admin' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        foreach ($sampleStudents as $student) {
            DB::table('siakad_mahasiswa_stg')->updateOrInsert(
                ['nomor_registrasi' => $student['nomor_registrasi']],
                $student
            );
        }
    }
}
