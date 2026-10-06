import React, { useState } from 'react';
import { ShieldCheck, LogIn, Sparkles, KeyRound, AlertCircle, ArrowRight, CheckCircle2, Database, AlertTriangle, Building, RefreshCw, X, Loader2 } from 'lucide-react';
import { UserRole } from '../../types/asrama';

interface LoginDualTabProps {
  onLoginSuccess: (role: UserRole, nim: string, nama: string, notice?: string, scenario?: string) => void;
}

export const LoginDualTab: React.FC<LoginDualTabProps> = ({ onLoginSuccess }) => {
  const [viewMode, setViewMode] = useState<'main' | 'sso'>('main');
  const [showPmbModal, setShowPmbModal] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleOpenPmb = () => {
    setShowPmbModal(true);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4500);
  };
  const [isRedirectingSso, setIsRedirectingSso] = useState(false);

  // Form State Maba
  const [pmbNoReg, setPmbNoReg] = useState('PMB2026-08942');
  const [mabaBirthDate, setMabaBirthDate] = useState('2007-04-12');

  // Form State SSO Eksisting
  const [ssoUsername, setSsoUsername] = useState('2240101088'); // Default to Non-Active Resident to demonstrate the pathway requirement
  const [ssoPassword, setSsoPassword] = useState('••••••••••••');
  const [selectedSsoAccount, setSelectedSsoAccount] = useState<'NON_ACTIVE' | 'ACTIVE_RESIDENT' | 'ACTIVE_RESIDENT_INSTALLMENT' | 'ACTIVE_RESIDENT_RENEWAL'>('NON_ACTIVE');

  // Database Verification Overlay/Modal state
  const [isCheckingSsoDb, setIsCheckingSsoDb] = useState(false);
  const [ssoCheckStep, setSsoCheckStep] = useState<number>(0); // 0 = idle, 1 = SSO auth, 2 = DB query, 3 = Evaluated
  const [showRedirectModal, setShowRedirectModal] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedScenario, setSelectedScenario] = useState<'NEW' | 'INVOICE_FORMED'>('NEW');

  
  const handleSsoRedirectClick = () => {
    setIsRedirectingSso(true);
    setTimeout(() => {
      setIsRedirectingSso(false);
      setViewMode('sso');
    }, 1200); // Simulate network delay/redirect
  };

  const handleMabaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    setTimeout(() => {
      setIsLoading(false);
      if (pmbNoReg.trim().length < 5) {
        setErrorMessage('Nomor Registrasi PMB / NIM awal tidak ditemukan di database SIAKAD UBT.');
        return;
      }
      onLoginSuccess('maba', pmbNoReg, 'Maximilian Wimin Winata', undefined, selectedScenario);
    }, 600);
  };

  const handleSsoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (ssoUsername.trim().length < 5) {
      setErrorMessage('Credential Single Sign On (SSO) UBT tidak valid.');
      return;
    }

    // Start animated SSO Database Check pathway
    setIsCheckingSsoDb(true);
    setSsoCheckStep(1); // Step 1: SSO Credential Auth

    setTimeout(() => {
      setSsoCheckStep(2); // Step 2: Querying DB_ASRAMA_UBT

      setTimeout(() => {
        setSsoCheckStep(3); // Step 3: Result Evaluated
        setIsCheckingSsoDb(false);

        if (selectedSsoAccount === 'NON_ACTIVE' || ssoUsername.includes('88') || ssoUsername.toLowerCase().includes('max')) {
          // NOT AN ACTIVE RESIDENT -> Show Modal explaining redirection to Pendaftaran
          setShowRedirectModal(true);
        } else {
          // ALREADY AN ACTIVE RESIDENT -> Direct to Eksisting Dashboard
          onLoginSuccess('eksisting', ssoUsername, 'Ahmad Raihan', undefined, selectedSsoAccount);
        }
      }, 700);
    }, 600);
  };

  const handleProceedToRegistration = () => {
    setShowRedirectModal(false);
    onLoginSuccess(
      'maba',
      ssoUsername,
      'Maximilian Wimin Winata',
      `SSO Login Berhasil: Terverifikasi di SIAKAD UBT (NIM ${ssoUsername}), namun terdeteksi BELUM TERDAFTAR sebagai Penghuni Aktif Asrama. Sesuai regulasi, Anda diarahkan untuk menyelesaikan tahapan proses pendaftaran.`
    );
  };

  return (
    <div id="login-container" className="min-h-[100dvh] sm:min-h-[calc(100vh-120px)] bg-slate-100 flex flex-col justify-end sm:justify-center items-center p-0 sm:py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Visual Background Soft Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-blue-200/40 rounded-full blur-3xl pointer-events-none" />

      {/* Main Card Wrapper */}
      <div className="w-full h-full sm:h-auto max-w-4xl bg-transparent sm:bg-white sm:border border-slate-200 sm:rounded-2xl sm:shadow-xl overflow-hidden z-10 flex flex-col sm:grid sm:grid-cols-1 md:grid-cols-12">
        {/* Left Visual Branding Panel */}
        <div className="flex-1 md:col-span-5 bg-gradient-to-br from-teal-800 via-teal-900 to-slate-900 p-8 flex flex-col justify-center sm:justify-between sm:border-r border-teal-700 text-white relative">
          <div 
            className="space-y-6 cursor-pointer sm:cursor-default"
            onClick={() => {
              if (window.innerWidth < 640) {
                document.getElementById('login-form-panel')?.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          >
            <div className="flex items-center space-x-2.5">
              <span className="bg-emerald-400/20 text-emerald-300 text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border border-emerald-400/30">
                PORTAL SI-GABUNG
              </span>
              <span className="text-xs text-teal-200 font-bold">ROEMAH 54</span>
            </div>

            <div className="space-y-3 pt-2">
              <h3 className="text-2xl font-black text-white tracking-tight leading-snug">
                Selamat Datang di Portal SI-GABUNG
              </h3>
              <p className="text-sm sm:text-base text-teal-50 font-medium leading-relaxed">
                Langkah Awal Menuju Rumah Keduamu di Asrama UBT
              </p>
              <p className="text-xs text-teal-100/80 leading-relaxed pt-2 border-t border-teal-800/50">
                Silakan masuk menggunakan akun PMB (SIMABA) atau SSO kampus Anda.
              </p>
            </div>

            <div className="space-y-2.5 pt-2 hidden sm:block">
              <div className="flex items-center space-x-2 text-xs text-teal-50">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Single Sign-On (SSO) Terintegrasi SIAKAD</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-teal-50">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Private File Storage (Keamanan e-KYC)</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-teal-50">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>TTD Kontrak Digital OTP WhatsApp</span>
              </div>
            </div>
          </div>

          <div className="pt-8 sm:border-t border-teal-700/80 text-[11px] text-teal-200 flex items-center justify-between hidden sm:flex">
            <span>Universitas Bunda Thamrin (UBT)</span>
            <span className="font-mono text-teal-300 font-bold">v14.0</span>
          </div>
        </div>

        {/* Right Form Panel (Bottom Sheet on Mobile) */}
        <div id="login-form-panel" className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-end sm:justify-center bg-slate-50 relative rounded-t-[2.5rem] sm:rounded-none -mt-10 sm:mt-0 shadow-[0_-10px_40px_rgba(0,0,0,0.15)] sm:shadow-none z-20 pb-10 sm:pb-8">
          
          {/* Mobile Drag Handle Indicator */}
          <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6 sm:hidden"></div>

          {viewMode === 'main' && (
            <div className="max-w-md w-full mx-auto bg-white rounded-2xl shadow-none sm:shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:border border-slate-100 overflow-hidden relative">
              <div className="p-8 space-y-8">
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-100 shadow-sm">
                    <Building className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-800">Selamat Datang</h3>
                  <p className="text-sm text-slate-500">Silakan login menggunakan akun SSO UBT</p>
                </div>
                
                <div className="space-y-4 pt-4">
                  <button
                    onClick={handleSsoRedirectClick}
                    className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold py-3.5 rounded-xl text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
                  >
                    <span>Login SSO UBT</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <div className="flex items-center justify-center space-x-3 py-2">
                    <div className="h-px bg-slate-200 flex-1"></div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ATAU</span>
                    <div className="h-px bg-slate-200 flex-1"></div>
                  </div>

                  <button
                    onClick={handleOpenPmb}
                    className="w-full bg-white border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-bold py-3.5 rounded-xl text-sm transition-all flex items-center justify-center"
                  >
                    Pendaftaran Asrama (Jalur PMB)
                  </button>
                </div>
              </div>
              
              <div className="bg-slate-50/80 py-4 text-center border-t border-slate-100">
                <p className="text-[10px] text-slate-400 font-medium">&copy;2026 ASRAMA Universitas Bunda Thamrin</p>
              </div>
            </div>
          )}

          {viewMode === 'sso' && (
            <div className="max-w-md w-full mx-auto">
              <button onClick={() => setViewMode('main')} className="mb-6 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-500 flex items-center gap-2 hover:text-slate-800 hover:bg-slate-50 transition-colors shadow-sm inline-flex">
                &larr; Kembali
              </button>
              <form id="form-sso-login" onSubmit={handleSsoSubmit} className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-950 space-y-1.5">
                <div className="flex items-center space-x-2 font-bold">
                  <ShieldCheck className="w-4 h-4 text-blue-700 flex-shrink-0" />
                  <span>Single Sign On (SSO) Terintegrasi DB Asrama UBT</span>
                </div>
                <p className="text-[11px] text-blue-900 leading-relaxed">
                  Sistem mengecek status keanggotaan di Database Asrama. Mahasiswa yang <strong>belum terdaftar sebagai penghuni aktif</strong> akan diarahkan untuk melalui tahapan proses pendaftaran.
                </p>
              </div>

              {/* SIMULATOR PILIHAN STATUS MAHAKOT / EKSISTING */}
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl space-y-2">
                <label className="text-[11px] font-bold text-slate-800 flex items-center justify-between">
                  <span>Simulasi Status Database Mahasiswa Eksisting:</span>
                  <span className="text-[10px] text-teal-800 font-mono font-bold">[DB Check Handler]</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedSsoAccount('NON_ACTIVE');
                      setSsoUsername('2240101088');
                    }}
                    className={`p-2.5 rounded-lg border text-left transition-all ${
                      selectedSsoAccount === 'NON_ACTIVE'
                        ? 'bg-amber-50 border-amber-500 ring-1 ring-amber-500 text-amber-950 font-bold'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] mb-0.5">
                      <span className="font-mono text-amber-900">NIM: 2240101088</span>
                      <span className="bg-amber-100 text-amber-800 text-[9px] px-1.5 py-0.5 rounded font-bold">
                        BUKAN PENGHUNI
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-600 font-normal">
                      Maximilian Winata • Belum Terdaftar Asrama (Ke Pendaftaran)
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedSsoAccount('ACTIVE_RESIDENT');
                      setSsoUsername('2240101004');
                    }}
                    className={`p-2.5 rounded-lg border text-left transition-all ${
                      selectedSsoAccount === 'ACTIVE_RESIDENT'
                        ? 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500 text-emerald-950 font-bold'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] mb-0.5">
                      <span className="font-mono text-emerald-900">NIM: 2240101004</span>
                      <span className="bg-emerald-100 text-emerald-800 text-[9px] px-1.5 py-0.5 rounded font-bold">
                        PENGHUNI AKTIF
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-600 font-normal">
                      Ahmad Raihan • Kamar 101 Gedung A (Ke Dashboard Eksisting)
                    </div>
                  </button>
                  {import.meta.env.DEV && (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedSsoAccount('ACTIVE_RESIDENT_INSTALLMENT');
                          setSsoUsername('2240101004');
                        }}
                        className={`p-2.5 rounded-lg border text-left transition-all ${
                          selectedSsoAccount === 'ACTIVE_RESIDENT_INSTALLMENT'
                            ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500 text-blue-950 font-bold'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[11px] mb-0.5">
                          <span className="font-mono text-blue-900">[DEV] Skenario 3</span>
                          <span className="bg-blue-100 text-blue-800 text-[9px] px-1.5 py-0.5 rounded font-bold">
                            CICILAN DEPOSIT
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-600 font-normal">
                          Menunggak Cicilan ke-2 (Auto-Resume ke Form Bayar)
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedSsoAccount('ACTIVE_RESIDENT_RENEWAL');
                          setSsoUsername('2240101004');
                        }}
                        className={`p-2.5 rounded-lg border text-left transition-all ${
                          selectedSsoAccount === 'ACTIVE_RESIDENT_RENEWAL'
                            ? 'bg-purple-50 border-purple-500 ring-1 ring-purple-500 text-purple-950 font-bold'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[11px] mb-0.5">
                          <span className="font-mono text-purple-900">[DEV] Skenario 2</span>
                          <span className="bg-purple-100 text-purple-800 text-[9px] px-1.5 py-0.5 rounded font-bold">
                            DRAFT RENEWAL
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-600 font-normal">
                          Draft Perpanjangan Sewa (Auto-Resume Banner)
                        </div>
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  NIM Mahasiswa Aktif SIAKAD
                </label>
                <input
                  id="input-sso-username"
                  type="text"
                  value={ssoUsername}
                  onChange={(e) => setSsoUsername(e.target.value)}
                  placeholder="Contoh: 2240101088"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white font-mono shadow-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Password SSO SIAKAD
                </label>
                <input
                  id="input-sso-password"
                  type="password"
                  value={ssoPassword}
                  onChange={(e) => setSsoPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white shadow-sm"
                  required
                />
              </div>

              <div className="pt-2">
                <button
                  id="button-submit-sso"
                  type="submit"
                  disabled={isCheckingSsoDb}
                  className="w-full bg-blue-700 hover:bg-blue-800 disabled:opacity-60 text-white font-bold py-2.5 rounded-lg text-sm transition-all flex items-center justify-center space-x-2 shadow-md"
                >
                  {isCheckingSsoDb ? (
                    <span className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-blue-200" />
                      <span>Proses Verifikasi Database SSO...</span>
                    </span>
                  ) : (
                    <>
                      <span>Masuk via SSO UBT & Check Status Database</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
            </div>
          )}

          {showPmbModal && (
            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 sm:p-0">
              <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden relative animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white/90 backdrop-blur-md flex items-center justify-between p-6 border-b border-slate-100 z-10">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Pendaftaran Maba</h3>
                    <p className="text-xs text-slate-500">Jalur Penerimaan Mahasiswa Baru</p>
                  </div>
                  <button onClick={() => setShowPmbModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-6 bg-slate-50/50">
                  <form id="form-maba-login" onSubmit={handleMabaSubmit} className="space-y-4">
              <div className="bg-teal-50 border border-teal-200 rounded-lg p-3 text-xs text-teal-900 flex items-start space-x-2">
                <Sparkles className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Klaim Data PMB UBT</span>
                  Gunakan Nomor Registrasi PMB atau NIM Sementara yang tercantum pada Bukti Kelulusan UBT.
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nomor Registrasi PMB / NIM Awal
                </label>
                <input
                  id="input-pmb-noreg"
                  type="text"
                  value={pmbNoReg}
                  onChange={(e) => setPmbNoReg(e.target.value)}
                  placeholder="Contoh: PMB2026-08942"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-teal-600 focus:bg-white font-mono shadow-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tanggal Lahir (Verifikasi Identitas PMB)
                </label>
                <input
                  id="input-pmb-birthdate"
                  type="date"
                  value={mabaBirthDate}
                  onChange={(e) => setMabaBirthDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-teal-600 focus:bg-white shadow-sm"
                  required
                />
              </div>

              {import.meta.env.DEV && (
                <div className="pt-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    [DEV ONLY] Simulasi Skenario Resume (Auto-Jump):
                  </label>
                  <select
                    value={selectedScenario}
                    onChange={(e) => setSelectedScenario(e.target.value as 'NEW' | 'INVOICE_FORMED')}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:border-teal-600 focus:bg-white shadow-sm mb-2"
                  >
                    <option value="NEW">Maba Baru (Mulai dari Form e-KYC - Step 1)</option>
                    <option value="INVOICE_FORMED">Tagihan Sudah Terbentuk & Belum Transfer (Resume ke Step 3)</option>
                  </select>
                </div>
              )}

              <div className="pt-2">
                <button
                  id="button-submit-maba"
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-teal-700 hover:bg-teal-800 text-white font-bold py-2.5 rounded-lg text-sm transition-all flex items-center justify-center space-x-2 shadow-md"
                >
                  {isLoading ? (
                    <span>Memverifikasi SIAKAD...</span>
                  ) : (
                    <>
                      <span>Masuk & Lanjutkan Admisi (6 Langkah)</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
                </div>
              </div>
            </div>
          )}
        </div>
      
      </div>

      
      {/* OVERLAY SIMULATING SSO REDIRECT */}
      {isRedirectingSso && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-sm w-full border border-slate-200 shadow-2xl flex flex-col items-center justify-center text-center space-y-4">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
            <div>
              <h3 className="font-bold text-lg text-slate-900">Mengalihkan...</h3>
              <p className="text-xs text-slate-500 mt-1">Membuka gerbang SSO SI-DARA UBT</p>
            </div>
          </div>
        </div>
      )}

      {/* OVERLAY LOADING SSO VERIFICATION STEP */}
      {isCheckingSsoDb && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 bg-blue-50 text-blue-700 rounded-full flex items-center justify-center mx-auto border border-blue-200 animate-pulse">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">Verifikasi Database Status Asrama</h3>
              <p className="text-xs text-slate-500 mt-1">
                SIAKAD UBT Single Sign-On Gateway & DB_ASRAMA_UBT
              </p>
            </div>

            <div className="space-y-2 text-left bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs font-mono">
              <div className={`flex items-center justify-between ${ssoCheckStep >= 1 ? 'text-emerald-700 font-bold' : 'text-slate-400'}`}>
                <span>1. Authenticating SSO Credential...</span>
                <span>{ssoCheckStep >= 1 ? 'OK ✓' : '...'}</span>
              </div>
              <div className={`flex items-center justify-between ${ssoCheckStep >= 2 ? 'text-emerald-700 font-bold' : 'text-slate-400'}`}>
                <span>2. Querying DB_ASRAMA (t_penghuni)...</span>
                <span>{ssoCheckStep >= 2 ? 'OK ✓' : '...'}</span>
              </div>
              <div className={`flex items-center justify-between ${ssoCheckStep >= 3 ? 'text-blue-800 font-bold' : 'text-slate-400'}`}>
                <span>3. Evaluating Resident Status...</span>
                <span>{ssoCheckStep >= 3 ? 'Done ✓' : '...'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL REDIRECTION FOR NON-ACTIVE RESIDENT SSO */}
      {showRedirectModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 shadow-2xl space-y-5">
            <div className="w-12 h-12 bg-amber-100 text-amber-800 rounded-2xl flex items-center justify-center border border-amber-300">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="bg-amber-100 text-amber-900 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border border-amber-300">
                  STATUS: BELUM PENGHUNI AKTIF
                </span>
                <span className="text-xs text-slate-500 font-mono">NIM: {ssoUsername}</span>
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Akses SSO Berhasil — Diarahkan ke Form Pendaftaran
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Kredensial SSO SIAKAD UBT atas nama <strong className="text-slate-900">Maximilian Wimin Winata</strong> ({ssoUsername}) terverifikasi valid.
                Namun, hasil query pada <strong>DB_ASRAMA_UBT</strong> menunjukkan Anda <strong>belum terdaftar sebagai Penghuni Aktif</strong>.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-2 text-xs">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <Building className="w-4 h-4 text-teal-700" />
                <span>Tahapan Pendaftaran Wajib Mahasiswa Asrama:</span>
              </div>
              <ul className="text-slate-600 space-y-1 pl-5 list-disc text-[11px]">
                <li>Langkah 1: Pengisian Form Pendaftaran & e-KYC (Private Disk)</li>
                <li>Langkah 2: Pemilihan Durasi Sewa & Skema Uang Deposit (1x / Cicil)</li>
                <li>Langkah 3: Pembayaran Tagihan Unik & Verifikasi Bank</li>
                <li>Langkah 4: Plotting Kamar Asrama Otomatis</li>
                <li>Langkah 5: TTD Digital Kontrak Sewa OTP WhatsApp</li>
                <li>Langkah 6: Penerbitan E-Ticket Check-In Kamar</li>
              </ul>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowRedirectModal(false)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 border border-slate-300"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleProceedToRegistration}
                className="w-full sm:w-auto bg-emerald-900 hover:bg-emerald-800 text-white text-xs font-bold px-6 py-3 rounded-xl shadow-md flex items-center justify-center space-x-2"
              >
                <span>Lanjutkan ke Form Pendaftaran Asrama →</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>

  );
};