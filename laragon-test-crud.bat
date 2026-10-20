@echo off
setlocal enabledelayedexpansion
title PORTAL SI-GABUNG 54 - LIVE CRUD & 4-STAGE REGISTRATION TEST RUNNER (LARAGON)
color 0A

:MENU
cls
echo ===============================================================================
echo   PORTAL SI-GABUNG 54 (ASRAMA UNIVERSITAS BUNDA THAMRIN)
echo   LIVE CRUD DATABASE TEST ENGINE (LARAGON MYSQL + LARAVEL ELOQUENT)
echo ===============================================================================
echo.
echo   Habitat: Laragon 6.x / PHP 8.2+ / MySQL 8.0+ / Dual Database (asrama_ubt_db)
echo.
echo   [STATUS PEMERIKSAAN KONEKSI LOKAL]:
where php >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo     [PHP]     : Terdeteksi siap di PATH system
) else (
    echo     [PHP]     : PERINGATAN! Jalankan skrip ini dari Terminal Laragon
)

where mysql >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo     [MYSQL]   : Terdeteksi siap di PATH system
) else (
    echo     [MYSQL]   : Periksa status Laragon MySQL (Port 3306)
)
echo.
echo ===============================================================================
echo   PILIH MENU PENGUJIAN LIVE CRUD KE BASIS DATA PRODUKSI / LARAGON:
echo ===============================================================================
echo.
echo   [1] Jalankan Uji Live CRUD Nyata 4 Tahap Pendaftaran & Tabel Master
echo       * Menguji alur hybrid draft & staged CRUD end-to-end:
echo         - Tahap 1: Biodata Hybrid Auto-Save & e-KYC Private Storage Berversi (v1)
echo         - Tahap 2: Reservasi Kunci Kamar Permanen di Database Staging (BOOKED_STAGING)
echo         - Tahap 3: Tagihan Staging, Struk Bank & Pengesahan Admin ke Master Pembayaran
echo         - Tahap 4: Pengesahan Kontrak Digital & Dual-Factor OTP WhatsApp
echo         - Validasi: Eager Loading Eloquent & Query Builder Join 4 Tabel Master
echo.
echo   [2] Jalankan Uji Live CRUD 4 Tahap + Pembersihan Data Otomatis (--cleanup)
echo       * Menguji CRUD penuh 4 tahap lalu membersihkan record pengujian kembali bersih.
echo.
echo   [3] Eksekusi Migrasi & Database Seeder Bersih (Fresh Seed)
echo       * Reset database asrama_ubt_db dan isi master tarif & kamar awal.
echo.
echo   [4] Jalankan Server Lengkap (Backend Laravel 8000 + Frontend Vite)
echo       * Membuka http://127.0.0.1:8000/login untuk pengujian peramban langsung.
echo.
echo   [5] Buka Konsol Interaktif Laravel Tinker
echo       * Eksekusi query model Eloquent secara langsung baris per baris.
echo.
echo   [6] Tampilkan Panduan Database Interaction Flow di Layar
echo.
echo   [7] Impor & Sinkronisasi Lengkap API SIDARA ke Tabel Staging (siakad_mahasiswa_stg)
echo       * Menarik data lengkap dari endpoint API SIDARA (BTT-006 & BTT-002) / fallback.
echo       * Menyimpan 100% field ke tabel SQL siakad_mahasiswa_stg & kolom payload_raw JSON.
echo.
echo   [0] Keluar
echo.
echo ===============================================================================
set /p opt="Masukkan pilihan Anda [1-7, atau 0]: "

if "%opt%"=="1" goto RUN_CRUD_LIVE
if "%opt%"=="2" goto RUN_CRUD_CLEANUP
if "%opt%"=="3" goto RUN_MIGRATE_SEED
if "%opt%"=="4" goto RUN_SERVERS
if "%opt%"=="5" goto RUN_TINKER
if "%opt%"=="6" goto SHOW_DOCS
if "%opt%"=="7" goto RUN_IMPORT_SIDARA
if "%opt%"=="0" goto EXIT_SCRIPT

