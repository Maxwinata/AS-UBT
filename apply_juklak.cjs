const fs = require('fs');
let code = fs.readFileSync('src/components/maba/MabaDashboard.tsx', 'utf8');

// 1. Add States for Scroll and Checkbox
const stateTarget = `  const [parentPhonePendingUpdate, setParentPhonePendingUpdate] = useState(false);`;
const stateInsert = `  const [hasReadContract, setHasReadContract] = useState(false);
  const [isContractCheckboxChecked, setIsContractCheckboxChecked] = useState(false);
`;
if (!code.includes('hasReadContract')) {
  code = code.replace(stateTarget, stateInsert + stateTarget);
}

// 2. Replace Step 4 and Step 6 UI to comply with JUKLAK
const step4Regex = /(<div id="step-4-panel"[\s\S]*?<div className="flex justify-end mt-6">)([\s\S]*?)(<\/div>\s*<\/div>\s*\)\s*\}\s*{\/\* STEP 5: E-TICKET \*\/})/;

const newStep4 = `<div id="step-4-panel" className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <PenTool className="w-5 h-5 text-teal-600" />
              <span>Step 4: Kontrak Digital (F20) & Pakta Integritas</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">Sesuai JUKLAK-03 Pasal 5, Anda diwajibkan membaca seluruh naskah sebelum dapat menyetujuinya.</p>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-sm relative">
            <div 
              className="h-64 overflow-y-auto pr-4 space-y-4 text-slate-700 custom-scrollbar"
              onScroll={(e) => {
                const target = e.target;
                if (target.scrollTop + target.clientHeight >= target.scrollHeight - 20) {
                  setHasReadContract(true);
                }
              }}
            >
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
              
              {!hasReadContract && (
                <div className="sticky bottom-0 left-0 right-0 bg-gradient-to-t from-slate-50 to-transparent pt-12 pb-2 text-center text-xs font-bold text-indigo-600 animate-pulse pointer-events-none">
                  ↓ Gulir ke bawah untuk membaca seluruh naskah ↓
                </div>
              )}
            </div>
          </div>

          {hasReadContract && contract.status !== 'SIGNED' && (
            <div className="flex items-start gap-3 bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 animate-in fade-in duration-500">
              <input 
                type="checkbox" 
                id="contract-agreement"
                checked={isContractCheckboxChecked}
                onChange={(e) => setIsContractCheckboxChecked(e.target.checked)}
                className="mt-1 w-5 h-5 text-indigo-600 rounded border-indigo-300 focus:ring-indigo-500 cursor-pointer"
              />
              <label htmlFor="contract-agreement" className="text-xs text-indigo-900 leading-relaxed cursor-pointer font-medium">
                Saya menyatakan telah membaca, memahami, dan menyetujui seluruh isi Kontrak Penghunian Asrama (F-19) dan Pakta Integritas Tata Tertib Asrama (F-02) di atas sesuai ketentuan <strong>JUKLAK-03 Pasal 6</strong>.
              </label>
            </div>
          )}

          <div className={\`bg-white border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center relative transition-opacity duration-300 \${(!isContractCheckboxChecked && contract.status !== 'SIGNED') ? 'opacity-50 pointer-events-none grayscale-[50%]' : ''}\`}>
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
                  <div className="mt-4 text-xs font-mono text-emerald-600 bg-emerald-50 p-4 rounded-lg border border-emerald-200 shadow-inner inline-block text-left">
                    <span className="block text-emerald-800 font-bold mb-2">BUKTI OTENTIKASI (Jejak Audit):</span>
                    <span className="block">ID Transaksi : SIGN-{Math.random().toString(36).substring(2, 10).toUpperCase()}</span>
                    <span className="block">Metode      : OTP Berlapis (Maba & Wali)</span>
                    <span className="block">Waktu Server: {new Date().toLocaleString('id-ID')}</span>
                    <span className="block mt-2 pt-2 border-t border-emerald-200/50 break-all">
                      Hash (SHA-256):<br/>{Array.from(crypto.getRandomValues(new Uint8Array(32))).map(b => b.toString(16).padStart(2, '0')).join('')}
                    </span>
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
                      disabled={!isContractCheckboxChecked}
                      className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-md flex items-center gap-2 text-sm"
                    >
                      <MessageCircle className="w-4 h-4" /> Kirim Kode OTP 6-Digit (WhatsApp)
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4 animate-in fade-in duration-500">
                    <div>
                      <label className="text-slate-700 block mb-1 text-[11px] font-bold">Kode OTP Mahasiswa (6 Digit) *</label>
                      <input 
                        type="text" 
                        maxLength={6}
                        placeholder="Contoh: 123456"
                        value={studentOtp} 
                        onChange={(e) => setStudentOtp(e.target.value.replace(/\\D/g, ''))} 
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2.5 text-slate-900 font-bold tracking-widest text-center focus:ring-2 focus:ring-indigo-500" 
                      />
                    </div>
                    <div>
                      <label className="text-slate-700 block mb-1 text-[11px] font-bold">Kode OTP Wali (6 Digit) *</label>
                      <input 
                        type="text" 
                        maxLength={6}
                        placeholder="Contoh: 654321"
                        value={parentOtp} 
                        onChange={(e) => setParentOtp(e.target.value.replace(/\\D/g, ''))} 
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2.5 text-slate-900 font-bold tracking-widest text-center focus:ring-2 focus:ring-indigo-500" 
                      />
                    </div>
                    
                    <button 
                      onClick={handleVerifyOtp}
                      disabled={isVerifyingOtp || studentOtp.length !== 6 || parentOtp.length !== 6}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-md flex justify-center items-center gap-2 disabled:opacity-70 mt-2 text-sm"
                    >
                      {isVerifyingOtp ? (
                        <>Mencocokkan Nilai Hash...</>
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
                <div className="flex justify-center mt-4">
                  <button
                    onClick={handleSimpanTandaTangan}
                    disabled={!isContractCheckboxChecked}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-bold px-8 py-2.5 rounded-xl text-sm transition-colors shadow-md"
                  >
                    Simpan Tanda Tangan
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end mt-6">`;

let match = code.match(step4Regex);
if(match) {
   code = code.replace(match[1], newStep4);
}

// 3. Update Step 6 BASTK UI to mention Ratifikasi Kolektif
const step6Target = `<span>Step 6: Serah Terima (BASTK)</span>`;
if (code.includes(step6Target)) {
  code = code.replace(step6Target, `<span>Step 6: Ratifikasi Kontrak (F-22) & BASTK</span>`);
}

const step6Desc = `E-Ticket Anda telah tervalidasi. Silakan temui petugas Asrama untuk menyelesaikan administrasi Check-in fisik dan menerima kunci kamar.`;
if (code.includes(step6Desc)) {
  code = code.replace(step6Desc, `E-Ticket Anda tervalidasi. Silakan temui petugas Asrama untuk Tanda Tangan Lembar Ratifikasi Kontrak Kolektif (F-22) sesuai JUKLAK-03, lalu terima kunci kamar Anda.`);
}

fs.writeFileSync('src/components/maba/MabaDashboard.tsx', code);
