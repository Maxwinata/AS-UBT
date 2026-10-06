<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Rooms
        Schema::create('rooms', function (Blueprint $table) {
            $table->id();
            $table->string('room_code')->unique();
            $table->string('gedung');
            $table->integer('lantai')->default(1);
            $table->string('nomor_kamar');
            $table->integer('kapasitas')->default(2);
            $table->integer('terisi')->default(0);
            $table->json('fasilitas')->nullable();
            $table->enum('status', ['AVAILABLE', 'FULL', 'MAINTENANCE'])->default('AVAILABLE');
            $table->timestamps();
        });

        // 2. Maba Profiles & e-KYC
        Schema::create('maba_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('nim_no_reg')->nullable();
            $table->string('no_pmb')->nullable();
            $table->string('nim')->nullable();
            $table->string('nama');
            $table->string('jalur_masuk')->nullable();
            $table->string('fakultas')->nullable();
            $table->string('prodi')->nullable();
            $table->string('angkatan')->default('2026');
            $table->string('jenis_kelamin')->nullable();
            $table->string('kategori')->default('Reguler');
            $table->string('no_hp_wa')->nullable();
            $table->string('email')->nullable();

            // Alamat KTP
            $table->string('alamat_ktp_jalan')->nullable();
            $table->string('alamat_ktp_rt_rw')->nullable();
            $table->string('alamat_ktp_kelurahan')->nullable();
            $table->string('alamat_ktp_kecamatan')->nullable();
            $table->string('alamat_ktp_kabupaten_kota')->nullable();
            $table->string('alamat_ktp_provinsi')->nullable();
            $table->string('alamat_ktp_kode_pos')->nullable();

            // Domisili
            $table->boolean('is_alamat_domisili_sama_dengan_ktp')->default(true);
            $table->string('alamat_domisili_jalan')->nullable();
            $table->string('alamat_domisili_rt_rw')->nullable();
            $table->string('alamat_domisili_kelurahan')->nullable();
            $table->string('alamat_domisili_kecamatan')->nullable();
            $table->string('alamat_domisili_kabupaten_kota')->nullable();
            $table->string('alamat_domisili_provinsi')->nullable();
            $table->string('alamat_domisili_kode_pos')->nullable();

            // Kontak Darurat
            $table->string('kontak_darurat_nama')->nullable();
            $table->string('kontak_darurat_hubungan')->nullable();
            $table->string('kontak_darurat_no_hp')->nullable();
            $table->text('kontak_darurat_alamat')->nullable();
            $table->string('kontak_darurat_2_nama')->nullable();
            $table->string('kontak_darurat_2_hubungan')->nullable();
            $table->string('kontak_darurat_2_no_hp')->nullable();
            $table->text('kontak_darurat_2_alamat')->nullable();

            // Asrama preference
            $table->string('tipe_kamar')->default('Standar');
            $table->string('preferensi_lantai')->default('Lantai 2');
            $table->string('kebutuhan_khusus')->nullable();
            $table->string('catatan_kesehatan')->nullable();
            $table->boolean('persetujuan_awal')->default(true);
            $table->boolean('is_kip_student')->default(false);

            // e-KYC
            $table->boolean('is_kyc_required')->default(true);
            $table->boolean('kyc_submitted')->default(false);
            $table->string('ktp_url')->nullable();
            $table->string('selfie_url')->nullable();
            $table->boolean('kyc_verified')->default(false);
            $table->timestamp('kyc_verified_at')->nullable();
            $table->text('kyc_notes')->nullable();

            $table->timestamps();
        });

        // 3. Billing Invoices
        Schema::create('billing_invoices', function (Blueprint $table) {
            $table->id();
            $table->string('invoice_id')->unique();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('nim')->nullable();
            $table->string('nama');
            $table->boolean('is_kip')->default(false);
            $table->integer('durasi_bulan')->default(6);
            $table->enum('skema_bayar_sewa', ['LUNAS_DIMUKA', 'BULANAN'])->default('LUNAS_DIMUKA');
            $table->decimal('tarif_per_bulan', 12, 2)->default(500000);
            $table->decimal('biaya_sewa', 12, 2);
            $table->decimal('biaya_sewa_total_kontrak', 12, 2)->nullable();
            $table->decimal('sisa_sewa_kontrak', 12, 2)->default(0);

            // Deposit
            $table->boolean('is_cicilan_deposit')->default(false);
            $table->tinyInteger('opsi_cicilan')->default(1);
            $table->decimal('biaya_deposit', 12, 2);
            $table->decimal('biaya_deposit_total', 12, 2);
            $table->decimal('sisa_cicilan_deposit', 12, 2)->default(0);
            $table->boolean('cicilan_deposit_allowed')->default(false);

            // Biaya Administrasi (Default Rp 100.000)
            $table->decimal('biaya_perlengkapan', 12, 2)->default(100000);
            $table->integer('kode_unik');
            $table->decimal('total_bayar', 12, 2);

            $table->enum('status', ['UNPAID', 'PENDING_VERIFICATION', 'PAID', 'EXPIRED'])->default('UNPAID');
            $table->enum('metode_bayar', ['TRANSFER_MANUAL', 'VIRTUAL_ACCOUNT'])->default('TRANSFER_MANUAL');
            $table->string('bukti_transfer_path')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->foreignId('verified_by')->nullable()->constrained('users');
            $table->text('verification_notes')->nullable();

            $table->timestamps();
        });

        // 4. Contracts
        Schema::create('contracts', function (Blueprint $table) {
            $table->id();
            $table->string('contract_number')->unique();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('room_id')->nullable()->constrained('rooms');
            $table->boolean('student_signed')->default(false);
            $table->timestamp('student_signed_at')->nullable();
            $table->boolean('parent_signed')->default(false);
            $table->timestamp('parent_signed_at')->nullable();
            $table->text('signature_student_url')->nullable();
            $table->text('signature_parent_url')->nullable();
            $table->enum('status', ['DRAFT', 'SIGNED_BY_STUDENT', 'FULLY_SIGNED', 'TERMINATED'])->default('DRAFT');
            $table->date('started_at')->nullable();
            $table->date('ended_at')->nullable();
            $table->text('termination_reason')->nullable();
            $table->timestamps();
        });

        // 5. Tickets
        Schema::create('tickets', function (Blueprint $table) {
            $table->id();
            $table->string('ticket_number')->unique();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('room_id')->nullable()->constrained('rooms');
            $table->string('barcode_data')->nullable();
            $table->text('qr_code_url')->nullable();
            $table->date('check_in_date')->nullable();
            $table->enum('status', ['GENERATED', 'CHECKED_IN', 'CANCELLED'])->default('GENERATED');
            $table->timestamp('checked_in_at')->nullable();
            $table->string('checked_in_by')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tickets');
        Schema::dropIfExists('contracts');
        Schema::dropIfExists('billing_invoices');
        Schema::dropIfExists('maba_profiles');
        Schema::dropIfExists('rooms');
    }
};
