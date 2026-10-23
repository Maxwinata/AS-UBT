import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';

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
      showDetails: false,
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

  handleGoLogin = (): void => {
    window.location.href = '/login';
  };

  handleCopy = (): void => {
    const errorText = `[SI-GABUNG 54 Diagnostic Report]
Waktu: ${new Date().toISOString()}
URL: ${typeof window !== 'undefined' ? window.location.href : 'N/A'}
Pesan Error: ${this.state.error?.toString() || 'Unknown'}
Stack:
${this.state.error?.stack || 'N/A'}
Component Stack:
${this.state.errorInfo?.componentStack || 'N/A'}`;

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
      const title = this.props.fallbackTitle || 'Terjadi Kendala Memuat Antarmuka';
      const message = this.props.fallbackMessage || 
        'Sistem Informasi Asrama UBT mendeteksi kesalahan rendering komponen pada peramban. Halaman diamankan agar tidak terjadi crash total.';

      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 font-sans">
          <div className="w-full max-w-2xl bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
            {/* Header Status */}
            <div className="p-6 bg-rose-50 border-b border-rose-100 flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-200/60 text-rose-800 text-xs font-bold mb-1.5">
                  <span>Diagnostic Recovery Mode</span>
                </div>
                <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                  {title}
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                  {message}
                </p>
              </div>
            </div>

            {/* Diagnostic Content */}
            <div className="p-6 space-y-5">
              {/* Pesan Kesalahan Singkat */}
              {this.state.error && (
                <div className="p-3.5 rounded-xl bg-slate-900 text-rose-300 font-mono text-xs overflow-x-auto border border-slate-800">
                  <div className="text-slate-400 font-bold mb-1 text-[11px] uppercase tracking-wider">
                    Error Log Singkat:
                  </div>
                  <div>{this.state.error.toString()}</div>
                </div>
              )}

              {/* Panduan Diagnostik Laragon & Database */}
              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4 text-xs text-slate-600 space-y-2">
                <div className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <span>Langkah Cepat Pemulihan (Laragon / Local):</span>
                </div>
                <ul className="list-disc pl-5 space-y-1 text-slate-600 leading-relaxed">
                  <li>
                    <strong>Koneksi Database:</strong> Pastikan MySQL Laragon aktif dan database <code className="text-slate-900 font-mono bg-slate-200/70 px-1 py-0.5 rounded">asrama_ubt_db</code> serta <code className="text-slate-900 font-mono bg-slate-200/70 px-1 py-0.5 rounded">u540633926_simaba</code> telah dimigrasi/diseed.
                  </li>
                  <li>
                    <strong>Cache Laravel:</strong> Jalankan perintah di Terminal: <code className="text-slate-900 font-mono bg-slate-200/70 px-1 py-0.5 rounded">php artisan optimize:clear</code>
                  </li>
                  <li>
                    <strong>Build Frontend Vite:</strong> Jalankan perintah: <code className="text-slate-900 font-mono bg-slate-200/70 px-1 py-0.5 rounded">npm run build</code>
                  </li>
                </ul>
              </div>

              {/* Toggle Detail Teknis */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={this.toggleDetails}
                  className="w-full px-4 py-2.5 bg-slate-100/70 hover:bg-slate-100 flex items-center justify-between text-xs font-semibold text-slate-700 transition-colors"
                >
                  <span>Rincian Teknis (Stack Trace)</span>
                  {this.state.showDetails ? (
                    <ChevronUp className="w-4 h-4 text-slate-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-500" />
                  )}
                </button>
                {this.state.showDetails && (
                  <div className="p-3 bg-slate-950 text-slate-300 font-mono text-[11px] max-h-56 overflow-y-auto whitespace-pre-wrap leading-tight">
                    {this.state.error?.stack || 'Stack trace tidak tersedia.'}
                    {this.state.errorInfo?.componentStack && (
                      <div className="mt-3 pt-2 border-t border-slate-800 text-slate-400">
                        Component Stack:
                        {this.state.errorInfo.componentStack}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={this.handleReload}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-sm transition-all cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Muat Ulang Halaman</span>
                </button>
                <button
                  type="button"
                  onClick={this.handleGoLogin}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs border border-slate-200 transition-all cursor-pointer"
                >
                  <Home className="w-4 h-4" />
                  <span>Kembali ke Gerbang Login</span>
                </button>
                <button
                  type="button"
                  onClick={this.handleCopy}
                  className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 font-medium text-xs border border-slate-200 transition-all ml-auto cursor-pointer"
                >
                  {this.state.copied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span className="text-emerald-700 font-semibold">Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Salin Detail Error</span>
                    </>
                  )}
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
