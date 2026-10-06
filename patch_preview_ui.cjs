const fs = require('fs');
let code = fs.readFileSync('src/components/maba/MabaDashboard.tsx', 'utf8');

const ktpPreviewTarget = `{profile.ktpUrl && (
                  <div className="mt-3 p-2 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-800 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> File KTP Tersimpan</span>
                    <button className="text-rose-500 hover:text-rose-700 p-1"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                )}`;
const ktpPreviewReplace = `{profile.ktpUrl && (
                  <div className="mt-4 border border-slate-200 rounded-xl overflow-hidden relative group">
                    <img src={profile.ktpUrl !== 'mock_ktp.jpg' ? profile.ktpUrl : 'https://placehold.co/600x400/e2e8f0/475569?text=Simulasi+KTP'} alt="KTP Preview" className="w-full h-auto object-cover max-h-48" />
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                       <button onClick={() => {
                          setKtpPreview(null);
                          setProfile((p: any) => {
                            const updated = {...p, ktpUrl: undefined};
                            if (onUpdateProfile) onUpdateProfile(updated);
                            return updated;
                          });
                       }} className="bg-rose-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-rose-600">
                          <Trash2 className="w-4 h-4"/> Hapus
                       </button>
                    </div>
                    <div className="absolute top-2 left-2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow">Terverifikasi AI</div>
                  </div>
                )}`;

const selfiePreviewTarget = `{profile.selfieUrl && (
                  <div className="mt-3 p-2 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-800 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> File Selfie Tersimpan</span>
                    <button className="text-rose-500 hover:text-rose-700 p-1"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                )}`;
const selfiePreviewReplace = `{profile.selfieUrl && (
                  <div className="mt-4 border border-slate-200 rounded-xl overflow-hidden relative group">
                    <img src={profile.selfieUrl !== 'mock_selfie.jpg' ? profile.selfieUrl : 'https://placehold.co/400x400/e2e8f0/475569?text=Simulasi+Selfie'} alt="Selfie Preview" className="w-full h-auto object-cover max-h-48" />
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                       <button onClick={() => {
                          setSelfiePreview(null);
                          setProfile((p: any) => {
                            const updated = {...p, selfieUrl: undefined};
                            if (onUpdateProfile) onUpdateProfile(updated);
                            return updated;
                          });
                       }} className="bg-rose-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-rose-600">
                          <Trash2 className="w-4 h-4"/> Hapus
                       </button>
                    </div>
                    <div className="absolute top-2 left-2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow">Wajah Terdeteksi</div>
                  </div>
                )}`;

code = code.replace(ktpPreviewTarget, ktpPreviewReplace);
code = code.replace(selfiePreviewTarget, selfiePreviewReplace);

fs.writeFileSync('src/components/maba/MabaDashboard.tsx', code);
console.log("Patched previews");
