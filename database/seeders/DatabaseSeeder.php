<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Akun Admin Asrama
        User::firstOrCreate(
            ['email' => 'admin@ubtsu.ac.id'],
            [
                'name' => 'Bpk. Ahmad Fauzi (Admin Asrama)',
                'password' => Hash::make('password123'),
                'role' => 'admin',
                'phone' => '081234567000',
            ]
        );

        // 2. Akun Mahasiswa Baru (Contoh Profil PMB)
        User::firstOrCreate(
            ['email' => 'mahasiswa@ubtsu.ac.id'],
            [
                'name' => 'Maximilian Wimin Winata',
                'password' => Hash::make('password123'),
                'role' => 'maba',
                'no_pmb' => 'PMB-2026-0142',
                'nim' => 'PMB2026-08942',
                'is_kip_student' => false,
                'phone' => '081234567890',
            ]
        );

        // 3. Jalankan Seeder Master Data
        $this->call([
            TariffSeeder::class,
            RoomSeeder::class,
        ]);
    }
}
