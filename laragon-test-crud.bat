@echo off
setlocal enabledelayedexpansion
title "PORTAL SI-GABUNG 54 - PUSAT KENDALI HARIAN & UJI DATABASE (LARAGON)"
color 0A

REM ---------------------------------------------------------------------------
REM AUTO-DETECT PATH LARAGON (Agar bisa langsung diklik 2x dari Windows Explorer)
REM ---------------------------------------------------------------------------
if exist "C:\laragon\bin" (
    for /d %%D in ("C:\laragon\bin\php\php*") do set "PATH=%%~fD;!PATH!"
    for /d %%D in ("C:\laragon\bin\mysql\mysql*") do set "PATH=%%~fD\bin;!PATH!"
    for /d %%D in ("C:\laragon\bin\nodejs\node*") do set "PATH=%%~fD;!PATH!"
    if exist "C:\laragon\bin\composer" set "PATH=C:\laragon\bin\composer;!PATH!"
)

:MENU
cls
echo ===============================================================================
echo   PORTAL SI-GABUNG 54 (ASRAMA UNIVERSITAS BUNDA THAMRIN)
echo   PUSAT KENDALI HARIAN DAN PENGUJIAN DATABASE (KHUSUS LARAGON)
echo ===============================================================================
echo.
echo   [STATUS KESIAPAN SISTEM DI KOMPUTER ANDA]:
where php >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo     - Mesin PHP Laravel      : SIAP DIGUNAKAN
) else (
    echo     - Mesin PHP Laravel      : BELUM TERDETEKSI [Pastikan C:\laragon terpasang]
)

where mysql >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo     - Database MySQL Laragon : SIAP DIGUNAKAN
) else (
    echo     - Database MySQL Laragon : Periksa apakah tombol "Start All" Laragon aktif
)

if exist "public\build\manifest.json" (
    echo     - Tampilan Mode Stabil   : SIAP [Bebas Layar Putih / Tanpa npm run dev]
) else (
    echo     - Tampilan Mode Stabil   : BELUM DI-BUILD [Pilih Menu 2 untuk menyusun]
)
echo.
echo ===============================================================================
echo   PILIH MENU TINDAKAN (CUKUP KETIK ANGKA LALU TEKAN ENTER):
echo ===============================================================================
echo.
echo   [1] BUKA APLIKASI MODE STABIL (Disarankan untuk Penggunaan Harian)
echo       * Otomatis mencegah layar putih (menghapus file pengganggu public\hot).
echo       * Langsung membuka aplikasi di Browser tanpa perlu terminal npm run dev!
echo.
echo   [2] PERBARUI TAMPILAN PERMANEN (Pilih ini jika baru saja mengubah kode)
echo       * Menyusun ulang tampilan (npm run build) dan membersihkan cache Laravel.
echo.
echo   [3] RESET DAN ISI ULANG DATABASE AWAL (64 Kamar Fisik Riil dan Tarif Resmi)
echo       * Mengembalikan database ke kondisi bersih siap pakai (ProductionSeeder).
echo.
echo   [4] TES OTOMATIS 4 TAHAP PENDAFTARAN KE MYSQL (Data Tersimpan di phpMyAdmin)
echo       * Menguji otomatis alur Biodata e-KYC, Kunci Kamar, Tagihan, hingga Kontrak.
echo.
echo   [5] TES OTOMATIS 4 TAHAP PENDAFTARAN + BERSIHKAN KEMBALI (--cleanup)
echo       * Menguji apakah database sehat, lalu menghapus kembali data tesnya.
echo.
echo   [6] TARIK DATA MAHASISWA DARI SERVER KAMPUS (Sinkronisasi API SIDARA/SIMABA)
echo       * Mengimpor data calon mahasiswa terbaru ke tabel siakad_mahasiswa_stg.
echo.
echo   [7] MODE DEVELOPER LIVE-EDIT (Menyalakan 2 Terminal: Laravel + npm run dev)
echo       * Hanya digunakan oleh programmer saat sedang mengedit desain secara live.
echo.
echo   [0] KELUAR
echo.
echo ===============================================================================
set "opt=1"
set /p opt="Ketik nomor menu pilihan Anda [1-7, atau 0, Default: 1]: "

