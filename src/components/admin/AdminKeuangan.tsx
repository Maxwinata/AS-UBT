import React, { useState } from 'react';
import { CreditCard, CheckCircle2, XCircle, RefreshCw, Zap, ShieldCheck, DollarSign, Search, AlertTriangle, ArrowRight, Settings2, Layers, Database, ArrowRightLeft, FileCheck, ArrowUpRight, Link2 } from 'lucide-react';
import { BillingInvoice, TariffItem, PaymentScheme, ApiLinkRecord, SiakadMahasiswaStgRecord } from '../../types/asrama';
import { TariffManager } from './TariffManager';
import { SiakadSyncManager } from './SiakadSyncManager';
import { INITIAL_API_LINKS, INITIAL_SIAKAD_STAGING } from '../../data/initialData';

interface AdminKeuanganProps {
  invoices: BillingInvoice[];
  onVerifyInvoice: (invoiceId: string, action: 'APPROVE_AND_MIGRATE' | 'APPROVE_BOOKING' | 'REJECT' | 'MIGRATE_ONLY') => void;
  onSyncNim?: (invoiceId: string, newNim: string) => void;
  tariffs?: TariffItem[];
  setTariffs?: (tariffs: TariffItem[]) => void;
  paymentSchemes?: PaymentScheme[];
  setPaymentSchemes?: (schemes: PaymentScheme[]) => void;
  apiLinks?: ApiLinkRecord[];
  siakadStaging?: SiakadMahasiswaStgRecord[];
  onTriggerSiakadSync?: () => void;
  onVerifySubsidi?: (stgId: number, status: 1 | -1, notes?: string) => void;
}

