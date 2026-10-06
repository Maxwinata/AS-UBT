const fs = require('fs');

let code = fs.readFileSync('src/components/maba/MabaDashboard.tsx', 'utf8');

const oldContract1 = `<h4 className="font-bold text-center text-slate-900">PERJANJIAN SEWA KAMAR & PAKTA INTEGRITAS TATA TERTIB ASRAMA</h4>
              <p>Pada hari ini, disepakati perjanjian sewa kamar antara UPT Asrama Universitas Borneo Tarakan (selanjutnya disebut "Pihak Pertama") dan:</p>`;

const newContract1 = `<h4 className="font-bold text-center text-slate-900">F-19 KONTRAK PENGHUNIAN ASRAMA & F-02 PAKTA INTEGRITAS TATA TERTIB</h4>
              <p>Sesuai dengan standardisasi digitalisasi JUKLAK-02 dan JUKLAK-03. Pada hari ini, disepakati Kontrak Penghunian Asrama (F-19) antara UPT Asrama UBT (selanjutnya disebut "Pihak Pertama") dan:</p>`;

const oldContract2 = `<h4 className="font-bold text-center text-slate-900">PERJANJIAN SEWA MENYEWA KAMAR ASRAMA UBT</h4>
              <p>Pada hari ini, disepakati perjanjian sewa kamar antara UPT Asrama Universitas Borneo Tarakan (selanjutnya disebut "Pihak Pertama") dan:</p>`;

const newContract2 = `<h4 className="font-bold text-center text-slate-900">F-19 KONTRAK PENGHUNIAN ASRAMA & F-02 PAKTA INTEGRITAS</h4>
              <p>Sesuai dengan standardisasi digitalisasi JUKLAK-02 dan JUKLAK-03. Pada hari ini, disepakati Kontrak Penghunian Asrama (F-19) antara UPT Asrama UBT (selanjutnya disebut "Pihak Pertama") dan:</p>`;


code = code.replace(oldContract1, newContract1);
code = code.replace(oldContract2, newContract2);

fs.writeFileSync('src/components/maba/MabaDashboard.tsx', code);
console.log("Patched contract texts");

// Fix AdminAsrama tab removal
let codeAdmin = fs.readFileSync('src/components/admin/AdminAsrama.tsx', 'utf8');
const adminTabTarget = `<button
            type="button"
            onClick={() => setActiveTab('TARIFFS' as any)}
            className={\`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 \${
              activeTab === ('TARIFFS' as any)
                ? 'bg-white text-indigo-950 shadow-md font-extrabold'
                : 'bg-indigo-950/60 text-indigo-200 hover:bg-indigo-900 hover:text-white border border-indigo-700'
            }\`}
          >
            <Calculator className="w-4 h-4 text-indigo-600" />
            <span>Master Tarif & Cicilan</span>
          </button>`;

if (codeAdmin.includes(adminTabTarget)) {
   codeAdmin = codeAdmin.replace(adminTabTarget, '');
   fs.writeFileSync('src/components/admin/AdminAsrama.tsx', codeAdmin);
   console.log("Removed Tariff Tab");
} else {
   console.log("Tariff tab not found");
}

