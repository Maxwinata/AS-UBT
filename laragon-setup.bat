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

echo [2/7] Memeriksa dan membuat direktori penting Laravel (bootstrap/cache dan storage)...
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

echo [5/7] Memastikan database asrama_ubt_db dan u540633926_simaba siap di MySQL Laragon...
mysql -u root -e "CREATE DATABASE IF NOT EXISTS asrama_ubt_db; CREATE DATABASE IF NOT EXISTS u540633926_simaba; CREATE USER IF NOT EXISTS 'u540633926_simaba'@'localhost'; CREATE USER IF NOT EXISTS 'u540633926_simaba'@'127.0.0.1'; GRANT ALL PRIVILEGES ON u540633926_simaba.* TO 'u540633926_simaba'@'localhost'; GRANT ALL PRIVILEGES ON u540633926_simaba.* TO 'u540633926_simaba'@'127.0.0.1'; FLUSH PRIVILEGES;" 2>nul
echo.
echo       PILIHAN SEEDER BASIS DATA:
echo       [1] Mode Produksi Riil (Default / Disarankan) - 100%% Bebas Akun Dummy Mahasiswa
echo           (Mengisi Master Tarif SK Rektor, 64 Kamar Fisik Riil Roemah 54, dan Akun Staf Resmi)
echo       [2] Mode Simulasi Pengujian - Menyertakan 1 akun sampel mahasiswa untuk QA
echo.
set /p seederchoice="Pilih mode seeder [1 atau 2, default: 1]: "
if "%seederchoice%"=="2" goto SEED_SIMULASI

:SEED_PRODUKSI
echo       + Menjalankan migrasi dengan ProductionSeeder - Mode Produksi Riil Tanpa Dummy...
call php artisan migrate --seed --seeder=ProductionSeeder
goto SEED_SELESAI

:SEED_SIMULASI
echo       + Menjalankan migrasi dengan DatabaseSeeder - Mode Simulasi Pengujian...
call php artisan migrate --seed
goto SEED_SELESAI

:SEED_SELESAI
echo       + Penyiapan database MySQL selesai!
echo.

echo [6/7] Menginstal dan menyelaraskan dependensi Node.js / NPM...
call npm install --legacy-peer-deps
if exist "node_modules\esbuild\install.js" (
    echo       + Memasang dan meregistrasi binary native esbuild Windows...
    call node node_modules\esbuild\install.js
)
echo       + Memverifikasi build aset Vite untuk portal...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo       [PERINGATAN] Build awal Vite mengalami kendala. Periksa pesan di atas.
) else (
    echo       + Kompilasi aset Vite sukses siap pakai!
)

echo.
echo =====================================================================
echo  SETUP SELESAI DENGAN SUKSES!
echo.
echo  [FITUR UTAMA] UJI LIVE CRUD LANGSUNG KE MYSQL:
echo  Jalankan file: laragon-test-crud.bat
echo  Untuk menguji Create, Read, Update, Delete nyata pada tabel master!
echo.
echo  Untuk menjalankan server operasional:
echo  1. Backend API:  php artisan serve --port=8000
echo  2. Frontend:     npm run dev (Port 3000)
echo  Buka browser Anda di: http://localhost:3000 atau http://127.0.0.1:8000
echo =====================================================================
echo.
set /p runtest="Apakah Anda ingin langsung menjalankan Uji Live CRUD sekarang? [Y/N]: "
if /i "%runtest%"=="Y" goto RUN_CRUD_DIRECT
echo Selesai. Anda dapat menjalankan laragon-test-crud.bat kapan saja.
pause
exit /b 0

:RUN_CRUD_DIRECT
call laragon-test-crud.bat
exit /b 0

