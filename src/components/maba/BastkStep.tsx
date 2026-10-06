import React, { useState } from 'react';
import { FileCheck, ShieldCheck, Camera, Search, AlertTriangle, PenTool } from 'lucide-react';
import { BASTKItemCondition } from '../../types/asrama';
import { toast } from 'sonner';

interface Props {
  nim: string;
  nama: string;
  kamar: string;
  onComplete: () => void;
}

export const BastkStep: React.FC<Props> = ({ nim, nama, kamar, onComplete }) => {
  const [items, setItems] = useState<BASTKItemCondition[]>([
    { item: 'Kasur & Bantal', condition: 'BAIK' },
    { item: 'Lemari Pakaian', condition: 'BAIK' },
    { item: 'Meja & Kursi Belajar', condition: 'BAIK' },
    { item: 'Kunci Kamar', condition: 'BAIK' },
    { item: 'Lampu & Stopkontak', condition: 'BAIK' },
  ]);

  const [isSigning, setIsSigning] = useState(false);

  const handleSign = () => {
    setIsSigning(true);
    setTimeout(() => {
      setIsSigning(false);
      toast.success('BASTK Disetujui!', { description: 'Kondisi awal kamar telah dicatat ke dalam Jejak Audit (Sistem).' });
      onComplete();
    }, 1500);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center space-x-3 mb-6 border-b border-slate-100 pb-4">
        <div className="bg-indigo-100 p-2.5 rounded-xl">
          <FileCheck className="w-6 h-6 text-indigo-700" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900">Langkah 7: Berita Acara Serah Terima Kamar (F-03)</h3>
          <p className="text-xs text-slate-500">Persetujuan BASTK Elektronik sesuai JUKLAK-02 Pasal 21.</p>
        </div>
      </div>

      <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl mb-6">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-slate-600">Penghuni:</span>
          <span className="font-bold text-slate-900">{nama} ({nim})</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-slate-600">Alokasi Kamar:</span>
          <span className="font-bold text-slate-900">{kamar}</span>
        </div>
      </div>

      <div className="space-y-4 mb-8">
        <h4 className="font-bold text-sm text-slate-800 flex items-center gap-2">
          <Search className="w-4 h-4 text-slate-500" /> Ceklist Inventaris Awal (Mohon Diperiksa)
        </h4>
        <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="py-2 px-3 text-left font-semibold text-slate-600">Item Inventaris</th>
                <th className="py-2 px-3 text-center font-semibold text-slate-600">Kondisi (Sistem)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((it, idx) => (
                <tr key={idx}>
                  <td className="py-2.5 px-3 font-medium text-slate-800">{it.item}</td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">{it.condition}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex gap-2 items-start bg-amber-50 p-3 rounded-lg border border-amber-200/50">
          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-[11px] text-amber-800 leading-relaxed">
            Sesuai Pasal 10 ayat (3) Peraturan Induk, Anda berhak melaporkan cacat/kekurangan paling lambat 2x24 jam sejak BASTK ini ditandatangani. Kerusakan yang tidak dilaporkan menjadi tanggung jawab Anda saat Check-Out.
          </p>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-200">
        <button
          onClick={handleSign}
          disabled={isSigning}
          className="w-full flex justify-center items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl shadow-md transition-all disabled:opacity-70"
        >
          {isSigning ? (
            <>
              <ShieldCheck className="w-5 h-5 animate-pulse" />
              <span>Memproses Jejak Audit...</span>
            </>
          ) : (
            <>
              <PenTool className="w-5 h-5" />
              <span>Sahkan BASTK Elektronik (F-03)</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
