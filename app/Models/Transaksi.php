<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Transaksi extends Model
{
    protected $table = 'transaksi';

    protected $guarded = ['id'];

    protected $casts = [
        'tanggal_transaksi' => 'datetime',
        'jumlah_uang' => 'decimal:2',
        'operator_id' => 'integer',
    ];

    public function pembayaran(): BelongsTo
    {
        return $this->belongsTo(Pembayaran::class, 'no_invoice', 'no_invoice');
    }

    public function penyewa(): BelongsTo
    {
        return $this->belongsTo(Penyewa::class, 'penyewa_id');
    }
}
