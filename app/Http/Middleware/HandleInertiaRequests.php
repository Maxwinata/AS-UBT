<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;
use App\Models\Tariff;
use App\Models\PaymentScheme;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return array_merge(parent::share($request), [
            'auth' => [
                'user' => $request->user() ? [
                    'id' => $request->user()->id,
                    'name' => $request->user()->name,
                    'email' => $request->user()->email,
                    'role' => $request->user()->role,
                    'nim' => $request->user()->nim,
                    'no_pmb' => $request->user()->no_pmb,
                ] : null,
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
                'info' => fn () => $request->session()->get('info'),
            ],
            'masterTariffs' => fn () => Tariff::all(),
            'paymentSchemes' => fn () => PaymentScheme::all(),
            'appConfig' => [
                'name' => config('app.name', 'Portal SI-GABUNG 54'),
                'bankBsiAccount' => '7123 456 789 (a.n. Asrama Mahasiswa UBT)',
                'adminFee' => 100000,
            ],
        ]);
    }
}
