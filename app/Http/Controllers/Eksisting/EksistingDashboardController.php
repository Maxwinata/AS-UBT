<?php

namespace App\Http\Controllers\Eksisting;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Contract;
use App\Models\BillingInvoice;
use App\Models\Delinquency;

class EksistingDashboardController extends Controller
{
    /**
     * Render Halaman Dashboard Mahasiswa Eksisting (Senior)
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $contract = $user ? $user->contract : null;
        $invoices = $user ? $user->invoices()->latest()->get() : [];
        $delinquency = $user ? $user->delinquencies()->latest()->first() : null;

        return Inertia::render('Eksisting/Dashboard', [
            'contract' => $contract,
            'invoices' => $invoices,
            'delinquency' => $delinquency,
        ]);
    }
}
