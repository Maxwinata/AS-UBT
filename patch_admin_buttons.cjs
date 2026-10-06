const fs = require('fs');
let code = fs.readFileSync('src/components/admin/AdminAsrama.tsx', 'utf8');

const buttonsToAdd = `
          <button
            type="button"
            onClick={() => setActiveTab('TARIFFS' as any)}
            className={\`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 \${
              activeTab === ('TARIFFS' as any)
                ? 'bg-white text-indigo-950 shadow-md font-extrabold'
                : 'bg-indigo-950/60 text-indigo-200 hover:bg-indigo-900 hover:text-white border border-indigo-700'
            }\`}
          >
            <Calculator className="w-4 h-4 text-indigo-600" />
            <span>Master Tarif & Cicilan</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('notifications')}
            className={\`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 \${
              activeTab === 'notifications'
                ? 'bg-white text-indigo-950 shadow-md font-extrabold'
                : 'bg-indigo-950/60 text-indigo-200 hover:bg-indigo-900 hover:text-white border border-indigo-700'
            }\`}
          >
            <BellRing className="w-4 h-4 text-indigo-600" />
            <span>Notifikasi WA</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('activity_log')}
            className={\`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 \${
              activeTab === 'activity_log'
                ? 'bg-white text-indigo-950 shadow-md font-extrabold'
                : 'bg-indigo-950/60 text-indigo-200 hover:bg-indigo-900 hover:text-white border border-indigo-700'
            }\`}
          >
            <History className="w-4 h-4 text-indigo-600" />
            <span>Activity Log</span>
          </button>
`;

if (!code.includes('<span>Master Tarif & Cicilan</span>')) {
  code = code.replace(
    /(<button[^>]*onClick=\{\(\) => setActiveTab\('laravel'\)\}[^>]*>)/,
    buttonsToAdd + "\n          $1"
  );
  fs.writeFileSync('src/components/admin/AdminAsrama.tsx', code);
}
