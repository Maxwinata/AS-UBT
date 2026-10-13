<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Pembayaran extends Model
{
    protected $table = 'pembayaran';

    protected $guarded = ['id'];

    protected $casts = [
        'tanggal_pembayaran' => 'datetime',
        'tanggal_masuk' => 'datetime',
        'tanggal_keluar' => 'datetime',
        'total_tagihan' => 'decimal:2',
        'total_potongan_harga' => 'decimal:2',
        'total_bayar' => 'decimal:2',
        'status_asrama' => 'integer',
        'status_catering' => 'integer',
        'operator_id' => 'integer',
    ];

    public function details(): HasMany
    {
        return $this->hasMany(PembayaranDetail::class, 'no_invoice', 'no_invoice');
    }

    public function transaksi(): HasOne
    {
        return $this->hasOne(Transaksi::class, 'no_invoice', 'no_invoice');
    }

    public function penyewa(): BelongsTo
    {
        return $this->belongsTo(Penyewa::class, 'penyewa_id');
    }
}
