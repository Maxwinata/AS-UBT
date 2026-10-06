const fs = require('fs');
let code = fs.readFileSync('src/components/auth/LoginDualTab.tsx', 'utf8');

const oldType = "onLoginSuccess: (role: UserRole, nim: string, nama: string, notice?: string) => void;";
const newType = "onLoginSuccess: (role: UserRole, nim: string, nama: string, notice?: string, scenario?: string) => void;";

if (code.includes(oldType)) {
  code = code.replace(oldType, newType);
  fs.writeFileSync('src/components/auth/LoginDualTab.tsx', code);
  console.log("Patched login type successfully.");
} else {
  console.log("Could not find the target type string.");
}
