const fs = require('fs');
let code = fs.readFileSync('src/components/maba/MabaDashboard.tsx', 'utf8');

const bannerCode = `          {profile.kycSubmitted && profile.correctionStatus !== 'unlocked' && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm">
              <div>
                <h3 className="font-bold text-slate-900 mb-1">Data Terkunci</h3>
                <p className="text-xs text-slate-500 max-w-3xl">Data Anda telah dikunci untuk proses validasi. Jika terdapat kesalahan data (seperti Nomor HP Wali), silakan ajukan Koreksi Data agar admin dapat membukakan akses.</p>
              </div>
              <button onClick={() => setCorrectionModalOpen(true)} className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold text-xs hover:bg-slate-800 transition-colors whitespace-nowrap flex-shrink-0">
                Ajukan Koreksi Data
              </button>
            </div>
          )}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">`;

const targetGridStr = `<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">`;

if (code.includes(targetGridStr) && !code.includes('Ajukan Koreksi Data')) {
  // Only replace the FIRST occurrence in the specific area. We can use index.
  const step1PanelStart = code.indexOf('id="step-1-panel"');
  if (step1PanelStart !== -1) {
    const gridIdx = code.indexOf(targetGridStr, step1PanelStart);
    if (gridIdx !== -1) {
      code = code.substring(0, gridIdx) + bannerCode + code.substring(gridIdx + targetGridStr.length);
      fs.writeFileSync('src/components/maba/MabaDashboard.tsx', code);
      console.log("Patched banner successfully.");
    }
  }
} else {
  console.log("Banner already exists or target not found.");
}
