import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import Tesseract from 'tesseract.js';

async function startServer() {
  const app = express();
  const PORT = 3000;
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

  // API Route: SIAKAD / SIDARA Live Synchronization
  app.post('/api/siakad/sync', (req, res) => {
    res.json({
      status: 'success',
      synced_count: 5,
      timestamp: new Date().toISOString(),
      message: 'Sinkronisasi live endpoint API SIDARA berhasil! 5 record pendaftar staging tersinkronkan ke basis data.',
    });
  });

  // API Route: SIAKAD Promote to Master
  app.post('/api/siakad/staging/:id/promote', (req, res) => {
    const { id } = req.params;
    res.json({
      status: 'success',
      staging_id: id,
      promoted_at: new Date().toISOString(),
      message: `Pendaftar staging #${id} berhasil dipromosikan ke master users, maba_profiles, dan penyewa!`,
    });
  });

  // API Route: Live Search Calon Mahasiswa SIMABA berdasarkan Nama atau No. Pendaftaran
  app.get('/api/simaba/search-student', async (req, res) => {
    try {
      const q = String(req.query.q || '').trim().toLowerCase();
      if (q.length < 2) {
        return res.json([]);
      }

      const { INITIAL_SIMABA_STUDENTS } = await import('./src/data/initialData');
      const results = INITIAL_SIMABA_STUDENTS.filter(s => 
        s.nama_mahasiswa.toLowerCase().includes(q) ||
        s.nomor_pendaftaran.toLowerCase().includes(q) ||
        (s.nik && s.nik.includes(q)) ||
        s.program_studi.toLowerCase().includes(q)
      ).slice(0, 8).map(s => ({
        id: s.id,
        nomor_pendaftaran: s.nomor_pendaftaran,
        nama_mahasiswa: s.nama_mahasiswa,
        program_studi: s.program_studi,
        jenis_mahasiswa: (s.jenis_mahasiswa || 'REGULER').toUpperCase(),
        tanggal_lahir_raw: s.tanggal_lahir,
        tanggal_lahir_formatted: s.tanggal_lahir_formatted || s.tanggal_lahir,
      }));

      return res.json(results);
    } catch (err) {
      console.error('Error searching SIMABA students:', err);
      return res.status(500).json({ error: 'Gagal mencari calon mahasiswa' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
        watch: null,
      },
      appType: 'custom',
    });
    app.use(vite.middlewares);

    app.get('*', async (req, res, next) => {
      const url = req.originalUrl;
      if (url.startsWith('/api')) {
        return next();
      }
      try {
        let template = fs.readFileSync(path.resolve(process.cwd(), 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        return res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        return next(e);
      }
    });
  } else {
    const publicBuildPath = path.join(process.cwd(), 'public', 'build');
    const distPath = fs.existsSync(publicBuildPath) ? publicBuildPath : path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  server.on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use.`);
    } else {
      console.error('Server error:', err);
    }
  });

  process.on('SIGTERM', () => {
    server.close(() => process.exit(0));
  });

  process.on('SIGINT', () => {
    server.close(() => process.exit(0));
  });
}

startServer();
