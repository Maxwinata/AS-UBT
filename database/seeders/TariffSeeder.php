<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Tariff;
use App\Models\PaymentScheme;

class TariffSeeder extends Seeder
{
    public function run(): void
    {
        // 1. MASTER TARIFFS
        $tariffs = [
            ['name' => 'Sewa Kamar Standar (Per Bulan)', 'amount' => 500000, 'category' => 'SEWA', 'target' => 'ALL'],
            ['name' => 'Deposit Jaminan (Non-KIP)', 'amount' => 1000000, 'category' => 'DEPOSIT', 'target' => 'REGULER'],
            ['name' => 'Deposit Jaminan KIP (Lunas 1x)', 'amount' => 500000, 'category' => 'DEPOSIT', 'target' => 'KIP'],
            ['name' => 'Deposit Jaminan KIP (Dicicil 1,5x)', 'amount' => 750000, 'category' => 'DEPOSIT', 'target' => 'KIP'],
            ['name' => 'Biaya Administrasi (Non-KIP)', 'amount' => 100000, 'category' => 'PERLENGKAPAN', 'target' => 'REGULER'],
            ['name' => 'Biaya Administrasi (KIP)', 'amount' => 100000, 'category' => 'PERLENGKAPAN', 'target' => 'KIP'],
            ['name' => 'Biaya Admin Cicilan 2x (Deposit KIP)', 'amount' => 125000, 'category' => 'CICILAN', 'target' => 'KIP'],
            ['name' => 'Biaya Admin Cicilan 3x (Deposit KIP)', 'amount' => 250000, 'category' => 'CICILAN', 'target' => 'KIP'],
        ];

        foreach ($tariffs as $t) {
            Tariff::updateOrCreate(['name' => $t['name']], $t);
        }

        // 2. PAYMENT SCHEMES
        $schemes = [
            ['target' => 'KIP', 'max_installments' => 3, 'installment_multiplier' => 1.5, 'allow_deposit_installment' => false],
            ['target' => 'REGULER', 'max_installments' => 1, 'installment_multiplier' => 1.0, 'allow_deposit_installment' => false],
            ['target' => 'INTERNAL', 'max_installments' => 6, 'installment_multiplier' => 1.2, 'allow_deposit_installment' => false],
            ['target' => 'EXTERNAL', 'max_installments' => 1, 'installment_multiplier' => 1.0, 'allow_deposit_installment' => false],
            ['target' => 'SCHOLARSHIP', 'max_installments' => 3, 'installment_multiplier' => 1.5, 'allow_deposit_installment' => false],
        ];

        foreach ($schemes as $s) {
            PaymentScheme::updateOrCreate(['target' => $s['target']], $s);
        }
    }
}
