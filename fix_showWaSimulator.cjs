const fs = require('fs');
let code = fs.readFileSync('src/components/maba/MabaDashboard.tsx', 'utf8');

const stateTarget = `  const [otpTimer, setOtpTimer] = useState(300);`;
const stateInsert = `  const [showWaSimulator, setShowWaSimulator] = useState(false);`;

if (!code.includes('showWaSimulator, setShowWaSimulator')) {
  // Let's just find where setOtpTimer is and put it there
  if (code.includes(stateTarget)) {
    code = code.replace(stateTarget, stateTarget + '\\n' + stateInsert);
    fs.writeFileSync('src/components/maba/MabaDashboard.tsx', code);
    console.log("Added showWaSimulator state.");
  } else {
     // fallback find
     const fallbackTarget = `const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);`;
     code = code.replace(fallbackTarget, fallbackTarget + '\\n' + stateInsert);
     fs.writeFileSync('src/components/maba/MabaDashboard.tsx', code);
     console.log("Added showWaSimulator state via fallback.");
  }
} else {
  console.log("showWaSimulator already exists? Let's check.");
}