if "%opt%"=="1" goto RUN_STABLE_MODE
if "%opt%"=="2" goto RUN_BUILD_ASSETS
if "%opt%"=="3" goto RUN_FRESH_PRODUCTION
if "%opt%"=="4" goto RUN_CRUD_LIVE
if "%opt%"=="5" goto RUN_CRUD_CLEANUP
if "%opt%"=="6" goto RUN_IMPORT_SIDARA
if "%opt%"=="7" goto RUN_DEV_SERVERS
if "%opt%"=="0" goto EXIT_SCRIPT

echo.
echo Pilihan tidak dikenali. Silakan tekan sembarang tombol untuk memilih ulang...
pause >nul
goto MENU

REM ===========================================================================
REM MENU [1]: BUKA APLIKASI MODE STABIL (TANPA TERMINAL NPM RUN DEV)
REM ===========================================================================
:RUN_STABLE_MODE
cls
echo ===============================================================================
echo   MENJALANKAN APLIKASI DALAM MODE STABIL (BEBAS TERMINAL NPM RUN DEV)...
echo ===============================================================================
echo.
if exist "public\hot" (
    echo   [1/3] Menghapus file pengganggu public\hot agar tidak terjadi layar putih...
    del /f /q "public\hot"
) else (
    echo   [1/3] Memastikan tidak ada file pengganggu public\hot... Aman!
)

if not exist "public\build\manifest.json" (
    echo   [2/3] Tampilan Mode Stabil belum tersusun, menyusun otomatis sekarang...
    if exist "node_modules\esbuild\install.js" (
        call node node_modules\esbuild\install.js >nul 2>nul
    )
    call npm run build
) else (
    echo   [2/3] Tampilan Mode Stabil sudah siap di public\build\manifest.json!
)

echo   [3/3] Menyegarkan cache Laravel dan membuka Browser...
call php artisan optimize:clear >nul 2>nul

echo.
echo ===============================================================================
echo   APLIKASI SEDANG DIBUKA DI BROWSER ANDA!
echo   - Alamat Lokal Stabil : http://127.0.0.1:8000/login
echo   - Alamat Domain Laragon: http://asrama-ubt.test/login (jika Apache aktif)
echo.
echo   CATATAN PENTING:
echo   Biarkan jendela ini terbuka selama Anda menggunakan alamat 127.0.0.1:8000,
echo   atau tekan Ctrl+C kapan saja untuk kembali ke menu.
echo ===============================================================================
echo.
start "" "http://127.0.0.1:8000/login"
call php artisan serve --port=8000
goto MENU

REM ===========================================================================
REM MENU [2]: PERBARUI TAMPILAN PERMANEN (NPM RUN BUILD)
REM ===========================================================================
:RUN_BUILD_ASSETS
cls
echo ===============================================================================
echo   MENYUSUN ULANG TAMPILAN PERMANEN (NPM RUN BUILD)...
echo ===============================================================================
echo.
if exist "public\hot" del /f /q "public\hot"
if exist "node_modules\esbuild\install.js" (
    echo   + Memastikan modul esbuild Windows siap...
    call node node_modules\esbuild\install.js >nul 2>nul
)
echo   + Menjalankan kompilasi tampilan (npm run build)...
call npm run build
echo.
echo   + Membersihkan cache tampilan Laravel (optimize:clear)...
call php artisan optimize:clear
echo.
echo ===============================================================================
echo   SELESAI! Perubahan tampilan sudah tersimpan permanen.
echo   Silakan pilih Menu [1] untuk langsung membuka aplikasi di Browser.
echo ===============================================================================
echo.
pause
goto MENU

