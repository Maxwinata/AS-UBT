const fs = require('fs');
let code = fs.readFileSync('src/components/maba/MabaDashboard.tsx', 'utf8');

// Replace any occurrence of ",, AlertCircle" or ", , AlertCircle" or ",\n , AlertCircle" etc
code = code.replace(/,(?:\s*|), AlertCircle/g, ',\n  AlertCircle');

fs.writeFileSync('src/components/maba/MabaDashboard.tsx', code);
