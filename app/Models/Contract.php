<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Contract extends Model
{
    protected $fillable = [
        'contract_number',
        'user_id',
        'room_id',
        'student_signed',
        'student_signed_at',
        'parent_signed',
        'parent_signed_at',
        'signature_student_url',
        'signature_parent_url',
        'status', // 'DRAFT', 'SIGNED_BY_STUDENT', 'FULLY_SIGNED', 'TERMINATED'
        'started_at',
        'ended_at',
        'termination_reason',
    ];

    protected $casts = [
        'student_signed' => 'boolean',
        'parent_signed' => 'boolean',
        'student_signed_at' => 'datetime',
        'parent_signed_at' => 'datetime',
        'started_at' => 'date',
        'ended_at' => 'date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function room()
    {
        return $this->belongsTo(Room::class);
    }
}
