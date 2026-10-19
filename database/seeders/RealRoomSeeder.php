<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Room;

class RealRoomSeeder extends Seeder
{
    /**
     * Inisialisasi Master Data Kamar Riil Asrama Universitas Bunda Thamrin (UBT).
     * Memetakan 64 kamar fisik riil (Gedung Putra & Putri, Lantai 1-3)
     * Total kapasitas: 128 ranjang (Bed A & Bed B per kamar) dengan status awal 100% AVAILABLE (terisi = 0).
     */
    public function run(): void
    {
        $rooms = [];

        // 1. GEDUNG ROEMAH 54 PUTRA (32 Kamar - Total Kapasitas 64 Mahasiswa)
        // Lantai 1 Putra (8 Kamar: PA-101 s.d. PA-108) - AC 1PK, Kamar Mandi Luar
        for ($i = 1; $i <= 8; $i++) {
            $num = sprintf('%02d', $i);
            $roomCode = "PA-1{$num}";
            $rooms[] = [
                'room_code' => $roomCode,
                'gedung' => 'Gedung Roemah 54 Putra',
                'lantai' => 1,
                'nomor_kamar' => "1{$num}",
                'kapasitas' => 2,
                'terisi' => 0,
                'fasilitas' => [
                    '2 Ranjang Busa Single (Bed A & B)',
                    '2 Meja Belajar + Kursi',
                    'AC 1PK',
                    'Kamar Mandi Luar',
                    'Lemari 2 Pintu',
                    'Wi-Fi Kampus',
                ],
                'status' => 'AVAILABLE',
            ];
        }

        // Lantai 2 Putra (12 Kamar: PA-201 s.d. PA-212) - AC 1PK, Kamar Mandi Dalam
        for ($i = 1; $i <= 12; $i++) {
            $num = sprintf('%02d', $i);
            $roomCode = "PA-2{$num}";
            $rooms[] = [
                'room_code' => $roomCode,
                'gedung' => 'Gedung Roemah 54 Putra',
                'lantai' => 2,
                'nomor_kamar' => "2{$num}",
                'kapasitas' => 2,
                'terisi' => 0,
                'fasilitas' => [
                    '2 Ranjang Springbed Single (Bed A & B)',
                    '2 Meja Belajar + Kursi Ergonomis',
                    'AC 1PK',
                    'Kamar Mandi Dalam',
                    'Lemari 2 Pintu',
                    'Wi-Fi Kampus',
                ],
                'status' => 'AVAILABLE',
            ];
        }

        // Lantai 3 Putra (12 Kamar: PA-301 s.d. PA-312) - Non-AC / Kipas Angin, Kamar Mandi Luar
        for ($i = 1; $i <= 12; $i++) {
            $num = sprintf('%02d', $i);
            $roomCode = "PA-3{$num}";
            $rooms[] = [
                'room_code' => $roomCode,
                'gedung' => 'Gedung Roemah 54 Putra',
                'lantai' => 3,
                'nomor_kamar' => "3{$num}",
                'kapasitas' => 2,
                'terisi' => 0,
                'fasilitas' => [
                    '2 Ranjang Busa Single (Bed A & B)',
                    '2 Meja Belajar + Kursi',
                    'Kipas Angin Dinding',
                    'Kamar Mandi Luar',
                    'Lemari 2 Pintu',
                    'Wi-Fi Kampus',
                ],
                'status' => 'AVAILABLE',
            ];
        }

        // 2. GEDUNG ROEMAH 54 PUTRI (32 Kamar - Total Kapasitas 64 Mahasiswi)
        // Lantai 1 Putri (8 Kamar: PI-101 s.d. PI-108) - AC 1PK, Kamar Mandi Luar
        for ($i = 1; $i <= 8; $i++) {
            $num = sprintf('%02d', $i);
            $roomCode = "PI-1{$num}";
            $rooms[] = [
                'room_code' => $roomCode,
                'gedung' => 'Gedung Roemah 54 Putri',
                'lantai' => 1,
                'nomor_kamar' => "1{$num}",
                'kapasitas' => 2,
                'terisi' => 0,
                'fasilitas' => [
                    '2 Ranjang Busa Single (Bed A & B)',
                    '2 Meja Belajar + Kursi',
                    'AC 1PK',
                    'Kamar Mandi Luar',
                    'Lemari 2 Pintu',
                    'Wi-Fi Kampus',
                ],
                'status' => 'AVAILABLE',
            ];
        }

        // Lantai 2 Putri (12 Kamar: PI-201 s.d. PI-212) - AC 1.5PK, Kamar Mandi Dalam + Water Heater
        for ($i = 1; $i <= 12; $i++) {
            $num = sprintf('%02d', $i);
            $roomCode = "PI-2{$num}";
            $rooms[] = [
                'room_code' => $roomCode,
                'gedung' => 'Gedung Roemah 54 Putri',
                'lantai' => 2,
                'nomor_kamar' => "2{$num}",
                'kapasitas' => 2,
                'terisi' => 0,
                'fasilitas' => [
                    '2 Ranjang Springbed Single (Bed A & B)',
                    '2 Meja Belajar + Kursi Ergonomis',
                    'AC 1.5PK',
                    'Kamar Mandi Dalam + Water Heater',
                    'Lemari 2 Pintu',
                    'Wi-Fi Kampus',
                ],
                'status' => 'AVAILABLE',
            ];
        }

        // Lantai 3 Putri (12 Kamar: PI-301 s.d. PI-312) - Non-AC / Kipas Angin, Kamar Mandi Luar
        for ($i = 1; $i <= 12; $i++) {
            $num = sprintf('%02d', $i);
            $roomCode = "PI-3{$num}";
            $rooms[] = [
                'room_code' => $roomCode,
                'gedung' => 'Gedung Roemah 54 Putri',
                'lantai' => 3,
                'nomor_kamar' => "3{$num}",
                'kapasitas' => 2,
                'terisi' => 0,
                'fasilitas' => [
                    '2 Ranjang Busa Single (Bed A & B)',
                    '2 Meja Belajar + Kursi',
                    'Kipas Angin Dinding',
                    'Kamar Mandi Luar',
                    'Lemari 2 Pintu',
                    'Wi-Fi Kampus',
                ],
                'status' => 'AVAILABLE',
            ];
        }

        // Eksekusi upsert ke tabel rooms
        foreach ($rooms as $room) {
            Room::updateOrCreate(['room_code' => $room['room_code']], $room);
        }
    }
}
