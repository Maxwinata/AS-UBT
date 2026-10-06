const fs = require('fs');
let code = fs.readFileSync('src/components/auth/LoginDualTab.tsx', 'utf8');

const oldCall = "onLoginSuccess('maba', pmbNoReg, 'Maximilian Wimin Winata', selectedScenario);";
const newCall = "onLoginSuccess('maba', pmbNoReg, 'Maximilian Wimin Winata', undefined, selectedScenario);";

if (code.includes(oldCall)) {
  code = code.replace(oldCall, newCall);
  fs.writeFileSync('src/components/auth/LoginDualTab.tsx', code);
  console.log("Patched login success call successfully.");
} else {
  console.log("Could not find the target string.");
}
