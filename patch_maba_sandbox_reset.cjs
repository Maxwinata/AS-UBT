const fs = require('fs');
let code = fs.readFileSync('src/components/maba/MabaDashboard.tsx', 'utf8');

// The reset button has two occurences. One is: toast.success('Reset to Step 1'); the other is: toast.success('Sistem direset ke Tahap 1');

code = code.replace(/toast\.success\('Reset to Step 1'\);/g, "localStorage.removeItem(`maba_progress_${profile.nim}`);\n                    toast.success('Reset to Step 1');");
code = code.replace(/toast\.success\('Sistem direset ke Tahap 1'\);/g, "localStorage.removeItem(`maba_progress_${profile.nim}`);\n                    toast.success('Sistem direset ke Tahap 1');");

fs.writeFileSync('src/components/maba/MabaDashboard.tsx', code);
console.log("Patched sandbox reset logic");
