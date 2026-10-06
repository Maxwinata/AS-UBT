const fs = require('fs');
let code = fs.readFileSync('src/components/maba/MabaDashboard.tsx', 'utf8');

const targetStr = `          {/* HEADER DASHBOARD MABA LAMA */}
          <div className="bg-emerald-800 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <CheckCircle2 className="w-32 h-32" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center space-x-2 mb-4 text-xs font-medium text-emerald-200 uppercase tracking-widest">
                <span>ADMISSION FORM</span>
                <span>•</span>
                <span>Asrama UBT</span>
              </div>
              <h1 className="text-3xl font-extrabold mb-2 text-white">
                Registrasi Data Penghuni Asrama
              </h1>
              <p className="text-emerald-100 max-w-2xl text-sm leading-relaxed mb-2">
                Silakan lengkapi informasi domisili dan kontak darurat Anda. Data akademik telah disinkronisasi langsung dari sistem universitas dan bersifat <em>read-only</em> (hanya baca).
              </p>
            </div>
          </div>`;

const newStr = `          {/* HEADER TEXT (SIMPLIFIED) */}
          <div className="mb-2 pt-2 lg:pt-4">
            <div className="flex items-center space-x-2 mb-2 text-[11px] font-bold text-emerald-700 uppercase tracking-widest">
              <span>ADMISSION FORM</span>
              <span className="text-emerald-300">•</span>
              <span>ASRAMA UBT</span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-1">
              Registrasi Data Penghuni Asrama
            </h2>
            <p className="text-slate-500 text-sm max-w-3xl leading-relaxed">
              Silakan lengkapi informasi domisili dan kontak darurat Anda. Data akademik telah disinkronisasi langsung dari sistem universitas dan bersifat <em className="text-slate-600">read-only</em> (hanya baca).
            </p>
          </div>`;

if (code.includes(targetStr)) {
  code = code.replace(targetStr, newStr);
  fs.writeFileSync('src/components/maba/MabaDashboard.tsx', code);
  console.log("Patched successfully.");
} else {
  console.error("Target string not found.");
}