export const AdminKeuangan: React.FC<AdminKeuanganProps> = ({ 
  invoices, 
  onVerifyInvoice, 
  onSyncNim,
  tariffs = [],
  setTariffs = () => {},
  paymentSchemes = [],
  setPaymentSchemes = () => {},
  apiLinks = INITIAL_API_LINKS,
  siakadStaging = INITIAL_SIAKAD_STAGING,
  onTriggerSiakadSync = () => {},
  onVerifySubsidi = () => {}
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'LEDGER' | 'BRIDGING' | 'MASTER' | 'SIAKAD'>('LEDGER');

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
  };

  const filteredInvoices = invoices.filter(
    (inv) =>
      inv.nim.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.invoiceId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div id="admin-keuangan-root" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-800 via-teal-900 to-slate-900 border border-blue-700 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-blue-700/80 text-blue-100 text-xs px-2.5 py-0.5 rounded-full font-mono font-bold border border-blue-400/40">
              ADMINISTRATOR KEUANGAN
            </span>
            <span className="text-xs text-slate-200">• Portal SI-GABUNG 54</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight mt-1">
            {activeTab === 'LEDGER' 
              ? 'Verifikasi Pembayaran & Ledger Deposit' 
              : activeTab === 'BRIDGING' 
              ? 'Bridging Staging & Integrasi Database Web Admin' 
              : activeTab === 'MASTER'
              ? 'Konfigurasi Master Tarif & Skema Cicilan'
              : 'Manajemen Integrasi API SIAKAD UBT'}
          </h2>
          <p className="text-xs text-teal-100 mt-1">
            {activeTab === 'LEDGER' 
              ? 'Sesuai DFD Level 1 (P3 & P4): Validasi 3 digit kode unik transfer manual & log automatic webhook VA.'
              : activeTab === 'BRIDGING'
              ? 'Arsitektur Bridging Otonom: Sinkronisasi 3 tabel pendaftaran mandiri Maba (request_*) ke 3 tabel master berjalan (pembayaran, pembayaran_detail, transaksi, penyewa).'
              : activeTab === 'MASTER'
              ? 'Otoritas Finansial Terpusat: Penetapan SK tarif sewa, deposit jaminan, perlengkapan awal, dan regulasi tenor cicilan.'
              : 'Sinkronisasi 2 Endpoint SIAKAD: Penarikan data calon mahasiswa pra-registrasi dan audit manual kelayakan subsidi beasiswa.'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <button 
            type="button"
            onClick={() => setActiveTab('MASTER')}
            className={`p-3 rounded-xl border text-xs text-left transition-all cursor-pointer ${
              paymentSchemes.some(s => s.allowDepositInstallment)
                ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-200 hover:bg-emerald-900/60'
                : 'bg-slate-900/60 border-slate-700 text-slate-300 hover:bg-slate-800/60'
            }`}
            title="Klik untuk mengubah kebijakan cicilan deposit di Master Tarif"
          >
            <div className="text-[10px] text-slate-300 uppercase tracking-wider font-semibold">Kebijakan Cicilan Deposit:</div>
            <div className="font-mono font-bold text-xs mt-0.5 flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${paymentSchemes.some(s => s.allowDepositInstallment) ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'}`}></span>
              {paymentSchemes.some(s => s.allowDepositInstallment)
                ? `AKTIF (${paymentSchemes.filter(s => s.allowDepositInstallment).length} Jalur)`
                : 'NONAKTIF / OFF (Default)'}
            </div>
          </button>

          <div className="flex items-center space-x-3 bg-white/10 backdrop-blur p-3.5 rounded-xl border border-white/20 text-xs text-white">
            <div>
              <div className="text-teal-100 text-[11px]">Total Deposit Terkumpul (Fase A):</div>
              <div className="font-mono font-bold text-emerald-300 text-sm">Rp 750.000 / Maba</div>
            </div>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('LEDGER')}
          className={`px-5 py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'LEDGER' 
              ? 'border-blue-600 text-blue-700 bg-blue-50/50 rounded-t-xl' 
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Ledger Pembayaran Maba</span>
        </button>

        <button
          onClick={() => setActiveTab('BRIDGING')}
          className={`px-5 py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'BRIDGING' 
              ? 'border-teal-600 text-teal-700 bg-teal-50/50 rounded-t-xl' 
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          }`}
        >
          <Layers className="w-4 h-4 text-teal-600" />
          <span>Bridging Staging Inspector</span>
          <span className="text-[10px] bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full font-bold">3 Tabel Staging</span>
        </button>

        <button
          onClick={() => setActiveTab('MASTER')}
          className={`px-5 py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'MASTER' 
              ? 'border-blue-600 text-blue-700 bg-blue-50/50 rounded-t-xl' 
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          }`}
        >
          <DollarSign className="w-4 h-4 text-emerald-600" />
          <span>Master Tarif & Skema Cicilan</span>
          <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-bold">Otoritas CRUD</span>
        </button>

        <button
          onClick={() => setActiveTab('SIAKAD')}
          className={`px-5 py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === 'SIAKAD' 
              ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50 rounded-t-xl' 
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          }`}
        >
          <Link2 className="w-4 h-4 text-indigo-600" />
          <span>API SIAKAD & Subsidi</span>
          <span className="text-[10px] bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full font-bold">2 Endpoint Link</span>
        </button>
      </div>

      {activeTab === 'MASTER' && (
        <div className="animate-in fade-in duration-200">
          <TariffManager 
            tariffs={tariffs} 
            setTariffs={setTariffs} 
            paymentSchemes={paymentSchemes} 
            setPaymentSchemes={setPaymentSchemes}
            readOnly={false}
          />
        </div>
      )}

      {activeTab === 'LEDGER' && (
        <div className="space-y-8 animate-in fade-in duration-200">
      {/* SEARCH & FILTER */}
      <div className="flex justify-between items-center">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari NIM, Nama, atau Invoice ID..."
            className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600 shadow-sm"
          />
        </div>
      </div>

      {/* TABLE INVOICES & VERIFICATION */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 font-bold text-xs text-slate-800 flex justify-between items-center">
          <span>Daftar Tagihan & Status Verifikasi Kode Unik</span>
          <span className="font-mono text-teal-800 font-bold">{filteredInvoices.length} Record</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-100 text-slate-700 font-mono uppercase text-[10px] font-bold">
              <tr>
                <th className="p-3.5">Invoice ID</th>
                <th className="p-3.5">Mahasiswa</th>
                <th className="p-3.5">Sewa + Deposit</th>
                <th className="p-3.5">Kode Unik</th>
                <th className="p-3.5">Total Tagihan</th>
                <th className="p-3.5">Metode Bayar</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Aksi Verifikasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-sans">
              {filteredInvoices.map((inv) => (
                <tr key={inv.invoiceId} className="hover:bg-slate-50">
                  <td className="p-3.5 font-mono text-teal-800 font-bold">{inv.invoiceId}</td>
                  <td className="p-3.5">
                    <div className="font-bold text-slate-900">{inv.nama}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{inv.nim}</div>
                  </td>
                  <td className="p-3.5 font-mono">
                    <div>Sewa ({inv.durasiBulan || 6} Bln): {formatRupiah(inv.biayaSewa)}</div>
                    <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <span>Deposit: {formatRupiah(inv.biayaDeposit)}</span>
                      <span className={`px-1.5 py-0.2 rounded font-bold text-[9px] ${
                        inv.isCicilanDeposit 
                          ? 'bg-amber-100 text-amber-900 border border-amber-300' 
                          : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      }`}>
                        {inv.isCicilanDeposit ? `Cicil ${inv.opsiCicilan}x` : 'Lunas 1x'}
                      </span>
                    </div>
                  </td>
                  <td className="p-3.5 font-mono font-bold text-amber-800 bg-amber-50 rounded px-1.5 py-0.5 border border-amber-200">
                    +{inv.kodeUnik}
                  </td>
                  <td className="p-3.5 font-mono font-bold text-emerald-800 text-sm">
                    {formatRupiah(inv.totalBayar)}
                  </td>
                  <td className="p-3.5">
                    {inv.metodeBayar === 'VIRTUAL_ACCOUNT' ? (
                      <span className="bg-teal-950 text-teal-300 border border-teal-800 text-[10px] px-2 py-0.5 rounded font-mono">
                        VA (Auto Webhook)
                      </span>
                    ) : inv.metodeBayar === 'TRANSFER_MANUAL' ? (
                      <span className="bg-blue-950 text-blue-300 border border-blue-800 text-[10px] px-2 py-0.5 rounded font-mono">
                        Transfer Manual
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[10px]">Belum Memilih</span>
                    )}
                  </td>
                  <td className="p-3.5">
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded uppercase ${
                      inv.status === 'PAID'
                        ? (inv.isMigrated ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-amber-950 text-amber-300 border border-amber-800')
                        : inv.status === 'PENDING_VERIFICATION'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800 animate-pulse'
                        : 'bg-red-950 text-red-300 border border-red-800'
                    }`}>
                      {inv.status === 'PAID' ? (inv.isMigrated ? 'MIGRATED' : 'BOOKING') : inv.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-right space-x-1.5">
                    {(() => {
                      const hasNim = inv.nim && !inv.nim.startsWith('REG') && !inv.nim.startsWith('PMB');
                      
                      if (inv.status === 'PENDING_VERIFICATION') {
                        return (
                          <>
                            {hasNim ? (
                              <button
                                onClick={() => onVerifyInvoice(inv.invoiceId, 'APPROVE_AND_MIGRATE')}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[11px] px-3 py-1 rounded-md transition-all flex items-center justify-center gap-1.5 w-full mb-1"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" /> Approve & Migrate Master
                              </button>
                            ) : (
                              <button
                                onClick={() => onVerifyInvoice(inv.invoiceId, 'APPROVE_BOOKING')}
                                className="bg-amber-600 hover:bg-amber-500 text-white font-semibold text-[11px] px-3 py-1 rounded-md transition-all flex items-center justify-center gap-1.5 w-full mb-1"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" /> Approve Booking (Tanpa NIM)
                              </button>
                            )}
                            <button
                              onClick={() => onVerifyInvoice(inv.invoiceId, 'REJECT')}
                              className="bg-red-800 hover:bg-red-700 text-white font-semibold text-[11px] px-2.5 py-1 rounded-md transition-all flex items-center justify-center gap-1.5 w-full"
                            >
                              <XCircle className="w-3.5 h-3.5" /> Tolak & Hapus
                            </button>
                          </>
                        );
                      }
                      
                      if (inv.status === 'PAID') {
                        if (inv.isMigrated) {
                          return (
                            <span className="text-emerald-400 font-mono text-[11px] flex items-center justify-end gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Verifikasi Lunas & Dimigrasi
                            </span>
                          );
                        } else {
                          // Not migrated yet (BOOKING state)
                          return (
                            <div className="flex flex-col gap-1 items-end">
                              <span className="text-amber-400 font-mono text-[11px] flex items-center gap-1 mb-1">
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> Booking (Menunggu NIM)
                              </span>
                              {!hasNim && onSyncNim && (
                                <button
                                  onClick={() => {
                                    const inputNim = window.prompt(`Masukkan NIM SIDARA untuk ${inv.nama}:`);
                                    if (inputNim && inputNim.trim() !== '') {
                                      if (inputNim.toUpperCase().startsWith('REG') || inputNim.toUpperCase().startsWith('PMB')) {
                                        alert('Gagal: Harap masukkan NIM asli, bukan Nomor Registrasi PMB.');
                                      } else {
                                        onSyncNim(inv.invoiceId, inputNim.trim());
                                      }
                                    }
                                  }}
                                  className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-[11px] px-2.5 py-1 rounded-md transition-all flex items-center justify-center gap-1.5 w-full mb-1"
                                >
                                  <RefreshCw className="w-3.5 h-3.5" /> Sync NIM & Migrate
                                </button>
                              )}
                              <button
                                onClick={() => onVerifyInvoice(inv.invoiceId, 'MIGRATE_ONLY')}
                                disabled={!hasNim}
                                className={`font-semibold text-[11px] px-2.5 py-1 rounded-md transition-all flex items-center justify-center gap-1.5 w-full ${hasNim ? 'bg-teal-600 hover:bg-teal-500 text-white' : 'bg-slate-700 text-slate-400 cursor-not-allowed'}`}
                              >
                                <ArrowRight className="w-3.5 h-3.5" /> {hasNim ? 'Migrate ke Master' : 'NIM Belum Tersedia'}
                              </button>
                            </div>
                          );
                        }
                      }
                      
                      return null;
                    })()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
        </div>
      )}

      {/* TAB BRIDGING STAGING INSPECTOR */}
      {activeTab === 'BRIDGING' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* BANNER PENJELASAN BRIDGING */}
          <div className="bg-gradient-to-br from-teal-950 via-slate-900 to-blue-950 border border-teal-700/50 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-teal-700/70 text-teal-100 text-xs px-2.5 py-0.5 rounded-full font-mono font-bold border border-teal-400/40">
                ARSITEKTUR BRIDGING INTEGRASI
              </span>
              <span className="text-xs text-teal-300 font-mono">Frontend Maba ➔ Web Admin Laravel</span>
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">
              Mekanisme Staging Otonom (request_*) ke Master Berjalan (pembayaran, transaksi, penyewa)
            </h3>
            <p className="text-xs text-slate-300 mt-1 max-w-4xl leading-relaxed">
              Tabel berawalan <code className="bg-teal-900/60 text-teal-300 px-1 py-0.5 rounded font-mono">request_*</code> menampung proses otonom mandiri mahasiswa saat mendaftar (<code className="font-mono text-amber-300">operator_id = 0</code>). 
              Tabel <code className="bg-blue-900/60 text-blue-300 px-1 py-0.5 rounded font-mono">pembayaran</code>, <code className="bg-blue-900/60 text-blue-300 px-1 py-0.5 rounded font-mono">pembayaran_detail</code>, dan <code className="bg-blue-900/60 text-blue-300 px-1 py-0.5 rounded font-mono">transaksi</code> adalah buku besar resmi berjalan yang dikelola oleh Admin (<code className="font-mono text-emerald-300">operator_id = Admin ID</code>).
            </p>

            {/* 3 LANGKAH SIKLUS BRIDGING */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-slate-900/80 border border-teal-800/40 rounded-xl p-4">
                <div className="flex items-center gap-2 text-teal-400 font-bold text-xs uppercase font-mono">
                  <span className="w-5 h-5 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-300 font-bold">1</span>
                  <span>Input Mandiri Maba</span>
                </div>
                <div className="text-xs text-slate-300 mt-2 space-y-1">
                  <div className="font-semibold text-white">Isi Biodata & Buat Request Tagihan</div>
                  <div className="text-[11px] text-slate-400">
                    Menulis ke <code className="text-amber-300 font-mono">penyewa</code> (status=0, operator_id=0), 
                    <code className="text-amber-300 font-mono"> request_pembayaran</code> (no_request), dan 
                    <code className="text-amber-300 font-mono"> request_pembayaran_detail</code>.
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/80 border border-blue-800/40 rounded-xl p-4">
                <div className="flex items-center gap-2 text-blue-400 font-bold text-xs uppercase font-mono">
                  <span className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-300 font-bold">2</span>
                  <span>Unggah Mutasi Mandiri</span>
                </div>
                <div className="text-xs text-slate-300 mt-2 space-y-1">
                  <div className="font-semibold text-white">Upload Bukti Transfer Bank BSI</div>
                  <div className="text-[11px] text-slate-400">
                    Menulis ke <code className="text-amber-300 font-mono">request_transaksi</code> (file_bukti, jumlah_uang, no_transaksi sementara). Status permintaan menjadi pending verifikasi.
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/80 border border-emerald-800/40 rounded-xl p-4">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase font-mono">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-300 font-bold">3</span>
                  <span>Promosi ke Master Admin</span>
                </div>
                <div className="text-xs text-slate-300 mt-2 space-y-1">
                  <div className="font-semibold text-white">Verifikasi & Terbitkan Invoice Resmi</div>
                  <div className="text-[11px] text-slate-400">
                    Sistem menduplikasi data ke <code className="text-emerald-300 font-mono">pembayaran</code> (no_invoice resmi), 
                    <code className="text-emerald-300 font-mono"> pembayaran_detail</code>, dan <code className="text-emerald-300 font-mono">transaksi</code> dengan <code className="text-emerald-300 font-mono">operator_id = Admin</code>.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* TABEL ANTREAN BRIDGING STAGING */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 font-bold text-xs text-slate-800 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-teal-600" />
                <span>Antrean Bridging: Tabel `request_pembayaran` & `request_transaksi`</span>
              </div>
              <span className="font-mono text-teal-800 font-bold text-xs">{filteredInvoices.length} Permintaan Masuk</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-100 text-slate-700 font-mono uppercase text-[10px] font-bold">
                  <tr>
                    <th className="p-3.5">No. Request (Staging)</th>
                    <th className="p-3.5">Calon Penyewa (penyewa_id)</th>
                    <th className="p-3.5">Rincian Komponen (request_pembayaran_detail)</th>
                    <th className="p-3.5">Mutasi Bayar (request_transaksi)</th>
                    <th className="p-3.5">Status Bridging</th>
                    <th className="p-3.5 text-right">Aksi Promosi Master</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-sans">
                  {filteredInvoices.map((inv) => {
                    const reqCode = inv.noRequest || `REQ-202610-${inv.invoiceId.slice(-4)}`;
                    const hasNim = inv.nim && !inv.nim.startsWith('REG') && !inv.nim.startsWith('PMB');
                    const isPromoted = inv.status === 'PAID' && inv.isMigrated;

                    return (
                      <tr key={inv.invoiceId} className="hover:bg-slate-50">
                        <td className="p-3.5 font-mono">
                          <div className="font-bold text-teal-800 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-teal-500"></span>
                            {reqCode}
                          </div>
                          <div className="text-[10px] text-slate-500 mt-0.5">
                            operator_id: <span className="font-bold text-amber-700">0 (Maba)</span>
                          </div>
                          {isPromoted && (
                            <div className="text-[10px] text-emerald-700 font-bold mt-1 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                              ➔ No. Invoice: {inv.invoiceId}
                            </div>
                          )}
                        </td>

                        <td className="p-3.5">
                          <div className="font-bold text-slate-900">{inv.nama}</div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            NIM/PMB: {inv.nim}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            NIK: 1271040809980001
                          </div>
                        </td>

                        <td className="p-3.5 font-mono text-[11px] space-y-1">
                          <div className="flex justify-between gap-2 text-slate-600">
                            <span>• Sewa Asrama ({inv.durasiBulan || 6} Bln):</span>
                            <span className="font-bold">{formatRupiah(inv.biayaSewa)}</span>
                          </div>
                          <div className="flex justify-between gap-2 text-slate-600">
                            <span>• Deposit Jaminan ({inv.isCicilanDeposit ? `Cicil ${inv.opsiCicilan}x` : 'Lunas'}):</span>
                            <span className="font-bold">{formatRupiah(inv.biayaDeposit)}</span>
                          </div>
                          <div className="flex justify-between gap-2 text-slate-600">
                            <span>• Biaya Administrasi:</span>
                            <span className="font-bold">{formatRupiah(inv.biayaPerlengkapanAwal || 100000)}</span>
                          </div>
                          <div className="border-t border-slate-200 pt-1 flex justify-between gap-2 text-teal-800 font-bold">
                            <span>Total (Termasuk +{inv.kodeUnik}):</span>
                            <span>{formatRupiah(inv.totalBayar)}</span>
                          </div>
                        </td>

                        <td className="p-3.5">
                          <div className="text-[11px] font-semibold text-slate-800">
                            {inv.metodeBayar === 'VIRTUAL_ACCOUNT' ? 'Virtual Account BSI' : 'Transfer Manual BSI'}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            Nominal: {formatRupiah(inv.totalBayar)}
                          </div>
                          <div className="mt-1">
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded font-mono ${
                              inv.status === 'PAID' 
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                                : inv.status === 'PENDING_VERIFICATION' 
                                ? 'bg-amber-100 text-amber-800 border border-amber-300' 
                                : 'bg-slate-100 text-slate-600 border border-slate-300'
                            }`}>
                              Bukti: {inv.status === 'UNPAID' ? 'Belum Diunggah' : 'File Terlampir (public/proofs)'}
                            </span>
                          </div>
                        </td>

                        <td className="p-3.5">
                          {isPromoted ? (
                            <div className="space-y-1">
                              <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 w-fit">
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                PROMOTED TO MASTER
                              </span>
                              <div className="text-[9px] text-slate-500 font-mono">
                                status_verifikasi: <span className="font-bold text-emerald-700">1</span>
                              </div>
                              <div className="text-[9px] text-slate-500 font-mono">
                                operator_id: <span className="font-bold text-emerald-700">1 (Admin)</span>
                              </div>
                            </div>
                          ) : inv.status === 'PENDING_VERIFICATION' ? (
                            <div className="space-y-1">
                              <span className="bg-amber-950 text-amber-300 border border-amber-800 text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 w-fit animate-pulse">
                                <AlertTriangle className="w-3 h-3 text-amber-400" />
                                SIAP DIVALIDASI
                              </span>
                              <div className="text-[9px] text-slate-500 font-mono">
                                status_verifikasi: <span className="font-bold text-amber-700">0 (Pending)</span>
                              </div>
                            </div>
                          ) : (
                            <span className="bg-slate-100 text-slate-600 border border-slate-300 text-[10px] px-2 py-0.5 rounded-full font-bold w-fit block">
                              STAGING DRAFT
                            </span>
                          )}
                        </td>

                        <td className="p-3.5 text-right">
                          {isPromoted ? (
                            <div className="text-right">
                              <span className="text-[11px] font-bold text-emerald-700 flex items-center justify-end gap-1 font-mono">
                                <FileCheck className="w-3.5 h-3.5 text-emerald-600" /> Data Resmi di Master
                              </span>
                              <span className="text-[9px] text-slate-500 block">pembayaran & transaksi aktif</span>
                            </div>
                          ) : inv.status === 'PENDING_VERIFICATION' ? (
                            <div className="space-y-1.5 w-44 ml-auto">
                              <button
                                onClick={() => onVerifyInvoice(inv.invoiceId, 'APPROVE_AND_MIGRATE')}
                                className="w-full bg-teal-700 hover:bg-teal-600 text-white font-bold text-[11px] px-3 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                              >
                                <ArrowRightLeft className="w-3.5 h-3.5" /> Sahkan & Promosi ke Master
                              </button>
                              <button
                                onClick={() => onVerifyInvoice(inv.invoiceId, 'REJECT')}
                                className="w-full bg-slate-200 hover:bg-red-100 text-slate-700 hover:text-red-700 font-semibold text-[10px] px-2 py-1 rounded-md transition-all flex items-center justify-center gap-1"
                              >
                                <XCircle className="w-3 h-3" /> Tolak Permintaan
                              </button>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-[11px] italic">Menunggu Maba Transfer</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* FIELD-BY-FIELD BRIDGING MATRIX TABLE */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <ArrowRightLeft className="w-4 h-4 text-teal-600" />
                  Matriks Pemetaan Kolom (Field-by-Field Transformation)
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Spesifikasi sinkronisasi antara tabel staging pendaftaran otonom dengan tabel master transaksi berjalan Web Admin Laravel.
                </p>
              </div>
              <span className="text-[11px] font-mono font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200">
                DB: u540633926_asrama
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-xs">
              {/* KOLOM 1: PEMBAYARAN */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-slate-100 p-3 font-bold text-slate-800 border-b border-slate-200 flex justify-between items-center">
                  <span>1. Header Tagihan</span>
                  <span className="text-[10px] font-mono text-teal-700 font-bold">1:1 Mapping</span>
                </div>
                <div className="p-3 space-y-2 font-mono text-[11px]">
                  <div className="bg-teal-50/60 p-2 rounded border border-teal-200">
                    <div className="text-[10px] font-bold text-teal-800">request_pembayaran (Staging)</div>
                    <div className="text-slate-600 mt-1 space-y-0.5">
                      <div>• no_request (VARCHAR)</div>
                      <div>• penyewa_id, kamar_id</div>
                      <div>• durasi, tgl_masuk, tgl_keluar</div>
                      <div>• total_tagihan, total_bayar</div>
                      <div>• operator_id = 0 (Maba)</div>
                      <div>• status_verifikasi = 0</div>
                    </div>
                  </div>
                  <div className="text-center text-teal-600 font-bold text-xs py-0.5">⬇ Promosi Admin ⬇</div>
                  <div className="bg-blue-50/60 p-2 rounded border border-blue-200">
                    <div className="text-[10px] font-bold text-blue-800">pembayaran (Master Berjalan)</div>
                    <div className="text-slate-600 mt-1 space-y-0.5">
                      <div>• no_invoice (INV-...) <span className="text-emerald-600 font-bold">[BARU]</span></div>
                      <div>• penyewa_id, kamar_id</div>
                      <div>• durasi, tgl_masuk, tgl_keluar</div>
                      <div>• total_tagihan, total_bayar</div>
                      <div>• operator_id = Admin ID <span className="text-emerald-600 font-bold">[AKTIF]</span></div>
                      <div>• status_pembayaran = 'paid'</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* KOLOM 2: RINCIAN KOMPONEN */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-slate-100 p-3 font-bold text-slate-800 border-b border-slate-200 flex justify-between items-center">
                  <span>2. Rincian Item Tarif</span>
                  <span className="text-[10px] font-mono text-teal-700 font-bold">1:N Breakdown</span>
                </div>
                <div className="p-3 space-y-2 font-mono text-[11px]">
                  <div className="bg-teal-50/60 p-2 rounded border border-teal-200">
                    <div className="text-[10px] font-bold text-teal-800">request_pembayaran_detail</div>
                    <div className="text-slate-600 mt-1 space-y-0.5">
                      <div>• no_request (Foreign Index)</div>
                      <div>• harga_id (1=Sewa, 2=Dep, 3=Adm)</div>
                      <div>• jenissewa (Deskripsi Item)</div>
                      <div>• harga, qty, jumlah_bayar</div>
                      <div>• potongan_harga, status</div>
                    </div>
                  </div>
                  <div className="text-center text-teal-600 font-bold text-xs py-0.5">⬇ Promosi Admin ⬇</div>
                  <div className="bg-blue-50/60 p-2 rounded border border-blue-200">
                    <div className="text-[10px] font-bold text-blue-800">pembayaran_detail (Master)</div>
                    <div className="text-slate-600 mt-1 space-y-0.5">
                      <div>• no_invoice (Foreign Index) <span className="text-emerald-600 font-bold">[TERIKAT]</span></div>
                      <div>• harga_id (Komponen Resmi)</div>
                      <div>• jenissewa (Deskripsi Item)</div>
                      <div>• harga, qty, jumlah_bayar</div>
                      <div>• status = 1 (Tercatat Resmi)</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* KOLOM 3: TRANSAKSI & BUKTI */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-slate-100 p-3 font-bold text-slate-800 border-b border-slate-200 flex justify-between items-center">
                  <span>3. Mutasi Kas & Bukti</span>
                  <span className="text-[10px] font-mono text-teal-700 font-bold">Ledger Kas</span>
                </div>
                <div className="p-3 space-y-2 font-mono text-[11px]">
                  <div className="bg-teal-50/60 p-2 rounded border border-teal-200">
                    <div className="text-[10px] font-bold text-teal-800">request_transaksi</div>
                    <div className="text-slate-600 mt-1 space-y-0.5">
                      <div>• no_request</div>
                      <div>• no_transaksi (Sementara)</div>
                      <div>• tanggal_transaksi</div>
                      <div>• jumlah_uang, metode_bayar</div>
                      <div>• file_bukti, operator_id = 0</div>
                    </div>
                  </div>
                  <div className="text-center text-teal-600 font-bold text-xs py-0.5">⬇ Promosi Admin ⬇</div>
                  <div className="bg-blue-50/60 p-2 rounded border border-blue-200">
                    <div className="text-[10px] font-bold text-blue-800">transaksi (Master Kas Berjalan)</div>
                    <div className="text-slate-600 mt-1 space-y-0.5">
                      <div>• no_invoice, penyewa_id</div>
                      <div>• no_transaksi (Resmi TRX-...)</div>
                      <div>• tanggal_transaksi, jumlah_uang</div>
                      <div>• file_bukti, jenis = 'Asrama'</div>
                      <div>• operator_id = Admin ID</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: API SIAKAD & VERIFIKASI SUBSIDI */}
      {activeTab === 'SIAKAD' && (
        <div className="animate-in fade-in duration-200">
          <SiakadSyncManager
            apiLinks={apiLinks}
            stagingList={siakadStaging}
            onTriggerSync={onTriggerSiakadSync}
            onVerifySubsidi={onVerifySubsidi}
          />
        </div>
      )}
    </div>
  );
};

