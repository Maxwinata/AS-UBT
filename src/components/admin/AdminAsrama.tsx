import React, { useState } from 'react';
import { Building2, ShieldCheck, Lock, Key, CheckCircle2, AlertTriangle, LogOut, Search, Calculator, Code2, Database, Terminal, Settings, FileEdit, Check, X, Send, BellRing, Clock, RefreshCcw, ShieldAlert, FileWarning, ArrowUpRight } from 'lucide-react';
import { toast } from 'sonner';
import { RoomPlot, CheckoutInspection, TariffItem, PaymentScheme, ModificationLog, BillingInvoice, DelinquencyRecord } from '../../types/asrama';
import { SAMPLE_DELINQUENCY } from '../../data/initialData';
import { LaravelBlueprint } from '../architecture/LaravelBlueprint';
import { SqlImporter } from '../architecture/SqlImporter';
import { SystemAuditLogs } from './SystemAuditLogs';
import { SsoMigrationLogs } from './SsoMigrationLogs';
import { CorrectionRequestsAdmin } from './CorrectionRequestsAdmin';
import { AdminAnalyticsDashboard } from './AdminAnalyticsDashboard';
import { BulkKycApproval } from './BulkKycApproval';
import { LembarRatifikasiF22 } from './LembarRatifikasiF22';
// @ts-ignore
import { TariffManager } from './TariffManager';
import { ActivityLog } from './ActivityLog';
import { NotificationManager } from './NotificationManager';
import { Activity, PieChart, History } from 'lucide-react';

interface AdminAsramaProps {
  invoices?: BillingInvoice[];
  modificationLogs?: ModificationLog[];
  tariffs?: TariffItem[];
  setTariffs?: (tariffs: TariffItem[]) => void;
  paymentSchemes?: PaymentScheme[];
  setPaymentSchemes?: (schemes: PaymentScheme[]) => void;
  rooms: RoomPlot[];
  onPlotRoom?: (roomId: string, nim: string) => void;
  initialTab?: 'operasional' | 'tunggakan' | 'analytics' | 'master_tarif' | 'audit_logs' | 'laravel' | 'sql_importer' | 'correction_requests' | 'kyc_approval';
}

