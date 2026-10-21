import { ShieldCheck, LogOut, CheckCircle2, Building2 } from 'lucide-react';
import { UserRole } from '../../types/asrama';
import { useTestingMode } from '../../context/TestingModeContext';
import { ProductionModeSwitch } from './ProductionModeSwitch';

interface MinimalTestingLayoutProps {
  children: React.ReactNode;
  currentRole: UserRole;
  isLoggedIn: boolean;
  userName?: string;
  onLogout: () => void;
  onSwitchRole?: (role: UserRole) => void;
}

export const MinimalTestingLayout: React.FC<MinimalTestingLayoutProps> = ({
  children,
  currentRole,
  isLoggedIn,
  userName,
  onLogout,
  onSwitchRole,
}) => {
  const { isCleanTesting, toggleCleanTesting } = useTestingMode();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-teal-700 selection:text-white">
      {/* MINIMAL TOP BAR (Anti-Slop Clean 3-Zone Contract) */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          {/* Zone 1: Brand & Institutional Subtitle */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-800 text-white flex items-center justify-center font-black text-xs shadow-xs">
              UBT
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm sm:text-base tracking-tight text-slate-900 whitespace-nowrap">
                  Portal Asrama UBT
                </span>
                <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-1.5 py-0.5 rounded border border-slate-200 hidden sm:inline">
                  SI-GABUNG 54
                </span>
              </div>
              <p className="text-[10px] text-slate-500 hidden sm:block">
                Layanan Asrama Mahasiswa Terpadu
              </p>
            </div>
          </div>

          {/* Zone 2: Fast Role Selector for QA Tester (Quiet Text Dropdown/Buttons) */}
          {isLoggedIn && onSwitchRole && (
            <div className="hidden md:flex items-center gap-1 text-xs text-slate-600 bg-slate-100 p-1 rounded-lg">
              <span className="text-[11px] text-slate-600 font-medium px-2">Peran:</span>
              <button
                type="button"
                onClick={() => onSwitchRole('maba')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                  currentRole === 'maba'
                    ? 'bg-white text-teal-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Mahasiswa Baru
              </button>
              <button
                type="button"
                onClick={() => onSwitchRole('admin_keuangan')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                  currentRole === 'admin_keuangan'
                    ? 'bg-white text-teal-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Admin Keuangan
              </button>
              <button
                type="button"
                onClick={() => onSwitchRole('admin_asrama')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                  currentRole === 'admin_asrama'
                    ? 'bg-white text-teal-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Admin Asrama
              </button>
            </div>
          )}

          {/* Zone 3: Actions (Mode Switch & Logout) */}
          <div className="flex items-center gap-2">
            <ProductionModeSwitch compact />

            {isLoggedIn ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <span className="hidden sm:inline text-xs font-semibold text-slate-700 max-w-[140px] truncate">
                  {userName || 'Tester UAT'}
                </span>
                <button
                  type="button"
                  onClick={onLogout}
                  className="text-xs text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-md font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Keluar</span>
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </header>

      {/* TESTING NOTICE BAR */}
      <div className="bg-slate-900 text-slate-200 text-xs px-4 py-2 border-b border-slate-800">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-teal-400"></span>
            <span className="font-semibold text-slate-100">Fokus Alur Pengujian:</span>
            <span className="text-slate-300">
              Pendaftaran Mahasiswa → Verifikasi e-KYC → Kunci Kamar → Billing &amp; Struk → Kontrak OTP → Tiket
            </span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            Banner promosi &amp; widget dev tools disembunyikan
          </div>
        </div>
      </div>

      {/* MAIN VIEWPORT */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6">
        {children}
      </main>

      {/* QUIET FOOTER */}
      <footer className="border-t border-slate-200 bg-white py-4 mt-auto">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <div>
            &copy; {new Date().getFullYear()} Universitas Bunda Thamrin · Portal Layanan Asrama Mahasiswa (Roemah 54)
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1 text-emerald-800 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              MySQL Laragon: asrama_ubt_db
            </span>
            <span>·</span>
            <button
              type="button"
              onClick={toggleCleanTesting}
              className="text-slate-600 hover:text-slate-900 underline cursor-pointer"
            >
              {isCleanTesting ? 'Buka Mode Simulasi' : 'Kembali ke Mode Produksi'}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
