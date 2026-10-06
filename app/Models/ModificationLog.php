<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ModificationLog extends Model
{
    protected $fillable = [
        'actor',
        'action',
        'field_changed',
        'old_value',
        'new_value',
        'ip_address',
    ];
}
