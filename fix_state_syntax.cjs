const fs = require('fs');
let code = fs.readFileSync('src/components/maba/MabaDashboard.tsx', 'utf8');

// The line is exactly this:
// const [parentOtp, setParentOtp] = useState('');  const [otpTimer, setOtpTimer] = useState(300); // 5 minutes in seconds\n  const [showWaSimulator, setShowWaSimulator] = useState(false);

const regex = /const \[parentOtp, setParentOtp\] = useState\(''\);\s*const \[otpTimer, setOtpTimer\] = useState\(300\); \/\/ 5 minutes in seconds\\n\s*const \[showWaSimulator, setShowWaSimulator\] = useState\(false\);/;

if (regex.test(code)) {
    code = code.replace(regex, `const [parentOtp, setParentOtp] = useState('');\n  const [otpTimer, setOtpTimer] = useState(300);\n  const [showWaSimulator, setShowWaSimulator] = useState(false);`);
    fs.writeFileSync('src/components/maba/MabaDashboard.tsx', code);
    console.log("Fixed state syntax.");
} else {
    // If we can't find it with regex, let's just do a string replace of the literal \\n
    code = code.replace("seconds\\n  const [showWaSimulator", "seconds\\n  const [showWaSimulator");
    
    // Actually let's just replace all instances of literal \n if it's there
    code = code.replace(/\\n\s*const \[showWaSimulator/g, "\\n  const [showWaSimulator"); 
    
    // Wait, let's just find the exact string that is causing the problem.
    const exactStr = "const [parentOtp, setParentOtp] = useState('');  const [otpTimer, setOtpTimer] = useState(300); // 5 minutes in seconds\\n  const [showWaSimulator, setShowWaSimulator] = useState(false);";
    if (code.includes(exactStr)) {
        code = code.replace(exactStr, "const [parentOtp, setParentOtp] = useState('');\\nconst [otpTimer, setOtpTimer] = useState(300);\\nconst [showWaSimulator, setShowWaSimulator] = useState(false);");
    }
    
    fs.writeFileSync('src/components/maba/MabaDashboard.tsx', code.replace(/\\n\s*const \[showWaSimulator/g, "\\n  const [showWaSimulator"));
    console.log("Attempted manual fix.");
}
