<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SiakadMahasiswaStg extends Model
{
    protected $table = 'siakad_mahasiswa_stg';
    protected $guarded = ['id'];

    protected $casts = [
        'id_siakad' => 'integer',
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
     * Cek apakah kategori mahasiswa baru (Maba 2026 / PMB)
     */
    public function isMaba(): bool
    {
        return $this->angkatan === '2026' 
            || str_starts_with($this->nomor_registrasi, '26') 
            || str_starts_with($this->nomor_registrasi, 'PMB')
            || str_starts_with($this->nomor_registrasi, 'REG');
    }

    /**
     * Scope query untuk mencari calon mahasiswa berdasarkan No PMB, NIM, atau NIK
     */
    public function scopeLookup($query, string $identifier)
    {
        return $query->where('nomor_registrasi', $identifier)
                     ->orWhere('sso_id_from_sidara', $identifier)
                     ->orWhere('nik', $identifier);
    }
}
