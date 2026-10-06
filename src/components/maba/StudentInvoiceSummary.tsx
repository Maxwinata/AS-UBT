import React, { useState } from 'react';
import { ShieldCheck, Bed, Package, Zap, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { BillingInvoice } from '../../types/asrama';

interface StudentInvoiceSummaryProps {
  invoice: BillingInvoice;
  currentStep: number;
}

const formatRupiah = (val: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(val);
};

export const StudentInvoiceSummary: React.FC<StudentInvoiceSummaryProps> = ({ invoice, currentStep }) => {
  const [showDetail, setShowDetail] = useState(true);

  if (currentStep <= 1) return null;

  const isCicilanDeposit = Boolean(invoice.isCicilanDeposit && invoice.opsiCicilan > 1);
  const durasiKontrak = invoice.durasiBulan || 6;
  const tarifSewaBulan = invoice.tarifPerBulan || 500000;
  const durasiBayar = invoice.biayaSewa && tarifSewaBulan > 0 ? Math.round(invoice.biayaSewa / tarifSewaBulan) : 6;
  const isLunasPenuh = durasiBayar >= durasiKontrak;
  const biayaPerlengkapan = invoice.biayaPerlengkapanAwal || 0;
  const kodeUnik = invoice.kodeUnik || 0;

  return (
    <div className="bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 rounded-2xl p-4 sm:p-5 text-white shadow-lg border border-teal-800/40 relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute -right-16 -top-16 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header & Total Amount */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-teal-800/40">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
              isLunasPenuh
                ? 'bg-emerald-400/20 text-emerald-300 border border-emerald-400/30'
                : 'bg-blue-400/20 text-blue-300 border border-blue-400/30'
            }`}>
              {isLunasPenuh ? `Sewa: Lunas di Muka (${durasiBayar} Bulan)` : `Sewa: Bayar ${durasiBayar} Bulan Awal`}
            </span>

            {isCicilanDeposit && (
              <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                Deposit: Cicilan {invoice.opsiCicilan}x
              </span>
            )}

            <span className="text-[11px] text-teal-300 font-medium">Kontrak Min. {durasiKontrak} Bulan</span>
          </div>
          <h4 className="text-sm sm:text-base font-bold text-white flex items-center gap-1.5">
            <span>
              {!isLunasPenuh || isCicilanDeposit
                ? `Total Pembayaran Awal Masuk (${durasiBayar} Bln Sewa + Deposit)` 
                : `Total Biaya Masuk Asrama (${durasiKontrak} Bulan Lunas)`}
            </span>
          </h4>
        </div>

        <div className="text-left sm:text-right">
          <span className="text-[11px] text-teal-200 block sm:inline mr-1">Nominal yang Ditransfer:</span>
          <span className="font-mono font-black text-amber-300 text-xl sm:text-2xl tracking-tight">
            {formatRupiah(invoice.totalBayar)}
          </span>
        </div>
      </div>

      {/* Clear Breakdown Items - Student Friendly & Readable */}
      <div className="mt-3.5 space-y-2.5">
        <div className="text-xs text-teal-100/90 font-medium flex items-center justify-between">
          <span>Rincian Biaya Transparan:</span>
          <button 
            type="button"
            onClick={() => setShowDetail(!showDetail)}
            className="text-[11px] text-teal-300 hover:text-white flex items-center gap-1 transition-colors"
          >
            <span>{showDetail ? 'Sembunyikan' : 'Lihat'} Rincian</span>
            {showDetail ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {showDetail && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pt-1">
            {/* 1. Sewa Kamar */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 flex items-start gap-2.5">
              <div className="p-1.5 bg-teal-500/20 text-teal-300 rounded-lg shrink-0 mt-0.5">
                <Bed className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[11px] text-teal-200 block truncate">
                  Sewa Kamar ({durasiBayar} Bulan)
                </span>
                <span className="font-mono font-bold text-white text-xs sm:text-sm block">
                  {formatRupiah(invoice.biayaSewa)}
                </span>
                <span className="text-[10px] text-slate-300 block leading-tight mt-0.5">
                  {!isLunasPenuh 
                    ? `Kontrak ${durasiKontrak} bln (Sisa ${durasiKontrak - durasiBayar} bln diangsur)`
                    : `Hak tinggal ${durasiKontrak} bulan penuh`}
                </span>
              </div>
            </div>

            {/* 2. Uang Deposit Jaminan */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 flex items-start gap-2.5">
              <div className="p-1.5 bg-emerald-500/20 text-emerald-300 rounded-lg shrink-0 mt-0.5">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[11px] text-teal-200 block truncate">
                  Deposit Jaminan {isCicilanDeposit ? `(T1/${invoice.opsiCicilan}x)` : ''}
                </span>
                <span className="font-mono font-bold text-emerald-300 text-xs sm:text-sm block">
                  {formatRupiah(invoice.biayaDeposit)}
                </span>
                <span className="text-[10px] text-emerald-200/90 block leading-tight mt-0.5">
                  Titipan jaminan (kembali 100%)
                </span>
              </div>
            </div>

            {/* 3. Biaya Administrasi */}
            {biayaPerlengkapan > 0 && (
              <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 flex items-start gap-2.5">
                <div className="p-1.5 bg-blue-500/20 text-blue-300 rounded-lg shrink-0 mt-0.5">
                  <Package className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[11px] text-teal-200 block truncate">Biaya Administrasi</span>
                  <span className="font-mono font-bold text-white text-xs sm:text-sm block">
                    {formatRupiah(biayaPerlengkapan)}
                  </span>
                  <span className="text-[10px] text-slate-300 block leading-tight mt-0.5">
                    Administrasi pendaftaran & registrasi awal
                  </span>
                </div>
              </div>
            )}

            {/* 4. Kode Unik */}
            {kodeUnik > 0 && (
              <div className="bg-amber-400/10 border border-amber-400/20 rounded-xl p-2.5 flex items-start gap-2.5">
                <div className="p-1.5 bg-amber-400/20 text-amber-300 rounded-lg shrink-0 mt-0.5">
                  <Zap className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[11px] text-amber-200 block truncate">Kode Unik Transfer</span>
                  <span className="font-mono font-bold text-amber-300 text-xs sm:text-sm block">
                    +{kodeUnik}
                  </span>
                  <span className="text-[10px] text-amber-200/80 block leading-tight mt-0.5">
                    3 digit verifikasi otomatis
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Friendly explanation footer */}
        <div className="flex items-center gap-2 pt-1 text-[11px] text-teal-200/90 leading-snug">
          <Info className="w-3.5 h-3.5 text-teal-300 shrink-0" />
          <span>
            {!isLunasPenuh ? (
              <>
                Masa kontrak mengikat <strong>{durasiKontrak} bulan (1 semester)</strong>. Anda membayar sewa {durasiBayar} bulan di awal pendaftaran, sedangkan sisa sewa sebesar <strong className="text-white">{formatRupiah(invoice.sisaSewaKontrak || (durasiKontrak - durasiBayar) * tarifSewaBulan)}</strong> akan ditagihkan bertahap pada portal mahasiswa. Uang deposit jaminan akan dikembalikan utuh 100% saat check-out.
              </>
            ) : isCicilanDeposit ? (
              <>
                Sewa kamar {durasiKontrak} bulan lunas di awal. Sisa deposit sebesar <strong className="text-white">{formatRupiah(invoice.sisaCicilanDeposit || 0)}</strong> akan diangsur pada bulan berikutnya. Uang deposit jaminan akan dikembalikan utuh 100% saat check-out.
              </>
            ) : (
              <>
                Total di atas telah mencakup sewa kamar {durasiKontrak} bulan lunas penuh, paket perlengkapan awal baru, dan uang deposit jaminan yang akan dikembalikan utuh 100% saat selesai masa tinggal asrama.
              </>
            )}
          </span>
        </div>
      </div>
    </div>
  );
};

