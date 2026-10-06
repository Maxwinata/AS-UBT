const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

if (!code.includes('handleSetTariffs')) {
  const replaceBlock = `
  const handleSetTariffs = (newTariffs: TariffItem[]) => {
    setModificationLogs(prev => [...prev, {
      id: \`log-\${Date.now()}\`,
      timestamp: new Date().toISOString(),
      actor: 'Admin',
      action: 'Updated Tariff Master Data'
    }]);
    setTariffs(newTariffs);
  };

  const handleSetPaymentSchemes = (newSchemes: PaymentScheme[]) => {
    setModificationLogs(prev => [...prev, {
      id: \`log-\${Date.now()}\`,
      timestamp: new Date().toISOString(),
      actor: 'Admin',
      action: 'Updated Payment Schemes Data'
    }]);
    setPaymentSchemes(newSchemes);
  };
`;
  
  code = code.replace(
    /const handleLoginSuccess = \(role: UserRole, nim: string, nama: string, notice\?: string, scenario\?: string\) => \{/,
    `${replaceBlock}\n  const handleLoginSuccess = (role: UserRole, nim: string, nama: string, notice?: string, scenario?: string) => {`
  );

  code = code.replace(
    /setTariffs=\{setTariffs\}/g,
    `setTariffs={handleSetTariffs}`
  );
  
  code = code.replace(
    /setPaymentSchemes=\{setPaymentSchemes\}/g,
    `setPaymentSchemes={handleSetPaymentSchemes}`
  );
  
  // also handlePlotRoom
  code = code.replace(
    /const handlePlotRoom = \(roomId: string, nim: string\) => \{/,
    `const handlePlotRoom = (roomId: string, nim: string) => {
    setModificationLogs(prev => [...prev, {
      id: \`log-room-\${Date.now()}\`,
      timestamp: new Date().toISOString(),
      actor: 'Admin',
      action: \`Updated Room Assignment for Mahasiswa \${nim} to Room \${roomId}\`
    }]);`
  );
}

fs.writeFileSync('src/App.tsx', code);
