# Panduan Setup & Kontrak Data: Laravel + Inertia.js + React (Lingkungan Laragon)

Dokumen ini adalah panduan langkah demi langkah (SOP) untuk memigrasi purwarupa *Frontend* React kita saat ini ke dalam ekosistem **Laravel + Inertia.js + React**. Pendekatan ini dirancang sangat berhati-hati untuk mencegah *bias konfigurasi* atau kerusakan (*corrupt*) saat penggabungan.

---

## 💡 PERHATIAN: Perubahan Paradigma (REST API vs Inertia.js)

Karena Anda menggunakan **Inertia.js**, kita **TIDAK LAGI** menggunakan pola tradisional di mana React melakukan `fetch()` atau `axios.get()` saat halaman dimuat (yang memunculkan *loading spinner*).

Di Inertia.js, **Backend (Laravel) yang merender halaman dan langsung menyuntikkan datanya (sebagai *Props*) ke dalam komponen React**. 

*   ❌ **Cara Lama (REST API):** Laravel kirim JSON -> React terima -> React *Render* UI.
*   ✅ **Cara Inertia:** Laravel me-return `Inertia::render('MabaDashboard', ['profil' => $dataMaba])` -> React langsung me-render UI menggunakan *props* `profil`.

Oleh karena itu, "API Contract" dalam konteks ini mayoritas adalah **Inertia Props Contract**. REST API murni hanya digunakan untuk proses yang berjalan di latar belakang (seperti *Webhook* Bank atau tombol aksi tertentu).

---

## FASE 1: Setup Lingkungan di Laragon (Step-by-Step)

Gunakan metode **Laravel Breeze** untuk mengonfigurasi Inertia dan Vite secara otomatis. Ini adalah cara paling aman untuk mencegah *error* konfigurasi.

### 1. Inisialisasi Proyek Laravel
Buka Terminal di Laragon (klik tombol "Terminal" di aplikasi Laragon), lalu jalankan:
```bash
cd C:\laragon\www
composer create-project laravel/laravel asrama-ubt
cd asrama-ubt
```

### 2. Konfigurasi Database (HeidiSQL / phpMyAdmin)
1. Buka aplikasi Database bawaan Laragon (HeidiSQL).
2. Buat database baru bernama `asrama_ubt`.
3. Buka file `.env` di folder proyek Laravel Anda, ubah bagian database:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=asrama_ubt
DB_USERNAME=root
DB_PASSWORD=
```

### 3. Instalasi Laravel Breeze (React + Inertia)
Di terminal, jalankan perintah ini secara berurutan. Ini akan otomatis mengatur Inertia, React, Tailwind, dan Vite agar saling terhubung tanpa korup:
```bash
composer require laravel/breeze --dev
php artisan breeze:install react
npm install
npm run build
php artisan migrate
```

---

## FASE 2: Migrasi Kode (Dari Prototype ke Laravel)

Struktur folder React di Laravel berada di dalam `resources/js/`.

1. **Pindahkan Komponen:**
   Salin folder `src/components`, `src/types`, dan `src/data` dari purwarupa kita ke dalam `resources/js/` di Laravel.
   *(Sehingga menjadi `resources/js/components`, `resources/js/types`, dst).*

2. **Ubah App.tsx menjadi Pages (Inertia):**
   Inertia menggunakan konsep *Pages* (Halaman). Alih-alih satu `App.tsx` raksasa, pecah halamannya.
   Contoh: Buat file `resources/js/Pages/Maba/Dashboard.tsx`.

   ```tsx
   // resources/js/Pages/Maba/Dashboard.tsx
   import React from 'react';
   import { MabaProfile, BillingInvoice } from '@/types/asrama';
   import { Header } from '@/components/Header';
   
   // Data dilempar langsung dari Laravel Controller via Props!
   export default function Dashboard({ profile, invoice }: { profile: MabaProfile, invoice: BillingInvoice }) {
     return (
       <div>
         <Header currentRole="maba" userName={profile.nama} />
         {/* Render komponen dashboard Anda di sini */}
       </div>
     );
   }
   ```

3. **Konfigurasi Tailwind (tailwind.config.js):**
   Pastikan file konfigurasi Tailwind di Laravel memindai folder yang benar:
   ```javascript
   content: [
       './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
       './storage/framework/views/*.php',
       './resources/views/**/*.blade.php',
       './resources/js/**/*.tsx', // <-- Pastikan ini ada
   ],
   ```

---

## FASE 3: Kontrak Data (Inertia Props & REST API)

Berikut adalah panduan bagi *Backend Developer* (Laravel) untuk menyusun data yang akan dikirim ke Frontend.

### 1. Endpoint: Dashboard Maba (Inertia Page)
**Route:** `GET /maba/dashboard`
**Controller Action:**
```php
public function index(Request $request) {
    // 1. Ambil data dari staging_penyewa (atau Sync SIAKAD jika kosong)
    $maba = StagingPenyewa::where('nim', Auth::user()->nim)->first();
    
    // 2. Ambil invoice aktif
    $invoice = RequestPembayaran::where('penyewa_id', $maba->id)->first();

    return Inertia::render('Maba/Dashboard', [
        'profile' => [
            'nim' => $maba->nim,
            'nama' => $maba->nama,
            'jenisKelamin' => $maba->jenis_kelamin,
            'prodi' => $maba->prodi_id,
            // ... (sesuaikan dengan interface MabaProfile di types/asrama.ts)
        ],
        'invoice' => $invoice ? [
            'invoiceId' => $invoice->no_request,
            'totalBayar' => $invoice->nominal,
            'status' => $invoice->status_bayar == 1 ? 'PAID' : 'UNPAID',
            // ...
        ] : null
    ]);
}
```

### 2. Endpoint: Kunci Kamar / Plotting (REST API / Axios)
Karena ini aksi yang dilakukan tanpa memuat ulang halaman (*Action*), kita menggunakan REST API (Axios).
**Route:** `POST /api/maba/plot-kamar`
**Payload (Dari React ke Laravel):**
```json
{
  "kamar_id": 105,
  "durasi_bulan": 6,
  "opsi_cicilan_deposit": true
}
```
**Response (Dari Laravel ke React):**
```json
{
  "status": "success",
  "message": "Kamar berhasil dikunci (Staging). Silakan lakukan pembayaran.",
  "data": {
    "no_request": "INV-105-882",
    "total_bayar": 3750145,
    "kode_unik": 145,
    "expired_at": "2026-08-13T10:00:00Z"
  }
}
```

### 3. Endpoint: Webhook Bank (Pure REST API)
**Route:** `POST /api/webhook/payment` (Tidak ada proteksi CSRF/Sanctum untuk route ini).
**Payload (Dari Bank ke Laravel):**
```json
{
  "bank": "BNI",
  "transaction_id": "TXN-998822",
  "amount": 3750145,
  "payment_time": "2026-08-12 14:00:00"
}
```
**Tugas Backend:**
1. Cari `request_pembayaran` dengan `nominal` == 3750145.
2. Jika ada, pindahkan data `request_pembayaran` ke `pembayaran`.
3. Pindahkan data `staging_penyewa` ke `penyewa` (Master).
4. Kembalikan respons `200 OK` ke server bank.
