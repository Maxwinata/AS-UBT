<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Membuat 3 tabel Bridging Staging Mandiri (request_*) dan 3 tabel Running Master (pembayaran, pembayaran_detail, transaksi)
     * sesuai dengan skema SQL Web Admin Laravel (u540633926_asrama).
     */
    public function up(): void
    {
        // 1. MASTER PENYEWA
        if (!Schema::hasTable('penyewa')) {
            Schema::create('penyewa', function (Blueprint $table) {
                $table->id();
                $table->string('jenis_penyewa', 20)->default('mahasiswa');
                $table->string('angkatan', 4)->nullable();
                $table->string('namalengkap', 191)->nullable();
                $table->string('noktp', 16)->nullable();
                $table->string('nohp', 50)->nullable();
                $table->string('nim', 50)->nullable()->unique();
                $table->string('kip', 50)->nullable();
                $table->string('email', 50)->nullable();
                $table->char('jenis_kelamin', 1)->nullable();
                $table->longText('alamat')->nullable();
                $table->string('nama_bill_to', 50)->nullable();
                $table->integer('status_asrama')->default(0);
                $table->integer('status_catering')->default(0);
                $table->integer('status')->default(0);
                $table->integer('operator_id')->default(1);
                $table->timestamps(3);
            });
        }

        // 2. STAGING 1: request_pembayaran (Header Permintaan Pendaftaran Otonom Maba)
        if (!Schema::hasTable('request_pembayaran')) {
            Schema::create('request_pembayaran', function (Blueprint $table) {
                $table->id();
                $table->string('no_request', 50)->nullable()->unique();
                $table->dateTime('tanggal_pembayaran', 3)->nullable();
                $table->dateTime('tanggal_masuk', 3)->nullable();
                $table->dateTime('tanggal_keluar', 3)->nullable();
                $table->integer('durasi')->nullable();
                $table->bigInteger('penyewa_id')->nullable();
                $table->string('nama_bill_to', 50)->nullable();
                $table->bigInteger('kamar_id')->nullable();
                $table->decimal('total_tagihan', 15, 2)->nullable();
                $table->decimal('total_potongan_harga', 15, 2)->default(0.00);
                $table->decimal('total_bayar', 15, 2)->nullable();
                $table->string('status_pembayaran', 50)->default('pending');
                $table->dateTime('tanggal_perpanjang')->nullable();
                $table->integer('status_asrama')->default(0);
                $table->integer('status_catering')->default(0);
                $table->integer('status_verifikasi')->default(0); // 0 = Menunggu Review Admin, 1 = Disetujui
                $table->dateTime('tanggal_verifikasi', 3)->nullable();
                $table->integer('operator_id')->default(0);
                $table->timestamps(3);
            });
        }

        // 3. STAGING 2: request_pembayaran_detail (Rincian Komponen Biaya Permintaan)
        if (!Schema::hasTable('request_pembayaran_detail')) {
            Schema::create('request_pembayaran_detail', function (Blueprint $table) {
                $table->id();
                $table->string('no_request', 50)->nullable();
                $table->bigInteger('harga_id')->nullable();
                $table->string('jenissewa', 255)->nullable();
                $table->decimal('harga', 15, 2)->nullable();
                $table->integer('qty')->nullable();
                $table->integer('jumlah_pembayaran')->nullable();
                $table->decimal('potongan_harga', 15, 2)->default(0.00);
                $table->integer('status')->default(1);
                $table->timestamps(3);

                $table->index('no_request');
            });
        }

        // 4. STAGING 3: request_transaksi (Mutasi & Bukti Transfer Mandiri Maba)
        if (!Schema::hasTable('request_transaksi')) {
            Schema::create('request_transaksi', function (Blueprint $table) {
                $table->id();
                $table->string('no_request', 50)->nullable();
                $table->string('no_transaksi', 50);
                $table->dateTime('tanggal_transaksi', 3);
                $table->decimal('jumlah_uang', 15, 2);
                $table->string('metode_pembayaran', 255);
                $table->string('file_bukti', 100)->nullable();
                $table->integer('operator_id')->default(0);
                $table->timestamps(3);

                $table->index('no_request');
            });
        }

        // 5. MASTER 1: pembayaran (Buku Besar Tagihan Resmi yang Disahkan Admin)
        if (!Schema::hasTable('pembayaran')) {
            Schema::create('pembayaran', function (Blueprint $table) {
                $table->id();
                $table->string('no_invoice', 50)->nullable()->unique();
                $table->dateTime('tanggal_pembayaran', 3)->nullable();
                $table->string('jenis_penyewa', 20)->default('mahasiswa');
                $table->dateTime('tanggal_masuk', 3)->nullable();
                $table->dateTime('tanggal_keluar', 3)->nullable();
                $table->integer('durasi')->nullable();
                $table->bigInteger('penyewa_id')->nullable();
                $table->string('nama_lengkap', 255)->nullable();
                $table->string('no_ktp', 20)->nullable();
                $table->string('nama_bill_to', 50)->nullable();
                $table->bigInteger('kamar_id')->nullable();
                $table->decimal('total_tagihan', 15, 2)->nullable();
                $table->decimal('total_potongan_harga', 15, 2)->default(0.00);
                $table->decimal('total_bayar', 15, 2)->nullable();
                $table->string('status_pembayaran', 50)->default('pending');
                $table->dateTime('tanggal_perpanjang')->nullable();
                $table->integer('status_asrama')->default(0);
                $table->integer('status_catering')->default(0);
                $table->integer('operator_id')->default(1);
                $table->timestamps(3);
            });
        }

        // 6. MASTER 2: pembayaran_detail (Rincian Komponen Biaya Resmi)
        if (!Schema::hasTable('pembayaran_detail')) {
            Schema::create('pembayaran_detail', function (Blueprint $table) {
                $table->id();
                $table->string('no_invoice', 50)->nullable();
                $table->bigInteger('harga_id')->nullable();
                $table->string('jenissewa', 255)->nullable();
                $table->decimal('harga', 15, 2)->nullable();
                $table->integer('qty')->nullable();
                $table->integer('jumlah_pembayaran')->nullable();
                $table->decimal('potongan_harga', 15, 2)->default(0.00);
                $table->integer('status')->default(1);
                $table->timestamps(3);

                $table->index('no_invoice');
            });
        }

        // 7. MASTER 3: transaksi (Catatan Mutasi & Kas Resmi Berjalan)
        if (!Schema::hasTable('transaksi')) {
            Schema::create('transaksi', function (Blueprint $table) {
                $table->id();
                $table->bigInteger('parent_id')->nullable();
                $table->string('no_invoice', 50)->nullable();
                $table->bigInteger('penyewa_id')->nullable();
                $table->string('no_transaksi', 50);
                $table->dateTime('tanggal_transaksi', 3);
                $table->decimal('jumlah_uang', 15, 2);
                $table->string('metode_pembayaran', 255);
                $table->string('file_bukti', 100)->nullable();
                $table->string('jenis_transaksi', 50)->default('Asrama');
                $table->integer('operator_id')->default(1);
                $table->timestamps(3);

                $table->index('no_invoice');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transaksi');
        Schema::dropIfExists('pembayaran_detail');
        Schema::dropIfExists('pembayaran');
        Schema::dropIfExists('request_transaksi');
        Schema::dropIfExists('request_pembayaran_detail');
        Schema::dropIfExists('request_pembayaran');
        Schema::dropIfExists('penyewa');
    }
};
