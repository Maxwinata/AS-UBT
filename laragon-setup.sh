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

echo "[5/7] Menjalankan migrasi basis data dan seeder master tarif..."
php artisan migrate --seed

echo "[6/7] Menginstal dependensi Node.js / NPM..."
npm install

echo ""
echo "====================================================================="
echo " SETUP SELESAI DENGAN SUKSES!"
echo " Jalankan: npm run dev"
echo " Akses di: http://asrama-ubt.test atau php artisan serve"
echo "====================================================================="
