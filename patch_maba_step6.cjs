const fs = require('fs');
let code = fs.readFileSync('src/components/maba/MabaDashboard.tsx', 'utf8');

const targetStr = `          {/* PERSETUJUAN */}`;
const injectionStr = `          {/* CARD 6: METODE PERSETUJUAN */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                <span className="w-6 h-6 rounded-full bg-emerald-800 text-white flex items-center justify-center text-xs font-bold">6</span>
                <span>Metode Persetujuan Orang Tua / Wali (F-20)</span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-1">Pilih salah satu metode persetujuan sesuai JUKLAK-02 Pasal 9.</p>
            </div>
            <div className="space-y-3">
              <select
                disabled={profile.isKycApproved}
                value={profile.metodePersetujuanOrtu || ''}
                onChange={(e) => onUpdateProfile && onUpdateProfile({ ...profile, metodePersetujuanOrtu: e.target.value as any })}
                className="w-full bg-white border border-slate-300 disabled:bg-slate-100 focus:ring-1 focus:ring-emerald-500 rounded-lg px-3 py-2.5 text-slate-900 font-medium text-xs disabled:cursor-not-allowed"
              >
                <option value="">Pilih Metode Persetujuan...</option>
                <option value="TERTULIS_F20">Dokumen Fisik F-20 (Dibawa saat check-in)</option>
                <option value="ELEKTRONIK_OTP">Persetujuan Elektronik via Portal (Kode OTP ke HP Wali)</option>
                <option value="VIDEO_CALL">Verifikasi Jarak Jauh (Video Call dengan Petugas)</option>
                {profile.isKipStudent && (
                  <option value="REUSE_KIP">Penggunaan Kembali Dokumen KIP (Hanya untuk Penerima KIP-K)</option>
                )}
              </select>
            </div>
          </div>

          {/* PERSETUJUAN */}`;

if (code.includes(targetStr) && !code.includes('CARD 6: METODE PERSETUJUAN')) {
  code = code.replace(targetStr, injectionStr);
  fs.writeFileSync('src/components/maba/MabaDashboard.tsx', code);
  console.log("Patched Card 6 successfully.");
} else {
  console.error("Target string not found or already patched.");
}
