import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Check, X, DollarSign, Settings2, ShieldCheck, Lock, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { TariffItem, PaymentScheme } from '../../types/asrama';

interface TariffManagerProps {
  tariffs: TariffItem[];
  setTariffs?: (tariffs: TariffItem[]) => void;
  paymentSchemes?: PaymentScheme[];
  setPaymentSchemes?: (schemes: PaymentScheme[]) => void;
  readOnly?: boolean;
}

export const TariffManager: React.FC<TariffManagerProps> = ({ 
  tariffs, 
  setTariffs = () => {}, 
  paymentSchemes = [], 
  setPaymentSchemes = () => {},
  readOnly = false
}) => {
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<TariffItem>>({});
  
  const [isAdding, setIsAdding] = useState(false);
  const [isAddingScheme, setIsAddingScheme] = useState(false);
  const [addSchemeForm, setAddSchemeForm] = useState<Partial<PaymentScheme>>({
    target: 'REGULER',
    maxInstallments: 1,
    installmentMultiplier: 1.0,
    allowDepositInstallment: false
  });
  
  const [addForm, setAddForm] = useState<Partial<TariffItem>>({
    category: 'SEWA',
    target: 'ALL',
    amount: 0
  });

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
  };

  // Deposit installment policy metrics
  const activeDepositInstallmentCount = paymentSchemes.filter(s => s.allowDepositInstallment).length;
  const isAnyDepositInstallmentActive = activeDepositInstallmentCount > 0;

  const handleToggleAllDepositInstallment = (enable: boolean) => {
    const updated = paymentSchemes.map(s => ({
      ...s,
      allowDepositInstallment: enable
    }));
    setPaymentSchemes(updated);
    if (enable) {
      toast.success("Opsi Cicilan Deposit Berhasil Diaktifkan!", {
        description: "Calon mahasiswa (Maba) kini dapat memilih pembayaran cicilan deposit jaminan sesuai batas tenor kelompok."
      });
    } else {
      toast.info("Opsi Cicilan Deposit Telah Dinonaktifkan (Default OFF)", {
        description: "Seluruh calon mahasiswa wajib membayar deposit penuh (Lunas 1x di muka)."
      });
    }
  };

  const handleToggleGroupDepositInstallment = (schemeId: string, currentStatus: boolean, targetLabel: string) => {
    const updated = paymentSchemes.map(s => {
      if (s.id === schemeId) {
        return { ...s, allowDepositInstallment: !currentStatus };
      }
      return s;
    });
    setPaymentSchemes(updated);
    if (!currentStatus) {
      toast.success(`Cicilan Deposit Diaktifkan untuk ${targetLabel}`, {
        description: "Mahasiswa jalur ini sekarang dapat memilih opsi pembayaran dicicil."
      });
    } else {
      toast.info(`Cicilan Deposit Dinonaktifkan untuk ${targetLabel}`, {
        description: "Mahasiswa jalur ini kembali ke skema default Lunas 1x."
      });
    }
  };

  const handleSaveEdit = () => {
    if (isEditing && editForm.name && editForm.amount !== undefined) {
      setTariffs(tariffs.map(t => t.id === isEditing ? { ...t, ...editForm } as TariffItem : t));
      setIsEditing(null);
      setEditForm({});
    }
  };

  const handleSaveSchemeAdd = () => {
    if (addSchemeForm.target && addSchemeForm.maxInstallments && addSchemeForm.installmentMultiplier) {
      if (paymentSchemes.some(s => s.target === addSchemeForm.target)) {
        alert('Skema cicilan untuk grup ini sudah ada. Silakan edit skema yang ada daripada membuat baru.');
        return;
      }
      
      const newScheme: PaymentScheme = {
        id: `ps${Date.now()}`,
        target: addSchemeForm.target as any,
        maxInstallments: addSchemeForm.maxInstallments,
        installmentMultiplier: addSchemeForm.installmentMultiplier,
        allowDepositInstallment: !!addSchemeForm.allowDepositInstallment
      };
      setPaymentSchemes([...paymentSchemes, newScheme]);
      setIsAddingScheme(false);
      toast.success("Skema cicilan baru berhasil ditambahkan.");
    }
  };

  const handleSaveAdd = () => {
    if (addForm.name && addForm.amount !== undefined) {
      const newTariff: TariffItem = {
        id: `t${Date.now()}`,
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
    const editingThis = !readOnly && isEditing === tariff.id;
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
              <option value="PERLENGKAPAN">Biaya Administrasi</option>
              <option value="ADMIN">Biaya Admin</option>
              <option value="CICILAN">Biaya Layanan Cicilan</option>
              <option value="LAINNYA">Lain-lain</option>
            </select>
          ) : (
            <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${
              tariff.category === 'SEWA' ? 'bg-blue-100 text-blue-800' :
              tariff.category === 'DEPOSIT' ? 'bg-purple-100 text-purple-800' :
              tariff.category === 'PERLENGKAPAN' ? 'bg-amber-100 text-amber-800' :
              tariff.category === 'CICILAN' ? 'bg-rose-100 text-rose-800' :
              tariff.category === 'PENGATURAN' ? 'bg-slate-800 text-slate-100' :
              'bg-slate-100 text-slate-800'
            }`}>
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
          {readOnly ? (
            <span className="text-[11px] text-slate-400 font-mono font-medium flex items-center justify-center gap-1">
              <Lock className="w-3 h-3 text-slate-400" /> Acuan
            </span>
          ) : editingThis ? (
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

  const groupTargets = ['REGULER', 'KIP', 'INTERNAL', 'EXTERNAL', 'SCHOLARSHIP', 'ALL'];
  const groupLabels: Record<string, string> = {
    'REGULER': 'Jalur Reguler (Non-KIP)',
    'KIP': 'Jalur KIP-Kuliah',
    'ALL': 'Berlaku Umum (Semua Jalur)',
    'INTERNAL': 'Jalur Internal',
    'EXTERNAL': 'Jalur External',
    'SCHOLARSHIP': 'Jalur Beasiswa Lainnya (Scholarship)'
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
      {/* Role-Based / Separation of Concerns Banner */}
      {readOnly ? (
        <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-xl flex items-start gap-3 text-xs text-amber-900">
          <Lock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-extrabold block text-sm">Mode Referensi Acuan (Read-Only)</span>
            <p className="mt-0.5 text-amber-800 leading-relaxed">
              Berdasarkan pemetaan skema database dan pemisahan wewenang (Separation of Concerns), <strong>Konfigurasi Master Tarif & Skema Cicilan dikelola secara penuh (CRUD) oleh Administrator Keuangan</strong> sebagai <em>Single Source of Truth</em>. Halaman ini berfungsi sebagai acuan referensi bagi staf asrama dalam proses plotting kamar, BASTK, dan verifikasi fisik di lapangan.
            </p>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-blue-50/80 border border-blue-200 rounded-xl flex items-start gap-3 text-xs text-blue-900">
          <ShieldCheck className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-extrabold block text-sm">Otoritas Finansial Terpusat (Admin Keuangan)</span>
            <p className="mt-0.5 text-blue-800 leading-relaxed">
              Anda memiliki hak penuh untuk mengatur komponen tarif sewa, deposit jaminan, perlengkapan awal, dan formula pengali cicilan. Perubahan data di sini akan seketika tersinkronisasi ke formulir tagihan mahasiswa baru (Step 2) dan buku besar deposit asrama.
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
            <DollarSign className="w-5 h-5 text-emerald-600" />
            <span>Master Tarif & Skema Cicilan Asrama</span>
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Konfigurasi komponen biaya sewa, deposit, dan aturan cicilan berdasarkan kelompok jalur mahasiswa.
          </p>
        </div>
        
        {!readOnly && (
          <div className="flex flex-wrap gap-2">
            {!isAddingScheme && (
              <button onClick={() => setIsAddingScheme(true)} className="flex items-center space-x-2 px-3.5 py-2 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg hover:bg-indigo-100 text-xs font-bold transition-colors">
                <Settings2 className="w-4 h-4" />
                <span>Tambah Skema Cicilan</span>
              </button>
            )}
            {!isAdding && (
              <button onClick={() => setIsAdding(true)} className="flex items-center space-x-2 px-3.5 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-xs font-bold transition-colors shadow-xs">
                <Plus className="w-4 h-4" />
                <span>Tambah Tarif</span>
              </button>
            )}
          </div>
        )}
      </div>

      {!readOnly && isAddingScheme && (
        <div className="mb-8 p-4 bg-indigo-50 border border-indigo-100 rounded-xl animate-in fade-in zoom-in-95 duration-200">
          <h4 className="text-sm font-bold text-indigo-800 mb-3">Tambah Konfigurasi Skema Cicilan</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Target Kelompok</label>
              <select 
                value={addSchemeForm.target} 
                onChange={e => setAddSchemeForm({...addSchemeForm, target: e.target.value as any})} 
                className="w-full text-sm px-3 py-2 border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="ALL">Semua Jalur</option>
                <option value="REGULER">Reguler (Non-KIP)</option>
                <option value="KIP">KIP-Kuliah</option>
                <option value="INTERNAL">Internal</option>
                <option value="EXTERNAL">External</option>
                <option value="SCHOLARSHIP">Beasiswa (Scholarship)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Maksimal Cicilan (Tenor)</label>
              <input 
                type="number" min="1" max="12" 
                value={addSchemeForm.maxInstallments || ''} 
                onChange={e => setAddSchemeForm({...addSchemeForm, maxInstallments: Number(e.target.value)})} 
                className="w-full text-sm px-3 py-2 border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" 
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Pengali Deposit (Multiplier)</label>
              <input 
                type="number" step="0.1" min="1.0" 
                value={addSchemeForm.installmentMultiplier || ''} 
                onChange={e => setAddSchemeForm({...addSchemeForm, installmentMultiplier: Number(e.target.value)})} 
                className="w-full text-sm px-3 py-2 border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" 
              />
            </div>
          </div>

          <div className="mt-4 p-3 bg-white rounded-lg border border-indigo-200 flex items-center justify-between">
            <div className="space-y-0.5">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Aktifkan Opsi Cicilan Deposit untuk Jalur Ini
              </label>
              <p className="text-[11px] text-slate-500">
                Secara default opsi cicilan dinonaktifkan (OFF). Centang jika ingin langsung mengizinkan opsi cicilan deposit.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={!!addSchemeForm.allowDepositInstallment} 
                onChange={e => setAddSchemeForm({...addSchemeForm, allowDepositInstallment: e.target.checked})}
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>
          
          {paymentSchemes.some(s => s.target === addSchemeForm.target) && (
            <p className="mt-3 text-xs font-medium text-rose-600 bg-rose-50 p-2 rounded border border-rose-200">
              ⚠️ Skema cicilan untuk grup ini sudah ada. Anda tidak dapat membuat skema ganda.
            </p>
          )}

          <div className="mt-4 flex justify-end gap-3">
            <button onClick={() => setIsAddingScheme(false)} className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50">Batal</button>
            <button 
              onClick={handleSaveSchemeAdd} 
              disabled={paymentSchemes.some(s => s.target === addSchemeForm.target)}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Simpan Skema
            </button>
          </div>
        </div>
      )}

      {!readOnly && isAdding && (
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
                <option value="PERLENGKAPAN">Biaya Administrasi</option>
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
                <option value="INTERNAL">Internal</option>
                <option value="EXTERNAL">External</option>
                <option value="SCHOLARSHIP">Beasiswa (Scholarship)</option>
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

      {/* Panel Kebijakan Opsi Cicilan Deposit (Default: OFF, dapat diaktifkan melalui menu Admin) */}
      <div id="admin-deposit-installment-policy-panel" className={`p-4 rounded-xl border transition-all ${
        isAnyDepositInstallmentActive 
          ? 'bg-emerald-50/80 border-emerald-300 shadow-xs' 
          : 'bg-slate-50 border-slate-300 shadow-xs'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded border ${
                isAnyDepositInstallmentActive
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  : 'bg-slate-200 text-slate-700 border-slate-300'
              }`}>
                {isAnyDepositInstallmentActive ? 'STATUS: AKTIF (DAPAT DICICIL)' : 'STATUS: NONAKTIF / OFF (DEFAULT)'}
              </span>
              <span className="text-xs text-slate-500 font-medium">• Kebijakan Cicilan Deposit</span>
            </div>
            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <ShieldCheck className={`w-4 h-4 ${isAnyDepositInstallmentActive ? 'text-emerald-600' : 'text-slate-500'}`} />
              {isAnyDepositInstallmentActive
                ? `Opsi Cicilan Deposit Sedang Diaktifkan (${activeDepositInstallmentCount} Jalur)`
                : 'Opsi Deposit Dapat Dicicil Sedang Di-OFF-kan (Default Lunas 1x)'}
            </h4>
            <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
              {isAnyDepositInstallmentActive
                ? 'Mahasiswa pada jalur yang diizinkan dapat memilih pembayaran cicilan deposit hingga batas tenor maksimal. Anda dapat menonaktifkannya kembali kapan saja untuk mewajibkan Lunas 1x.'
                : 'Opsi cicilan deposit jaminan saat ini dalam keadaan NONAKTIF (OFF) sesuai regulasi default. Seluruh mahasiswa baru wajib membayar penuh (Lunas 1x di muka). Administrator dapat mengaktifkan opsi cicilan melalui tombol aksi di bawah ini.'}
            </p>
          </div>

          {!readOnly && (
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {isAnyDepositInstallmentActive ? (
                <button
                  type="button"
                  onClick={() => handleToggleAllDepositInstallment(false)}
                  className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <X className="w-4 h-4" />
                  <span>Matikan Semua Cicilan (Set OFF)</span>
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      const updated = paymentSchemes.map(s => s.target === 'KIP' ? { ...s, allowDepositInstallment: true } : s);
                      setPaymentSchemes(updated);
                      toast.success("Opsi Cicilan Deposit Diaktifkan untuk Jalur KIP!", {
                        description: "Mahasiswa KIP-Kuliah kini dapat memilih opsi cicilan deposit hingga 3 termin."
                      });
                    }}
                    className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Aktifkan Khusus KIP</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleAllDepositInstallment(true)}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Aktifkan Semua Jalur</span>
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-8">
        {groupTargets.map(target => {
          const groupTariffs = tariffs.filter(t => t.target === target);
          const scheme = paymentSchemes.find(s => s.target === target);

          if (groupTariffs.length === 0 && !scheme) return null;

          return (
            <div key={target} className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <div className="bg-slate-50 border-b border-slate-200 p-4 md:flex justify-between items-center space-y-3 md:space-y-0">
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-6 rounded-full ${target === 'KIP' ? 'bg-emerald-500' : target === 'REGULER' ? 'bg-blue-500' : 'bg-slate-800'}`}></div>
                  <h3 className="font-bold text-slate-800 text-sm md:text-base">Grup: {groupLabels[target]}</h3>
                </div>
                
                {scheme && (
                  <div className="flex flex-wrap items-center gap-4 text-xs bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-xs">
                    <div className="flex items-center gap-2">
                      <Settings2 className="w-4 h-4 text-slate-400" />
                      <span className="font-semibold text-slate-700">Aturan Cicilan:</span>
                    </div>

                    {/* Toggle Opsi Cicilan Deposit untuk Grup Ini */}
                    <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
                      <span className="text-slate-500">Opsi Cicil:</span>
                      {readOnly ? (
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                          scheme.allowDepositInstallment 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                            : 'bg-slate-100 text-slate-500 border-slate-200'
                        }`}>
                          {scheme.allowDepositInstallment ? `Aktif (${scheme.maxInstallments}x)` : 'Nonaktif (Lunas)'}
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleToggleGroupDepositInstallment(scheme.id, !!scheme.allowDepositInstallment, groupLabels[target] || target)}
                          className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                            scheme.allowDepositInstallment
                              ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                          }`}
                          title="Klik untuk mengaktifkan atau menonaktifkan cicilan deposit jalur ini"
                        >
                          {scheme.allowDepositInstallment ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-emerald-900">Aktif (Dicicil)</span>
                            </>
                          ) : (
                            <>
                              <X className="w-3.5 h-3.5 text-slate-400" />
                              <span className="text-slate-600">Nonaktif (Lunas 1x)</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
                      <span className="text-slate-500">Maksimal Tenor:</span>
                      {readOnly ? (
                        <span className="font-mono font-bold text-slate-900">{scheme.maxInstallments}x</span>
                      ) : (
                        <div className="relative">
                          <input 
                            type="number" min="1" max="12" 
                            value={scheme.maxInstallments} 
                            onChange={(e) => {
                              const val = parseInt(e.target.value);
                              if(val > 0) setPaymentSchemes(paymentSchemes.map(s => s.id === scheme.id ? {...s, maxInstallments: val} : s));
                            }}
                            className="w-16 text-center py-1 border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 font-bold font-mono" 
                          />
                          <span className="absolute right-[-24px] top-1 text-slate-400">x</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 border-l border-slate-200 pl-8 md:pl-4">
                      <span className="text-slate-500">Pengali Deposit:</span>
                      {readOnly ? (
                        <span className="font-mono font-bold text-indigo-700">{scheme.installmentMultiplier}x</span>
                      ) : (
                        <div className="relative">
                          <input 
                            type="number" step="0.1" min="1.0"
                            value={scheme.installmentMultiplier} 
                            onChange={(e) => {
                              const val = parseFloat(e.target.value);
                              if(val >= 1) setPaymentSchemes(paymentSchemes.map(s => s.id === scheme.id ? {...s, installmentMultiplier: val} : s));
                            }}
                            className="w-16 text-center py-1 border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 font-bold font-mono" 
                          />
                        </div>
                      )}
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
                      <th className="p-3 text-center">{readOnly ? 'Status' : 'Aksi'}</th>
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
