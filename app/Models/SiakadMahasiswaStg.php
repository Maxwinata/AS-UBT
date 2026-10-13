<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SiakadMahasiswaStg extends Model
{
    protected $table = 'siakad_mahasiswa_stg';
    protected $guarded = ['id'];

    protected $casts = [
        'status_klaim' => 'integer',
        'status_verifikasi_subsidi' => 'integer',
        'verified_at' => 'datetime',
        'synced_at' => 'datetime',
        'payload_raw' => 'array',
    ];

    public function apiLink(): BelongsTo
    {
        return $this->belongsTo(ApiLink::class, 'api_link_id');
    }

    /**
     * Scope query untuk mencari calon mahasiswa berdasarkan No PMB atau NIK
     */
    public function scopeLookup($query, string $identifier)
    {
        return $query->where('nomor_registrasi', $identifier)
                     ->orWhere('nik', $identifier);
    }
}
