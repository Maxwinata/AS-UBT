const fs = require('fs');
let code = fs.readFileSync('src/components/maba/MabaDashboard.tsx', 'utf8');

// 1. Add timer state
const stateTarget = `  const [parentOtp, setParentOtp] = useState('');`;
const stateInsert = `  const [otpTimer, setOtpTimer] = useState(300); // 5 minutes in seconds
`;
if (!code.includes('otpTimer')) {
  code = code.replace(stateTarget, stateTarget + '\\n' + stateInsert);
}

// 2. Add timer effect
const effectTarget = `  const handleSendOtp = () => {`;
const effectInsert = `
  React.useEffect(() => {
    let interval: any;
    if (otpSentMessage && otpTimer > 0 && !isVerifyingOtp && contract.status !== 'SIGNED') {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    } else if (otpTimer === 0) {
      setOtpSentMessage(false);
      setOtpTimer(300);
      toast.error('Waktu pengisian OTP telah habis. Silakan kirim ulang kode OTP.');
    }
    return () => clearInterval(interval);
  }, [otpSentMessage, otpTimer, isVerifyingOtp, contract.status]);
`;
if (!code.includes('setOtpTimer((prev) => prev - 1)')) {
  code = code.replace(effectTarget, effectInsert + '\\n' + effectTarget);
}

// 3. Reset timer on send
const sendTarget = `    setOtpSentMessage(true);
    toast.success('Kode OTP berhasil dikirim via WhatsApp ke Mahasiswa dan Wali.');`;
const sendReplace = `    setOtpSentMessage(true);
    setOtpTimer(300);
    toast.success('Kode OTP 6-Digit berhasil dikirim via WhatsApp. Berlaku 5 menit.');`;
if (code.includes(sendTarget)) {
  code = code.replace(sendTarget, sendReplace);
}

// 4. Show timer in UI
const uiTarget = `                    <div>
                      <label className="text-slate-700 block mb-1 text-[11px] font-bold">Kode OTP Mahasiswa (6 Digit) *</label>`;
const uiInsert = `                    <div className="flex justify-between items-center bg-indigo-50 px-3 py-2 rounded-lg border border-indigo-100">
                      <span className="text-xs text-indigo-700 font-medium flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Sisa Waktu OTP:</span>
                      <span className="text-sm font-bold font-mono text-indigo-700">
                        {Math.floor(otpTimer / 60).toString().padStart(2, '0')}:{(otpTimer % 60).toString().padStart(2, '0')}
                      </span>
                    </div>
                    
`;
if (code.includes(uiTarget) && !code.includes('Sisa Waktu OTP')) {
  code = code.replace(uiTarget, uiInsert + uiTarget);
}

fs.writeFileSync('src/components/maba/MabaDashboard.tsx', code);
