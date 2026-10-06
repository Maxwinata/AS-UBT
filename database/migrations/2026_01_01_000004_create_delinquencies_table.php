<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('delinquencies', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('contract_id')->nullable()->constrained('contracts')->nullOnDelete();
            $table->string('room_number');
            $table->string('student_name');
            $table->string('nim')->nullable();
            $table->string('phone')->nullable();
            $table->date('due_date');
            $table->integer('days_overdue')->default(0);
            $table->decimal('arrears_amount', 12, 2)->default(0);
            $table->decimal('deposit_deducted_for_rent', 12, 2)->default(0);
            $table->decimal('deposit_remaining', 12, 2)->default(0);
            
            // 3 Tingkat Kebijakan Toleransi 5+5 Hari:
            // 1. TOLERANSI_SEWA (D+1 s/d D+5: Masa tenggang sewa)
            // 2. DEPOSIT_DIPAKAI_GRACE_TOPUP (D+6 s/d D+10: Uang sewa dipotong deposit, toleransi isi ulang deposit)
            // 3. WANPRESTASI_AKUT (> D+10: Denda Rp500.000, pengakhiran kontrak & sisa deposit hangus)
            $table->enum('stage', ['TOLERANSI_SEWA', 'DEPOSIT_DIPAKAI_GRACE_TOPUP', 'WANPRESTASI_AKUT'])->default('TOLERANSI_SEWA');
            $table->string('stage_label');
            $table->boolean('is_eviction_issued')->default(false);
            $table->decimal('fine_amount', 12, 2)->default(0);
            $table->timestamp('last_action_date')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('delinquencies');
    }
};
