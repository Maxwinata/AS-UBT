const fs = require('fs');
let code = fs.readFileSync('src/components/maba/MabaDashboard.tsx', 'utf8');

code = code.replace(
  `  Calculator,
  , AlertCircle} from 'lucide-react';`,
  `  Calculator,
  AlertCircle} from 'lucide-react';`
);

fs.writeFileSync('src/components/maba/MabaDashboard.tsx', code);
