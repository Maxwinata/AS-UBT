import React, { useState } from 'react';
import { Layers, GitCommit, FileCode, ShieldCheck, CheckCircle2, ArrowRight, Zap, Database, Server, User, Lock } from 'lucide-react';

export const DFDViewer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dfd0' | 'dfd1' | 'workflow' | 'security'>('dfd1');

  return (
    <div id="dfd-viewer-root" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-purple-500/20 text-purple-300 text-xs px-2.5 py-0.5 rounded-full font-mono border border-purple-500/30">
              SINGLE SOURCE OF TRUTH ARCHITECTURE
            </span>
            <span className="text-xs text-slate-400">• DFD & Workflows System Specs</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Arsitektur Data & Logic Chart Asrama UBT</h2>
          <p className="text-xs text-slate-300">
            Dokumentasi resmi DFD Level 0, DFD Level 1 (P1-P6), Workflow Decision Chart, dan Keamanan Private Storage e-KYC.
          </p>
        </div>
      </div>

      {/* DIAGRAM TABS */}
      <div className="flex space-x-2 bg-slate-900 p-1.5 rounded-xl border border-slate-800 text-xs">
        <button
          onClick={() => setActiveTab('dfd1')}
          className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'dfd1' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>DFD Level 1 (P1 - P6 Fase A)</span>
        </button>

        <button
          onClick={() => setActiveTab('dfd0')}
          className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'dfd0' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          <Server className="w-4 h-4" />
          <span>DFD Level 0 (Context Diagram)</span>
        </button>

        <button
          onClick={() => setActiveTab('workflow')}
          className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'workflow' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          <GitCommit className="w-4 h-4" />
          <span>Workflow Conditional Logic Chart</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'security' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>Keamanan Private Storage e-KYC</span>
        </button>
      </div>

      {/* TAB 1: DFD LEVEL 1 (P1 - P6) */}
      {activeTab === 'dfd1' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white">DFD Level 1: Dekomposisi 6 Proses Utama Admisi (Fase A)</h3>
            <p className="text-xs text-slate-400">Rincian aliran data dari P1 hingga P6 sesuai standar Neuroscience & Progressive Disclosure.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* P1 */}
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-mono text-xs font-bold text-purple-400 bg-purple-950 border border-purple-800 px-2 py-0.5 rounded">
                  P1: Login & Klaim
                </span>
                <span className="text-[10px] text-slate-500">Dual-Tab v6</span>
              </div>
              <h4 className="font-bold text-xs text-white">Authentifikasi Terpadu</h4>
              <p className="text-[11px] text-slate-300">
                Mengambil data awal mahasiswa baru dari SIAKAD PMB atau SSO UBT terintegrasi.
              </p>
            </div>

            {/* P2 */}
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-mono text-xs font-bold text-teal-400 bg-teal-950 border border-teal-800 px-2 py-0.5 rounded">
                  P2: Pendaftaran & e-KYC
                </span>
                <span className="text-[10px] text-slate-500">Private Disk</span>
              </div>
              <h4 className="font-bold text-xs text-white">Form & Encrypted KYC</h4>
              <p className="text-[11px] text-slate-300">
                Verifikasi biodata & upload KTP/Selfie yang disimpan di Private Storage (bukan public web).
              </p>
            </div>

            {/* P3 */}
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-mono text-xs font-bold text-amber-400 bg-amber-950 border border-amber-800 px-2 py-0.5 rounded">
                  P3: Tagihan Unik
                </span>
                <span className="text-[10px] text-slate-500">Kalibrasi v11</span>
              </div>
              <h4 className="font-bold text-xs text-white">Invoice Kode 3-Digit</h4>
              <p className="text-[11px] text-slate-300">
                Generate tagihan Sewa + Deposit dengan nominal 3 digit unik (contoh: Rp 3.750.142).
              </p>
            </div>

            {/* P4 */}
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-mono text-xs font-bold text-blue-400 bg-blue-950 border border-blue-800 px-2 py-0.5 rounded">
                  P4: Verifikasi & Plotting
                </span>
                <span className="text-[10px] text-slate-500">Admin Dual</span>
              </div>
              <h4 className="font-bold text-xs text-white">Verifikasi Keuangan & Room</h4>
              <p className="text-[11px] text-slate-300">
                Admin Keuangan memvalidasi bayar / webhook VA, Admin Asrama memplot kamar gedung.
              </p>
            </div>

            {/* P5 */}
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-950 border border-indigo-800 px-2 py-0.5 rounded">
                  P5: Kontrak Digital
                </span>
                <span className="text-[10px] text-slate-500">OTP WA</span>
              </div>
              <h4 className="font-bold text-xs text-white">TTD Sah OTP WhatsApp</h4>
              <p className="text-[11px] text-slate-300">
                Pengesahan Kontrak Kolektif & Pakta Integritas dengan aturan deposit hangus jika melanggar.
              </p>
            </div>

            {/* P6 */}
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-950 border border-emerald-800 px-2 py-0.5 rounded">
                  P6: Aktivasi e-Ticket
                </span>
                <span className="text-[10px] text-slate-500">Barcode/QR</span>
              </div>
              <h4 className="font-bold text-xs text-white">Penerbitan Pass Check-in</h4>
              <p className="text-[11px] text-slate-300">
                Terbitan e-Ticket digital scannable untuk proses check-in fisik di gerbang Asrama UBT.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DFD LEVEL 0 (CONTEXT DIAGRAM) */}
      {activeTab === 'dfd0' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white">DFD Level 0: Context Diagram Portal SI-GABUNG 54</h3>
            <p className="text-xs text-slate-400">Entitas Eksternal & Interaksi Sistem Utama.</p>
          </div>

          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4 text-xs">
            <div className="flex flex-wrap justify-center items-center gap-4">
              <div className="bg-slate-900 border border-purple-500/50 p-3 rounded-xl text-center font-bold text-purple-300 w-44">
                [Entitas] Mahasiswa Baru
              </div>
              <ArrowRight className="w-4 h-4 text-slate-600" />
              <div className="bg-gradient-to-r from-teal-900 to-blue-900 border border-teal-500 p-5 rounded-2xl text-center font-bold text-white w-64 shadow-xl">
                SYSTEM UTAMA PORTAL SI-GABUNG 54 (ROEMAH 54)
              </div>
              <ArrowRight className="w-4 h-4 text-slate-600" />
              <div className="bg-slate-900 border border-blue-500/50 p-3 rounded-xl text-center font-bold text-blue-300 w-44">
                [Entitas] SIAKAD / PMB UBT
              </div>
            </div>

            <div className="flex flex-wrap justify-center items-center gap-4 pt-4">
              <div className="bg-slate-900 border border-amber-500/50 p-3 rounded-xl text-center font-bold text-amber-300 w-44">
                [Entitas] Payment Gateway / Bank
              </div>
              <div className="bg-slate-900 border border-emerald-500/50 p-3 rounded-xl text-center font-bold text-emerald-300 w-44">
                [Entitas] WhatsApp Gateway
              </div>
              <div className="bg-slate-900 border border-indigo-500/50 p-3 rounded-xl text-center font-bold text-indigo-300 w-44">
                [Entitas] Admin Keuangan & Asrama
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: WORKFLOW CONDITIONAL LOGIC CHART */}
      {activeTab === 'workflow' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white">Workflow Chart: Conditional Decision Tree</h3>
            <p className="text-xs text-slate-400">Peta percabangan logika kondisi sistem.</p>
          </div>

          <div className="space-y-4 text-xs font-mono">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="text-amber-400 font-bold">1. Decision: Perlu e-KYC?</div>
              <div className="pl-4 text-slate-300">
                ├─ <strong>Ya:</strong> Mahasiswa upload KTP + Pasfoto Selfie &gt; Simpan di Private Storage &gt; Verifikasi.
                <br />
                └─ <strong>Tidak:</strong> Direct skip ke penerbitan tagihan invoice.
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="text-blue-400 font-bold">2. Decision: Metode Pembayaran?</div>
              <div className="pl-4 text-slate-300">
                ├─ <strong>Transfer Manual:</strong> Wajib upload struk bukti + nominal 3 digit unik &gt; Verifikasi Admin Keuangan.
                <br />
                └─ <strong>Virtual Account (VA):</strong> Bank Callback Webhook Otomatis &gt; Form upload disembunyikan &gt; Auto Verified.
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="text-emerald-400 font-bold">3. Decision: OTP WA Valid?</div>
              <div className="pl-4 text-slate-300">
                ├─ <strong>Ya (Valid):</strong> TTD Kontrak Digital sah &gt; Terbit e-Ticket Check-in QR.
                <br />
                └─ <strong>Tidak:</strong> Tolak & kirim ulang OTP ke nomor WhatsApp terdaftar.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: KEAMANAN PRIVATE STORAGE e-KYC */}
      {activeTab === 'security' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-400" />
              <span>Keamanan e-KYC: Private File Storage Standard</span>
            </h3>
            <p className="text-xs text-slate-400">Aturan ketat penanganan berkas sensitif mahasiswa UBT.</p>
          </div>

          <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3 text-xs text-slate-300">
            <div className="flex items-center space-x-2 text-emerald-400 font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Dilarang Disimpan di Directory Public (e.g. /public/storage)</span>
            </div>
            <p>
              Seluruh dokumen e-KYC (KTP & Selfie) diisolasi di luar root web server (private storage). Akses membaca berkas hanya diizinkan melalui authenticated signed URL khusus yang dikontrol oleh peran Admin Asrama.
            </p>

            <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 font-mono text-[11px] text-teal-300">
              Storage Path: /var/app/private_storage/kyc/{'{'}hash_nim{'}'}_ktp.enc
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
