const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Update AdminAsrama instances to pass invoices
code = code.replace(
  /<AdminAsrama rooms=\{rooms\} modificationLogs=\{modificationLogs\} initialTab="operasional"/g,
  `<AdminAsrama rooms={rooms} modificationLogs={modificationLogs} invoices={invoices} initialTab="operasional"`
);

code = code.replace(
  /<AdminAsrama rooms=\{rooms\} modificationLogs=\{modificationLogs\} initialTab="laravel"/g,
  `<AdminAsrama rooms={rooms} modificationLogs={modificationLogs} invoices={invoices} initialTab="laravel"`
);

code = code.replace(
  /<AdminAsrama rooms=\{rooms\} modificationLogs=\{modificationLogs\} initialTab="sql_importer" \/>/g,
  `<AdminAsrama rooms={rooms} modificationLogs={modificationLogs} invoices={invoices} initialTab="sql_importer" />`
);

fs.writeFileSync('src/App.tsx', code);
