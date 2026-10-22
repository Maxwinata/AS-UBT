# Solusi Pemulihan Script esbuild & Stabilisasi Dev Server Laragon (npm run dev)

Panduan implementasi dan langkah perbaikan menyeluruh untuk mengatasi pemblokiran script instalasi `esbuild` oleh kebijakan `allowScripts` pada NPM, sehingga `npm run dev` (Vite & TSX) dapat berjalan normal dan lancar di lingkungan Laragon Windows.

---

## Tinjauan Pengguna & Keputusan Kunci

> [!IMPORTANT]
> Berdasarkan konfirmasi Anda bahwa **`npm run dev` mengalami error** di terminal Laragon akibat pemblokiran script instalasi, fokus utama adalah:
> 1. **Penyebab Utama Error**: Paket `esbuild` membutuhkan script instalasi (`postinstall: node install.js`) untuk memasang binary native executable (`esbuild.exe` / `@esbuild/win32-x64`) pada Windows. Karena NPM memblokirnya atas kebijakan proteksi `allowScripts`, binary tersebut tidak terbentuk, menyebabkan perintah `tsx server.ts` atau `vite` gagal dengan pesan *esbuild binary not found* atau *spawn esbuild.exe ENOENT*.
> 2. **Metode Penyelesaian Terpilih**: Menerapkan solusi 3 lapis yang menjamin dev server langsung berjalan seketika di terminal Laragon, serta memperbarui skrip otomatisasi `laragon-setup.bat` agar instalasi berikutnya tidak lagi mengalami kendala yang sama.

- **Keputusan Terkonfirmasi 1**: Memprioritaskan perbaikan binary native `esbuild` agar dev server `npm run dev` dapat langsung dijalankan tanpa hambatan.
- **Keputusan Terkonfirmasi 2**: Menambahkan penanganan otomatis pada skrip `laragon-setup.bat` dan dokumentasi panduan Laragon (`LARAGON_SETUP.md`) untuk pengembang lain.
- **Keputusan Terkonfirmasi 3**: Menjaga integritas paket lain (`@google/genai`, `core-js`, `tesseract.js`) yang tidak memerlukan persetujuan script karena bersifat opsional/telemetri.

---

## 1. Ikhtisar Masalah & Solusi Arsitektural

### Alur Ketergantungan Eksekusi Dev Server
```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                     ALUR EKSEKUSI DEV SERVER DI LINGKUNGAN LARAGON                     │
└────────────────────────────────────────────────────────────────────────────────────────┘

 [Terminal Laragon (Cmder / Command Prompt)]
                     │
                     ▼
         $ npm run dev (tsx server.ts)
                     │
                     ├──────────────────────────────┐
                     ▼                              ▼
             [Node.js Runtime]              [TSX TypeScript Engine]
                     │                              │
                     ▼                              ▼
             Express Server (:3000)         [esbuild Compiler]
                     │                              │
                     ▼                              ▼
             Vite Middleware                Membutuhkan: esbuild.exe
                                            (Gagal jika script instalasi diblokir!)
```

### 3 Opsi Eksekusi Langsung di Terminal Laragon Anda
Pengguna dapat langsung menjalankan salah satu dari 3 perintah berikut di terminal Laragon (`C:\laragon\www\asrama-ubt`):

1. **Opsi 1 (Paling Cepat & Pasti - Eksekusi Manual Script Installer esbuild)**:
   ```bash
   node node_modules/esbuild/install.js
   ```
   *Perintah ini langsung mengunduh/mengekstrak `esbuild.exe` ke direktori lokal tanpa perlu izin manual dari npm.*

2. **Opsi 2 (Mengikuti Mekanisme Resmi NPM `install-scripts`)**:
   ```bash
   npm install-scripts approve esbuild
   npm rebuild esbuild
   ```

3. **Opsi 3 (Instalasi Langsung Paket Native Windows x64)**:
   ```bash
   npm install @esbuild/win32-x64 --save-optional --legacy-peer-deps
   ```

---

## 2. Pengalaman Pengembang & Rencana Perubahan Kode

Untuk memastikan proyek ini siap pakai 1-klik (*zero-friction*) bagi semua pengembang yang meng-clone repositori di Laragon, berikut rencana penyesuaian berkas:

### A. Pembaruan Skrip Otomatisasi `laragon-setup.bat`
Menambahkan baris pemulihan otomatis pasca-eksekusi `npm install`:
```bat
echo [6/7] Menginstal dependensi Node.js / NPM...
call npm install --legacy-peer-deps

echo       + Memastikan binary native esbuild terpasang...
if exist "node_modules\esbuild\install.js" (
    call node node_modules\esbuild\install.js
)
```

### B. Pembaruan Skrip Shell `laragon-setup.sh` (Untuk Git Bash / WSL)
Menambahkan logika penjaminan yang identik:
```bash
npm install --legacy-peer-deps
if [ -f "node_modules/esbuild/install.js" ]; then
    node node_modules/esbuild/install.js
fi
```

### C. Pembaruan Dokumentasi `LARAGON_SETUP.md` & `LARAGON_SETUP.en.md`
Menambahkan sub-bab khusus *"Troubleshooting: Mengatasi Peringatan install-scripts & Error esbuild"* yang memuat panduan perintah 1-baris jika pengguna mengalami pemblokiran script oleh npm.

---

## 3. Rencana Kerja Implementasi Bertahap

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 TAHAPAN IMPLEMENTASI                                   │
└────────────────────────────────────────────────────────────────────────────────────────┘

  [1. Dokumentasi Solusi Cepat] ──▶ [2. Patch laragon-setup.bat] ──▶ [3. Verifikasi Build]
  Menyediakan perintah 1-baris      Menyisipkan fallback eksekusi    Menjalankan compile_applet
  untuk dijalankan user sekarang.   esbuild install.js otomatis.     & lint_applet di sistem.
```

1. **Tahap 1: Verifikasi dan Penyusunan Skrip Setup Windows**:
   - Memperbarui `laragon-setup.bat` agar secara proaktif mengeksekusi `node node_modules/esbuild/install.js` jika file tersebut ada, mencegah kegagalan dev server pada instalasi baru.
2. **Tahap 2: Dokumentasi Troubleshooting di Panduan Laragon**:
   - Menambahkan petunjuk resmi di `LARAGON_SETUP.md` mengenai penanganan kebijakan script NPM di Windows.
3. **Tahap 3: Verifikasi Integritas Build**:
   - Menguji kompilasi proyek dengan `compile_applet` dan `lint_applet` untuk menjamin tidak ada regresi pada kode TypeScript maupun konfigurasi server.

---

## 4. Rencana Pengujian & Verifikasi

1. **Uji Eksekusi Installer esbuild**:
   - Memastikan berkas `node_modules/esbuild/install.js` dapat diakses dan dieksekusi secara idempotent tanpa merusak dependensi lain.
2. **Uji Validasi TypeScript**:
   - Menjalankan `tsc --noEmit` untuk memastikan seluruh tipe data tetap valid (0 errors).
3. **Uji Kompilasi Vite**:
   - Menjalankan `compile_applet` untuk memastikan Vite bundle dan Express server siap dijalankan pada mode dev maupun production.
