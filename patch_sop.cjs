const fs = require('fs');
let code = fs.readFileSync('src/components/maba/MabaDashboard.tsx', 'utf8');

const titleTarget = `{sopPhaseId === 1 ? 'SOP: Panduan Registrasi' : 'SOP: Tagihan & Pembayaran'}`;
const titleReplace = `{sopPhaseId === 1 ? 'SOP: Registrasi & e-KYC' : sopPhaseId === 2 ? 'SOP: Konfigurasi Tagihan' : sopPhaseId === 3 ? 'SOP: Pembayaran & Verifikasi' : sopPhaseId === 4 ? 'SOP: Kontrak Elektronik (JUKLAK-03)' : 'SOP & Panduan'}`;

code = code.replace(titleTarget, titleReplace);

const contentTargetRegex = /\{sopPhaseId === 1 \? \([\s\S]*?\) : \([\s\S]*?\}<\/div>/;

const newContent = `{sopPhaseId === 1 && (
                <>
                  <p><strong>Tahap 1: Registrasi & e-KYC</strong></p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Semua mahasiswa baru diwajibkan untuk mengisi biodata lengkap sesuai dengan data kependudukan.</li>
                    <li>Sistem memerlukan validasi e-KYC dengan membandingkan KTP dan foto selfie.</li>
                    <li>Mohon pastikan foto wajah terlihat jelas dan tidak tertutup masker atau kacamata gelap.</li>
                    <li>Admin Asrama akan memvalidasi data Anda dalam waktu 1x24 jam kerja.</li>
                  </ul>
                </>
              )}
              {sopPhaseId === 2 && (
                <>
                  <p><strong>Tahap 2: Konfigurasi Tagihan</strong></p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Pilih skema pembayaran yang sesuai (Lunas atau Cicilan).</li>
                    <li>Khusus untuk KIP-Kuliah, opsi cicilan yang tersedia mungkin berbeda menyesuaikan subsidi.</li>
                    <li>Setelah tagihan terbentuk, Anda akan mendapatkan Nomor Rekening/Virtual Account tujuan.</li>
                  </ul>
                </>
              )}
              {sopPhaseId === 3 && (
                <>
                  <p><strong>Tahap 3: Pembayaran & Konfirmasi</strong></p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Mahasiswa diwajibkan mentransfer pembayaran sesuai dengan nominal total tagihan. Perhatikan instruksi atau kode unik jika ada.</li>
                    <li>Unggah foto struk, mutasi mobile banking, atau bukti transfer yang sah dan dapat terbaca jelas.</li>
                    <li>Tim Keuangan Asrama (Admin) akan memverifikasi bukti pembayaran Anda paling lambat 1x24 jam kerja.</li>
                    <li>Selama status PENDING, Anda tidak dapat mengubah skema tagihan. Jika bukti ditolak, Anda akan diminta mengunggah ulang bukti yang benar.</li>
                  </ul>
                </>
              )}
              {sopPhaseId === 4 && (
                <>
                  <p><strong>Tahap 4: Kontrak Elektronik & Pakta Integritas (JUKLAK-03)</strong></p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Anda diwajibkan membaca seluruh isi Perjanjian Sewa (F-19) dan Pakta Integritas (F-02) sebelum dapat menyetujuinya (wajib <i>scroll</i> sampai akhir).</li>
                    <li>Bagi yang menggunakan metode elektronik, persetujuan dilakukan melalui Kode OTP 6-Digit yang dikirimkan via WhatsApp.</li>
                    <li><strong>Dual Verification:</strong> Sistem mengirimkan kode OTP secara terpisah ke nomor HP Mahasiswa dan nomor HP Wali. Keduanya harus diinput.</li>
                    <li>OTP berlaku maksimal 5 menit.</li>
                    <li>Segala bentuk pelanggaran berat terhadap Pakta Integritas dapat berakibat pada pengusiran sepihak dan hangusnya uang deposit Anda (Sesuai JUKLAK).</li>
                  </ul>
                </>
              )}
            </div>`;

code = code.replace(contentTargetRegex, newContent);

fs.writeFileSync('src/components/maba/MabaDashboard.tsx', code);
