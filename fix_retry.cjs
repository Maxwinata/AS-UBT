const fs = require('fs');
let code = fs.readFileSync('src/components/maba/MabaDashboard.tsx', 'utf8');

const newRetry = `    const fetchWithRetry = async (url: string, options: RequestInit, retries = 3, delay = 2000) => {
      for (let i = 0; i < retries; i++) {
        try {
          const response = await fetch(url, options);
          if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            if (response.status === 400 || response.status === 422) {
               // Jangan retry kalau error dari validasi input
               throw { isHttpError: true, status: response.status, data };
            }
            throw new Error(\`HTTP error! status: \${response.status}\`);
          }
          return response;
        } catch (error: any) {
          if (error.isHttpError) throw error; // Teruskan error HTTP 400
          if (i < retries - 1) {
            toast.loading(\`Koneksi terputus. Mencoba ulang mengunggah... (\${i + 1}/\${retries})\`, { id: loadingToastId });
            await new Promise(resolve => setTimeout(resolve, delay));
          } else {
            throw error;
          }
        }
      }
      throw new Error("Max retries reached");
    };`;

code = code.replace(
  /const fetchWithRetry = async \(url: string, options: RequestInit, retries = 3, delay = 2000\) => \{[\s\S]*?throw new Error\("Max retries reached"\);\n    \};/,
  newRetry
);

// We need to catch this error in `processImageWithAI` catch block
const newCatch = `    } catch (e: any) {
       let errorMsg = 'Gagal mengunggah foto. Silakan periksa koneksi internet Anda.';
       if (e.isHttpError && e.data && e.data.error) {
         errorMsg = e.data.error;
       }
       setVerificationHistory(prev => [{
         id: Date.now().toString() + Math.random().toString(),
         timestamp: new Date(),
         type: target === 'ktp' ? 'KTP' : 'Selfie',
         status: 'error',
         message: errorMsg
       }, ...prev]);
       toast.error(\`Foto ditolak: \${errorMsg}\`, { id: loadingToastId, duration: 8000 });
       // Don't throw so it doesn't break React flow
    }`;

code = code.replace(
  /    } catch \(e: any\) \{[\s\S]*?throw e;\n    \}/,
  newCatch
);

fs.writeFileSync('src/components/maba/MabaDashboard.tsx', code);
console.log('Fixed fetch retry logic');
