import React, { useState } from 'react';
import { Bell, Send, CheckCircle2, Clock, Users, MessageCircle, AlertTriangle } from 'lucide-react';
import { BillingInvoice, MabaProfile } from '../../types/asrama';
import { toast } from 'sonner';

interface NotificationManagerProps {
  invoices: BillingInvoice[];
}

interface NotificationTemplate {
  id: string;
  name: string;
  targetStatus: 'UNPAID' | 'PAID' | 'EXPIRED' | 'ALL';
  message: string;
}

const TEMPLATES: NotificationTemplate[] = [
  {
    id: 'TPL-01',
    name: 'Pengingat Tagihan Belum Lunas',
    targetStatus: 'UNPAID',
    message: 'Halo {NAMA}, ini adalah pengingat bahwa tagihan asrama Anda sejumlah {TOTAL} belum dilunasi. Harap segera melakukan pembayaran. Abaikan pesan ini jika sudah membayar.'
  },
  {
    id: 'TPL-02',
    name: 'Konfirmasi Pembayaran Berhasil',
    targetStatus: 'PAID',
    message: 'Halo {NAMA}, pembayaran asrama Anda sejumlah {TOTAL} telah berhasil diverifikasi. Terima kasih!'
  }
];

export const NotificationManager: React.FC<NotificationManagerProps> = ({ invoices }) => {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [isSending, setIsSending] = useState(false);
  const [sendResult, setSendResult] = useState<{success: number; failed: number} | null>(null);

  const activeTemplate = TEMPLATES.find(t => t.id === selectedTemplate);
  
  const targetInvoices = activeTemplate 
    ? (activeTemplate.targetStatus === 'ALL' ? invoices : invoices.filter(i => i.status === activeTemplate.targetStatus))
    : [];

  const handleSendBlast = () => {
    if (!activeTemplate || targetInvoices.length === 0) return;
    
    if (confirm(`Anda yakin ingin mengirim pesan WhatsApp ke ${targetInvoices.length} mahasiswa?`)) {
      setIsSending(true);
      setSendResult(null);
      
      // Mock API call
      setTimeout(() => {
        setIsSending(false);
        setSendResult({
          success: targetInvoices.length,
          failed: 0
        });
        toast.success(`Berhasil mengirim ${targetInvoices.length} pesan WhatsApp!`);
      }, 1500);
    }
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 animate-in fade-in duration-200">
      <div className="flex justify-between items-center mb-6 border-b border-slate-200 pb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
            <MessageCircle className="w-5 h-5 text-emerald-600" />
            <span>Manajemen Notifikasi WhatsApp</span>
          </h3>
          <p className="text-sm text-slate-500 mt-1">Kirim pesan WhatsApp massal (blast) berdasarkan status tagihan mahasiswa.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Pilih Template Pesan</label>
            <div className="space-y-2">
              {TEMPLATES.map(tpl => (
                <div 
                  key={tpl.id} 
                  onClick={() => setSelectedTemplate(tpl.id)}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${selectedTemplate === tpl.id ? 'border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500' : 'border-slate-200 hover:border-emerald-300'}`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-sm text-slate-800">{tpl.name}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${tpl.targetStatus === 'UNPAID' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                      Target: {tpl.targetStatus}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2">{tpl.message}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
          <h4 className="font-bold text-sm text-slate-800 mb-4 flex items-center gap-2">
            <Send className="w-4 h-4 text-emerald-600" />
            Detail Pengiriman
          </h4>
          
          {!activeTemplate ? (
            <div className="text-center py-10 opacity-50">
              <MessageCircle className="w-10 h-10 mx-auto mb-2 text-slate-400" />
              <p className="text-sm text-slate-500">Pilih template pesan terlebih dahulu</p>
            </div>
          ) : (
            <div className="space-y-5">
              <div>
                <span className="block text-xs font-semibold text-slate-500 mb-1">Pesan yang akan dikirim:</span>
                <div className="bg-white p-3 border border-slate-200 rounded-lg text-sm text-slate-700 shadow-inner">
                  {activeTemplate.message}
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">* Variabel {`{NAMA}`} dan {`{TOTAL}`} akan diganti secara dinamis</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-xs text-slate-500 font-medium">Estimasi Penerima</span>
                    <span className="block text-lg font-bold text-slate-800">{targetInvoices.length} Mahasiswa</span>
                  </div>
                </div>
              </div>

              {sendResult ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-center animate-in zoom-in-95">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <span className="block font-bold text-emerald-800">Blast Selesai</span>
                  <span className="text-sm text-emerald-600">{sendResult.success} Berhasil, {sendResult.failed} Gagal</span>
                </div>
              ) : (
                <button
                  onClick={handleSendBlast}
                  disabled={isSending || targetInvoices.length === 0}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors"
                >
                  {isSending ? (
                    <>
                      <Clock className="w-5 h-5 animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Kirim Blast WhatsApp Sekarang
                    </>
                  )}
                </button>
              )}
              
              {targetInvoices.length === 0 && !sendResult && (
                <p className="text-xs text-amber-600 font-medium text-center bg-amber-50 p-2 rounded flex items-center justify-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Tidak ada mahasiswa dengan status {activeTemplate.targetStatus}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
