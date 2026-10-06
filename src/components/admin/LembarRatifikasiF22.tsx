import React, { useState } from 'react';
import { Printer, ShieldCheck, Download, Users, Fingerprint, FileText } from 'lucide-react';
import { RoomPlot } from '../../types/asrama';

interface Props {
  rooms: RoomPlot[];
}

export const LembarRatifikasiF22: React.FC<Props> = ({ rooms }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Generate 40 dummy rows for the demo
  const dummyRows = Array.from({ length: 40 }).map((_, i) => ({
    no: i + 1,
    nama: `Mahasiswa Dummy ${i + 1}`,
    nim: `2026${String(i + 1).padStart(4, '0')}`,
    kamar: `Gedung A - ${100 + (i % 10)}`,
    waktuOtp: `18 Aug 2026, 0${(i % 9) + 1}:15 WIB`
  }));

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setShowPreview(true);
    }, 1500);
  };

  const generateHash = () => {
    // Simulated SHA-256 hash
    return "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <FileText className="w-5 h-5 text-indigo-700" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Pencetakan Daftar Ratifikasi (F-22)</h2>
        </div>
        <p className="text-sm text-slate-600 mb-6">
          Sesuai JUKLAK-03, untuk efisiensi biaya, bea meterai tidak dibebankan pada masing-masing kontrak Maba.
          Gunakan fitur ini untuk mencetak Daftar Ratifikasi Kolektif (maks 40 baris/lembar) dengan satu meterai Rp10.000.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <h3 className="font-bold text-slate-800 text-sm">Batch Antrean Check-In</h3>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-600">Gelombang / Hari</span>
              <span className="font-bold text-slate-900">Gelombang 1 (Senin)</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-600">Maba Tersedia</span>
              <span className="font-bold text-slate-900">120 Mahasiswa</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-600">Kebutuhan F-22</span>
              <span className="font-bold text-slate-900">3 Lembar (Meterai Rp 30.000)</span>
            </div>
          </div>
          
          <div className="flex flex-col justify-end">
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-70 text-white font-bold py-3 rounded-xl transition-all shadow-sm"
            >
              {isGenerating ? (
                <>
                  <ShieldCheck className="w-5 h-5 animate-pulse" />
                  <span>Kalkulasi Hash SHA-256...</span>
                </>
              ) : (
                <>
                  <Printer className="w-5 h-5" />
                  <span>Cetak Lembar F-22 (Gelombang 1)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {showPreview && (
        <div className="bg-white border border-slate-200 p-8 rounded-2xl shadow-xl overflow-x-auto">
          {/* F-22 Document Preview */}
          <div className="min-w-[800px] border border-slate-300 p-8 text-xs font-serif bg-slate-50 relative">
            <div className="absolute top-8 right-8 text-[10px] border border-slate-300 px-2 py-1">
              F-22/UPA/08/2026/01
            </div>
            <div className="text-center font-bold mb-6">
              <h1 className="text-lg">YAYASAN GLENI</h1>
              <h2 className="text-sm">UNIT PENGELOLA ASRAMA</h2>
              <p className="font-normal text-[10px] italic">Asrama Mahasiswa Universitas Bunda Thamrin</p>
              
              <div className="border-t-2 border-black my-4"></div>
              
              <h3 className="text-base uppercase underline">Daftar Ratifikasi Kontrak Kolektif</h3>
              <p className="text-[11px] font-normal mt-1">Pengakuan Tanda Tangan Elektronik atas Kontrak Penghunian Asrama (F-19)<br/>dan Pakta Integritas Tata Tertib Asrama (F-02)</p>
            </div>

            <div className="mb-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex"><span className="w-32 font-bold">Gelombang Check-in:</span><span>1</span></div>
                  <div className="flex"><span className="w-32 font-bold">Tanggal Check-in:</span><span>18 Agustus 2026</span></div>
                  <div className="flex"><span className="w-32 font-bold">Jumlah Baris:</span><span>40</span></div>
                  <div className="flex"><span className="w-32 font-bold">Petugas Pencetak:</span><span>Admin Asrama</span></div>
                </div>
                <div>
                  <div className="flex"><span className="w-32 font-bold">Tahun Akademik:</span><span>2026/2027</span></div>
                  <div className="flex"><span className="w-32 font-bold">Asrama:</span><span>[X] Putra  [ ] Putri</span></div>
                  <div className="flex"><span className="w-32 font-bold">Halaman:</span><span>1 dari 1</span></div>
                  <div className="flex"><span className="w-32 font-bold">Waktu Cetak:</span><span>08:00 WIB</span></div>
                </div>
              </div>
              <div className="mt-2 text-[10px] bg-slate-200 p-1 font-mono">
                <span className="font-bold">Nilai Hash sumber (SHA-256):</span> {generateHash()}
              </div>
            </div>

            <div className="mb-4">
              <h4 className="font-bold bg-slate-200 p-1 mb-2">II. PERNYATAAN RATIFIKASI</h4>
              <p className="text-[10px] text-justify">
                Dengan membubuhkan tanda tangan basah pada baris nama saya dalam Bagian III, saya menyatakan:<br/>
                1. bahwa saya benar telah memberikan persetujuan atas Kontrak Penghunian Asrama (F-19) dan Pakta Integritas Tata Tertib Asrama (F-02) secara elektronik melalui Sistem Informasi Asrama pada waktu yang tercantum pada baris nama saya;<br/>
                2. bahwa saya mengakui tanda tangan elektronik pada kedua dokumen tersebut sebagai tanda tangan saya sendiri;<br/>
                3. bahwa sebelum memberikan persetujuan saya telah dapat membaca, mengunduh, dan mencetak naskah lengkap kedua dokumen tersebut;<br/>
                4. bahwa tanda tangan basah ini merupakan pengakuan atas persetujuan elektronik yang telah saya berikan, bukan perjanjian baru;<br/>
                5. bahwa saya mengetahui pembubuhan meterai bukan merupakan syarat sahnya perjanjian, dan kedua dokumen tersebut telah sah serta mengikat sejak persetujuan elektronik saya berikan.
              </p>
            </div>

            <table className="w-full border-collapse border border-slate-800 text-[10px] mb-6">
              <thead>
                <tr className="bg-slate-200">
                  <th className="border border-slate-800 p-1">No</th>
                  <th className="border border-slate-800 p-1">Nama Lengkap</th>
                  <th className="border border-slate-800 p-1">NIM</th>
                  <th className="border border-slate-800 p-1">No. Kamar</th>
                  <th className="border border-slate-800 p-1">Waktu OTP</th>
                  <th className="border border-slate-800 p-1 w-32">Tanda Tangan Basah</th>
                </tr>
              </thead>
              <tbody>
                {dummyRows.slice(0, 5).map((row) => (
                  <tr key={row.no}>
                    <td className="border border-slate-800 p-1 text-center">{row.no}</td>
                    <td className="border border-slate-800 p-1">{row.nama}</td>
                    <td className="border border-slate-800 p-1 text-center">{row.nim}</td>
                    <td className="border border-slate-800 p-1 text-center">{row.kamar}</td>
                    <td className="border border-slate-800 p-1 text-center font-mono text-[9px]">{row.waktuOtp}</td>
                    <td className="border border-slate-800 p-1 relative h-8">
                      <span className="absolute top-0.5 left-1 text-[8px] text-slate-400">{row.no}.</span>
                    </td>
                  </tr>
                ))}
                <tr>
                  <td colSpan={6} className="border border-slate-800 p-2 text-center text-[10px] italic text-slate-500">
                    ... (Baris 6 sampai 39 dipotong untuk preview) ...
                  </td>
                </tr>
                <tr>
                  <td className="border border-slate-800 p-1 text-center">40</td>
                  <td className="border border-slate-800 p-1">{dummyRows[39].nama}</td>
                  <td className="border border-slate-800 p-1 text-center">{dummyRows[39].nim}</td>
                  <td className="border border-slate-800 p-1 text-center">{dummyRows[39].kamar}</td>
                  <td className="border border-slate-800 p-1 text-center font-mono text-[9px]">{dummyRows[39].waktuOtp}</td>
                  <td className="border border-slate-800 p-1 relative h-8">
                    <span className="absolute top-0.5 left-1 text-[8px] text-slate-400">40.</span>
                  </td>
                </tr>
              </tbody>
            </table>

            <div className="grid grid-cols-2 gap-8 text-center mt-8">
              <div>
                <p>Petugas Loket,</p>
                <div className="h-16"></div>
                <p>( ........................................... )</p>
              </div>
              <div className="border border-slate-800 p-2 relative flex flex-col items-center justify-center min-h-[120px]">
                <div className="absolute top-0 left-0 w-full text-[9px] font-bold bg-slate-200 border-b border-slate-800 p-0.5">
                  TEMPAT PEMBUBUHAN<br/>1 (satu) METERAI Rp 10.000
                </div>
                <div className="mt-8">
                  <p>Mengesahkan,</p>
                  <p className="font-bold">KEPALA ASRAMA YAYASAN GLENI</p>
                  <div className="h-12"></div>
                  <p>( ........................................... )</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
