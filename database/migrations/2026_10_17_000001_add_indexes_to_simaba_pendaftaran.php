<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Menambahkan indeks komposit dan indeks kolom performa tinggi (B-Tree)
     * pada tabel 'pendaftaranmahasiswa' di basis data sekunder SIMABA ('simaba' / u540633926_simaba)
     * untuk mempercepat eksekusi query jutaan/ribuan data PMB menjadi sub-5 milidetik.
     */
    public function up(): void
    {
        if (Schema::connection('simaba')->hasTable('pendaftaranmahasiswa')) {
            Schema::connection('simaba')->table('pendaftaranmahasiswa', function (Blueprint $table) {
                // 1. Indeks Komposit Autentikasi (Nomor Pendaftaran + Tanggal Lahir)
                // Mengubah pencocokan login Maba menjadi O(1) B-Tree index lookup
                $table->index(['nomor_pendaftaran', 'tanggal_lahir'], 'idx_pmb_auth');

                // 2. Indeks Nama Mahasiswa untuk Live Search Auto-Suggest
                $table->index('nama_mahasiswa', 'idx_pmb_nama');

                // 3. Indeks NIK Calon Mahasiswa untuk Verifikasi Silang SIAKAD
                $table->index('nik', 'idx_pmb_nik');

                // 4. Indeks Komposit Program Studi & Jalur Pendaftaran (KIP / Reguler)
                $table->index(['program_studi', 'jenis_mahasiswa'], 'idx_pmb_prodi_jalur');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::connection('simaba')->hasTable('pendaftaranmahasiswa')) {
            Schema::connection('simaba')->table('pendaftaranmahasiswa', function (Blueprint $table) {
                $table->dropIndex('idx_pmb_auth');
                $table->dropIndex('idx_pmb_nama');
                $table->dropIndex('idx_pmb_nik');
                $table->dropIndex('idx_pmb_prodi_jalur');
            });
        }
    }
};
