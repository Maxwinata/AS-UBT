<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class KycDocument extends Model
{
    protected $table = 'kyc_documents';

    protected $fillable = [
        'user_id',
        'penyewa_id',
        'doc_type',
        'file_name',
        'file_path',
        'file_version',
        'is_active_version',
        'storage_disk',
        'file_size_bytes',
        'mime_type',
        'file_hash',
        'status_verifikasi',
        'verified_by',
        'verified_at',
        'rejection_reason',
        'retention_until',
    ];

    protected $casts = [
        'is_active_version' => 'boolean',
        'verified_at' => 'datetime',
        'retention_until' => 'date',
        'file_version' => 'integer',
        'file_size_bytes' => 'integer',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function penyewa()
    {
        return $this->belongsTo(Penyewa::class);
    }
}
