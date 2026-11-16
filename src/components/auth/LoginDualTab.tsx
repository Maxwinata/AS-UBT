import React, { useState, useRef, useEffect, useMemo } from 'react';
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
import { UserRole, SimabaStudent, SiakadMahasiswaStgRecord, MabaProfile } from '../../types/asrama';
import { INITIAL_SIAKAD_STAGING, INITIAL_SIMABA_STUDENTS } from '../../data/initialData';
import { useTestingMode } from '../../context/TestingModeContext';

interface LoginDualTabProps {
  onLoginSuccess: (
    role: UserRole,
    nim: string,
    nama: string,
    notice?: string,
    scenario?: string,
    studentProfileData?: Partial<MabaProfile>
  ) => void;
  siakadStaging?: SiakadMahasiswaStgRecord[];
}

export const LoginDualTab: React.FC<LoginDualTabProps> = ({ onLoginSuccess, siakadStaging }) => {
  const { isCleanTesting } = useTestingMode();
  const [cleanLoginTab, setCleanLoginTab] = useState<'pmb' | 'sso'>('pmb');
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
  const effectiveSiakad = useMemo(() => {
    return siakadStaging && siakadStaging.length > 0 ? siakadStaging : INITIAL_SIAKAD_STAGING;
  }, [siakadStaging]);

  const allCandidateStudents = useMemo(() => {
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

  // Live query ke database endpoint /api/simaba/search-student (MySQL Laragon & Server API)
  const [liveApiStudents, setLiveApiStudents] = useState<any[]>([]);

  useEffect(() => {
    const q = debouncedSearch.trim();
    if (q.length < 2) {
      setLiveApiStudents([]);
      return;
    }

    let isMounted = true;
    fetch(`/api/simaba/search-student?q=${encodeURIComponent(q)}`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (isMounted && Array.isArray(data)) {
          setLiveApiStudents(
            data.map((item) => ({
              id: item.id,
              nomor_pendaftaran: item.nomor_pendaftaran,
              nama_mahasiswa: item.nama_mahasiswa,
              program_studi: item.program_studi,
              jenis_mahasiswa: String(item.jenis_mahasiswa || '').toLowerCase() === 'kip' ? 'kip' : 'nonkip',
              tanggal_lahir_formatted: item.tanggal_lahir_formatted,
              tanggal_lahir: item.tanggal_lahir_raw,
              source: 'SIMABA' as const,
            }))
          );
        }
      })
      .catch(() => {
        // Fallback anggun ke array kandidat lokal
      });

    return () => {
      isMounted = false;
    };
  }, [debouncedSearch]);

  const filteredStudents = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase();
    if (query.length < 2) return [];

    const localMatches = allCandidateStudents.filter((s) => {
      return (
        s.nama_mahasiswa.toLowerCase().includes(query) ||
        s.nomor_pendaftaran.toLowerCase().includes(query) ||
        (s.nik && s.nik.includes(query)) ||
        s.program_studi.toLowerCase().includes(query)
      );
    });

    // Gabungkan hasil live API (MySQL) dengan hasil lokal, cegah duplikasi
    const combined = [...liveApiStudents];
    for (const local of localMatches) {
      if (!combined.some((c) => c.nomor_pendaftaran === local.nomor_pendaftaran)) {
        combined.push(local);
      }
    }
    return combined.slice(0, 8);
  }, [debouncedSearch, allCandidateStudents, liveApiStudents]);

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
  const [ssoUsername, setSsoUsername] = useState('2240101088'); // Default: Ahmad Zaky (NIM SIAKAD)
  const [ssoPassword, setSsoPassword] = useState('••••••••••••');
  const [selectedSsoAccount, setSelectedSsoAccount] = useState<
    'NON_ACTIVE_COMPLETE' | 'NON_ACTIVE_INCOMPLETE' | 'ACTIVE_RESIDENT' | 'OFFICIAL_NIM_MIGRATED' | 'ACTIVE_RESIDENT_INSTALLMENT' | 'ACTIVE_RESIDENT_RENEWAL'
  >('NON_ACTIVE_COMPLETE');

  // Database Verification Overlay/Modal state
  const [isCheckingSsoDb, setIsCheckingSsoDb] = useState(false);
  const [ssoCheckStep, setSsoCheckStep] = useState<number>(0);
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
    }, 1000);
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
        setErrorMessage(`Nomor ${cleanReg} teridentifikasi sebagai NIM Mahasiswa Eksisting UBT. Silakan gunakan tab 'Login SSO Kampus' untuk login dan proses pendaftaran kamar asrama.`);
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

      const computeFakultas = (prodi: string) => {
        if (/Gizi|Kesehatan|Keperawatan|Kebidanan|Farmasi/i.test(prodi)) return 'Fakultas Ilmu Kesehatan';
        if (/Hukum/i.test(prodi)) return 'Fakultas Hukum';
        if (/Informatika|Teknik|Komputer/i.test(prodi)) return 'Fakultas Teknik';
        if (/Manajemen|Ekonomi|Akuntansi/i.test(prodi)) return 'Fakultas Ekonomi & Bisnis';
        if (/Pendidikan|Guru|FKIP/i.test(prodi)) return 'Fakultas Keguruan & Ilmu Pendidikan';
        return 'Fakultas Terkait';
      };

      const studentName = simabaMatch ? simabaMatch.nama_mahasiswa : (siakadMatch ? siakadMatch.nama_lengkap : (selectedStudent ? selectedStudent.nama_mahasiswa : 'Calon Mahasiswa Baru'));
      const studentNoReg = simabaMatch ? simabaMatch.nomor_pendaftaran : (selectedStudent ? selectedStudent.nomor_pendaftaran : cleanReg);
      const isKip = simabaMatch
        ? simabaMatch.jenis_mahasiswa === 'kip'
        : (siakadMatch ? siakadMatch.kategori_beasiswa === 'kip' : (selectedStudent ? selectedStudent.jenis_mahasiswa === 'kip' : false));

      const studentProdi = simabaMatch ? simabaMatch.program_studi : (siakadMatch ? siakadMatch.program_studi : (selectedStudent ? selectedStudent.program_studi : 'Teknik Informatika'));
      const studentFakultas = siakadMatch?.fakultas || computeFakultas(studentProdi);
      const studentPhone = simabaMatch?.no_hp || siakadMatch?.nomor_telepon || (selectedStudent?.no_hp) || '';
      const studentEmail = simabaMatch?.email || siakadMatch?.email || (selectedStudent?.email) || '';
      const studentNik = simabaMatch?.nik || siakadMatch?.nik || (selectedStudent?.nik) || '';
      const rawGender = simabaMatch?.jenis_kelamin || siakadMatch?.jenis_kelamin || selectedStudent?.jenis_kelamin;
      const studentGender = rawGender === 'P' || rawGender === 'Perempuan' ? 'Perempuan' : 'Laki-laki';
      const studentAlamat = simabaMatch?.alamat || siakadMatch?.alamat_lengkap || selectedStudent?.alamat || '';
      const studentTglLahir = simabaMatch?.tanggal_lahir_formatted || selectedStudent?.tanggal_lahir_formatted || cleanBirth;
      const studentTempatLahir = simabaMatch?.tempat_lahir || siakadMatch?.tempat_lahir || selectedStudent?.tempat_lahir || 'TARAKAN';
      const studentKipNumber = isKip ? (simabaMatch?.nomorkip || siakadMatch?.nomorkip || selectedStudent?.nomorkip || studentNoReg) : undefined;
      const ssoId = siakadMatch?.sso_id_from_sidara !== undefined ? String(siakadMatch.sso_id_from_sidara) : undefined;

      const profilePayload: Partial<MabaProfile> = {
        nama: studentName,
        noPmb: studentNoReg,
        nim: siakadMatch?.has_active_nim && siakadMatch?.nim_resmi ? siakadMatch.nim_resmi : '',
        nik: studentNik,
        prodi: studentProdi,
        fakultas: studentFakultas,
        jenisKelamin: studentGender,
        noHpWa: studentPhone,
        email: studentEmail,
        alamatKtpJalan: studentAlamat,
        alamatDomisiliJalan: studentAlamat,
        isKipStudent: isKip,
        kategori: isKip ? 'KIP-Kuliah' : 'Reguler',
        kipNumber: studentKipNumber,
        tempatLahir: studentTempatLahir,
        tanggalLahirFormatted: studentTglLahir,
        ssoIdFromSidara: ssoId,
        kycVerified: false,
        kycSubmitted: false,
      };

      onLoginSuccess('maba', studentNoReg, studentName, undefined, selectedScenario, profilePayload);
    }, 500);
  };

  const handleSsoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (ssoUsername.trim().length < 5) {
      setErrorMessage('Kredensial Single Sign On (SSO) NIM tidak valid.');
      return;
    }

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
          setShowRedirectModal(true);
        } else {
          onLoginSuccess('eksisting', ssoUsername, 'Ahmad Raihan', undefined, selectedSsoAccount);
        }
      }, 600);
    }, 500);
  };

  const handleProceedToRegistration = () => {
    setShowRedirectModal(false);
    const matched = INITIAL_SIAKAD_STAGING.find(
      (s) => s.nomor_registrasi === ssoUsername || s.nim_resmi === ssoUsername
    );
    const studentName = matched ? matched.nama_lengkap : 'Mahasiswa Aktif UBT';
    const scenario = 'SMART_PREFILL';

    const computeFakultas = (prodi: string) => {
      if (/Gizi|Kesehatan|Keperawatan|Kebidanan|Farmasi/i.test(prodi)) return 'Fakultas Ilmu Kesehatan';
      if (/Hukum/i.test(prodi)) return 'Fakultas Hukum';
      if (/Informatika|Teknik|Komputer/i.test(prodi)) return 'Fakultas Teknik';
      if (/Manajemen|Ekonomi|Akuntansi/i.test(prodi)) return 'Fakultas Ekonomi & Bisnis';
      if (/Pendidikan|Guru|FKIP/i.test(prodi)) return 'Fakultas Keguruan & Ilmu Pendidikan';
      return 'Fakultas Terkait';
    };

    const isKip = matched ? matched.kategori_beasiswa === 'kip' : false;
    const studentProdi = matched?.program_studi || 'S1 Teknik Informatika';
    const studentFakultas = matched?.fakultas || computeFakultas(studentProdi);
    const gender = matched?.jenis_kelamin === 'P' ? 'Perempuan' : 'Laki-laki';

    const ssoProfilePayload: Partial<MabaProfile> = {
      nama: studentName,
      nim: matched?.nim_resmi || ssoUsername,
      noPmb: matched?.nomor_registrasi || ssoUsername,
      nik: matched?.nik || '',
      prodi: studentProdi,
      fakultas: studentFakultas,
      jenisKelamin: gender,
      noHpWa: matched?.nomor_telepon || '',
      email: matched?.email || '',
      alamatKtpJalan: matched?.alamat_lengkap || '',
      alamatDomisiliJalan: matched?.alamat_lengkap || '',
      isKipStudent: isKip,
      kategori: isKip ? 'KIP-Kuliah' : 'Reguler',
      kipNumber: isKip ? (matched?.nomorkip || ssoUsername) : undefined,
      ssoIdFromSidara: matched?.sso_id_from_sidara !== undefined ? String(matched.sso_id_from_sidara) : undefined,
      ssoSource: 'SIAKAD_SIDARA',
      isFastTrackSso: false,
      isKycRequired: true,
      kycVerified: false,
      kycSubmitted: false,
    };

    onLoginSuccess(
      'maba',
      ssoUsername,
      studentName,
      `SSO SIAKAD terverifikasi (NIM ${ssoUsername}). Silakan lengkapi validasi identitas di Tahap 1.`,
      scenario,
      ssoProfilePayload
    );
  };

  /* =========================================================================
     CABANG 1: CLEAN UI / TESTING MODE (ARSITEKTUR RESMI MINGGU LALU)
     ========================================================================= */
  if (isCleanTesting) {
    return (
      <div id="clean-landing-container" className="w-full flex flex-col items-center justify-center py-4 sm:py-8">
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-sm p-6 sm:p-8 space-y-6">
          {/* Header Clean Card */}
          <div className="text-center space-y-2 border-b border-slate-100 pb-5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span>Portal Resmi Asrama Mahasiswa · UBT</span>
            </div>
            <h2 className="text-xl font-black tracking-tight text-slate-900">
              Gerbang Masuk SI-GABUNG 54
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Layanan Pendaftaran Asrama, Seleksi Kamar & Verifikasi Berkas e-KYC
            </p>
            <p className="text-[11px] text-teal-800 font-semibold tracking-wide">
              Universitas Bunda Thamrin
            </p>
          </div>

          {/* Segmented Tab Switch (PMB vs SSO) */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
            <button
              id="clean-tab-pmb"
              type="button"
              onClick={() => {
                setCleanLoginTab('pmb');
                setErrorMessage('');
                setShowNameSuggestions(false);
              }}
              className={`py-2 rounded-lg transition-all cursor-pointer text-center ${
                cleanLoginTab === 'pmb'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pendaftaran PMB
            </button>
            <button
              id="clean-tab-sso"
              type="button"
              onClick={() => {
                setCleanLoginTab('sso');
                setErrorMessage('');
                setShowNameSuggestions(false);
              }}
              className={`py-2 rounded-lg transition-all cursor-pointer text-center ${
                cleanLoginTab === 'sso'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Login SSO Kampus
            </button>
          </div>

          {/* TAB 1: FORM PENDAFTARAN PMB DENGAN LIVE QUERY SIMABA BERDASARKAN NAMA */}
          {cleanLoginTab === 'pmb' ? (
            <form id="form-clean-pmb" onSubmit={handleMabaSubmit} className="space-y-4">
              <div className="relative" ref={suggestionsRef}>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Search className="w-3.5 h-3.5 text-teal-600" />
                    <span>Nama Calon Mahasiswa / No. PMB</span>
                  </label>
                  <span className="text-[10px] font-semibold text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <Database className="w-3 h-3 text-teal-600" />
                    Live Query SIMABA
                  </span>
                </div>

                <div className="relative">
                  <input
                    id="clean-input-pmb"
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
                    placeholder="Ketik nama (Grace, Jenny, Alvin, Maza) atau No. PMB..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-3.5 pr-9 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-teal-700 focus:bg-white font-medium shadow-xs"
                    required
                  />
                  {isSearching && (
                    <div className="absolute right-3 top-3">
                      <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
                    </div>
                  )}
                </div>

                {/* DROPDOWN AUTO-SUGGEST DENGAN KEYBOARD NAVIGATION */}
                {showNameSuggestions && filteredStudents.length > 0 && !selectedStudent && (
                  <div
                    id="clean-suggestions-dropdown"
                    className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-300 rounded-xl shadow-xl z-30 max-h-56 overflow-y-auto divide-y divide-slate-100"
                  >
                    {filteredStudents.map((s, idx) => {
                      const isFocused = idx === activeSuggestionIndex;
                      return (
                        <div
                          key={s.id || idx}
                          id={`suggestion-item-${idx}`}
                          onClick={() => handleSelectStudent(s)}
                          onMouseEnter={() => setActiveSuggestionIndex(idx)}
                          className={`p-2.5 text-xs transition-colors cursor-pointer flex items-center justify-between ${
                            isFocused
                              ? 'bg-teal-50 text-teal-950 font-bold'
                              : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div className="min-w-0 pr-2">
                            <div className="font-bold text-slate-900 truncate">
                              {highlightMatch(s.nama_mahasiswa, debouncedSearch)}
                            </div>
                            <div className="text-[10px] text-slate-500 mt-0.5 truncate">
                              No. PMB: <span className="font-mono">{highlightMatch(s.nomor_pendaftaran, debouncedSearch)}</span> · {s.program_studi}
                            </div>
                          </div>
                          <span
                            className={`text-[9px] font-semibold px-2 py-0.5 rounded shrink-0 ${
                              s.jenis_mahasiswa === 'kip'
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : 'bg-slate-100 text-slate-700 border border-slate-200'
                            }`}
                          >
                            {s.jenis_mahasiswa === 'kip' ? 'KIP-Kuliah' : 'Reguler'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* VERIFIED STUDENT BADGE CHIP */}
                {selectedStudent && (
                  <div className="mt-2 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-950 animate-in fade-in">
                    <div className="flex items-center gap-2 min-w-0">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div className="truncate">
                        <span className="font-bold">{selectedStudent.nama_mahasiswa}</span>
                        <span className="text-[11px] text-emerald-800 ml-1.5 font-medium truncate">
                          ({selectedStudent.program_studi} · Tgl Lahir otomatis terisi)
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleResetSelectedStudent}
                      className="text-[10px] font-bold text-emerald-700 hover:text-emerald-900 underline shrink-0 ml-2 cursor-pointer"
                    >
                      Ganti
                    </button>
                  </div>
                )}

                <p className="text-[11px] text-slate-500 mt-1.5 flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>Ketik minimal 2 huruf nama untuk mencari otomatis dari pangkalan data PMB.</span>
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Tanggal Lahir (DD/MM/YYYY)
                </label>
                <div className="relative">
                  <input
                    id="clean-input-birthdate"
                    type="text"
                    value={mabaBirthDate}
                    onChange={(e) => handleBirthDateChange(e.target.value)}
                    placeholder="DD/MM/YYYY"
                    maxLength={10}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-teal-700 focus:bg-white font-mono shadow-xs"
                    required
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Format: Hari/Bulan/Tahun (Contoh: 12/02/2008 atau 15/04/2005).
                </p>
              </div>

              {errorMessage && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-3 text-xs flex items-start gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <button
                id="clean-button-submit-pmb"
                type="submit"
                disabled={isLoading}
                className="w-full bg-teal-800 hover:bg-teal-700 disabled:opacity-60 text-white font-bold py-3 rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer min-h-[46px]"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Memverifikasi Database SIMABA & SIAKAD...</span>
                  </span>
                ) : (
                  <>
                    <span>Masuk Portal Pendaftaran Asrama</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* TAB 2: FORM LOGIN SSO KAMPUS */
            <form id="form-clean-sso" onSubmit={handleSsoSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  NIM Mahasiswa Aktif SIAKAD
                </label>
                <input
                  id="clean-input-sso-username"
                  type="text"
                  value={ssoUsername}
                  onChange={(e) => setSsoUsername(e.target.value)}
                  placeholder="Contoh: 2240101004"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-teal-700 focus:bg-white font-mono shadow-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Password SSO
                </label>
                <input
                  id="clean-input-sso-password"
                  type="password"
                  value={ssoPassword}
                  onChange={(e) => setSsoPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-teal-700 focus:bg-white shadow-xs"
                  required
                />
              </div>

              {errorMessage && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-3 text-xs flex items-start gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <button
                id="clean-button-submit-sso"
                type="submit"
                disabled={isCheckingSsoDb}
                className="w-full bg-teal-800 hover:bg-teal-700 disabled:opacity-60 text-white font-bold py-3 rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer min-h-[46px]"
              >
                {isCheckingSsoDb ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verifikasi SSO SIAKAD...</span>
                  </span>
                ) : (
                  <>
                    <span>Masuk via SSO Kampus</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Database & Institutional Footer Note */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1 text-emerald-800 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Basis Data: MySQL Laragon
            </span>
            <span className="font-mono text-slate-400 text-[10px]">
              asrama_ubt_db & simaba
            </span>
          </div>
        </div>

        {/* MODAL JIKA TERDETEKSI NIM RESMI (EARLY DETECTION) */}
        {showNimDetectedModal && detectedNimStudent && (
          <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 sm:p-7 max-w-md w-full border border-slate-200 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
              <div className="flex items-center gap-3 text-emerald-800">
                <BadgeCheck className="w-6 h-6 text-emerald-600 shrink-0" />
                <h3 className="text-base font-bold text-slate-900">
                  NIM Resmi Terbit di SIAKAD
                </h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                NIM Resmi Anda <span className="font-mono font-bold text-slate-900">{detectedNimStudent.nim_resmi}</span> telah aktif di sistem SIAKAD/SIDARA. Anda dapat langsung melanjutkan pendaftaran asrama.
              </p>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNimDetectedModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowNimDetectedModal(false);
                    const computeFakultas = (prodi: string) => {
                      if (/Gizi|Kesehatan|Keperawatan|Kebidanan|Farmasi/i.test(prodi)) return 'Fakultas Ilmu Kesehatan';
                      if (/Hukum/i.test(prodi)) return 'Fakultas Hukum';
                      if (/Informatika|Teknik|Komputer/i.test(prodi)) return 'Fakultas Teknik';
                      if (/Manajemen|Ekonomi|Akuntansi/i.test(prodi)) return 'Fakultas Ekonomi & Bisnis';
                      if (/Pendidikan|Guru|FKIP/i.test(prodi)) return 'Fakultas Keguruan & Ilmu Pendidikan';
                      return 'Fakultas Terkait';
                    };
                    const isKip = detectedNimStudent.kategori_beasiswa === 'kip';
                    const payload: Partial<MabaProfile> = {
                      nama: detectedNimStudent.nama_lengkap,
                      nim: detectedNimStudent.nim_resmi,
                      noPmb: detectedNimStudent.nomor_registrasi,
                      nik: detectedNimStudent.nik,
                      prodi: detectedNimStudent.program_studi,
                      fakultas: detectedNimStudent.fakultas || computeFakultas(detectedNimStudent.program_studi),
                      jenisKelamin: detectedNimStudent.jenis_kelamin === 'P' ? 'Perempuan' : 'Laki-laki',
                      noHpWa: detectedNimStudent.nomor_telepon || '',
                      email: detectedNimStudent.email || '',
                      alamatKtpJalan: detectedNimStudent.alamat_lengkap || '',
                      alamatDomisiliJalan: detectedNimStudent.alamat_lengkap || '',
                      isKipStudent: isKip,
                      kategori: isKip ? 'KIP-Kuliah' : 'Reguler',
                      kipNumber: isKip ? (detectedNimStudent.nomorkip || detectedNimStudent.nim_resmi) : undefined,
                      ssoIdFromSidara: detectedNimStudent.sso_id_from_sidara !== undefined ? String(detectedNimStudent.sso_id_from_sidara) : undefined,
                      ssoSource: 'SIAKAD_SIDARA',
                      kycVerified: false,
                      kycSubmitted: false,
                    };
                    onLoginSuccess(
                      'maba',
                      detectedNimStudent.nim_resmi,
                      detectedNimStudent.nama_lengkap,
                      `NIM Resmi (${detectedNimStudent.nim_resmi}) telah tersinkronisasi.`,
                      'SMART_PREFILL',
                      payload
                    );
                  }}
                  className="px-4 py-2 text-xs font-bold text-white bg-teal-800 hover:bg-teal-700 rounded-lg shadow-xs cursor-pointer"
                >
                  Lanjut dengan NIM Resmi
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL REDIRECTION FOR NON-ACTIVE RESIDENT SSO */}
        {showRedirectModal && (
          <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 sm:p-7 max-w-md w-full border border-slate-200 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
              <div className="flex items-center gap-3 text-teal-800">
                <GraduationCap className="w-6 h-6 text-teal-600 shrink-0" />
                <h3 className="text-base font-bold text-slate-900">
                  Verifikasi Akun SIAKAD
                </h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Akun SSO NIM <span className="font-mono font-bold text-slate-900">{ssoUsername}</span> terverifikasi aktif di SIAKAD UBT namun belum terdaftar sebagai penghuni asrama. Silakan lanjutkan pendaftaran kamar asrama.
              </p>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRedirectModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  onClick={handleProceedToRegistration}
                  className="px-4 py-2 text-xs font-bold text-white bg-teal-800 hover:bg-teal-700 rounded-lg shadow-xs cursor-pointer"
                >
                  Lanjut Pendaftaran Asrama
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  /* =========================================================================
     CABANG 2: STANDARD / MULTI-ROLE DESIGN (ARSITEKTUR LENGKAP MINGGU LALU)
     ========================================================================= */
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
                Universitas Bunda Thamrin
              </p>
              <p className="text-xs text-teal-100/80 leading-relaxed pt-2 border-t border-teal-800/50">
                Silakan masuk menggunakan akun PMB (SIMABA) atau SSO kampus (NIM Mahasiswa).
              </p>
            </div>

            <div className="space-y-2.5 pt-2 hidden sm:block">
              <div className="flex items-center space-x-2 text-xs text-teal-50">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Single Sign-On (SSO) Terintegrasi SIAKAD</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-teal-50">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Penerbitan Kontrak Digital Otomatis</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-teal-50">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Sistem Pembayaran Terverifikasi</span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-teal-800/60 hidden sm:flex items-center justify-between text-[11px] text-teal-300">
            <span>MySQL: asrama_ubt_db & simaba</span>
            <span>&copy; 2026 Universitas Bunda Thamrin</span>
          </div>
        </div>

        {/* Right Form Panel */}
        <div id="login-form-panel" className="flex-1 md:col-span-7 bg-white p-6 sm:p-8 flex flex-col justify-center">
          {viewMode === 'main' && (
            <div className="max-w-md w-full mx-auto space-y-6">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-teal-50 text-teal-700 rounded-full flex items-center justify-center mx-auto border border-teal-200">
                  <LogIn className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-black text-slate-800">Selamat Datang</h3>
                <p className="text-sm text-slate-500">Silakan login menggunakan akun SSO Mahasiswa (NIM)</p>
              </div>
              
              <div className="space-y-4 pt-4">
                <button
                  onClick={handleSsoRedirectClick}
                  className="w-full bg-gradient-to-r from-teal-800 to-emerald-700 hover:from-teal-900 hover:to-emerald-800 text-white font-bold py-3.5 rounded-xl text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <span>Login SSO Mahasiswa (NIM)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="flex items-center justify-center space-x-3 py-2">
                  <div className="h-px bg-slate-200 flex-1"></div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ATAU</span>
                  <div className="h-px bg-slate-200 flex-1"></div>
                </div>

                <button
                  onClick={handleOpenPmb}
                  className="w-full bg-white border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-bold py-3.5 rounded-xl text-sm transition-all flex items-center justify-center cursor-pointer"
                >
                  Pendaftaran Asrama (Jalur PMB)
                </button>
              </div>

              {/* DEMO PERSONA JUMPER (STANDARD MODE) */}
              <div className="pt-4 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-400 block mb-2">Akses Cepat Pengujian:</span>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <button
                    type="button"
                    onClick={() => onLoginSuccess('admin_asrama', 'admin_asrama', 'Pengelola Asrama UBT')}
                    className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-left font-semibold cursor-pointer"
                  >
                    Admin Asrama
                  </button>
                  <button
                    type="button"
                    onClick={() => onLoginSuccess('admin_keuangan', 'admin_keuangan', 'Admin Keuangan UBT')}
                    className="p-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 text-left font-semibold cursor-pointer"
                  >
                    Admin Keuangan
                  </button>
                </div>
              </div>
            </div>
          )}

          {viewMode === 'sso' && (
            <div className="max-w-md w-full mx-auto">
              <button 
                onClick={() => setViewMode('main')} 
                className="mb-6 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-500 flex items-center gap-2 hover:text-slate-800 hover:bg-slate-50 transition-colors shadow-sm inline-flex cursor-pointer"
              >
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

                {/* SIMULATOR PILIHAN STATUS RESIDEN */}
                <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl space-y-2">
                  <label className="text-[11px] font-bold text-slate-800 flex items-center justify-between">
                    <span>Simulasi Status Database Mahasiswa:</span>
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
                        Ahmad Zaky • Data SIAKAD Lengkap
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
                        Ahmad Raihan • Kamar 101 Gedung A
                      </div>
                    </button>
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
                    className="w-full bg-teal-800 hover:bg-teal-700 disabled:opacity-60 text-white font-bold py-2.5 rounded-lg text-sm transition-all flex items-center justify-center space-x-2 shadow-md cursor-pointer"
                  >
                    {isCheckingSsoDb ? (
                      <span className="flex items-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin text-teal-200" />
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
        </div>
      </div>

      {/* MODAL PMB STANDAR (JALUR PMB POPUP) */}
      {showPmbModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 sm:p-0">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden relative animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white/90 backdrop-blur-md flex items-center justify-between p-6 border-b border-slate-100 z-10">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Pendaftaran Maba</h3>
                <p className="text-xs text-slate-500">Jalur Penerimaan Mahasiswa Baru · UBT</p>
              </div>
              <button 
                onClick={() => setShowPmbModal(false)} 
                className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 bg-slate-50/50">
              <form id="form-maba-login" onSubmit={handleMabaSubmit} className="space-y-4">
                <div className="bg-teal-50 border border-teal-200 rounded-xl p-3 text-xs text-teal-900 flex items-start space-x-2.5">
                  <Sparkles className="w-4 h-4 text-teal-700 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block text-teal-950">Klaim Identitas PMB SIMABA (u540633926_simaba)</span>
                    Ketik nama lengkap Anda untuk mendeteksi nomor pendaftaran secara otomatis, atau masukkan nomor pendaftaran langsung.
                  </div>
                </div>

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
                      placeholder="Ketik nama (Grace, Jenny, Alvin) atau No. PMB..."
                      className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-teal-700 font-medium shadow-xs"
                      required
                    />
                  </div>

                  {showNameSuggestions && filteredStudents.length > 0 && !selectedStudent && (
                    <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-300 rounded-xl shadow-xl z-30 max-h-56 overflow-y-auto divide-y divide-slate-100">
                      {filteredStudents.map((s, idx) => {
                        const isFocused = idx === activeSuggestionIndex;
                        return (
                          <div
                            key={s.id || idx}
                            onClick={() => handleSelectStudent(s)}
                            onMouseEnter={() => setActiveSuggestionIndex(idx)}
                            className={`p-2.5 text-xs transition-colors cursor-pointer flex items-center justify-between ${
                              isFocused ? 'bg-teal-50 text-teal-950 font-bold' : 'hover:bg-slate-50 text-slate-700'
                            }`}
                          >
                            <div className="min-w-0 pr-2">
                              <div className="font-bold text-slate-900 truncate">{s.nama_mahasiswa}</div>
                              <div className="text-[10px] text-slate-500 mt-0.5 truncate">
                                No. PMB: {s.nomor_pendaftaran} · {s.program_studi}
                              </div>
                            </div>
                            <span className="text-[9px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 shrink-0">
                              {s.jenis_mahasiswa === 'kip' ? 'KIP-Kuliah' : 'Reguler'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {selectedStudent && (
                    <div className="mt-2 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-950">
                      <div className="truncate">
                        <span className="font-bold">{selectedStudent.nama_mahasiswa}</span>
                        <span className="text-[11px] text-emerald-800 ml-1.5 font-medium truncate">
                          ({selectedStudent.program_studi} · Tgl Lahir otomatis terisi)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleResetSelectedStudent}
                        className="text-[10px] font-bold text-emerald-700 hover:text-emerald-900 underline shrink-0 ml-2 cursor-pointer"
                      >
                        Ganti
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Tanggal Lahir (DD/MM/YYYY)
                  </label>
                  <input
                    id="input-maba-birthdate"
                    type="text"
                    value={mabaBirthDate}
                    onChange={(e) => handleBirthDateChange(e.target.value)}
                    placeholder="DD/MM/YYYY"
                    maxLength={10}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-teal-700 font-mono shadow-xs"
                    required
                  />
                </div>

                {errorMessage && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-3 text-xs flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-teal-800 hover:bg-teal-700 disabled:opacity-60 text-white font-bold py-3 rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Memverifikasi Database...</span>
                    </span>
                  ) : (
                    <>
                      <span>Masuk Portal Pendaftaran Asrama</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* OVERLAY SIMULATING SSO REDIRECT */}
      {isRedirectingSso && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-sm w-full border border-slate-200 shadow-2xl flex flex-col items-center justify-center text-center space-y-4">
            <Loader2 className="w-10 h-10 text-teal-700 animate-spin" />
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
    </div>
  );
};