<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class ProductionSeeder extends Seeder
{
    /**
     * Seeder Khusus Lingkungan Produksi (Live Production Seeder).
     * 
     * PERBEDAAN UTAMA DENGAN DatabaseSeeder:
     * 1. 100% Bebas Data Mahasiswa Simulasi / Dummy Testing.
     * 2. Hanya menginjeksi akun staf berwenang universitas (Keuangan, Asrama, IT Admin).
     * 3. Menginisialisasi Master Tarif Resmi SK Rektor UBT (TariffSeeder).
     * 4. Menginisialisasi Master 64 Kamar Fisik Riil Roemah 54 (RealRoomSeeder).
     */
    public function run(): void
    {
        // 1. Akun Admin Keuangan / Kasir Resmi
        User::updateOrCreate(
            ['email' => 'keuangan@ubt.ac.id'],
            [
                'name' => 'Staf Administrasi Keuangan (Kasir UBT)',
                'password' => Hash::make(env('INITIAL_ADMIN_PASSWORD', 'UBTKeuangan2026!#')),
                'role' => 'admin',
                'phone' => '081234567001',
            ]
        );

        // 2. Akun Pengelola Asrama & Fasilitas Kamar
        User::updateOrCreate(
            ['email' => 'asrama@ubt.ac.id'],
            [
                'name' => 'Kepala Unit Pengelola Asrama Roemah 54',
                'password' => Hash::make(env('INITIAL_ADMIN_PASSWORD', 'UBTAsrama2026!#')),
                'role' => 'admin',
                'phone' => '081234567002',
            ]
        );

        // 3. Akun Super Admin / IT Systems Administrator
        User::updateOrCreate(
            ['email' => 'superadmin@ubt.ac.id'],
            [
                'name' => 'Super Administrator IT UBT',
                'password' => Hash::make(env('INITIAL_ADMIN_PASSWORD', 'UBTSuperAdmin2026!#')),
                'role' => 'admin',
                'phone' => '081234567003',
            ]
        );

        // 4. Inisialisasi Master Tarif Resmi & Master Kamar Fisik Riil
        $this->call([
            TariffSeeder::class,
            RealRoomSeeder::class,
        ]);
    }
}
