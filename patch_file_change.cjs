const fs = require('fs');
let code = fs.readFileSync('src/components/maba/MabaDashboard.tsx', 'utf8');

const newHandleFileChange = `
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, target: 'ktp' | 'selfie') => {
    const file = e.target.files?.[0];
    if (file) {
      // Client-side validation: Max 5MB
      if (file.size > 5 * 1024 * 1024) {
        toast.error(\`Ukuran file \${file.name} terlalu besar (Maksimal 5MB). Silakan kompres foto Anda.\`, { duration: 5000 });
        return;
      }
      
      // Client-side validation: Format image
      if (!file.type.startsWith('image/')) {
        toast.error('Format file tidak didukung. Harap unggah file gambar (JPG/PNG).', { duration: 5000 });
        return;
      }

      const reader = new FileReader();
      reader.onload = (evt) => {
        const result = evt.target?.result as string;
        // Basic quality check on dimensions could be done, but rely on server OCR for now
        processImageWithAI(result, target, file.name);
      };
      reader.onerror = () => {
        toast.error('Gagal membaca file. Silakan coba lagi.');
      };
      reader.readAsDataURL(file);
    }
    // Clear input so same file can be selected again if failed
    e.target.value = '';
  };
`;

code = code.replace(
  /const handleFileChange = \(e: React\.ChangeEvent<HTMLInputElement>, target: 'ktp' \| 'selfie'\) => \{[\s\S]*?reader\.readAsDataURL\(file\);\n    \}\n  \};/,
  newHandleFileChange.trim()
);

fs.writeFileSync('src/components/maba/MabaDashboard.tsx', code);
