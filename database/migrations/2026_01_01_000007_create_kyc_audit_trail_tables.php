<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Membuat tabel penyimpanan privat berkas e-KYC berversi (kyc_documents)
     * dan tabel jejak audit forensik (modification_logs)
     * Sesuai mandat arsitektur sistem (RULE[AGENTS_md]).
     */
    public function up(): void
    {
        // 1. PENYIMPANAN PRIVAT BERKAS e-KYC BERVERSI (IMMUTABLE VERSIONING)
        if (!Schema::hasTable('kyc_documents')) {
            Schema::create('kyc_documents', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('user_id')->comment('Pemilik akun mahasiswa');
                $table->unsignedBigInteger('penyewa_id')->nullable()->comment('Relasi ke master penyewa jika sudah dibuat');
                $table->string('doc_type', 50)->comment('KTP, SELFIE_KTP, SURAT_PERNYATAAN_ORTU, SURAT_KIP');
                $table->string('file_name', 255)->comment('Nama file unik berversi e.g. ktp_nim_v2_169456.jpg');
                $table->string('file_path', 255)->comment('Path relatif pada private bucket vault');
                $table->unsignedInteger('file_version')->default(1)->comment('Nomor versi berkas, inkremental & tidak boleh ditimpa');
                $table->boolean('is_active_version')->default(true)->comment('Hanya 1 versi aktif per user & doc_type');
                $table->string('storage_disk', 50)->default('private_kyc')->comment('Strictly Private Bucket (Non-public)');
                $table->unsignedBigInteger('file_size_bytes')->nullable();
                $table->string('mime_type', 100)->nullable();
                $table->string('file_hash', 64)->nullable()->comment('Checksum SHA-256 integritas berkas');
                $table->enum('status_verifikasi', ['PENDING', 'APPROVED', 'REJECTED'])->default('PENDING');
                $table->unsignedBigInteger('verified_by')->nullable()->comment('ID Admin pemeriksa');
                $table->dateTime('verified_at', 3)->nullable();
                $table->text('rejection_reason')->nullable();
                $table->date('retention_until')->nullable()->comment('Jadwal garbage collection 60 hari untuk versi lama');
                $table->timestamps(3);

                // Foreign Key & Index Optimization
                $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
                $table->index(['user_id', 'doc_type']);
                $table->index('is_active_version');
                $table->index('retention_until');
            });
        }

        // 2. JEJAK AUDIT FORENSIK PERUBAHAN DATA & SINKRONISASI (AUDIT TRAIL)
        if (!Schema::hasTable('modification_logs')) {
            Schema::create('modification_logs', function (Blueprint $table) {
                $table->id();
                $table->string('trackable_type', 100)->comment('Tabel target e.g. maba_profiles, penyewa, kyc_documents, billing_invoices');
                $table->unsignedBigInteger('trackable_id')->comment('ID record pada entitas target');
                $table->string('actor_type', 20)->comment('User, Admin, System');
                $table->unsignedBigInteger('actor_id')->nullable()->comment('ID aktor jika tercatat di users');
                $table->string('action', 100)->comment('KYC_INITIAL_UPLOAD, KYC_CORRECTION_RESUBMIT, KYC_VERIFICATION_APPROVAL, SIDARA_MANUAL_NIM_SYNC');
                $table->json('old_values')->nullable()->comment('Snapshot nilai lama sebelum mutasi');
                $table->json('new_values')->nullable()->comment('Snapshot nilai baru setelah mutasi');
                $table->string('ip_address', 45)->nullable();
                $table->text('user_agent')->nullable();
                $table->timestamp('created_at', 3)->useCurrent();

                // Indexes
                $table->index(['trackable_type', 'trackable_id']);
                $table->index('actor_id');
                $table->index('created_at');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('modification_logs');
        Schema::dropIfExists('kyc_documents');
    }
};
