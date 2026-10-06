@echo off
echo =====================================================================
echo  PORTAL SI-GABUNG 54 (ASRAMA UBT) - AUTOMATED LARAGON SETUP SCRIPT
echo  Stack: Laravel 11 + Inertia.js + React 19 + Tailwind CSS + MySQL
echo =====================================================================
echo.

IF NOT EXIST ".env" (
    echo [1/6] Menduplikat file konfigurasi .env dari .env.example...
    copy .env.example .env
) ELSE (
    echo [1/6] File .env sudah ada, melewati langkah ini.
)

echo [2/6] Menginstal dependensi PHP via Composer...
call composer install

echo [3/6] Men-generate Application Key Laravel...
call php artisan key:generate

echo [4/6] Menjalankan migrasi basis data dan seeder master tarif...
call php artisan migrate --seed

echo [5/6] Menginstal dependensi Node.js / NPM...
call npm install

echo.
echo =====================================================================
echo  SETUP SELESAI DENGAN SUKSES!
echo  Untuk menjalankan dev server frontend, jalankan: npm run dev
echo  Buka browser Anda di: http://asrama-ubt.test atau php artisan serve
echo =====================================================================
echo.
pause
