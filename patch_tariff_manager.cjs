const fs = require('fs');
let code = fs.readFileSync('src/components/admin/TariffManager.tsx', 'utf8');

// Replace select options for target
code = code.replace(
  /<option value="KIP">KIP-Kuliah<\/option>/g,
  `<option value="KIP">KIP-Kuliah</option>
                <option value="INTERNAL">Internal</option>
                <option value="EXTERNAL">External</option>
                <option value="SCHOLARSHIP">Beasiswa (Scholarship)</option>`
);

// Update groupTargets
code = code.replace(
  /const groupTargets = \['REGULER', 'KIP', 'ALL'\];/,
  "const groupTargets = ['REGULER', 'KIP', 'INTERNAL', 'EXTERNAL', 'SCHOLARSHIP', 'ALL'];"
);

// Update groupLabels
code = code.replace(
  /'ALL': 'Berlaku Umum \(Semua Jalur\)'/,
  `'ALL': 'Berlaku Umum (Semua Jalur)',
    'INTERNAL': 'Jalur Internal',
    'EXTERNAL': 'Jalur External',
    'SCHOLARSHIP': 'Jalur Beasiswa Lainnya (Scholarship)'`
);

// Update color logic
code = code.replace(
  /\(target === 'KIP' \? 'bg-emerald-500' : target === 'REGULER' \? 'bg-blue-500' : 'bg-slate-800'\)/g,
  "(target === 'KIP' || target === 'SCHOLARSHIP' ? 'bg-emerald-500' : target === 'REGULER' || target === 'EXTERNAL' ? 'bg-blue-500' : target === 'INTERNAL' ? 'bg-purple-500' : 'bg-slate-800')"
);

fs.writeFileSync('src/components/admin/TariffManager.tsx', code);
