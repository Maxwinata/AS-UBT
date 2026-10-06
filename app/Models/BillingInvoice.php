<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BillingInvoice extends Model
{
    protected $fillable = [
        'invoice_id',
        'user_id',
        'nim',
        'nama',
        'is_kip',
        'durasi_bulan',
        'skema_bayar_sewa',
        'tarif_per_bulan',
        'biaya_sewa',
        'biaya_sewa_total_kontrak',
        'sisa_sewa_kontrak',
        'is_cicilan_deposit',
        'opsi_cicilan',
        'biaya_deposit',
        'biaya_deposit_total',
        'sisa_cicilan_deposit',
        'cicilan_deposit_allowed',
        'biaya_perlengkapan', // Biaya Administrasi (Default Rp 100.000)
        'kode_unik',
        'total_bayar',
        'status', // 'UNPAID', 'PENDING_VERIFICATION', 'PAID', 'EXPIRED'
        'metode_bayar', // 'TRANSFER_MANUAL', 'VIRTUAL_ACCOUNT'
        'bukti_transfer_path',
        'paid_at',
        'verified_by',
        'verification_notes',
    ];

    protected $casts = [
        'is_kip' => 'boolean',
        'is_cicilan_deposit' => 'boolean',
        'cicilan_deposit_allowed' => 'boolean',
        'tarif_per_bulan' => 'decimal:2',
        'biaya_sewa' => 'decimal:2',
        'biaya_sewa_total_kontrak' => 'decimal:2',
        'sisa_sewa_kontrak' => 'decimal:2',
        'biaya_deposit' => 'decimal:2',
        'biaya_deposit_total' => 'decimal:2',
        'sisa_cicilan_deposit' => 'decimal:2',
        'biaya_perlengkapan' => 'decimal:2',
        'total_bayar' => 'decimal:2',
        'paid_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function verifier()
    {
        return $this->belongsTo(User::class, 'verified_by');
    }
}
