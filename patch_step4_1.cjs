const fs = require('fs');
let code = fs.readFileSync('src/components/maba/MabaDashboard.tsx', 'utf8');

// Find the contract functions area to insert our OTP handlers
const targetLoc = `  const handleSimpanTandaTangan = () => {`;

const insertFunctions = `
  const handleSendOtp = () => {
    setOtpSentMessage(true);
    toast.success('Kode OTP berhasil dikirim via WhatsApp ke Mahasiswa dan Wali.');
  };

  const handleVerifyOtp = () => {
    if (studentOtp.length < 4 || (profile.metodePersetujuanOrtu === 'ELEKTRONIK_OTP' && parentOtp.length < 4)) {
      toast.error('Kode OTP tidak valid. Harus minimal 4 digit.');
      return;
    }
    setIsVerifyingOtp(true);
    setTimeout(() => {
      setIsVerifyingOtp(false);
      const updatedContract = { ...contract, status: 'SIGNED' as const };
      setContract(updatedContract);
      onUpdateContract(updatedContract);
      toast.success('Verifikasi OTP berhasil. Kontrak elektronik disahkan.');
    }, 1500);
  };
`;

if (code.includes(targetLoc)) {
  code = code.replace(targetLoc, insertFunctions + '\\n' + targetLoc);
  fs.writeFileSync('src/components/maba/MabaDashboard.tsx', code);
  console.log("Patched OTP handlers");
} else {
  console.log("Could not find target function.");
}
