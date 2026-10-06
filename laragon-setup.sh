#!/bin/bash
set -e

echo "====================================================================="
echo " PORTAL SI-GABUNG 54 (ASRAMA UBT) - AUTOMATED SETUP SCRIPT"
echo " Stack: Laravel 11 + Inertia.js + React 19 + Tailwind CSS + MySQL"
echo "====================================================================="
echo ""

if [ ! -f ".env" ]; then
    echo "[1/6] Menduplikat file konfigurasi .env dari .env.example..."
    cp .env.example .env
else
    echo "[1/6] File .env sudah ada, melewati langkah ini."
fi

echo "[2/6] Menginstal dependensi PHP via Composer..."
composer install

echo "[3/6] Men-generate Application Key Laravel..."
php artisan key:generate

echo "[4/6] Menjalankan migrasi basis data dan seeder master tarif..."
php artisan migrate --seed

echo "[5/6] Menginstal dependensi Node.js / NPM..."
npm install

echo ""
echo "====================================================================="
echo " SETUP SELESAI DENGAN SUKSES!"
echo " Jalankan: npm run dev"
echo " Akses di: http://asrama-ubt.test atau php artisan serve"
echo "====================================================================="
