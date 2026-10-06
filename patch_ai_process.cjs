const fs = require('fs');
let code = fs.readFileSync('src/components/maba/MabaDashboard.tsx', 'utf8');

// For KTP
const ktpSuccessTarget = `          if (data.nik) {
            setProfile((p: any) => ({ ...p, nik: data.nik }));
            toast.success(\`AI berhasil mengekstrak NIK: \${data.nik}\`, { duration: 5000 });
          }
          setKtpFileName(fileName);
          setKtpPreview(previewUrl || base64Image);`;

const ktpSuccessReplace = `          setKtpFileName(fileName);
          setKtpPreview(previewUrl || base64Image);
          setProfile((p: any) => {
            const updated = { ...p, nik: data.nik || p.nik, ktpUrl: previewUrl || base64Image };
            if (onUpdateProfile) onUpdateProfile(updated);
            return updated;
          });
          if (data.nik) {
            toast.success(\`AI berhasil mengekstrak NIK: \${data.nik}\`, { duration: 5000 });
          }`;

// For Selfie
const selfieSuccessTarget = `          toast.success('Berhasil! Wajah terdeteksi. Foto Anda disimpan untuk verifikasi Admin.', { id: loadingToastId, duration: 4000 });
          setSelfieFileName(fileName);
          setSelfiePreview(previewUrl || base64Image);`;

const selfieSuccessReplace = `          toast.success('Berhasil! Wajah terdeteksi. Foto Anda disimpan untuk verifikasi Admin.', { id: loadingToastId, duration: 4000 });
          setSelfieFileName(fileName);
          setSelfiePreview(previewUrl || base64Image);
          setProfile((p: any) => {
            const updated = { ...p, selfieUrl: previewUrl || base64Image };
            if (onUpdateProfile) onUpdateProfile(updated);
            return updated;
          });`;

if (code.includes('setKtpPreview(previewUrl || base64Image)')) {
    code = code.replace(ktpSuccessTarget, ktpSuccessReplace);
    code = code.replace(selfieSuccessTarget, selfieSuccessReplace);
    fs.writeFileSync('src/components/maba/MabaDashboard.tsx', code);
    console.log("Patched processImageWithAI");
} else {
    console.log("Could not find targets");
}
