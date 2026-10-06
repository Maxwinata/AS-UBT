const fs = require('fs');
let code = fs.readFileSync('src/components/maba/MabaDashboard.tsx', 'utf8');

const targetStr = `  return (
    <div className="max-w-5xl mx-auto space-y-6">`;

const renderStr = `  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {renderSandbox()}`;

if (code.includes(targetStr)) {
  code = code.replace(targetStr, renderStr);
  fs.writeFileSync('src/components/maba/MabaDashboard.tsx', code);
  console.log("Patched render function");
}
