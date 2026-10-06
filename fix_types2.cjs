const fs = require('fs');
let code = fs.readFileSync('src/types/asrama.ts', 'utf8');

code = code.replace(
  /isKipStudent: boolean; \/\/ Beasiswa KIP vs Non-KIP \(Single Source of Truth\)/,
  "isKipStudent: boolean; // Beasiswa KIP vs Non-KIP (Single Source of Truth)\n  kategoriMahasiswa?: 'REGULER' | 'KIP' | 'INTERNAL' | 'EXTERNAL' | 'SCHOLARSHIP';"
);

fs.writeFileSync('src/types/asrama.ts', code);
