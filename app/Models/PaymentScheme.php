<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PaymentScheme extends Model
{
    protected $fillable = [
        'target', // 'KIP', 'REGULER', 'INTERNAL', 'EXTERNAL', 'SCHOLARSHIP'
        'max_installments',
        'installment_multiplier',
        'allow_deposit_installment',
    ];

    protected $casts = [
        'max_installments' => 'integer',
        'installment_multiplier' => 'float',
        'allow_deposit_installment' => 'boolean',
    ];
}
