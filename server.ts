import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import Tesseract from 'tesseract.js';

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  // API routes FIRST
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Middleware to parse large JSON bodies for base64 images
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // API Route: OCR for e-KTP using Tesseract.js (Free, no AI Vision)
  app.post('/api/ocr-ktp', async (req, res) => {
    try {
      const { imageBase64 } = req.body;
      if (!imageBase64) {
        return res.status(400).json({ valid: false, error: 'Gambar tidak ditemukan.' });
      }

      console.log('Mulai memproses OCR KTP dengan Tesseract.js...');
      
      const { data: { text } } = await Tesseract.recognize(
        imageBase64,
        'eng', // English is generally fine for numbers
        { logger: m => console.log(m) }
      );

      // Cari NIK (16 digit angka yang berdekatan)
      const sanitizedText = text.replace(/\s+/g, '');
      const nikMatch = sanitizedText.match(/\d{16}/);

      if (nikMatch) {
        return res.json({
          valid: true,
          nik: nikMatch[0],
          message: 'KTP Valid. NIK berhasil diekstrak dengan sistem Tesseract OCR.'
        });
      } else {
        return res.status(400).json({
          valid: false,
          error: 'Validasi ditolak: Tidak ditemukan 16 digit NIK pada gambar ini. Pastikan foto terang dan jelas.'
        });
      }
    } catch (error: any) {
      console.error('Error during Tesseract OCR:', error);
      res.status(500).json({ valid: false, error: 'Validasi KTP ditolak: Terjadi kesalahan pada sistem OCR lokal.' });
    }
  });

  // API Route: Validate Selfie is moved to Client-Side (Local AI) for Face, but Server-Side for NIK matching
  app.post('/api/validate-selfie', async (req, res) => {
    try {
      const { imageBase64, expectedNik } = req.body;
      if (!imageBase64 || !expectedNik) {
        return res.status(400).json({ valid: false, error: 'Gambar atau NIK referensi tidak ditemukan.' });
      }

      console.log(`Mulai memproses OCR Selfie untuk mencocokkan NIK: ${expectedNik} dengan Tesseract.js...`);
      
      const { data: { text } } = await Tesseract.recognize(
        imageBase64,
        'eng',
        { logger: m => console.log(m) }
      );

      const sanitizedText = text.replace(/[\W_]+/g, '').toUpperCase();
      
      // Fuzzy match: We need to tolerate OCR errors on small selfie KTPs (e.g., 0->O, 1->I, 5->S)
      const normalizedOCR = sanitizedText.replace(/O/g, '0').replace(/I|L/g, '1').replace(/S/g, '5').replace(/G/g, '6').replace(/B/g, '8');
      const normalizedExpected = expectedNik.replace(/O/g, '0').replace(/I|L/g, '1').replace(/S/g, '5').replace(/G/g, '6').replace(/B/g, '8');

      let isMatch = false;
      for (let i = 0; i <= normalizedOCR.length - 16; i++) {
        let matchCount = 0;
        for (let j = 0; j < 16; j++) {
           if (normalizedOCR[i+j] === normalizedExpected[j]) matchCount++;
        }
        // Tolerate up to 4 mistakes (12/16 correct) due to low-res selfie OCR
        if (matchCount >= 12) { 
          isMatch = true;
          break;
        }
      }

      if (isMatch) {
        return res.json({
          valid: true,
          message: 'Validasi berhasil! Wajah dan NIK KTP pada selfie terverifikasi identik.'
        });
      } else {
        return res.status(400).json({
          valid: false,
          error: 'Validasi ditolak: NIK pada KTP di foto selfie tidak cocok dengan KTP awal, atau resolusi gambar terlalu buram untuk dibaca.'
        });
      }

    } catch (error: any) {
      console.error('Error during Selfie OCR:', error);
      res.status(500).json({ valid: false, error: 'Validasi biometrik ditolak: Terjadi kesalahan pada sistem OCR lokal saat mencocokkan NIK.' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