echo.
echo Pilihan tidak valid, silakan tekan sembarang tombol untuk memilih ulang...
pause >nul
goto MENU

:RUN_CRUD_LIVE
cls
echo ===============================================================================
echo   MENJALANKAN PENGUJIAN LIVE CRUD 4 TAHAP PENDAFTARAN (MYSQL LARAGON)...
echo ===============================================================================
echo.
call php artisan asrama:test-live-crud
echo.
echo ===============================================================================
echo   Pengujian selesai! Data pengujian tersimpan di database MySQL.
echo   Anda dapat memverifikasinya di phpMyAdmin: http://localhost/phpmyadmin
echo ===============================================================================
echo.
pause
goto MENU

:RUN_CRUD_CLEANUP
cls
echo ===============================================================================
echo   MENJALANKAN PENGUJIAN LIVE CRUD DENGAN PEMBERSIHAN OTOMATIS (--cleanup)...
echo ===============================================================================
echo.
call php artisan asrama:test-live-crud --cleanup
echo.
echo ===============================================================================
echo   Pengujian selesai dan seluruh data uji telah dibersihkan kembali!
echo ===============================================================================
echo.
pause
goto MENU

:RUN_MIGRATE_SEED
cls
echo ===============================================================================
echo   MENJALANKAN FRESH MIGRATION & SEEDER MASTER DATA...
echo ===============================================================================
echo.
call php artisan migrate:fresh --seed
echo.
pause
goto MENU

:RUN_SERVERS
cls
echo ===============================================================================
echo   MENJALANKAN SERVER APLIKASI (LARAVEL + INERTIA)...
echo ===============================================================================
echo.
echo   Buka browser Anda di: http://127.0.0.1:8000/login
echo.
echo   Menjalankan Laravel API Server di jendela terpisah...
start "Laravel API Server (Port 8000)" cmd /k "php artisan serve --port=8000"
echo.
echo   Menjalankan Vite Asset Compiler di jendela terpisah...
start "Vite Dev Server" cmd /k "npm run dev"
echo.
echo   Kedua server telah dijalankan! Silakan buka peramban Anda.
pause
goto MENU

:RUN_TINKER
cls
echo ===============================================================================
echo   MEMBUKA LARAVEL TINKER INTERACTIVE SHELL...
echo   Ketik: App\Models\Pembayaran::count(); untuk melihat jumlah invoice
echo   Ketik: App\Models\SiakadMahasiswaStg::count(); untuk melihat jumlah staging SIDARA
echo   Ketik: exit untuk kembali ke menu.
echo ===============================================================================
echo.
call php artisan tinker
goto MENU

:SHOW_DOCS
cls
echo ===============================================================================
echo   DOKUMENTASI: DATABASE INTERACTION FLOW (docs/DATABASE_INTERACTION_FLOW.md)
echo ===============================================================================
echo.
if exist "docs\DATABASE_INTERACTION_FLOW.md" (
    type docs\DATABASE_INTERACTION_FLOW.md | more
) else (
    echo Berkas docs\DATABASE_INTERACTION_FLOW.md tidak ditemukan.
)
echo.
pause
goto MENU

:RUN_IMPORT_SIDARA
cls
echo ===============================================================================
echo   MENGIMPOR LENGKAP KONTEN API SIDARA KE TABEL SQL STAGING (MYSQL LARAGON)...
echo ===============================================================================
echo.
call php artisan sidara:import-api
echo.
echo ===============================================================================
echo   Impor data API SIDARA selesai! Data tersimpan di tabel siakad_mahasiswa_stg.
echo   Anda dapat memverifikasinya di phpMyAdmin: http://localhost/phpmyadmin
echo ===============================================================================
echo.
pause
goto MENU

:EXIT_SCRIPT
cls
echo Terima kasih telah menggunakan Portal SI-GABUNG 54 Test Runner.
exit /b 0
