<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;
use App\Http\Controllers\Sop\CronSopController;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote')->hourly();

// Jadwal CRON Harian: Pukul 00:01 WIB Penegakan Toleransi 5+5 Hari & Pemotongan Deposit
Schedule::call(function () {
    (new CronSopController)->runDailyEnforcement();
})->dailyAt('00:01')->timezone('Asia/Jakarta');
