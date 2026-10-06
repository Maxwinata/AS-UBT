const fs = require('fs');

// 1. MabaDashboard.tsx
let codeMaba = fs.readFileSync('src/components/maba/MabaDashboard.tsx', 'utf8');
const oldTitleMaba = `PORTAL MAHASISWA BARU (MABA)`;
const newTitleMaba = `PORTAL REGISTRASI ASRAMA UBT`;
if (codeMaba.includes(oldTitleMaba)) {
  codeMaba = codeMaba.replace(oldTitleMaba, newTitleMaba);
  fs.writeFileSync('src/components/maba/MabaDashboard.tsx', codeMaba);
  console.log("Patched MabaDashboard.tsx title");
}

// 2. LoginDualTab.tsx
let codeLogin = fs.readFileSync('src/components/auth/LoginDualTab.tsx', 'utf8');
const oldTitleLogin = `PORTAL MAHASISWA`;
const newTitleLogin = `PORTAL PENDAFTARAN ASRAMA`;
if (codeLogin.includes(oldTitleLogin)) {
  codeLogin = codeLogin.replace(oldTitleLogin, newTitleLogin);
  fs.writeFileSync('src/components/auth/LoginDualTab.tsx', codeLogin);
  console.log("Patched LoginDualTab.tsx title");
}

// 3. Header.tsx
let codeHeader = fs.readFileSync('src/components/Header.tsx', 'utf8');
if (codeHeader.includes(`PORTAL MAHASISWA ASRAMA UBT`)) {
  codeHeader = codeHeader.replace(`PORTAL MAHASISWA ASRAMA UBT`, `PORTAL ASRAMA UBT (PENDAFTARAN & OPERASIONAL)`);
  fs.writeFileSync('src/components/Header.tsx', codeHeader);
  console.log("Patched Header.tsx title 1");
}
if (codeHeader.includes(`Portal Mahasiswa`)) {
  codeHeader = codeHeader.replace(`Portal Mahasiswa`, `Portal Residen`);
  fs.writeFileSync('src/components/Header.tsx', codeHeader);
  console.log("Patched Header.tsx title 2");
}

