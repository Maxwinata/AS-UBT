const fs = require('fs');
let code = fs.readFileSync('src/components/maba/MabaDashboard.tsx', 'utf8');

const regex = /({\/\* STEP 4: KONTRAK \*\/\s*\{currentStep === 4 && \(\s*<div id="step-4-panel"[\s\S]*?<div className="flex justify-end mt-6">)([\s\S]*?)(<\/div>\s*<\/div>\s*\)\s*\}\s*{\/\* STEP 5: E-TICKET \*\/})/;

const newStep4 = `      {/* STEP 4: KONTRAK DIGITAL & PAKTA INTEGRITAS */}
      {currentStep === 4 && (
        <div id="step-4-panel" className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <PenTool className="w-5 h-5 text-teal-600" />
              <span>Step 4: Kontrak Digital (F20) & Pakta Integritas</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">Pengesahan dokumen kesepakatan sewa asrama dan kepatuhan tata tertib.</p>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-sm">
            <div className="h-64 overflow-y-auto pr-4 space-y-4 text-slate-700 custom-scrollbar">
              <h4 className="font-bold text-center text-slate-900">PERJANJIAN SEWA KAMAR & PAKTA INTEGRITAS TATA TERTIB ASRAMA</h4>
              <p>Pada hari ini, disepakati perjanjian sewa kamar antara UPT Asrama Universitas Borneo Tarakan (selanjutnya disebut "Pihak Pertama") dan:</p>
              
              <table className="w-full text-xs">
                <tbody>
                  <tr><td className="w-32 py-1 font-bold">Nama</td><td>: {profile.nama}</td></tr>
                  <tr><td className="py-1 font-bold">NIM</td><td>: {profile.nim}</td></tr>
                  <tr><td className="py-1 font-bold">Kamar</td><td>: {room?.gedung} - Kamar {room?.nomorKamar}</td></tr>
                  <tr><td className="py-1 font-bold">Durasi</td><td>: {invoice.durasiBulan || 6} Bulan</td></tr>
                </tbody>
              </table>
              <p>(Selanjutnya disebut "Pihak Kedua")</p>
              
              <h5 className="font-bold mt-4">Pasal 1: Ketentuan Pembayaran</h5>
              <p>Pihak Kedua telah membayar biaya sewa dan deposit sesuai konfigurasi tagihan. Deposit {invoice.isCicilanDeposit ? \`dicicil \${invoice.opsiCicilan} kali\` : 'dilunasi di awal'} dan akan dikembalikan pada akhir masa sewa dengan syarat tidak ada kerusakan fasilitas dan tunggakan.</p>
              
              <h5 className="font-bold mt-4">Pasal 2: Hak dan Kewajiban</h5>
              <p>1. Pihak Kedua berhak menempati kamar yang telah ditentukan.</p>
              <p>2. Pihak Kedua wajib menjaga kebersihan dan fasilitas kamar.</p>
              
              <h5 className="font-bold mt-4">Pasal 3: Pakta Integritas Tata Tertib Asrama (F-02)</h5>
              <p>Pihak Kedua WAJIB mematuhi seluruh peraturan tata tertib Asrama UBT. Segala bentuk pelanggaran akan dikenakan poin sanksi. Pelanggaran berat (seperti narkoba, asusila, pencurian) akan mengakibatkan pengusiran sepihak tanpa pengembalian uang sewa serta hangusnya uang deposit.</p>
              
              <p className="mt-6 italic text-xs">Dengan menandatangani/memverifikasi dokumen ini secara elektronik, Pihak Kedua dan Wali menyatakan setuju dan tunduk pada seluruh ketentuan yang berlaku.</p>
            </div>
          </div>

          <div className="bg-white border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center relative">
            {contract.status === 'SIGNED' ? (
              <div className="text-center space-y-4 w-full">
                <div className="bg-emerald-50 text-emerald-700 py-3 px-6 rounded-lg text-sm font-bold border border-emerald-200 inline-flex items-center">
                  <CheckCircle2 className="w-5 h-5 mr-2" /> Kontrak & Pakta Integritas Telah Disahkan
                </div>
                {contract.signatureData && (
                  <div className="bg-white border border-slate-200 rounded-lg p-4 inline-block shadow-sm mt-4">
                    <img src={contract.signatureData} alt="Tanda Tangan Digital" className="h-32 mx-auto" />
                  </div>
                )}
                {profile.metodePersetujuanOrtu === 'ELEKTRONIK_OTP' && !contract.signatureData && (
                  <div className="mt-4 text-xs font-mono text-emerald-600 bg-emerald-50 p-2 rounded border border-emerald-100">
                    ID Transaksi Digital: SIGN-{Math.random().toString(36).substring(2, 10).toUpperCase()}
                  </div>
                )}
              </div>
            ) : profile.metodePersetujuanOrtu === 'ELEKTRONIK_OTP' ? (
              <div className="w-full max-w-lg mx-auto">
                <h4 className="font-bold text-slate-800 mb-4 text-center">Verifikasi OTP Kontrak Elektronik</h4>
                <p className="text-xs text-slate-500 mb-6 text-center">Metode persetujuan wali Anda adalah Elektronik (OTP). Silakan kirim kode ke nomor Mahasiswa dan Wali yang terdaftar.</p>
                
                {!otpSentMessage ? (
                  <div className="flex justify-center">
                    <button 
                      onClick={handleSendOtp}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-md flex items-center gap-2 text-sm"
                    >
                      <MessageCircle className="w-4 h-4" /> Kirim Kode OTP (WhatsApp)
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4 animate-in fade-in duration-500">
                    <div>
                      <label className="text-slate-700 block mb-1 text-[11px] font-bold">Kode OTP Mahasiswa *</label>
                      <input 
                        type="text" 
                        maxLength={6}
                        placeholder="Contoh: 123456"
                        value={studentOtp} 
                        onChange={(e) => setStudentOtp(e.target.value)} 
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2.5 text-slate-900 font-bold tracking-widest text-center focus:ring-2 focus:ring-indigo-500" 
                      />
                    </div>
                    <div>
                      <label className="text-slate-700 block mb-1 text-[11px] font-bold">Kode OTP Wali * (Dikirim ke: {profile.kontakDaruratNoHp || 'Nomor Wali'})</label>
                      <input 
                        type="text" 
                        maxLength={6}
                        placeholder="Contoh: 654321"
                        value={parentOtp} 
                        onChange={(e) => setParentOtp(e.target.value)} 
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2.5 text-slate-900 font-bold tracking-widest text-center focus:ring-2 focus:ring-indigo-500" 
                      />
                    </div>
                    
                    <button 
                      onClick={handleVerifyOtp}
                      disabled={isVerifyingOtp}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-md flex justify-center items-center gap-2 disabled:opacity-70 mt-2 text-sm"
                    >
                      {isVerifyingOtp ? (
                        <>Memverifikasi...</>
                      ) : (
                        <><ShieldCheck className="w-5 h-5" /> Verifikasi Tanda Tangan Elektronik</>
                      )}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full max-w-xl mx-auto">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-bold text-slate-700">Tanda Tangan di Bawah Ini:</span>
                  <button onClick={handleClearTandaTangan} className="text-xs text-red-600 font-bold hover:bg-red-50 px-2 py-1 rounded">
                    Hapus Ulang (Clear)
                  </button>
                </div>
                <div className="border border-slate-300 rounded-lg bg-slate-50 cursor-crosshair touch-none">
                  <SignaturePad
                    ref={signaturePadRef}
                    canvasProps={{
                      className: 'w-full h-48 rounded-lg',
                    }}
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-2 italic text-center">
                  *Dengan Tanda Tangan ini, saya menyetujui seluruh isi Perjanjian Sewa dan Pakta Integritas.
                </p>
                <div className="flex justify-center mt-4">
                  <button
                    onClick={handleSimpanTandaTangan}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-2.5 rounded-xl text-sm transition-colors shadow-md"
                  >
                    Simpan Tanda Tangan
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end mt-6">
             <button
              onClick={() => handleStepNavigation(5)}
              disabled={contract.status !== 'SIGNED'}
              className={\`font-bold px-6 py-2.5 rounded-xl text-sm transition-all shadow-md flex items-center space-x-2 \${
                contract.status === 'SIGNED'
                  ? 'bg-teal-700 hover:bg-teal-800 text-white' 
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }\`}
            >
              <span>Lanjut Penerbitan e-Ticket (Step 5)</span>
              <Ticket className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: E-TICKET */}`;

let match = code.match(regex);
if (match) {
  // It's a tricky regex replacement, let's just replace the whole file content around it to be safe, or just use indexOf.
  let startIdx = code.indexOf("{/* STEP 4:");
  let endIdx = code.indexOf("{/* STEP 5: E-TICKET */}");
  
  if(startIdx !== -1 && endIdx !== -1 && startIdx < endIdx) {
    code = code.substring(0, startIdx) + newStep4 + code.substring(endIdx + 24);
    fs.writeFileSync('src/components/maba/MabaDashboard.tsx', code);
    console.log("Patched Step 4 UI successfully");
  } else {
    console.log("Indices not found correctly.");
  }
} else {
  // Fallback to indexOf replacement
  let startIdx = code.indexOf("{/* STEP 4: KONTRAK */}");
  if(startIdx === -1) {
    startIdx = code.indexOf("{/* STEP 4: DIGITAL SIGNATURE");
  }
  let endIdx = code.indexOf("{/* STEP 5: E-TICKET */}");
  
  if(startIdx !== -1 && endIdx !== -1 && startIdx < endIdx) {
    code = code.substring(0, startIdx) + newStep4 + code.substring(endIdx + 24);
    fs.writeFileSync('src/components/maba/MabaDashboard.tsx', code);
    console.log("Patched Step 4 UI successfully via fallback");
  } else {
    console.log("Indices not found correctly in fallback.");
  }
}
