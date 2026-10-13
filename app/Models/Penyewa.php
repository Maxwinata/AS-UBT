<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Penyewa extends Model
{
    protected $table = 'penyewa';

    protected $guarded = ['id'];

    protected $casts = [
        'status_asrama' => 'integer',
        'status_catering' => 'integer',
        'status' => 'integer',
        'operator_id' => 'integer',
    ];

    /**
     * Staging Permohonan Pendaftaran Otonom Maba
     */
    public function requestPembayaran(): HasMany
    {
        return $this->hasMany(RequestPembayaran::class, 'penyewa_id');
    }

    /**
     * Buku Besar Tagihan Resmi yang Disahkan Admin
     */
    public function pembayaran(): HasMany
    {
        return $this->hasMany(Pembayaran::class, 'penyewa_id');
    }

    /**
     * Buku Kas & Transaksi Pembayaran Resmi
     */
    public function transaksi(): HasMany
    {
        return $this->hasMany(Transaksi::class, 'penyewa_id');
    }

    /**
     * Relasi ke Kamar yang Dihuni
     */
    public function kamar(): BelongsTo
    {
        return $this->belongsTo(Room::class, 'kamar_id');
    }

    /**
     * Relasi ke Akun SSO User (berdasarkan NIM atau NIK)
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'nim', 'nim');
    }
}
