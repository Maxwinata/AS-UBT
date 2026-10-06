const fs = require('fs');
let code = fs.readFileSync('src/components/maba/MabaDashboard.tsx', 'utf8');

if (!code.includes('Settings2')) {
  code = code.replace(/AlertCircle\}/, 'AlertCircle, Settings2}');
  fs.writeFileSync('src/components/maba/MabaDashboard.tsx', code);
  console.log("Patched imports");
}
