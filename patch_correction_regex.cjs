const fs = require('fs');
let code = fs.readFileSync('src/components/admin/CorrectionRequestsAdmin.tsx', 'utf8');

const regex = /<div className="space-y-2 mt-4 max-h-64 overflow-y-auto pr-2">[\s\S]*?<\/div>\s*<\/div>\s*<div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end space-x-3">/g;

const replacement = `<div className="space-y-6 mt-4 max-h-[60vh] overflow-y-auto pr-2">
                
                {/* GROUP 1: DATA AKADEMIK */}
                <div>
                  <h4 className="font-bold text-xs text-slate-800 mb-2 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center">1</span> Data Akademik
                  </h4>
                  <div className="space-y-2 pl-7">
                    {[
                      { id: 'nama', label: 'Nama Lengkap' },
                      { id: 'nim', label: 'NIM' },
                      { id: 'prodi', label: 'Program Studi' },
                    ].map((field) => (
                      <label key={field.id} className={\`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors \${selectedFields.includes(field.id) ? 'bg-indigo-50 border-indigo-300' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}\`}>
                        <input type="checkbox" className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded cursor-pointer" checked={selectedFields.includes(field.id)} onChange={() => toggleField(field.id)} />
                        <span className={\`font-semibold text-xs \${selectedFields.includes(field.id) ? 'text-indigo-900' : 'text-slate-700'}\`}>{field.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* GROUP 2: KONTAK PRIBADI */}
                <div>
                  <h4 className="font-bold text-xs text-slate-800 mb-2 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center">2</span> Kontak Pribadi
                  </h4>
                  <div className="space-y-2 pl-7">
                    {[
                      { id: 'email', label: 'Email Aktif' },
                      { id: 'noHpWa', label: 'Nomor HP (WhatsApp)' },
                      { id: 'alamatUtama', label: 'Alamat Domisili / KTP' },
                    ].map((field) => (
                      <label key={field.id} className={\`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors \${selectedFields.includes(field.id) ? 'bg-indigo-50 border-indigo-300' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}\`}>
                        <input type="checkbox" className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded cursor-pointer" checked={selectedFields.includes(field.id)} onChange={() => toggleField(field.id)} />
                        <span className={\`font-semibold text-xs \${selectedFields.includes(field.id) ? 'text-indigo-900' : 'text-slate-700'}\`}>{field.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* GROUP 3: KONTAK DARURAT */}
                <div>
                  <h4 className="font-bold text-xs text-slate-800 mb-2 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center">3</span> Kontak Darurat
                  </h4>
                  <div className="space-y-2 pl-7">
                    {[
                      { id: 'kontakDaruratNama', label: 'Nama Kontak Darurat 1' },
                      { id: 'kontakDaruratHp', label: 'No HP Kontak Darurat 1' },
                      { id: 'kontakDaruratHubungan', label: 'Hubungan Kontak Darurat 1' },
                      { id: 'kontakDaruratAlamat', label: 'Alamat Kontak Darurat 1' },
                    ].map((field) => (
                      <label key={field.id} className={\`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors \${selectedFields.includes(field.id) ? 'bg-indigo-50 border-indigo-300' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}\`}>
                        <input type="checkbox" className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded cursor-pointer" checked={selectedFields.includes(field.id)} onChange={() => toggleField(field.id)} />
                        <span className={\`font-semibold text-xs \${selectedFields.includes(field.id) ? 'text-indigo-900' : 'text-slate-700'}\`}>{field.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* GROUP 4: PREFERENSI HUNIAN */}
                <div>
                  <h4 className="font-bold text-xs text-slate-800 mb-2 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center">4</span> Preferensi Hunian
                  </h4>
                  <div className="space-y-2 pl-7">
                    {[
                      { id: 'tipeKamar', label: 'Preferensi Kamar' },
                      { id: 'kebutuhanKhusus', label: 'Kebutuhan Khusus / Kesehatan' },
                    ].map((field) => (
                      <label key={field.id} className={\`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors \${selectedFields.includes(field.id) ? 'bg-indigo-50 border-indigo-300' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}\`}>
                        <input type="checkbox" className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded cursor-pointer" checked={selectedFields.includes(field.id)} onChange={() => toggleField(field.id)} />
                        <span className={\`font-semibold text-xs \${selectedFields.includes(field.id) ? 'text-indigo-900' : 'text-slate-700'}\`}>{field.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* GROUP 5: UPLOAD DOKUMEN & E-KYC */}
                <div>
                  <h4 className="font-bold text-xs text-slate-800 mb-2 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center">5</span> Upload Dokumen & e-KYC
                  </h4>
                  <div className="space-y-2 pl-7">
                    {[
                      { id: 'ktpUrl', label: 'Upload KTP' },
                      { id: 'selfieUrl', label: 'Upload Swafoto' }
                    ].map((field) => (
                      <label key={field.id} className={\`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors \${selectedFields.includes(field.id) ? 'bg-indigo-50 border-indigo-300' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}\`}>
                        <input type="checkbox" className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded cursor-pointer" checked={selectedFields.includes(field.id)} onChange={() => toggleField(field.id)} />
                        <span className={\`font-semibold text-xs \${selectedFields.includes(field.id) ? 'text-indigo-900' : 'text-slate-700'}\`}>{field.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

              </div>
            </div>
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end space-x-3">`;

if (regex.test(code)) {
  code = code.replace(regex, replacement);
  fs.writeFileSync('src/components/admin/CorrectionRequestsAdmin.tsx', code);
  console.log("Patched successfully.");
} else {
  console.error("Regex did not match.");
}
