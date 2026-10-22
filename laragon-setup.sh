#!/bin/bash
set -e

echo "====================================================================="
echo " PORTAL SI-GABUNG 54 (ASRAMA UBT) - AUTOMATED SETUP SCRIPT"
echo " Stack: Laravel 11 + Inertia.js + React 19 + Tailwind CSS + MySQL"
echo "====================================================================="
echo ""

if [ ! -f ".env" ]; then
    echo "[1/7] Menduplikat file konfigurasi .env dari .env.example..."
    cp .env.example .env
else
    echo "[1/7] File .env sudah ada, melewati langkah ini."
fi

echo "[2/7] Memeriksa dan membuat direktori penting Laravel (bootstrap/cache & storage)..."
mkdir -p bootstrap/cache
mkdir -p storage/app/public
mkdir -p storage/app/private_kyc
mkdir -p storage/framework/cache/data
mkdir -p storage/framework/sessions
mkdir -p storage/framework/views
mkdir -p storage/logs
chmod -R 775 bootstrap/cache storage 2>/dev/null || true
echo "      + Direktori bootstrap/cache dan storage siap!"

echo "[3/7] Menginstal dependensi PHP via Composer..."
composer install

echo "[4/7] Men-generate Application Key Laravel..."
php artisan key:generate

echo "[5/7] Memastikan database asrama_ubt_db & u540633926_simaba siap di MySQL..."
mysql -u root -e "CREATE DATABASE IF NOT EXISTS asrama_ubt_db; CREATE DATABASE IF NOT EXISTS u540633926_simaba; CREATE USER IF NOT EXISTS 'u540633926_simaba'@'localhost'; CREATE USER IF NOT EXISTS 'u540633926_simaba'@'127.0.0.1'; GRANT ALL PRIVILEGES ON u540633926_simaba.* TO 'u540633926_simaba'@'localhost'; GRANT ALL PRIVILEGES ON u540633926_simaba.* TO 'u540633926_simaba'@'127.0.0.1'; FLUSH PRIVILEGES;" 2>/dev/null || true
echo "      + Menjalankan migrasi dengan ProductionSeeder (Mode Produksi Riil - Zero Dummy Mahasiswa)..."
php artisan migrate --seed --seeder=ProductionSeeder

echo "[6/7] Menginstal dependensi Node.js / NPM..."
npm install --legacy-peer-deps
if [ -f "node_modules/esbuild/install.js" ]; then
    echo "      + Memasang binary native esbuild..."
    node node_modules/esbuild/install.js
fi

echo ""
echo "====================================================================="
echo " SETUP SELESAI DENGAN SUKSES!"
echo " Jalankan: npm run dev"
echo " Akses di: http://asrama-ubt.test atau php artisan serve"
echo "====================================================================="
