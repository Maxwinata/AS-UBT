const fs = require('fs');
let code = fs.readFileSync('src/components/maba/MabaDashboard.tsx', 'utf8');

const regex = /({\/\* STEP 1: PENGISIAN FORM \*\/})([\s\S]*?)({\/\* Reset Footer \*\/})/;
const match = code.match(regex);

if (match) {
  let guideBlock = `
                  {/* STEP 1: PENGISIAN FORM */}
                  <div className="relative pl-5 pb-6">
                    <div className={\`absolute left-[-5px] top-1 w-3 h-3 rounded-full border-2 border-white shadow-sm \${currentStep > 1 ? 'bg-emerald-500' : currentStep === 1 ? 'bg-indigo-500 animate-pulse' : 'bg-slate-300'}\`} />
                    <div className={\`absolute left-0 top-4 bottom-0 w-0.5 \${currentStep > 1 ? 'bg-emerald-500' : 'bg-slate-200'}\`} />
                    
                    <h5 className={\`font-bold text-sm \${currentStep >= 1 ? 'text-slate-900' : 'text-slate-500'}\`}>1. Pengisian Form & e-KYC</h5>
                    <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">Maba mengisi biodata, kontak, dan swafoto KTP untuk verifikasi identitas.</p>
                    
                    <div className="bg-slate-800 text-emerald-300 border border-slate-700 rounded-lg p-2.5 mt-2.5 text-[10px] font-mono shadow-inner">
                      <span className="text-slate-400 block mb-1">// Backend DB Update:</span>
                      profile.kycSubmitted = true;
                    </div>

                    {currentStep === 1 && (
                      <div className="mt-3 space-y-2">
                        <button 
                          onClick={() => {
                            const p = { ...profile, kycVerified: true, kycSubmitted: true, correctionStatus: 'none' };
                            setProfile(p);
                            if (onUpdateProfile) onUpdateProfile(p);
                            setCurrentStep(2);
                            toast.success('KYC disetujui (Simulasi)');
                          }}
                          className="w-full text-left px-3 py-2 text-xs font-bold rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 transition-colors shadow-sm flex justify-between items-center"
                        >
                          <span>Simulasi: Admin Approve KYC</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                        <button 
                          onClick={() => {
                            const p = { ...profile, correctionStatus: 'unlocked' };
                            setProfile(p);
                            if (onUpdateProfile) onUpdateProfile(p);
                            toast.success('Akses Koreksi Dibuka (Simulasi)');
                          }}
                          className="w-full text-left px-3 py-2 text-[11px] font-semibold rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors"
                        >
                          Simulasi: Buka Kunci Form (Unlock)
                        </button>
                      </div>
                    )}
                  </div>

                  {/* STEP 2: PEMILIHAN SKEMA */}
                  <div className="relative pl-5 pb-6">
                    <div className={\`absolute left-[-5px] top-1 w-3 h-3 rounded-full border-2 border-white shadow-sm \${currentStep > 2 ? 'bg-emerald-500' : currentStep === 2 ? 'bg-indigo-500 animate-pulse' : 'bg-slate-300'}\`} />
                    <div className={\`absolute left-0 top-4 bottom-0 w-0.5 \${currentStep > 2 ? 'bg-emerald-500' : 'bg-slate-200'}\`} />
                    
                    <h5 className={\`font-bold text-sm \${currentStep >= 2 ? 'text-slate-900' : 'text-slate-500'}\`}>2. Konfigurasi Tagihan</h5>
                    <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">Sistem memproses skema tarif (Normal vs KIP). Maba memilih durasi sewa & cicilan.</p>
                    
                    <div className="bg-slate-800 text-emerald-300 border border-slate-700 rounded-lg p-2.5 mt-2.5 text-[10px] font-mono shadow-inner">
                      <span className="text-slate-400 block mb-1">// Backend DB Update:</span>
                      invoice.status = 'UNPAID';<br/>
                      invoice.totalBayar = calculated;
                    </div>
                  </div>

                  {/* STEP 3: PEMBAYARAN */}
                  <div className="relative pl-5 pb-6">
                    <div className={\`absolute left-[-5px] top-1 w-3 h-3 rounded-full border-2 border-white shadow-sm \${currentStep > 3 ? 'bg-emerald-500' : currentStep === 3 ? 'bg-indigo-500 animate-pulse' : 'bg-slate-300'}\`} />
                    <div className={\`absolute left-0 top-4 bottom-0 w-0.5 \${currentStep > 3 ? 'bg-emerald-500' : 'bg-slate-200'}\`} />
                    
                    <h5 className={\`font-bold text-sm \${currentStep >= 3 ? 'text-slate-900' : 'text-slate-500'}\`}>3. Pembayaran Bank</h5>
                    <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">Maba mentransfer dana via Virtual Account atau Manual ke rekening bendahara.</p>
                    
                    <div className="bg-slate-800 text-emerald-300 border border-slate-700 rounded-lg p-2.5 mt-2.5 text-[10px] font-mono shadow-inner">
                      <span className="text-slate-400 block mb-1">// Callback dari Bank API:</span>
                      invoice.status = 'PAID';
                    </div>

                    {currentStep === 3 && (
                      <div className="mt-3">
                        <button 
                          onClick={() => {
                            const inv = { ...invoice, status: 'PAID' };
                            setInvoice(inv);
                            onUpdateInvoice(inv);
                            setCurrentStep(4);
                            toast.success('Pembayaran lunas (Simulasi)');
                          }}
                          className="w-full text-left px-3 py-2 text-xs font-bold rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 transition-colors shadow-sm flex justify-between items-center"
                        >
                          <span>Simulasi: Webhook Bank Lunas</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* STEP 4: KONTRAK */}
                  <div className="relative pl-5 pb-6">
                    <div className={\`absolute left-[-5px] top-1 w-3 h-3 rounded-full border-2 border-white shadow-sm \${currentStep > 4 ? 'bg-emerald-500' : currentStep === 4 ? 'bg-indigo-500 animate-pulse' : 'bg-slate-300'}\`} />
                    <div className={\`absolute left-0 top-4 bottom-0 w-0.5 \${currentStep > 4 ? 'bg-emerald-500' : 'bg-slate-200'}\`} />
                    
                    <h5 className={\`font-bold text-sm \${currentStep >= 4 ? 'text-slate-900' : 'text-slate-500'}\`}>4. Kontrak Kolektif Digital</h5>
                    <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">Maba memasukkan kode OTP persetujuan untuk penandatanganan kolektif (F20).</p>
                    
                    <div className="bg-slate-800 text-emerald-300 border border-slate-700 rounded-lg p-2.5 mt-2.5 text-[10px] font-mono shadow-inner">
                      <span className="text-slate-400 block mb-1">// Backend DB Update:</span>
                      contract.status = 'SIGNED';<br/>
                      room.assigned = true;
                    </div>

                    {currentStep === 4 && (
                      <div className="mt-3 space-y-2">
                        <button 
                          onClick={() => {
                            const c = { ...contract, status: 'SIGNED' };
                            setContract(c);
                            onUpdateContract(c);
                            setCurrentStep(5); 
                            toast.success('Kontrak ditandatangani (Simulasi)');
                          }}
                          className="w-full text-left px-3 py-2 text-xs font-bold rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 transition-colors shadow-sm flex justify-between items-center"
                        >
                          <span>Simulasi: TTD OTP Berhasil</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* STEP 5: E-TICKET */}
                  <div className="relative pl-5 pb-6">
                    <div className={\`absolute left-[-5px] top-1 w-3 h-3 rounded-full border-2 border-white shadow-sm \${currentStep > 5 ? 'bg-emerald-500' : currentStep === 5 ? 'bg-indigo-500 animate-pulse' : 'bg-slate-300'}\`} />
                    <div className={\`absolute left-0 top-4 bottom-0 w-0.5 \${currentStep > 5 ? 'bg-emerald-500' : 'bg-slate-200'}\`} />
                    
                    <h5 className={\`font-bold text-sm \${currentStep >= 5 ? 'text-slate-900' : 'text-slate-500'}\`}>5. Penerbitan e-Ticket</h5>
                    <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">E-Ticket diterbitkan untuk barcode pemindaian saat check-in fisik di asrama.</p>
                    
                    <div className="bg-slate-800 text-emerald-300 border border-slate-700 rounded-lg p-2.5 mt-2.5 text-[10px] font-mono shadow-inner">
                      <span className="text-slate-400 block mb-1">// Backend DB Update:</span>
                      ticket.status = 'ACTIVE';
                    </div>
                    
                    {currentStep === 5 && (
                      <div className="mt-3 space-y-2">
                        <button 
                          onClick={() => {
                            const t = { ...ticket, status: 'ACTIVE' };
                            onUpdateTicket(t);
                            setCurrentStep(6); 
                            toast.success('e-Ticket diaktifkan (Simulasi)');
                          }}
                          className="w-full text-left px-3 py-2 text-xs font-bold rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 transition-colors shadow-sm flex justify-between items-center"
                        >
                          <span>Simulasi: Generate Ticket</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* STEP 6: BASTK */}
                  <div className="relative pl-5">
                    <div className={\`absolute left-[-5px] top-1 w-3 h-3 rounded-full border-2 border-white shadow-sm \${currentStep === 6 ? 'bg-indigo-500 animate-pulse' : 'bg-slate-300'}\`} />
                    
                    <h5 className={\`font-bold text-sm \${currentStep >= 6 ? 'text-slate-900' : 'text-slate-500'}\`}>6. Serah Terima (BASTK)</h5>
                    <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">Penyewa check-in, memindai tiket, dan menandatangani Berita Acara Serah Terima Kamar.</p>
                  </div>
                </div>
              </div>
`;
  code = code.replace(match[2], guideBlock);
  fs.writeFileSync('src/components/maba/MabaDashboard.tsx', code);
  console.log("Patched Simulation Guide sidebar successfully.");
} else {
  console.log("Could not find the simulation guide block in MabaDashboard.");
}
