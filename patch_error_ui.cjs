const fs = require('fs');
let code = fs.readFileSync('src/components/maba/MabaDashboard.tsx', 'utf8');

code = code.replace(
  `// Don't throw so it doesn't break React flow`,
  `// Don't throw so it doesn't break React flow
       setIsScannerOpen(true); // Auto-open trail so user sees why it failed`
);

code = code.replace(
  `onClick={() => setIsScannerOpen(true)}`,
  `onClick={() => setIsScannerOpen(!isScannerOpen)}`
);

code = code.replace(
  `Lihat Riwayat Audit (Trail)`,
  `{isScannerOpen ? 'Sembunyikan Riwayat' : 'Lihat Riwayat Audit (Trail)'}`
);

fs.writeFileSync('src/components/maba/MabaDashboard.tsx', code);
