import React, { useState, useRef, useEffect } from 'react';
import { 
  ShieldCheck, 
  LogIn, 
  Sparkles, 
  KeyRound, 
  AlertCircle, 
  ArrowRight, 
  CheckCircle2, 
  Database, 
  AlertTriangle, 
  Building, 
  RefreshCw, 
  X, 
  Loader2, 
  Link2, 
  GraduationCap, 
  Info,
  Search,
  User,
  Calendar,
  BadgeCheck,
  Check
} from 'lucide-react';
import { toast } from 'sonner';
import { UserRole, SimabaStudent, SiakadMahasiswaStgRecord } from '../../types/asrama';
import { INITIAL_SIAKAD_STAGING, INITIAL_SIMABA_STUDENTS } from '../../data/initialData';

interface LoginDualTabProps {
  onLoginSuccess: (role: UserRole, nim: string, nama: string, notice?: string, scenario?: string) => void;
  siakadStaging?: SiakadMahasiswaStgRecord[];
}

export const LoginDualTab: React.FC<LoginDualTabProps> = ({ onLoginSuccess, siakadStaging }) => {
  const [viewMode, setViewMode] = useState<'main' | 'sso'>('main');
  const [showPmbModal, setShowPmbModal] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleOpenPmb = () => {
    setShowPmbModal(true);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4500);
  };
  const [isRedirectingSso, setIsRedirectingSso] = useState(false);

  // Form State Maba (Terkoneksi ke Data SIMABA)
  const [pmbNoReg, setPmbNoReg] = useState('260108001'); // Default: GRACE MARLIN TELAUMBANUA
  const [debouncedSearch, setDebouncedSearch] = useState('260108001');
  const [isSearching, setIsSearching] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState<number>(-1);
  const [mabaBirthDate, setMabaBirthDate] = useState('12/02/2008'); // Format DD/MM/YYYY
  const [showNameSuggestions, setShowNameSuggestions] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(
    INITIAL_SIMABA_STUDENTS.find(s => s.nomor_pendaftaran === '260108001') || null
  );
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Close auto-suggest dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowNameSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search state (200ms) untuk responsivitas instan tanpa jitter
  useEffect(() => {
    if (selectedStudent && pmbNoReg === selectedStudent.nomor_pendaftaran) {
      setDebouncedSearch(pmbNoReg);
      setIsSearching(false);
      return;
    }

    if (pmbNoReg.trim().length >= 2) {
      setIsSearching(true);
    } else {
      setIsSearching(false);
    }

    const timer = setTimeout(() => {
      setDebouncedSearch(pmbNoReg);
      setIsSearching(false);
      setActiveSuggestionIndex(-1);
    }, 200);

    return () => clearTimeout(timer);
  }, [pmbNoReg, selectedStudent]);

  // Filter kandidat mahasiswa dari SIMABA dan SIAKAD/SIDARA berdasarkan debounced search query
  const effectiveSiakad = React.useMemo(() => {
    return siakadStaging && siakadStaging.length > 0 ? siakadStaging : INITIAL_SIAKAD_STAGING;
  }, [siakadStaging]);

  const allCandidateStudents = React.useMemo(() => {
    const fromSimaba = INITIAL_SIMABA_STUDENTS.map(s => ({
      ...s,
      source: 'SIMABA' as const
    }));

    const fromSiakad = effectiveSiakad.filter(
      stg => !INITIAL_SIMABA_STUDENTS.some(sim => sim.nomor_pendaftaran === stg.nomor_registrasi)
    ).map(stg => ({
      id: stg.id + 10000,
      nomor_pendaftaran: stg.nomor_registrasi,
      nama_mahasiswa: stg.nama_lengkap,
      nik: stg.nik,
      tempat_lahir: stg.tempat_lahir || 'TARAKAN',
      tanggal_lahir: stg.tanggal_lahir || '2006-01-01',
      tanggal_lahir_formatted: stg.tanggal_lahir
        ? `${stg.tanggal_lahir.slice(8, 10)}/${stg.tanggal_lahir.slice(5, 7)}/${stg.tanggal_lahir.slice(0, 4)}`
        : '15/04/2005',
      jenis_kelamin: (stg.jenis_kelamin || 'L') as 'L' | 'P',
      program_studi_id: 1,
      program_studi: stg.program_studi || 'Teknik',
      jenis_mahasiswa: (stg.kategori_beasiswa === 'kip' ? 'kip' : 'nonkip') as 'kip' | 'nonkip',
      nomorkip: stg.nomorkip,
      no_hp: stg.nomor_telepon,
      email: stg.email,
      alamat: stg.alamat_lengkap,
      source: 'SIDARA' as const
    }));

    return [...fromSimaba, ...fromSiakad];
  }, [effectiveSiakad]);

  const filteredStudents = debouncedSearch.trim().length >= 2
    ? allCandidateStudents.filter((s) => {
        const query = debouncedSearch.trim().toLowerCase();
        return (
          s.nama_mahasiswa.toLowerCase().includes(query) ||
          s.nomor_pendaftaran.toLowerCase().includes(query) ||
          (s.nik && s.nik.includes(query)) ||
          s.program_studi.toLowerCase().includes(query)
        );
      }).slice(0, 8)
    : [];

  // Helper untuk menyorot bagian teks yang cocok dengan kata kunci pencarian
  const highlightMatch = (text: string, query: string) => {
    const q = query.trim();
    if (!q || q.length < 2) return text;
    try {
      const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(${escaped})`, 'gi');
      const parts = text.split(regex);
      return parts.map((part, idx) =>
        regex.test(part) ? (
          <mark key={idx} className="bg-teal-100 text-teal-950 font-black rounded-xs px-0.5">
            {part}
          </mark>
        ) : (
          part
        )
      );
    } catch {
      return text;
    }
  };

  // Navigasi Keyboard: Panah Atas (↑), Panah Bawah (↓), Enter untuk Pilih, Escape untuk Tutup
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showNameSuggestions || filteredStudents.length === 0) {
      if (e.key === 'ArrowDown' && pmbNoReg.trim().length >= 2 && !selectedStudent) {
        setShowNameSuggestions(true);
        setActiveSuggestionIndex(0);
        e.preventDefault();
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveSuggestionIndex((prev) => {
        const next = prev < filteredStudents.length - 1 ? prev + 1 : 0;
        const el = document.getElementById(`suggestion-item-${next}`);
        el?.scrollIntoView({ block: 'nearest' });
        return next;
      });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveSuggestionIndex((prev) => {
        const next = prev > 0 ? prev - 1 : filteredStudents.length - 1;
        const el = document.getElementById(`suggestion-item-${next}`);
        el?.scrollIntoView({ block: 'nearest' });
        return next;
      });
    } else if (e.key === 'Enter') {
      if (activeSuggestionIndex >= 0 && activeSuggestionIndex < filteredStudents.length) {
        e.preventDefault();
        handleSelectStudent(filteredStudents[activeSuggestionIndex]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setShowNameSuggestions(false);
      setActiveSuggestionIndex(-1);
    }
  };

  // Helper untuk formatting otomatis DD/MM/YYYY pada input tanggal lahir
  const handleBirthDateChange = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 8);
    let formatted = '';
    if (digits.length <= 2) {
      formatted = digits;
    } else if (digits.length <= 4) {
      formatted = `${digits.slice(0, 2)}/${digits.slice(2)}`;
    } else {
      formatted = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
    }
    setMabaBirthDate(formatted);
  };

  const handleSelectStudent = (student: any) => {
    setSelectedStudent(student);
    setPmbNoReg(student.nomor_pendaftaran);
    setDebouncedSearch(student.nomor_pendaftaran);
    setMabaBirthDate(student.tanggal_lahir_formatted || '15/04/2005');
    setShowNameSuggestions(false);
    setActiveSuggestionIndex(-1);
    setIsSearching(false);
    setErrorMessage('');
    toast.success(`Data terpilih: ${student.nama_mahasiswa} (${student.nomor_pendaftaran})`, { duration: 3000 });
  };

  const handleResetSelectedStudent = () => {
    setSelectedStudent(null);
    setPmbNoReg('');
    setDebouncedSearch('');
    setMabaBirthDate('');
    setShowNameSuggestions(false);
    setActiveSuggestionIndex(-1);
    setIsSearching(false);
  };

  // Form State SSO Eksisting
  const [ssoUsername, setSsoUsername] = useState('2240101088'); // Default to Non-Active Resident (Ahmad Zaky)
  const [ssoPassword, setSsoPassword] = useState('••••••••••••');
  const [selectedSsoAccount, setSelectedSsoAccount] = useState<
    'NON_ACTIVE_COMPLETE' | 'NON_ACTIVE_INCOMPLETE' | 'ACTIVE_RESIDENT' | 'OFFICIAL_NIM_MIGRATED' | 'ACTIVE_RESIDENT_INSTALLMENT' | 'ACTIVE_RESIDENT_RENEWAL'
  >('NON_ACTIVE_COMPLETE');

  // Database Verification Overlay/Modal state
  const [isCheckingSsoDb, setIsCheckingSsoDb] = useState(false);
  const [ssoCheckStep, setSsoCheckStep] = useState<number>(0); // 0 = idle, 1 = SSO auth, 2 = DB query, 3 = Evaluated
  const [showRedirectModal, setShowRedirectModal] = useState<boolean>(false);
  const [showPolicyModal, setShowPolicyModal] = useState<boolean>(false);
  const [showNimDetectedModal, setShowNimDetectedModal] = useState<boolean>(false);
  const [detectedNimStudent, setDetectedNimStudent] = useState<any>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedScenario, setSelectedScenario] = useState<'NEW' | 'INVOICE_FORMED'>('NEW');

  const handleSsoRedirectClick = () => {
    setIsRedirectingSso(true);
    setTimeout(() => {
      setIsRedirectingSso(false);
      setViewMode('sso');
    }, 1200); // Simulate network delay/redirect
  };

  const handleMabaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    setTimeout(() => {
      setIsLoading(false);
      const cleanReg = pmbNoReg.trim();
      const cleanBirth = mabaBirthDate.trim();

      if (cleanReg.length < 3) {
        setErrorMessage('Nomor Registrasi PMB atau Nama Calon Mahasiswa tidak boleh kosong.');
        return;
      }

      if (cleanBirth.length < 8) {
        setErrorMessage('Format Tanggal Lahir harus lengkap DD/MM/YYYY (Contoh: 12/02/2008).');
        return;
      }

      // Konversi DD/MM/YYYY ke YYYY-MM-DD untuk pencocokan standar ISO
      const dateParts = cleanBirth.split(/[\/\-]/);
      let birthIso = '';
      if (dateParts.length === 3) {
        if (dateParts[0].length === 4) {
          birthIso = `${dateParts[0]}-${dateParts[1].padStart(2, '0')}-${dateParts[2].padStart(2, '0')}`;
        } else {
          birthIso = `${dateParts[2]}-${dateParts[1].padStart(2, '0')}-${dateParts[0].padStart(2, '0')}`;
        }
      }

      // 1. Cari kecocokan di Basis Data SIMABA (pendaftaranmahasiswa)
      const simabaMatch = INITIAL_SIMABA_STUDENTS.find(
        (s) =>
          s.nomor_pendaftaran.toLowerCase() === cleanReg.toLowerCase() ||
          s.nama_mahasiswa.toLowerCase() === cleanReg.toLowerCase() ||
          (s.nik && s.nik === cleanReg)
      );

      // 2. Cari di SIAKAD Staging
      const siakadMatch = effectiveSiakad.find(
        (s) =>
          s.nomor_registrasi.toLowerCase() === cleanReg.toLowerCase() ||
          (s.nik && s.nik === cleanReg) ||
          (simabaMatch && s.nomor_registrasi === simabaMatch.nomor_pendaftaran)
      );

      // Deteksi jika yang dimasukkan adalah NIM Mahasiswa Eksisting (Angkatan <= 2025)
      const isExistingStudentNim = /^(22|23|24|25)\d{4,8}$/.test(cleanReg);
      if (isExistingStudentNim) {
        setErrorMessage(`Nomor ${cleanReg} teridentifikasi sebagai NIM Mahasiswa Eksisting UBT. Silakan gunakan tab 'Akun SSO Mahasiswa' untuk login dan proses pendaftaran kamar asrama.`);
        return;
      }

      if (!simabaMatch && !siakadMatch) {
        setErrorMessage(`Nomor Pendaftaran atau Nama "${cleanReg}" tidak ditemukan di database SIMABA maupun SIAKAD UBT. Ketik minimal 2 huruf nama untuk mencari.`);
        return;
      }

      // Verifikasi Tanggal Lahir terhadap database SIMABA atau SIAKAD Staging
      if (simabaMatch) {
        const matchIso = simabaMatch.tanggal_lahir === birthIso;
        const matchFormatted = simabaMatch.tanggal_lahir_formatted === cleanBirth;
        if (!matchIso && !matchFormatted) {
          setErrorMessage(`Kombinasi data "${simabaMatch.nama_mahasiswa}" dan Tanggal Lahir (${cleanBirth}) tidak cocok dengan database SIMABA.`);
          return;
        }
      } else if (siakadMatch && siakadMatch.tanggal_lahir) {
        const matchIso = siakadMatch.tanggal_lahir === birthIso;
        const formattedSiakad = `${siakadMatch.tanggal_lahir.slice(8, 10)}/${siakadMatch.tanggal_lahir.slice(5, 7)}/${siakadMatch.tanggal_lahir.slice(0, 4)}`;
        if (!matchIso && cleanBirth !== formattedSiakad) {
          setErrorMessage(`Kombinasi data "${siakadMatch.nama_lengkap}" dan Tanggal Lahir (${cleanBirth}) tidak cocok dengan data pendaftaran.`);
          return;
        }
      }

      // EARLY DETECTION OTOMATIS: Cek apakah NIM resmi sudah diterbitkan di SIAKAD/SIDARA
      if (siakadMatch && siakadMatch.has_active_nim && siakadMatch.nim_resmi) {
        setDetectedNimStudent({
          ...siakadMatch,
          nama_lengkap: simabaMatch ? simabaMatch.nama_mahasiswa : siakadMatch.nama_lengkap,
          nomor_registrasi: simabaMatch ? simabaMatch.nomor_pendaftaran : siakadMatch.nomor_registrasi,
          program_studi: simabaMatch ? simabaMatch.program_studi : siakadMatch.program_studi,
          fakultas: siakadMatch.fakultas || 'Fakultas Terkait',
        });
        setShowNimDetectedModal(true);
        return;
      }

      const studentName = simabaMatch ? simabaMatch.nama_mahasiswa : (siakadMatch ? siakadMatch.nama_lengkap : 'Calon Mahasiswa Baru');
      const studentNoReg = simabaMatch ? simabaMatch.nomor_pendaftaran : cleanReg;
      onLoginSuccess('maba', studentNoReg, studentName, undefined, selectedScenario);
    }, 600);
  };

  const handleSsoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (ssoUsername.trim().length < 5) {
      setErrorMessage('Credential Single Sign On (SSO) UBT tidak valid.');
      return;
    }

    // Start animated SSO Database Check pathway
    setIsCheckingSsoDb(true);
    setSsoCheckStep(1); // Step 1: SSO Credential Auth

    setTimeout(() => {
      setSsoCheckStep(2); // Step 2: Querying DB_ASRAMA_UBT

      setTimeout(() => {
        setSsoCheckStep(3); // Step 3: Result Evaluated
        setIsCheckingSsoDb(false);

        const isNotActiveResident =
          selectedSsoAccount.startsWith('NON_ACTIVE') ||
          selectedSsoAccount === 'OFFICIAL_NIM_MIGRATED' ||
          ssoUsername.includes('88') ||
          ssoUsername.includes('99') ||
          ssoUsername.startsWith('260') ||
          ssoUsername.toLowerCase().includes('max');

        if (isNotActiveResident) {
          // NOT AN ACTIVE RESIDENT -> Show Modal explaining redirection to Pendaftaran
          setShowRedirectModal(true);
        } else {
          // ALREADY AN ACTIVE RESIDENT -> Direct to Eksisting Dashboard
          onLoginSuccess('eksisting', ssoUsername, 'Ahmad Raihan', undefined, selectedSsoAccount);
        }
      }, 700);
    }, 600);
  };

  const handleProceedToRegistration = () => {
    setShowRedirectModal(false);
    const matched = INITIAL_SIAKAD_STAGING.find(
      (s) => s.nomor_registrasi === ssoUsername || s.nim_resmi === ssoUsername
    );
    const studentName = matched ? matched.nama_lengkap : 'Mahasiswa Aktif UBT';
    const scenario = 'SMART_PREFILL';

    onLoginSuccess(
      'maba',
      ssoUsername,
      studentName,
      `SSO SIAKAD terverifikasi (NIM ${ssoUsername}). Silakan lengkapi validasi identitas di Tahap 1.`,
      scenario
    );
  };

  return (
    <div id="login-container" className="min-h-[100dvh] sm:min-h-[calc(100vh-120px)] bg-slate-100 flex flex-col justify-end sm:justify-center items-center p-0 sm:py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Visual Background Soft Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-blue-200/40 rounded-full blur-3xl pointer-events-none" />

      {/* Main Card Wrapper */}
      <div className="w-full h-full sm:h-auto max-w-4xl bg-transparent sm:bg-white sm:border border-slate-200 sm:rounded-2xl sm:shadow-xl overflow-hidden z-10 flex flex-col sm:grid sm:grid-cols-1 md:grid-cols-12">
        {/* Left Visual Branding Panel */}
        <div className="flex-1 md:col-span-5 bg-gradient-to-br from-teal-800 via-teal-900 to-slate-900 p-8 flex flex-col justify-center sm:justify-between sm:border-r border-teal-700 text-white relative">
          <div 
            className="space-y-6 cursor-pointer sm:cursor-default"
            onClick={() => {
              if (window.innerWidth < 640) {
                document.getElementById('login-form-panel')?.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          >
            <div className="flex items-center space-x-2.5">
              <span className="bg-emerald-400/20 text-emerald-300 text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border border-emerald-400/30">
                PORTAL SI-GABUNG
              </span>
              <span className="text-xs text-teal-200 font-bold">ROEMAH 54</span>
            </div>

            <div className="space-y-3 pt-2">
              <h3 className="text-2xl font-black text-white tracking-tight leading-snug">
                Selamat Datang di Portal SI-GABUNG
              </h3>
              <p className="text-sm sm:text-base text-teal-50 font-medium leading-relaxed">
                Langkah Awal Menuju Rumah Keduamu di Asrama UBT
              </p>
              <p className="text-xs text-teal-100/80 leading-relaxed pt-2 border-t border-teal-800/50">
                Silakan masuk menggunakan akun PMB (SIMABA) atau SSO kampus Anda.
              </p>
            </div>

            <div className="space-y-2.5 pt-2 hidden sm:block">
              <div className="flex items-center space-x-2 text-xs text-teal-50">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Single Sign-On (SSO) Terintegrasi SIAKAD</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-teal-50">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Private File Storage (Keamanan e-KYC)</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-teal-50">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>TTD Kontrak Digital OTP WhatsApp</span>
              </div>
            </div>
          </div>

          <div className="pt-8 sm:border-t border-teal-700/80 text-[11px] text-teal-200 flex items-center justify-between hidden sm:flex">
            <span>Universitas Bunda Thamrin (UBT)</span>
            <span className="font-mono text-teal-300 font-bold">v14.0</span>
          </div>
        </div>

        {/* Right Form Panel (Bottom Sheet on Mobile) */}
        <div id="login-form-panel" className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-end sm:justify-center bg-slate-50 relative rounded-t-[2.5rem] sm:rounded-none -mt-10 sm:mt-0 shadow-[0_-10px_40px_rgba(0,0,0,0.15)] sm:shadow-none z-20 pb-10 sm:pb-8">
          
          {/* Mobile Drag Handle Indicator */}
          <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6 sm:hidden"></div>

          {viewMode === 'main' && (
            <div className="max-w-md w-full mx-auto bg-white rounded-2xl shadow-none sm:shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:border border-slate-100 overflow-hidden relative">
              <div className="p-8 space-y-8">
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-100 shadow-sm">
                    <Building className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-800">Selamat Datang</h3>
                  <p className="text-sm text-slate-500">Silakan login menggunakan akun SSO UBT</p>
                </div>
                
                <div className="space-y-4 pt-4">
                  <button
                    onClick={handleSsoRedirectClick}
                    className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold py-3.5 rounded-xl text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
                  >
                    <span>Login SSO UBT</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <div className="flex items-center justify-center space-x-3 py-2">
                    <div className="h-px bg-slate-200 flex-1"></div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ATAU</span>
                    <div className="h-px bg-slate-200 flex-1"></div>
                  </div>

                  <button
                    onClick={handleOpenPmb}
                    className="w-full bg-white border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-bold py-3.5 rounded-xl text-sm transition-all flex items-center justify-center"
                  >
                    Pendaftaran Asrama (Jalur PMB)
                  </button>
                </div>
              </div>
              
              <div className="bg-slate-50/80 py-4 text-center border-t border-slate-100">
                <p className="text-[10px] text-slate-400 font-medium">&copy;2026 ASRAMA Universitas Bunda Thamrin</p>
              </div>
            </div>
          )}

          {viewMode === 'sso' && (
            <div className="max-w-md w-full mx-auto">
              <button onClick={() => setViewMode('main')} className="mb-6 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-500 flex items-center gap-2 hover:text-slate-800 hover:bg-slate-50 transition-colors shadow-sm inline-flex">
                &larr; Kembali
              </button>
              <form id="form-sso-login" onSubmit={handleSsoSubmit} className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-950 space-y-1.5">
                <div className="flex items-center space-x-2 font-bold">
                  <ShieldCheck className="w-4 h-4 text-blue-700 flex-shrink-0" />
                  <span>Single Sign On (SSO) Terintegrasi DB Asrama UBT</span>
                </div>
                <p className="text-[11px] text-blue-900 leading-relaxed">
                  Sistem mengecek status keanggotaan di Database Asrama. Mahasiswa yang <strong>belum terdaftar sebagai penghuni aktif</strong> akan diarahkan untuk melalui tahapan proses pendaftaran.
                </p>
              </div>

              {/* SIMULATOR PILIHAN STATUS MAHAKOT / EKSISTING */}
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl space-y-2">
                <label className="text-[11px] font-bold text-slate-800 flex items-center justify-between">
                  <span>Simulasi Status Database Mahasiswa Eksisting:</span>
                  <span className="text-[10px] text-teal-800 font-mono font-bold">[DB Check Handler]</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedSsoAccount('NON_ACTIVE_COMPLETE');
                      setSsoUsername('2240101088');
                    }}
                    className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                      selectedSsoAccount === 'NON_ACTIVE_COMPLETE'
                        ? 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500 text-emerald-950 font-bold'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] mb-0.5">
                      <span className="font-mono text-emerald-900">NIM: 2240101088</span>
                      <span className="bg-emerald-100 text-emerald-800 text-[9px] px-1.5 py-0.5 rounded font-bold">
                        SMART PRE-FILL
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-600 font-normal">
                      Ahmad Zaky • Data SIAKAD Lengkap (Wajib KTP & Orang Tua di Step 1)
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedSsoAccount('NON_ACTIVE_INCOMPLETE');
                      setSsoUsername('2240101099');
                    }}
                    className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                      selectedSsoAccount === 'NON_ACTIVE_INCOMPLETE'
                        ? 'bg-amber-50 border-amber-500 ring-1 ring-amber-500 text-amber-950 font-bold'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] mb-0.5">
                      <span className="font-mono text-amber-900">NIM: 2240101099</span>
                      <span className="bg-amber-100 text-amber-800 text-[9px] px-1.5 py-0.5 rounded font-bold">
                        PRE-FILL PARSIAL
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-600 font-normal">
                      Rina Anggraini • Data SIAKAD Parsial (Lengkapi NIK & Dokumen di Step 1)
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedSsoAccount('OFFICIAL_NIM_MIGRATED');
                      setSsoUsername('2601015001');
                    }}
                    className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                      selectedSsoAccount === 'OFFICIAL_NIM_MIGRATED'
                        ? 'bg-indigo-50 border-indigo-500 ring-1 ring-indigo-500 text-indigo-950 font-bold'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] mb-0.5">
                      <span className="font-mono text-indigo-900">NIM: 2601015001</span>
                      <span className="bg-indigo-100 text-indigo-800 text-[9px] px-1.5 py-0.5 rounded font-bold">
                        TERBIT DARI PMB
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-600 font-normal">
                      Maximilian Winata • Migrasi Resmi PMB2026-08942
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedSsoAccount('ACTIVE_RESIDENT');
                      setSsoUsername('2240101004');
                    }}
                    className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                      selectedSsoAccount === 'ACTIVE_RESIDENT'
                        ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500 text-blue-950 font-bold'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] mb-0.5">
                      <span className="font-mono text-blue-900">NIM: 2240101004</span>
                      <span className="bg-blue-100 text-blue-800 text-[9px] px-1.5 py-0.5 rounded font-bold">
                        PENGHUNI AKTIF
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-600 font-normal">
                      Ahmad Raihan • Kamar 101 Gedung A (Dashboard Eksisting)
                    </div>
                  </button>
                  {import.meta.env.DEV && (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedSsoAccount('ACTIVE_RESIDENT_INSTALLMENT');
                          setSsoUsername('2240101004');
                        }}
                        className={`p-2.5 rounded-lg border text-left transition-all ${
                          selectedSsoAccount === 'ACTIVE_RESIDENT_INSTALLMENT'
                            ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500 text-blue-950 font-bold'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[11px] mb-0.5">
                          <span className="font-mono text-blue-900">[DEV] Skenario 3</span>
                          <span className="bg-blue-100 text-blue-800 text-[9px] px-1.5 py-0.5 rounded font-bold">
                            CICILAN DEPOSIT
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-600 font-normal">
                          Menunggak Cicilan ke-2 (Auto-Resume ke Form Bayar)
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedSsoAccount('ACTIVE_RESIDENT_RENEWAL');
                          setSsoUsername('2240101004');
                        }}
                        className={`p-2.5 rounded-lg border text-left transition-all ${
                          selectedSsoAccount === 'ACTIVE_RESIDENT_RENEWAL'
                            ? 'bg-purple-50 border-purple-500 ring-1 ring-purple-500 text-purple-950 font-bold'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[11px] mb-0.5">
                          <span className="font-mono text-purple-900">[DEV] Skenario 2</span>
                          <span className="bg-purple-100 text-purple-800 text-[9px] px-1.5 py-0.5 rounded font-bold">
                            DRAFT RENEWAL
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-600 font-normal">
                          Draft Perpanjangan Sewa (Auto-Resume Banner)
                        </div>
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  NIM Mahasiswa Aktif SIAKAD
                </label>
                <input
                  id="input-sso-username"
                  type="text"
                  value={ssoUsername}
                  onChange={(e) => setSsoUsername(e.target.value)}
                  placeholder="Contoh: 2240101088"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white font-mono shadow-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Password SSO SIAKAD
                </label>
                <input
                  id="input-sso-password"
                  type="password"
                  value={ssoPassword}
                  onChange={(e) => setSsoPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white shadow-sm"
                  required
                />
              </div>

              <div className="pt-2">
                <button
                  id="button-submit-sso"
                  type="submit"
                  disabled={isCheckingSsoDb}
                  className="w-full bg-blue-700 hover:bg-blue-800 disabled:opacity-60 text-white font-bold py-2.5 rounded-lg text-sm transition-all flex items-center justify-center space-x-2 shadow-md"
                >
                  {isCheckingSsoDb ? (
                    <span className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-blue-200" />
                      <span>Proses Verifikasi Database SSO...</span>
                    </span>
                  ) : (
                    <>
                      <span>Masuk via SSO UBT & Check Status Database</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
            </div>
          )}

          {showPmbModal && (
            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 sm:p-0">
              <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden relative animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white/90 backdrop-blur-md flex items-center justify-between p-6 border-b border-slate-100 z-10">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Pendaftaran Maba</h3>
                    <p className="text-xs text-slate-500">Jalur Penerimaan Mahasiswa Baru</p>
                  </div>
                  <button onClick={() => setShowPmbModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-6 bg-slate-50/50">
                  <form id="form-maba-login" onSubmit={handleMabaSubmit} className="space-y-4">
                    <div className="bg-teal-50 border border-teal-200 rounded-xl p-3 text-xs text-teal-900 flex items-start space-x-2.5">
                      <Sparkles className="w-4 h-4 text-teal-700 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold block text-teal-950">Klaim Identitas PMB SIMABA (`u540633926_simaba`)</span>
                        Ketik nama lengkap Anda untuk mendeteksi nomor pendaftaran secara otomatis, atau masukkan nomor pendaftaran langsung.
                      </div>
                    </div>

                    {/* FIELD PENCARIAN NAMA & NOMOR PENDAFTARAN DENGAN LIVE AUTO-SUGGEST DROPDOWN */}
                    <div className="relative" ref={suggestionsRef}>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <Search className="w-3.5 h-3.5 text-teal-600" />
                          <span>Nomor Pendaftaran PMB atau Ketik Nama</span>
                        </label>
                        <span className="text-[10px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                          Live Auto-Suggest
                        </span>
                      </div>
                      <div className="relative">
                        <input
                          id="input-pmb-noreg"
                          type="text"
                          value={pmbNoReg}
                          onChange={(e) => {
                            setPmbNoReg(e.target.value);
                            setShowNameSuggestions(true);
                            if (selectedStudent && selectedStudent.nomor_pendaftaran !== e.target.value) {
                              setSelectedStudent(null);
                            }
                          }}
                          onKeyDown={handleInputKeyDown}
                          onFocus={() => {
                            if (pmbNoReg.trim().length >= 2 && !selectedStudent) {
                              setShowNameSuggestions(true);
                            }
                          }}
                          placeholder="Ketik nama (Grace, Jenny, Maza, Alvin) atau No. PMB..."
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-9 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-teal-600 focus:bg-white font-medium shadow-xs"
                          required
                          autoComplete="off"
                        />
                        {isSearching ? (
                          <Loader2 className="w-4 h-4 text-teal-600 animate-spin absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        ) : (
                          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        )}
                        {pmbNoReg && (
                          <button
                            type="button"
                            onClick={handleResetSelectedStudent}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                            title="Bersihkan input"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* LIVE SUGGESTION DROPDOWN DENGAN KEYBOARD NAV & TEXT HIGHLIGHT */}
                      {showNameSuggestions && filteredStudents.length > 0 && (
                        <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-teal-300 rounded-2xl shadow-2xl z-40 overflow-hidden divide-y divide-slate-100 max-h-72 overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
                          <div className="bg-slate-50 px-3.5 py-2 flex items-center justify-between text-[11px] text-slate-600 font-semibold border-b border-slate-200/80">
                            <span className="flex items-center gap-1.5 text-teal-900 font-bold">
                              <User className="w-3.5 h-3.5 text-teal-600" />
                              Saran Calon Mahasiswa SIMABA ({filteredStudents.length})
                            </span>
                            <span className="text-[10px] text-teal-800 font-mono bg-teal-100/70 px-2 py-0.5 rounded border border-teal-200">
                              Gunakan [↑][↓] & [Enter]
                            </span>
                          </div>
                          {filteredStudents.map((s, idx) => {
                            const isFocused = idx === activeSuggestionIndex;
                            return (
                              <div
                                id={`suggestion-item-${idx}`}
                                key={s.id}
                                onClick={() => handleSelectStudent(s)}
                                onMouseEnter={() => setActiveSuggestionIndex(idx)}
                                className={`p-3 transition-colors cursor-pointer flex items-center justify-between gap-2.5 min-h-[52px] ${
                                  isFocused
                                    ? 'bg-teal-50 border-l-4 border-l-teal-600 pl-2.5 text-teal-950 font-medium'
                                    : 'hover:bg-slate-50 border-l-4 border-l-transparent text-slate-700'
                                }`}
                              >
                                <div className="min-w-0 flex-1">
                                  <div className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                                    {highlightMatch(s.nama_mahasiswa, debouncedSearch)}
                                  </div>
                                  <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                    <span className="font-mono text-[10px] font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200">
                                      No. PMB: {highlightMatch(s.nomor_pendaftaran, debouncedSearch)}
                                    </span>
                                    <span className="text-[10px] font-medium bg-teal-50 text-teal-800 px-2 py-0.5 rounded border border-teal-200 truncate max-w-[170px]">
                                      {s.program_studi}
                                    </span>
                                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                                      s.jenis_mahasiswa === 'kip'
                                        ? 'bg-amber-50 text-amber-900 border-amber-300'
                                        : 'bg-slate-100 text-slate-700 border-slate-200'
                                    }`}>
                                      {s.jenis_mahasiswa === 'kip' ? 'KIP Kuliah · Subsidi Penuh' : 'Reguler Mandiri'}
                                    </span>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSelectStudent(s);
                                  }}
                                  className={`shrink-0 text-xs font-bold px-3 py-2 rounded-lg shadow-xs flex items-center gap-1.5 min-h-[38px] cursor-pointer transition-all ${
                                    isFocused
                                      ? 'bg-teal-700 text-white shadow-sm ring-2 ring-teal-400'
                                      : 'bg-teal-600 hover:bg-teal-700 text-white'
                                  }`}
                                >
                                  <span>Pilih</span>
                                  <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* KARTU IDENTITAS TERPILIH */}
                      {selectedStudent && (
                        <div className="mt-2 bg-emerald-50 border border-emerald-300 rounded-xl p-3 flex items-start justify-between gap-2 animate-in fade-in">
                          <div className="min-w-0">
                            <div className="text-[11px] font-bold text-emerald-950 flex items-center gap-1.5">
                              <BadgeCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                              <span>Data Terverifikasi dari Basis Data {selectedStudent.source === 'SIDARA' ? 'SIDARA (siakad_mahasiswa_stg)' : 'SIMABA'}</span>
                            </div>
                            <div className="text-xs font-bold text-slate-900 mt-0.5 truncate">
                              {selectedStudent.nama_mahasiswa}
                            </div>
                            <div className="text-[10px] text-slate-600 mt-0.5">
                              No. Pendaftaran: <span className="font-mono font-bold text-emerald-800">{selectedStudent.nomor_pendaftaran}</span> · {selectedStudent.program_studi} ({selectedStudent.jenis_mahasiswa === 'kip' ? 'KIP' : 'Reguler'})
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={handleResetSelectedStudent}
                            className="shrink-0 text-[11px] font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-300 hover:bg-slate-50 px-2.5 py-1 rounded-lg shadow-xs cursor-pointer"
                          >
                            Ganti Nama
                          </button>
                        </div>
                      )}
                    </div>

                    {/* INPUT TANGGAL LAHIR (FORMAT UX: DD/MM/YYYY) */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-teal-600" />
                          <span>Tanggal Lahir (Format DD/MM/YYYY)</span>
                        </label>
                        <span className="text-[10px] font-mono text-slate-500">Hari/Bulan/Tahun</span>
                      </div>
                      <div className="relative">
                        <input
                          id="input-pmb-birthdate"
                          type="text"
                          value={mabaBirthDate}
                          onChange={(e) => handleBirthDateChange(e.target.value)}
                          placeholder="Contoh: 12/02/2008"
                          maxLength={10}
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-teal-600 focus:bg-white font-mono shadow-xs"
                          required
                        />
                        <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Ketik angka hari, bulan, dan tahun lahir. Tanda garis miring (<span className="font-mono font-bold">/</span>) akan diformat otomatis (DD/MM/YYYY).
                      </p>
                    </div>

                    {/* ERROR MESSAGE NOTIFICATION */}
                    {errorMessage && (
                      <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-3 text-xs flex items-start gap-2 animate-in fade-in">
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        <span>{errorMessage}</span>
                      </div>
                    )}

                    {/* PRESETS DARI DUMP BASIS DATA ASLI SIMABA UBT */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
                        <span className="flex items-center gap-1 text-teal-800 font-bold">
                          <Link2 className="w-3 h-3 text-teal-600" />
                          Sampel Mahasiswa SIMABA (`u540633926_simaba`):
                        </span>
                        <span className="font-mono text-[9px] text-slate-400">Pilih cepat</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-left">
                        <button
                          type="button"
                          onClick={() => {
                            const st = INITIAL_SIMABA_STUDENTS.find(s => s.nomor_pendaftaran === '260108001');
                            if (st) handleSelectStudent(st);
                          }}
                          className={`text-left p-2 rounded-lg border text-xs transition-all flex items-center justify-between cursor-pointer ${
                            pmbNoReg === '260108001'
                              ? 'bg-teal-50 border-teal-500 text-teal-950 font-bold shadow-xs'
                              : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="font-semibold truncate">GRACE MARLIN TELAUMBANUA</div>
                            <div className="text-[10px] text-slate-500 font-mono">260108001 · D III Kep · 12/02/2008</div>
                          </div>
                          <span className="text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-mono font-bold shrink-0 ml-1.5">
                            KIP
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            const st = INITIAL_SIMABA_STUDENTS.find(s => s.nomor_pendaftaran === '250830001');
                            if (st) handleSelectStudent(st);
                          }}
                          className={`text-left p-2 rounded-lg border text-xs transition-all flex items-center justify-between cursor-pointer ${
                            pmbNoReg === '250830001'
                              ? 'bg-teal-50 border-teal-500 text-teal-950 font-bold shadow-xs'
                              : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="font-semibold truncate">Jenny Agustina Shellyana</div>
                            <div className="text-[10px] text-slate-500 font-mono">250830001 · D III Kep · 29/08/2006</div>
                          </div>
                          <span className="text-[9px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-mono font-bold shrink-0 ml-1.5">
                            Reguler
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            const st = INITIAL_SIMABA_STUDENTS.find(s => s.nomor_pendaftaran === '250830002');
                            if (st) handleSelectStudent(st);
                          }}
                          className={`text-left p-2 rounded-lg border text-xs transition-all flex items-center justify-between cursor-pointer ${
                            pmbNoReg === '250830002'
                              ? 'bg-teal-50 border-teal-500 text-teal-950 font-bold shadow-xs'
                              : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="font-semibold truncate">MAZA ADITIYA</div>
                            <div className="text-[10px] text-slate-500 font-mono">250830002 · S1 Kesmas · 19/06/2006</div>
                          </div>
                          <span className="text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-mono font-bold shrink-0 ml-1.5">
                            KIP
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            const st = INITIAL_SIMABA_STUDENTS.find(s => s.nomor_pendaftaran === '260727002');
                            if (st) handleSelectStudent(st);
                          }}
                          className={`text-left p-2 rounded-lg border text-xs transition-all flex items-center justify-between cursor-pointer ${
                            pmbNoReg === '260727002'
                              ? 'bg-indigo-50 border-indigo-500 text-indigo-950 font-bold shadow-xs'
                              : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="font-semibold truncate">Alvin Octavianus H.</div>
                            <div className="text-[10px] text-indigo-700 font-mono font-semibold">260727002 · NIM Resmi SIAKAD</div>
                          </div>
                          <span className="text-[9px] bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded font-mono font-bold shrink-0 ml-1.5">
                            Early NIM
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* PRESETS DARI STAGING API SIDARA */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
                        <span className="flex items-center gap-1 text-indigo-900 font-bold">
                          <Database className="w-3 h-3 text-indigo-600" />
                          Sampel Pendaftar Hasil Impor API SIDARA (`siakad_mahasiswa_stg`):
                        </span>
                        <span className="font-mono text-[9px] text-slate-400">Pilih cepat</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-left">
                        {effectiveSiakad.slice(0, 2).map((stg) => {
                          const formattedBirth = stg.tanggal_lahir
                            ? `${stg.tanggal_lahir.slice(8, 10)}/${stg.tanggal_lahir.slice(5, 7)}/${stg.tanggal_lahir.slice(0, 4)}`
                            : '15/04/2005';
                          const isSelected = pmbNoReg === stg.nomor_registrasi;
                          return (
                            <button
                              key={stg.id}
                              type="button"
                              onClick={() => {
                                handleSelectStudent({
                                  id: stg.id + 20000,
                                  nomor_pendaftaran: stg.nomor_registrasi,
                                  nama_mahasiswa: stg.nama_lengkap,
                                  nik: stg.nik,
                                  tempat_lahir: stg.tempat_lahir || 'TARAKAN',
                                  tanggal_lahir: stg.tanggal_lahir || '2005-04-15',
                                  tanggal_lahir_formatted: formattedBirth,
                                  jenis_kelamin: (stg.jenis_kelamin || 'L') as 'L' | 'P',
                                  program_studi: stg.program_studi || 'Teknik',
                                  jenis_mahasiswa: (stg.kategori_beasiswa === 'kip' ? 'kip' : 'nonkip') as 'kip' | 'nonkip',
                                  nomorkip: stg.nomorkip,
                                  no_hp: stg.nomor_telepon,
                                  email: stg.email,
                                  alamat: stg.alamat_lengkap,
                                  source: 'SIDARA' as const
                                });
                              }}
                              className={`text-left p-2 rounded-lg border text-xs transition-all flex items-center justify-between cursor-pointer ${
                                isSelected
                                  ? 'bg-indigo-50 border-indigo-500 text-indigo-950 font-bold shadow-xs'
                                  : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                              }`}
                            >
                              <div className="min-w-0">
                                <div className="font-semibold truncate">{stg.nama_lengkap}</div>
                                <div className="text-[10px] text-slate-500 font-mono">
                                  {stg.nomor_registrasi} · {stg.program_studi || 'Teknik'} · {formattedBirth}
                                </div>
                              </div>
                              <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold shrink-0 ml-1.5 ${
                                stg.kategori_beasiswa === 'kip'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-indigo-100 text-indigo-800'
                              }`}>
                                {stg.kategori_beasiswa === 'kip' ? 'KIP' : 'SIDARA'}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {import.meta.env.DEV && (
                      <div className="pt-2">
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          [DEV ONLY] Simulasi Skenario Resume (Auto-Jump):
                        </label>
                        <select
                          value={selectedScenario}
                          onChange={(e) => setSelectedScenario(e.target.value as 'NEW' | 'INVOICE_FORMED')}
                          className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:border-teal-600 focus:bg-white shadow-xs mb-2"
                        >
                          <option value="NEW">Maba Baru (Mulai dari Form e-KYC - Step 1)</option>
                          <option value="INVOICE_FORMED">Tagihan Sudah Terbentuk & Belum Transfer (Resume ke Step 3)</option>
                        </select>
                      </div>
                    )}

                    <div className="pt-2">
                      <button
                        id="button-submit-maba"
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-teal-700 hover:bg-teal-800 text-white font-bold py-3 rounded-xl text-sm transition-all flex items-center justify-center space-x-2 shadow-md cursor-pointer"
                      >
                        {isLoading ? (
                          <span className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Memverifikasi Database SIMABA & SIAKAD...</span>
                          </span>
                        ) : (
                          <>
                            <span>Masuk Portal Pendaftaran Asrama</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      
      </div>

      
      {/* OVERLAY SIMULATING SSO REDIRECT */}
      {isRedirectingSso && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-sm w-full border border-slate-200 shadow-2xl flex flex-col items-center justify-center text-center space-y-4">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
            <div>
              <h3 className="font-bold text-lg text-slate-900">Mengalihkan...</h3>
              <p className="text-xs text-slate-500 mt-1">Membuka gerbang SSO SI-DARA UBT</p>
            </div>
          </div>
        </div>
      )}

      {/* OVERLAY LOADING SSO VERIFICATION STEP */}
      {isCheckingSsoDb && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 bg-blue-50 text-blue-700 rounded-full flex items-center justify-center mx-auto border border-blue-200 animate-pulse">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">Verifikasi Database Status Asrama</h3>
              <p className="text-xs text-slate-500 mt-1">
                SIAKAD UBT Single Sign-On Gateway & DB_ASRAMA_UBT
              </p>
            </div>

            <div className="space-y-2 text-left bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs font-mono">
              <div className={`flex items-center justify-between ${ssoCheckStep >= 1 ? 'text-emerald-700 font-bold' : 'text-slate-400'}`}>
                <span>1. Authenticating SSO Credential...</span>
                <span>{ssoCheckStep >= 1 ? 'OK ✓' : '...'}</span>
              </div>
              <div className={`flex items-center justify-between ${ssoCheckStep >= 2 ? 'text-emerald-700 font-bold' : 'text-slate-400'}`}>
                <span>2. Querying DB_ASRAMA (t_penghuni)...</span>
                <span>{ssoCheckStep >= 2 ? 'OK ✓' : '...'}</span>
              </div>
              <div className={`flex items-center justify-between ${ssoCheckStep >= 3 ? 'text-blue-800 font-bold' : 'text-slate-400'}`}>
                <span>3. Evaluating Resident Status...</span>
                <span>{ssoCheckStep >= 3 ? 'Done ✓' : '...'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DETEKSI NIM RESMI SIAKAD/SIDARA (SKENARIO 1) */}
      {showNimDetectedModal && detectedNimStudent && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-indigo-200 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-700 rounded-2xl flex items-center justify-center border border-indigo-200">
                <GraduationCap className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-300">
                SIAKAD & SIDARA INTEGRATION
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs">
                <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                  Terdeteksi di Pangkalan Data Kampus
                </span>
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight leading-snug">
                NIM Resmi Anda Telah Diterbitkan!
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Calon mahasiswa atas nama <strong className="text-slate-900">{detectedNimStudent.nama_lengkap}</strong> telah resmi terbit Nomor Induk Mahasiswa (NIM) oleh Universitas pada sistem SIAKAD & SIDARA UBT.
              </p>
            </div>

            {/* Kotak Transformasi Identitas */}
            <div className="bg-gradient-to-r from-slate-50 to-indigo-50/50 border border-indigo-100 rounded-2xl p-4 space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-indigo-100/80 pb-2">
                <span className="text-slate-500 text-[11px]">Nomor Registrasi PMB:</span>
                <span className="font-mono font-semibold text-slate-700">{detectedNimStudent.nomor_registrasi}</span>
              </div>
              <div className="flex items-center justify-between border-b border-indigo-100/80 pb-2">
                <span className="text-slate-500 text-[11px]">Program Studi & Fakultas:</span>
                <span className="font-medium text-slate-800 text-right">{detectedNimStudent.program_studi} · {detectedNimStudent.fakultas}</span>
              </div>
              <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-indigo-200 shadow-xs">
                <span className="text-indigo-950 font-bold text-xs flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  NIM Resmi (SIDARA):
                </span>
                <span className="font-mono font-extrabold text-sm text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-300">
                  {detectedNimStudent.nim_resmi}
                </span>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-[11px] text-amber-900 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <strong>Protokol Satu Pintu Ekosistem:</strong> Anda tidak lagi perlu mendaftar via formulir PMB. Silakan login langsung menggunakan akun <strong>Single Sign-On (SSO)</strong> kampus Anda.
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowNimDetectedModal(false)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 border border-slate-300 cursor-pointer"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => {
                  const targetNim = detectedNimStudent.nim_resmi;
                  setShowNimDetectedModal(false);
                  setShowPmbModal(false);
                  setViewMode('sso');
                  setSsoUsername(targetNim);
                  setSelectedSsoAccount('OFFICIAL_NIM_MIGRATED');
                  toast.success(`Beralih ke SSO UBT dengan NIM resmi: ${targetNim}`);
                }}
                className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md flex items-center justify-center space-x-2 cursor-pointer transition-colors"
              >
                <span>Beralih ke Login SSO UBT ({detectedNimStudent.nim_resmi}) →</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL REDIRECTION FOR NON-ACTIVE RESIDENT SSO (SKENARIO 2) */}
      {showRedirectModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 sm:p-7 max-w-lg w-full border border-slate-200 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            {(() => {
              const matched = INITIAL_SIAKAD_STAGING.find(
                (s) => s.nomor_registrasi === ssoUsername || s.nim_resmi === ssoUsername
              );
              const studentName = matched ? matched.nama_lengkap : 'Mahasiswa Aktif UBT';

              return (
                <>
                  {/* Clean Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 bg-teal-100 text-teal-800 rounded-xl flex items-center justify-center shrink-0">
                        <GraduationCap className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                          Verifikasi Akun SIAKAD
                        </h3>
                        <p className="text-xs text-slate-500 font-mono">
                          NIM: {ssoUsername} • {matched?.program_studi || 'SIAKAD UBT'}
                        </p>
                      </div>
                    </div>
                    <span className="bg-amber-100 text-amber-900 text-[10px] font-semibold px-2.5 py-1 rounded-full border border-amber-200 shrink-0">
                      Belum Terdaftar Asrama
                    </span>
                  </div>

                  {/* Student Identity Card */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-[11px] text-slate-500 font-medium">Nama Mahasiswa</div>
                      <div className="text-sm font-bold text-slate-900 truncate">{studentName}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-[11px] text-slate-500 font-medium">Status Akademik</div>
                      <div className="text-xs font-semibold text-emerald-700 flex items-center gap-1 justify-end">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Mahasiswa Aktif</span>
                      </div>
                    </div>
                  </div>

                  {/* Single-line Compact Highlight */}
                  <div className="bg-teal-50 border border-teal-200/80 rounded-xl px-3.5 py-2.5 flex items-center gap-2.5 text-xs text-teal-950">
                    <Sparkles className="w-4 h-4 text-teal-600 shrink-0" />
                    <span className="leading-snug">
                      Data akademik tersinkronisasi. Lengkapi e-KYC (KTP & Selfie) di Tahap 1 untuk memesan kamar.
                    </span>
                  </div>

                  {/* Separate Policy Link / Help Button */}
                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={() => setShowPolicyModal(true)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:text-teal-800 hover:underline cursor-pointer transition-colors"
                    >
                      <Info className="w-3.5 h-3.5" />
                      <span>Ketentuan Pendaftaran & e-KYC</span>
                    </button>
                    <span className="text-[11px] text-slate-400">Tahap 1 dari 4</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 flex items-center justify-end gap-2.5">
                    <button
                      type="button"
                      onClick={() => setShowRedirectModal(false)}
                      className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={handleProceedToRegistration}
                      className="text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-sm flex items-center justify-center space-x-1.5 cursor-pointer transition-colors bg-teal-800 hover:bg-teal-700"
                    >
                      <span>Mulai Pendaftaran Tahap 1 →</span>
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* POLICY INFO MODAL FOR SSO */}
      {showPolicyModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-teal-700" />
                <h4 className="font-bold text-slate-900 text-sm">Ketentuan Pendaftaran & e-KYC</h4>
              </div>
              <button
                type="button"
                onClick={() => setShowPolicyModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs text-slate-600">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-teal-700 text-white text-[10px] flex items-center justify-center font-bold">1</span>
                  <span>Smart Pre-Fill SIAKAD</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Data nama, NIM, fakultas, dan program studi Anda langsung ditarik dari database kampus tanpa perlu diketik ulang.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-teal-700 text-white text-[10px] flex items-center justify-center font-bold">2</span>
                  <span>Wajib e-KYC & Kontak Wali</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Demi kepatuhan protokol keamanan asrama dan kesiapsiagaan darurat, seluruh calon penghuni wajib mengunggah foto e-KTP dan selfie biometrik.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-teal-700 text-white text-[10px] flex items-center justify-center font-bold">3</span>
                  <span>Tahap 2: Skema & Pembayaran</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Setelah data identitas tervalidasi, Anda dapat memilih skema tarif, termin pembayaran, serta mengunci alokasi kamar.
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowPolicyModal(false)}
                className="w-full bg-teal-800 hover:bg-teal-700 text-white text-xs font-bold py-2.5 rounded-xl transition-colors cursor-pointer"
              >
                Saya Mengerti
              </button>
            </div>
          </div>
        </div>
      )}
    </div>

  );
};