const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetStr = `    } else if (nim && nama) {
      setMabaProfile((prev) => ({
        ...prev,
        nim: nim,
        nama: nama,
      }));
    }`;

const replaceStr = `    } else if (nim && nama) {
      // 1. Try to restore saved progress from localStorage (Auto-Resume)
      const savedProgress = localStorage.getItem(\`maba_progress_\${nim}\`);
      if (savedProgress) {
        try {
          const parsed = JSON.parse(savedProgress);
          if (parsed.profile) setMabaProfile(parsed.profile);
          if (parsed.invoice) setInvoices([parsed.invoice]);
          if (parsed.contract) setContract(parsed.contract);
          if (parsed.ticket) setTicket(parsed.ticket);
        } catch (error) {
          console.error("Failed to parse saved progress", error);
        }
      } else {
        // 2. Fallback to basic assignment if no saved progress
        setMabaProfile((prev) => ({
          ...prev,
          nim: nim,
          nama: nama,
        }));
      }
    }`;

if (code.includes(targetStr)) {
  code = code.replace(targetStr, replaceStr);
  fs.writeFileSync('src/App.tsx', code);
  console.log("Patched App.tsx restore logic successfully.");
} else {
  console.log("Could not find the target string in App.tsx.");
}
