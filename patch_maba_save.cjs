const fs = require('fs');
let code = fs.readFileSync('src/components/maba/MabaDashboard.tsx', 'utf8');

const targetEffect = `  // SW Sync Listener
  React.useEffect(() => {
    if ('serviceWorker' in navigator) {`;

const saveLogic = `  // SIMULATION MODE PROGRESS SAVER (AUTO-RESUME)
  React.useEffect(() => {
    if (profile?.nim && !profile.nim.startsWith('REG') && !profile.nim.startsWith('PMB')) {
      const progressData = {
        profile,
        invoice,
        contract,
        ticket,
        step: currentStep,
        lastSaved: new Date().toISOString()
      };
      localStorage.setItem(\`maba_progress_\${profile.nim}\`, JSON.stringify(progressData));
    }
  }, [profile, invoice, contract, ticket, currentStep]);

  // SW Sync Listener
  React.useEffect(() => {
    if ('serviceWorker' in navigator) {`;

if (code.includes(targetEffect)) {
  code = code.replace(targetEffect, saveLogic);
  fs.writeFileSync('src/components/maba/MabaDashboard.tsx', code);
  console.log("Patched MabaDashboard save logic successfully.");
} else {
  console.log("Could not find the target effect in MabaDashboard.");
}
