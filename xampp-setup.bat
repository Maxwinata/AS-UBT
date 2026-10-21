@echo off
echo =====================================================================
echo  PORTAL SI-GABUNG 54 (ASRAMA UBT) - AUTOMATED XAMPP SETUP SCRIPT
echo  Stack: Laravel 11 + Inertia.js + React 19 + Tailwind CSS + MySQL
echo =====================================================================
echo.

:: 1. Cek Ketersediaan PHP
where php >nul 2>nul
IF %ERRORLEVEL% NEQ 0 (
    echo [ERROR] PHP tidak terdeteksi di PATH sistem!
    echo Silakan jalankan script ini melalui "XAMPP Shell" (klik tombol Shell di XAMPP Control Panel)
    echo atau tambahkan C:\xampp\php ke Environment Variables Windows Anda.
    echo.
    pause
    exit /b 1
)

:: 2. Cek Ketersediaan Composer
where composer >nul 2>nul
IF %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Composer tidak ditemukan!
    echo Di XAMPP, Composer harus diinstal secara terpisah.
    echo Silakan unduh dan instal Composer dari: https://getcomposer.org/Composer-Setup.exe
    echo.
    pause
    exit /b 1
)

:: 3. Cek Ketersediaan Node.js / NPM
where npm >nul 2>nul
IF %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js / NPM tidak ditemukan!
    echo XAMPP tidak menyertakan Node.js secara bawaan.
    echo Silakan unduh dan pasang Node.js LTS dari: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

:: 4. Cek dan Gandakan File .env
IF NOT EXIST ".env" (
    echo [1/6] Menduplikat file konfigurasi .env dari .env.example...
    copy .env.example .env
) ELSE (
    echo [1/6] File .env sudah ada, melewati langkah ini.
)

:: 5. Pastikan Folder bootstrap/cache dan storage Tersedia
echo.
echo [2/6] Memeriksa dan membuat direktori penting Laravel (bootstrap/cache & storage)...
IF NOT EXIST "bootstrap\cache" mkdir "bootstrap\cache"
IF NOT EXIST "storage\app\public" mkdir "storage\app\public"
IF NOT EXIST "storage\app\private_kyc" mkdir "storage\app\private_kyc"
IF NOT EXIST "storage\framework\cache\data" mkdir "storage\framework\cache\data"
IF NOT EXIST "storage\framework\sessions" mkdir "storage\framework\sessions"
IF NOT EXIST "storage\framework\views" mkdir "storage\framework\views"
IF NOT EXIST "storage\logs" mkdir "storage\logs"
echo       + Direktori bootstrap\cache dan storage siap!

:: 6. Install Composer Dependencies
echo.
echo [3/6] Menginstal dependensi PHP via Composer...
call composer install

:: 7. Generate APP_KEY
echo.
echo [4/6] Men-generate Application Key Laravel...
call php artisan key:generate

echo       PILIHAN SEEDER BASIS DATA:
echo       [1] Mode Produksi Riil (Default / Disarankan) - 100%% Bebas Akun Dummy Mahasiswa
echo           (Mengisi Master Tarif SK Rektor, 64 Kamar Fisik Riil Roemah 54, & Akun Staf Resmi)
echo       [2] Mode Simulasi Pengujian - Menyertakan 1 akun sampel mahasiswa untuk QA
echo.
set /p seederchoice="Pilih mode seeder [1 atau 2, default: 1]: "
if "%seederchoice%"=="2" (
    echo       + Menjalankan migrasi dengan DatabaseSeeder (Mode Simulasi)...
    call php artisan migrate --seed
) else (
    echo       + Menjalankan migrasi dengan ProductionSeeder (Mode Produksi Riil Tanpa Dummy)...
    call php artisan migrate --seed --seeder=ProductionSeeder
)

:: 9. Install NPM Dependencies
echo.
echo [6/6] Menginstal dependensi Node.js / NPM...
call npm install

echo.
echo =====================================================================
echo  SETUP XAMPP SELESAI DENGAN SUKSES!
echo.
echo  Cara Menjalankan:
echo  1. Terminal 1 (Frontend Vite):  npm run dev
echo  2. Terminal 2 (Backend Laravel): php artisan serve
echo.
echo  Buka browser Anda di: http://127.0.0.1:8000
echo =====================================================================
echo.
pause
