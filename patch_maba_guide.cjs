const fs = require('fs');
let code = fs.readFileSync('src/components/maba/MabaDashboard.tsx', 'utf8');

const targetSandboxOld = `  const renderSandbox = () => {
    return (
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
        {isSandboxOpen && (
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-80 mb-4 overflow-hidden animate-in fade-in slide-in-from-bottom-4">
            <div className="flex justify-between items-center p-4 bg-slate-900 text-white">
              <h4 className="font-bold text-sm flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-emerald-400" /> Simulation Mode
              </h4>
              <button onClick={() => setIsSandboxOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto bg-slate-50">
              
              {/* Reset */}
              <div>
                 <button 
                  onClick={() => {
                    const p = { ...profile, kycVerified: false, kycSubmitted: false, correctionStatus: 'none' };
                    const inv = { ...invoice, status: 'UNPAID' };
                    const c = { ...contract, status: 'DRAFT' };
                    setProfile(p);
                    setInvoice(inv);
                    setContract(c);
                    if (onUpdateProfile) onUpdateProfile(p);
                    onUpdateInvoice(inv);
                    onUpdateContract(c);
                    setCurrentStep(1);
                    toast.success('Reset to Step 1');
                  }}
                  className="w-full bg-red-100 text-red-700 hover:bg-red-200 px-3 py-2 rounded-xl text-xs font-bold transition-colors"
                >
                  Reset Flow (Mulai dari Awal)
                </button>
              </div>

              {/* Step 1 */}
              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <p className="font-bold text-[10px] text-slate-400 uppercase tracking-wider mb-2">Tahap 1: Registrasi & e-KYC</p>
                <div className="space-y-2">
                  <button 
                    onClick={() => {
                      const p = { ...profile, kycVerified: true, kycSubmitted: true, correctionStatus: 'none' };
                      setProfile(p);
                      if (onUpdateProfile) onUpdateProfile(p);
                      setCurrentStep(2);
                      toast.success('KYC disetujui (Simulasi)');
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                  >
                    Set: e-KYC Disetujui
                  </button>
                  <button 
                    onClick={() => {
                      const p = { ...profile, correctionStatus: 'unlocked' };
                      setProfile(p);
                      if (onUpdateProfile) onUpdateProfile(p);
                      toast.success('Akses Koreksi Dibuka (Simulasi)');
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
                  >
                    Set: Buka Kunci Form (Unlock)
                  </button>
                </div>
              </div>

              {/* Step 2 */}
              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <p className="font-bold text-[10px] text-slate-400 uppercase tracking-wider mb-2">Tahap 2: Tagihan</p>
                <div className="space-y-2">
                  <button 
                    onClick={() => {
                      const inv = { ...invoice, status: 'PAID' };
                      setInvoice(inv);
                      onUpdateInvoice(inv);
                      setCurrentStep(4);
                      toast.success('Pembayaran lunas (Simulasi)');
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                  >
                    Set: Pembayaran Lunas
                  </button>
                </div>
              </div>

              {/* Step 3 */}
              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <p className="font-bold text-[10px] text-slate-400 uppercase tracking-wider mb-2">Tahap 3 & 4</p>
                <div className="space-y-2">
                  <button 
                    onClick={() => {
                      const c = { ...contract, status: 'SIGNED' };
                      setContract(c);
                      onUpdateContract(c);
                      setCurrentStep(6); 
                      toast.success('Kontrak ditandatangani (Simulasi)');
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                  >
                    Set: Kontrak TTD Kolektif
                  </button>
                  <button 
                    onClick={() => {
                      const t = { ...ticket, status: 'ACTIVE' };
                      onUpdateTicket(t);
                      setCurrentStep(6); 
                      toast.success('e-Ticket diaktifkan (Simulasi)');
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-semibold rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                  >
                    Set: e-Ticket Aktif
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}
        <button 
          onClick={() => setIsSandboxOpen(!isSandboxOpen)}
          className="bg-slate-900 text-white p-3.5 rounded-full shadow-2xl hover:bg-slate-800 transition-all hover:scale-105 active:scale-95 flex items-center justify-center"
          title="Sandbox Simulation Mode"
        >
          <Settings2 className="w-6 h-6" />
        </button>
      </div>
    );
  };`;

