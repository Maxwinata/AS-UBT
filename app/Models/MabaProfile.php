<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MabaProfile extends Model
{
    protected $fillable = [
        'user_id',
        'nim_no_reg',
        'no_pmb',
        'nim',
        'nama',
        'jalur_masuk',
        'fakultas',
        'prodi',
        'angkatan',
        'jenis_kelamin',
        'kategori',
        'no_hp_wa',
        'email',
        'alamat_ktp_jalan',
        'alamat_ktp_rt_rw',
        'alamat_ktp_kelurahan',
        'alamat_ktp_kecamatan',
        'alamat_ktp_kabupaten_kota',
        'alamat_ktp_provinsi',
        'alamat_ktp_kode_pos',
        'is_alamat_domisili_sama_dengan_ktp',
        'alamat_domisili_jalan',
        'alamat_domisili_rt_rw',
        'alamat_domisili_kelurahan',
        'alamat_domisili_kecamatan',
        'alamat_domisili_kabupaten_kota',
        'alamat_domisili_provinsi',
        'alamat_domisili_kode_pos',
        'kontak_darurat_nama',
        'kontak_darurat_hubungan',
        'kontak_darurat_no_hp',
        'kontak_darurat_alamat',
        'kontak_darurat_2_nama',
        'kontak_darurat_2_hubungan',
        'kontak_darurat_2_no_hp',
        'kontak_darurat_2_alamat',
        'tipe_kamar',
        'preferensi_lantai',
        'kebutuhan_khusus',
        'catatan_kesehatan',
        'persetujuan_awal',
        'is_kip_student',
        'is_kyc_required',
        'kyc_submitted',
        'ktp_url',
        'selfie_url',
        'kyc_verified',
        'kyc_verified_at',
        'kyc_notes',
    ];

    protected $casts = [
        'is_alamat_domisili_sama_dengan_ktp' => 'boolean',
        'persetujuan_awal' => 'boolean',
        'is_kip_student' => 'boolean',
        'is_kyc_required' => 'boolean',
        'kyc_submitted' => 'boolean',
        'kyc_verified' => 'boolean',
        'kyc_verified_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
