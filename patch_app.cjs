const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

if (!code.includes('modificationLogs')) {
  // Add modificationLogs state
  code = code.replace(
    /const \[ssoNoticeBanner, setSsoNoticeBanner\] = useState<string \| null>\(null\);/,
    `const [ssoNoticeBanner, setSsoNoticeBanner] = useState<string | null>(null);
  const [modificationLogs, setModificationLogs] = useState<ModificationLog[]>([
    {
      id: 'L1',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      actor: 'Admin',
      action: 'Tarif "Sewa Asrama Internal" diubah nominalnya menjadi Rp 300.000',
      changedFields: [{ field: 'amount', oldValue: '250000', newValue: '300000' }]
    },
    {
      id: 'L2',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      actor: 'System',
      action: 'Auto-plot Mahasiswa PMB2026-08942 ke Kamar 3A',
    }
  ]);`
  );

  // Update AdminAsrama props
  code = code.replace(
    /<AdminAsrama rooms=\{rooms\} initialTab="operasional" tariffs=\{tariffs\} setTariffs=\{setTariffs\} paymentSchemes=\{paymentSchemes\} setPaymentSchemes=\{setPaymentSchemes\} \/>/g,
    `<AdminAsrama rooms={rooms} modificationLogs={modificationLogs} initialTab="operasional" tariffs={tariffs} setTariffs={setTariffs} paymentSchemes={paymentSchemes} setPaymentSchemes={setPaymentSchemes} />`
  );
  
  code = code.replace(
    /<AdminAsrama rooms=\{rooms\} initialTab="laravel" tariffs=\{tariffs\} setTariffs=\{setTariffs\} paymentSchemes=\{paymentSchemes\} setPaymentSchemes=\{setPaymentSchemes\} \/>/g,
    `<AdminAsrama rooms={rooms} modificationLogs={modificationLogs} initialTab="laravel" tariffs={tariffs} setTariffs={setTariffs} paymentSchemes={paymentSchemes} setPaymentSchemes={setPaymentSchemes} />`
  );

  code = code.replace(
    /<AdminAsrama rooms=\{rooms\} initialTab="sql_importer" \/>/g,
    `<AdminAsrama rooms={rooms} modificationLogs={modificationLogs} initialTab="sql_importer" />`
  );
}

fs.writeFileSync('src/App.tsx', code);
