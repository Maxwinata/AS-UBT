const fs = require('fs');
let code = fs.readFileSync('src/components/maba/MabaDashboard.tsx', 'utf8');

const waModalCode = `
      {/* WA SIMULATOR MODAL */}
      {showWaSimulator && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row relative">
            <button onClick={() => setShowWaSimulator(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 z-10 bg-white/50 p-1 rounded-full backdrop-blur">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            
            {/* Left: Smartphone Simulator */}
            <div className="bg-slate-100 p-6 md:w-1/2 border-r border-slate-200 flex flex-col items-center justify-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-200 rounded-full blur-3xl opacity-50 -mr-10 -mt-10"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-200 rounded-full blur-3xl opacity-50 -ml-10 -mb-10"></div>
              
              <div className="w-[260px] h-[520px] bg-white rounded-[2.5rem] border-[10px] border-slate-800 overflow-hidden relative shadow-xl z-10 flex flex-col">
                 {/* Notch */}
                 <div className="absolute top-0 inset-x-0 h-5 bg-slate-800 rounded-b-2xl mx-16 z-20"></div>
                 {/* WA Header */}
                 <div className="bg-[#075E54] text-white p-3 pt-7 flex items-center gap-3 shadow-sm z-10">
                    <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-5 h-5 text-white"/>
                    </div>
                    <div>
                      <div className="text-sm font-bold leading-tight">Asrama UBT Official</div>
                      <div className="text-[10px] opacity-80 leading-tight">Akun Bisnis Resmi</div>
                    </div>
                 </div>
                 {/* Chat Area */}
                 <div className="bg-[#E5DDD5] flex-1 p-3 space-y-4 overflow-y-auto custom-scrollbar flex flex-col">
                    <div className="text-center my-2">
                      <span className="bg-[#D4EAF4] text-slate-600 text-[9px] px-2 py-1 rounded-md font-medium uppercase tracking-wider">Hari Ini</span>
                    </div>
                    
                    {/* Message 1: Student */}
                    <div className="bg-white p-2.5 rounded-lg rounded-tl-none text-xs text-slate-800 shadow-sm max-w-[90%] relative animate-in slide-in-from-left-2 duration-300">
                       <span className="font-bold text-[#075E54] block mb-1">Asrama UBT</span>
                       [SIMULASI MAHASISWA]<br/><br/>
                       Halo <strong>{profile.nama}</strong>,<br/>
                       Kode OTP untuk penandatanganan kontrak Asrama Anda (F-19 & F-02):<br/>
                       <span className="block my-2 text-center text-lg font-black tracking-widest text-slate-900 bg-slate-100 py-1 rounded border border-slate-200">123456</span>
                       Jangan berikan kode ini kepada siapapun. Berlaku 5 menit.
                       <span className="block text-[9px] text-right text-slate-400 mt-1">{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>

                    {/* Message 2: Parent */}
                    <div className="bg-white p-2.5 rounded-lg rounded-tl-none text-xs text-slate-800 shadow-sm max-w-[90%] relative animate-in slide-in-from-left-2 duration-500 delay-150 fill-mode-both">
                       <span className="font-bold text-[#075E54] block mb-1">Asrama UBT</span>
                       [SIMULASI WALI]<br/><br/>
                       Kode OTP Wali untuk persetujuan kontrak Asrama atas nama <strong>{profile.nama}</strong>:<br/>
                       <span className="block my-2 text-center text-lg font-black tracking-widest text-slate-900 bg-slate-100 py-1 rounded border border-slate-200">654321</span>
                       <span className="block text-[9px] text-right text-slate-400 mt-1">{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                 </div>
              </div>
            </div>
            
            {/* Right: Input Form */}
            <div className="p-8 md:w-1/2 flex flex-col bg-white">
              <div className="flex-1">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-4">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">Verifikasi OTP</h3>
                <p className="text-sm text-slate-500 mb-6">Sistem mensimulasikan pengiriman pesan WhatsApp ke nomor mahasiswa dan wali. Masukkan kode 6 digit tersebut di bawah ini.</p>
                
                <div className="space-y-5">
                    <div>
                      <label className="text-slate-700 block mb-1.5 text-xs font-bold uppercase tracking-wider">OTP Mahasiswa</label>
                      <input 
                        type="text" 
                        maxLength={6}
                        placeholder="123456"
                        value={studentOtp}
                        onChange={e => setStudentOtp(e.target.value.replace(/\\D/g, ''))}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3.5 text-slate-900 font-black tracking-[0.5em] text-center focus:ring-2 focus:ring-emerald-500 text-xl shadow-inner transition-shadow" 
                      />
                    </div>
                    <div>
                      <label className="text-slate-700 block mb-1.5 text-xs font-bold uppercase tracking-wider">OTP Wali</label>
                      <input 
                        type="text" 
                        maxLength={6}
                        placeholder="654321"
                        value={parentOtp}
                        onChange={e => setParentOtp(e.target.value.replace(/\\D/g, ''))}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3.5 text-slate-900 font-black tracking-[0.5em] text-center focus:ring-2 focus:ring-emerald-500 text-xl shadow-inner transition-shadow" 
                      />
                    </div>
                </div>
              </div>

              <div className="mt-8">
                <button 
                  onClick={handleVerifyOtp}
                  disabled={studentOtp.length !== 6 || parentOtp.length !== 6 || isVerifyingOtp}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-4 rounded-xl transition-all shadow-lg flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isVerifyingOtp ? (
                    <>Mencocokkan Hash OTP...</>
                  ) : (
                    <><ShieldCheck className="w-5 h-5" /> Sahkan Kontrak Elektronik</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
`;

const target = "{/* CAMERA MODAL */}";
if (code.includes(target) && !code.includes("WA SIMULATOR MODAL")) {
  code = code.replace(target, waModalCode + '\n      ' + target);
  fs.writeFileSync('src/components/maba/MabaDashboard.tsx', code);
  console.log("Patched WA Modal Fix successfully");
} else {
  console.log("Could not find CAMERA MODAL or modal already exists");
}
