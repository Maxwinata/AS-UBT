const fs = require('fs');
let code = fs.readFileSync('src/components/maba/MabaDashboard.tsx', 'utf8');

// Fix camera buttons for KTP
const ktpLiveCamTarget = `<button className="flex items-center justify-center gap-2 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors">
                    <Camera className="w-4 h-4" /> Akses Kamera Live
                  </button>`;
const ktpLiveCamReplace = `<button onClick={() => { setCameraTarget('ktp'); setCameraModalOpen(true); }} className="flex items-center justify-center gap-2 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors">
                    <Camera className="w-4 h-4" /> Akses Kamera Live
                  </button>`;

// Fix camera buttons for Selfie
const selfieLiveCamTarget = `<button className="flex items-center justify-center gap-2 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors">
                    <Camera className="w-4 h-4" /> Akses Kamera Selfie
                  </button>`;
const selfieLiveCamReplace = `<button onClick={() => { setCameraTarget('selfie'); setCameraModalOpen(true); }} className="flex items-center justify-center gap-2 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors">
                    <Camera className="w-4 h-4" /> Akses Kamera Selfie
                  </button>`;

if (code.includes(ktpLiveCamTarget)) {
  code = code.replace(ktpLiveCamTarget, ktpLiveCamReplace);
  console.log("Patched KTP Live Cam");
}
if (code.includes(selfieLiveCamTarget)) {
  code = code.replace(selfieLiveCamTarget, selfieLiveCamReplace);
  console.log("Patched Selfie Live Cam");
}

fs.writeFileSync('src/components/maba/MabaDashboard.tsx', code);
