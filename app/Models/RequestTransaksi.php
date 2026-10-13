<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RequestTransaksi extends Model
{
    protected $table = 'request_transaksi';

    protected $guarded = ['id'];

    protected $casts = [
        'tanggal_transaksi' => 'datetime',
        'jumlah_uang' => 'decimal:2',
        'operator_id' => 'integer',
    ];

    public function requestPembayaran(): BelongsTo
    {
        return $this->belongsTo(RequestPembayaran::class, 'no_request', 'no_request');
    }
}
