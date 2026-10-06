<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\Maba\MabaDashboardController;
use App\Http\Controllers\Admin\AdminAsramaController;
use App\Http\Controllers\Eksisting\EksistingDashboardController;
use App\Http\Controllers\Billing\InvoiceController;
use App\Http\Controllers\Kyc\KycVerificationController;
use App\Http\Controllers\Sop\CronSopController;

/*
|--------------------------------------------------------------------------
| Web Routes (Laravel + Inertia.js)
|--------------------------------------------------------------------------
*/

Route::get('/', function () {
    return redirect()->route('login');
});

// Autentikasi / SSO Login Page
Route::get('/login', function () {
    return Inertia::render('Auth/Login');
})->name('login');

// Route Mahasiswa Baru (Maba)
Route::prefix('maba')->group(function () {
    Route::get('/dashboard', [MabaDashboardController::class, 'index'])->name('maba.dashboard');
    Route::post('/profile', [MabaDashboardController::class, 'updateProfile'])->name('maba.profile.update');
    Route::post('/kyc', [KycVerificationController::class, 'store'])->name('maba.kyc.store');
    Route::get('/kyc/signed-url/{type}', [KycVerificationController::class, 'getSignedUrl'])->name('maba.kyc.signed_url');
    Route::post('/invoice/configure', [InvoiceController::class, 'configure'])->name('maba.invoice.configure');
    Route::post('/invoice/{id}/upload-proof', [InvoiceController::class, 'uploadTransferProof'])->name('maba.invoice.upload');
    Route::post('/contract/sign', [MabaDashboardController::class, 'signContract'])->name('maba.contract.sign');
});

// Route Akses Dokumen Privat e-KYC (Wajib Memiliki Tanda Tangan Digital URL yang Sah)
Route::get('/kyc/view/{id}/{type}', [KycVerificationController::class, 'showPrivateDocument'])
    ->name('kyc.document.view')
    ->middleware('signed');

// Route Admin Asrama & Keuangan
Route::prefix('admin')->group(function () {
    Route::get('/dashboard', [AdminAsramaController::class, 'index'])->name('admin.dashboard');
    Route::post('/invoice/{id}/verify', [AdminAsramaController::class, 'verifyInvoice'])->name('admin.invoice.verify');
    Route::post('/delinquency/{id}/action', [AdminAsramaController::class, 'handleDelinquencyAction'])->name('admin.delinquency.action');
});

// Route Mahasiswa Senior / Eksisting
Route::prefix('eksisting')->group(function () {
    Route::get('/dashboard', [EksistingDashboardController::class, 'index'])->name('eksisting.dashboard');
});

// Route SOP & CRON Monitor
Route::prefix('sop')->group(function () {
    Route::get('/cron-monitor', [CronSopController::class, 'index'])->name('sop.cron.monitor');
    Route::post('/cron/run-enforcement', [CronSopController::class, 'runDailyEnforcement'])->name('sop.cron.run');
});
