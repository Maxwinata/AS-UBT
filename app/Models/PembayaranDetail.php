<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PembayaranDetail extends Model
{
    protected $table = 'pembayaran_detail';

    protected $guarded = ['id'];

    protected $casts = [
        'harga' => 'decimal:2',
        'potongan_harga' => 'decimal:2',
        'qty' => 'integer',
        'jumlah_pembayaran' => 'integer',
        'status' => 'integer',
    ];

    public function pembayaran(): BelongsTo
    {
        return $this->belongsTo(Pembayaran::class, 'no_invoice', 'no_invoice');
    }
}
