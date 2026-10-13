<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Membuat tabel master api_link dan tabel staging siakad_mahasiswa_stg
     * untuk integrasi API SIAKAD UBT (mahasiswa-btt-006 & mahasiswa-btt-002).
     */
    public function up(): void
    {
        // 1. MASTER API LINK
        if (!Schema::hasTable('api_link')) {
            Schema::create('api_link', function (Blueprint $table) {
                $table->id();
                $table->string('jenis', 50)->default('penyewa');
                $table->string('kategori', 50)->comment('nonkip / kip');
                $table->string('link', 255);
                $table->string('nama', 100);
                $table->dateTime('last_synced_at')->nullable();
                $table->integer('total_records')->default(0);
                $table->timestamps();
            });

            // Seeding default dari konfigurasi database asrama
            DB::table('api_link')->insert([
                [
                    'id' => 1,
                    'jenis' => 'penyewa',
                    'kategori' => 'nonkip',
                    'link' => 'https://siakad.ubtsu.ac.id/api/mahasiswa-btt-006',
                    'nama' => 'Beasiswa Khusus',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'id' => 2,
                    'jenis' => 'penyewa',
                    'kategori' => 'kip',
                    'link' => 'https://siakad.ubtsu.ac.id/api/mahasiswa-btt-002',
                    'nama' => 'KIP',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
            ]);
        }

        // 2. STAGING MAHASISWA PRA-REGISTRASI (DARI API SIAKAD)
        if (!Schema::hasTable('siakad_mahasiswa_stg')) {
            Schema::create('siakad_mahasiswa_stg', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('api_link_id');
                $table->string('kategori_beasiswa', 50)->comment('nonkip / kip');
                $table->string('nama_beasiswa', 100)->nullable();
                $table->string('nomor_registrasi', 50)->unique()->comment('PMB / NIM Calon');
                $table->string('nama_lengkap', 191);
                $table->string('nik', 16)->nullable();
                $table->string('email', 100)->nullable();
                $table->string('nomor_telepon', 50)->nullable();
                $table->string('program_studi', 100)->nullable();
                $table->string('fakultas', 100)->nullable();
                $table->char('jenis_kelamin', 1)->nullable();
                $table->integer('status_klaim')->default(0)->comment('0=Belum Mendaftar, 1=Telah Klaim / Isi Form');
                $table->integer('status_verifikasi_subsidi')->default(0)->comment('0=Pending, 1=Disetujui, -1=Ditolak');
                $table->string('verified_by')->nullable();
                $table->dateTime('verified_at')->nullable();
                $table->text('catatan_admin')->nullable();
                $table->json('payload_raw')->nullable();
                $table->timestamp('synced_at')->useCurrent();
                $table->timestamps();

                $table->index('nomor_registrasi');
                $table->index('kategori_beasiswa');
                $table->foreign('api_link_id')->references('id')->on('api_link')->onDelete('cascade');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('siakad_mahasiswa_stg');
        Schema::dropIfExists('api_link');
    }
};
