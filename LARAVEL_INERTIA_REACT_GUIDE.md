# Panduan Implementasi Web Portal Asrama UBT (Laravel + Inertia.js + React)

Dokumen ini berisi panduan *step-by-step* untuk membangun ulang atau memigrasikan Web Portal Asrama Universitas Bunda Thamrin (UBT) menggunakan stack **Laravel, Inertia.js, dan React** dengan target environment **Laragon** (MySQL).

---

## Tahap 1: Persiapan Environment (Laragon)

1. Pastikan **Laragon** sudah terinstal dan berjalan (Start All).
2. Buka terminal Laragon (klik tombol **Terminal** di Laragon).
3. Buat project Laravel baru:
   ```bash
   composer create-project laravel/laravel asrama-ubt
   cd asrama-ubt
   ```
4. Buka phpMyAdmin (http://localhost/phpmyadmin) atau HeidiSQL, lalu buat database baru dengan nama `asrama_ubt`.
5. Buka file `.env` di root project, sesuaikan konfigurasi database:
   ```env
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=asrama_ubt
   DB_USERNAME=root
   DB_PASSWORD=
   ```

---

## Tahap 2: Instalasi Inertia.js, React, dan Tailwind CSS

1. **Instalasi Breeze (React/Inertia Stack):**
   Cara paling mudah untuk mengatur Inertia + React di Laravel adalah menggunakan Laravel Breeze.
   ```bash
   composer require laravel/breeze --dev
   php artisan breeze:install react
   ```
   *Saat diminta, Anda bisa memilih opsi dukungan SSR jika dibutuhkan, atau default saja.*

2. **Instalasi Dependencies & Build:**
   ```bash
   npm install
   npm run build
   ```

3. **Verifikasi Instalasi:**
   Jalankan server PHP dan Vite (buka 2 terminal):
   * Terminal 1: `php artisan serve`
   * Terminal 2: `npm run dev`

---

## Tahap 3: Struktur Direktori Project

Setelah instalasi, fokus pengembangan akan berada pada direktori berikut:
*   `app/Http/Controllers/` - Logika backend (Controller).
*   `app/Models/` - Model Eloquent.
*   `database/migrations/` - Skema database.
*   `routes/web.php` - Routing web dan API/Inertia endpoint.
*   `resources/js/Pages/` - Halaman React (Dashboard, Auth, dll).
*   `resources/js/Components/` - Komponen React UI yang dapat digunakan ulang (Button, Input, Modal, Camera, dll).

---

## Tahap 4: Migrasi Database

Berdasarkan `FIELD_MAPPING_DOCUMENTATION.md`, kita perlu membuat beberapa migration:

```bash
php artisan make:migration create_admission_applications_table
php artisan make:migration create_admission_identity_verifications_table
php artisan make:migration create_admission_bills_table
php artisan make:migration create_admission_payment_proofs_table
php artisan make:migration create_admission_room_plotting_table
php artisan make:migration create_admission_contracts_table
php artisan make:migration create_admission_checkin_tickets_table
```

*Contoh isi migration `create_admission_applications_table`:*
```php
public function up(): void
{
    Schema::create('admission_applications', function (Blueprint $table) {
        $table->id();
        $table->foreignId('user_id')->constrained()->onDelete('cascade');
        $table->string('nim')->unique();
        $table->string('whatsapp_number');
        $table->string('faculty');
        $table->string('study_program');
        $table->enum('gender', ['L', 'P']);
        $table->integer('current_step')->default(1);
        $table->timestamps();
    });
}
```
*Jalankan migration:*
```bash
php artisan migrate
```

---

## Tahap 5: Pembuatan Controller

Buat controller untuk Maba:
```bash
php artisan make:controller Maba/DashboardController
```

*Isi `app/Http/Controllers/Maba/DashboardController.php`:*
```php
namespace App\Http\Controllers\Maba;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\AdmissionApplication;

class DashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $application = AdmissionApplication::where('user_id', $user->id)->first();
        
        // Pass data ke komponen React via Inertia
        return Inertia::render('Maba/Dashboard', [
            'auth' => [
                'user' => $user,
            ],
            'application' => $application,
            'activeStep' => $application ? $application->current_step : 1,
        ]);
    }

    public function updateStep(Request $request)
    {
        // Logika update step, upload KTP, dll.
    }
}
```

---

## Tahap 6: Routing (web.php)

Ubah file `routes/web.php` untuk memetakan route ke controller dan Inertia.

```php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Maba\DashboardController;

Route::get('/', function () {
    return Inertia::render('Welcome');
});

Route::middleware(['auth', 'verified'])->group(function () {
    // Route Dashboard Maba
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::post('/dashboard/step', [DashboardController::class, 'updateStep'])->name('dashboard.step.update');
    
    // Tambahkan route lain untuk upload KTP, bukti bayar, dll
});

require __DIR__.'/auth.php';
```

---

## Tahap 7: Pembuatan Komponen React (Inertia Pages)

Buat file `resources/js/Pages/Maba/Dashboard.jsx` (atau `.tsx` jika menggunakan TypeScript).

*Contoh `resources/js/Pages/Maba/Dashboard.tsx`:*
```tsx
import React, { useState } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Dashboard({ auth, application, activeStep }) {
    const [currentStep, setCurrentStep] = useState(activeStep);

    const handleNextStep = () => {
        router.post(route('dashboard.step.update'), {
            step: currentStep + 1
        }, {
            onSuccess: () => setCurrentStep(currentStep + 1)
        });
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Dashboard Maba" />

            <div className="py-12 bg-slate-50 min-h-screen">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    {/* Welcome Banner */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6 mb-8 border border-slate-200">
                        <h2 className="text-2xl font-extrabold text-slate-900">
                            Selamat Datang, {auth.user.name}! 👋
                        </h2>
                        <p className="text-sm text-slate-600 mt-1">
                            Selesaikan 6 langkah admisi di bawah ini untuk mendapatkan alokasi kamar Asrama Universitas Bunda Thamrin.
                        </p>
                    </div>

                    {/* Konten Stepper React */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <p>Langkah saat ini: {currentStep}</p>
                        
                        {currentStep === 1 && (
                            <div>
                                <h3>Langkah 1: Upload KTP</h3>
                                {/* Komponen Camera / Form Upload */}
                            </div>
                        )}

                        {currentStep === 3 && (
                            <div>
                                <h3>Langkah 3: Pembayaran</h3>
                                {/* Form Upload Bukti Bayar */}
                            </div>
                        )}
                        
                        {/* Contoh tombol submit (Inertia akan handle secara AJAX otomatis) */}
                        <button onClick={handleNextStep} className="mt-4 bg-teal-600 text-white px-4 py-2 rounded">
                            Simpan & Lanjut
                        </button>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
```

---

## Tahap 8: Alur Kerja (Workflow) Data dengan Inertia

Tidak seperti metode AJAX tradisional (Axios mentah) atau Blade views:
1. Saat user submit form upload bukti transfer, gunakan form helper dari Inertia (`useForm`).
2. Data dikirim (POST) ke controller Laravel.
3. Controller memproses (simpan file via `Storage`, simpan DB), lalu mengembalikan *Redirect*.
4. Inertia otomatis menangkap *Redirect* tersebut sebagai instruksi untuk meng-update state React secara halus (*Smooth SPA transition*) tanpa me-reload browser.

*Contoh `useForm` di React:*
```tsx
import { useForm } from '@inertiajs/react';

const { data, setData, post, processing, errors } = useForm({
    proof_image: null,
});

const submitPayment = (e) => {
    e.preventDefault();
    post(route('payment.upload'));
};
```

## Kesimpulan
Dengan arsitektur **Laravel + Inertia.js + React**, Anda akan mendapatkan kemudahan routing dan backend solid dari Laravel, sekaligus pengalaman UX *Single Page Application* (SPA) yang interaktif dari React, tanpa perlu membangun API terpisah.