export const AdminAsrama: React.FC<AdminAsramaProps> = ({ rooms, modificationLogs = [], invoices = [], initialTab = 'operasional', tariffs = [], setTariffs = () => {}, paymentSchemes = [], setPaymentSchemes = () => {} }) => {
  const [activeTab, setActiveTab] = useState<'operasional' | 'tunggakan' | 'analytics' | 'master_tarif' | 'audit_logs' | 'activity_log' | 'notifications' | 'sso_migration' | 'laravel' | 'sql_importer' | 'correction_requests' | 'kyc_approval' | 'cetak_f22'>(() => {
    const saved = localStorage.getItem('adminAsramaActiveTab');
    if (saved === 'operasional' || saved === 'tunggakan' || saved === 'analytics' || saved === 'master_tarif' || saved === 'audit_logs' || saved === 'sso_migration' || saved === 'laravel' || saved === 'sql_importer' || saved === 'correction_requests' || saved === 'kyc_approval' || saved === 'cetak_f22') {
      return saved as any;
    }
    return initialTab;
  });

  React.useEffect(() => {
    localStorage.setItem('adminAsramaActiveTab', activeTab);
  }, [activeTab]);

  // e-KYC Audit State
  const [selectedDocNim, setSelectedDocNim] = useState('PMB2026-08942');

  // Check-out Damage Inspection State (Phase C)
  const [damageFine, setDamageFine] = useState<number>(0);
  const [damageNotes, setDamageNotes] = useState<string>('');
  const [isNotifying, setIsNotifying] = useState(false);

  const handleNotifyAll = () => {
    setIsNotifying(true);
    toast.info('Initiating notification queue...', { description: 'Connecting to messaging service (WhatsApp/Email)...' });
    setTimeout(() => {
      setIsNotifying(false);
      toast.success('Broadcast Sent!', { description: 'Successfully sent automated notifications to all registered Maba.' });
    }, 2500);
  };
  const [inspectionResult, setInspectionResult] = useState<CheckoutInspection | null>(null);

  const initialDeposit = 750000;
  const netRefund = Math.max(0, initialDeposit - damageFine);

  const handleProcessInspection = (e: React.FormEvent) => {
    e.preventDefault();
    setInspectionResult({
      nim: '2240101004',
      nama: 'Ahmad Raihan',
      kamar: 'Gedung A — 101',
      initialDeposit,
      damageFine: damageFine,
      damageNotes: damageNotes || 'Tidak ada kerusakan (Fasilitas kamar dalam kondisi baik)',
      netRefund: netRefund,
      status: 'APPROVED', inspectionId: 'ins-' + Date.now(), inspectedAt: new Date().toISOString(),
    });
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
  };

  // Phase D Delinquency State & Handlers (Kebijakan Toleransi 5+5 Hari & Pemotongan Deposit)
  const [delinquencies, setDelinquencies] = useState<DelinquencyRecord[]>(SAMPLE_DELINQUENCY);

  const handleSendWaReminder = (record: DelinquencyRecord) => {
    toast.success(`Pengingat WhatsApp Terkirim!`, {
      description: `Pesan pengingat masa toleransi sewa s/d ${record.gracePeriodSewaEnd || '6 September'} berhasil dikirim ke nomor WhatsApp ${record.nama}.`
    });
  };

  const handleAutoDebetDeposit = (record: DelinquencyRecord) => {
    setDelinquencies(prev => prev.map(item => item.nim === record.nim ? {
      ...item,
      stage: 'DEPOSIT_DIPAKAI_GRACE_TOPUP',
      depositDeductedForRent: true,
      depositDeductedAmount: 500000,
      notes: 'Uang deposit Rp 500.000 dialihkan untuk pelunasan sewa. Berada dalam masa toleransi 5 hari s/d 11 September untuk pemenuhan deposit.'
    } : item));
    toast.success(`Auto-Debet Deposit Berhasil Diproses!`, {
      description: `Saldo deposit Rp 500.000 milik ${record.nama} telah didebet untuk melunasi sewa. Batas waktu top-up deposit diberikan s/d 11 September.`
    });
  };

  const handleIssueTerminationFine = (record: DelinquencyRecord) => {
    setDelinquencies(prev => prev.map(item => item.nim === record.nim ? {
      ...item,
      stage: 'DEFAULT_KONTRAK_BERAKHIR',
      fineAmount: 500000,
      contractTerminated: true,
      evictionIssued: true,
      notes: 'Lewat batas toleransi 11 September tanpa pemenuhan setoran deposit: Dikenakan denda Rp 500.000 dan Kontrak Tinggal Berakhir (Wajib Pengosongan Kamar).'
    } : item));
    toast.error(`Surat Denda & Pengosongan Kamar Diterbitkan!`, {
      description: `Denda Rp 500.000 ditetapkan untuk ${record.nama} dan Surat Pemutusan Kontrak Hunian resmi diterbitkan.`
    });
  };

  return (
    <div id="admin-asrama-root" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header & Internal Dev Tools Sub-Navigation */}
      <div className="bg-gradient-to-r from-indigo-800 via-teal-900 to-slate-900 border border-indigo-700 rounded-2xl p-6 text-white shadow-md space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="bg-indigo-700/80 text-indigo-100 text-xs px-2.5 py-0.5 rounded-full font-mono font-bold border border-indigo-400/40">
                ADMINISTRATOR ASRAMA
              </span>
              <span className="text-xs text-slate-200">• Portal SI-GABUNG 54 - Admin & Utility Development</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight mt-1">
              {activeTab === 'operasional' && 'Room Plotting & Inspeksi Check-Out (Fase C)'}
              {activeTab === 'tunggakan' && 'Penegakan Tunggakan Sewa & Sanksi 5+5 Hari (Regulasi Gleni)'}
              {activeTab === 'analytics' && 'Dashboard Analitik Terpusat (Okupansi & Tagihan)'}
              {activeTab === 'master_tarif' && 'Tabel Referensi Master Tarif & Cicilan (Read-Only Acuan)'}
              {activeTab === 'audit_logs' && 'System Audit Logs & Monitoring'}
              {activeTab === 'sso_migration' && 'SSO Migration Audit Trail (PMB to NIM)'}
              {activeTab === 'correction_requests' && 'Koreksi Data Mahasiswa (e-KYC & Profil)'}
              {activeTab === 'kyc_approval' && 'Verifikasi Masal e-KYC (Admin & Supervisor)'}
              {activeTab === 'cetak_f22' && 'Cetak Lembar Ratifikasi F-22 (JUKLAK-03)'}
              {activeTab === 'laravel' && 'Laravel Backend Blueprint & Architecture Spec'}
              {activeTab === 'sql_importer' && 'Upload & Migration SQL Web Admin (Database Dev Tool)'}
            </h2>
            <p className="text-xs text-indigo-100 mt-1">
              {activeTab === 'operasional' && 'Sesuai DFD Level 1 (P4 & Fase C): Manajemen kuota kamar, verifikasi e-KYC private storage, dan kalkulasi denda deposit.'}
              {activeTab === 'tunggakan' && 'Sesuai Regulasi Gleni: 5 hari toleransi sewa (Denda Rp 0), auto-debet deposit & toleransi 5 hari top-up (s/d 11 Sept), denda Rp 500.000 & pengakhiran kontrak jika lewat 11 Sept.'}
              {activeTab === 'analytics' && 'Pemantauan indikator kinerja utama (KPI) asrama yang mencakup tingkat okupansi per gedung, distribusi tagihan lunas/cicilan, dan performa hunian.'}
              {activeTab === 'master_tarif' && 'Tabel acuan tarif sewa dan skema cicilan untuk kebutuhan verifikasi lapangan & BASTK. Pengaturan/CRUD tarif dikelola terpusat oleh Admin Keuangan.'}
              {activeTab === 'audit_logs' && 'Memantau perubahan status dan login event secara real-time.'}
              {activeTab === 'sso_migration' && 'Historical transition of student records from PMB-registration to SSO-authenticated NIMs.'}
              {activeTab === 'correction_requests' && 'Membuka kunci form pendaftaran bagi mahasiswa yang mengajukan koreksi data yang salah.'}
              {activeTab === 'kyc_approval' && 'Layar moderasi untuk mengecek kecocokan foto selfie dan KTP pendaftar secara masal, disortir berdasarkan antrean.'}
              {activeTab === 'cetak_f22' && 'Pencetakan Daftar Ratifikasi Kontrak Kolektif untuk efisiensi bea meterai check-in Maba sesuai JUKLAK-03.'}
              {activeTab === 'laravel' && 'Fitur development internal Admin Asrama untuk mengeksplorasi blueprint skema database, migration, dan controller Laravel.'}
              {activeTab === 'sql_importer' && 'Fitur development internal Admin Asrama untuk mengunggah dan menguji skrip DDL/DML SQL migration database Web Admin.'}
            </p>
          </div>
          <div className="flex-shrink-0 mt-4 md:mt-0">
            <button
              onClick={handleNotifyAll}
              disabled={isNotifying}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl font-bold transition-all shadow-md disabled:opacity-70"
            >
              <BellRing className={`w-4 h-4 ${isNotifying ? 'animate-bounce' : ''}`} />
              <span>{isNotifying ? 'Mengirim Broadcast...' : 'Notify All Maba (WA/Email)'}</span>
            </button>
          </div>
        </div>

        {/* Development & Operational Navigation Tabs inside Admin Asrama */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-indigo-700/60 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('tunggakan')}
            className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 ${
              activeTab === 'tunggakan'
                ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold ring-2 ring-amber-300'
                : 'bg-indigo-950/60 text-indigo-200 hover:bg-indigo-900 hover:text-white border border-indigo-700'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span>Tunggakan &amp; Sanksi 5+5 Hari</span>
            <span className="text-[10px] bg-amber-400/20 text-amber-300 px-1.5 py-0.5 rounded font-mono font-bold border border-amber-400/40">
              FASE D
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('cetak_f22')}
            className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 ${
              activeTab === 'cetak_f22'
                ? 'bg-white text-indigo-950 shadow-md font-extrabold'
                : 'bg-indigo-950/60 text-indigo-200 hover:bg-indigo-900 hover:text-white border border-indigo-700'
            }`}
          >
            <FileEdit className="w-4 h-4 text-indigo-600" />
            <span>Cetak F-22 (Meterai Kolektif)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('operasional')}
            className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 ${
              activeTab === 'operasional'
                ? 'bg-white text-indigo-950 shadow-md font-extrabold'
                : 'bg-indigo-950/60 text-indigo-200 hover:bg-indigo-900 hover:text-white border border-indigo-700'
            }`}
          >
            <Building2 className="w-4 h-4 text-indigo-600" />
            <span>Operasional Plotting & Inspeksi</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 ${
              activeTab === 'analytics'
                ? 'bg-white text-indigo-950 shadow-md font-extrabold'
                : 'bg-indigo-950/60 text-indigo-200 hover:bg-indigo-900 hover:text-white border border-indigo-700'
            }`}
          >
            <PieChart className="w-4 h-4 text-indigo-600" />
            <span>Analitik Data Terpusat</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('master_tarif')}
            className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 ${
              activeTab === 'master_tarif'
                ? 'bg-white text-indigo-950 shadow-md font-extrabold ring-2 ring-emerald-400'
                : 'bg-indigo-950/60 text-indigo-200 hover:bg-indigo-900 hover:text-white border border-indigo-700'
            }`}
          >
            <Calculator className="w-4 h-4 text-emerald-400" />
            <span>Master Tarif (Acuan)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('audit_logs')}
            className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 ${
              activeTab === 'audit_logs'
                ? 'bg-white text-indigo-950 shadow-md font-extrabold'
                : 'bg-indigo-950/60 text-indigo-200 hover:bg-indigo-900 hover:text-white border border-indigo-700'
            }`}
          >
            <Activity className="w-4 h-4 text-indigo-600" />
            <span>Audit Logs</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('correction_requests')}
            className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 ${
              activeTab === 'correction_requests'
                ? 'bg-white text-indigo-950 shadow-md font-extrabold'
                : 'bg-indigo-950/60 text-indigo-200 hover:bg-indigo-900 hover:text-white border border-indigo-700'
            }`}
          >
            <FileEdit className="w-4 h-4 text-indigo-600" />
            <span>Koreksi Data</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('kyc_approval')}
            className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 ${
              activeTab === 'kyc_approval'
                ? 'bg-white text-indigo-950 shadow-md font-extrabold'
                : 'bg-indigo-950/60 text-indigo-200 hover:bg-indigo-900 hover:text-white border border-indigo-700'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            <span>Verifikasi Masal e-KYC</span>
          </button>

          
          
          <button
            type="button"
            onClick={() => setActiveTab('notifications')}
            className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 ${
              activeTab === 'notifications'
                ? 'bg-white text-indigo-950 shadow-md font-extrabold'
                : 'bg-indigo-950/60 text-indigo-200 hover:bg-indigo-900 hover:text-white border border-indigo-700'
            }`}
          >
            <BellRing className="w-4 h-4 text-indigo-600" />
            <span>Notifikasi WA</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('activity_log')}
            className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 ${
              activeTab === 'activity_log'
                ? 'bg-white text-indigo-950 shadow-md font-extrabold'
                : 'bg-indigo-950/60 text-indigo-200 hover:bg-indigo-900 hover:text-white border border-indigo-700'
            }`}
          >
            <History className="w-4 h-4 text-indigo-600" />
            <span>Activity Log</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('laravel')}
            className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 ${
              activeTab === 'laravel'
                ? 'bg-red-600 text-white shadow-md ring-2 ring-red-400'
                : 'bg-indigo-950/60 text-indigo-200 hover:bg-indigo-900 hover:text-white border border-indigo-700'
            }`}
          >
            <Code2 className="w-4 h-4 text-red-300" />
            <span>Dev Tool: Laravel Blueprint</span>
            <span className="text-[9px] bg-red-950/80 text-red-200 font-mono px-1.5 py-0.5 rounded border border-red-500/40">
              DEV ONLY
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('sql_importer')}
            className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 ${
              activeTab === 'sql_importer'
                ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-400'
                : 'bg-indigo-950/60 text-indigo-200 hover:bg-indigo-900 hover:text-white border border-indigo-700'
            }`}
          >
            <Database className="w-4 h-4 text-blue-300" />
            <span>Dev Tool: Upload SQL Web Admin</span>
            <span className="text-[9px] bg-blue-950/80 text-blue-200 font-mono px-1.5 py-0.5 rounded border border-blue-500/40">
              DEV ONLY
            </span>
          </button>
        </div>
      </div>

      {/* RENDER CONTENT BASED ON SELECTED ADMIN TAB */}
      {activeTab === 'tunggakan' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Header Policy Summary Card */}
          <div className="bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 border border-amber-800/60 rounded-2xl p-6 text-white shadow-md space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="bg-amber-500/20 text-amber-300 text-xs px-2.5 py-0.5 rounded-full font-mono font-bold border border-amber-500/40">
                    SOP PENEGAKAN TUNGGAKAN SEWA &amp; SANKSINYA
                  </span>
                  <span className="text-xs text-slate-300">• Regulasi Yayasan Gleni</span>
                </div>
                <h3 className="text-xl font-bold mt-1">Kebijakan Toleransi 5+5 Hari &amp; Pemotongan Deposit</h3>
                <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
                  Sistem otomatis menggantikan denda bertingkat lama menjadi alur toleransi 5 hari (bebas denda), pengalihan deposit untuk melunasi sewa + toleransi 5 hari top-up, serta denda Rp 500.000 dan pengakhiran kontrak tinggal jika wanprestasi berlanjut.
                </p>
              </div>
              <div className="text-right shrink-0 bg-white/10 p-3.5 rounded-xl border border-white/15">
                <span className="text-[11px] text-amber-200 block font-mono">Basis Simulasi Kasus:</span>
                <span className="font-bold text-white text-sm">Jatuh Tempo 1 September</span>
              </div>
            </div>

            {/* 3 Phases Infographic */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
              <div className="bg-slate-950/80 p-4 rounded-xl border border-blue-500/40 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-blue-400 flex items-center gap-1.5 font-mono">
                    <Clock className="w-3.5 h-3.5" /> TAHAP 1: TOLERANSI SEWA
                  </span>
                  <span className="bg-blue-900/60 text-blue-200 px-2 py-0.5 rounded text-[10px] font-bold">1 s/d 6 Sept</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Toleransi 5 hari kalender melunasi sewa mandiri. <strong className="text-emerald-400">Denda Rp 0</strong> dan saldo deposit tetap utuh.
                </p>
              </div>

              <div className="bg-slate-950/80 p-4 rounded-xl border border-amber-500/40 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-amber-400 flex items-center gap-1.5 font-mono">
                    <RefreshCcw className="w-3.5 h-3.5" /> TAHAP 2: DEPOSIT &amp; TOP-UP
                  </span>
                  <span className="bg-amber-900/60 text-amber-200 px-2 py-0.5 rounded text-[10px] font-bold">6 s/d 11 Sept</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Lewat 5 hari (6 Sept), <strong>deposit dipakai membayar sewa</strong>. Diberi toleransi 5 hari (s/d 11 Sept) untuk <strong>top-up deposit</strong> (Denda Rp 0).
                </p>
              </div>

              <div className="bg-slate-950/80 p-4 rounded-xl border border-rose-500/40 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-rose-400 flex items-center gap-1.5 font-mono">
                    <AlertTriangle className="w-3.5 h-3.5" /> TAHAP 3: DEFAULT &amp; DENDA
                  </span>
                  <span className="bg-rose-900/60 text-rose-200 px-2 py-0.5 rounded text-[10px] font-bold">Lewat 11 Sept</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Lewat 11 Sept gagal top-up: Dikenakan <strong className="text-rose-400">denda Rp 500.000</strong> beserta <strong className="text-rose-300">Kontrak Tinggal Berakhir</strong> (Wajib Pengosongan Kamar).
                </p>
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">Total Mahasiswa Terdata</span>
              <div className="text-2xl font-black text-slate-900 mt-1">{delinquencies.length}</div>
              <span className="text-[10px] text-slate-400">Monitoring berjalan</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-blue-200 shadow-xs">
              <span className="text-xs text-blue-700 font-medium flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-blue-600" /> Tahap 1: Toleransi Sewa
              </span>
              <div className="text-2xl font-black text-blue-700 mt-1">
                {delinquencies.filter(d => d.stage === 'GRACE_PERIOD_SEWA').length}
              </div>
              <span className="text-[10px] text-emerald-600 font-bold">Bebas Denda (Rp 0)</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-xs">
              <span className="text-xs text-amber-800 font-medium flex items-center gap-1">
                <RefreshCcw className="w-3.5 h-3.5 text-amber-600" /> Tahap 2: Grace Top-Up
              </span>
              <div className="text-2xl font-black text-amber-700 mt-1">
                {delinquencies.filter(d => d.stage === 'DEPOSIT_DIPAKAI_GRACE_TOPUP').length}
              </div>
              <span className="text-[10px] text-amber-600 font-bold">Deposit Dipotong Sewa</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-rose-200 shadow-xs">
              <span className="text-xs text-rose-700 font-medium flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" /> Tahap 3: Kontrak Berakhir
              </span>
              <div className="text-2xl font-black text-rose-700 mt-1">
                {delinquencies.filter(d => d.stage === 'DEFAULT_KONTRAK_BERAKHIR').length}
              </div>
              <span className="text-[10px] text-rose-600 font-bold">Denda Rp 500.000</span>
            </div>
          </div>

          {/* Operational Delinquency Table */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="font-bold text-xs text-slate-800 flex items-center gap-2">
                <FileWarning className="w-4 h-4 text-amber-600" />
                <span>Daftar Penghuni Menunggak &amp; Penegakan Status Sanksi</span>
              </div>
              <span className="text-[11px] font-mono text-slate-500">
                Otomatisasi Cron 22:00 WIB &bull; Aksi Manual Administrator
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-100 text-slate-700 font-mono uppercase text-[10px] font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Mahasiswa</th>
                    <th className="p-3.5">Jatuh Tempo &amp; Overdue</th>
                    <th className="p-3.5">Tahap Penegakan</th>
                    <th className="p-3.5">Status Deposit</th>
                    <th className="p-3.5">Denda</th>
                    <th className="p-3.5 text-right">Aksi Operasional Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {delinquencies.map((item) => (
                    <tr key={item.nim} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900">{item.nama}</div>
                        <div className="text-[11px] font-mono text-slate-500">NIM: {item.nim}</div>
                        <div className="text-[11px] text-teal-800 font-medium">{item.kamar}</div>
                      </td>

                      <td className="p-3.5">
                        <div className="font-mono font-bold text-slate-800">{item.dueDate || '1 September'}</div>
                        <div className="text-[11px] font-mono text-amber-700 font-semibold">
                          Hari ke-{item.daysOverdue} ({item.daysOverdue <= 5 ? 'Dalam Toleransi Sewa' : item.daysOverdue <= 10 ? 'Masa Top-Up Deposit' : 'Lewat Batas Top-Up'})
                        </div>
                      </td>

                      <td className="p-3.5">
                        {item.stage === 'GRACE_PERIOD_SEWA' && (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-300">
                              <Clock className="w-3 h-3 text-blue-600" />
                              Toleransi Sewa (s/d {item.gracePeriodSewaEnd || '6 Sept'})
                            </span>
                            <p className="text-[10px] text-slate-500 max-w-xs">{item.notes}</p>
                          </div>
                        )}

                        {item.stage === 'DEPOSIT_DIPAKAI_GRACE_TOPUP' && (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                              <RefreshCcw className="w-3 h-3 text-amber-600" />
                              Deposit Dipotong (Top-Up s/d {item.gracePeriodTopupEnd || '11 Sept'})
                            </span>
                            <p className="text-[10px] text-amber-900 max-w-xs">{item.notes}</p>
                          </div>
                        )}

                        {item.stage === 'DEFAULT_KONTRAK_BERAKHIR' && (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-900 border border-rose-300">
                              <AlertTriangle className="w-3 h-3 text-rose-600" />
                              KONTRAK TINGGAL BERAKHIR
                            </span>
                            <p className="text-[10px] text-rose-800 font-medium max-w-xs">{item.notes}</p>
                          </div>
                        )}
                      </td>

                      <td className="p-3.5">
                        {item.depositDeductedForRent ? (
                          <div className="font-mono">
                            <span className="text-amber-800 font-bold block">Terpotong Sewa</span>
                            <span className="text-[11px] text-slate-500">Rp 500.000 dialihkan</span>
                          </div>
                        ) : (
                          <div className="font-mono">
                            <span className="text-emerald-700 font-bold block">Utuh (Rp 750.000)</span>
                            <span className="text-[11px] text-slate-500">Belum dipotong</span>
                          </div>
                        )}
                      </td>

                      <td className="p-3.5">
                        {item.fineAmount > 0 ? (
                          <span className="font-mono font-black text-rose-700 text-sm">
                            {formatRupiah(item.fineAmount)}
                          </span>
                        ) : (
                          <span className="font-mono font-bold text-emerald-700 text-xs">
                            Rp 0 (Bebas Denda)
                          </span>
                        )}
                      </td>

                      <td className="p-3.5 text-right">
                        <div className="flex flex-col items-end gap-1.5">
                          {item.stage === 'GRACE_PERIOD_SEWA' && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleSendWaReminder(item)}
                                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                              >
                                <Send className="w-3 h-3" />
                                <span>Kirim Pengingat WA</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleAutoDebetDeposit(item)}
                                className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-[11px] font-semibold transition-all cursor-pointer"
                              >
                                ⚡ Simulasikan Lewat 6 Sept (Auto-Debet)
                              </button>
                            </>
                          )}

                          {item.stage === 'DEPOSIT_DIPAKAI_GRACE_TOPUP' && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleSendWaReminder(item)}
                                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                              >
                                <Send className="w-3 h-3" />
                                <span>Peringatkan Top-Up WA</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleIssueTerminationFine(item)}
                                className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-300 rounded-lg text-[11px] font-semibold transition-all cursor-pointer"
                              >
                                ⚡ Simulasikan Lewat 11 Sept (Denda &amp; Akhiri)
                              </button>
                            </>
                          )}

                          {item.stage === 'DEFAULT_KONTRAK_BERAKHIR' && (
                            <div className="space-y-1 text-right">
                              <span className="inline-block px-2.5 py-1 rounded bg-rose-600 text-white font-mono text-[10px] font-bold">
                                SURAT PENGOSONGAN AKTIF
                              </span>
                              <div className="text-[10px] text-slate-500 font-mono">Denda: Rp 500.000 Terbit</div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* RENDER CONTENT BASED ON SELECTED ADMIN TAB */}
      {activeTab === 'analytics' && (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-xs">
          <AdminAnalyticsDashboard rooms={rooms} />
        </div>
      )}

      {activeTab === 'audit_logs' && (
        <SystemAuditLogs />
      )}

      {activeTab === 'sso_migration' && (
        <SsoMigrationLogs />
      )}


      {activeTab === 'correction_requests' && (
        <CorrectionRequestsAdmin />
      )}
      
      {activeTab === 'kyc_approval' && (
        <div className="animate-in fade-in duration-300">
          <BulkKycApproval />
        </div>
      )}
      {activeTab === 'cetak_f22' && (
        <div className="animate-in fade-in duration-300">
          <LembarRatifikasiF22 rooms={rooms} />
        </div>
      )}

      {activeTab === 'laravel' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-2 shadow-xs">
          <LaravelBlueprint />
        </div>
      )}

      {activeTab === 'sql_importer' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-2 shadow-xs">
          <SqlImporter />
        </div>
      )}

      {activeTab === 'operasional' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* ROOM PLOTTING MATRIX */}
          <div className="lg:col-span-7 space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <Building2 className="w-4 h-4 text-indigo-700" />
                <span>Matriks Plotting Kamar (DFD P4)</span>
              </h3>
              <span className="text-xs text-slate-600 font-mono font-bold">{rooms.length} Kamar Terdaftar</span>
            </div>

            <div className="space-y-3">
              {rooms.map((room) => (
                <div key={room.roomId} className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-2 hover:border-indigo-400 transition-colors">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-bold text-slate-900 text-sm">{room.gedung}</span>
                      <span className="text-[11px] text-slate-500 ml-2 font-mono">Lantai {room.lantai}</span>
                    </div>
                    <span className="font-mono text-indigo-800 font-bold bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded">
                      Kamar {room.nomorKamar}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-[11px] text-slate-600">
                    <span>Kapasitas: {room.terisi}/{room.kapasitas} Penghuni</span>
                    <span className="text-emerald-700 font-bold">
                      {room.kapasitas - room.terisi > 0 ? `${room.kapasitas - room.terisi} Slot Tersedia` : 'Penuh'}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1 pt-1">
                    {room.fasilitas.map((f, i) => (
                      <span key={i} className="bg-white text-slate-700 text-[10px] px-2 py-0.5 rounded border border-slate-200 font-medium">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* E-KYC AUDIT & CHECKOUT DAMAGE INSPECTION (FASE C) */}
        <div className="lg:col-span-5 space-y-6">

          {/* PRIVATE STORAGE e-KYC INSPECTOR */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-200 pb-3">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">Auditor e-KYC (Private File Storage)</h3>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-3">
              <div className="flex items-center justify-between text-slate-700 font-medium">
                <span>Dokumen Mahasiswa:</span>
                <span className="font-mono font-bold text-teal-800">PMB2026-08942</span>
              </div>

              <div className="bg-emerald-50 border border-emerald-300 p-3 rounded-lg text-emerald-900 text-[11px] flex items-center space-x-2 font-medium">
                <Lock className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Private Encrypted Disk: /private_storage/kyc/ktp_08942.enc (Verified)</span>
              </div>
            </div>
          </div>

          {/* INSPEKSI KAMAR & KALKULASI DENDA REFUND DEPOSIT (FASE C) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-200 pb-3">
              <Calculator className="w-4 h-4 text-indigo-700" />
              <h3 className="text-sm font-bold text-slate-900">Kalkulator Denda Inspeksi Check-Out (Fase C)</h3>
            </div>

            <form onSubmit={handleProcessInspection} className="space-y-4 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 font-mono text-slate-700 font-medium">
                Deposit Terikat Maba: <span className="font-bold text-emerald-700">Rp 750.000</span>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Nominal Denda Kerusakan Fisik (Rp):
                </label>
                <input
                  type="number"
                  min={0}
                  max={750000}
                  step={50000}
                  value={damageFine}
                  onChange={(e) => setDamageFine(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 font-mono text-amber-800 font-bold text-sm focus:outline-none focus:border-indigo-600 shadow-sm"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Catatan Kerusakan Fasilitas Kamar:
                </label>
                <textarea
                  rows={2}
                  value={damageNotes}
                  onChange={(e) => setDamageNotes(e.target.value)}
                  placeholder="Contoh: Kaca jendela retak (Denda Rp 150.000)"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-indigo-600 shadow-sm"
                />
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex justify-between items-center font-bold">
                <span className="text-slate-800">Sisa Deposit Di-Refund Ke Mahasiswa:</span>
                <span className="font-mono text-sm text-emerald-700">{formatRupiah(netRefund)}</span>
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-700 hover:bg-indigo-800 text-white font-bold py-2 rounded-xl transition-all shadow-md"
              >
                Proses Berita Acara Inspeksi Check-Out
              </button>
            </form>

            {inspectionResult && (
              <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-900 space-y-1 font-medium">
                <div className="font-bold text-emerald-950">Berita Acara Inspeksi Disahkan!</div>
                <div>Mahasiswa: {inspectionResult.nama} ({inspectionResult.kamar})</div>
                <div>Denda Dipotong: {formatRupiah(inspectionResult.damageFine)}</div>
                <div className="font-bold text-emerald-800">Total Refund: {formatRupiah(inspectionResult.netRefund)}</div>
              </div>
            )}
          </div>
        </div>
      </div>
      )}

      {activeTab === 'notifications' && (
        <NotificationManager invoices={invoices} />
      )}

      {activeTab === 'activity_log' && (
        <ActivityLog logs={modificationLogs} />
      )}

      {activeTab === 'master_tarif' && (
        <div className="animate-in fade-in duration-200">
          <TariffManager tariffs={tariffs} setTariffs={setTariffs} paymentSchemes={paymentSchemes} setPaymentSchemes={setPaymentSchemes} readOnly={true} />
        </div>
      )}
    </div>
  );
};
