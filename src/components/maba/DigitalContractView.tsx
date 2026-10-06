import React, { useState, useRef, useEffect } from 'react';
import SignaturePad from 'react-signature-canvas';
import { 
  FileText, 
  ShieldCheck, 
  PenTool, 
  CheckCircle2, 
  AlertCircle, 
  Download, 
  Printer, 
  Clock, 
  Lock, 
  FileCheck, 
  Eye, 
  MessageCircle, 
  Scale, 
  ScrollText, 
  UserCheck, 
  KeyRound,
  RotateCcw,
  Sparkles,
  Ticket,
  ArrowRight,
  Edit3,
  Phone,
  HelpCircle,
  Smartphone,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';
import { MabaProfile, RoomPlot, BillingInvoice, DigitalContract } from '../../types/asrama';

interface Props {
  profile: MabaProfile;
  room?: RoomPlot;
  invoice: BillingInvoice;
  contract: DigitalContract;
  onUpdateContract: (contract: DigitalContract) => void;
  onAdvanceStep: () => void;
  onRequestProfileCorrection?: (note?: string) => void;
  onOpenWaSimulator?: () => void;
  otpSentMessage?: boolean;
  otpTimer?: number;
  onSendOtp?: () => void;
}

export const DigitalContractView: React.FC<Props> = ({
  profile,
  room,
  invoice,
  contract,
  onUpdateContract,
  onAdvanceStep,
  onRequestProfileCorrection,
  onOpenWaSimulator,
  otpSentMessage = false,
  otpTimer = 300,
  onSendOtp
}) => {
  // Document Viewing Tab
  const [activeDocTab, setActiveDocTab] = useState<'F19' | 'F02' | 'JUKLAK'>('F19');
  const [hasReadF19, setHasReadF19] = useState(false);
  const [hasReadF02, setHasReadF02] = useState(false);
  const [isAgreed, setIsAgreed] = useState(contract.status === 'SIGNED');

  // Sub-step inside Step 4:
  // 1: Review & Agree
  // 2: Electronic Signature (Canvas)
  // 3: OTP Authentication (Validate Phone & Sign Document)
  // 4: Completed (Signed & Certified)
  const [subStep, setSubStep] = useState<1 | 2 | 3 | 4>(() => {
    if (contract.status === 'SIGNED') return 4;
    if (contract.signatureData && contract.status === 'OTP_SENT') return 3;
    return 1;
  });

  // Draft signature stored between Sub-step 2 and Sub-step 3
  const [draftSignature, setDraftSignature] = useState<string | null>(contract.signatureData || null);
  
  // Local OTP inputs
  const [studentOtpInput, setStudentOtpInput] = useState('');
  const [parentOtpInput, setParentOtpInput] = useState('');
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [localOtpSent, setLocalOtpSent] = useState(otpSentMessage);
  const [localTimer, setLocalTimer] = useState(otpTimer);
  const [showFullContractModal, setShowFullContractModal] = useState(false);

  const signaturePadRef = useRef<SignaturePad | null>(null);

  const isParentElectronicOtp = profile.metodePersetujuanOrtu === 'ELEKTRONIK_OTP';

  // Synchronize local timer with props if provided
  useEffect(() => {
    setLocalOtpSent(otpSentMessage);
  }, [otpSentMessage]);

  useEffect(() => {
    setLocalTimer(otpTimer);
  }, [otpTimer]);

  useEffect(() => {
    if (contract.status === 'SIGNED') {
      setSubStep(4);
      setIsAgreed(true);
    }
  }, [contract.status]);

  // Contract and Pakta references
  const contractNumber = contract.contractId || `F-19/UPA/${new Date().getFullYear()}/${(profile.nim || '2026').slice(-4)}`;
  const paktaNumber = `F-02/UPA/${new Date().getFullYear()}/${(profile.nim || '2026').slice(-4)}`;
  const monthlyRent = invoice.biayaSewa && invoice.durasiBulan ? Math.round(invoice.biayaSewa / invoice.durasiBulan) : 500000;
  const depositText = invoice.isCicilanDeposit 
    ? `Rp ${invoice.biayaDepositTotal?.toLocaleString('id-ID')} (Dicicil ${invoice.opsiCicilan}x, Pembayaran Pertama: Rp ${invoice.biayaDeposit?.toLocaleString('id-ID')})`
    : `Rp ${invoice.biayaDeposit?.toLocaleString('id-ID')} (Lunas di Muka)`;

  // Scroll detection for reading verification
  const handleScrollDoc = (e: React.UIEvent<HTMLDivElement>, docType: 'F19' | 'F02') => {
    const target = e.currentTarget;
    if (target.scrollTop + target.clientHeight >= target.scrollHeight - 30) {
      if (docType === 'F19') setHasReadF19(true);
      if (docType === 'F02') setHasReadF02(true);
    }
  };

  const handleClearSignature = () => {
    if (signaturePadRef.current) {
      signaturePadRef.current.clear();
    }
    setDraftSignature(null);
  };

  // Sub-step 1 -> Sub-step 2
  const handleProceedToSignature = () => {
    if (!isAgreed) {
      toast.error('Silakan centang persetujuan seluruh klausul F-19 & F-02 terlebih dahulu.');
      return;
    }
    setSubStep(2);
    toast.success('Persetujuan dicatat. Silakan bubuhkan tanda tangan elektronik Anda pada kanvas.');
  };

  // Sub-step 2 -> Sub-step 3 (Save Canvas & Proceed to OTP)
  const handleSaveSignatureAndProceedToOtp = () => {
    if (!signaturePadRef.current || signaturePadRef.current.isEmpty()) {
      if (!draftSignature) {
        toast.error('Silakan bubuhkan tanda tangan Anda pada kanvas yang disediakan.');
        return;
      }
    }

    const sigData = signaturePadRef.current && !signaturePadRef.current.isEmpty()
      ? signaturePadRef.current.toDataURL('image/png')
      : draftSignature;

    if (!sigData) {
      toast.error('Goresan tanda tangan tidak ditemukan.');
      return;
    }

    setDraftSignature(sigData);
    setSubStep(3);
    
    // Automatically trigger OTP sending
    if (onSendOtp) {
      onSendOtp();
    } else {
      setLocalOtpSent(true);
    }

    toast.success('Tanda tangan elektronik disimpan sementara. Lanjutkan dengan otentikasi OTP WhatsApp untuk validasi nomor kontak.');
  };

  // Sub-step 3: Handle Verification of OTP
  const handleVerifyOtpAndFinalize = () => {
    if (studentOtpInput.length !== 6) {
      toast.error('Kode OTP Mahasiswa harus 6 digit angka.');
      return;
    }

    if (isParentElectronicOtp && parentOtpInput.length !== 6) {
      toast.error('Metode Elektronik Orang Tua aktif: Harap masukkan 6 digit Kode OTP Wali.');
      return;
    }

    // Validate OTP against simulation standard (Student: 123456, Parent: 654321 or any 6 digits for testing)
    setIsVerifyingOtp(true);

    setTimeout(() => {
      // Generate cryptographic hash (Simulated SHA-256 for legal trail per JUKLAK-02)
      const mockSha256 = Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      const signedContract: DigitalContract = {
        ...contract,
        contractId: contractNumber,
        signatureData: draftSignature || contract.signatureData,
        signedAt: new Date().toISOString(),
        status: 'SIGNED',
        documentHash: mockSha256,
        authMethod: isParentElectronicOtp 
          ? 'TTE-TT (Canvas Tanda Tangan + Dual-Factor OTP WhatsApp Mahasiswa & Wali)'
          : 'TTE-TT (Canvas Tanda Tangan + OTP WhatsApp Mahasiswa Terverifikasi)',
        signerIpAddress: '180.252.164.88 (ISP Verified)',
        retentionUntil: new Date(Date.now() + 5 * 365 * 24 * 60 * 60 * 1000).toISOString(), // 5 tahun per JUKLAK-02 Pasal 20
        otpVerified: true,
        parentOtpVerified: isParentElectronicOtp,
        parentSignedAt: isParentElectronicOtp ? new Date().toISOString() : undefined
      };

      setIsVerifyingOtp(false);
      onUpdateContract(signedContract);
      setSubStep(4);
      toast.success('Verifikasi OTP Berhasil! Kontrak Penghunian (F-19) & Pakta Integritas (F-02) telah sah secara hukum digital.');
    }, 1200);
  };

  const handlePrintDownloadSimulation = () => {
    toast.success('Mengunduh Salinan Digital F-19 & F-02 (PDF Dokumen Baku)...');
    setTimeout(() => {
      window.print();
    }, 500);
  };

  const handleTriggerCorrection = (note?: string) => {
    if (onRequestProfileCorrection) {
      onRequestProfileCorrection(note || 'Nomor HP/WhatsApp mahasiswa atau wali salah dan perlu diperbarui.');
    } else {
      toast.info('Silakan ajukan koreksi data kontak pada formulir Langkah 1.');
    }
  };

  return (
    <div id="step-4-panel" className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden space-y-0 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-indigo-950 p-6 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="bg-teal-400/20 text-teal-300 border border-teal-400/30 text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase tracking-wider">
              Standardisasi JUKLAK-02 & JUKLAK-03
            </span>
            <span className="bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-mono px-2 py-0.5 rounded font-bold">
              Dokumen Baku F-19 & F-02
            </span>
            <span className="bg-indigo-400/20 text-indigo-200 border border-indigo-400/30 text-[10px] font-mono px-2 py-0.5 rounded font-bold">
              TTE-TT + Otentikasi OTP
            </span>
          </div>
          <h3 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
            <PenTool className="w-5 h-5 text-teal-400" />
            <span>Tahap 4: Pengesahan Kontrak Penghunian & Pakta Integritas</span>
          </h3>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Alur pengesahan terpadu: Telaah Dokumen Baku, Pembubuhan Tanda Tangan Elektronik (Canvas), dan Otentikasi OTP WhatsApp untuk validasi nomor kontak terdaftar.
          </p>
        </div>

        {contract.status === 'SIGNED' ? (
          <div className="bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 px-4 py-2 rounded-xl flex items-center gap-2 shrink-0">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <div className="text-left">
              <span className="block text-xs font-bold leading-none">Dokumen Telah Sah</span>
              <span className="text-[10px] font-mono text-emerald-200/80">Ref: {contract.contractId || contractNumber}</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl border border-white/10 text-xs text-slate-300">
            <ShieldCheck className="w-4 h-4 text-teal-400" />
            <span>Alur: TTE &rarr; OTP &rarr; Pengesahan</span>
          </div>
        )}
      </div>

      {/* SUB-STEP PROGRESS BAR INSIDE STEP 4 */}
      <div className="bg-slate-50 border-b border-slate-200 px-6 py-3">
        <div className="flex items-center justify-between max-w-3xl mx-auto">
          {[
            { id: 1, label: '1. Telaah Naskah', desc: 'F-19 & F-02' },
            { id: 2, label: '2. Tanda Tangan', desc: 'Goresan Layar TTE' },
            { id: 3, label: '3. Otentikasi OTP', desc: 'Validasi No. WhatsApp' },
            { id: 4, label: '4. Dokumen Sah', desc: 'Selesai & Hash SHA-256' }
          ].map((st, idx) => {
            const isDone = subStep > st.id || contract.status === 'SIGNED';
            const isCurrent = subStep === st.id && contract.status !== 'SIGNED';
            return (
              <div key={st.id} className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={st.id > subStep && contract.status !== 'SIGNED'}
                  onClick={() => {
                    if (contract.status === 'SIGNED') return;
                    if (st.id < subStep) setSubStep(st.id as any);
                  }}
                  className={`flex items-center gap-2 text-left transition-all ${
                    isCurrent 
                      ? 'text-teal-900 font-bold' 
                      : isDone 
                      ? 'text-emerald-700 font-semibold cursor-pointer hover:opacity-80' 
                      : 'text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    isDone 
                      ? 'bg-emerald-600 text-white' 
                      : isCurrent 
                      ? 'bg-teal-700 text-white ring-2 ring-teal-300' 
                      : 'bg-slate-200 text-slate-500'
                  }`}>
                    {isDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : st.id}
                  </div>
                  <div className="hidden sm:block">
                    <div className="text-[11px] leading-tight font-bold">{st.label}</div>
                    <div className="text-[9px] text-slate-500">{st.desc}</div>
                  </div>
                </button>
                {idx < 3 && <ChevronRight className="w-3.5 h-3.5 text-slate-300 mx-1 hidden sm:block" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-6 space-y-6">
        
        {/* DOCUMENT TABS & VIEWERS (Always visible for review) */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setActiveDocTab('F19')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                  activeDocTab === 'F19'
                    ? 'bg-white text-teal-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ScrollText className="w-4 h-4 text-teal-600" />
                <span>F-19 Kontrak Penghunian</span>
                {hasReadF19 && <span className="w-2 h-2 rounded-full bg-emerald-500" title="Sudah dibaca" />}
              </button>
              <button
                type="button"
                onClick={() => setActiveDocTab('F02')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                  activeDocTab === 'F02'
                    ? 'bg-white text-teal-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                <span>F-02 Pakta Integritas</span>
                {hasReadF02 && <span className="w-2 h-2 rounded-full bg-emerald-500" title="Sudah dibaca" />}
              </button>
              <button
                type="button"
                onClick={() => setActiveDocTab('JUKLAK')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                  activeDocTab === 'JUKLAK'
                    ? 'bg-white text-teal-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Scale className="w-4 h-4 text-amber-600" />
                <span>Standar JUKLAK 2 & 3</span>
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Masa Sewa: <strong className="text-slate-800">{invoice.durasiBulan || 6} Bulan</strong> (Min. 6 Bulan)</span>
            </div>
          </div>

          {/* TAB 1: DOKUMEN F-19 */}
          {activeDocTab === 'F19' && (
            <div className="border border-slate-200 rounded-xl bg-slate-50/70 p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <span className="text-[11px] font-mono font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                    DOKUMEN BAKU F-19
                  </span>
                  <h4 className="text-base font-black text-slate-900 mt-1">KONTRAK PENGHUNIAN ASRAMA UBT</h4>
                  <p className="text-xs text-slate-500">Lampiran II Peraturan Ketua Yayasan Gleni / UPT Asrama UBT</p>
                </div>
                <div className="text-right text-xs font-mono text-slate-600 hidden sm:block">
                  <div>No. Reg: {contractNumber}</div>
                  <div>Status: {contract.status === 'SIGNED' ? 'TERCATAT & DISAHKAN' : 'DRAFT ELEKTRONIK'}</div>
                </div>
              </div>

              <div 
                onScroll={(e) => handleScrollDoc(e, 'F19')}
                className="h-72 overflow-y-auto pr-3 space-y-4 text-xs text-slate-700 custom-scrollbar bg-white p-5 rounded-lg border border-slate-200 leading-relaxed shadow-inner"
              >
                <div className="text-center pb-2 border-b border-slate-200">
                  <p className="font-bold text-slate-900 uppercase">KONTRAK PENGHUNIAN ASRAMA MAHASISWA</p>
                  <p className="text-[11px] text-slate-500">Nomor Registrasi: {contractNumber}</p>
                </div>

                <p>
                  Pada hari ini, disepakati perjanjian sewa-menyewa dan hak penghunian fasilitas Asrama Universitas Bunda Thamrin antara:
                </p>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1 text-xs">
                  <div><strong>1. Pihak Pertama (Pengelola):</strong> UPT Asrama Universitas Bunda Thamrin / Yayasan Gleni.</div>
                  <div><strong>2. Pihak Kedua (Penghuni):</strong> {profile.nama} | NIM: {profile.nim} | Prodi: {profile.prodi} ({profile.kategori || 'Reguler'}).</div>
                </div>

                <h5 className="font-bold text-slate-900 pt-2">Pasal 1: Objek Kamar & Durasi Hunian</h5>
                <p>
                  Pihak Pertama memberikan hak hunian kepada Pihak Kedua atas kamar asrama: <strong>{room?.gedung || 'Gedung A'} - Kamar {room?.nomorKamar || '204'}</strong> (Lantai {room?.lantai || 2}) dengan durasi komitmen kontrak hunian minimal <strong>{invoice.durasiBulan || 6} Bulan (1 Semester)</strong>.
                </p>

                <h5 className="font-bold text-slate-900 pt-2">Pasal 2: Biaya Sewa, Deposit, & Skema Pelunasan</h5>
                <p>
                  1. Total nilai kewajiban sewa kamar selama masa kontrak {invoice.durasiBulan || 6} bulan adalah sebesar <strong>Rp {(invoice.biayaSewaTotalKontrak || ((invoice.durasiBulan || 6) * (invoice.tarifPerBulan || 500000)))?.toLocaleString('id-ID')}</strong> (Tarif @ Rp {(invoice.tarifPerBulan || 500000)?.toLocaleString('id-ID')}/bulan).<br />
                  2. Skema pembayaran sewa: <strong>{(() => {
                    const durasiBayar = invoice.biayaSewa && invoice.tarifPerBulan ? Math.round(invoice.biayaSewa / invoice.tarifPerBulan) : (invoice.durasiBulan || 6);
                    const durasiKontrak = invoice.durasiBulan || 6;
                    if (durasiBayar >= durasiKontrak) {
                      return `Bayar Lunas di Muka (Rp ${invoice.biayaSewa?.toLocaleString('id-ID')} lunas penuh untuk ${durasiKontrak} bulan)`;
                    } else {
                      return `Bayar Bertahap (Tahap Awal: Rp ${invoice.biayaSewa?.toLocaleString('id-ID')} untuk ${durasiBayar} bulan awal; Sisa ${durasiKontrak - durasiBayar} bulan ditagihkan berkala setiap bulan)`;
                    }
                  })()}</strong>.<br />
                  3. Ketentuan uang jaminan (deposit): <strong>{depositText}</strong>.<br />
                  4. Biaya administrasi pendaftaran awal terdaftar sebesar <strong>Rp {invoice.biayaPerlengkapanAwal?.toLocaleString('id-ID')}</strong>.<br />
                  5. Seluruh kewajiban pembayaran tahap registrasi awal dinyatakan telah lunas diverifikasi (Status Invoice: <strong>{invoice.status}</strong>).
                </p>

                <h5 className="font-bold text-slate-900 pt-2">Pasal 3: Berita Acara Serah Terima Kamar (BASTK F-03)</h5>
                <p>
                  Pihak Kedua wajib melakukan inspeksi fisik kamar dan menandatangani Berita Acara Serah Terima Kamar (BASTK F-03) bersama staf asrama saat kedatangan di loket. Kerusakan yang timbul selama masa sewa akan dipotong dari uang deposit.
                </p>

                <h5 className="font-bold text-slate-900 pt-2">Pasal 4: Ketentuan Keterlambatan Sewa, Pengakhiran &amp; Sanksi</h5>
                <p>
                  1. <strong>Masa Toleransi Sewa (Grace Period)</strong>: Diberikan masa toleransi 5 (lima) hari kalender terhitung setelah tanggal jatuh tempo pembayaran sewa untuk melunasi tunggakan sewa secara mandiri tanpa sanksi denda keterlambatan (Denda Rp 0).<br />
                  2. <strong>Pemanfaatan Deposit untuk Tunggakan</strong>: Apabila lewat masa toleransi 5 hari sewa belum dilunasi, maka saldo deposit jaminan otomatis digunakan/dipotong untuk melunasi tunggakan sewa berjalan.<br />
                  3. <strong>Masa Toleransi Pemenuhan (Top-Up) Deposit</strong>: Penghuni diberikan tambahan toleransi selama 5 (lima) hari kalender berikutnya untuk menyetorkan kembali pemenuhan saldo deposit ke nominal semula.<br />
                  4. <strong>Wanprestasi &amp; Denda Keterlambatan</strong>: Apabila lewat batas toleransi kedua tersebut penghuni tetap tidak melakukan pemenuhan setoran deposit, maka penghuni dikenakan denda keterlambatan sebesar <strong>Rp 500.000,- (lima ratus ribu rupiah)</strong> serta <strong>kontrak tinggal berakhir</strong> (wajib melakukan pengosongan kamar).<br />
                  5. Penghuni yang mengundurkan diri sebelum masa kontrak berakhir tanpa persetujuan resmi tidak berhak atas pengembalian sisa uang sewa dan uang deposit dinyatakan hangus.
                </p>

                {!hasReadF19 && (
                  <div className="sticky bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white/95 to-transparent pt-6 pb-2 text-center text-xs font-bold text-teal-700 animate-pulse">
                    ↓ Gulir ke bawah untuk menyelesaikan pembacaan Dokumen F-19 ↓
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: DOKUMEN F-02 */}
          {activeDocTab === 'F02' && (
            <div className="border border-slate-200 rounded-xl bg-slate-50/70 p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <span className="text-[11px] font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                    DOKUMEN BAKU F-02
                  </span>
                  <h4 className="text-base font-black text-slate-900 mt-1">PAKTA INTEGRITAS TATA TERTIB ASRAMA</h4>
                  <p className="text-xs text-slate-500">Komitmen Disiplin, Keamanan, dan Norma Kehidupan Hunian Kampus</p>
                </div>
                <div className="text-right text-xs font-mono text-slate-600 hidden sm:block">
                  <div>No. Reg: {paktaNumber}</div>
                  <div>Kepatuhan: WAJIB DITAATI</div>
                </div>
              </div>

              <div 
                onScroll={(e) => handleScrollDoc(e, 'F02')}
                className="h-72 overflow-y-auto pr-3 space-y-4 text-xs text-slate-700 custom-scrollbar bg-white p-5 rounded-lg border border-slate-200 leading-relaxed shadow-inner"
              >
                <div className="text-center pb-2 border-b border-slate-200">
                  <p className="font-bold text-slate-900 uppercase">PAKTA INTEGRITAS TATA TERTIB & DISIPLIN ASRAMA</p>
                  <p className="text-[11px] text-slate-500">Nomor Registrasi: {paktaNumber}</p>
                </div>

                <p>
                  Dalam rangka mewujudkan lingkungan hunian kampus yang beradab, aman, dan kondusif bagi kegiatan akademik, saya yang bertanda tangan di bawah ini:
                </p>

                <div className="bg-indigo-50/50 p-3 rounded-lg border border-indigo-100 text-xs">
                  <strong>Nama:</strong> {profile.nama} | <strong>NIM:</strong> {profile.nim} | <strong>Kamar:</strong> {room?.gedung || 'Gedung A'} - {room?.nomorKamar || '204'}
                </div>

                <p className="font-bold text-slate-900">MENYATAKAN DAN BERJANJI DENGAN SUNGGUH-SUNGGUH UNTUK:</p>

                <ol className="list-decimal pl-5 space-y-2 text-slate-700">
                  <li>Mematuhi seluruh Peraturan dan Petunjuk Pelaksanaan Tata Tertib Asrama UBT yang berlaku.</li>
                  <li>Menjunjung tinggi kejujuran, etika kesusilaan, dan ketertiban umum dalam kehidupan asrama.</li>
                  <li><strong className="text-rose-700">TIDAK MEMBAWA, MENYIMPAN, MENGGUNAKAN, ATAU MENGEDARKAN NARKOBA</strong>, psikotropika, dan zat adiktif terlarang lainnya.</li>
                  <li><strong className="text-rose-700">TIDAK MEMBAWA SENJATA TAJAM/API</strong> atau bahan berbahaya yang mengancam keselamatan penghuni.</li>
                  <li><strong className="text-rose-700">TIDAK MENGONSUMSI MINUMAN BERALKOHOL / KERAS</strong> di dalam maupun di sekitar lingkungan asrama.</li>
                  <li><strong className="text-rose-700">TIDAK MELAKUKAN KEKERASAN FISIK, PELECEHAN SEKSUAL, BULLYING</strong>, atau intimidasi dalam bentuk apa pun.</li>
                  <li>Tidak melakukan perjudian dalam bentuk apa pun di lingkungan asrama.</li>
                  <li><strong className="text-amber-700">TIDAK MEROKOK ATAU MENGGUNAKAN ROKOK ELEKTRONIK (VAPE)</strong> di seluruh area asrama (Kawasan Tanpa Rokok).</li>
                  <li>Mematuhi ketentuan <strong>Jam Malam (Pukul 22.00 WITA)</strong> dan larangan menerima tamu lawan jenis di dalam kamar hunian.</li>
                  <li>Dilarang keras mengizinkan orang yang bukan penghuni resmi asrama untuk menginap di dalam kamar.</li>
                  <li>Menjaga kebersihan fasilitas bersama dan memelihara keutuhan inventaris kamar yang dipinjamkan.</li>
                  <li>Tidak mengubah konstruksi fisik, instalasi kelistrikan secara ilegal, atau memelihara hewan.</li>
                </ol>

                <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 text-rose-900 mt-4 space-y-1">
                  <span className="font-bold flex items-center gap-1.5 text-xs text-rose-800">
                    <AlertCircle className="w-4 h-4 text-rose-600" /> Sanksi Pelanggaran Berat:
                  </span>
                  <p className="text-[11px] leading-relaxed">
                    Pelanggaran terhadap larangan Narkoba, Senjata, Miras, Kekerasan, dan Asusila merupakan <strong>Pelanggaran Berat</strong> yang mengakibatkan <strong>Pemberhentian / Pengusiran Langsung tanpa pengembalian uang sewa</strong> dan uang deposit dinyatakan hangus.
                  </p>
                </div>

                {!hasReadF02 && (
                  <div className="sticky bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white/95 to-transparent pt-6 pb-2 text-center text-xs font-bold text-indigo-700 animate-pulse">
                    ↓ Gulir ke bawah untuk menyelesaikan pembacaan Dokumen F-02 ↓
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: STANDAR JUKLAK 2 & 3 */}
          {activeDocTab === 'JUKLAK' && (
            <div className="border border-slate-200 rounded-xl bg-slate-50/70 p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <span className="text-[11px] font-mono font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    STANDAR REGULASI RESMI
                  </span>
                  <h4 className="text-base font-black text-slate-900 mt-1">JUKLAK-02 & JUKLAK-03 SISTEM ASRAMA UBT</h4>
                  <p className="text-xs text-slate-500">Dasar Kepastian Hukum, Otonomi Layanan Mahasiswa, dan Jejak Audit Kriptografis</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
                  <h5 className="font-bold text-teal-900 flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-teal-600" />
                    JUKLAK-02: Sistem Informasi & TTE-TT
                  </h5>
                  <p className="text-slate-600 leading-relaxed">
                    Dokumen digital dihasilkan secara terenkripsi menggunakan Tanda Tangan Elektronik Tidak Tersertifikasi (TTE-TT) berlandaskan UU ITE Pasal 11 dan PP 71/2019. Keutuhan dokumen dijamin melalui <strong>Nilai Hash SHA-256</strong> yang dicatat dalam Jejak Audit permanen (masa retensi 5 tahun).
                  </p>
                  <div className="text-[11px] bg-slate-50 p-2 rounded text-slate-700 font-mono">
                    • 4 Jalur Persetujuan Wali (Tertulis, OTP, Video Call, KIP)<br/>
                    • Audit Trail: IP Address, Timestamp, SHA-256 Hash
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
                  <h5 className="font-bold text-indigo-900 flex items-center gap-2">
                    <Scale className="w-4 h-4 text-indigo-600" />
                    JUKLAK-03: Pengesahan & Ratifikasi Dokumen
                  </h5>
                  <p className="text-slate-600 leading-relaxed">
                    Menyediakan alur penandatanganan mandiri daring tanpa hambatan birokrasi. Seluruh persetujuan digital yang Anda bubuhkan di portal ini telah sah secara hukum dan diarsipkan secara terpusat oleh pengelola asrama.
                  </p>
                  <div className="text-[11px] bg-slate-50 p-2 rounded text-slate-700 font-mono">
                    • Mahasiswa Menandatangani di Portal Daring<br/>
                    • Penyerahan Kunci & Verifikasi Fisik saat Check-in
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ---------------------------------------------------- */}
        {/* INTERACTIVE WORKFLOW SECTIONS ACCORDING TO SUB-STEP */}
        {/* ---------------------------------------------------- */}

        {/* SUB-STEP 1: PERSETUJUAN KLAUSUL */}
        {subStep === 1 && contract.status !== 'SIGNED' && (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-5 animate-in fade-in duration-300">
            <div className="border-b border-slate-200 pb-3">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-teal-600" />
                <span>Langkah 4.1: Persetujuan Naskah Kontrak (F-19) & Pakta Integritas (F-02)</span>
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Pastikan Anda telah menelaah kedua dokumen di atas sebelum memberikan persetujuan hukum.
              </p>
            </div>

            <label className="flex items-start gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm cursor-pointer hover:border-teal-300 transition-colors">
              <input 
                type="checkbox" 
                id="contract-agreement-checkbox"
                checked={isAgreed}
                onChange={(e) => setIsAgreed(e.target.checked)}
                className="mt-1 w-5 h-5 text-teal-600 rounded border-slate-300 focus:ring-teal-500 cursor-pointer"
              />
              <div className="text-xs text-slate-800 leading-relaxed">
                <span className="font-bold block text-slate-900 mb-0.5">
                  Pernyataan Kesepakatan & Kepatuhan Hukum:
                </span>
                Saya menyatakan telah membaca, memahami, dan menyetujui seluruh klausul dalam <strong>F-19 Kontrak Penghunian Asrama</strong> dan <strong>F-02 Pakta Integritas Tata Tertib Asrama</strong> di atas. Saya bersedia mematuhi tata tertib dan menandatangani <strong>Lembar Ratifikasi Kolektif (F-22)</strong> saat tiba di loket asrama sesuai ketentuan <strong>JUKLAK-02 & JUKLAK-03</strong>.
              </div>
            </label>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleProceedToSignature}
                disabled={!isAgreed}
                className="bg-teal-700 hover:bg-teal-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold px-7 py-3 rounded-xl text-xs transition-all shadow-md flex items-center gap-2"
              >
                <span>Lanjut ke Pembubuhan Tanda Tangan Elektronik</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* SUB-STEP 2: GORESAN TANDA TANGAN ELEKTRONIK (CANVAS) */}
        {subStep === 2 && contract.status !== 'SIGNED' && (
          <div className="border-2 border-teal-200 bg-teal-50/30 rounded-2xl p-6 space-y-5 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-teal-100 pb-3">
              <div>
                <h4 className="text-sm font-bold text-teal-950 flex items-center gap-2">
                  <PenTool className="w-4 h-4 text-teal-700" />
                  <span>Langkah 4.2: Pembubuhan Tanda Tangan Elektronik (TTE)</span>
                </h4>
                <p className="text-xs text-teal-700/80 mt-0.5">
                  Bubuhkan tanda tangan Anda pada kanvas digital di bawah ini menggunakan jari atau kursor.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSubStep(1)}
                className="text-xs text-slate-500 hover:text-slate-800 font-semibold"
              >
                &larr; Kembali ke Telaah Dokumen
              </button>
            </div>

            <div className="max-w-xl mx-auto space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-700">
                  Kanvas Tanda Tangan Digital Mahasiswa:
                </span>
                <button 
                  type="button"
                  onClick={handleClearSignature} 
                  className="text-rose-600 font-bold hover:bg-rose-50 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Hapus Ulang (Clear)
                </button>
              </div>

              <div className="border-2 border-slate-300 rounded-xl bg-white overflow-hidden cursor-crosshair touch-none shadow-sm">
                <SignaturePad
                  ref={signaturePadRef}
                  canvasProps={{
                    className: 'w-full h-44 bg-white',
                  }}
                />
              </div>

              <div className="bg-white/80 p-3 rounded-xl border border-teal-200 text-xs text-slate-600 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-teal-700 shrink-0" />
                <span>
                  Setelah goresan tanda tangan disimpan, sistem akan melanjutkan ke <strong>Langkah 4.3 (Otentikasi OTP WhatsApp)</strong> untuk memverifikasi keaktifan nomor HP Anda.
                </span>
              </div>

              <div className="flex justify-center pt-2">
                <button
                  type="button"
                  onClick={handleSaveSignatureAndProceedToOtp}
                  className="bg-teal-700 hover:bg-teal-800 text-white font-bold px-8 py-3 rounded-xl text-xs transition-all shadow-md flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Simpan TTD & Lanjut Validasi OTP WhatsApp</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SUB-STEP 3: OTENTIKASI OTP WHATSAPP (VALIDASI NO HP & PENGESAHAN DOKUMEN) */}
        {subStep === 3 && contract.status !== 'SIGNED' && (
          <div className="border-2 border-indigo-200 bg-indigo-50/30 rounded-2xl p-6 space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-indigo-100 pb-3">
              <div>
                <h4 className="text-sm font-bold text-indigo-950 flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-indigo-700" />
                  <span>Langkah 4.3: Otentikasi OTP & Validasi Nomor WhatsApp Terdaftar</span>
                </h4>
                <p className="text-xs text-indigo-700/80 mt-0.5">
                  Sesuai JUKLAK-02 Pasal 16, otentikasi OTP dilakukan setelah TTE untuk memastikan nomor kontak Anda aktif dan valid.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSubStep(2)}
                className="text-xs text-slate-500 hover:text-slate-800 font-semibold"
              >
                &larr; Ubah Tanda Tangan
              </button>
            </div>

            {/* REGISTERED PHONE NUMBER STATUS CARD */}
            <div className="bg-white rounded-xl border border-indigo-100 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-indigo-600" /> Nomor Kontak Terdaftar dalam Sistem:
                </span>
                <span className="bg-indigo-50 text-indigo-700 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-indigo-200">
                  JUKLAK-02 Pasal 16
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Student Phone */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">WhatsApp Mahasiswa (Penyewa)</span>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900 font-mono flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-emerald-600" />
                      {profile.noHpWa || '0812-3456-7890'}
                    </span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">TERDAFTAR</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1.5">
                    Kode OTP pengesahan kontrak (6-digit) dikirimkan ke nomor ini.
                  </p>
                </div>

                {/* Guardian Info depending on profile.metodePersetujuanOrtu */}
                <div className={`p-4 rounded-xl border ${
                  isParentElectronicOtp 
                    ? 'bg-amber-50/70 border-amber-200' 
                    : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">Metode Persetujuan Orang Tua/Wali</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      isParentElectronicOtp 
                        ? 'bg-amber-100 text-amber-900 border border-amber-300' 
                        : 'bg-slate-200 text-slate-700'
                    }`}>
                      {profile.metodePersetujuanOrtu || 'TERTULIS_F20'}
                    </span>
                  </div>

                  {isParentElectronicOtp ? (
                    <div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="font-bold text-sm text-amber-950 font-mono flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-amber-600" />
                          {profile.kontakDaruratNoHp || '0813-9876-5432'}
                        </span>
                        <span className="text-[10px] bg-amber-200/80 text-amber-900 px-1.5 py-0.5 rounded font-bold">OTP WALI AKTIF</span>
                      </div>
                      <p className="text-[10px] text-amber-800 mt-1.5 leading-relaxed">
                        <strong>Persetujuan Elektronik Portal:</strong> Tahap ini adalah saat paling tepat bagi Wali memvalidasi kontrak final melalui OTP 6-digit ke nomor di atas.
                      </p>
                    </div>
                  ) : (
                    <div>
                      <span className="font-semibold text-xs text-slate-800 block mt-1">
                        {profile.metodePersetujuanOrtu === 'TERTULIS_F20' && 'Dokumen Fisik Formulir F-20'}
                        {profile.metodePersetujuanOrtu === 'VIDEO_CALL' && 'Verifikasi Jarak Jauh (Video Call Petugas)'}
                        {profile.metodePersetujuanOrtu === 'REUSE_KIP' && 'Dokumen Pernyataan Beasiswa KIP-K'}
                        {!profile.metodePersetujuanOrtu && 'Dokumen Fisik Formulir F-20'}
                      </span>
                      <p className="text-[10px] text-slate-500 mt-1.5 leading-relaxed">
                        {profile.metodePersetujuanOrtu === 'TERTULIS_F20' 
                          ? 'Wali menandatangani formulir fisik F-20 untuk diserahkan saat check-in di loket. OTP Tahap 4 hanya fokus ke Mahasiswa.'
                          : 'Persetujuan wali diverifikasi melalui kanal yang dipilih. OTP Tahap 4 memvalidasi nomor kontak Mahasiswa.'}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* WARNING & DIRECT MODIFICATION TRIGGER */}
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-rose-900 leading-relaxed">
                    <span className="font-bold block">Nomor WhatsApp salah, tidak aktif, atau ingin diganti?</span>
                    Sesuai JUKLAK-02 Pasal 39 Ayat 11b, pengesahan memerlukan nomor WhatsApp valid. Jika nomor salah, ajukan modifikasi data profil agar admin dapat memperbaruinya.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleTriggerCorrection('Nomor HP/WhatsApp Mahasiswa atau Wali salah dan perlu diperbaiki sebelum pengesahan kontrak.')}
                  className="bg-white border border-rose-300 hover:bg-rose-100 text-rose-800 text-xs font-bold px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap shadow-sm flex items-center gap-1.5 shrink-0"
                >
                  <Edit3 className="w-3.5 h-3.5 text-rose-600" />
                  <span>Ajukan Modifikasi Data Kontak</span>
                </button>
              </div>
            </div>

            {/* OTP INPUT & VERIFICATION FORM */}
            <div className="bg-white rounded-xl border border-indigo-200 p-6 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h5 className="font-bold text-slate-900 text-sm">Masukkan Kode OTP Pengesahan Kontrak</h5>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {isParentElectronicOtp 
                      ? 'Masukkan 6-digit kode OTP Mahasiswa dan 6-digit kode OTP Wali.' 
                      : 'Masukkan 6-digit kode OTP Mahasiswa yang dikirimkan via WhatsApp.'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (onSendOtp) onSendOtp();
                      else setLocalOtpSent(true);
                      toast.success('Kode OTP 6-Digit baru telah dikirimkan ulang via WhatsApp.');
                    }}
                    className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Kirim Ulang OTP
                  </button>

                  <button
                    type="button"
                    onClick={onOpenWaSimulator}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-1.5 rounded-lg transition-colors shadow-sm flex items-center gap-1.5"
                  >
                    <MessageCircle className="w-3.5 h-3.5" /> Buka Simulator WhatsApp
                  </button>
                </div>
              </div>

              {/* OTP Fields Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                {/* Field 1: OTP Mahasiswa */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                      OTP Mahasiswa (6-Digit) *
                    </label>
                    <span className="text-[10px] text-slate-500 font-mono">Simulasi: 123456</span>
                  </div>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="123456"
                    value={studentOtpInput}
                    onChange={(e) => setStudentOtpInput(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-900 font-black tracking-[0.4em] text-center focus:ring-2 focus:ring-teal-500 text-lg shadow-inner"
                  />
                  <div className="flex justify-between items-center text-[10px] text-slate-500 pt-1">
                    <span>Ke: {profile.noHpWa || '0812-3456-7890'}</span>
                    <button 
                      type="button" 
                      onClick={() => setStudentOtpInput('123456')}
                      className="text-teal-700 font-bold hover:underline"
                    >
                      Isi Cepat (123456)
                    </button>
                  </div>
                </div>

                {/* Field 2: OTP Wali (If Electronic OTP Method Selected) */}
                {isParentElectronicOtp ? (
                  <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-200 space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-amber-950 uppercase tracking-wider block">
                        OTP Orang Tua / Wali (6-Digit) *
                      </label>
                      <span className="text-[10px] text-amber-700 font-mono">Simulasi: 654321</span>
                    </div>
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="654321"
                      value={parentOtpInput}
                      onChange={(e) => setParentOtpInput(e.target.value.replace(/\D/g, ''))}
                      className="w-full bg-white border border-amber-300 rounded-xl px-4 py-3 text-slate-900 font-black tracking-[0.4em] text-center focus:ring-2 focus:ring-amber-500 text-lg shadow-inner"
                    />
                    <div className="flex justify-between items-center text-[10px] text-amber-800 pt-1">
                      <span>Ke: {profile.kontakDaruratNoHp || '0813-9876-5432'}</span>
                      <button 
                        type="button" 
                        onClick={() => setParentOtpInput('654321')}
                        className="text-amber-900 font-bold hover:underline"
                      >
                        Isi Cepat (654321)
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Info card when Guardian uses non-electronic method */
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col justify-center space-y-2">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      Status Persetujuan Wali: Terjadwal
                    </span>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Persetujuan wali menggunakan <strong>{profile.metodePersetujuanOrtu || 'Dokumen Fisik F-20'}</strong>. Anda cukup memasukkan OTP Mahasiswa untuk mengesahkan TTE di portal.
                    </p>
                  </div>
                )}
              </div>

              {/* Submit OTP Verification Button */}
              <div className="flex justify-center pt-2">
                <button
                  type="button"
                  disabled={isVerifyingOtp || studentOtpInput.length !== 6 || (isParentElectronicOtp && parentOtpInput.length !== 6)}
                  onClick={handleVerifyOtpAndFinalize}
                  className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold px-10 py-3.5 rounded-xl text-sm transition-all shadow-lg flex items-center gap-2"
                >
                  {isVerifyingOtp ? (
                    <>
                      <Sparkles className="w-4 h-4 animate-spin" />
                      <span>Memverifikasi Hash OTP & Menerbitkan Dokumen...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-5 h-5" />
                      <span>Verifikasi OTP & Sahkan Dokumen F-19/F-02</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SUB-STEP 4: STATE DOKUMEN TELAH SAH (SIGNED) */}
        {contract.status === 'SIGNED' && (
          <div className="bg-emerald-50/70 border-2 border-emerald-300 rounded-2xl p-6 space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-emerald-200 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-base font-black text-emerald-950">
                    Dokumen F-19 & F-02 Telah Disahkan Secara Digital (Sah)
                  </h4>
                  <p className="text-xs text-emerald-700">
                    Tanda Tangan Elektronik Sah berstandar UU ITE, JUKLAK-02, & Terverifikasi OTP WhatsApp
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrintDownloadSimulation}
                  className="bg-white border border-emerald-300 hover:bg-emerald-100 text-emerald-900 text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowFullContractModal(true)}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Lihat Naskah Lengkap</span>
                </button>
              </div>
            </div>

            {/* Signature Display & Cryptographic Audit Trail */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-sm flex flex-col items-center justify-center text-center">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Tanda Tangan Digital Penghuni
                </span>
                {contract.signatureData ? (
                  <div className="border border-slate-200 rounded-lg p-2 bg-slate-50 w-full max-w-xs flex justify-center items-center">
                    <img src={contract.signatureData} alt="Tanda Tangan Digital" className="h-24 object-contain" />
                  </div>
                ) : (
                  <div className="bg-emerald-50 text-emerald-800 p-3 rounded-lg text-xs font-mono border border-emerald-200">
                    <CheckCircle2 className="w-5 h-5 mx-auto mb-1 text-emerald-600" />
                    Otentikasi OTP WhatsApp Terverifikasi
                  </div>
                )}
                <span className="text-xs font-bold text-slate-900 mt-2">{profile.nama}</span>
                <span className="text-[10px] text-slate-500 font-mono">NIM: {profile.nim}</span>
                <div className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3" /> OTP No. {profile.noHpWa || 'Terdaftar'} Terverifikasi
                </div>
              </div>

              <div className="bg-slate-900 text-slate-200 p-4 rounded-xl font-mono text-[11px] space-y-1.5 border border-slate-800 shadow-inner">
                <div className="text-emerald-400 font-bold flex items-center justify-between border-b border-slate-800 pb-1 text-xs">
                  <span>JEJAK AUDIT TTE (JUKLAK-02):</span>
                  <span className="text-[10px] bg-emerald-500/20 px-1.5 py-0.5 rounded text-emerald-300">VALID</span>
                </div>
                <div><span className="text-slate-400">ID Dokumen  :</span> {contract.contractId || contractNumber}</div>
                <div><span className="text-slate-400">Metode TTE  :</span> {contract.authMethod || 'TTE-TT Digital Signature'}</div>
                <div><span className="text-slate-400">Waktu Server:</span> {contract.signedAt ? new Date(contract.signedAt).toLocaleString('id-ID') : new Date().toLocaleString('id-ID')}</div>
                <div><span className="text-slate-400">IP Signer   :</span> {contract.signerIpAddress || '180.252.164.88 (Verified)'}</div>
                <div><span className="text-slate-400">Retensi Doc :</span> s.d. {new Date(Date.now() + 5 * 365 * 24 * 60 * 60 * 1000).toLocaleDateString('id-ID')} (5 Tahun)</div>
                <div className="pt-1 border-t border-slate-800 break-all text-[10px]">
                  <span className="text-slate-400 block">SHA-256 Hash Digest:</span>
                  <span className="text-teal-300">{contract.documentHash || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* BOTTOM STEP NAVIGATION */}
        <div className="flex justify-between items-center pt-4 border-t border-slate-200">
          <div className="text-xs text-slate-500">
            {contract.status === 'SIGNED' ? (
              <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Dokumen Disahkan — Siap Melanjutkan ke Penerbitan e-Ticket
              </span>
            ) : (
              <span>Selesaikan seluruh tahapan TTE & Verifikasi OTP di atas untuk melanjutkan ke Tahap 5</span>
            )}
          </div>

          <button
            type="button"
            onClick={onAdvanceStep}
            disabled={contract.status !== 'SIGNED'}
            className={`font-bold px-7 py-3 rounded-xl text-sm transition-all shadow-md flex items-center space-x-2 ${
              contract.status === 'SIGNED'
                ? 'bg-teal-700 hover:bg-teal-800 text-white shadow-teal-700/20'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <span>Lanjut Penerbitan e-Ticket (Step 5)</span>
            <Ticket className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* FULL CONTRACT MODAL PREVIEW */}
      {showFullContractModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-teal-400" />
                <h4 className="font-bold text-sm">Salinan Dokumen Baku F-19 & F-02 (Tersertifikasi Digital)</h4>
              </div>
              <button 
                onClick={() => setShowFullContractModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-800 leading-relaxed custom-scrollbar">
              <div className="text-center border-b pb-4">
                <h3 className="font-black text-base text-slate-900">KONTRAK PENGHUNIAN ASRAMA (F-19)</h3>
                <p className="text-slate-500 font-mono">No. Registrasi: {contract.contractId || contractNumber}</p>
                <div className="mt-2 inline-block bg-emerald-50 text-emerald-800 text-[10px] font-mono font-bold px-3 py-1 rounded-full border border-emerald-200">
                  SHA-256 Digest: {contract.documentHash || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'}
                </div>
              </div>

              <div className="space-y-3">
                <p><strong>Penyewa / Penghuni:</strong> {profile.nama} ({profile.nim})</p>
                <p><strong>Lokasi Kamar:</strong> {room?.gedung || 'Gedung A'} - Kamar {room?.nomorKamar || '204'} (Lantai {room?.lantai || 2})</p>
                <p><strong>Durasi Kontrak:</strong> {invoice.durasiBulan || 6} Bulan | Masa Berlaku: s.d. Akhir Semester</p>
                <p><strong>Total Tagihan Awal:</strong> Rp {invoice.totalBayar?.toLocaleString('id-ID')} (LUNAS)</p>
                <p><strong>Nomor WhatsApp Terverifikasi:</strong> {profile.noHpWa || 'Terdaftar'}</p>
                {isParentElectronicOtp && (
                  <p><strong>Nomor WhatsApp Wali Terverifikasi:</strong> {profile.kontakDaruratNoHp || 'Terdaftar'}</p>
                )}
              </div>

              <div className="border-t pt-4 space-y-2">
                <h4 className="font-bold text-slate-900">PENGESAHAN DOKUMEN (TTE-TT):</h4>
                <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Pihak Kedua (Penghuni)</span>
                    <span className="font-bold text-slate-900">{profile.nama}</span>
                    <span className="text-[10px] text-emerald-700 block mt-1">Disahkan: {contract.signedAt ? new Date(contract.signedAt).toLocaleString('id-ID') : new Date().toLocaleString('id-ID')}</span>
                  </div>
                  {contract.signatureData && (
                    <img src={contract.signatureData} alt="Tanda Tangan" className="h-16 object-contain" />
                  )}
                </div>
              </div>

              <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 text-[11px] text-amber-900">
                <strong>Catatan JUKLAK-03:</strong> Tanda tangan basah fisik akan dibubuhkan pada Daftar Ratifikasi Kontrak Kolektif (F-22) saat kedatangan di loket Asrama UBT untuk penyerahan kunci kamar fisik.
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={handlePrintDownloadSimulation}
                className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" /> Cetak Dokumen
              </button>
              <button
                type="button"
                onClick={() => setShowFullContractModal(false)}
                className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2 rounded-lg text-xs font-bold"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