const newRenderSandbox = `  const renderSandbox = () => {
    return (
      <>
        {isSandboxOpen && (
          <>
            {/* Backdrop for mobile closing */}
            <div className="fixed inset-0 bg-slate-900/20 z-[90] lg:hidden backdrop-blur-sm" onClick={() => setIsSandboxOpen(false)} />
            
            {/* Sidebar Guide */}
            <div className="fixed inset-y-0 right-0 z-[100] w-full max-w-sm bg-white shadow-[0_0_40px_rgba(0,0,0,0.1)] border-l border-slate-200 flex flex-col animate-in slide-in-from-right duration-300">
              <div className="p-4 bg-slate-900 text-white flex justify-between items-center shrink-0 shadow-md relative z-10">
                <div>
                  <h4 className="font-bold flex items-center gap-2">
                    <Settings2 className="w-4 h-4 text-emerald-400" /> Simulation Guide
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Registration Flow Checklist & DB Sync</p>
                </div>
                <button onClick={() => setIsSandboxOpen(false)} className="text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 p-1.5 rounded-lg transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 bg-slate-50">
                <div className="space-y-0 relative">
                  {/* STEP 1: PENGISIAN FORM */}
                  <div className="relative pl-5 pb-6">
                    <div className={\`absolute left-[-5px] top-1 w-3 h-3 rounded-full border-2 border-white shadow-sm \${currentStep > 1 ? 'bg-emerald-500' : currentStep === 1 ? 'bg-indigo-500 animate-pulse' : 'bg-slate-300'}\`} />
                    <div className={\`absolute left-0 top-4 bottom-0 w-0.5 \${currentStep > 1 ? 'bg-emerald-500' : 'bg-slate-200'}\`} />
                    
                    <h5 className={\`font-bold text-sm \${currentStep >= 1 ? 'text-slate-900' : 'text-slate-500'}\`}>1. Pengisian Form & e-KYC</h5>
                    <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">Maba mengisi biodata, kontak, dan unggah swafoto KTP untuk verifikasi identitas.</p>
                    
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
                    <div className={\`absolute left-[-5px] top-1 w-3 h-3 rounded-full border-2 border-white shadow-sm \${currentStep > 3 ? 'bg-emerald-500' : (currentStep === 2 || currentStep === 3) ? 'bg-indigo-500 animate-pulse' : 'bg-slate-300'}\`} />
                    <div className={\`absolute left-0 top-4 bottom-0 w-0.5 \${currentStep > 3 ? 'bg-emerald-500' : 'bg-slate-200'}\`} />
                    
                    <h5 className={\`font-bold text-sm \${currentStep >= 2 ? 'text-slate-900' : 'text-slate-500'}\`}>2. Konfigurasi Tagihan</h5>
                    <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">Sistem memproses skema tarif (Normal vs KIP). Maba memilih durasi sewa dan opsi cicilan deposit.</p>
                    
                    <div className="bg-slate-800 text-emerald-300 border border-slate-700 rounded-lg p-2.5 mt-2.5 text-[10px] font-mono shadow-inner">
                      <span className="text-slate-400 block mb-1">// Backend DB Update:</span>
                      invoice.status = 'UNPAID';<br/>
                      invoice.totalBayar = calculated;
                    </div>
                  </div>

                  {/* STEP 3: PEMBAYARAN */}
                  <div className="relative pl-5 pb-6">
                    <div className={\`absolute left-[-5px] top-1 w-3 h-3 rounded-full border-2 border-white shadow-sm \${currentStep > 4 ? 'bg-emerald-500' : currentStep === 4 ? 'bg-indigo-500 animate-pulse' : 'bg-slate-300'}\`} />
                    <div className={\`absolute left-0 top-4 bottom-0 w-0.5 \${currentStep > 4 ? 'bg-emerald-500' : 'bg-slate-200'}\`} />
                    
                    <h5 className={\`font-bold text-sm \${currentStep >= 4 ? 'text-slate-900' : 'text-slate-500'}\`}>3. Pembayaran Bank</h5>
                    <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">Maba mentransfer dana via Virtual Account bank mitra (BNI/Mandiri/BSI).</p>
                    
                    <div className="bg-slate-800 text-emerald-300 border border-slate-700 rounded-lg p-2.5 mt-2.5 text-[10px] font-mono shadow-inner">
                      <span className="text-slate-400 block mb-1">// Callback dari Bank API:</span>
                      invoice.status = 'PAID';
                    </div>

                    {(currentStep === 3 || currentStep === 4) && (
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
                    <div className={\`absolute left-[-5px] top-1 w-3 h-3 rounded-full border-2 border-white shadow-sm \${contract.status === 'SIGNED' ? 'bg-emerald-500' : currentStep === 5 ? 'bg-indigo-500 animate-pulse' : 'bg-slate-300'}\`} />
                    <div className={\`absolute left-0 top-4 bottom-0 w-0.5 \${contract.status === 'SIGNED' ? 'bg-emerald-500' : 'bg-slate-200'}\`} />
                    
                    <h5 className={\`font-bold text-sm \${currentStep >= 5 ? 'text-slate-900' : 'text-slate-500'}\`}>4. Kontrak Kolektif Digital</h5>
                    <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">Maba memasukkan kode OTP persetujuan untuk pemberian kuasa penandatanganan kolektif.</p>
                    
                    <div className="bg-slate-800 text-emerald-300 border border-slate-700 rounded-lg p-2.5 mt-2.5 text-[10px] font-mono shadow-inner">
                      <span className="text-slate-400 block mb-1">// Backend DB Update:</span>
                      contract.status = 'SIGNED';<br/>
                      room.assigned = true;
                    </div>

                    {currentStep === 5 && (
                      <div className="mt-3 space-y-2">
                        <button 
                          onClick={() => {
                            const c = { ...contract, status: 'SIGNED' };
                            setContract(c);
                            onUpdateContract(c);
                            setCurrentStep(6); 
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
                  <div className="relative pl-5">
                    <div className={\`absolute left-[-5px] top-1 w-3 h-3 rounded-full border-2 border-white shadow-sm \${currentStep === 6 ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}\`} />
                    
                    <h5 className={\`font-bold text-sm \${currentStep >= 6 ? 'text-slate-900' : 'text-slate-500'}\`}>5. Penerbitan e-Ticket</h5>
                    <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">Ticket asrama diterbitkan berisi jadwal check-in fisik dan titik lokasi.</p>
                    
                    <div className="bg-slate-800 text-emerald-300 border border-slate-700 rounded-lg p-2.5 mt-2.5 text-[10px] font-mono shadow-inner">
                      <span className="text-slate-400 block mb-1">// Backend DB Update:</span>
                      ticket.status = 'ACTIVE';
                    </div>
                  </div>
                </div>
              </div>

              {/* Reset Footer */}
              <div className="p-4 bg-white border-t border-slate-200 shrink-0">
                <button 
                  onClick={() => {
                    const p = { ...profile, kycVerified: false, kycSubmitted: false, correctionStatus: 'none' };
                    const inv = { ...invoice, status: 'UNPAID' };
                    const c = { ...contract, status: 'DRAFT' };
                    setProfile(p);
                    setInvoice(inv);
                    setContract(c);
                    if (onUpdateProfile) onUpdateProfile(p);
                    onUpdateInvoice(inv);
                    onUpdateContract(c);
                    setCurrentStep(1);
                    toast.success('Sistem direset ke Tahap 1');
                  }}
                  className="w-full bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2"
                >
                  <History className="w-4 h-4" /> Reset Semua Alur
                </button>
              </div>
            </div>
          </>
        )}

        <button 
          onClick={() => setIsSandboxOpen(!isSandboxOpen)}
          className="fixed bottom-6 right-6 z-[90] bg-slate-900 text-white p-4 rounded-full shadow-2xl hover:bg-slate-800 transition-all hover:scale-105 active:scale-95 flex items-center justify-center border-2 border-slate-700"
          title="Buka Simulation Guide"
        >
          <Settings2 className="w-6 h-6" />
        </button>
      </>
    );
  };`;

if (code.includes(targetSandboxOld)) {
  code = code.replace(targetSandboxOld, newRenderSandbox);
  fs.writeFileSync('src/components/maba/MabaDashboard.tsx', code);
  console.log("Patched sandbox to guide successfully.");
} else {
  console.log("Could not find the sandbox block to patch.");
}
