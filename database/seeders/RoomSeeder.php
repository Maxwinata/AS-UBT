<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Room;

class RoomSeeder extends Seeder
{
    public function run(): void
    {
        $rooms = [
            [
                'room_code' => 'RM-A101',
                'gedung' => 'Gedung A (Thamrin Utara)',
                'lantai' => 1,
                'nomor_kamar' => '101',
                'kapasitas' => 2,
                'terisi' => 1,
                'fasilitas' => ['2 Kasur Busa Single', '2 Meja Belajar', 'AC 1PK', 'Kamar Mandi Dalam', 'Lemari 2 Pintu'],
                'status' => 'AVAILABLE',
            ],
            [
                'room_code' => 'RM-B204',
                'gedung' => 'Gedung B (Roemah 54)',
                'lantai' => 2,
                'nomor_kamar' => '204',
                'kapasitas' => 2,
                'terisi' => 0,
                'fasilitas' => ['2 Bed Springbed', '2 Study Desk + Ergonomic Chair', 'AC 1.5PK', 'Kamar Mandi Dalam + Water Heater', 'Wi-Fi 100Mbps'],
                'status' => 'AVAILABLE',
            ],
            [
                'room_code' => 'RM-A201',
                'gedung' => 'Gedung A (Thamrin Utara)',
                'lantai' => 2,
                'nomor_kamar' => '201',
                'kapasitas' => 2,
                'terisi' => 2,
                'fasilitas' => ['2 Kasur Busa Single', '2 Meja Belajar', 'Kipas Angin', 'Kamar Mandi Luar'],
                'status' => 'FULL',
            ],
        ];

        foreach ($rooms as $r) {
            Room::updateOrCreate(['room_code' => $r['room_code']], $r);
        }
    }
}
