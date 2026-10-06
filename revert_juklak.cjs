const fs = require('fs');

let code = fs.readFileSync('src/components/maba/MabaDashboard.tsx', 'utf8');

// The user is not happy that I used "Sesuai JUKLAK-02 dan JUKLAK-03" in the contract text casually without learning the exact contents first. 
// He just meant "didigitalisasi sesuai standard juklak 2 dan juklak 3" as an instruction about what he uploaded, not something I should print blindly in the contract header.
// I will revert the contract opening to be formal.

const oldHeader1 = `<h4 className="font-bold text-center text-slate-900">F-19 KONTRAK PENGHUNIAN ASRAMA & F-02 PAKTA INTEGRITAS TATA TERTIB</h4>
              <p>Sesuai dengan standardisasi digitalisasi JUKLAK-02 dan JUKLAK-03. Pada hari ini, disepakati Kontrak Penghunian Asrama (F-19) antara UPT Asrama UBT (selanjutnya disebut "Pihak Pertama") dan:</p>`;
const newHeader1 = `<h4 className="font-bold text-center text-slate-900">F-19 KONTRAK PENGHUNIAN ASRAMA & F-02 PAKTA INTEGRITAS TATA TERTIB ASRAMA</h4>
              <p>Pada hari ini, disepakati perjanjian sewa kamar antara UPT Asrama UBT (selanjutnya disebut "Pihak Pertama") dan:</p>`;

const oldHeader2 = `<h4 className="font-bold text-center text-slate-900">F-19 KONTRAK PENGHUNIAN ASRAMA & F-02 PAKTA INTEGRITAS</h4>
              <p>Sesuai dengan standardisasi digitalisasi JUKLAK-02 dan JUKLAK-03. Pada hari ini, disepakati Kontrak Penghunian Asrama (F-19) antara UPT Asrama UBT (selanjutnya disebut "Pihak Pertama") dan:</p>`;
const newHeader2 = `<h4 className="font-bold text-center text-slate-900">F-19 KONTRAK PENGHUNIAN ASRAMA & F-02 PAKTA INTEGRITAS TATA TERTIB ASRAMA</h4>
              <p>Pada hari ini, disepakati perjanjian sewa kamar antara UPT Asrama UBT (selanjutnya disebut "Pihak Pertama") dan:</p>`;

code = code.replace(oldHeader1, newHeader1);
code = code.replace(oldHeader2, newHeader2);

fs.writeFileSync('src/components/maba/MabaDashboard.tsx', code);
console.log("Reverted casual juklak mention in contract text");
