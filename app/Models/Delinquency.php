<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Delinquency extends Model
{
    protected $fillable = [
        'user_id',
        'contract_id',
        'room_number',
        'student_name',
        'nim',
        'phone',
        'due_date',
        'days_overdue',
        'arrears_amount',
        'deposit_deducted_for_rent',
        'deposit_remaining',
        'stage', // 'TOLERANSI_SEWA', 'DEPOSIT_DIPAKAI_GRACE_TOPUP', 'WANPRESTASI_AKUT'
        'stage_label',
        'is_eviction_issued',
        'fine_amount',
        'last_action_date',
        'notes',
    ];

    protected $casts = [
        'due_date' => 'date',
        'days_overdue' => 'integer',
        'arrears_amount' => 'decimal:2',
        'deposit_deducted_for_rent' => 'decimal:2',
        'deposit_remaining' => 'decimal:2',
        'fine_amount' => 'decimal:2',
        'is_eviction_issued' => 'boolean',
        'last_action_date' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function contract()
    {
        return $this->belongsTo(Contract::class);
    }
}
