import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Copy, Check, ChevronDown, ChevronUp, RotateCcw, Terminal } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
  copied: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: true, // Terbuka otomatis agar rincian baris kode teknis langsung terlihat oleh programmer
      copied: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });
    console.error('[SI-GABUNG 54 ErrorBoundary]', error, errorInfo);
  }

  handleReload = (): void => {
    window.location.reload();
  };

  handleResetSessionAndReload = (): void => {
    try {
      window.localStorage?.clear();
      window.sessionStorage?.clear();
    } catch {
      // Ignore storage access errors
    }
    window.location.reload();
  };

  handleGoLogin = (): void => {
    window.location.href = '/';
  };

  getFormattedReport = (): string => {
    return `=== [SI-GABUNG 54 — LAPORAN DEBUG TEKNIS UNTUK PROGRAMMER] ===
Waktu Kejadian : ${new Date().toISOString()}
URL Aktif      : ${typeof window !== 'undefined' ? window.location.href : 'N/A'}
User Agent     : ${typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A'}
Tipe Error     : ${this.state.error?.name || 'Error'}
Pesan Error    : ${this.state.error?.message || this.state.error?.toString() || 'Unknown'}

--- [1] BARIS KODE & STACK TRACE ---
${this.state.error?.stack || 'Stack trace tidak tersedia.'}

--- [2] HIERARKI KOMPONEN REACT (COMPONENT STACK) ---
${this.state.errorInfo?.componentStack?.trim() || 'Component stack tidak tersedia.'}

--- [3] PETUNJUK FILE INTI PROYEK ---
• Pusat Aturan Bisnis & Tarif : src/config/asramaBusinessRules.ts
• Data Awal & Skema           : src/data/initialData.ts
• Halaman Login SSO NIM & PMB : src/components/auth/LoginDualTab.tsx
• Dashboard Pendaftaran Maba  : src/components/maba/MabaDashboard.tsx
• Dashboard Mahasiswa Lama    : src/components/eksisting/EksistingDashboard.tsx
==============================================================`;
  };

  handleCopy = (): void => {
    const errorText = this.getFormattedReport();
    navigator.clipboard?.writeText(errorText).then(() => {
      this.setState({ copied: true });
      setTimeout(() => this.setState({ copied: false }), 2500);
    }).catch(() => {
      // Fallback if clipboard API is blocked
    });
  };

  toggleDetails = (): void => {
    this.setState((prev) => ({ showDetails: !prev.showDetails }));
  };

  render(): ReactNode {
    if (this.state.hasError) {
      const title = this.props.fallbackTitle || 'Terjadi Eksepsi Runtime pada Komponen Antarmuka';
      const message = this.props.fallbackMessage || 
        'Rincian baris kode teknis (Stack Trace & Component Tree) ditampilkan di bawah ini agar dapat langsung disalin dan diserahkan kepada programmer untuk perbaikan cepat.';

      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 font-sans">
          <div className="w-full max-w-3xl bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Header Status */}
            <div className="p-6 bg-rose-50 border-b border-rose-100 flex items-start justify-between gap-4">
              <div className="flex items-start gap-4 min-w-0">
                <div className="w-11 h-11 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-xs text-rose-800 font-semibold mb-1">
                    <span>Panel Diagnostik Teknis Programmer</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums">{new Date().toLocaleTimeString('id-ID')}</span>
                  </div>
                  <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                    {title}
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                    {message}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={this.handleCopy}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors shrink-0 whitespace-nowrap cursor-pointer"
              >
                {this.state.copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-300">Laporan Tersalin</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Salin Laporan untuk Programmer</span>
                  </>
                )}
              </button>
            </div>

            {/* Diagnostic Content */}
            <div className="p-6 space-y-5">
              {/* Pesan Kesalahan Utama */}
              {this.state.error && (
                <div className="p-4 rounded-xl bg-slate-900 text-rose-300 font-mono text-xs overflow-x-auto border border-slate-800">
                  <div className="text-slate-400 font-semibold mb-1.5 text-[11px] flex items-center gap-2">
                    <Terminal className="w-3.5 h-3.5 text-rose-400" />
                    <span>Pesan Eksepsi Utama ({this.state.error.name || 'RuntimeError'}):</span>
                  </div>
                  <div className="text-rose-200 font-semibold leading-relaxed">
                    {this.state.error.message || this.state.error.toString()}
                  </div>
                </div>
              )}

              {/* Rincian Teknis (Terbuka Otomatis untuk Programmer) */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={this.toggleDetails}
                  className="w-full px-4 py-2.5 bg-slate-100 hover:bg-slate-200/70 flex items-center justify-between text-xs font-semibold text-slate-800 transition-colors cursor-pointer"
                >
                  <span>Rincian Baris Kode Teknis (Stack Trace & Component Stack)</span>
                  {this.state.showDetails ? (
                    <ChevronUp className="w-4 h-4 text-slate-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-500" />
                  )}
                </button>
                {this.state.showDetails && (
                  <div className="p-4 bg-slate-950 text-slate-300 font-mono tabular-nums text-[11px] max-h-72 overflow-y-auto whitespace-pre-wrap leading-relaxed space-y-3">
                    <div>
                      <div className="text-emerald-400 font-bold mb-1">[1] Lokasi File & Baris Kode (Error Stack):</div>
                      {this.state.error?.stack || 'Stack trace tidak tersedia.'}
                    </div>
                    {this.state.errorInfo?.componentStack && (
                      <div className="pt-3 border-t border-slate-800 text-slate-400">
                        <div className="text-amber-300 font-bold mb-1">[2] Hierarki Komponen React (Component Stack):</div>
                        {this.state.errorInfo.componentStack.trim()}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Petunjuk Peta File untuk Debug Manual */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600 space-y-2">
                <div className="font-bold text-slate-900 text-xs">
                  Peta Lokasi File Utama untuk Pemeriksaan Manual Programmer:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono text-slate-700">
                  <div>• Aturan Tarif & 48 Jam: <span className="text-slate-900 font-semibold">src/config/asramaBusinessRules.ts</span></div>
                  <div>• Gerbang Login SSO NIM: <span className="text-slate-900 font-semibold">src/components/auth/LoginDualTab.tsx</span></div>
                  <div>• Alur Pendaftaran Maba: <span className="text-slate-900 font-semibold">src/components/maba/MabaDashboard.tsx</span></div>
                  <div>• Perpanjangan Bulanan: <span className="text-slate-900 font-semibold">src/components/eksisting/EksistingDashboard.tsx</span></div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-1 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={this.handleReload}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-sm transition-all whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Muat Ulang Halaman</span>
                </button>
                <button
                  type="button"
                  onClick={this.handleResetSessionAndReload}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 font-semibold text-xs border border-amber-200 transition-all whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4 text-amber-700" />
                  <span>Reset State Sesi & Muat Ulang</span>
                </button>
                <button
                  type="button"
                  onClick={this.handleGoLogin}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs border border-slate-200 transition-all whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Home className="w-4 h-4" />
                  <span>Kembali ke Halaman Utama</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

