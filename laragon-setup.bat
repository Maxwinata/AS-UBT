@echo off
echo =====================================================================
echo  PORTAL SI-GABUNG 54 (ASRAMA UBT) - AUTOMATED LARAGON SETUP SCRIPT
echo  Stack: Laravel 11 + Inertia.js + React 19 + Tailwind CSS + MySQL
echo =====================================================================
echo.

IF NOT EXIST ".env" (
    echo [1/7] Menduplikat file konfigurasi .env dari .env.example...
    copy .env.example .env
) ELSE (
    echo [1/7] File .env sudah ada, melewati langkah ini.
)

echo [2/7] Memeriksa dan membuat direktori penting Laravel (bootstrap/cache & storage)...
IF NOT EXIST "bootstrap\cache" mkdir "bootstrap\cache"
IF NOT EXIST "storage\app\public" mkdir "storage\app\public"
IF NOT EXIST "storage\app\private_kyc" mkdir "storage\app\private_kyc"
IF NOT EXIST "storage\framework\cache\data" mkdir "storage\framework\cache\data"
IF NOT EXIST "storage\framework\sessions" mkdir "storage\framework\sessions"
IF NOT EXIST "storage\framework\views" mkdir "storage\framework\views"
IF NOT EXIST "storage\logs" mkdir "storage\logs"
echo       + Direktori bootstrap\cache dan storage siap!

echo [3/7] Menginstal dependensi PHP via Composer...
call composer install

echo [4/7] Men-generate Application Key Laravel...
call php artisan key:generate

echo [5/7] Menjalankan migrasi basis data dan seeder master tarif...
call php artisan migrate --seed

echo [6/7] Menginstal dependensi Node.js / NPM...
call npm install

echo.
echo =====================================================================
echo  SETUP SELESAI DENGAN SUKSES!
echo  Untuk menjalankan dev server frontend, jalankan: npm run dev
echo  Buka browser Anda di: http://asrama-ubt.test atau php artisan serve
echo =====================================================================
echo.
pause
