<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Ticket extends Model
{
    protected $fillable = [
        'ticket_number',
        'user_id',
        'room_id',
        'barcode_data',
        'qr_code_url',
        'check_in_date',
        'status', // 'GENERATED', 'CHECKED_IN', 'CANCELLED'
        'checked_in_at',
        'checked_in_by',
    ];

    protected $casts = [
        'check_in_date' => 'date',
        'checked_in_at' => 'datetime',
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
