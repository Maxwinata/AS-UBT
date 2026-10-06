import React, { useState } from 'react';
import { Cpu, Play, CheckCircle2, Clock, ShieldAlert, Lock, WifiOff, Terminal, RefreshCw, AlertTriangle, Layers, DollarSign, FileWarning } from 'lucide-react';

export const CronEngineMonitor: React.FC = () => {
  const [logs, setLogs] = useState<string[]>([
    '[2026-08-05 22:00:00 WIB] [CRON-2200] Mesin Jam Malam & Pintu Gerbang Digital Berhasil Dikunci.',
    '[2026-08-05 22:01:00 WIB] [CRON-2201] Mesin Geofencing GPS Dimulai...',
    '[2026-08-05 22:01:02 WIB] [CRON-2201] Memindai 142 Penghuni Asrama UBT...',
    '[2026-08-05 22:01:03 WIB] [CRON-2201] OK: 140 Penghuni dalam radius < 150m.',
    '[2026-08-05 22:01:03 WIB] [CRON-2201] WARN: 2 Penghuni di luar kampus. Akses gerbang DIKUNCI.',
  ]);

  const [isRunningCron2201, setIsRunningCron2201] = useState(false);
  const [isRunningDelinquency, setIsRunningDelinquency] = useState(false);

  const addLog = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLogs((prev) => [`[${timestamp} WIB] ${msg}`, ...prev]);
  };

  const triggerCron2201 = () => {
    setIsRunningCron2201(true);
    addLog('[CRON-2200-JAM-MALAM] Executing Night Gate Lock Protocol at 22:00 WIB (Peraturan Gleni)...');
    setTimeout(() => {
      addLog('[CRON-2201-GEOFENCE] Querying active student GPS telemetry via background mobile pins...');
      addLog('[CRON-2201-GEOFENCE] Result: NIM 2240101004 (In Range 45m - GATE OPEN), NIM 2240101055 (Out Range 1250m - GATE LOCKED).');
      addLog('[CRON-2201-GEOFENCE] SUCCESS: Gate locking logic applied to out-of-bounds residents.');
      setIsRunningCron2201(false);
    }, 1000);
  };

  const triggerCronDelinquency = () => {
    setIsRunningDelinquency(true);
    addLog('[CRON-TAGIHAN-SOP] Menjalankan Mesin Penegakan Toleransi 5+5 Hari & Pemotongan Deposit...');
    setTimeout(() => {
      addLog('[CRON-SOP-TUNGGAKAN] Memindai tanggal jatuh tempo sewa (Basis contoh: Jatuh Tempo 1 September)...');
      addLog('[CRON-HARI-1-5] [Toleransi Sewa s/d 6 Sept]: 4 Penghuni dalam masa tenggang toleransi pembayaran sewa (Denda Rp 0). Notifikasi pengingat WA terkirim.');
      addLog('[CRON-HARI-6] [Auto-Debet Deposit]: NIM 2240101055 lewat 5 hari (6 Sept). Uang deposit Rp 500.000 otomatis dialihkan untuk melunasi tunggakan sewa.');
      addLog('[CRON-HARI-6-10] [Toleransi Top-up Deposit s/d 11 Sept]: Diberikan perpanjangan toleransi 5 hari untuk setoran pemenuhan deposit kembali ke saldo aman.');
      addLog('[CRON-HARI-11+] [Default / Lewat 11 Sept]: NIM 2140304099 tidak melakukan top-up deposit hingga lewat 11 Sept. Dikenakan Denda Rp 500.000 dan Kontrak Tinggal BERAKHIR.');
      addLog('[CRON-SOP-TUNGGAKAN] SELESAI: Penegakan kebijakan toleransi 5+5 hari dan pemotongan deposit berhasil dieksekusi.');
      setIsRunningDelinquency(false);
    }, 1200);
  };

  return (
    <div id="cron-engine-root" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-amber-500/20 text-amber-300 text-xs px-2.5 py-0.5 rounded-full font-mono border border-amber-500/30 font-bold uppercase">
              MESIN CRON SOP OPERASIONAL & PENJADWALAN
            </span>
            <span className="text-xs text-slate-400">• Regulasi Yayasan Gleni</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Otomatisasi Sistem Harian (Fase B, C, D)</h2>
          <p className="text-xs text-slate-300">
            Jam Malam (22.00 WIB), Kebijakan Toleransi Pembayaran 5+5 Hari &amp; Pemotongan Deposit, dan Pengembalian Deposit 14 Hari Kerja.
          </p>
        </div>
      </div>

      {/* PHASE D: GRACE PERIOD 5+5 & DEPOSIT DEDUCTION MATRIX DISPLAY */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <FileWarning className="w-4 h-4 text-amber-400" />
          <span>Matriks Toleransi 5+5 Hari &amp; Pemotongan Deposit (Fase D — Contoh Jatuh Tempo: 1 Sept)</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Tahap 1: Toleransi Sewa */}
          <div className="bg-slate-950 p-4 rounded-xl border border-blue-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-blue-400 uppercase font-mono">Tahap 1: Toleransi Sewa (Hari 1 - 5)</span>
              <span className="bg-blue-950 text-blue-300 px-2 py-0.5 rounded text-[10px] font-bold">s/d 6 Sept</span>
            </div>
            <p className="text-slate-300">
              Masa toleransi 5 hari setelah tanggal jatuh tempo (1 Sept) untuk melunasi tunggakan sewa secara mandiri. <strong className="text-emerald-400">Bebas denda keterlambatan (Rp 0)</strong>.
            </p>
          </div>

          {/* Tahap 2: Auto-Debet Deposit & Toleransi Top-Up */}
          <div className="bg-slate-950 p-4 rounded-xl border border-amber-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-400 uppercase font-mono">Tahap 2: Auto-Debet &amp; Top-Up (Hari 6 - 10)</span>
              <span className="bg-amber-950 text-amber-300 px-2 py-0.5 rounded text-[10px] font-bold">6 s/d 11 Sept</span>
            </div>
            <p className="text-slate-300">
              Jika lewat 5 hari (6 Sept), <strong className="text-amber-300">deposit otomatis dipakai untuk membayar tunggakan sewa</strong>. Diberikan <strong className="text-white">tambahan toleransi 5 hari (s/d 11 Sept)</strong> untuk pemenuhan setoran deposit kembali.
            </p>
          </div>

          {/* Tahap 3: Wanprestasi Akut */}
          <div className="bg-slate-950 p-4 rounded-xl border border-red-500/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-red-400 uppercase font-mono">Tahap 3: Wanprestasi Akut (Hari 11+)</span>
              <span className="bg-red-950 text-red-300 px-2 py-0.5 rounded text-[10px] font-bold">Lewat 11 Sept</span>
            </div>
            <p className="text-slate-300">
              Jika lewat 11 Sept mahasiswa tidak juga melakukan top-up pemenuhan deposit, dikenakan <strong className="text-red-400">denda keterlambatan Rp 500.000</strong> beserta <strong className="text-red-300">Kontrak Tinggal Berakhir (Pengosongan Kamar)</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* PHASE C: DEPOSIT REFUND PRIORITY HIERARCHY */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-emerald-400" />
          <span>Urutan Pemotongan Deposit Otomatis Saat Check-Out (Fase C - Maks 14 Hari Kerja)</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs font-mono">
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <span className="text-teal-400 font-bold block mb-1">1. Tunggakan</span>
            <span className="text-slate-400 text-[11px]">Sewa & tagihan berjalan</span>
          </div>
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <span className="text-teal-400 font-bold block mb-1">2. Denda</span>
            <span className="text-slate-400 text-[11px]">Keterlambatan / overstay</span>
          </div>
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <span className="text-teal-400 font-bold block mb-1">3. Simpan Barang</span>
            <span className="text-slate-400 text-[11px]">Barang tertinggal</span>
          </div>
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <span className="text-teal-400 font-bold block mb-1">4. Ganti BASTK</span>
            <span className="text-slate-400 text-[11px]">Kerusakan item BASTK</span>
          </div>
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <span className="text-teal-400 font-bold block mb-1">5. Penalti Dini</span>
            <span className="text-slate-400 text-[11px]">Pengakhiran kontrak dini</span>
          </div>
        </div>
      </div>

      {/* CRON RUNNER CONTROLS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* CRON 22.01 WIB */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-mono font-bold text-teal-400 bg-teal-950 border border-teal-800 px-2 py-0.5 rounded">
                CRON 22.00 WIB
              </span>
              <Clock className="w-4 h-4 text-slate-400" />
            </div>
            <h3 className="font-bold text-sm text-white">Jam Malam & Geofencing GPS</h3>
            <p className="text-xs text-slate-300">
              Jam 22.00 gerbang dikunci. Memindai posisi presensi penghuni. Jika di luar radius 150m kampus UBT, akses gerbang dikunci otomatis.
            </p>
          </div>
          <button
            onClick={triggerCron2201}
            disabled={isRunningCron2201}
            className="w-full bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs py-2 rounded-xl transition-all shadow-md flex items-center justify-center space-x-1.5"
          >
            <Play className="w-3.5 h-3.5" />
            <span>{isRunningCron2201 ? 'Menjalankan CRON 22.00...' : 'Jalankan CRON Jam Malam (22:00)'}</span>
          </button>
        </div>

        {/* CRON DELINQUENCY */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-mono font-bold text-red-400 bg-red-950 border border-red-800 px-2 py-0.5 rounded">
                CRON FASE D
              </span>
              <ShieldAlert className="w-4 h-4 text-slate-400" />
            </div>
            <h3 className="font-bold text-sm text-white">Penegakan Toleransi 5+5 Hari &amp; Pemotongan Deposit</h3>
            <p className="text-xs text-slate-300">
              Mengeksekusi pemotongan deposit untuk tunggakan sewa (lewat 6 Sept), memonitor batas toleransi top-up (s/d 11 Sept), dan menerbitkan denda Rp500.000 serta pengakhiran kontrak (lewat 11 Sept).
            </p>
          </div>
          <button
            onClick={triggerCronDelinquency}
            disabled={isRunningDelinquency}
            className="w-full bg-red-700 hover:bg-red-600 text-white font-semibold text-xs py-2 rounded-xl transition-all shadow-md flex items-center justify-center space-x-1.5"
          >
            <Play className="w-3.5 h-3.5" />
            <span>{isRunningDelinquency ? 'Menjalankan Penegakan...' : 'Jalankan Cron Toleransi 5+5 Hari'}</span>
          </button>
        </div>
      </div>

      {/* CONSOLE TERMINAL LOG INSPECTOR */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-3 font-mono text-xs">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3 text-slate-400">
          <span className="flex items-center space-x-2 text-white font-bold">
            <Terminal className="w-4 h-4 text-teal-400" />
            <span>Console Log Mesin Server CRON Asrama UBT</span>
          </span>
          <button
            onClick={() => setLogs([])}
            className="text-[11px] text-slate-500 hover:text-slate-300"
          >
            Clear Log
          </button>
        </div>

        <div className="bg-slate-900/90 border border-slate-800/80 rounded-xl p-4 h-64 overflow-y-auto space-y-1.5 text-slate-300">
          {logs.map((log, index) => (
            <div key={index} className="leading-relaxed">
              <span className="text-teal-400">{log}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
