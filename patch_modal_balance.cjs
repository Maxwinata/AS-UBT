const fs = require('fs');
let code = fs.readFileSync('src/components/admin/CorrectionRequestsAdmin.tsx', 'utf8');

// Update Grid Parent
code = code.replace(
  '<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4 max-h-[60vh] overflow-y-auto pr-2">',
  '<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 items-start mt-4 max-h-[60vh] overflow-y-auto pr-2 pb-4">'
);

// Update Group 1
code = code.replace(
  '{/* GROUP 1: DATA AKADEMIK */}\n                <div>',
  '{/* GROUP 1: DATA AKADEMIK */}\n                <div className="md:col-span-1 lg:col-span-4">'
);

// Update Group 2
code = code.replace(
  '{/* GROUP 2: KONTAK PRIBADI */}\n                <div>',
  '{/* GROUP 2: KONTAK PRIBADI */}\n                <div className="md:col-span-1 lg:col-span-4">'
);

// Update Group 3
code = code.replace(
  '{/* GROUP 3: KONTAK DARURAT */}\n                <div>',
  '{/* GROUP 3: KONTAK DARURAT */}\n                <div className="md:col-span-1 lg:col-span-4">'
);

// Update Group 4
code = code.replace(
  '{/* GROUP 4: PREFERENSI HUNIAN */}\n                <div>',
  '{/* GROUP 4: PREFERENSI HUNIAN */}\n                <div className="md:col-span-1 lg:col-span-6">'
);

// Update Group 5
code = code.replace(
  '{/* GROUP 5: UPLOAD DOKUMEN & E-KYC */}\n                <div>',
  '{/* GROUP 5: UPLOAD DOKUMEN & e-KYC */}\n                <div className="md:col-span-2 lg:col-span-6">'
);

fs.writeFileSync('src/components/admin/CorrectionRequestsAdmin.tsx', code);
console.log("Patched modal classes for precise balancing.");
