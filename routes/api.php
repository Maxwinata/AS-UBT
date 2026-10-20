<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\SiakadSyncController;

/*
|--------------------------------------------------------------------------
| API Routes (Webhooks & Background Integrations)
|--------------------------------------------------------------------------
*/

Route::get('/health', function () {
    return response()->json(['status' => 'ok', 'app' => 'Portal SI-GABUNG 54']);
});

// Integrasi Basis Data SIAKAD / SIDARA Staging
Route::prefix('siakad')->group(function () {
    Route::get('/links', [SiakadSyncController::class, 'index'])->name('api.siakad.links');
    Route::post('/sync', [SiakadSyncController::class, 'triggerSync'])->name('api.siakad.sync');
    Route::get('/staging', [SiakadSyncController::class, 'getStagingData'])->name('api.siakad.staging');
    Route::post('/staging/{id}/verify-subsidi', [SiakadSyncController::class, 'verifySubsidi'])->name('api.siakad.verify_subsidi');
    Route::post('/staging/{id}/promote', [SiakadSyncController::class, 'promote'])->name('api.siakad.promote');
});

// Webhook Rekonsiliasi Mutasi Bank BSI Otomatis
Route::post('/webhooks/bsi-mutation', function (Request $request) {
    return response()->json(['status' => 'received']);
});

// Webhook Notifikasi Host-to-Host Virtual Account BNI
Route::post('/webhooks/bni-va-callback', function (Request $request) {
    return response()->json(['status' => 'received']);
});
