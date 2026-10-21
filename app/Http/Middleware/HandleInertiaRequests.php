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
        // Evaluasi Clean UI / Production Mode: Default adalah PRODUKSI RIIL (Clean / Non-Dummy)
        // Kecuali jika secara spesifik diatur sebagai 'simulation' atau 'standard'
        $isCleanEnv = config('app.ui_mode') !== 'simulation' && config('app.ui_mode') !== 'standard';
        
        // Dukungan override URL query (?ui_mode=clean atau ?mode=production vs ?mode=simulation)
        $isNonProd = app()->environment(['local', 'testing', 'staging', 'development']) || config('app.env') !== 'production';
        $queryOverride = null;
        
        if ($isNonProd) {
            $modeQuery = $request->query('mode');
            $uiModeQuery = $request->query('ui_mode');
            $cleanQuery = $request->query('clean');
            $testQuery = $request->query('testing');

            if ($modeQuery === 'simulation' || $uiModeQuery === 'simulation' || $uiModeQuery === 'standard' || $testQuery === 'false' || $cleanQuery === '0') {
                $queryOverride = false;
                $request->session()->put('asrama_operational_mode', 'simulation');
            } elseif ($modeQuery === 'production' || $uiModeQuery === 'clean' || $uiModeQuery === 'production' || $testQuery === 'true' || $cleanQuery === '1') {
                $queryOverride = true;
                $request->session()->put('asrama_operational_mode', 'production');
            } elseif ($request->session()->get('asrama_operational_mode') === 'simulation') {
                $queryOverride = false;
            } elseif ($request->session()->get('asrama_operational_mode') === 'production') {
                $queryOverride = true;
            }
        }

        $isTestingMode = $queryOverride !== null ? $queryOverride : $isCleanEnv;

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
            'uiMode' => [
                'isCleanTesting' => $isTestingMode,
                'mode' => $isTestingMode ? 'clean' : 'standard',
                'environment' => config('app.env', 'production'),
                'features' => [
                    'hideMarketingBanners' => $isTestingMode,
                    'hideDevToolsSidebar' => $isTestingMode,
                    'hideDemoPresets' => $isTestingMode,
                    'hideStatisticsCards' => $isTestingMode,
                    'hideOnboardingModals' => $isTestingMode,
                    'focusRegistrationFlow' => $isTestingMode,
                ],
            ],
        ]);
    }
}
