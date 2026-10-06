const fs = require('fs');
let code = fs.readFileSync('src/data/initialData.ts', 'utf8');

// Add new schemes
code = code.replace(
  /\{ id: 'ps2', target: 'REGULER', maxInstallments: 1, installmentMultiplier: 1\.0 \},/g,
  `{ id: 'ps2', target: 'REGULER', maxInstallments: 1, installmentMultiplier: 1.0 },
  { id: 'ps3', target: 'INTERNAL', maxInstallments: 6, installmentMultiplier: 1.2 },
  { id: 'ps4', target: 'EXTERNAL', maxInstallments: 1, installmentMultiplier: 1.0 },
  { id: 'ps5', target: 'SCHOLARSHIP', maxInstallments: 3, installmentMultiplier: 1.5 },`
);

// Add some sample tariffs for the new groups
code = code.replace(
  /\{ id: 't4', name: 'Biaya Perlengkapan Asrama', amount: 350000, category: 'PERLENGKAPAN', target: 'REGULER' \},/g,
  `{ id: 't4', name: 'Biaya Perlengkapan Asrama', amount: 350000, category: 'PERLENGKAPAN', target: 'REGULER' },
  { id: 't_int1', name: 'Sewa Asrama Internal', amount: 300000, category: 'SEWA', target: 'INTERNAL' },
  { id: 't_int2', name: 'Deposit Asrama Internal', amount: 500000, category: 'DEPOSIT', target: 'INTERNAL' },
  { id: 't_ext1', name: 'Sewa Asrama External', amount: 750000, category: 'SEWA', target: 'EXTERNAL' },
  { id: 't_ext2', name: 'Deposit Asrama External', amount: 1500000, category: 'DEPOSIT', target: 'EXTERNAL' },
  { id: 't_sch1', name: 'Sewa Asrama Scholarship', amount: 250000, category: 'SEWA', target: 'SCHOLARSHIP' },
  { id: 't_sch2', name: 'Deposit Asrama Scholarship', amount: 500000, category: 'DEPOSIT', target: 'SCHOLARSHIP' },`
);

fs.writeFileSync('src/data/initialData.ts', code);
