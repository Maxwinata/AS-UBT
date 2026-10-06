const fs = require('fs');
let code = fs.readFileSync('src/components/maba/MabaDashboard.tsx', 'utf8');

code = code.replace(
`  Ticket,
  Calculator,
  , AlertCircle} from 'lucide-react';`,
`  Ticket,
  Calculator,
  AlertCircle} from 'lucide-react';`
);

fs.writeFileSync('src/components/maba/MabaDashboard.tsx', code);
