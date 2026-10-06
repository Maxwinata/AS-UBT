const fs = require('fs');
let code = fs.readFileSync('src/types/asrama.ts', 'utf8');

code = code.replace(
  /target: 'REGULER' \| 'KIP' \| 'ALL';/g,
  "target: 'REGULER' | 'KIP' | 'INTERNAL' | 'EXTERNAL' | 'SCHOLARSHIP' | 'ALL';"
);

// Add studentCategory to MabaProfile
code = code.replace(
  /isKipStudent\?: boolean;/,
  "isKipStudent?: boolean;\n  kategoriMahasiswa?: 'REGULER' | 'KIP' | 'INTERNAL' | 'EXTERNAL' | 'SCHOLARSHIP';"
);

fs.writeFileSync('src/types/asrama.ts', code);
