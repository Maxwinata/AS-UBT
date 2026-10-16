<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SimabaPendaftaran extends Model
{
    /**
     * Model ini terhubung langsung ke basis data SIMABA (u540633926_simaba)
     * untuk membaca data asli calon mahasiswa baru (PMB).
     */
    protected $connection = 'simaba';
    protected $table = 'pendaftaranmahasiswa';
    protected $guarded = ['id'];

    protected $casts = [
        'tanggal_lahir' => 'date',
        'status' => 'integer',
        'status_verifikasi' => 'integer',
    ];

    /**
     * Pemetaan ID Program Studi ke Nama Resmi di SIMABA UBT
     */
    public static $prodiMap = [
        6 => 'S1 Ilmu Keperawatan',
        7 => 'S1 Kesehatan Masyarakat',
        8 => 'S1 Hukum',
        9 => 'S1 Manajemen',
        10 => 'S1 Informatika',
        11 => 'D III Keperawatan',
        12 => 'D III Kebidanan',
    ];

    /**
     * Accessor untuk nama program studi
     */
    public function getNamaProdiAttribute(): string
    {
        return self::$prodiMap[$this->program_studi] ?? "Prodi ID: {$this->program_studi}";
    }

    /**
     * Autentikasi Mahasiswa Baru: Mencocokkan nomor pendaftaran & tanggal lahir (mendukung format DD/MM/YYYY dan YYYY-MM-DD)
     */
    public static function authenticate(string $noPendaftaran, string $birthDateInput)
    {
        $cleanNoReg = trim($noPendaftaran);
        $cleanDate = trim($birthDateInput);

        // Jika format tanggal input adalah DD/MM/YYYY, konversikan ke YYYY-MM-DD untuk query SQL
        if (preg_match('/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/', $cleanDate, $matches)) {
            $day = str_pad($matches[1], 2, '0', STR_PAD_LEFT);
            $month = str_pad($matches[2], 2, '0', STR_PAD_LEFT);
            $year = $matches[3];
            $formattedDate = "{$year}-{$month}-{$day}";
        } else {
            $formattedDate = $cleanDate;
        }

        return self::where('nomor_pendaftaran', $cleanNoReg)
            ->where('tanggal_lahir', $formattedDate)
            ->first();
    }

    /**
     * Scope query untuk pencarian real-time nama atau nomor pendaftaran
     */
    public function scopeSearchByNameOrReg($query, string $keyword)
    {
        $kw = trim($keyword);
        return $query->where(function ($q) use ($kw) {
            $q->where('nama_mahasiswa', 'LIKE', "%{$kw}%")
              ->orWhere('nomor_pendaftaran', 'LIKE', "%{$kw}%");
        });
    }
}
