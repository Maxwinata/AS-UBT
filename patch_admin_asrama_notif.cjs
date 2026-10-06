const fs = require('fs');
let code = fs.readFileSync('src/components/admin/AdminAsrama.tsx', 'utf8');

// Add import
if (!code.includes('NotificationManager')) {
  code = code.replace(
    /import \{ ActivityLog \} from '\.\/ActivityLog';/,
    "import { ActivityLog } from './ActivityLog';\nimport { NotificationManager } from './NotificationManager';"
  );
}

// Add invoices to props
if (!code.includes('invoices?: BillingInvoice[]')) {
  code = code.replace(
    /interface AdminAsramaProps \{/,
    "interface AdminAsramaProps {\n  invoices?: BillingInvoice[];"
  );
}

if (!code.includes('invoices = []')) {
  code = code.replace(
    /export const AdminAsrama: React.FC<AdminAsramaProps> = \(\{ rooms, modificationLogs = \[\], initialTab = 'operasional'/,
    "export const AdminAsrama: React.FC<AdminAsramaProps> = ({ rooms, modificationLogs = [], invoices = [], initialTab = 'operasional'"
  );
}

// Update activeTab typing
code = code.replace(
  /<'operasional' \| 'analytics' \| 'audit_logs' \| 'activity_log' \| 'sso_migration' \| 'laravel' \| 'sql_importer' \| 'correction_requests' \| 'kyc_approval' \| 'cetak_f22'>/,
  "<'operasional' | 'analytics' | 'audit_logs' | 'activity_log' | 'notifications' | 'sso_migration' | 'laravel' | 'sql_importer' | 'correction_requests' | 'kyc_approval' | 'cetak_f22'>"
);

// Add to sidebar
if (!code.includes("id: 'notifications'")) {
  code = code.replace(
    /\{ id: 'activity_log', label: 'Activity Log', icon: <History className="w-5 h-5" \/>, description: 'Riwayat perubahan data' \},/,
    `{ id: 'activity_log', label: 'Activity Log', icon: <History className="w-5 h-5" />, description: 'Riwayat perubahan data' },
          { id: 'notifications', label: 'Notifikasi WA', icon: <BellRing className="w-5 h-5" />, description: 'Blast pengingat tagihan' },`
  );
}

// Add component render
if (!code.includes('activeTab === \'notifications\'')) {
  code = code.replace(
    /\{activeTab === 'activity_log' && \(/,
    `{activeTab === 'notifications' && (
        <NotificationManager invoices={invoices} />
      )}

      {activeTab === 'activity_log' && (`
  );
}

fs.writeFileSync('src/components/admin/AdminAsrama.tsx', code);
