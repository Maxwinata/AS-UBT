const fs = require('fs');
let code = fs.readFileSync('src/components/maba/MabaDashboard.tsx', 'utf8');

const targetSave = `  // SIMULATION MODE PROGRESS SAVER (AUTO-RESUME)
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
  }, [profile, invoice, contract, ticket, currentStep]);`;

if (code.includes(targetSave)) {
  code = code.replace(targetSave, "");
}

const targetInsert = `  const [parentPhonePendingUpdate, setParentPhonePendingUpdate] = useState(false);
  const [newParentPhoneInput, setNewParentPhoneInput] = useState('');`;

if (code.includes(targetInsert)) {
  code = code.replace(targetInsert, targetInsert + '\n\n' + targetSave);
  fs.writeFileSync('src/components/maba/MabaDashboard.tsx', code);
  console.log("Moved save progress effect successfully.");
} else {
  console.log("Could not find insert target.");
}
