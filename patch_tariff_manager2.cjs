const fs = require('fs');
let code = fs.readFileSync('src/components/admin/TariffManager.tsx', 'utf8');

// 1. Add state for adding a scheme
code = code.replace(
  /const \[addForm, setAddForm\] = useState<Partial<TariffItem>>\(\{/,
  `const [isAddingScheme, setIsAddingScheme] = useState(false);
  const [addSchemeForm, setAddSchemeForm] = useState<Partial<PaymentScheme>>({
    target: 'REGULER',
    maxInstallments: 1,
    installmentMultiplier: 1.0
  });
  
  const [addForm, setAddForm] = useState<Partial<TariffItem>>({`
);

// 2. Add handleSaveSchemeAdd
code = code.replace(
  /const handleSaveAdd = \(\) => \{/,
  `const handleSaveSchemeAdd = () => {
    if (addSchemeForm.target && addSchemeForm.maxInstallments && addSchemeForm.installmentMultiplier) {
      if (paymentSchemes.some(s => s.target === addSchemeForm.target)) {
        alert('Skema cicilan untuk grup ini sudah ada. Silakan edit skema yang ada daripada membuat baru.');
        return;
      }
      
      const newScheme: PaymentScheme = {
        id: \`ps\${Date.now()}\`,
        target: addSchemeForm.target as any,
        maxInstallments: addSchemeForm.maxInstallments,
        installmentMultiplier: addSchemeForm.installmentMultiplier
      };
      setPaymentSchemes([...paymentSchemes, newScheme]);
      setIsAddingScheme(false);
    }
  };

  const handleSaveAdd = () => {`
);

// 3. Add UI buttons
code = code.replace(
  /\{!isAdding && \(\s*<button onClick=\{\(\) => setIsAdding\(true\)\} className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium transition-colors">\s*<Plus className="w-4 h-4" \/>\s*<span>Tambah Tarif<\/span>\s*<\/button>\s*\)\}/,
  `<div className="flex gap-3">
          {!isAddingScheme && (
            <button onClick={() => setIsAddingScheme(true)} className="flex items-center space-x-2 px-4 py-2 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg hover:bg-indigo-100 text-sm font-medium transition-colors">
              <Settings2 className="w-4 h-4" />
              <span>Tambah Skema Cicilan</span>
            </button>
          )}
          {!isAdding && (
            <button onClick={() => setIsAdding(true)} className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium transition-colors">
              <Plus className="w-4 h-4" />
              <span>Tambah Tarif</span>
            </button>
          )}
        </div>`
);

// 4. Add Scheme Form UI
code = code.replace(
  /\{isAdding && \(/,
  `{isAddingScheme && (
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

      {isAdding && (`
);

fs.writeFileSync('src/components/admin/TariffManager.tsx', code);
