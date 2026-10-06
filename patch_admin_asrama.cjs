const fs = require('fs');
let code = fs.readFileSync('src/components/admin/AdminAsrama.tsx', 'utf8');

// Add import for ActivityLog
if (!code.includes('ActivityLog')) {
  code = code.replace(
    /import \{ TariffManager \} from '.\/TariffManager';/,
    "import { TariffManager } from './TariffManager';\nimport { ActivityLog } from './ActivityLog';"
  );
}

// Add modificationLogs to AdminAsramaProps
if (!code.includes('modificationLogs?: ModificationLog[]')) {
  code = code.replace(
    /interface AdminAsramaProps \{/,
    "interface AdminAsramaProps {\n  modificationLogs?: ModificationLog[];"
  );
}

// Add it to destructured props
code = code.replace(
  /export const AdminAsrama: React.FC<AdminAsramaProps> = \(\{ rooms, initialTab = 'operasional', tariffs = \[\], setTariffs = \(\) => \{\}, paymentSchemes = \[\], setPaymentSchemes = \(\) => \{\} \}\) => \{/,
  "export const AdminAsrama: React.FC<AdminAsramaProps> = ({ rooms, modificationLogs = [], initialTab = 'operasional', tariffs = [], setTariffs = () => {}, paymentSchemes = [], setPaymentSchemes = () => {} }) => {"
);

// Update activeTab typing
code = code.replace(
  /<'operasional' \| 'analytics' \| 'audit_logs' \| 'sso_migration' \| 'laravel' \| 'sql_importer' \| 'correction_requests' \| 'kyc_approval' \| 'cetak_f22'>/,
  "<'operasional' | 'analytics' | 'audit_logs' | 'activity_log' | 'sso_migration' | 'laravel' | 'sql_importer' | 'correction_requests' | 'kyc_approval' | 'cetak_f22'>"
);

// Add ActivityLog to sidebar
code = code.replace(
  /\{ id: 'audit_logs', label: 'Audit Trail & Keamanan', icon: <ShieldAlert className="w-5 h-5" \/>, description: 'Log keamanan' \},/,
  `{ id: 'audit_logs', label: 'Audit Trail & Keamanan', icon: <ShieldAlert className="w-5 h-5" />, description: 'Log keamanan' },
          { id: 'activity_log', label: 'Activity Log', icon: <History className="w-5 h-5" />, description: 'Riwayat perubahan data' },`
);

// Make sure History is imported
if (!code.includes('History')) {
  code = code.replace(
    /import \{ Activity, PieChart \} from 'lucide-react';/,
    "import { Activity, PieChart, History } from 'lucide-react';"
  );
}

// Render the component
code = code.replace(
  /\{activeTab === \('TARIFFS' as any\) && \(/,
  `{activeTab === 'activity_log' && (
        <ActivityLog logs={modificationLogs} />
      )}

      {activeTab === ('TARIFFS' as any) && (`
);

fs.writeFileSync('src/components/admin/AdminAsrama.tsx', code);
