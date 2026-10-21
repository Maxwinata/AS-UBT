import React, { useState } from 'react';
import { Database, FlaskConical, Check, ChevronDown, Server, Sparkles, ShieldCheck } from 'lucide-react';
import { useTestingMode, AppOperationalMode } from '../../context/TestingModeContext';
import { toast } from 'sonner';

interface ProductionModeSwitchProps {
  compact?: boolean;
  className?: string;
}

export const ProductionModeSwitch: React.FC<ProductionModeSwitchProps> = ({
  compact = false,
  className = '',
}) => {
  const { appMode, setAppMode, isCleanTesting } = useTestingMode();
  const [isOpen, setIsOpen] = useState(false);

  const handleSelectMode = (newMode: AppOperationalMode) => {
    if (newMode === appMode) {
      setIsOpen(false);
      return;
    }
    setAppMode(newMode);
    setIsOpen(false);
    if (newMode === 'production') {
      toast.success('Beralih ke Mode Produksi (Data Riil MySQL)', {
        description: 'Tampilan bersih aktif. Seluruh banner dummy dan preset simulasi disembunyikan.',
        duration: 3500,
      });
    } else {
      toast.info('Beralih ke Mode Simulasi & Sandbox', {
        description: 'Alat bantu pengujian, preset akun demo, dan panel skenario kini ditampilkan.',
        duration: 3500,
      });
    }
  };

  return (
    <div className={`relative inline-block text-left ${className}`}>
      {/* Trigger Button */}
      <button
        id="button-app-mode-switch"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        title={
          isCleanTesting
            ? 'Sistem dalam Mode Produksi (Data Riil MySQL). Klik untuk opsi beralih.'
            : 'Sistem dalam Mode Simulasi / Demo. Klik untuk opsi beralih.'
        }
        className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer shadow-xs ${
          isCleanTesting
            ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950 hover:bg-emerald-100/80'
            : 'bg-amber-50/80 border-amber-300 text-amber-950 hover:bg-amber-100/80'
        }`}
      >
        {isCleanTesting ? (
          <>
            <div className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
            </div>
            <Database className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
            <span className={compact ? 'hidden md:inline font-bold' : 'font-bold'}>
              Mode Produksi (Riil)
            </span>
          </>
        ) : (
          <>
            <div className="relative flex h-2 w-2">
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </div>
            <FlaskConical className="w-3.5 h-3.5 text-amber-700 shrink-0" />
            <span className={compact ? 'hidden md:inline font-bold' : 'font-bold'}>
              Mode Simulasi (Demo)
            </span>
          </>
        )}
        <ChevronDown className="w-3 h-3 text-slate-500 shrink-0" />
      </button>

      {/* Dropdown Menu Modal */}
      {isOpen && (
        <>
          {/* Backdrop to close */}
          <div
            className="fixed inset-0 z-50 bg-black/20"
            onClick={() => setIsOpen(false)}
          />

          <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-3 space-y-2 animate-in fade-in zoom-in-95 font-sans">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-1.5">
                <Server className="w-4 h-4 text-teal-700" />
                <span className="text-xs font-bold text-slate-900 tracking-tight">
                  Pilih Mode Operasional Sistem
                </span>
              </div>
              <span className="text-[10px] bg-slate-100 text-slate-600 font-mono px-1.5 py-0.5 rounded">
                Portal SI-GABUNG 54
              </span>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              Anda dapat beralih kapan saja antara mode kerja operasional riil dan lingkungan uji coba / simulasi:
            </p>

            <div className="space-y-1.5 pt-1">
              {/* Option 1: Mode Produksi Riil */}
              <button
                type="button"
                onClick={() => handleSelectMode('production')}
                className={`w-full text-left p-2.5 rounded-lg border transition-all flex items-start gap-3 cursor-pointer ${
                  isCleanTesting
                    ? 'bg-emerald-50/70 border-emerald-400 ring-1 ring-emerald-400 text-slate-900'
                    : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className={`p-1.5 rounded-md mt-0.5 ${isCleanTesting ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  <Database className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">
                      Mode Produksi (Data Riil MySQL)
                    </span>
                    {isCleanTesting && (
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                        <Check className="w-3 h-3" />
                        Aktif
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                    Tampilan 100% bersih tanpa tombol preset dummy, banner promosi, atau sandbox floating. Data tersimpan permanen ke MySQL Laragon.
                  </p>
                </div>
              </button>

              {/* Option 2: Mode Simulasi & Sandbox */}
              <button
                type="button"
                onClick={() => handleSelectMode('simulation')}
                className={`w-full text-left p-2.5 rounded-lg border transition-all flex items-start gap-3 cursor-pointer ${
                  !isCleanTesting
                    ? 'bg-amber-50/70 border-amber-400 ring-1 ring-amber-400 text-slate-900'
                    : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className={`p-1.5 rounded-md mt-0.5 ${!isCleanTesting ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  <FlaskConical className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">
                      Mode Simulasi (Demo Presets & QA)
                    </span>
                    {!isCleanTesting && (
                      <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                        <Check className="w-3 h-3" />
                        Aktif
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                    Menampilkan preset akun simulasi (Maximilian, Jenny, dll.), pengalih skenario, dan bilah alat bantu pengujian.
                  </p>
                </div>
              </button>
            </div>

            {/* MySQL Status Footer Note */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-700" />
                Database: MySQL Laragon (Port 3306)
              </span>
              <span className="font-mono text-slate-400">asrama_ubt_db</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