REM ===========================================================================
REM MENU [3]: RESET & ISI ULANG DATABASE AWAL (64 KAMAR RIIL)
REM ===========================================================================
:RUN_FRESH_PRODUCTION
cls
echo ===============================================================================
echo   MERESET DATABASE DAN MENGISI 64 KAMAR FISIK ROEMAH 54 + TARIF RESMI...
echo ===============================================================================
echo.
echo   [1] Mode Produksi Riil (64 Kamar Fisik, Tarif SK Rektor, Tanpa Akun Dummy)
echo   [2] Mode Simulasi Pengujian (Disertai sampel akun mahasiswa untuk latihan)
echo.
set "seedopt=1"
set /p seedopt="Pilih mode pengisian data [1 atau 2, Default: 1]: "
echo.
if "%seedopt%"=="2" (
    call php artisan migrate:fresh --seed --force
) else (
    call php artisan migrate:fresh --force
    call php artisan db:seed --class=ProductionSeeder --force
)
echo.
echo ===============================================================================
echo   DATABASE BERHASIL DIRESET DAN DIISI ULANG!
echo ===============================================================================
echo.
pause
goto MENU

REM ===========================================================================
REM MENU [4]: TES OTOMATIS 4 TAHAP PENDAFTARAN KE MYSQL
REM ===========================================================================
:RUN_CRUD_LIVE
cls
echo ===============================================================================
echo   MENJALANKAN TES OTOMATIS 4 TAHAP PENDAFTARAN KE MYSQL LARAGON...
echo ===============================================================================
echo.
call php artisan asrama:test-live-crud
echo.
echo ===============================================================================
echo   Pengujian selesai! Data hasil uji tersimpan di database MySQL.
echo   Anda dapat melihatnya di phpMyAdmin: http://localhost/phpmyadmin
echo ===============================================================================
echo.
pause
goto MENU

REM ===========================================================================
REM MENU [5]: TES OTOMATIS 4 TAHAP + PEMBERSIHAN OTOMATIS (--cleanup)
REM ===========================================================================
:RUN_CRUD_CLEANUP
cls
echo ===============================================================================
echo   MENJALANKAN TES OTOMATIS 4 TAHAP DENGAN PEMBERSIHAN DATA (--cleanup)...
echo ===============================================================================
echo.
call php artisan asrama:test-live-crud --cleanup
echo.
echo ===============================================================================
echo   Pengujian selesai dan seluruh data tes telah dibersihkan kembali!
echo ===============================================================================
echo.
pause
goto MENU

REM ===========================================================================
REM MENU [6]: TARIK DATA MAHASISWA DARI API SIDARA
REM ===========================================================================
:RUN_IMPORT_SIDARA
cls
echo ===============================================================================
echo   MENARIK DATA CALON MAHASISWA DARI API SIDARA KE TABEL STAGING MYSQL...
echo ===============================================================================
echo.
call php artisan sidara:import-api
echo.
echo ===============================================================================
echo   Sinkronisasi data API SIDARA selesai! Data tersimpan di siakad_mahasiswa_stg.
echo ===============================================================================
echo.
pause
goto MENU

REM ===========================================================================
REM MENU [7]: MODE DEVELOPER LIVE-EDIT (2 SERVER)
REM ===========================================================================
:RUN_DEV_SERVERS
cls
echo ===============================================================================
echo   MENJALANKAN MODE DEVELOPER (LARAVEL PORT 8000 + VITE DEV SERVER)...
echo ===============================================================================
echo.
if exist "node_modules\esbuild\install.js" (
    call node node_modules\esbuild\install.js >nul 2>nul
)
echo   Menjalankan kedua server di jendela terpisah...
start "Laravel API Server (Port 8000)" cmd /k "php artisan serve --port=8000"
start "Vite Dev Server" cmd /k "npm run dev"
echo.
echo   Kedua server telah berjalan!
echo   PENTING: Jika selesai menggunakan mode ini dan ingin kembali ke Mode Stabil,
echo   jalankan Menu [1] agar file public\hot dibersihkan secara otomatis.
echo.
pause
goto MENU

:EXIT_SCRIPT
cls
echo Terima kasih telah menggunakan Pusat Kendali Portal SI-GABUNG 54 Asrama UBT.
exit /b 0
