@echo off
setlocal enabledelayedexpansion
title "PORTAL SI-GABUNG 54 - INSTALASI OTOMATIS 1-KLIK LARAGON (MODE STABIL)"
color 0B

echo ===========================================================================
echo   PORTAL SI-GABUNG 54 (ASRAMA UNIVERSITAS BUNDA THAMRIN)
echo   INSTALASI DAN PERSIAPAN OTOMATIS 1-KLIK UNTUK LARAGON
echo   Mode Stabil: Tanpa Perlu Terminal npm run dev Terus Menyala
echo ===========================================================================
echo.

REM ---------------------------------------------------------------------------
REM [0] AUTO-DETECT PATH LARAGON (Agar bisa diklik 2x dari Windows Explorer)
REM ---------------------------------------------------------------------------
if exist "C:\laragon\bin" (
    for /d %%D in ("C:\laragon\bin\php\php*") do set "PATH=%%~fD;!PATH!"
    for /d %%D in ("C:\laragon\bin\mysql\mysql*") do set "PATH=%%~fD\bin;!PATH!"
    for /d %%D in ("C:\laragon\bin\nodejs\node*") do set "PATH=%%~fD;!PATH!"
    if exist "C:\laragon\bin\composer" set "PATH=C:\laragon\bin\composer;!PATH!"
)

REM ---------------------------------------------------------------------------
REM [1/7] PERSIAPAN FILE KONFIGURASI (.env)
REM ---------------------------------------------------------------------------
IF NOT EXIST ".env" (
    echo [1/7] Membuat file konfigurasi .env otomatis dari .env.example...
    copy .env.example .env >nul
    echo       + File .env berhasil dibuat!
) ELSE (
    echo [1/7] File .env sudah tersedia, melanjutkan ke tahap berikutnya.
)
echo.

REM ---------------------------------------------------------------------------
REM [2/7] MEMBUAT FOLDER PENYIMPANAN & HAPUS FILE PENGGANGGU (public\hot)
REM ---------------------------------------------------------------------------
echo [2/7] Menyiapkan folder penyimpanan (storage/e-KYC) dan membersihkan sisa dev...
IF NOT EXIST "bootstrap\cache" mkdir "bootstrap\cache"
IF NOT EXIST "storage\app\public" mkdir "storage\app\public"
IF NOT EXIST "storage\app\private_kyc" mkdir "storage\app\private_kyc"
IF NOT EXIST "storage\framework\cache\data" mkdir "storage\framework\cache\data"
IF NOT EXIST "storage\framework\sessions" mkdir "storage\framework\sessions"
IF NOT EXIST "storage\framework\views" mkdir "storage\framework\views"
IF NOT EXIST "storage\logs" mkdir "storage\logs"

IF EXIST "public\hot" (
    del /f /q "public\hot"
    echo       + File public\hot dihapus agar tidak terjadi layar putih / Blank Screen!
)
echo       + Folder penyimpanan siap!
echo.

REM ---------------------------------------------------------------------------
REM [3/7] INSTALASI PAKET BACKEND PHP (Composer)
REM ---------------------------------------------------------------------------
echo [3/7] Memeriksa dan memasang paket PHP (Composer)...
call composer install --no-interaction
echo.

REM ---------------------------------------------------------------------------
REM [4/7] GENERATE KUNCI KEAMANAN APLIKASI (APP_KEY)
REM ---------------------------------------------------------------------------
echo [4/7] Menyiapkan kunci enkripsi aplikasi Laravel...
call php artisan key:generate --force
echo.

REM ---------------------------------------------------------------------------
REM [5/7] PERSIAPAN DATABASE MYSQL LARAGON (asrama_ubt_db & u540633926_simaba)
REM ---------------------------------------------------------------------------
echo [5/7] Menyiapkan database MySQL Laragon (asrama_ubt_db dan u540633926_simaba)...
mysql -u root -e "CREATE DATABASE IF NOT EXISTS asrama_ubt_db; CREATE DATABASE IF NOT EXISTS u540633926_simaba; CREATE USER IF NOT EXISTS 'u540633926_simaba'@'localhost'; CREATE USER IF NOT EXISTS 'u540633926_simaba'@'127.0.0.1'; GRANT ALL PRIVILEGES ON u540633926_simaba.* TO 'u540633926_simaba'@'localhost'; GRANT ALL PRIVILEGES ON u540633926_simaba.* TO 'u540633926_simaba'@'127.0.0.1'; FLUSH PRIVILEGES;" 2>nul

