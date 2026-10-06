const fs = require('fs');
const code = fs.readFileSync('src/App.tsx', 'utf8');
const regex = /setInvoices\(\[\{\s*\.\.\.INITIAL_INVOICE[^\]]+\]\);/g;
console.log(code.match(regex));
