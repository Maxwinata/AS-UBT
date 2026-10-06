const fs = require('fs');
let code = fs.readFileSync('src/components/maba/MabaDashboard.tsx', 'utf8');

if (!code.includes('AlertCircle')) {
  code = code.replace(
    `import { CheckCircle2, ChevronRight,`,
    `import { CheckCircle2, ChevronRight, AlertCircle,`
  );
  fs.writeFileSync('src/components/maba/MabaDashboard.tsx', code);
}
