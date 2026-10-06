<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tariffs', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->decimal('amount', 12, 2);
            $table->enum('category', ['SEWA', 'DEPOSIT', 'PERLENGKAPAN', 'CICILAN', 'ADMIN', 'PENGATURAN']);
            $table->enum('target', ['ALL', 'REGULER', 'KIP', 'INTERNAL', 'EXTERNAL'])->default('ALL');
            $table->text('description')->nullable();
            $table->timestamps();
        });

        Schema::create('payment_schemes', function (Blueprint $table) {
            $table->id();
            $table->enum('target', ['KIP', 'REGULER', 'INTERNAL', 'EXTERNAL', 'SCHOLARSHIP'])->unique();
            $table->integer('max_installments')->default(1);
            $table->float('installment_multiplier')->default(1.0);
            $table->boolean('allow_deposit_installment')->default(false);
            $table->timestamps();
        });

        Schema::create('modification_logs', function (Blueprint $table) {
            $table->id();
            $table->string('actor');
            $table->string('action');
            $table->string('field_changed')->nullable();
            $table->text('old_value')->nullable();
            $table->text('new_value')->nullable();
            $table->string('ip_address')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('modification_logs');
        Schema::dropIfExists('payment_schemes');
        Schema::dropIfExists('tariffs');
    }
};
