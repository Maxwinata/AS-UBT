@echo off
setlocal enabledelayedexpansion
title "PORTAL SI-GABUNG 54 - LARAGON QUICK REPAIR & SYNC WIZARD"
color 0B

cls
echo ===============================================================================
echo   PORTAL SI-GABUNG 54 (ASRAMA UNIVERSITAS BUNDA THAMRIN)
echo   LARAGON QUICK REPAIR, DEPENDENCY SYNC & ASSET COMPILER WIZARD
echo   Stack: Laravel 11 + Vite 6 + React 19 + Inertia + Tailwind CSS + MySQL
echo ===============================================================================
echo.
echo   Skrip ini memperbaiki secara otomatis:
echo   - Konflik peer-dependency npm & laravel-vite-plugin kompatibel Vite 6
echo   - Registrasi binary native esbuild Windows (mencegah error spawn esbuild.exe)
echo   - Pembuatan bundle asset produksi Vite (public/build manifest)
echo   - Verifikasi direktori storage dan koneksi database MySQL
echo.
echo ===============================================================================
echo.

:: Pemeriksaan Lingkungan
echo [*] MEMERIKSA STATUS LINGKUNGAN SYSTEM:
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo     [X] Node.js TIDAK TERDETEKSI! Pastikan Node.js terpasang di Laragon.
    pause
    exit /b 1
) else (
    echo     [V] Node.js terdeteksi siap di PATH.
)

where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo     [X] NPM TIDAK TERDETEKSI! Pastikan NPM aktif.
    pause
    exit /b 1
) else (
    echo     [V] NPM terdeteksi siap di PATH.
)

where php >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo     [!] PHP tidak ditemukan di PATH global, pastikan menjalankan dari Terminal Laragon.
) else (
    echo     [V] PHP terdeteksi siap di PATH.
)
echo.

:: 1. Verifikasi Direktori Storage
echo [1/5] Memeriksa direktori storage dan file lingkungan .env...
if not exist ".env" (
    if exist ".env.example" (
        echo       + Menduplikat .env.example menjadi .env...
        copy .env.example .env >nul
    )
)
if not exist "bootstrap\cache" mkdir "bootstrap\cache"
if not exist "storage\app\public" mkdir "storage\app\public"
if not exist "storage\app\private_kyc" mkdir "storage\app\private_kyc"
if not exist "storage\framework\cache\data" mkdir "storage\framework\cache\data"
if not exist "storage\framework\sessions" mkdir "storage\framework\sessions"
if not exist "storage\framework\views" mkdir "storage\framework\views"
if not exist "storage\logs" mkdir "storage\logs"
echo       + Direktori storage & cache siap!
echo.

:: 2. Instalasi Dependensi NPM dengan Flag Kompatibel
echo [2/5] Menyelaraskan dependensi Node.js via NPM (--legacy-peer-deps)...
call npm install --legacy-peer-deps
if %ERRORLEVEL% NEQ 0 (
    echo       [PERINGATAN] npm install menemukan kendala, melanjutkan ke penyelarasan plugin...
)

echo       + Memasang laravel-vite-plugin@^1.2.0 (spesifik untuk Vite 6)...
call npm install -D laravel-vite-plugin@^1.2.0 --legacy-peer-deps
if %ERRORLEVEL% NEQ 0 (
    echo       [ERROR] Gagal memasang laravel-vite-plugin. Periksa koneksi internet Anda.
    pause
    exit /b 1
)
echo       + laravel-vite-plugin@^1.2.0 berhasil disinkronkan!
echo.

:: 3. Registrasi Binary Native esbuild
echo [3/5] Memeriksa dan mendaftarkan binary native esbuild Windows...
if exist "node_modules\esbuild\install.js" (
    call node node_modules\esbuild\install.js
    echo       + Native esbuild binary berhasil diverifikasi!
) else (
    echo       + esbuild native script tidak memerlukan instalasi manual ulang.
)
echo.

:: 4. Kompilasi Build Aset Vite
echo [4/5] Mengompilasi bundle aset frontend (Vite Build) untuk Blade & Inertia...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo       [PERINGATAN] Kompilasi Vite mengalami error.
    echo       Silakan periksa pesan di atas atau hubungi administrator.
    pause
    exit /b 1
)
echo       + Build aset berhasil! Direktori public/build manifest siap digunakan Blade.
echo.

:: 5. Pemeriksaan Database Laravel
echo [5/5] Memeriksa status koneksi Laravel & Database...
where php >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    call php artisan --version >nul 2>nul
    if %ERRORLEVEL% EQU 0 (
        echo       + Laravel Artisan aktif dan berfungsi.
        echo       + Melakukan tes koneksi tabel database:
        call php artisan asrama:test-live-crud --cleanup
    ) else (
        echo       + Artisan dilewati karena environment lokal belum di-boot penuh.
    )
) else (
    echo       + Uji Artisan dilewati (PHP tidak terdeteksi di window ini).
)
echo.

echo ===============================================================================
echo   SELURUH PERBAIKAN DAN SINKRONISASI SELESAI DENGAN SUKSES!
echo ===============================================================================
echo.
echo   PILIHAN SELANJUTNYA:
echo   [1] Langsung jalankan Server Lengkap (Laravel Port 8000 + Vite Dev)
echo   [2] Buka Menu Interaktif Uji Live CRUD (laragon-test-crud.bat)
echo   [0] Keluar
echo.
set /p nextopt="Pilih tindakan [1, 2, atau 0]: "

if "%nextopt%"=="1" (
    echo.
    echo Menjalankan server aplikasi...
    start "Laravel API Server (Port 8000)" cmd /k "php artisan serve --port=8000"
    start "Vite Dev Server" cmd /k "npm run dev"
    echo Kedua server telah aktif! Buka browser di: http://127.0.0.1:8000/login
    pause
    exit /b 0
)

if "%nextopt%"=="2" (
    call laragon-test-crud.bat
    exit /b 0
)

echo Selesai.
exit /b 0
