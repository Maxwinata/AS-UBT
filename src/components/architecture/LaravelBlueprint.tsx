import React, { useState } from 'react';
import { 
  Database, 
  Server, 
  FileCode, 
  CheckCircle2, 
  Copy, 
  Check, 
  Terminal, 
  Layers, 
  ShieldCheck, 
  Network, 
  Lock, 
  Sliders, 
  Wrench, 
  FileSpreadsheet, 
  FileCheck,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
  Code2,
  FolderTree
} from 'lucide-react';
import ERDDiagram from './ERDDiagram';

export const LaravelBlueprint: React.FC = () => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'erd' | 'migrations' | 'models' | 'controllers' | 'seeders' | 'kyc_storage' | 'env' | 'cron'>('erd');

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const envCode = `# ======================================================
# LARAGON & MYSQL / PHPMYADMIN .ENV SETUP
# Project: Portal SI-GABUNG 54 (Roemah 54) - Reg. Yayasan Gleni
# Target Habitat: Laragon 6.x / PHP 8.2+ / MySQL 8.0+ / Laravel 11/12 (Inertia + React)
# ======================================================

APP_NAME="Portal SI-GABUNG 54"
APP_ENV=local
APP_KEY=base64:3m8k1X9ZpL2a4vQ7wR5tY8uI0oP1sD3fG5hJ7kL9mN0=
APP_DEBUG=true
APP_TIMEZONE="Asia/Jakarta"
APP_URL=http://asrama-ubt.test

LOG_CHANNEL=stack
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=debug

# DATABASE MYSQL / PHPMYADMIN (LARAGON DEFAULT)
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=asrama_ubt_db
DB_USERNAME=root
DB_PASSWORD=

# PRIVATE STORAGE DRIVER (FOR KYC KTP & SELFIE ENCRYPTION)
# RULE: Strictly Private Bucket / Non-public Storage with Signed URLs
KYC_STORAGE_DISK=private_kyc
KYC_RETENTION_DAYS=60
KYC_SIGNED_URL_TTL_MINUTES=15

# WHATSAPP GATEWAY (FOR OTP CONTRACT & MAINTENANCE BROADCAST)
WA_GATEWAY_PROVIDER=fonnte
WA_GATEWAY_URL=https://api.fonnte.com/send
WA_GATEWAY_TOKEN=ubt_wa_token_sec_2026

# KIP SCHOLARSHIP & SIAKAD API SINKRONISASI KAMPUS
KIP_API_URL=https://siakad.ubtsu.ac.id/api/v1/scholarships/kip
KIP_API_KEY=ubt_sec_key_2026_gleni

# VITE & INERTIA CONFIGURATION
VITE_APP_NAME="\${APP_NAME}"
VITE_WA_GATEWAY_ACTIVE=true
`;

  const migrationCode = `<?php

use Illuminate\\Database\\Migrations\\Migration;
use Illuminate\\Database\\Schema\\Blueprint;
use Illuminate\\Support\\Facades\\Schema;

return new class extends Migration
{
    /**
     * Run the migrations for Laragon & MySQL (asrama_ubt_db).
     * Fully synchronized with SI-GABUNG 54 Architecture & Yayasan Gleni Rules.
     */
    public function up(): void
    {
        // 1. Users Table (SSO, PMB & Admins)
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('nim_noreg')->unique(); // PMB2026-08942 or 2240101004
            $table->string('nama');
            $table->string('email')->unique();
            $table->string('no_hp_wa');
            $table->string('password');
            $table->enum('role', [
                'maba', 
                'eksisting', 
                'maintenance_ticketing',
                'admin_keuangan', 
                'admin_asrama', 
                'super_admin'
            ])->default('maba');
            $table->enum('kategori_mahasiswa', ['REGULER', 'KIP', 'INTERNAL', 'EXTERNAL', 'SCHOLARSHIP'])->default('REGULER');
            $table->boolean('is_kip_student')->default(false);
            $table->string('kip_number')->nullable();
            $table->enum('jenis_kelamin', ['Laki-laki', 'Perempuan'])->default('Laki-laki');
            $table->string('fakultas')->nullable();
            $table->string('prodi')->nullable();
            $table->string('angkatan', 4)->nullable();
            
            // Alamat KTP & Domisili
            $table->text('alamat_ktp')->nullable();
            $table->text('alamat_domisili')->nullable();
            
            // Kontak Darurat
            $table->string('kontak_darurat_nama')->nullable();
            $table->string('kontak_darurat_hubungan')->nullable();
            $table->string('kontak_darurat_no_hp')->nullable();
            
            $table->timestamps();
        });

        // 2. e-KYC Records Table (Private Storage & Audit Trail Supported)
        Schema::create('ekyc_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('nik', 16)->nullable();
            $table->integer('version')->default(1); // Increment on correction, NEVER overwrite!
            $table->string('ktp_file_path');       // Private disk path (e.g. kyc/ktp_08942_v1_169456.enc)
            $table->string('selfie_file_path');    // Private disk path (e.g. kyc/selfie_08942_v1_169456.enc)
            $table->enum('status', ['PENDING', 'VERIFIED', 'REJECTED'])->default('PENDING');
            $table->boolean('is_active_version')->default(true);
            $table->text('rejection_reason')->nullable();
            $table->foreignId('verified_by')->nullable()->constrained('users');
            $table->timestamp('verified_at')->nullable();
            $table->timestamps();
            
            $table->index(['user_id', 'is_active_version']);
        });

        // 3. KYC Audit Logs Table (Full Traceability for Corrections)
        Schema::create('kyc_audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('actor'); // User, Admin, System
            $table->string('action'); // KYC_SUBMITTED, DATA_CORRECTED, KYC_APPROVED, etc.
            $table->json('diff_payload')->nullable(); // Previous vs New Values
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamps();
        });

        // 4. Payment Schemes (Master Kebijakan Cicilan Deposit)
        // DEFAULT POLICY: allow_deposit_installment = FALSE (OFF), can be toggled by Admin Keuangan
        Schema::create('payment_schemes', function (Blueprint $table) {
            $table->id();
            $table->enum('target', ['REGULER', 'KIP', 'INTERNAL', 'EXTERNAL', 'SCHOLARSHIP', 'ALL'])->unique();
            $table->integer('max_installments')->default(1);
            $table->decimal('installment_multiplier', 4, 2)->default(1.00);
            $table->boolean('allow_deposit_installment')->default(false); // DEFAULT OFF!
            $table->timestamps();
        });

        // 5. Master Tariffs Table (Biaya Sewa, Deposit, Perlengkapan)
        Schema::create('tariffs', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->decimal('amount', 12, 2);
            $table->enum('category', ['SEWA', 'DEPOSIT', 'PERLENGKAPAN', 'CICILAN', 'PENGATURAN', 'LAINNYA']);
            $table->enum('target', ['REGULER', 'KIP', 'INTERNAL', 'EXTERNAL', 'SCHOLARSHIP', 'ALL'])->default('ALL');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 6. Rooms Table (Master Fasilitas & Kapasitas)
        Schema::create('rooms', function (Blueprint $table) {
            $table->id();
            $table->string('room_code')->unique(); // e.g. RM-B204
            $table->string('gedung');              // e.g. Gedung B (Hiu UBT)
            $table->integer('lantai');
            $table->string('nomor_kamar');         // e.g. 204
            $table->integer('kapasitas')->default(2);
            $table->integer('terisi')->default(0);
            $table->enum('peruntukan_gender', ['Laki-laki', 'Perempuan'])->default('Laki-laki');
            $table->json('fasilitas')->nullable();
            $table->timestamps();
        });

        // 7. Temporary Room Booking Lock (Concurrency Guard / Staging Request)
        Schema::create('room_reservations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('room_id')->constrained('rooms')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->timestamp('locked_until'); // Expiration (e.g. 24 hours to pay)
            $table->enum('status', ['HOLD', 'CONFIRMED', 'EXPIRED'])->default('HOLD');
            $table->timestamps();
            
            $table->index(['room_id', 'status', 'locked_until']);
        });

        // 8. Invoices Table (Billing with 3-Digit Unique Code & Deposit Splitting)
        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            $table->string('invoice_id')->unique(); // e.g. INV-UBT-2026-8891
            $table->foreignId('user_id')->constrained('users');
            $table->string('nim');
            $table->boolean('is_kip')->default(false);
            $table->integer('durasi_bulan')->default(6);
            $table->enum('skema_bayar_sewa', ['LUNAS_DIMUKA', 'BULANAN'])->default('LUNAS_DIMUKA');
            $table->decimal('tarif_per_bulan', 12, 2)->default(500000);
            $table->decimal('biaya_sewa', 12, 2);
            
            // Deposit Policy Fields
            $table->boolean('is_cicilan_deposit')->default(false);
            $table->tinyInteger('opsi_cicilan')->default(1); // 1 = Lunas, 2 = 2x, 3 = 3x
            $table->decimal('biaya_deposit', 12, 2);         // Deposit termin pertama
            $table->decimal('biaya_deposit_total', 12, 2);   // Total kewajiban
            $table->decimal('sisa_cicilan_deposit', 12, 2)->default(0);
            $table->boolean('cicilan_deposit_allowed')->default(false); // Sesuai payment_schemes
            
            $table->decimal('biaya_perlengkapan', 12, 2)->default(100000);
            $table->integer('kode_unik'); // 3 Digit Unik (e.g. 142)
            $table->decimal('total_bayar', 12, 2);
            
            $table->enum('status', ['UNPAID', 'PENDING_VERIFICATION', 'PAID', 'EXPIRED'])->default('UNPAID');
            $table->enum('metode_bayar', ['TRANSFER_MANUAL', 'VIRTUAL_ACCOUNT'])->default('TRANSFER_MANUAL');
            $table->string('bukti_transfer_path')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->foreignId('verified_by')->nullable()->constrained('users');
            $table->timestamps();
        });

        // 9. Digital Contracts & BASTK (Master Kontrak Kolektif Pasal 39 & UU ITE 11)
        Schema::create('digital_contracts', function (Blueprint $table) {
            $table->id();
            $table->string('contract_code')->unique();
            $table->string('batch_number')->nullable(); // Batch Pengesahan Kolektif 1 Meterai
            $table->foreignId('user_id')->constrained('users');
            $table->foreignId('room_id')->constrained('rooms');
            $table->decimal('deposit_amount', 12, 2);
            $table->string('wa_number');
            $table->boolean('otp_verified')->default(false);
            $table->string('otp_hash')->nullable();
            $table->timestamp('otp_expires_at')->nullable();
            
            // Persetujuan Wali / Orang Tua
            $table->boolean('parent_consent_required')->default(true);
            $table->string('parent_wa_number')->nullable();
            $table->boolean('parent_otp_verified')->default(false);
            $table->timestamp('parent_signed_at')->nullable();
            
            // Bukti Hukum & Audit Trail
            $table->string('document_hash')->nullable(); // SHA-256 hash draft kontrak
            $table->string('auth_method')->default('WHATSAPP_OTP');
            $table->string('signer_ip_address', 45)->nullable();
            $table->date('retention_until')->nullable(); // 5 Tahun sejak berakhir (Pasal 39)
            
            // BASTK (Berita Acara Serah Terima Kamar)
            $table->boolean('bastk_signed')->default(false);
            $table->timestamp('bastk_signed_at')->nullable();
            $table->json('bastk_items_check')->nullable(); // Kasur, Meja, Lemari, AC, Lampu, Kunci
            
            $table->enum('status', ['DRAFT', 'OTP_SENT', 'SIGNED'])->default('DRAFT');
            $table->timestamp('signed_at')->nullable();
            $table->timestamps();
        });

        // 10. Maintenance Tickets Table (With Urgency & Priority Selector 'Low'/'Medium'/'High')
        Schema::create('maintenance_tickets', function (Blueprint $table) {
            $table->id();
            $table->string('ticket_code')->unique(); // e.g. TKT-2026-0842
            $table->foreignId('user_id')->constrained('users');
            $table->foreignId('room_id')->nullable()->constrained('rooms');
            $table->string('reporter_nim');
            $table->string('reporter_name');
            $table->string('reporter_phone');
            $table->string('location_building');
            $table->string('location_floor');
            $table->string('location_room');
            
            $table->enum('category', [
                'plumbing',
                'electrical',
                'furniture',
                'hvac_fan',
                'doors_windows',
                'civil_structure',
                'cleaning_waste',
                'other'
            ]);
            
            // 2 Tingkat Klasifikasi Kerusakan
            $table->enum('urgency', ['low', 'medium', 'high', 'emergency'])->default('medium');
            $table->enum('priority', ['Low', 'Medium', 'High'])->default('Medium'); // Added Selector!
            
            $table->string('title');
            $table->text('description');
            $table->string('photo_path')->nullable();
            
            $table->enum('status', [
                'SUBMITTED',
                'VERIFIED',
                'IN_PROGRESS',
                'COMPLETED',
                'CANCELLED'
            ])->default('SUBMITTED');
            
            // Dispatch Teknisi
            $table->string('assigned_technician_name')->nullable();
            $table->string('assigned_technician_role')->nullable();
            $table->string('assigned_technician_phone')->nullable();
            $table->date('scheduled_date')->nullable();
            $table->text('technician_notes')->nullable();
            $table->string('resolution_photo_path')->nullable();
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();
            
            $table->index(['priority', 'status']);
        });

        // 11. Delinquencies Table (Kebijakan Toleransi 5+5 Hari & Pemotongan Deposit)
        Schema::create('delinquencies', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users');
            $table->date('due_date')->default('2026-09-01'); // Tanggal jatuh tempo sewa (misal 1 Sept)
            $table->integer('days_overdue')->default(0);
            $table->enum('stage', [
                'GRACE_PERIOD_SEWA',           // Hari 1-5 (1 s/d 6 Sept): Toleransi bayar sewa (Denda Rp 0)
                'DEPOSIT_DIPAKAI_GRACE_TOPUP', // Hari 6-10 (6 s/d 11 Sept): Deposit dipakai bayar sewa + toleransi 5 hari top-up
                'DEFAULT_KONTRAK_BERAKHIR'     // Hari 11+ (> 11 Sept): Denda Rp 500k + Kontrak tinggal berakhir
            ])->default('GRACE_PERIOD_SEWA');
            $table->boolean('deposit_deducted_for_rent')->default(false); // True jika lewat 5 hari (6 Sept)
            $table->decimal('deposit_deducted_amount', 12, 2)->default(0);
            $table->date('grace_period_sewa_end')->default('2026-09-06');  // Batas toleransi sewa (6 Sept)
            $table->date('grace_period_topup_end')->default('2026-09-11'); // Batas toleransi top-up deposit (11 Sept)
            $table->decimal('fine_amount', 12, 2)->default(0); // Rp 0 selama toleransi; Rp 500.000 jika lewat 11 Sept
            $table->boolean('contract_terminated')->default(false); // Kontrak berakhir
            $table->boolean('eviction_issued')->default(false);
            $table->timestamps();
        });

        // 12. Deposit Refunds & Damage Inspection Table (Phase C Hierarchy)
        Schema::create('deposit_refunds', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users');
            $table->foreignId('room_id')->constrained('rooms');
            $table->decimal('initial_deposit', 12, 2);
            $table->decimal('deduction_tunggakan', 12, 2)->default(0);       // Priority 1
            $table->decimal('deduction_overstay', 12, 2)->default(0);        // Priority 2
            $table->decimal('deduction_simpan_barang', 12, 2)->default(0);   // Priority 3
            $table->decimal('deduction_bastk_damage', 12, 2)->default(0);    // Priority 4
            $table->decimal('deduction_early_exit_penalty', 12, 2)->default(0); // Priority 5
            $table->decimal('total_deduction', 12, 2)->default(0);
            $table->decimal('final_refund_amount', 12, 2);
            $table->text('damage_notes')->nullable();
            $table->enum('status', ['INSPECTION', 'APPROVED', 'DISBURSED'])->default('INSPECTION');
            $table->timestamp('disbursed_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('deposit_refunds');
        Schema::dropIfExists('delinquencies');
        Schema::dropIfExists('maintenance_tickets');
        Schema::dropIfExists('digital_contracts');
        Schema::dropIfExists('invoices');
        Schema::dropIfExists('room_reservations');
        Schema::dropIfExists('rooms');
        Schema::dropIfExists('tariffs');
        Schema::dropIfExists('payment_schemes');
        Schema::dropIfExists('kyc_audit_logs');
        Schema::dropIfExists('ekyc_records');
        Schema::dropIfExists('users');
    }
};
`;

  const modelsCode = `<?php

// ==========================================
// 1. app/Models/PaymentScheme.php
// ==========================================
namespace App\\Models;

use Illuminate\\Database\\Eloquent\\Model;

class PaymentScheme extends Model
{
    protected $fillable = [
        'target',
        'max_installments',
        'installment_multiplier',
        'allow_deposit_installment', // boolean toggleable by Admin Keuangan
    ];

    protected $casts = [
        'allow_deposit_installment' => 'boolean',
        'max_installments' => 'integer',
        'installment_multiplier' => 'float',
    ];

    public static function isDepositInstallmentAllowed(string $target): bool
    {
        return (bool) static::where('target', $target)->value('allow_deposit_installment');
    }
}

// ==========================================
// 2. app/Models/MaintenanceTicket.php
// ==========================================
namespace App\\Models;

use Illuminate\\Database\\Eloquent\\Model;
use Illuminate\\Database\\Eloquent\\Relations\\BelongsTo;

class MaintenanceTicket extends Model
{
    protected $fillable = [
        'ticket_code',
        'user_id',
        'room_id',
        'reporter_nim',
        'reporter_name',
        'reporter_phone',
        'location_building',
        'location_floor',
        'location_room',
        'category',
        'urgency',
        'priority', // 'Low', 'Medium', 'High'
        'title',
        'description',
        'photo_path',
        'status',
        'assigned_technician_name',
        'assigned_technician_role',
        'assigned_technician_phone',
        'scheduled_date',
        'technician_notes',
        'resolution_photo_path',
        'resolved_at',
    ];

    protected $casts = [
        'scheduled_date' => 'date',
        'resolved_at' => 'datetime',
    ];

    public function reporter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function room(): BelongsTo
    {
        return $this->belongsTo(Room::class, 'room_id');
    }

    // Helper: Badge color indicator based on Priority
    public function getPriorityBadgeAttribute(): array
    {
        return match($this->priority) {
            'High' => ['bg' => 'bg-rose-500/10', 'text' => 'text-rose-400', 'border' => 'border-rose-500/30', 'label' => 'High Priority'],
            'Medium' => ['bg' => 'bg-amber-500/10', 'text' => 'text-amber-400', 'border' => 'border-amber-500/30', 'label' => 'Medium Priority'],
            default => ['bg' => 'bg-slate-500/10', 'text' => 'text-slate-400', 'border' => 'border-slate-500/30', 'label' => 'Low Priority'],
        };
    }
}

// ==========================================
// 3. app/Models/Invoice.php
// ==========================================
namespace App\\Models;

use Illuminate\\Database\\Eloquent\\Model;
use Illuminate\\Database\\Eloquent\\Relations\\BelongsTo;

class Invoice extends Model
{
    protected $fillable = [
        'invoice_id',
        'user_id',
        'nim',
        'is_kip',
        'durasi_bulan',
        'skema_bayar_sewa',
        'tarif_per_bulan',
        'biaya_sewa',
        'is_cicilan_deposit',
        'opsi_cicilan',
        'biaya_deposit',
        'biaya_deposit_total',
        'sisa_cicilan_deposit',
        'cicilan_deposit_allowed',
        'biaya_perlengkapan',
        'kode_unik',
        'total_bayar',
        'status',
        'metode_bayar',
        'bukti_transfer_path',
        'paid_at',
        'verified_by',
    ];

    protected $casts = [
        'is_kip' => 'boolean',
        'is_cicilan_deposit' => 'boolean',
        'cicilan_deposit_allowed' => 'boolean',
        'biaya_sewa' => 'decimal:2',
        'biaya_deposit' => 'decimal:2',
        'total_bayar' => 'decimal:2',
        'paid_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
`;

  const controllersCode = `<?php

// ==============================================================
// 1. app/Http/Controllers/Maba/DashboardController.php (Inertia)
// ==============================================================
namespace App\\Http\\Controllers\\Maba;

use App\\Http\\Controllers\\Controller;
use Illuminate\\Http\\Request;
use Inertia\\Inertia;
use Inertia\\Response;
use App\\Models\\Invoice;
use App\\Models\\Room;
use App\\Models\\Tariff;
use App\\Models\\PaymentScheme;
use App\\Models\\DigitalContract;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        
        // 1. Ambil invoice aktif mahasiswa
        $invoice = Invoice::where('user_id', $user->id)->latest()->first();

        // 2. Ambil master tariffs & payment schemes aktif
        $tariffs = Tariff::where('is_active', true)->get();
        $paymentSchemes = PaymentScheme::all();

        // 3. Ambil data kamar & kontrak
        $contract = DigitalContract::where('user_id', $user->id)->first();
        $room = $contract ? $contract->room : Room::where('nomor_kamar', '204')->first();

        // SUNTIKKAN PROPS LANGSUNG KE REACT (SPA TANPA RELOAD)
        return Inertia::render('Maba/Dashboard', [
            'profile' => [
                'nim' => $user->nim_noreg,
                'nama' => $user->nama,
                'email' => $user->email,
                'noHpWa' => $user->no_hp_wa,
                'kategori' => $user->kategori_mahasiswa,
                'isKipStudent' => (bool)$user->is_kip_student,
                'kipNumber' => $user->kip_number,
                'jenisKelamin' => $user->jenis_kelamin,
                'fakultas' => $user->fakultas,
                'prodi' => $user->prodi,
            ],
            'invoice' => $invoice,
            'tariffs' => $tariffs,
            'paymentSchemes' => $paymentSchemes,
            'room' => $room,
            'contract' => $contract,
        ]);
    }
}

// ==============================================================
// 2. app/Http/Controllers/Admin/AdminKeuanganController.php
// ==============================================================
namespace App\\Http\\Controllers\\Admin;

use App\\Http\\Controllers\\Controller;
use Illuminate\\Http\\Request;
use Inertia\\Inertia;
use App\\Models\\Invoice;
use App\\Models\\PaymentScheme;
use App\\Models\\Tariff;

class AdminKeuanganController extends Controller
{
    // Toggle opsi cicilan deposit (Default OFF, diaktifkan Admin)
    public function toggleDepositInstallment(Request $request, int $schemeId)
    {
        $request->validate([
            'allow_deposit_installment' => 'required|boolean',
        ]);

        $scheme = PaymentScheme::findOrFail($schemeId);
        $scheme->update([
            'allow_deposit_installment' => $request->boolean('allow_deposit_installment')
        ]);

        return back()->with('success', "Kebijakan cicilan deposit untuk {$scheme->target} berhasil diubah.");
    }

    // Verifikasi Pembayaran Invoice
    public function verifyInvoice(Request $request, string $invoiceId)
    {
        $invoice = Invoice::where('invoice_id', $invoiceId)->firstOrFail();
        $invoice->update([
            'status' => 'PAID',
            'paid_at' => now(),
            'verified_by' => $request->user()->id,
        ]);

        return back()->with('success', "Invoice {$invoiceId} berhasil diverifikasi LUNAS.");
    }
}

// ==============================================================
// 3. app/Http/Controllers/Maintenance/MaintenanceTicketController.php
// ==============================================================
namespace App\\Http\\Controllers\\Maintenance;

use App\\Http\\Controllers\\Controller;
use Illuminate\\Http\\Request;
use App\\Models\\MaintenanceTicket;
use Illuminate\\Support\\Str;

class MaintenanceTicketController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'category' => 'required|in:plumbing,electrical,furniture,hvac_fan,doors_windows,civil_structure,cleaning_waste,other',
            'urgency' => 'required|in:low,medium,high,emergency',
            'priority' => 'required|in:Low,Medium,High', // Form selector value!
            'description' => 'required|string|min:10',
            'location_building' => 'required|string',
            'location_room' => 'required|string',
            'photo' => 'nullable|image|max:5120', // Max 5MB
        ]);

        $photoPath = null;
        if ($request->hasFile('photo')) {
            $photoPath = $request->file('photo')->store('maintenance_evidence', 'public');
        }

        $ticket = MaintenanceTicket::create([
            'ticket_code' => 'TKT-' . date('Y') . '-' . strtoupper(Str::random(5)),
            'user_id' => $request->user()->id,
            'reporter_nim' => $request->user()->nim_noreg,
            'reporter_name' => $request->user()->nama,
            'reporter_phone' => $request->user()->no_hp_wa,
            'location_building' => $validated['location_building'],
            'location_floor' => 'Lantai 1',
            'location_room' => $validated['location_room'],
            'category' => $validated['category'],
            'urgency' => $validated['urgency'],
            'priority' => $validated['priority'],
            'title' => $validated['title'],
            'description' => $validated['description'],
            'photo_path' => $photoPath,
            'status' => 'SUBMITTED',
        ]);

        return back()->with('success', "Tiket laporan {$ticket->ticket_code} dengan Prioritas [{$ticket->priority}] berhasil dibuat.");
    }
}
`;

  const seedersCode = `<?php

namespace Database\\Seeders;

use Illuminate\\Database\\Seeder;
use App\\Models\\User;
use App\\Models\\PaymentScheme;
use App\\Models\\Tariff;
use App\\Models\\Room;
use Illuminate\\Support\\Facades\\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed initial production baseline for SI-GABUNG 54.
     * Command: php artisan db:seed
     */
    public function run(): void
    {
        // 1. PAYMENT SCHEMES (DEFAULT POLICY: allow_deposit_installment = FALSE)
        $schemes = [
            ['target' => 'KIP', 'max_installments' => 3, 'installment_multiplier' => 1.5, 'allow_deposit_installment' => false],
            ['target' => 'REGULER', 'max_installments' => 1, 'installment_multiplier' => 1.0, 'allow_deposit_installment' => false],
            ['target' => 'INTERNAL', 'max_installments' => 6, 'installment_multiplier' => 1.2, 'allow_deposit_installment' => false],
            ['target' => 'EXTERNAL', 'max_installments' => 1, 'installment_multiplier' => 1.0, 'allow_deposit_installment' => false],
            ['target' => 'SCHOLARSHIP', 'max_installments' => 3, 'installment_multiplier' => 1.5, 'allow_deposit_installment' => false],
        ];

        foreach ($schemes as $scheme) {
            PaymentScheme::updateOrCreate(['target' => $scheme['target']], $scheme);
        }

        // 2. MASTER TARIFFS
        $tariffs = [
            ['name' => 'Sewa Kamar Standar (Per Bulan)', 'amount' => 500000, 'category' => 'SEWA', 'target' => 'ALL'],
            ['name' => 'Deposit Jaminan (Non-KIP)', 'amount' => 1000000, 'category' => 'DEPOSIT', 'target' => 'REGULER'],
            ['name' => 'Deposit Jaminan KIP (Lunas 1x)', 'amount' => 500000, 'category' => 'DEPOSIT', 'target' => 'KIP'],
            ['name' => 'Deposit Jaminan KIP (Dicicil 1,5x)', 'amount' => 750000, 'category' => 'DEPOSIT', 'target' => 'KIP'],
            ['name' => 'Biaya Administrasi (Non-KIP)', 'amount' => 100000, 'category' => 'PERLENGKAPAN', 'target' => 'REGULER'],
            ['name' => 'Biaya Administrasi (KIP)', 'amount' => 100000, 'category' => 'PERLENGKAPAN', 'target' => 'KIP'],
            ['name' => 'Biaya Admin Cicilan 2x (Deposit KIP)', 'amount' => 125000, 'category' => 'CICILAN', 'target' => 'KIP'],
            ['name' => 'Biaya Admin Cicilan 3x (Deposit KIP)', 'amount' => 250000, 'category' => 'CICILAN', 'target' => 'KIP'],
        ];

        foreach ($tariffs as $tariff) {
            Tariff::updateOrCreate(['name' => $tariff['name']], $tariff);
        }

        // 3. MASTER ROOMS (Gedung Enggang & Gedung Hiu)
        Room::updateOrCreate(['room_code' => 'RM-A101'], [
            'gedung' => 'Gedung A (Enggang Utara)',
            'lantai' => 1,
            'nomor_kamar' => '101',
            'kapasitas' => 2,
            'terisi' => 1,
            'peruntukan_gender' => 'Laki-laki',
            'fasilitas' => json_encode(['AC', 'Kamar Mandi Dalam', 'Meja Belajar', 'Lemari']),
        ]);

        Room::updateOrCreate(['room_code' => 'RM-B204'], [
            'gedung' => 'Gedung B (Hiu UBT)',
            'lantai' => 2,
            'nomor_kamar' => '204',
            'kapasitas' => 2,
            'terisi' => 0,
            'peruntukan_gender' => 'Laki-laki',
            'fasilitas' => json_encode(['Kipas Angin', 'Kamar Mandi Luar', 'Meja Belajar', 'Lemari']),
        ]);

        // 4. DEMO USERS
        User::updateOrCreate(['nim_noreg' => 'PMB2026-08942'], [
            'nama' => 'Maximilian Wimin Winata',
            'email' => 'mahasiswa@ubtsu.ac.id',
            'no_hp_wa' => '081234567890',
            'password' => Hash::make('password123'),
            'role' => 'maba',
            'kategori_mahasiswa' => 'REGULER',
            'is_kip_student' => false,
        ]);

        User::updateOrCreate(['nim_noreg' => '2240101004'], [
            'nama' => 'Ahmad Raihan',
            'email' => 'ahmad.raihan@ubtsu.ac.id',
            'no_hp_wa' => '081254332190',
            'password' => Hash::make('password123'),
            'role' => 'eksisting',
            'kategori_mahasiswa' => 'REGULER',
        ]);

        User::updateOrCreate(['nim_noreg' => 'ADM-KEU-01'], [
            'nama' => 'Staf Keuangan Asrama',
            'email' => 'keuangan.asrama@ubtsu.ac.id',
            'no_hp_wa' => '081299988811',
            'password' => Hash::make('admin123'),
            'role' => 'admin_keuangan',
        ]);
    }
}
`;

  const kycStorageCode = `<?php

namespace App\\Services;

use Illuminate\\Http\\UploadedFile;
use Illuminate\\Support\\Facades\\Storage;
use Illuminate\\Support\\Facades\\URL;
use App\\Models\\User;
use App\\Models\\EkycRecord;
use App\\Models\\KycAuditLog;
use Carbon\\Carbon;

/**
 * =========================================================================
 * KYC STORAGE MANAGEMENT SERVICE (COMPLIANT WITH RULE[AGENTS_md])
 * =========================================================================
 * 1. Versioning over Overwriting: NEVER overwrite old KTP/Selfie files!
 * 2. Security: Private Buckets & Short-Lived Signed URLs.
 * 3. Garbage Collection: Prune orphaned/superseded files after 30-60 days.
 * =========================================================================
 */
class KycStorageService
{
    protected string $disk = 'private_kyc'; // Configured in config/filesystems.php

    /**
     * Store new KYC files with strict timestamp & versioning naming.
     */
    public function storeKycFiles(User $user, UploadedFile $ktpFile, UploadedFile $selfieFile, array $correctedFields = []): EkycRecord
    {
        $timestamp = now()->timestamp;
        
        // 1. Hitung versi berikutnya untuk menjamin audit trail tidak rusak
        $latestRecord = EkycRecord::where('user_id', $user->id)->latest('version')->first();
        $nextVersion = $latestRecord ? ($latestRecord->version + 1) : 1;

        // Nonaktifkan status aktif versi lama
        if ($latestRecord) {
            $latestRecord->update(['is_active_version' => false]);
        }

        // 2. Beri nama unik: ktp_{nim}_v{version}_{timestamp}.{ext}
        $ktpFilename = sprintf('ktp_%s_v%d_%d.%s', $user->nim_noreg, $nextVersion, $timestamp, $ktpFile->getClientOriginalExtension());
        $selfieFilename = sprintf('selfie_%s_v%d_%d.%s', $user->nim_noreg, $nextVersion, $timestamp, $selfieFile->getClientOriginalExtension());

        // Simpan ke Private Disk (Storage::disk('private_kyc'))
        $ktpPath = $ktpFile->storeAs("kyc/{$user->nim_noreg}", $ktpFilename, $this->disk);
        $selfiePath = $selfieFile->storeAs("kyc/{$user->nim_noreg}", $selfieFilename, $this->disk);

        // 3. Catat di tabel ekyc_records
        $record = EkycRecord::create([
            'user_id' => $user->id,
            'version' => $nextVersion,
            'ktp_file_path' => $ktpPath,
            'selfie_file_path' => $selfiePath,
            'status' => 'PENDING',
            'is_active_version' => true,
        ]);

        // 4. Catat ke KYC Audit Log
        KycAuditLog::create([
            'user_id' => $user->id,
            'actor' => 'User',
            'action' => $nextVersion === 1 ? 'KYC_INITIAL_SUBMISSION' : 'KYC_CORRECTION_SUBMISSION',
            'diff_payload' => [
                'version' => $nextVersion,
                'changed_fields' => $correctedFields,
                'ktp_path' => $ktpPath,
                'selfie_path' => $selfiePath,
            ],
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);

        return $record;
    }

    /**
     * Generate short-lived Signed URL (15 Minutes) to preview private KYC image.
     */
    public function getTemporaryViewUrl(EkycRecord $record, string $type = 'ktp'): string
    {
        return URL::temporarySignedRoute(
            'admin.kyc.view_secure_file',
            now()->addMinutes(config('app.kyc_signed_ttl', 15)),
            ['recordId' => $record->id, 'type' => $type]
        );
    }

    /**
     * Garbage Collection: Hapus file usang/orphaned yang berusia > 60 hari.
     * Dijalankan berkala melalui Laravel Console Command (php artisan kyc:prune-orphans).
     */
    public function pruneOrphanedVersions(): int
    {
        $cutoffDate = Carbon::now()->subDays(60);
        $prunedCount = 0;

        // Ambil versi lampau yang BUKAN versi aktif dan berusia > 60 hari
        $oldRecords = EkycRecord::where('is_active_version', false)
            ->where('created_at', '<', $cutoffDate)
            ->get();

        foreach ($oldRecords as $old) {
            if (Storage::disk($this->disk)->exists($old->ktp_file_path)) {
                Storage::disk($this->disk)->delete($old->ktp_file_path);
            }
            if (Storage::disk($this->disk)->exists($old->selfie_file_path)) {
                Storage::disk($this->disk)->delete($old->selfie_file_path);
            }
            $old->delete();
            $prunedCount++;
        }

        return $prunedCount;
    }
}
`;

  return (
    <div id="laravel-blueprint-root" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-red-950 via-slate-900 to-indigo-950 border border-red-500/40 rounded-3xl p-6 lg:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-red-500/20 text-red-300 text-xs font-mono px-3 py-1 rounded-lg font-bold uppercase tracking-wider border border-red-500/40 flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5" />
                LARAGON / LARAVEL ECOSYSTEM BLUEPRINT
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 text-xs font-mono px-3 py-1 rounded-lg font-semibold border border-emerald-500/40 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Inertia.js + React Turnkey Ready
              </span>
              <span className="bg-amber-500/20 text-amber-300 text-xs font-mono px-3 py-1 rounded-lg font-semibold border border-amber-500/40 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                KYC Private Storage Compliant
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Blueprint Arsitektur & Migrasi Lingkungan Laravel (Laragon)
            </h2>
            <p className="text-slate-300 text-sm max-w-3xl leading-relaxed">
              Seluruh rancangan data, logika bisnis, dan komponen UI siap dipindahkan ke habitat Laravel. Termasuk
              <span className="text-teal-400 font-semibold"> Opsi Cicilan Deposit (Default OFF & Switch Admin)</span>,
              <span className="text-amber-400 font-semibold"> Tiket Maintenance dengan Priority Selector & Color-Coding</span>,
              <span className="text-blue-400 font-semibold"> Manajemen KYC Versioning & Signed URL</span>, serta
              <span className="text-purple-400 font-semibold"> Mesin CRON SOP Penegakan Toleransi 5+5 Hari & Pemotongan Deposit</span>.
            </p>
          </div>

          <div className="flex flex-col items-start lg:items-end text-xs font-mono text-slate-300 space-y-1.5 bg-slate-950/60 p-4 rounded-2xl border border-slate-800 shadow-inner">
            <span className="text-emerald-400 font-bold">Stack: Laravel 11/12 + Inertia + React 18</span>
            <span>PHP: 8.2 / 8.3 & MySQL 8.0</span>
            <span className="text-red-400 font-semibold">Path: C:\laragon\www\asrama-ubt</span>
            <span className="text-slate-500 text-[10px]">Single Source of Truth: Yayasan Gleni</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto text-xs sm:text-sm">
        <button
          onClick={() => setActiveTab('erd')}
          className={`px-4 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'erd'
              ? 'bg-red-600 text-white shadow-lg ring-1 ring-red-400'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
          }`}
        >
          <Network className="w-4 h-4" />
          <span>Interactive ERD</span>
        </button>

        <button
          onClick={() => setActiveTab('migrations')}
          className={`px-4 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'migrations'
              ? 'bg-red-600 text-white shadow-lg ring-1 ring-red-400'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Migrations (MySQL)</span>
        </button>

        <button
          onClick={() => setActiveTab('models')}
          className={`px-4 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'models'
              ? 'bg-red-600 text-white shadow-lg ring-1 ring-red-400'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
          }`}
        >
          <FolderTree className="w-4 h-4" />
          <span>Eloquent Models</span>
        </button>

        <button
          onClick={() => setActiveTab('controllers')}
          className={`px-4 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'controllers'
              ? 'bg-red-600 text-white shadow-lg ring-1 ring-red-400'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
          }`}
        >
          <Server className="w-4 h-4" />
          <span>Inertia Controllers</span>
        </button>

        <button
          onClick={() => setActiveTab('seeders')}
          className={`px-4 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'seeders'
              ? 'bg-red-600 text-white shadow-lg ring-1 ring-red-400'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Database Seeders</span>
        </button>

        <button
          onClick={() => setActiveTab('kyc_storage')}
          className={`px-4 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'kyc_storage'
              ? 'bg-amber-600 text-white shadow-lg ring-1 ring-amber-400'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
          }`}
        >
          <Lock className="w-4 h-4 text-amber-400" />
          <span>KYC Storage & Signed URLs</span>
        </button>

        <button
          onClick={() => setActiveTab('env')}
          className={`px-4 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'env'
              ? 'bg-red-600 text-white shadow-lg ring-1 ring-red-400'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>Konfigurasi .env</span>
        </button>

        <button
          onClick={() => setActiveTab('cron')}
          className={`px-4 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'cron'
              ? 'bg-red-600 text-white shadow-lg ring-1 ring-red-400'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>CRON SOP Engine</span>
        </button>
      </div>

      {/* Code Display Area */}
      <div className="space-y-4">
        {activeTab === 'erd' && (
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl text-xs text-slate-300 flex items-center justify-between">
              <span className="font-semibold text-teal-300">
                Peta Relasi Database: Pemisahan Staging (Portal Pendaftaran) dan Master Admin Laravel.
              </span>
              <span className="text-slate-500 font-mono text-[11px]">D3.js Force Directed Layout</span>
            </div>
            <ERDDiagram />
          </div>
        )}

        {activeTab === 'migrations' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between bg-slate-900 px-4 py-3 rounded-xl border border-slate-800 text-xs">
              <div className="flex items-center gap-2 text-slate-300 font-mono">
                <FileCode className="w-4 h-4 text-red-400" />
                <span>database/migrations/2026_08_05_000001_create_asrama_ubt_tables.php</span>
              </div>
              <button
                onClick={() => handleCopy(migrationCode, 'migration')}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1.5 text-xs font-medium transition-colors border border-slate-700"
              >
                {copiedKey === 'migration' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-bold">Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin Migration</span>
                  </>
                )}
              </button>
            </div>
            <pre className="bg-slate-950 p-5 rounded-2xl border border-slate-800 text-slate-300 text-xs font-mono overflow-x-auto leading-relaxed max-h-[600px]">
              <code>{migrationCode}</code>
            </pre>
          </div>
        )}

        {activeTab === 'models' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between bg-slate-900 px-4 py-3 rounded-xl border border-slate-800 text-xs">
              <div className="flex items-center gap-2 text-slate-300 font-mono">
                <FolderTree className="w-4 h-4 text-blue-400" />
                <span>app/Models/ (PaymentScheme, MaintenanceTicket, Invoice, User)</span>
              </div>
              <button
                onClick={() => handleCopy(modelsCode, 'models')}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1.5 text-xs font-medium transition-colors border border-slate-700"
              >
                {copiedKey === 'models' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-bold">Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin Models</span>
                  </>
                )}
              </button>
            </div>
            <pre className="bg-slate-950 p-5 rounded-2xl border border-slate-800 text-slate-300 text-xs font-mono overflow-x-auto leading-relaxed max-h-[600px]">
              <code>{modelsCode}</code>
            </pre>
          </div>
        )}

        {activeTab === 'controllers' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between bg-slate-900 px-4 py-3 rounded-xl border border-slate-800 text-xs">
              <div className="flex items-center gap-2 text-slate-300 font-mono">
                <Server className="w-4 h-4 text-purple-400" />
                <span>app/Http/Controllers/ (MabaDashboard, AdminKeuangan, MaintenanceTicket)</span>
              </div>
              <button
                onClick={() => handleCopy(controllersCode, 'controllers')}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1.5 text-xs font-medium transition-colors border border-slate-700"
              >
                {copiedKey === 'controllers' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-bold">Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin Controllers</span>
                  </>
                )}
              </button>
            </div>
            <pre className="bg-slate-950 p-5 rounded-2xl border border-slate-800 text-slate-300 text-xs font-mono overflow-x-auto leading-relaxed max-h-[600px]">
              <code>{controllersCode}</code>
            </pre>
          </div>
        )}

        {activeTab === 'seeders' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between bg-slate-900 px-4 py-3 rounded-xl border border-slate-800 text-xs">
              <div className="flex items-center gap-2 text-slate-300 font-mono">
                <FileSpreadsheet className="w-4 h-4 text-teal-400" />
                <span>database/seeders/DatabaseSeeder.php</span>
              </div>
              <button
                onClick={() => handleCopy(seedersCode, 'seeders')}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1.5 text-xs font-medium transition-colors border border-slate-700"
              >
                {copiedKey === 'seeders' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-bold">Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin Seeder</span>
                  </>
                )}
              </button>
            </div>
            <pre className="bg-slate-950 p-5 rounded-2xl border border-slate-800 text-slate-300 text-xs font-mono overflow-x-auto leading-relaxed max-h-[600px]">
              <code>{seedersCode}</code>
            </pre>
          </div>
        )}

        {activeTab === 'kyc_storage' && (
          <div className="space-y-4">
            <div className="bg-amber-950/40 border border-amber-500/30 p-4 rounded-2xl text-xs space-y-2">
              <div className="flex items-center gap-2 text-amber-300 font-bold">
                <ShieldAlert className="w-4 h-4" />
                Instruksi Keamanan KYC (KTP & Selfie) Sesuai Pedoman Arsitektur:
              </div>
              <ul className="list-disc list-inside text-slate-300 space-y-1 pl-1">
                <li><strong className="text-amber-200">Versioning over Overwriting:</strong> Jangan pernah me-replace/overwrite file KTP lama saat koreksi! Berikan nama versi unik (UUID/Timestamp) agar riwayat log Audit Trail tidak rusak.</li>
                <li><strong className="text-amber-200">Private Storage & Signed URLs:</strong> File KTP tersimpan di disk private, diakses hanya lewat Temporary Signed URL (15 menit).</li>
                <li><strong className="text-amber-200">Garbage Collection:</strong> File versi lama yang sudah tidak aktif otomatis dihapus setelah 60 hari untuk menghemat penyimpanan.</li>
              </ul>
            </div>

            <div className="flex items-center justify-between bg-slate-900 px-4 py-3 rounded-xl border border-slate-800 text-xs">
              <div className="flex items-center gap-2 text-slate-300 font-mono">
                <Lock className="w-4 h-4 text-amber-400" />
                <span>app/Services/KycStorageService.php</span>
              </div>
              <button
                onClick={() => handleCopy(kycStorageCode, 'kyc')}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1.5 text-xs font-medium transition-colors border border-slate-700"
              >
                {copiedKey === 'kyc' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-bold">Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin KycStorageService</span>
                  </>
                )}
              </button>
            </div>
            <pre className="bg-slate-950 p-5 rounded-2xl border border-slate-800 text-slate-300 text-xs font-mono overflow-x-auto leading-relaxed max-h-[600px]">
              <code>{kycStorageCode}</code>
            </pre>
          </div>
        )}

        {activeTab === 'env' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between bg-slate-900 px-4 py-3 rounded-xl border border-slate-800 text-xs">
              <div className="flex items-center gap-2 text-slate-300 font-mono">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span>.env (Laragon Default Root Environment)</span>
              </div>
              <button
                onClick={() => handleCopy(envCode, 'env')}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1.5 text-xs font-medium transition-colors border border-slate-700"
              >
                {copiedKey === 'env' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-bold">Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin .env Config</span>
                  </>
                )}
              </button>
            </div>
            <pre className="bg-slate-950 p-5 rounded-2xl border border-slate-800 text-emerald-400 text-xs font-mono overflow-x-auto leading-relaxed">
              <code>{envCode}</code>
            </pre>
          </div>
        )}

        {activeTab === 'cron' && (
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl text-xs space-y-2 text-slate-300">
              <div className="font-bold text-teal-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-teal-400" />
                Aturan Eksekusi CRON SOP (Kebijakan Toleransi 5+5 Hari &amp; Pemotongan Deposit):
              </div>
              <p>
                Dijalankan otomatis oleh Laravel Scheduler setiap malam (pukul 22.00 WIB) untuk mengecek invoice sewa (Contoh kasus: Tanggal Jatuh Tempo 1 September):
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-1 font-mono text-[11px]">
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-blue-400 font-bold">Hari 1 - 5 (s/d 6 Sept)</span><br />
                  Masa toleransi pembayaran sewa mandiri. Denda Rp 0 &amp; deposit utuh.
                </div>
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-amber-400 font-bold">Hari 6 - 10 (6 s/d 11 Sept)</span><br />
                  Deposit otomatis dipakai bayar sewa + tambahan toleransi 5 hari untuk top-up deposit.
                </div>
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-rose-400 font-bold">Hari 11+ (Lewat 11 Sept)</span><br />
                  Tidak top-up deposit: Dikenakan denda Rp 500.000 &amp; Kontrak Tinggal Berakhir.
                </div>
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-slate-300 font-mono text-xs">
              <div className="text-emerald-400 font-bold mb-2"># Jalankan scheduler di Laragon:</div>
              <code>php artisan schedule:work</code>
            </div>
          </div>
        )}
      </div>

      {/* Laragon Command Execution Guide */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 lg:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-red-400" />
            Langkah Cepat Setup & Lanjut Koding di Habitat Laravel (Laragon)
          </h3>
          <span className="text-xs font-mono text-slate-400 bg-slate-950 px-3 py-1 rounded-lg border border-slate-800">
            5 Menit Siap Koding
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
            <div className="font-bold text-teal-400 flex items-center gap-1.5">
              <span>1. Inisialisasi Project</span>
            </div>
            <p className="text-slate-400 leading-relaxed font-mono">
              cd C:\laragon\www<br />
              composer create-project laravel/laravel asrama-ubt<br />
              cd asrama-ubt
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
            <div className="font-bold text-blue-400 flex items-center gap-1.5">
              <span>2. Breeze Inertia React</span>
            </div>
            <p className="text-slate-400 leading-relaxed font-mono">
              composer require laravel/breeze --dev<br />
              php artisan breeze:install react<br />
              npm install && npm run build
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
            <div className="font-bold text-emerald-400 flex items-center gap-1.5">
              <span>3. Salin Komponen React</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Salin folder <code className="text-amber-300">src/components</code> dan <code className="text-amber-300">src/types</code> dari proyek ini ke <code className="text-teal-300">resources/js/</code> di Laravel.
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
            <div className="font-bold text-purple-400 flex items-center gap-1.5">
              <span>4. Database & Run</span>
            </div>
            <p className="text-slate-400 leading-relaxed font-mono">
              php artisan migrate:fresh --seed<br />
              php artisan serve<br />
              npm run dev
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
