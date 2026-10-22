import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, RefreshCw, ShieldAlert, CheckCircle2, Zap } from 'lucide-react';
import { BillingInvoice, RoomPlot } from '../../types/asrama';
import { toast } from 'sonner';

interface ReservationCountdownBannerProps {
  invoice: BillingInvoice;
  room?: RoomPlot;
  onAutoRelease?: (invoiceId: string) => void;
  onRebook?: () => void;
}

export const ReservationCountdownBanner: React.FC<ReservationCountdownBannerProps> = ({
  invoice,
  room,
  onAutoRelease,
  onRebook,
}) => {
  const [timeLeft, setTimeLeft] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
    totalSeconds: number;
    isExpired: boolean;
  }>({
    hours: 48,
    minutes: 0,
    seconds: 0,
    totalSeconds: 48 * 3600,
    isExpired: invoice.status === 'EXPIRED',
  });

  const [simulatedOffsetMs, setSimulatedOffsetMs] = useState<number>(0);

  useEffect(() => {
    // If invoice is already marked EXPIRED or PAID, do not run tick
    if (invoice.status === 'PAID') {
      return;
    }

    if (invoice.status === 'EXPIRED') {
      setTimeLeft(prev => ({ ...prev, isExpired: true, totalSeconds: 0 }));
      return;
    }

    const calculateTime = () => {
      // Calculate target expiration time: invoice.expiresAt or fallback to 48 hours from createdAt/now
      const baseExpiresAt = invoice.expiresAt 
        ? new Date(invoice.expiresAt).getTime()
        : Date.now() + 48 * 3600 * 1000;

      const targetTime = baseExpiresAt - simulatedOffsetMs;
      const now = Date.now();
      const diffMs = targetTime - now;

      if (diffMs <= 0) {
        setTimeLeft({
          hours: 0,
          minutes: 0,
          seconds: 0,
          totalSeconds: 0,
          isExpired: true,
        });

        // Trigger auto release if not already triggered
        if (invoice.status !== 'EXPIRED' && onAutoRelease) {
          onAutoRelease(invoice.invoiceId);
        }
        return;
      }

      const totalSec = Math.floor(diffMs / 1000);
      const hours = Math.floor(totalSec / 3600);
      const minutes = Math.floor((totalSec % 3600) / 60);
      const seconds = totalSec % 60;

      setTimeLeft({
        hours,
        minutes,
        seconds,
        totalSeconds: totalSec,
        isExpired: false,
      });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [invoice.expiresAt, invoice.status, invoice.invoiceId, simulatedOffsetMs, onAutoRelease]);

  // Format date deadline
  const deadlineDate = React.useMemo(() => {
    if (!invoice.expiresAt) return '48 Jam sejak pemilihan kamar';
    const d = new Date(new Date(invoice.expiresAt).getTime() - simulatedOffsetMs);
    return d.toLocaleString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short',
    });
  }, [invoice.expiresAt, simulatedOffsetMs]);

  // Handle fast-forward test simulation (simulate 48h expiration)
  const handleSimulateFastForward = () => {
    // Jump offset forward past 48 hours
    setSimulatedOffsetMs(48 * 3600 * 1000 + 10000);
    if (onAutoRelease) {
      onAutoRelease(invoice.invoiceId);
    }
    toast.warning('⚡ [SIMULASI PENGUJIAN]: Waktu dimajukan 48 jam penuh. Skenario Auto-Release kamar dipicu.', {
      duration: 6000,
    });
  };

  // Handle reset test simulation (fresh 48h)
  const handleResetSimulatedTime = () => {
    setSimulatedOffsetMs(0);
    if (onRebook) {
      onRebook();
    }
    toast.success('⚡ [SIMULASI PENGUJIAN]: Waktu reservasi di-reset ke 48 jam penuh.', {
      duration: 4000,
    });
  };

  // 1. If already PAID
  if (invoice.status === 'PAID') {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-emerald-950 flex items-center gap-2">
              <span>Reservasi Kamar Permanen & Terbayar</span>
              <span className="text-[10px] font-mono bg-emerald-200/60 text-emerald-900 px-2 py-0.5 rounded font-bold">
                KAPASITAS TERKUNCI (OCCUPIED)
              </span>
            </div>
            <p className="text-[11px] text-emerald-800 mt-0.5">
              Kamar <strong>{room?.nomorKamar || '204'}</strong> di <strong>{room?.gedung || 'Asrama UBT'}</strong> telah resmi terikat untuk Anda. Silakan lanjut ke penandatanganan Kontrak Hunian (Step 4).
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 2. If EXPIRED (Lewat 48 Jam)
  if (timeLeft.isExpired || invoice.status === 'EXPIRED') {
    return (
      <div className="bg-rose-50 border-2 border-rose-300 rounded-xl p-4 sm:p-5 shadow-xs space-y-3 animate-in fade-in duration-300">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-rose-200">
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2.5 bg-rose-100 text-rose-700 rounded-xl shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-rose-700 text-white font-mono">
                  EXPIRED (LEWAT 48 JAM)
                </span>
                <span className="text-[10px] font-bold text-rose-800 bg-rose-100 border border-rose-200 px-2 py-0.5 rounded-md">
                  Auto-Release Aktif
                </span>
              </div>
              <h4 className="font-bold text-sm text-rose-950 mt-1">
                Batas Waktu Reservasi Kamar {room?.nomorKamar || '204'} Telah Berakhir
              </h4>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onRebook && (
              <button
                type="button"
                onClick={onRebook}
                className="bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Pilih Ulang Kamar & Buat Reservasi Baru</span>
              </button>
            )}
          </div>
        </div>

        <div className="text-xs text-rose-900/90 leading-relaxed space-y-1.5">
          <p>
            Sesuai kebijakan sistem operasional Asrama UBT, kamar yang belum diselesaikan pembayarannya dalam waktu <strong>48 jam kalender</strong> otomatis dilepas kembali ke pool kuota umum agar tidak menghalangi calon penghuni lain.
          </p>
          <p className="text-[11px] text-rose-700 font-medium">
            💡 Jangan khawatir: Anda dapat segera memilih kamar kembali dengan menekan tombol <strong>Pilih Ulang Kamar</strong> di atas untuk memperoleh batas waktu reservasi baru selama 48 jam.
          </p>
        </div>

        {/* Sandbox Simulation Bar */}
        <div className="pt-2 border-t border-rose-200/60 flex items-center justify-between text-[11px] text-rose-600">
          <span className="font-mono">Testing Mode: Skenario Auto-Release terverifikasi</span>
          <button
            type="button"
            onClick={handleResetSimulatedTime}
            className="text-[11px] font-semibold text-rose-700 hover:text-rose-900 underline flex items-center gap-1 cursor-pointer"
          >
            <Zap className="w-3 h-3 text-amber-500" />
            <span>Reset Uji Waktu ke 48 Jam Baru</span>
          </button>
        </div>
      </div>
    );
  }

  // 3. Active 48-Hour Countdown
  const isUrgent = timeLeft.hours < 12; // Warning H-12 Jam

  return (
    <div
      className={`border rounded-xl p-4 sm:p-5 shadow-xs transition-all space-y-3 ${
        isUrgent
          ? 'bg-amber-50/90 border-amber-300 ring-1 ring-amber-300/50'
          : 'bg-slate-900 text-white border-slate-800'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left Info */}
        <div className="flex items-start sm:items-center gap-3">
          <div
            className={`p-2.5 rounded-xl shrink-0 ${
              isUrgent
                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                : 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
            }`}
          >
            {isUrgent ? <AlertTriangle className="w-5 h-5 text-amber-700" /> : <Clock className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md font-mono ${
                  isUrgent
                    ? 'bg-amber-200 text-amber-900 border border-amber-300'
                    : 'bg-teal-500/30 text-teal-300 border border-teal-500/40'
                }`}
              >
                {isUrgent ? 'PERINGATAN H-12 JAM' : 'RESERVASI STAGING AKTIF (48 JAM)'}
              </span>
              <span
                className={`text-[11px] font-semibold ${
                  isUrgent ? 'text-amber-900' : 'text-slate-300'
                }`}
              >
                Kamar: {room?.gedung || 'Asrama UBT'} — Kamar {room?.nomorKamar || '204'}
              </span>
            </div>

            <h4
              className={`font-bold text-sm sm:text-base mt-1 ${
                isUrgent ? 'text-amber-950' : 'text-white'
              }`}
            >
              Sisa Waktu Pembayaran & Penguncian Kamar
            </h4>
          </div>
        </div>

        {/* Right Digital Clock */}
        <div className="text-left sm:text-right flex flex-col items-start sm:items-end">
          <div
            className={`font-mono text-xl sm:text-2xl font-black tracking-tight tabular-nums px-3 py-1.5 rounded-xl border flex items-center gap-1.5 ${
              isUrgent
                ? 'bg-white text-rose-700 border-amber-300 shadow-sm'
                : 'bg-black/40 text-amber-300 border-white/10 shadow-inner'
            }`}
          >
            <span>{String(timeLeft.hours).padStart(2, '0')}</span>
            <span className="opacity-60 text-sm font-sans font-bold">jam</span>
            <span className="opacity-40">:</span>
            <span>{String(timeLeft.minutes).padStart(2, '0')}</span>
            <span className="opacity-60 text-sm font-sans font-bold">menit</span>
            <span className="opacity-40">:</span>
            <span className="text-emerald-400">{String(timeLeft.seconds).padStart(2, '0')}</span>
            <span className="opacity-60 text-sm font-sans font-bold">detik</span>
          </div>
          <span
            className={`text-[10px] mt-1 font-medium ${
              isUrgent ? 'text-amber-800' : 'text-slate-400'
            }`}
          >
            Batas Akhir: {deadlineDate}
          </span>
        </div>
      </div>

      {/* Explanatory Message & Testing Controls */}
      <div
        className={`pt-2.5 border-t text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
          isUrgent ? 'border-amber-200 text-amber-900' : 'border-white/10 text-slate-300'
        }`}
      >
        <p className="text-[11px] leading-relaxed">
          {isUrgent ? (
            <span>
              <strong>Perhatian:</strong> Reservasi Anda tersisa kurang dari 12 jam. Segera selesaikan transfer atau konfirmasi agar kamar tidak otomatis dilepas ke pendaftar lain.
            </span>
          ) : (
            <span>
              Kamar Anda terproteksi dalam masa tenggang <strong>48 jam kalender (2 hari)</strong> sejak invoice diterbitkan. Slot tempat tidur dijamin aman selama kurun waktu ini.
            </span>
          )}
        </p>

        {/* Fast-Forward Simulation Button for Testing */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          <button
            type="button"
            onClick={handleSimulateFastForward}
            className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1 cursor-pointer ${
              isUrgent
                ? 'bg-amber-200/70 hover:bg-amber-300 text-amber-950 border-amber-400'
                : 'bg-white/10 hover:bg-white/20 text-teal-300 border-white/20'
            }`}
            title="Simulasikan waktu melampaui 48 jam untuk menguji mekanisme auto-release kamar"
          >
            <Zap className="w-3 h-3 text-amber-400" />
            <span>Uji Auto-Release (48 Jam)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
