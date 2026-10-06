<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes (Webhooks & Background Integrations)
|--------------------------------------------------------------------------
*/

Route::get('/health', function () {
    return response()->json(['status' => 'ok', 'app' => 'Portal SI-GABUNG 54']);
});

// Webhook Rekonsiliasi Mutasi Bank BSI Otomatis
Route::post('/webhooks/bsi-mutation', function (Request $request) {
    // Validasi token webhook BSI & pencocokan kode unik
    return response()->json(['status' => 'received']);
});

// Webhook Notifikasi Host-to-Host Virtual Account BNI
Route::post('/webhooks/bni-va-callback', function (Request $request) {
    return response()->json(['status' => 'received']);
});
