const fs = require('fs');
let code = fs.readFileSync('src/components/maba/MabaDashboard.tsx', 'utf8');

const targetStr = `  const handleStepNavigation = (step: AdmissionStep) => {
    setCurrentStep(step);
    setTimeout(() => {
      document.getElementById(\`step-\${step}-panel\`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };`;

const renderSandboxStr = `  const [isSandboxOpen, setIsSandboxOpen] = useState(false);

  const renderSandbox = () => {
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

if (code.includes(targetStr)) {
  code = code.replace(targetStr, targetStr + '\n\n' + renderSandboxStr);
  fs.writeFileSync('src/components/maba/MabaDashboard.tsx', code);
  console.log("Patched sandbox logic successfully.");
}
