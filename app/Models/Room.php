<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Room extends Model
{
    protected $fillable = [
        'room_code',
        'gedung',
        'lantai',
        'nomor_kamar',
        'kapasitas',
        'terisi',
        'fasilitas',
        'status', // 'AVAILABLE', 'FULL', 'MAINTENANCE'
    ];

    protected $casts = [
        'fasilitas' => 'array',
        'lantai' => 'integer',
        'kapasitas' => 'integer',
        'terisi' => 'integer',
    ];

    public function contracts()
    {
        return $this->hasMany(Contract::class);
    }
}
