<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Tariff extends Model
{
    protected $fillable = [
        'name',
        'amount',
        'category', // 'SEWA', 'DEPOSIT', 'PERLENGKAPAN', 'CICILAN', 'ADMIN', 'PENGATURAN'
        'target',   // 'ALL', 'REGULER', 'KIP', 'INTERNAL', 'EXTERNAL'
        'description',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
    ];
}
