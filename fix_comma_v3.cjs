const fs = require('fs');
let code = fs.readFileSync('src/components/maba/MabaDashboard.tsx', 'utf8');

code = code.replace(/,, AlertCircle} from 'lucide-react';/g, ', AlertCircle} from \'lucide-react\';');

fs.writeFileSync('src/components/maba/MabaDashboard.tsx', code);
