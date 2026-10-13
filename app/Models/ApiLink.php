<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ApiLink extends Model
{
    protected $table = 'api_link';
    protected $guarded = ['id'];

    protected $casts = [
        'last_synced_at' => 'datetime',
        'total_records' => 'integer',
    ];

    public function mahasiswaStaging(): HasMany
    {
        return $this->hasMany(SiakadMahasiswaStg::class, 'api_link_id');
    }
}
