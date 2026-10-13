<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RequestPembayaranDetail extends Model
{
    protected $table = 'request_pembayaran_detail';

    protected $guarded = ['id'];

    protected $casts = [
        'harga' => 'decimal:2',
        'potongan_harga' => 'decimal:2',
        'qty' => 'integer',
        'jumlah_pembayaran' => 'integer',
        'status' => 'integer',
    ];

    public function requestPembayaran(): BelongsTo
    {
        return $this->belongsTo(RequestPembayaran::class, 'no_request', 'no_request');
    }
}
