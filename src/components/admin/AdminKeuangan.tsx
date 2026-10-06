import React, { useState } from 'react';
import { CreditCard, CheckCircle2, XCircle, RefreshCw, Zap, ShieldCheck, DollarSign, Search, AlertTriangle, ArrowRight, Settings2 } from 'lucide-react';
import { BillingInvoice, TariffItem, PaymentScheme } from '../../types/asrama';
import { TariffManager } from './TariffManager';

interface AdminKeuanganProps {
  invoices: BillingInvoice[];
  onVerifyInvoice: (invoiceId: string, action: 'APPROVE_AND_MIGRATE' | 'APPROVE_BOOKING' | 'REJECT' | 'MIGRATE_ONLY') => void;
  onSyncNim?: (invoiceId: string, newNim: string) => void;
  tariffs?: TariffItem[];
  setTariffs?: (tariffs: TariffItem[]) => void;
  paymentSchemes?: PaymentScheme[];
  setPaymentSchemes?: (schemes: PaymentScheme[]) => void;
}

export const AdminKeuangan: React.FC<AdminKeuanganProps> = ({ 
  invoices, 
  onVerifyInvoice, 
  onSyncNim,
  tariffs = [],
  setTariffs = () => {},
  paymentSchemes = [],
  setPaymentSchemes = () => {}
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'LEDGER' | 'MASTER'>('LEDGER');

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
            {activeTab === 'LEDGER' ? 'Verifikasi Pembayaran & Ledger Deposit' : 'Konfigurasi Master Tarif & Skema Cicilan'}
          </h2>
          <p className="text-xs text-teal-100 mt-1">
            {activeTab === 'LEDGER' 
              ? 'Sesuai DFD Level 1 (P3 & P4): Validasi 3 digit kode unik transfer manual & log automatic webhook VA.'
              : 'Otoritas Finansial Terpusat: Penetapan SK tarif sewa, deposit jaminan, perlengkapan awal, dan regulasi tenor cicilan.'}
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
      <div className="flex space-x-2 border-b border-slate-200">
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
    </div>
  );
};
