const fs = require('fs');
let code = fs.readFileSync('src/components/maba/MabaDashboard.tsx', 'utf8');

if (!code.includes('AlertCircle')) {
  code = code.replace(
    /import {([^}]*)} from 'lucide-react';/,
    (match, p1) => `import {${p1}, AlertCircle} from 'lucide-react';`
  );
  fs.writeFileSync('src/components/maba/MabaDashboard.tsx', code);
}
