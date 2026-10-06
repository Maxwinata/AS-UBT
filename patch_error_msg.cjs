const fs = require('fs');
let code = fs.readFileSync('src/components/maba/MabaDashboard.tsx', 'utf8');

code = code.replace(
  /toast\.error\(`Foto ditolak: \$\{errorMsg\}`/,
  `toast.error(errorMsg.includes('ditolak') ? errorMsg : \`Foto ditolak: \${errorMsg}\``
);

fs.writeFileSync('src/components/maba/MabaDashboard.tsx', code);
