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

// API Live Search Calon Mahasiswa SIMABA berdasarkan Nama atau No. Pendaftaran
Route::get('/api/simaba/search-student', function (\Illuminate\Http\Request $request) {
    $q = trim($request->input('q', ''));
    if (strlen($q) < 2) {
        return response()->json([]);
    }

    try {
        $students = \App\Models\SimabaPendaftaran::searchByNameOrReg($q)
            ->take(8)
            ->get();

        $formatted = $students->map(function ($s) {
            return [
                'id' => $s->id,
                'nomor_pendaftaran' => $s->nomor_pendaftaran,
                'nama_mahasiswa' => $s->nama_mahasiswa,
                'program_studi' => $s->nama_prodi,
                'jenis_mahasiswa' => strtoupper($s->jenis_mahasiswa ?? 'REGULER'),
                'tanggal_lahir_raw' => $s->tanggal_lahir ? $s->tanggal_lahir->format('Y-m-d') : null,
                'tanggal_lahir_formatted' => $s->tanggal_lahir ? $s->tanggal_lahir->format('d/m/Y') : null,
            ];
        });

        return response()->json($formatted);
    } catch (\Exception $e) {
        return response()->json([]);
    }
})->name('api.simaba.search');

// Autentikasi Login Mahasiswa Baru via Database SIMABA + Deteksi Dini NIM via SIAKAD
Route::post('/auth/login-maba', function (\Illuminate\Http\Request $request) {
    $noPendaftaran = trim($request->input('nomor_pendaftaran', ''));
    $birthDate = trim($request->input('tanggal_lahir', ''));

    if (empty($noPendaftaran) || empty($birthDate)) {
        return response()->json([
            'success' => false,
            'message' => 'Nomor pendaftaran dan tanggal lahir wajib diisi.'
        ], 422);
    }

    // 1. Cek Kredensial Asli ke Database SIMABA (pendaftaranmahasiswa)
    try {
        $simabaStudent = \App\Models\SimabaPendaftaran::authenticate($noPendaftaran, $birthDate);
    } catch (\Exception $e) {
        $simabaStudent = null;
    }

    if (!$simabaStudent) {
        return response()->json([
            'success' => false,
            'message' => 'Kombinasi Nomor Pendaftaran dan Tanggal Lahir tidak cocok di basis data SIMABA UBT.'
        ], 401);
    }

    // 2. Early Detection: Cek ke SIAKAD / Staging apakah NIM resmi sudah diterbitkan
    $siakadMatch = \App\Models\SiakadMahasiswaStg::where('nomor_registrasi', $noPendaftaran)
        ->orWhere('nik', $simabaStudent->nik)
        ->first();

    $hasOfficialNim = false;
    $officialNim = null;

    if ($siakadMatch && !empty($siakadMatch->nim_resmi)) {
        $hasOfficialNim = true;
        $officialNim = $siakadMatch->nim_resmi;
    }

    return response()->json([
        'success' => true,
        'student' => [
            'id' => $simabaStudent->id,
            'nomor_pendaftaran' => $simabaStudent->nomor_pendaftaran,
            'nama_mahasiswa' => $simabaStudent->nama_mahasiswa,
            'nik' => $simabaStudent->nik,
            'tempat_lahir' => $simabaStudent->tempat_lahir,
            'tanggal_lahir' => $simabaStudent->tanggal_lahir ? $simabaStudent->tanggal_lahir->format('d/m/Y') : null,
            'jenis_kelamin' => $simabaStudent->jenis_kelamin,
            'program_studi' => $simabaStudent->nama_prodi,
            'jenis_mahasiswa' => $simabaStudent->jenis_mahasiswa,
            'nomorkip' => $simabaStudent->nomorkip,
            'no_hp' => $simabaStudent->no_hp,
            'email' => $simabaStudent->email,
            'alamat' => $simabaStudent->alamat,
        ],
        'early_nim_detection' => [
            'has_active_nim' => $hasOfficialNim,
            'nim_resmi' => $officialNim,
            'source' => 'SIAKAD_UBT_API',
        ]
    ]);
})->name('auth.login_maba');

// Verifikasi Kredensial PMB Mahasiswa Baru ke Database Staging SIAKAD (Legacy/Compatibility)
Route::post('/auth/check-pmb', function (\Illuminate\Http\Request $request) {
    $identifier = trim($request->input('nomor_registrasi', ''));
    $student = \App\Models\SiakadMahasiswaStg::lookup($identifier)->first();
    
    if (!$student) {
        return response()->json([
            'found' => false,
            'message' => 'Nomor Registrasi PMB tidak ditemukan di basis data staging SIAKAD.'
        ], 404);
    }

    return response()->json([
        'found' => true,
        'student' => $student
    ]);
})->name('auth.check_pmb');

// Route Mahasiswa Baru (Maba)
Route::prefix('maba')->group(function () {
    Route::get('/dashboard', [MabaDashboardController::class, 'index'])->name('maba.dashboard');
    Route::post('/profile', [MabaDashboardController::class, 'updateProfile'])->name('maba.profile.update');
    Route::post('/kyc', [KycVerificationController::class, 'store'])->name('maba.kyc.store');
    Route::get('/kyc/signed-url/{type}', [KycVerificationController::class, 'getSignedUrl'])->name('maba.kyc.signed_url');
    Route::post('/room/reserve', [MabaDashboardController::class, 'reserveRoom'])->name('maba.room.reserve');
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
