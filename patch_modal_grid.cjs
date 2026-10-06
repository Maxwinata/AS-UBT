const fs = require('fs');
let code = fs.readFileSync('src/components/admin/CorrectionRequestsAdmin.tsx', 'utf8');

// Change max-w-lg to max-w-4xl
code = code.replace('w-full max-w-lg shadow-2xl', 'w-full max-w-4xl shadow-2xl');

// Change space-y-6 to grid layout
code = code.replace('<div className="space-y-6 mt-4 max-h-[60vh] overflow-y-auto pr-2">', '<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4 max-h-[60vh] overflow-y-auto pr-2">');

fs.writeFileSync('src/components/admin/CorrectionRequestsAdmin.tsx', code);
console.log("Patched modal grid.");
