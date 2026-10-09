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
    echo [1/5] Menduplikat file konfigurasi .env dari .env.example...
    copy .env.example .env
) ELSE (
    echo [1/5] File .env sudah ada, melewati langkah ini.
)

:: 5. Install Composer Dependencies
echo.
echo [2/5] Menginstal dependensi PHP via Composer...
call composer install

:: 6. Generate APP_KEY
echo.
echo [3/5] Men-generate Application Key Laravel...
call php artisan key:generate

:: 7. Migrasi Database
echo.
echo [4/5] Menjalankan migrasi basis data dan seeder...
echo Pastikan servis MySQL di XAMPP Control Panel sudah AKTIF (Start)
echo dan database "asrama_ubt_db" sudah dibuat di phpMyAdmin (http://localhost/phpmyadmin).
call php artisan migrate --seed

:: 8. Install NPM Dependencies
echo.
echo [5/5] Menginstal dependensi Node.js / NPM...
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
