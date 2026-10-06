<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role', // 'admin', 'maba', 'eksisting', 'keuangan'
        'nim',
        'no_pmb',
        'is_kip_student',
        'phone',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_kip_student' => 'boolean',
        ];
    }

    public function mabaProfile()
    {
        return $this->hasOne(MabaProfile::class);
    }

    public function invoices()
    {
        return $this->hasMany(BillingInvoice::class);
    }

    public function contract()
    {
        return $this->hasOne(Contract::class);
    }

    public function ticket()
    {
        return $this->hasOne(Ticket::class);
    }

    public function delinquencies()
    {
        return $this->hasMany(Delinquency::class);
    }
}
