import React, { useState } from 'react';
import {
  Wifi,
  WifiOff,
  Lock,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Zap,
  XCircle,
  LogOut,
  RefreshCcw,
  ShieldAlert,
  Wrench,
  Camera,
  ArrowRight,
} from 'lucide-react';
import { GeofenceRecord } from '../../types/asrama';
import { AutoResumeBanner } from '../common/AutoResumeBanner';

interface EksistingDashboardProps {
  nim?: string;
  nama?: string;
  kamar?: string;
  scenario?: string;
  onOpenMaintenance?: () => void;
}

export const EksistingDashboard: React.FC<EksistingDashboardProps> = ({
  nim = '2240101004',
  nama = 'Ahmad Raihan',
  kamar = 'Gedung A (Enggang Utara) — Kamar 101',
  scenario,
  onOpenMaintenance,
}) => {
  // Phase B: Geofencing State
  const [userLat, setUserLat] = useState<number>(3.3082); // UBT Campus coordinates
  const [userLng, setUserLng] = useState<number>(117.6321);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [geofenceResult, setGeofenceResult] = useState<GeofenceRecord>({
    nim,
    nama,
    lat: 3.3082,
    lng: 117.6321,
    distanceFromDormMeter: 45,
    isInsideGeofence: true,
    timestamp: '21:55 WIB',
    gateStatus: 'OPEN',
  });

  // Phase D: Delinquency Simulator State (Days Overdue 0 - 8)
  const [overdueDays, setOverdueDays] = useState<number>(0);

  // Phase C: Checkout Refund Request
  const [checkoutRequested, setCheckoutRequested] = useState(false);

  const handleSimulateGpsCheck = (inCampus: boolean) => {
    setIsGettingLocation(true);
    setTimeout(() => {
      setIsGettingLocation(false);
      const distance = inCampus ? 35 : 1250;
      setGeofenceResult({
        nim,
        nama,
        lat: inCampus ? 3.3082 : 3.325,
        lng: inCampus ? 117.6321 : 117.65,
        distanceFromDormMeter: distance,
        isInsideGeofence: inCampus,
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
        gateStatus: distance <= 150 ? 'OPEN' : 'LOCKED_BY_CRON',
      });
    }, 600);
  };

  // Kebijakan Baru: Toleransi 5 Hari Sewa + 5 Hari Top-Up Deposit (Tanpa Denda 3 Tingkat)
  // Contoh Kasus: Jatuh Tempo 1 September
  // - Tahap 1 (H+1 s.d H+5, 1 s/d 6 Sept): Masa Toleransi 5 Hari untuk Bayar Tunggakan Sewa. Denda Rp 0, Deposit Utuh.
  // - Tahap 2 (H+6 s.d H+10, 7 s/d 11 Sept): Lewat 5 Hari (6 Sept) -> Deposit Otomatis Dipakai Bayar Sewa. Tambahan 5 hari toleransi untuk top-up deposit. Denda Rp 0.
  // - Tahap 3 (H+11+, Lewat 11 Sept): Gagal Top-Up s/d 11 Sept -> Dikenakan Denda Rp 500.000 & Kontrak Berakhir.
  const isGracePeriodSewa = overdueDays >= 1 && overdueDays <= 5;
  const isDepositUsedGraceTopup = overdueDays >= 6 && overdueDays <= 10;
  const isTerminatedWithFine = overdueDays >= 11;
  const currentFine = isTerminatedWithFine ? 500000 : 0;

  if (scenario === 'ACTIVE_RESIDENT_INSTALLMENT') {
    return (
      <AutoResumeBanner
        type="installment"
        title="Tindakan Diperlukan: Sisa Cicilan Deposit"
        description="Akses ke Dashboard Eksisting ditangguhkan sementara. Anda memiliki tagihan sisa cicilan deposit yang belum dilunasi."
        actionText="Bayar Sisa Cicilan Sekarang (Virtual Account)"
        onAction={() => alert('Mengarahkan ke pembayaran sisa cicilan...')}
        isBlocking={true}
      />
    );
  }

  return (
    <div id="eksisting-dashboard-root" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {scenario === 'ACTIVE_RESIDENT_RENEWAL' && (
        <AutoResumeBanner
          type="renewal"
          title="Draf Perpanjangan Sewa Belum Diselesaikan"
          description="Anda telah memilih durasi perpanjangan 6 bulan. Lanjutkan ke pembayaran untuk mengonfirmasi."
          actionText="Lanjutkan Pembayaran"
          onAction={() => alert('Mengarahkan ke pembayaran perpanjangan sewa...')}
        />
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-800 via-teal-900 to-slate-900 border border-blue-700 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="bg-blue-700/80 text-blue-100 text-xs px-2.5 py-0.5 rounded-full font-mono font-bold border border-blue-400/40">
              SSO ACTIVE SESSION
            </span>
            <span className="text-xs text-slate-200">• NIM: {nim}</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Portal Operasional Harian: {nama}</h2>
          <p className="text-xs text-teal-100">{kamar}</p>
        </div>

        {/* Phase B Quick Status Summary */}
        <div className="flex items-center space-x-3 bg-white/10 backdrop-blur p-3.5 rounded-xl border border-white/20 text-xs text-white">
          <div className="space-y-1">
            <div className="text-[11px] text-teal-100">Status Pembayaran &amp; Deposit:</div>
            {isTerminatedWithFine ? (
              <span className="text-red-300 font-bold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-red-400" /> KONTRAK BERAKHIR (Denda Rp 500k)
              </span>
            ) : isDepositUsedGraceTopup ? (
              <span className="text-amber-300 font-bold flex items-center gap-1">
                <RefreshCcw className="w-3.5 h-3.5 text-amber-400" /> DEPOSIT DIPOTONG SEWA (Grace Top-Up s/d 11 Sept)
              </span>
            ) : isGracePeriodSewa ? (
              <span className="text-blue-300 font-bold flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-blue-300" /> TOLERANSI SEWA (s/d 6 Sept)
              </span>
            ) : (
              <span className="text-emerald-300 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> NORMAL / TEPAT WAKTU
              </span>
            )}
          </div>
        </div>
      </div>

      {/* PHASE D DELINQUENCY SIMULATOR CALLOUT */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-teal-700" />
              <span>Fase D: Kebijakan Toleransi Pembayaran 5+5 Hari &amp; Pemotongan Deposit</span>
            </h3>
            <p className="text-xs text-slate-600 mt-1">
              Simulasi kebijakan penanganan tunggakan (Tanpa denda 3 tingkat) — <strong className="text-slate-800">Contoh Kasus: Tanggal Jatuh Tempo 1 September</strong>.
            </p>
          </div>
          <div className="flex items-center space-x-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 shrink-0">
            <label className="text-xs text-slate-700 font-bold">Simulasi Hari:</label>
            <select
              value={overdueDays}
              onChange={(e) => setOverdueDays(Number(e.target.value))}
              className="bg-white border border-slate-300 rounded text-xs font-mono font-bold text-teal-800 px-2 py-1 focus:outline-none shadow-sm"
            >
              <option value={0}>D+0 (1 Sept — Jatuh Tempo / Tepat Waktu)</option>
              <option value={3}>D+3 (4 Sept — Masa Toleransi Sewa 5 Hari)</option>
              <option value={5}>D+5 (6 Sept — Hari Terakhir Toleransi Sewa)</option>
              <option value={6}>D+6 (7 Sept — Deposit Otomatis Dipakai Bayar Sewa)</option>
              <option value={8}>D+8 (9 Sept — Dalam Masa Toleransi Top-Up Deposit)</option>
              <option value={10}>D+10 (11 Sept — Hari Terakhir Toleransi Top-Up Deposit)</option>
              <option value={12}>D+12 (13 Sept — Gagal Top-Up: Denda Rp 500k &amp; Kontrak Berakhir)</option>
            </select>
          </div>
        </div>

        {/* 3 Tahap Alur Penegakan */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Tahap 1: Toleransi Sewa 5 Hari (1-6 Sept) */}
          <div className={`p-4 rounded-xl border text-xs space-y-2 transition-all ${
            isGracePeriodSewa
              ? 'bg-blue-50/80 border-blue-400 text-blue-950 ring-2 ring-blue-300 font-medium'
              : overdueDays > 5
              ? 'bg-slate-50 border-slate-200 text-slate-500 opacity-70'
              : 'bg-slate-50 border-slate-200 text-slate-700'
          }`}>
            <div className="font-bold flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-bold text-blue-900">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                Tahap 1: Toleransi Sewa (s/d 6 Sep)
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-blue-100 text-blue-800">
                H+1 s/d H+5
              </span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Diberikan masa toleransi (grace period) 5 hari setelah jatuh tempo (1 Sept) untuk melunasi sewa.
            </p>
            <div className="pt-1 text-[11px] border-t border-slate-200/60 flex justify-between font-mono">
              <span>Denda: <strong className="text-emerald-700">Rp 0</strong></span>
              <span>Deposit: <strong className="text-slate-700">Utuh</strong></span>
            </div>
          </div>

          {/* Tahap 2: Auto-Debet Deposit & Toleransi Top-Up 5 Hari (6-11 Sept) */}
          <div className={`p-4 rounded-xl border text-xs space-y-2 transition-all ${
            isDepositUsedGraceTopup
              ? 'bg-amber-50/90 border-amber-400 text-amber-950 ring-2 ring-amber-300 font-medium'
              : overdueDays > 10
              ? 'bg-slate-50 border-slate-200 text-slate-500 opacity-70'
              : 'bg-slate-50 border-slate-200 text-slate-700'
          }`}>
            <div className="font-bold flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-bold text-amber-900">
                <RefreshCcw className="w-3.5 h-3.5 text-amber-600" />
                Tahap 2: Deposit Dipotong &amp; Top-Up
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-amber-100 text-amber-800">
                H+6 s/d H+10
              </span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Jika lewat 5 hari (6 Sept), <strong>deposit dipakai membayar tunggakan sewa</strong>. Diberikan tambahan 5 hari (s/d 11 Sept) untuk <strong>pemenuhan setoran deposit</strong>.
            </p>
            <div className="pt-1 text-[11px] border-t border-slate-200/60 flex justify-between font-mono">
              <span>Denda: <strong className="text-emerald-700">Rp 0</strong></span>
              <span>Deposit: <strong className="text-amber-800">Dipotong Sewa</strong></span>
            </div>
          </div>

          {/* Tahap 3: Wanprestasi & Kontrak Berakhir (Lewat 11 Sept) */}
          <div className={`p-4 rounded-xl border text-xs space-y-2 transition-all ${
            isTerminatedWithFine
              ? 'bg-red-50 border-2 border-red-500 text-red-950 ring-2 ring-red-300 font-medium'
              : 'bg-slate-50 border-slate-200 text-slate-700'
          }`}>
            <div className="font-bold flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-bold text-red-900">
                <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                Tahap 3: Default &amp; Denda
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-red-100 text-red-800">
                H+11+ (Lewat 11 Sep)
              </span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Jika lewat 11 Sept tidak melakukan top-up pemenuhan deposit, dikenakan <strong>denda Rp 500.000</strong> beserta <strong>kontrak tinggal berakhir</strong> (pengosongan kamar).
            </p>
            <div className="pt-1 text-[11px] border-t border-slate-200/60 flex justify-between font-mono">
              <span>Denda: <strong className={isTerminatedWithFine ? 'text-red-700 font-extrabold' : 'text-slate-500'}>Rp 500.000</strong></span>
              <span>Kontrak: <strong className={isTerminatedWithFine ? 'text-red-700 font-extrabold' : 'text-slate-500'}>BERAKHIR</strong></span>
            </div>
          </div>
        </div>

        {/* Live Simulation Status Alert Box */}
        <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
          isTerminatedWithFine
            ? 'bg-red-100/80 border-red-300 text-red-950'
            : isDepositUsedGraceTopup
            ? 'bg-amber-100/80 border-amber-300 text-amber-950'
            : isGracePeriodSewa
            ? 'bg-blue-100/80 border-blue-300 text-blue-950'
            : 'bg-emerald-50 border-emerald-300 text-emerald-950'
        }`}>
          <div className="space-y-0.5">
            <div className="font-bold flex items-center gap-2">
              <span>Ringkasan Status Simulasi (Hari ke-{overdueDays} sejak 1 Sept):</span>
            </div>
            <p className="text-[11px]">
              {isTerminatedWithFine
                ? 'MAHASISWA WANPRESTASI AKUT: Melewati batas 11 September tanpa setoran pemenuhan deposit. Dikenakan denda Rp 500.000 dan Surat Pemutusan Kontrak Hunian diterbitkan.'
                : isDepositUsedGraceTopup
                ? 'UANG DEPOSIT TELAH DIALIHKAN: Saldo deposit otomatis dipotong untuk melunasi tunggakan sewa. Mahasiswa berada dalam masa tenggang top-up deposit s/d 11 September (Bebas Denda).'
                : isGracePeriodSewa
                ? 'DALAM MASA TOLERANSI SEWA: Mahasiswa dapat melunasi sewa mandiri hingga 6 September tanpa sanksi denda. Deposit masih utuh.'
                : 'PEMBAYARAN TEPAT WAKTU: Tagihan lunas atau belum melewati tanggal jatuh tempo 1 September. Fasilitas kamar berjalan normal.'}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0 font-mono font-bold text-xs bg-white/80 p-2.5 rounded-lg border border-slate-300/60 shadow-xs">
            <span>Denda: Rp {currentFine.toLocaleString('id-ID')}</span>
            <span>•</span>
            <span>Status: {isTerminatedWithFine ? 'BERAKHIR' : 'AKTIF'}</span>
          </div>
        </div>
      </div>

      {/* MAINTENANCE TICKETING QUICK LAUNCH */}
      <div id="maintenance-ticketing-banner" className="bg-gradient-to-r from-teal-900 via-slate-900 to-teal-950 border border-teal-700/70 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-500/20 border border-teal-400/40 text-teal-300 flex items-center justify-center shrink-0 shadow-sm">
            <Wrench className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="bg-teal-500/30 text-teal-200 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-teal-400/30">
                Layanan Sarpras
              </span>
              <span className="text-xs text-slate-300 font-mono">Foto Kamera &amp; Status Pelacakan</span>
            </div>
            <h3 className="text-lg font-black text-white tracking-tight">
              Layanan Pemeliharaan &amp; Laporan Kerusakan Fasilitas
            </h3>
            <p className="text-xs text-teal-100/80 max-w-2xl leading-relaxed">
              Ada kran bocor, stopkontak korsleting, atau fasilitas kamar rusak? Laporkan langsung dengan jepretan kamera perangkat dan pantau jadwal serta tindakan teknisi.
            </p>
          </div>
        </div>

        <button
          id="button-launch-maintenance-ticketing"
          type="button"
          onClick={onOpenMaintenance}
          className="w-full md:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white text-xs font-black transition-all shadow-lg flex items-center justify-center gap-2 active:scale-95 shrink-0"
        >
          <Camera className="w-4 h-4" />
          <span>Buka Modul Maintenance</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* OPERASIONAL WORKSPACE */}
      <div className="grid grid-cols-1 gap-8">

        {/* WIDGET 1: GEOFENCING GPS PRESENSI JAM MALAM */}
        <div id="geofencing-widget" className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="border-b border-slate-200 pb-3 flex justify-between items-center">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-teal-700" />
                <span>Geofencing GPS Presensi (CRON 22.01 WIB)</span>
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Pukul 22.01 WIB mesin CRON mengunci gerbang jika lokasi &gt; 150m dari Kampus UBT.
              </p>
            </div>
            <span className="bg-slate-100 text-slate-800 font-mono text-[11px] font-bold px-2.5 py-1 rounded border border-slate-300">
              MAX 22:00 WIB
            </span>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600">Koordinat GPS Terdeteksi:</span>
              <span className="font-mono font-bold text-teal-800">{geofenceResult.lat}, {geofenceResult.lng}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600">Jarak dari Asrama UBT:</span>
              <span className="font-mono font-bold text-slate-900">{geofenceResult.distanceFromDormMeter} Meter</span>
            </div>

            {/* Status Geofence Result */}
            <div className={`p-4 rounded-xl border text-xs flex items-center space-x-3 ${
              geofenceResult.isInsideGeofence
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                : 'bg-red-50 border-red-300 text-red-900'
            }`}>
              {geofenceResult.isInsideGeofence ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
              ) : (
                <Lock className="w-6 h-6 text-red-600 flex-shrink-0" />
              )}
              <div>
                <span className="font-bold text-sm block">
                  {geofenceResult.isInsideGeofence ? 'Dalam Area Radius Asrama (< 150m)' : 'Di Luar Radius Asrama!'}
                </span>
                <span className="text-[11px]">
                  {geofenceResult.isInsideGeofence
                    ? 'Presensi jam malam valid. Akses gerbang diizinkan.'
                    : 'Akses gerbang DIKUNCI oleh mesin CRON 22.01 WIB. Laporan dikirim ke Pembina.'}
                </span>
              </div>
            </div>

            {/* GPS Simulation Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={() => handleSimulateGpsCheck(true)}
                disabled={isGettingLocation}
                className="flex-1 bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold py-2 px-3 rounded-lg border border-slate-300 flex items-center justify-center space-x-1.5 shadow-sm"
              >
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                <span>Simulasi: Berada Di Dalam Kampus (45m)</span>
              </button>

              <button
                type="button"
                onClick={() => handleSimulateGpsCheck(false)}
                disabled={isGettingLocation}
                className="flex-1 bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold py-2 px-3 rounded-lg border border-slate-300 flex items-center justify-center space-x-1.5 shadow-sm"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                <span>Simulasi: Berada Di Luar Kampus (1.2km)</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* PHASE C: PERMOHONAN CHECK-OUT & ESTIMASI REFUND DEPOSIT */}
      <div id="checkout-phase-c-panel" className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="border-b border-slate-200 pb-3 flex justify-between items-center">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <LogOut className="w-5 h-5 text-indigo-700" />
              <span>Fase C: Pengajuan Check-Out & Refund Deposit (Rp 750.000)</span>
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Admin Asrama akan melakukan inspeksi kondisi fisik kamar. Sisa deposit di-refund utuh jika tidak ada denda kerusakan.
            </p>
          </div>
          <span className="bg-indigo-50 text-indigo-800 border border-indigo-300 text-[11px] font-bold px-3 py-1 rounded-full font-mono">
            FASE C REFUND
          </span>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs">
          <div className="space-y-1">
            <span className="text-slate-600 font-bold block font-mono">ESTIMASI DEPOSIT AWAL TERIKAT:</span>
            <span className="font-mono text-lg font-bold text-emerald-700">Rp 750.000</span>
            <p className="text-[11px] text-slate-600">
              *Refund diproses ke rekening mahasiswa setelah berita acara inspeksi Admin Asrama ditandatangani.
            </p>
          </div>

          <div>
            {checkoutRequested ? (
              <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 p-3 rounded-xl font-bold flex items-center gap-2 shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Permohonan Check-out Terdaftar! Menunggu Inspeksi Admin Asrama.</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setCheckoutRequested(true)}
                className="bg-indigo-700 hover:bg-indigo-800 text-white font-bold px-5 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Ajukan Check-Out Akhir Semester</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
