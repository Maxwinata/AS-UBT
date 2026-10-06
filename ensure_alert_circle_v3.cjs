const fs = require('fs');
let code = fs.readFileSync('src/components/maba/MabaDashboard.tsx', 'utf8');

if (!code.includes('AlertCircle')) {
  code = `import { AlertCircle } from 'lucide-react';\n` + code;
  fs.writeFileSync('src/components/maba/MabaDashboard.tsx', code);
}
