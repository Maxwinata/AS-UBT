const fs = require('fs');

const code = `import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Check, X, DollarSign, Settings2 } from 'lucide-react';
import { TariffItem, PaymentScheme } from '../../types/asrama';

interface TariffManagerProps {
  tariffs: TariffItem[];
  setTariffs: (tariffs: TariffItem[]) => void;
  paymentSchemes?: PaymentScheme[];
  setPaymentSchemes?: (schemes: PaymentScheme[]) => void;
}

export const TariffManager: React.FC<TariffManagerProps> = ({ tariffs, setTariffs, paymentSchemes = [], setPaymentSchemes = () => {} }) => {
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<TariffItem>>({});
  
  const [isAdding, setIsAdding] = useState(false);
  const [addForm, setAddForm] = useState<Partial<TariffItem>>({
    category: 'SEWA',
    target: 'ALL',
    amount: 0
  });

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
  };

  const handleSaveEdit = () => {
    if (isEditing && editForm.name && editForm.amount !== undefined) {
      setTariffs(tariffs.map(t => t.id === isEditing ? { ...t, ...editForm } as TariffItem : t));
      setIsEditing(null);
      setEditForm({});
    }
  };

  const handleSaveAdd = () => {
    if (addForm.name && addForm.amount !== undefined) {
      const newTariff: TariffItem = {
        id: \`t\${Date.now()}\`,
        name: addForm.name,
        category: addForm.category as any,
        target: addForm.target as any,
        amount: addForm.amount
      };
      setTariffs([...tariffs, newTariff]);
      setIsAdding(false);
      setAddForm({ category: 'SEWA', target: 'ALL', amount: 0 });
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Yakin ingin menghapus komponen tarif ini?')) {
      setTariffs(tariffs.filter(t => t.id !== id));
    }
  };

  const renderTariffRow = (tariff: TariffItem) => {
    const editingThis = isEditing === tariff.id;
    return (
      <tr key={tariff.id} className="hover:bg-slate-50 transition-colors">
        <td className="p-3">
          {editingThis ? (
            <input type="text" value={editForm.name || ''} onChange={e => setEditForm({...editForm, name: e.target.value})} className="w-full text-xs px-2 py-1.5 border border-blue-300 rounded focus:outline-none" />
          ) : (
            <span className="font-medium text-slate-800">{tariff.name}</span>
          )}
        </td>
        <td className="p-3">
          {editingThis ? (
            <select value={editForm.category} onChange={e => setEditForm({...editForm, category: e.target.value as any})} className="text-xs px-2 py-1.5 border border-blue-300 rounded w-full">
              <option value="SEWA">Sewa Bulanan</option>
              <option value="DEPOSIT">Deposit Jaminan</option>
              <option value="PERLENGKAPAN">Perlengkapan Awal</option>
              <option value="ADMIN">Biaya Admin</option>
              <option value="CICILAN">Biaya Layanan Cicilan</option>
              <option value="LAINNYA">Lain-lain</option>
            </select>
          ) : (
            <span className={\`text-[10px] font-bold px-2 py-1 rounded-md \${
              tariff.category === 'SEWA' ? 'bg-blue-100 text-blue-800' :
              tariff.category === 'DEPOSIT' ? 'bg-purple-100 text-purple-800' :
              tariff.category === 'PERLENGKAPAN' ? 'bg-amber-100 text-amber-800' :
              tariff.category === 'CICILAN' ? 'bg-rose-100 text-rose-800' :
              tariff.category === 'PENGATURAN' ? 'bg-slate-800 text-slate-100' :
              'bg-slate-100 text-slate-800'
            }\`}>
              {tariff.category}
            </span>
          )}
        </td>
        <td className="p-3 text-right">
          {editingThis ? (
            <input type="number" value={editForm.amount ?? 0} onChange={e => setEditForm({...editForm, amount: Number(e.target.value)})} className="w-full text-xs px-2 py-1.5 border border-blue-300 rounded text-right font-mono focus:outline-none" />
          ) : (
            <>{tariff.category === 'PENGATURAN' ? <span className="font-mono font-bold text-slate-900">{tariff.amount} {tariff.name.includes('Bulan') || tariff.name.includes('Tenor') || tariff.name.includes('Cicilan') ? 'Bulan / Kali' : ''}</span> : <span className="font-mono font-bold text-slate-900">{formatRupiah(tariff.amount)}</span>}</>
          )}
        </td>
        <td className="p-3 text-center w-24">
          {editingThis ? (
            <div className="flex justify-center gap-2">
              <button onClick={handleSaveEdit} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg" title="Simpan"><Check className="w-4 h-4" /></button>
              <button onClick={() => setIsEditing(null)} className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg" title="Batal"><X className="w-4 h-4" /></button>
            </div>
          ) : (
            <div className="flex justify-center gap-2">
              <button onClick={() => { setIsEditing(tariff.id); setEditForm(tariff); }} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg" title="Edit"><Edit2 className="w-4 h-4" /></button>
              <button onClick={() => handleDelete(tariff.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg" title="Hapus"><Trash2 className="w-4 h-4" /></button>
            </div>
          )}
        </td>
      </tr>
    );
  };

  const groupTargets = ['REGULER', 'KIP', 'ALL'];
  const groupLabels: Record<string, string> = {
    'REGULER': 'Jalur Reguler (Non-KIP)',
    'KIP': 'Jalur KIP-Kuliah',
    'ALL': 'Berlaku Umum (Semua Jalur)'
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex justify-between items-center mb-6 border-b border-slate-200 pb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
            <DollarSign className="w-5 h-5 text-emerald-600" />
            <span>Manajemen Master Tarif & Skema Cicilan</span>
          </h3>
          <p className="text-sm text-slate-500 mt-1">Konfigurasi komponen biaya sewa, deposit, dan aturan cicilan berdasarkan kelompok jalur mahasiswa.</p>
        </div>
        {!isAdding && (
          <button onClick={() => setIsAdding(true)} className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" />
            <span>Tambah Tarif</span>
          </button>
        )}
      </div>

      {isAdding && (
        <div className="mb-8 p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
          <h4 className="text-sm font-bold text-emerald-800 mb-3">Tambah Komponen Tarif Baru</h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-1">
              <label className="block text-xs font-medium text-slate-700 mb-1">Nama Tarif</label>
              <input type="text" placeholder="Misal: Sewa Asrama Bulanan" value={addForm.name || ''} onChange={e => setAddForm({...addForm, name: e.target.value})} className="w-full text-sm px-3 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Kategori</label>
              <select value={addForm.category} onChange={e => setAddForm({...addForm, category: e.target.value as any})} className="w-full text-sm px-3 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500">
                <option value="SEWA">Sewa Bulanan</option>
                <option value="DEPOSIT">Deposit Jaminan</option>
                <option value="PERLENGKAPAN">Perlengkapan Awal</option>
                <option value="ADMIN">Biaya Admin</option>
                <option value="CICILAN">Biaya Layanan Cicilan</option>
                <option value="LAINNYA">Lain-lain</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Target Kelompok</label>
              <select value={addForm.target} onChange={e => setAddForm({...addForm, target: e.target.value as any})} className="w-full text-sm px-3 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500">
                <option value="ALL">Semua Jalur</option>
                <option value="REGULER">Reguler (Non-KIP)</option>
                <option value="KIP">KIP-Kuliah</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Nominal (Rp)</label>
              <input type="number" placeholder="0" value={addForm.amount || ''} onChange={e => setAddForm({...addForm, amount: Number(e.target.value)})} className="w-full text-sm px-3 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-3">
            <button onClick={() => setIsAdding(false)} className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50">Batal</button>
            <button onClick={handleSaveAdd} className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700">Simpan Tarif</button>
          </div>
        </div>
      )}

      <div className="space-y-8">
        {groupTargets.map(target => {
          const groupTariffs = tariffs.filter(t => t.target === target);
          const scheme = paymentSchemes.find(s => s.target === target);

          if (groupTariffs.length === 0 && !scheme) return null;

          return (
            <div key={target} className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <div className="bg-slate-50 border-b border-slate-200 p-4 md:flex justify-between items-center space-y-3 md:space-y-0">
                <div className="flex items-center space-x-2">
                  <div className={\`w-2 h-6 rounded-full \${target === 'KIP' ? 'bg-emerald-500' : target === 'REGULER' ? 'bg-blue-500' : 'bg-slate-800'}\`}></div>
                  <h3 className="font-bold text-slate-800 text-sm md:text-base">Grup: {groupLabels[target]}</h3>
                </div>
                
                {scheme && (
                  <div className="flex flex-wrap items-center gap-4 text-xs bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-2">
                      <Settings2 className="w-4 h-4 text-slate-400" />
                      <span className="font-semibold text-slate-700">Aturan Cicilan:</span>
                    </div>
                    <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
                      <span className="text-slate-500">Maksimal Tenor</span>
                      <div className="relative">
                        <input 
                          type="number" min="1" max="12" 
                          value={scheme.maxInstallments} 
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            if(val > 0) setPaymentSchemes(paymentSchemes.map(s => s.id === scheme.id ? {...s, maxInstallments: val} : s));
                          }}
                          className="w-16 text-center py-1 border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 font-bold" 
                        />
                        <span className="absolute right-[-24px] top-1 text-slate-400">x</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 border-l border-slate-200 pl-8 md:pl-4">
                      <span className="text-slate-500">Pengali Deposit</span>
                      <div className="relative">
                        <input 
                          type="number" step="0.1" min="1.0"
                          value={scheme.installmentMultiplier} 
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            if(val >= 1) setPaymentSchemes(paymentSchemes.map(s => s.id === scheme.id ? {...s, installmentMultiplier: val} : s));
                          }}
                          className="w-16 text-center py-1 border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 font-bold" 
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white text-slate-500 text-[11px] uppercase tracking-wider font-semibold border-b border-slate-100">
                      <th className="p-3 pl-4">Nama Komponen Tarif</th>
                      <th className="p-3">Kategori</th>
                      <th className="p-3 text-right">Nominal</th>
                      <th className="p-3 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-slate-100">
                    {groupTariffs.map(renderTariffRow)}
                    {groupTariffs.length === 0 && (
                      <tr>
                        <td colSpan={4} className="p-4 text-center text-slate-400 text-xs italic">
                          Belum ada komponen tarif untuk grup ini.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
`;

fs.writeFileSync('src/components/admin/TariffManager.tsx', code);