echo.
echo   PILIH DATA AWAL DATABASE YANG INGIN DIMASUKKAN:
echo   -------------------------------------------------------------------------
echo   [1] Mode Produksi Riil (Disarankan - Tekan Enter langsung)
echo       Mengisi 64 Kamar Fisik Roemah 54, Tarif Resmi SK Rektor, dan Akun Staf
echo   [2] Mode Simulasi Pengujian (Menyertakan akun sampel mahasiswa untuk tes)
echo   -------------------------------------------------------------------------
set "seederchoice=1"
set /p seederchoice="  Ketik angka 1 atau 2 lalu tekan Enter [Default: 1]: "

echo.
echo       + Membuat tabel-tabel database (php artisan migrate)...
call php artisan migrate --force
if %ERRORLEVEL% NEQ 0 (
    echo       [PERHATIAN] Pastikan tombol "Start All" di aplikasi Laragon sudah dinyalakan!
) else (
    echo       + Struktur tabel database berhasil dibuat!
)
echo.

if "%seederchoice%"=="2" goto SEED_SIMULASI

:SEED_PRODUKSI
echo       + Mengisi data awal Mode Produksi Riil (64 Kamar Roemah 54 dan Tarif SK)...
call php artisan db:seed --class=ProductionSeeder --force
goto SEED_SELESAI

:SEED_SIMULASI
echo       + Mengisi data awal Mode Simulasi Pengujian...
call php artisan db:seed --force
goto SEED_SELESAI

:SEED_SELESAI
echo       + Database MySQL telah siap digunakan!
echo.

REM ---------------------------------------------------------------------------
REM [6/7] KOMPILASI TAMPILAN PERMANEN (Agar tidak perlu npm run dev menyala)
REM ---------------------------------------------------------------------------
echo [6/7] Memasang paket tampilan dan mengompilasi halaman web Mode Stabil...
call npm install --legacy-peer-deps
if exist "node_modules\esbuild\install.js" (
    call node node_modules\esbuild\install.js >nul 2>nul
)
echo       + Menyusun bundel tampilan permanen (npm run build)...
call npm run build
if exist "public\build\manifest.json" (
    echo       + Tampilan berhasil dikompilasi ke public\build\manifest.json!
) else (
    echo       [PERHATIAN] Kompilasi tampilan belum selesai sempurna. Periksa pesan di atas.
)
echo.

REM ---------------------------------------------------------------------------
REM [7/7] PEMBERSIHAN CACHE LARAVEL
REM ---------------------------------------------------------------------------
echo [7/7] Menyegarkan sistem dan membersihkan cache lama...
IF EXIST "public\hot" del /f /q "public\hot"
call php artisan optimize:clear
echo.

echo ===========================================================================
echo   INSTALASI SELESAI! APLIKASI SIAP DIGUNAKAN DALAM MODE STABIL
echo ===========================================================================
echo.
echo   KEUNGGULAN MODE STABIL INI:
echo   1. Anda TIDAK PERLU menyalakan terminal "npm run dev" lagi.
echo   2. Selama Laragon dalam posisi "Start All", aplikasi selalu aktif 24 jam.
echo   3. Untuk membuka menu bantuan harian, cukup klik 2x file:
echo      --^> laragon-test-crud.bat
echo.
set "opennow=Y"
set /p opennow="Apakah Anda ingin langsung membuka aplikasi di Browser sekarang? [Y/N, Default: Y]: "
if /i "%opennow%"=="N" goto SELESAI

echo.
echo   Membuka aplikasi di Browser dan menyalakan server lokal port 8000...
start "" "http://127.0.0.1:8000/login"
call php artisan serve --port=8000

:SELESAI
pause
