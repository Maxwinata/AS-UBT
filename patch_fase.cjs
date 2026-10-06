const fs = require('fs');
let code = fs.readFileSync('src/components/maba/MabaDashboard.tsx', 'utf8');

code = code.replace(/Fase A \(Penerimaan & Orientasi\)/g, 'Tahap 1 (Penerimaan & Orientasi)');
code = code.replace(/Fase A: Registrasi/g, 'Tahap 1: Registrasi');
code = code.replace(/Fase B: Tagihan/g, 'Tahap 2: Tagihan');
code = code.replace(/Fase C: Kontrak/g, 'Tahap 3: Kontrak');
code = code.replace(/Fase D: e-Ticket/g, 'Tahap 4: e-Ticket');
code = code.replace(/Panduan Fase \{\['A', 'B', 'C', 'D'\]/g, "Panduan Tahap {[1, 2, 3, 4]");
code = code.replace(/Aturan Pengikatan Deposit \(Fase A & Fase C\):/g, 'Aturan Pengikatan Deposit (Tahap Pendaftaran & Fase Check-out):');
code = code.replace(/Check-out \(Fase C\)/g, 'Check-out (Fase C)'); // Keep this as Fase C
code = code.replace(/Fase A: Registrasi & e-KYC/g, 'Tahap 1: Registrasi & e-KYC');
code = code.replace(/Fase B: Konfigurasi Tagihan/g, 'Tahap 2: Konfigurasi Tagihan');

fs.writeFileSync('src/components/maba/MabaDashboard.tsx', code);
console.log("Patched Fase -> Tahap in MabaDashboard");
