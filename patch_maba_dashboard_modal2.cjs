const fs = require('fs');
let code = fs.readFileSync('src/components/maba/MabaDashboard.tsx', 'utf8');

const modalCode = `      {correctionModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-extrabold text-slate-900 flex items-center space-x-2">
                <FileEdit className="w-5 h-5 text-indigo-600" />
                <span>Pengajuan Koreksi Data</span>
              </h3>
              <button
                type="button"
                onClick={() => setCorrectionModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4 text-sm text-slate-700">
              <p>
                Silakan tuliskan dengan jelas data mana yang salah dan perlu dikoreksi. 
                Admin akan meninjau permintaan Anda dan membuka kunci form jika disetujui.
              </p>
              
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Catatan Kesalahan Data *</label>
                <textarea 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:ring-1 focus:ring-indigo-500 min-h-[120px]"
                  placeholder="Contoh: Nomor HP Wali saya salah ketik, seharusnya 0812345..."
                  value={correctionNotes}
                  onChange={(e) => setCorrectionNotes(e.target.value)}
                />
              </div>
            </div>
            
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setCorrectionModalOpen(false)}
                className="px-5 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-200 transition-colors text-xs"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onUpdateProfile) {
                    onUpdateProfile({ ...profile, correctionStatus: 'pending' });
                  }
                  setCorrectionModalOpen(false);
                  toast.success('Pengajuan koreksi berhasil dikirim ke Admin.', { icon: '📝' });
                }}
                disabled={!correctionNotes.trim()}
                className="px-5 py-2.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-colors text-xs flex items-center gap-2"
              >
                <FileEdit className="w-4 h-4" />
                <span>Kirim Pengajuan</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CAMERA MODAL */}`;

const targetFooterStr = `      {/* CAMERA MODAL */}`;

if (code.includes(targetFooterStr) && !code.includes('Pengajuan Koreksi Data')) {
  code = code.replace(targetFooterStr, modalCode);
  fs.writeFileSync('src/components/maba/MabaDashboard.tsx', code);
  console.log("Patched modal successfully.");
} else {
  console.log("Modal already exists or target not found.");
}
