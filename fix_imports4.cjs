const fs = require('fs');

let adminCode = fs.readFileSync('src/components/admin/AdminAsrama.tsx', 'utf8');
adminCode = adminCode.replace(
  /import \{ RoomPlot, CheckoutInspection, TariffItem, PaymentScheme, ModificationLog \} from '\.\.\/\.\.\/types\/asrama';/,
  "import { RoomPlot, CheckoutInspection, TariffItem, PaymentScheme, ModificationLog, BillingInvoice } from '../../types/asrama';"
);
fs.writeFileSync('src/components/admin/AdminAsrama.tsx', adminCode);
