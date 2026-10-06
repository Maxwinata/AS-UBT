const fs = require('fs');
let code = fs.readFileSync('src/components/maba/MabaDashboard.tsx', 'utf8');

// Update the OTP validation length from 4 to 6
const targetLoc1 = `if (studentOtp.length < 4 || (profile.metodePersetujuanOrtu === 'ELEKTRONIK_OTP' && parentOtp.length < 4)) {`;
if (code.includes(targetLoc1)) {
  code = code.replace(targetLoc1, `if (studentOtp.length !== 6 || (profile.metodePersetujuanOrtu === 'ELEKTRONIK_OTP' && parentOtp.length !== 6)) {`);
  fs.writeFileSync('src/components/maba/MabaDashboard.tsx', code);
}
