const fs = require('fs');

// Fix App.tsx
let appCode = fs.readFileSync('src/App.tsx', 'utf8');
appCode = appCode.replace(
  /import \{ UserRole, MabaProfile, BillingInvoice, RoomPlot, DigitalContract, ETicket \} from '\.\/types\/asrama';/,
  "import { UserRole, MabaProfile, BillingInvoice, RoomPlot, DigitalContract, ETicket, ModificationLog, TariffItem, PaymentScheme } from './types/asrama';"
);
fs.writeFileSync('src/App.tsx', appCode);

// Fix AdminAsrama.tsx
let adminCode = fs.readFileSync('src/components/admin/AdminAsrama.tsx', 'utf8');
adminCode = adminCode.replace(
  /import \{ RoomPlot, TariffItem, PaymentScheme \} from '\.\.\/\.\.\/types\/asrama';/,
  "import { RoomPlot, TariffItem, PaymentScheme, ModificationLog } from '../../types/asrama';"
);
if (!adminCode.includes('ModificationLog')) {
  adminCode = adminCode.replace(
    /import \{ RoomPlot \} from '\.\.\/\.\.\/types\/asrama';/,
    "import { RoomPlot, TariffItem, PaymentScheme, ModificationLog } from '../../types/asrama';"
  );
}
fs.writeFileSync('src/components/admin/AdminAsrama.tsx', adminCode);
