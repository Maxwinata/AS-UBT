const fs = require('fs');
let code = fs.readFileSync('src/components/maba/MabaDashboard.tsx', 'utf8');

code = code.replace(/Calculator,\n  , AlertCircle/g, 'Calculator,\n  AlertCircle');
code = code.replace(/Calculator,\n , AlertCircle/g, 'Calculator,\n  AlertCircle');

fs.writeFileSync('src/components/maba/MabaDashboard.tsx', code);
