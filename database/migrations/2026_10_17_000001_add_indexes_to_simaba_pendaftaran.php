<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Menambahkan indeks komposit dan indeks kolom performa tinggi (B-Tree)
     * pada tabel 'pendaftaranmahasiswa' di basis data sekunder SIMABA ('simaba' / u540633926_simaba)
     * secara IDEMPOTEN (tidak crash jika indeks sudah ada sebelumnya - mencegah MySQL Error 1061).
     */
    public function up(): void
    {
        if (Schema::connection('simaba')->hasTable('pendaftaranmahasiswa')) {
            $existingIndexes = [];
            try {
                $rawIndexes = DB::connection('simaba')->select("SHOW INDEXES FROM pendaftaranmahasiswa");
                foreach ($rawIndexes as $idx) {
                    $keyName = $idx->Key_name ?? $idx->key_name ?? null;
                    if ($keyName) {
                        $existingIndexes[$keyName] = true;
                    }
                }
            } catch (\Throwable $e) {
                $existingIndexes = [];
            }

            Schema::connection('simaba')->table('pendaftaranmahasiswa', function (Blueprint $table) use ($existingIndexes) {
                // 1. Indeks Komposit Autentikasi (Nomor Pendaftaran + Tanggal Lahir)
                if (empty($existingIndexes['idx_pmb_auth'])) {
                    $table->index(['nomor_pendaftaran', 'tanggal_lahir'], 'idx_pmb_auth');
                }

                // 2. Indeks Nama Mahasiswa untuk Live Search Auto-Suggest
                if (empty($existingIndexes['idx_pmb_nama'])) {
                    $table->index('nama_mahasiswa', 'idx_pmb_nama');
                }

                // 3. Indeks NIK Calon Mahasiswa untuk Verifikasi Silang SIAKAD
                if (empty($existingIndexes['idx_pmb_nik'])) {
                    $table->index('nik', 'idx_pmb_nik');
                }

                // 4. Indeks Komposit Program Studi & Jalur Pendaftaran (KIP / Reguler)
                if (empty($existingIndexes['idx_pmb_prodi_jalur'])) {
                    $table->index(['program_studi', 'jenis_mahasiswa'], 'idx_pmb_prodi_jalur');
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::connection('simaba')->hasTable('pendaftaranmahasiswa')) {
            $existingIndexes = [];
            try {
                $rawIndexes = DB::connection('simaba')->select("SHOW INDEXES FROM pendaftaranmahasiswa");
                foreach ($rawIndexes as $idx) {
                    $keyName = $idx->Key_name ?? $idx->key_name ?? null;
                    if ($keyName) {
                        $existingIndexes[$keyName] = true;
                    }
                }
            } catch (\Throwable $e) {
                $existingIndexes = [];
            }

            Schema::connection('simaba')->table('pendaftaranmahasiswa', function (Blueprint $table) use ($existingIndexes) {
                if (!empty($existingIndexes['idx_pmb_auth'])) {
                    $table->dropIndex('idx_pmb_auth');
                }
                if (!empty($existingIndexes['idx_pmb_nama'])) {
                    $table->dropIndex('idx_pmb_nama');
                }
                if (!empty($existingIndexes['idx_pmb_nik'])) {
                    $table->dropIndex('idx_pmb_nik');
                }
                if (!empty($existingIndexes['idx_pmb_prodi_jalur'])) {
                    $table->dropIndex('idx_pmb_prodi_jalur');
                }
            });
        }
    }
};
