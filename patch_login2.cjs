const fs = require('fs');
let code = fs.readFileSync('src/components/auth/LoginDualTab.tsx', 'utf8');

const oldCall = "onLoginSuccess('eksisting', ssoUsername, 'Ahmad Raihan', selectedSsoAccount);";
const newCall = "onLoginSuccess('eksisting', ssoUsername, 'Ahmad Raihan', undefined, selectedSsoAccount);";

if (code.includes(oldCall)) {
  code = code.replace(oldCall, newCall);
  fs.writeFileSync('src/components/auth/LoginDualTab.tsx', code);
  console.log("Patched eksisting login call successfully.");
} else {
  console.log("Could not find the eksisting target string.");
}
