import { BastkStep } from "./BastkStep";
import { QRCodeSVG } from 'qrcode.react';
import { jsPDF } from 'jspdf';
import { toast } from 'sonner';
import React, { useState, useRef } from 'react';
import SignaturePad from 'react-signature-canvas';
import * as tf from '@tensorflow/tfjs';
import * as blazeface from '@tensorflow-models/blazeface';
import {
  MabaProfile,
  BillingInvoice,
  RoomPlot,
  DigitalContract,
  ETicket,
  AdmissionStep,
} from '../../types/asrama';
import { AutoResumeBanner } from '../common/AutoResumeBanner';
import { StudentInvoiceSummary } from './StudentInvoiceSummary';
import { VisualProgressIndicator } from './VisualProgressIndicator';
import { AuditLogView } from '../shared/AuditLogView';
import { DigitalContractView } from './DigitalContractView';
import { IndonesianRegionSelector } from './IndonesianRegionSelector';
import {
  CheckCircle2,
  XCircle,
  Scan,
  FileCheck,
  CreditCard,
  Building,
  FileSignature,
  QrCode,
  Lock,
  Upload,
  ShieldAlert,
  PhoneCall,
  Check,
  Copy,
  AlertTriangle,
  RefreshCw,
  Loader2,
  ExternalLink,
  Zap,
  Camera,
  RotateCcw,
  X,
  Smartphone,
  Bed,
  BookmarkCheck,
  Bookmark,
  Image as ImageIcon,
  Trash2,
  UserCheck,
  Printer,
  FileText,
  MapPin,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  History,
  Clock,
  HelpCircle,
  Info,
  Download,
  MessageCircle,
  FileEdit,
  Unlock,
  PenTool,
  Ticket,
  Calculator,
  AlertCircle,
  Settings2,
  Sparkles,
  Save,
} from 'lucide-react';

import { AddressForm } from './AddressForm';
import { useFormValidation } from '../../hooks/useFormValidation';
import { CaptureComponent } from '../shared/CaptureComponent';
import { VerifikasiTrail, VerificationAttempt } from './VerifikasiTrail';

import { TariffItem, PaymentScheme } from '../../types/asrama';

interface MabaDashboardProps {
  tariffs?: TariffItem[];
  paymentSchemes?: PaymentScheme[];
  profile: MabaProfile | any;
  invoice: BillingInvoice;
  room?: RoomPlot;
  contract: DigitalContract;
  ticket: ETicket;
  ssoNoticeBanner?: string;
  onClearSsoNotice?: () => void;
  onUpdateInvoice: (updated: BillingInvoice) => void;
  onUpdateContract: (updated: DigitalContract) => void;
  onUpdateTicket: (updated: ETicket) => void;
  onUpdateProfile?: (updated: MabaProfile) => void;
}

const getInitialStep = (
  profile: MabaProfile,
  invoice: BillingInvoice,
  room: RoomPlot | undefined,
  contract: DigitalContract,
  ticket: ETicket | undefined
): AdmissionStep => {
  if (ticket?.status === 'ACTIVE') return 6;
  if (contract.status === 'SIGNED' || contract.status === 'OTP_SENT') return 5;
  const hasValidNim = profile.nim && !profile.nim.startsWith('REG') && !profile.nim.startsWith('PMB');
  if (room && invoice.status === 'PAID' && hasValidNim) return 5;
  if (invoice.status === 'PAID') return 4;
  if (invoice.status === 'PENDING_VERIFICATION') return 3;
  if (profile.kycVerified && invoice.status === 'UNPAID') {
    if (invoice.totalBayar > 0) return 3;
    return 2;
  }
  if (profile.kycVerified) return 3;
  return 1;
};

export const MabaDashboard: React.FC<MabaDashboardProps> = ({
  profile: initialProfile,
  invoice: initialInvoice,
  room,
  contract: initialContract,
  ticket,
  ssoNoticeBanner,
  onClearSsoNotice,
  onUpdateInvoice,
  onUpdateContract,
  onUpdateTicket,
  tariffs = [],
  paymentSchemes = [],
  onUpdateProfile,
}) => {
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [showBastk, setShowBastk] = useState(false);
  const [currentStep, setCurrentStep] = useState<AdmissionStep>(
    getInitialStep(initialProfile, initialInvoice, room, initialContract, ticket)
  );

  const signaturePadRef = useRef<any>(null);
  const getMacroByStep = (step: AdmissionStep) => {
    if (step === 1) return 1;
    if (step === 2 || step === 3) return 2;
    if (step === 4 || step === 5) return 3;
    if (step === 6) return 4;
    return 1;
  };

  const [expandedMacro, setExpandedMacro] = useState<number>(getMacroByStep(currentStep));

  // State refs for toast notifications
  const prevInvoiceStatus = useRef(initialInvoice.status);
  const prevContractStatus = useRef(initialContract.status);

  // Sync props to local state if they change from outside (e.g. admin approval)
  React.useEffect(() => {
    setInvoice(initialInvoice);
    if (prevInvoiceStatus.current !== 'PAID' && initialInvoice.status === 'PAID') {
      toast.success('Pembayaran Anda telah diverifikasi oleh Admin Keuangan!', { duration: 5000 });
    }
    prevInvoiceStatus.current = initialInvoice.status;
  }, [initialInvoice]);

  React.useEffect(() => {
    setContract(initialContract);
    if (prevContractStatus.current !== 'SIGNED' && initialContract.status === 'SIGNED') {
      toast.success('Pemberian kuasa berhasil. Anda telah dimasukkan ke dalam Batch Kontrak Kolektif.', { duration: 5000 });
    }
    prevContractStatus.current = initialContract.status;
  }, [initialContract]);

  React.useEffect(() => {
    const macroId = getMacroByStep(currentStep);
    setExpandedMacro(macroId);
    
    // Scroll active macro into view on mobile
    setTimeout(() => {
      const container = document.getElementById('macro-stepper-container');
      const element = document.getElementById(`macro-step-${macroId}`);
      if (container && element) {
        const scrollLeft = element.offsetLeft - container.offsetLeft - (container.offsetWidth / 2) + (element.offsetWidth / 2);
        container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
      }
    }, 100); // small delay to ensure DOM is ready
  }, [currentStep]);

  // Helper to generate unique storage key for student draft
  const getDraftStorageKey = (nim?: string, pmb?: string) => {
    const id = (nim && !nim.startsWith('REG') && nim !== 'Belum tersedia' ? nim : '') || pmb || nim || 'default';
    return `mabaProfileDraft_${id}`;
  };

  // Profile & e-KYC State with Draft Auto-Recovery
  const [profile, setProfile] = useState<any>(() => {
    const draftKey = getDraftStorageKey(initialProfile.nim, initialProfile.noPmb);
    const saved = localStorage.getItem(draftKey) || localStorage.getItem(`mabaProfileDraft_${initialProfile.nim}`);
    if (saved && (!initialProfile.kycSubmitted || initialProfile.correctionStatus === 'unlocked')) {
      try {
        const parsed = JSON.parse(saved);
        const draftProfile = parsed.profile ? parsed.profile : parsed;
        return { ...initialProfile, ...draftProfile };
      } catch (e) {
        return initialProfile;
      }
    }
    return initialProfile;
  });

  const [hasRestoredDraft, setHasRestoredDraft] = useState<boolean>(() => {
    const draftKey = getDraftStorageKey(initialProfile.nim, initialProfile.noPmb);
    const saved = localStorage.getItem(draftKey) || localStorage.getItem(`mabaProfileDraft_${initialProfile.nim}`);
    if (saved && (!initialProfile.kycSubmitted || initialProfile.correctionStatus === 'unlocked')) {
      try {
        const parsed = JSON.parse(saved);
        const draftProfile = parsed.profile ? parsed.profile : parsed;
        // Check if there are user-filled inputs in draft
        return !!(parsed.savedAt || draftProfile.alamatKtpJalan || draftProfile.email || draftProfile.noHpWa || draftProfile.kontakDaruratNama);
      } catch {
        return false;
      }
    }
    return false;
  });

  const [lastSavedTime, setLastSavedTime] = useState<Date | null>(() => {
    const draftKey = getDraftStorageKey(initialProfile.nim, initialProfile.noPmb);
    const saved = localStorage.getItem(draftKey) || localStorage.getItem(`mabaProfileDraft_${initialProfile.nim}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.savedAt ? new Date(parsed.savedAt) : new Date();
      } catch {
        return null;
      }
    }
    return null;
  });

  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'restored'>(() => {
    const draftKey = getDraftStorageKey(initialProfile.nim, initialProfile.noPmb);
    const saved = localStorage.getItem(draftKey) || localStorage.getItem(`mabaProfileDraft_${initialProfile.nim}`);
    return saved && (!initialProfile.kycSubmitted || initialProfile.correctionStatus === 'unlocked') ? 'restored' : 'idle';
  });

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialMountRef = useRef<boolean>(true);
  const latestProfileRef = useRef(profile);
  latestProfileRef.current = profile;

  const [ktpFileName, setKtpFileName] = useState<string>(() => {
    if (profile.ktpUrl) return 'KTP_Scan_File.jpg';
    const draftKey = getDraftStorageKey(initialProfile.nim, initialProfile.noPmb);
    const savedDraft = localStorage.getItem(draftKey);
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        if (parsed.ktpFileName) return parsed.ktpFileName;
      } catch {}
    }
    const legacy = localStorage.getItem(`mabaKtpNameDraft_${initialProfile.nim}`);
    return legacy && !initialProfile.kycSubmitted ? legacy : '';
  });

  const [selfieFileName, setSelfieFileName] = useState<string>(() => {
    if (profile.selfieUrl) return 'Selfie_KTP_File.jpg';
    const draftKey = getDraftStorageKey(initialProfile.nim, initialProfile.noPmb);
    const savedDraft = localStorage.getItem(draftKey);
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        if (parsed.selfieFileName) return parsed.selfieFileName;
      } catch {}
    }
    const legacy = localStorage.getItem(`mabaSelfieNameDraft_${initialProfile.nim}`);
    return legacy && !initialProfile.kycSubmitted ? legacy : '';
  });

  // Keep local state in sync if initialProfile changes from external prop
  React.useEffect(() => {
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      return;
    }
    const draftKey = getDraftStorageKey(initialProfile.nim, initialProfile.noPmb);
    const saved = localStorage.getItem(draftKey) || localStorage.getItem(`mabaProfileDraft_${initialProfile.nim}`);
    if (saved && (!initialProfile.kycSubmitted || initialProfile.correctionStatus === 'unlocked')) {
      try {
        const parsed = JSON.parse(saved);
        const draftProfile = parsed.profile ? parsed.profile : parsed;
        setProfile({ ...initialProfile, ...draftProfile });
        if (parsed.savedAt) {
          setLastSavedTime(new Date(parsed.savedAt));
          setHasRestoredDraft(true);
          setAutoSaveStatus('restored');
        }
        return;
      } catch (e) {
        // ignore
      }
    }
    setProfile(initialProfile);
    setHasRestoredDraft(false);
    setAutoSaveStatus('idle');
  }, [initialProfile.nim, initialProfile.noPmb, initialProfile.kycSubmitted]);

  // Synchronous saver to persist profile snapshot to localStorage
  const saveDraftToStorage = React.useCallback((currentProfile: any, ktpName?: string, selfieName?: string) => {
    if (currentProfile.kycSubmitted && currentProfile.correctionStatus !== 'unlocked') {
      return;
    }
    try {
      const draftKey = getDraftStorageKey(currentProfile.nim, currentProfile.noPmb);
      const payload = {
        profile: currentProfile,
        ktpFileName: ktpName || '',
        selfieFileName: selfieName || '',
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem(draftKey, JSON.stringify(payload));
      localStorage.setItem(`mabaProfileDraft_${currentProfile.nim}`, JSON.stringify(currentProfile));
      if (ktpName) localStorage.setItem(`mabaKtpNameDraft_${currentProfile.nim}`, ktpName);
      if (selfieName) localStorage.setItem(`mabaSelfieNameDraft_${currentProfile.nim}`, selfieName);
      setLastSavedTime(new Date());
      setAutoSaveStatus('saved');
    } catch (err) {
      console.warn('Auto-save error while saving to localStorage:', err);
    }
  }, []);

  // Debounced auto-save effect (500ms debounce delay)
  React.useEffect(() => {
    if (profile.kycSubmitted && profile.correctionStatus !== 'unlocked') {
      return;
    }

    setAutoSaveStatus('saving');

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      saveDraftToStorage(profile, ktpFileName, selfieFileName);
    }, 500);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [profile, ktpFileName, selfieFileName, saveDraftToStorage]);

  // Synchronous flush on page refresh / tab close (beforeunload) to ensure zero data loss
  React.useEffect(() => {
    const handleBeforeUnload = () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (!latestProfileRef.current.kycSubmitted || latestProfileRef.current.correctionStatus === 'unlocked') {
        saveDraftToStorage(latestProfileRef.current, ktpFileName, selfieFileName);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      handleBeforeUnload();
    };
  }, [ktpFileName, selfieFileName, saveDraftToStorage]);

  const handleManualSaveDraft = () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    saveDraftToStorage(profile, ktpFileName, selfieFileName);
    toast.success('Draf formulir pendaftaran berhasil disimpan secara lokal.', { icon: '💾' });
  };

  const handleClearDraft = () => {
    const draftKey = getDraftStorageKey(profile.nim, profile.noPmb);
    localStorage.removeItem(draftKey);
    localStorage.removeItem(`mabaProfileDraft_${profile.nim}`);
    localStorage.removeItem(`mabaKtpNameDraft_${profile.nim}`);
    localStorage.removeItem(`mabaSelfieNameDraft_${profile.nim}`);
    setHasRestoredDraft(false);
    setAutoSaveStatus('idle');
    setProfile(initialProfile);
    if (onUpdateProfile) onUpdateProfile(initialProfile);
    setKtpFileName('');
    setSelfieFileName('');
    toast.info('Draf lokal dibersihkan. Formulir pendaftaran dikembalikan ke data awal.');
  };

  const updateProfileField = (field: string, value: any) => {
    const updated = { ...profile, [field]: value };
    setProfile(updated);
    if (onUpdateProfile) {
      onUpdateProfile(updated);
    }
  };

  const updateProfileObject = (updates: Partial<MabaProfile>) => {
    const updated = { ...profile, ...updates };
    setProfile(updated);
    if (onUpdateProfile) {
      onUpdateProfile(updated);
    }
  };

  const unlockedProfileSnapshotRef = useRef<MabaProfile | null>(null);

  React.useEffect(() => {
    if (profile.correctionStatus === 'unlocked' && !unlockedProfileSnapshotRef.current) {
      unlockedProfileSnapshotRef.current = { ...profile };
    } else if (profile.correctionStatus !== 'unlocked') {
      unlockedProfileSnapshotRef.current = null;
    }
  }, [profile.correctionStatus]);

  // SW Sync Listener
  React.useEffect(() => {
    if ('serviceWorker' in navigator) {
      const handleMessage = (event: MessageEvent) => {
        if (event.data && event.data.type === 'SYNC_SUCCESS') {
          toast.success(event.data.message || 'Data Identitas (Offline) berhasil disinkronisasi ke server.', { duration: 5000, icon: '🔄' });
        }
      };
      navigator.serviceWorker.addEventListener('message', handleMessage);
      return () => navigator.serviceWorker.removeEventListener('message', handleMessage);
    }
  }, []);
  const [ktpPreview, setKtpPreview] = useState<string | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
  const [isSubmittingKyc, setIsSubmittingKyc] = useState(false);
  const [isEditingAcademic, setIsEditingAcademic] = useState(false);
  const [isAcademicExpanded, setIsAcademicExpanded] = useState(false);
  const [isStepperExpandedMobile, setIsStepperExpandedMobile] = useState(false);
  
  React.useEffect(() => {
    if (window.innerWidth >= 1024) {
      setIsAcademicExpanded(true);
    }
  }, []);
  const [verificationHistory, setVerificationHistory] = useState<VerificationAttempt[]>([]);

  const applyPreset = (type: 'REGULER' | 'KIP' | 'LUAR_DAERAH' | 'CLEAR') => {
    if (type === 'CLEAR') {
      const emptyProfile: MabaProfile = {
        ...profile,
        email: '',
        noHpWa: '',
        alamatKtpJalan: '',
        alamatKtpRtRw: '',
        alamatKtpKelurahan: '',
        alamatKtpKecamatan: '',
        alamatKtpKabupatenKota: '',
        alamatKtpProvinsi: '',
        alamatKtpKodePos: '',
        isAlamatDomisiliSamaDenganKtp: true,
        alamatDomisiliJalan: '',
        alamatDomisiliRtRw: '',
        alamatDomisiliKelurahan: '',
        alamatDomisiliKecamatan: '',
        alamatDomisiliKabupatenKota: '',
        alamatDomisiliProvinsi: '',
        alamatDomisiliKodePos: '',
        kontakDaruratNama: '',
        kontakDaruratHubungan: '',
        kontakDaruratNoHp: '',
        kontakDaruratAlamat: '',
        kontakDarurat2Nama: '',
        kontakDarurat2Hubungan: '',
        kontakDarurat2NoHp: '',
        kontakDarurat2Alamat: '',
        tipeKamar: '',
        preferensiLantai: '',
        kebutuhanKhusus: '',
        catatanKesehatan: '',
        persetujuanAwal: false,
        ktpUrl: '',
        selfieUrl: '',
        kycSubmitted: false,
        kycVerified: false,
        metodePersetujuanOrtu: '' as any,
      };
      setProfile(emptyProfile);
      if (onUpdateProfile) onUpdateProfile(emptyProfile);
      setKtpFileName('');
      setSelfieFileName('');
      setKtpPreview(null);
      setSelfiePreview(null);
      toast.success('Formulir berhasil dikosongkan. Silakan ketik bebas untuk menguji input.');
      return;
    }

    if (type === 'REGULER') {
      const p: MabaProfile = {
        ...profile,
        nama: 'Maximilian Wimin Winata',
        noPmb: 'PMB-2026-0142',
        nim: 'Belum tersedia',
        fakultas: 'Teknik',
        prodi: 'Teknik Informatika',
        angkatan: '2026',
        jenisKelamin: 'Laki-laki',
        kategori: 'Reguler',
        isKipStudent: false,
        email: 'max.winata@mhs.ubtsu.ac.id',
        noHpWa: '081234567890',
        alamatKtpJalan: 'Jl. MH Thamrin No. 45',
        alamatKtpRtRw: '002/004',
        alamatKtpKelurahan: 'Pandan Hulu',
        alamatKtpKecamatan: 'Medan Kota',
        alamatKtpKabupatenKota: 'Kota Medan',
        alamatKtpProvinsi: 'SUMATERA UTARA',
        alamatKtpKodePos: '20212',
        isAlamatDomisiliSamaDenganKtp: true,
        kontakDaruratNama: 'Bpk. Bambang Winata',
        kontakDaruratHubungan: 'Ayah',
        kontakDaruratNoHp: '081299999999',
        kontakDaruratAlamat: 'Jl. MH Thamrin No. 45, Kota Medan',
        kontakDarurat2Nama: 'Ibu Winata',
        kontakDarurat2Hubungan: 'Ibu',
        kontakDarurat2NoHp: '081288888888',
        kontakDarurat2Alamat: 'Jl. MH Thamrin No. 45, Kota Medan',
        tipeKamar: 'Asrama 54 (Kapasitas 2 Orang)',
        preferensiLantai: 'Lantai 2',
        kebutuhanKhusus: 'Tidak ada',
        catatanKesehatan: 'Tidak ada riwayat penyakit berat',
        ktpUrl: 'mock_ktp.jpg',
        selfieUrl: 'mock_selfie.jpg',
        metodePersetujuanOrtu: 'TERTULIS_F20',
        persetujuanAwal: true,
        kycSubmitted: false,
        kycVerified: false,
      };
      setProfile(p);
      if (onUpdateProfile) onUpdateProfile(p);
      setKtpFileName('KTP_Max_Winata.jpg');
      setSelfieFileName('Selfie_Max_Winata.jpg');
      setVerificationHistory((prev) => [
        {
          id: Date.now().toString(),
          timestamp: new Date(),
          type: 'KTP',
          status: 'success',
          message: 'Preset KTP Reguler terverifikasi NIK 1271011204050001',
        },
        ...prev,
      ]);
      toast.success('Preset Maba Reguler berhasil dimuat!');
    } else if (type === 'KIP') {
      const p: MabaProfile = {
        ...profile,
        nama: 'Siti Rahmawati',
        noPmb: 'PMB-2026-08821',
        nim: 'Belum tersedia',
        fakultas: 'Keguruan dan Ilmu Pendidikan',
        prodi: 'Pendidikan Biologi',
        angkatan: '2026',
        jenisKelamin: 'Perempuan',
        kategori: 'KIP-Kuliah',
        isKipStudent: true,
        email: 'siti.rahmawati@mhs.ubtsu.ac.id',
        noHpWa: '082155667788',
        alamatKtpJalan: 'Jl. Pangeran Diponegoro No. 12',
        alamatKtpRtRw: '005/002',
        alamatKtpKelurahan: 'Madras Hulu',
        alamatKtpKecamatan: 'Medan Polonia',
        alamatKtpKabupatenKota: 'Kota Medan',
        alamatKtpProvinsi: 'SUMATERA UTARA',
        alamatKtpKodePos: '20152',
        isAlamatDomisiliSamaDenganKtp: true,
        kontakDaruratNama: 'Ibu Siti Aminah',
        kontakDaruratHubungan: 'Ibu',
        kontakDaruratNoHp: '081388776655',
        kontakDaruratAlamat: 'Medan Polonia, Kota Medan',
        tipeKamar: 'Asrama 54 (Kapasitas 4 Orang)',
        preferensiLantai: 'Lantai 1',
        kebutuhanKhusus: 'Tidak ada',
        catatanKesehatan: 'Alergi debu ringan',
        ktpUrl: 'mock_ktp.jpg',
        selfieUrl: 'mock_selfie.jpg',
        metodePersetujuanOrtu: 'ELEKTRONIK_OTP',
        persetujuanAwal: true,
        kycSubmitted: false,
        kycVerified: false,
      };
      setProfile(p);
      if (onUpdateProfile) onUpdateProfile(p);
      setKtpFileName('KTP_Siti_Rahmawati.jpg');
      setSelfieFileName('Selfie_Siti_Rahmawati.jpg');
      setVerificationHistory((prev) => [
        {
          id: Date.now().toString(),
          timestamp: new Date(),
          type: 'KTP',
          status: 'success',
          message: 'Preset KTP KIP-Kuliah terverifikasi NIK 1271026508050002',
        },
        ...prev,
      ]);
      toast.success('Preset Maba KIP-Kuliah berhasil dimuat!');
    } else if (type === 'LUAR_DAERAH') {
      const p: MabaProfile = {
        ...profile,
        nama: 'Ahmad Fauzan Pratama',
        noPmb: 'PMB-2026-09943',
        nim: 'Belum tersedia',
        fakultas: 'Ekonomi dan Bisnis',
        prodi: 'Manajemen',
        angkatan: '2026',
        jenisKelamin: 'Laki-laki',
        kategori: 'Reguler',
        isKipStudent: false,
        email: 'ahmad.fauzan@mhs.ubtsu.ac.id',
        noHpWa: '085244332211',
        alamatKtpJalan: 'Jl. Merdeka No. 88',
        alamatKtpRtRw: '003/001',
        alamatKtpKelurahan: 'Pahlawan',
        alamatKtpKecamatan: 'Siantar Timur',
        alamatKtpKabupatenKota: 'Kota Pematangsiantar',
        alamatKtpProvinsi: 'SUMATERA UTARA',
        alamatKtpKodePos: '21132',
        isAlamatDomisiliSamaDenganKtp: true,
        kontakDaruratNama: 'Bpk. Fauzi Rahman',
        kontakDaruratHubungan: 'Wali',
        kontakDaruratNoHp: '081277665544',
        kontakDaruratAlamat: 'Siantar Timur, Kota Pematangsiantar',
        tipeKamar: 'Asrama 54 (Kapasitas 2 Orang)',
        preferensiLantai: 'Lantai 3',
        kebutuhanKhusus: 'Tidak ada',
        catatanKesehatan: 'Sehat jasmani dan rohani',
        ktpUrl: 'mock_ktp.jpg',
        selfieUrl: 'mock_selfie.jpg',
        metodePersetujuanOrtu: 'VIDEO_CALL',
        persetujuanAwal: true,
        kycSubmitted: false,
        kycVerified: false,
      };
      setProfile(p);
      if (onUpdateProfile) onUpdateProfile(p);
      setKtpFileName('KTP_Ahmad_Fauzan.jpg');
      setSelfieFileName('Selfie_Ahmad_Fauzan.jpg');
      toast.success('Preset Maba Luar Daerah berhasil dimuat!');
    }
  };

  // Validation Helpers
  const { validateProfile, errors: formErrors, isValid } = useFormValidation(profile, ktpFileName, selfieFileName);

  // Global Action Confirmation Modal State
  const [confirmModalData, setConfirmModalData] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    confirmText: string;
    action: () => void;
  } | null>(null);

  // Correction Request Modal State
  const [correctionModalOpen, setCorrectionModalOpen] = useState(false);
  const [correctionNotes, setCorrectionNotes] = useState('');

  // SOP / Help Modal State
  const [sopModalOpen, setSopModalOpen] = useState(false);
  const [sopPhaseId, setSopPhaseId] = useState<number | null>(null);

  const handleOpenSop = (phaseId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setSopPhaseId(phaseId);
    setSopModalOpen(true);
  };

  // Scope Signature Modal State
  const [signatureScopeModalOpen, setSignatureScopeModalOpen] = useState(false);

  // Camera & Mobile Capture State
  const [cameraModalOpen, setCameraModalOpen] = useState(false);
  const [cameraTarget, setCameraTarget] = useState<'ktp' | 'selfie' | null>(null);

  const ktpFileInputRef = useRef<HTMLInputElement | null>(null);
  const selfieFileInputRef = useRef<HTMLInputElement | null>(null);
  const ktpNativeCamRef = useRef<HTMLInputElement | null>(null);
  const selfieNativeCamRef = useRef<HTMLInputElement | null>(null);

  const handleOpenCamera = (target: 'ktp' | 'selfie') => {
    setCameraTarget(target);
    setCameraModalOpen(true);
  };

  const [isAiValidating, setIsAiValidating] = useState(false);


  const handleCapture = async (data: { base64: string, objectUrl: string, blob: Blob }) => {
     if (!cameraTarget) return;
     await processImageWithAI(data.base64, cameraTarget, cameraTarget === 'ktp' ? 'ktp-capture.jpg' : 'selfie-capture.jpg', data.objectUrl);
  };

  const processImageWithAI = async (base64Image: string, target: 'ktp' | 'selfie', fileName: string, previewUrl?: string) => {
    setIsAiValidating(true);
    const loadingToastId = toast.loading(`Menganalisis ${target === 'ktp' ? 'e-KTP' : 'Foto Selfie'} dengan AI...`);

    // Helper function for fetching with retry mechanism
        const fetchWithRetry = async (url: string, options: RequestInit, retries = 3, delay = 2000) => {
      for (let i = 0; i < retries; i++) {
        try {
          const response = await fetch(url, options);
          if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            if (response.status === 400 || response.status === 422) {
               // Jangan retry kalau error dari validasi input
               throw { isHttpError: true, status: response.status, data };
            }
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response;
        } catch (error: any) {
          if (error.isHttpError) throw error; // Teruskan error HTTP 400
          if (i < retries - 1) {
            toast.loading(`Koneksi terputus. Mencoba ulang mengunggah... (${i + 1}/${retries})`, { id: loadingToastId });
            await new Promise(resolve => setTimeout(resolve, delay));
          } else {
            throw error;
          }
        }
      }
      throw new Error("Max retries reached");
    };

    try {
      if (target === 'ktp') {
        const res = await fetchWithRetry('/api/ocr-ktp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: base64Image })
        });
        const data = await res.json();
        
        if (data.valid) {
          setVerificationHistory(prev => [{
            id: Date.now().toString() + Math.random().toString(),
            timestamp: new Date(),
            type: 'KTP',
            status: 'success',
            message: `KTP Valid. NIK diekstrak: ${data.nik || 'Tidak tersedia'}`
          }, ...prev]);
          toast.success(`Berhasil! ${data.message || 'KTP Valid'}`, { id: loadingToastId, duration: 4000 });
          setKtpFileName(fileName);
          setKtpPreview(previewUrl || base64Image);
          const updatedKtpProfile = { ...profile, nik: data.nik || profile.nik, ktpUrl: previewUrl || base64Image };
          setProfile(updatedKtpProfile);
          if (onUpdateProfile) onUpdateProfile(updatedKtpProfile);
          if (data.nik) {
            toast.success(`AI berhasil mengekstrak NIK: ${data.nik}`, { duration: 5000 });
          }
          setCameraModalOpen(false);
          setCameraTarget(null);
        } else {
          setVerificationHistory(prev => [{
            id: Date.now().toString() + Math.random().toString(),
            timestamp: new Date(),
            type: 'KTP',
            status: 'error',
            message: data.error || data.message || 'KTP ditolak oleh AI'
          }, ...prev]);
          toast.error(`KTP tidak valid: ${data.error || data.message}`, { id: loadingToastId, duration: 8000 });
        }
      } else {
        // Validasi Selfie menggunakan AI Lokal (TensorFlow.js + BlazeFace)
        toast.loading('Memuat model pendeteksi wajah lokal...', { id: loadingToastId });
        
        const img = new Image();
        img.src = base64Image;
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });
        toast.loading('Menganalisis wajah...', { id: loadingToastId });
        await tf.ready();
        const model = await blazeface.load();
        const predictions = await model.estimateFaces(img, false);
        
        if (predictions.length > 0) {
          // Hanya memvalidasi keberadaan wajah. 
          // Verifikasi kecocokan KTP di selfie akan dilakukan manual oleh Admin.
          
          setVerificationHistory(prev => [{
            id: Date.now().toString() + Math.random().toString(),
            timestamp: new Date(),
            type: 'Selfie',
            status: 'success',
            message: 'Wajah terdeteksi. KTP akan diverifikasi manual.'
          }, ...prev]);
          
          toast.success('Berhasil! Wajah terdeteksi. Foto Anda disimpan untuk verifikasi Admin.', { id: loadingToastId, duration: 4000 });
          setSelfieFileName(fileName);
          setSelfiePreview(previewUrl || base64Image);
          const updatedSelfieProfile = { ...profile, selfieUrl: previewUrl || base64Image };
          setProfile(updatedSelfieProfile);
          if (onUpdateProfile) onUpdateProfile(updatedSelfieProfile);
          setCameraModalOpen(false);
          setCameraTarget(null);
        } else {
          setVerificationHistory(prev => [{
            id: Date.now().toString() + Math.random().toString(),
            timestamp: new Date(),
            type: 'Selfie',
            status: 'error',
            message: 'Tidak ada wajah manusia yang terdeteksi di foto ini'
          }, ...prev]);
          toast.error('Foto ditolak: Tidak ada wajah manusia yang terdeteksi di foto ini.', { id: loadingToastId, duration: 8000 });
        }
      }
    } catch (e: any) {
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
       toast.error(errorMsg.includes('ditolak') ? errorMsg : `Foto ditolak: ${errorMsg}`, { id: loadingToastId, duration: 8000 });
       // Don't throw so it doesn't break React flow
       setIsScannerOpen(true); // Auto-open trail so user sees why it failed
    } finally {
      setIsAiValidating(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, target: 'ktp' | 'selfie') => {
    const file = e.target.files?.[0];
    if (file) {
      // Client-side validation: Max 5MB
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`Ukuran file ${file.name} terlalu besar (Maksimal 5MB). Silakan kompres foto Anda.`, { duration: 5000 });
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

  // Billing & Payment State
  const [invoice, setInvoice] = useState<BillingInvoice>(initialInvoice);
  const [paymentMode, setPaymentMode] = useState<'TRANSFER_MANUAL' | 'VIRTUAL_ACCOUNT'>(() => {
    const saved = localStorage.getItem('mabaPaymentMode');
    if (saved === 'TRANSFER_MANUAL' || saved === 'VIRTUAL_ACCOUNT') {
      return saved;
    }
    return 'TRANSFER_MANUAL';
  });

  React.useEffect(() => {
    localStorage.setItem('mabaPaymentMode', paymentMode);
  }, [paymentMode]);

  const [manualBuktiName, setManualBuktiName] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Engine Generator Kode Unik Handler

  const handleToggleKip = () => {
    onUpdateProfile && onUpdateProfile({ ...profile, isKipStudent: !profile.isKipStudent });
  };

  const handleRegenerateKodeUnik = () => {
    const newKodeUnik = Math.floor(Math.random() * 899) + 100;
    const subtotal = invoice.biayaSewa + invoice.biayaDeposit + (invoice.biayaPerlengkapanAwal || 100000);
    const newTotal = subtotal + newKodeUnik;
    const updatedInv: BillingInvoice = {
      ...invoice,
      kodeUnik: newKodeUnik,
      totalBayar: newTotal,
    };
    setInvoice(updatedInv);
    onUpdateInvoice(updatedInv);
  };

  // Contract OTP State
  const [contract, setContract] = useState<DigitalContract>(initialContract);
  const [studentOtp, setStudentOtp] = useState('');
  const [parentOtp, setParentOtp] = useState('');
  const [otpTimer, setOtpTimer] = useState(300);
  const [showWaSimulator, setShowWaSimulator] = useState(false);

  const [otpSentMessage, setOtpSentMessage] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  
  // Phone Change Logic (Pasal 39 Ayat 11b)
  const [isChangeParentPhoneModalOpen, setChangeParentPhoneModalOpen] = useState(false);
  const [hasReadContract, setHasReadContract] = useState(false);
  const [isContractCheckboxChecked, setIsContractCheckboxChecked] = useState(false);
  const [parentPhonePendingUpdate, setParentPhonePendingUpdate] = useState(false);
  const [newParentPhoneInput, setNewParentPhoneInput] = useState('');

  // SIMULATION MODE PROGRESS SAVER (AUTO-RESUME)
  React.useEffect(() => {
    if (profile?.nim && !profile.nim.startsWith('REG') && !profile.nim.startsWith('PMB')) {
      const progressData = {
        profile,
        invoice,
        contract,
        ticket,
        step: currentStep,
        lastSaved: new Date().toISOString()
      };
      localStorage.setItem(`maba_progress_${profile.nim}`, JSON.stringify(progressData));
    }
  }, [profile, invoice, contract, ticket, currentStep]);

  // Helper to determine student admission category for tariff and payment scheme matching
  const getStudentCategory = (prof: any): 'REGULER' | 'KIP' | 'INTERNAL' | 'EXTERNAL' | 'SCHOLARSHIP' => {
    const k = (prof?.kategoriMahasiswa || prof?.kategori || '').toUpperCase();
    if (k.includes('KIP')) return 'KIP';
    if (k.includes('INTERNAL')) return 'INTERNAL';
    if (k.includes('EXTERNAL') || k.includes('EKSTERNAL')) return 'EXTERNAL';
    if (k.includes('SCHOLARSHIP') || k.includes('BEASISWA')) return 'SCHOLARSHIP';
    if (prof?.isKipStudent) return 'KIP';
    return 'REGULER';
  };

  const studentCategory = getStudentCategory(profile);

  // Active payment scheme from Master Tarif configuration
  const activeScheme = paymentSchemes.find(s => s.target === studentCategory) 
    || paymentSchemes.find(s => s.target === 'ALL') 
    || { id: 'default', target: studentCategory, maxInstallments: studentCategory === 'KIP' ? 3 : 1, installmentMultiplier: studentCategory === 'KIP' ? 1.5 : 1.0, allowDepositInstallment: false };

  // Opsi cicilan deposit: default OFF, dapat diaktifkan melalui menu Admin (Master Tarif / Ledger)
  const isDepositInstallmentAllowed = activeScheme.allowDepositInstallment === true || invoice.cicilanDepositAllowed === true;
  const maxCicilan = isDepositInstallmentAllowed ? Math.max(1, activeScheme.maxInstallments || 1) : 1;
  const installmentMultiplier = activeScheme.installmentMultiplier || 1.0;

  // Monthly Room Rent Tariff (SEWA)
  const tarifSewa = tariffs.find(t => t.category === 'SEWA' && (t.target === studentCategory || t.target === 'ALL'))?.amount ?? 500000;

  // Base Deposit (DEPOSIT)
  const baseDepositTariff = tariffs.find(t => t.category === 'DEPOSIT' && t.target === studentCategory && t.name.toLowerCase().includes('lunas'))
    || tariffs.find(t => t.category === 'DEPOSIT' && t.target === studentCategory)
    || tariffs.find(t => t.category === 'DEPOSIT' && t.target === 'ALL')
    || { amount: studentCategory === 'KIP' ? 500000 : 1000000 };

  const nominalDepositBase = baseDepositTariff.amount;

  // Initial Amenities Kit / Admin Fee (PERLENGKAPAN / BIAYA ADMINISTRASI)
  const perlengkapanTariff = tariffs.find(t => t.category === 'PERLENGKAPAN' && (t.target === studentCategory || t.target === 'ALL'))
    || { amount: 100000, name: 'Biaya Administrasi' };

  const nominalPerlengkapan = perlengkapanTariff.amount;

  // Billing configuration calculation handler: Supports 1, 2, 3, 6, 12 months payment options (while contract commitment is min 6 months)
  const handleConfigureBilling = (
    durasiBayar: number, 
    opsiDeposit: number, 
    durasiKontrakTotal: number = Math.max(6, invoice.durasiBulan || 6)
  ) => {
    const validDurasiBayar = [1, 2, 3, 6, 12].includes(durasiBayar) ? durasiBayar : 6;
    const validDurasiKontrak = Math.max(validDurasiBayar, durasiKontrakTotal);
    const validOpsiDeposit = isDepositInstallmentAllowed ? Math.min(opsiDeposit, maxCicilan) : 1;
    
    // Rent total obligation for the contract commitment
    const biayaSewaTotalKontrak = validDurasiKontrak * tarifSewa;
    
    // Rent charged on the initial registration invoice (sesuai durasi bayar yang dipilih: 1, 2, 3, 6, 12 bulan)
    const biayaSewaInitial = validDurasiBayar * tarifSewa;
    const sisaSewaKontrak = Math.max(0, biayaSewaTotalKontrak - biayaSewaInitial);
    const skemaSewa: 'LUNAS_DIMUKA' | 'BULANAN' = validDurasiBayar >= validDurasiKontrak ? 'LUNAS_DIMUKA' : 'BULANAN';

    const biayaPerlengkapanAwal = nominalPerlengkapan;

    const isCicilanDeposit = isDepositInstallmentAllowed && validOpsiDeposit > 1;
    const biayaDepositTotal = isCicilanDeposit ? (nominalDepositBase * installmentMultiplier) : nominalDepositBase;
    const biayaDepositTermin1 = biayaDepositTotal / validOpsiDeposit;
    const sisaCicilanDeposit = biayaDepositTotal - biayaDepositTermin1;

    const kodeUnik = invoice.kodeUnik || 42;
    const totalBayar = biayaSewaInitial + biayaDepositTermin1 + biayaPerlengkapanAwal + kodeUnik;

    const updatedInv: BillingInvoice = {
      ...invoice,
      durasiBulan: validDurasiKontrak,
      skemaBayarSewa: skemaSewa,
      opsiCicilan: validOpsiDeposit as 1 | 2 | 3,
      isCicilanDeposit,
      tarifPerBulan: tarifSewa,
      biayaSewa: biayaSewaInitial,
      biayaSewaTotalKontrak,
      sisaSewaKontrak,
      biayaDeposit: biayaDepositTermin1,
      biayaDepositTotal,
      sisaCicilanDeposit,
      biayaPerlengkapanAwal,
      totalBayar
    };

    setInvoice(updatedInv);
    onUpdateInvoice(updatedInv);
  };

  // Synchronize invoice whenever Master Tariffs, Schemes, or Student Category change
  React.useEffect(() => {
    if (invoice.status === 'UNPAID') {
      const durasiKontrak = Math.max(6, invoice.durasiBulan || 6);
      let opsi = isDepositInstallmentAllowed ? (invoice.opsiCicilan || 1) : 1;
      if (opsi > maxCicilan) {
        opsi = maxCicilan as any;
      }
      
      const durasiBayarSekarang = invoice.biayaSewa && tarifSewa > 0 ? Math.round(invoice.biayaSewa / tarifSewa) : 6;
      const validDurasiBayar = [1, 2, 3, 6, 12].includes(durasiBayarSekarang) ? durasiBayarSekarang : 6;
      
      const biayaSewaTotalKontrak = durasiKontrak * tarifSewa;
      const biayaSewaInitial = validDurasiBayar * tarifSewa;
      const sisaSewaKontrak = Math.max(0, biayaSewaTotalKontrak - biayaSewaInitial);
      const skemaSewa: 'LUNAS_DIMUKA' | 'BULANAN' = validDurasiBayar >= durasiKontrak ? 'LUNAS_DIMUKA' : 'BULANAN';

      const biayaPerlengkapanAwal = nominalPerlengkapan;
      const isCicilanDeposit = isDepositInstallmentAllowed && opsi > 1;
      const biayaDepositTotal = isCicilanDeposit ? (nominalDepositBase * installmentMultiplier) : nominalDepositBase;
      const biayaDepositTermin1 = biayaDepositTotal / opsi;
      const sisaCicilanDeposit = biayaDepositTotal - biayaDepositTermin1;
      const kodeUnik = invoice.kodeUnik || 42;
      const totalBayar = biayaSewaInitial + biayaDepositTermin1 + biayaPerlengkapanAwal + kodeUnik;

      const updatedInv: BillingInvoice = {
        ...invoice,
        durasiBulan: durasiKontrak,
        skemaBayarSewa: skemaSewa,
        opsiCicilan: opsi as 1 | 2 | 3,
        isCicilanDeposit,
        tarifPerBulan: tarifSewa,
        biayaSewa: biayaSewaInitial,
        biayaSewaTotalKontrak,
        sisaSewaKontrak,
        biayaDeposit: biayaDepositTermin1,
        biayaDepositTotal,
        sisaCicilanDeposit,
        biayaPerlengkapanAwal,
        totalBayar
      };
      setInvoice(updatedInv);
      onUpdateInvoice(updatedInv);
    }
  }, [tariffs, paymentSchemes, studentCategory, isDepositInstallmentAllowed, maxCicilan, installmentMultiplier, tarifSewa, nominalDepositBase, nominalPerlengkapan]);




  React.useEffect(() => {
    let interval: any;
    if (otpSentMessage && otpTimer > 0 && !isVerifyingOtp && contract.status !== 'SIGNED') {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    } else if (otpTimer === 0) {
      setOtpSentMessage(false);
      setOtpTimer(300);
      toast.error('Waktu pengisian OTP telah habis. Silakan kirim ulang kode OTP.');
    }
    return () => clearInterval(interval);
  }, [otpSentMessage, otpTimer, isVerifyingOtp, contract.status]);
  const handleSendOtp = () => {
    setOtpSentMessage(true);
    setOtpTimer(300);
    setShowWaSimulator(true);
    toast.success('Kode OTP 6-Digit berhasil dikirim via WhatsApp. Berlaku 5 menit.');
  };

  const handleVerifyOtp = () => {
    const isParentOtpNeeded = profile.metodePersetujuanOrtu === 'ELEKTRONIK_OTP';
    if (studentOtp.length !== 6 || (isParentOtpNeeded && parentOtp.length !== 6)) {
      toast.error(isParentOtpNeeded ? 'Harap masukkan 6-digit OTP Mahasiswa dan 6-digit OTP Wali.' : 'Harap masukkan 6-digit OTP Mahasiswa.');
      return;
    }
    setIsVerifyingOtp(true);
    setTimeout(() => {
      setIsVerifyingOtp(false);
      const mockSha256 = Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      const updatedContract: DigitalContract = { 
        ...contract, 
        status: 'SIGNED' as const,
        otpVerified: true,
        parentOtpVerified: isParentOtpNeeded,
        documentHash: mockSha256,
        signedAt: new Date().toISOString(),
        authMethod: isParentOtpNeeded 
          ? 'TTE-TT (Canvas Tanda Tangan + Dual-Factor OTP WhatsApp Mahasiswa & Wali)'
          : 'TTE-TT (Canvas Tanda Tangan + OTP WhatsApp Mahasiswa Terverifikasi)',
        signerIpAddress: '180.252.164.88 (ISP Verified)',
        retentionUntil: new Date(Date.now() + 5 * 365 * 24 * 60 * 60 * 1000).toISOString()
      };
      setContract(updatedContract);
      onUpdateContract(updatedContract);
      setShowWaSimulator(false);
      toast.success('Verifikasi OTP berhasil! Kontrak Penghunian (F-19) & Pakta Integritas (F-02) telah disahkan.');
    }, 1200);
  };
  const handleSimpanTandaTangan = () => {
    if (signaturePadRef.current && !signaturePadRef.current.isEmpty()) {
      const signatureData = signaturePadRef.current.toDataURL();
      onUpdateContract({ ...contract, signatureData, status: 'SIGNED' });
      toast.success('Tanda tangan digital berhasil disimpan!');
      setTimeout(() => handleStepNavigation(5), 1500);
    } else {
      toast.error('Silakan tanda tangani dokumen terlebih dahulu.');
    }
  };

  const handleClearTandaTangan = () => {
    if (signaturePadRef.current) {
      signaturePadRef.current.clear();
    }
  };

  const handleGenerateTicket = () => {
    const ticketId = 'TIX-' + Math.random().toString(36).substring(2, 9).toUpperCase();
    onUpdateTicket({ ...ticket, ticketId: ticketId, qrData: ticketId, barcode: ticketId, status: 'ACTIVE' });
    toast.success('e-Ticket Asrama berhasil diterbitkan!');
    setTimeout(() => {
      onClearSsoNotice && onClearSsoNotice();
      handleStepNavigation(6);
    }, 1500);
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
  };

  const downloadTicketPdf = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a5'
    });
    
    doc.setFillColor(248, 250, 252);
    doc.rect(0, 0, 148, 210, 'F');

    doc.setFontSize(16);
    doc.setTextColor(15, 23, 42);
    doc.text('E-TICKET ASRAMA UBT', 148/2, 20, { align: 'center' });

    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text('ID Tiket: ' + ticket.ticketId, 148/2, 26, { align: 'center' });

    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text('Nama: ' + profile.nama, 15, 45);
    doc.text('NIM: ' + profile.nim, 15, 52);
    doc.text('Gedung: ' + room?.gedung, 15, 59);
    doc.text('Kamar: ' + room?.nomorKamar, 15, 66);

    doc.save(`Ticket_Asrama_${profile.nim}.pdf`);
  };

  const handleKycApprovalComplete = (updatedProfile: MabaProfile) => {
    onUpdateProfile && onUpdateProfile(updatedProfile);
    setIsScannerOpen(false);
    setTimeout(() => handleStepNavigation(2), 1500);
  };

  const handleStepNavigation = (step: AdmissionStep) => {
    setCurrentStep(step);
    setTimeout(() => {
      document.getElementById(`step-${step}-panel`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const [isSandboxOpen, setIsSandboxOpen] = useState(false);

  const renderSandbox = () => {
    return (
      <>
        {isSandboxOpen && (
          <>
            {/* Backdrop for mobile closing */}
            <div className="fixed inset-0 bg-slate-900/20 z-[90] lg:hidden backdrop-blur-sm" onClick={() => setIsSandboxOpen(false)} />
            
            {/* Sidebar Guide */}
            <div className="fixed inset-y-0 right-0 z-[100] w-full max-w-sm bg-white shadow-[0_0_40px_rgba(0,0,0,0.1)] border-l border-slate-200 flex flex-col animate-in slide-in-from-right duration-300">
              <div className="p-4 bg-slate-900 text-white flex justify-between items-center shrink-0 shadow-md relative z-10">
                <div>
                  <h4 className="font-bold flex items-center gap-2 text-sm">
                    <Sparkles className="w-4 h-4 text-teal-400" /> Mode Simulasi & Uji Coba (Dev)
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Preset Data Uji, Bypass Step & DB Sync</p>
                </div>
                <button onClick={() => setIsSandboxOpen(false)} className="text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 p-1.5 rounded-lg transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* QUICK DATA PRESETS BAR INSIDE DRAWER */}
              <div className="p-3.5 bg-slate-800/95 border-b border-slate-700/80 text-white shrink-0">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono text-teal-300 font-bold uppercase tracking-wider flex items-center gap-1">
                    <Zap className="w-3 h-3 text-amber-400" /> Preset Formulir Pendaftaran
                  </span>
                  <span className="text-[10px] text-slate-400">1-Klik Isi Data</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      applyPreset('REGULER');
                      toast.success('Preset Mahasiswa Reguler dimuat');
                    }}
                    className="px-2.5 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 justify-center active:scale-95 shadow-sm"
                  >
                    <Zap className="w-3 h-3 text-amber-300" /> 1-Klik Reguler
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      applyPreset('KIP');
                      toast.success('Preset Mahasiswa KIP-Kuliah dimuat');
                    }}
                    className="px-2.5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 justify-center active:scale-95 shadow-sm"
                  >
                    <Zap className="w-3 h-3 text-amber-300" /> 1-Klik KIP
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      applyPreset('LUAR_DAERAH');
                      toast.success('Preset Mahasiswa Luar Kota dimuat');
                    }}
                    className="px-2.5 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1.5 justify-center border border-slate-600 active:scale-95"
                  >
                    <MapPin className="w-3 h-3 text-teal-400" /> Preset Luar Kota
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      applyPreset('CLEAR');
                      toast.info('Formulir dikosongkan untuk uji ketik manual');
                    }}
                    className="px-2.5 py-2 bg-rose-950/60 hover:bg-rose-900 text-rose-200 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1.5 justify-center border border-rose-800/50 active:scale-95"
                  >
                    <Trash2 className="w-3 h-3 text-rose-400" /> Kosongkan Form
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-5 bg-slate-50">
                <div className="space-y-0 relative">
                  {/* STEP 1: PENGISIAN FORM */}
                  {/* STEP 1: PENGISIAN FORM */}
                  <div className="relative pl-5 pb-6">
                    <div className={`absolute left-[-5px] top-1 w-3 h-3 rounded-full border-2 border-white shadow-sm ${currentStep > 1 ? 'bg-emerald-500' : currentStep === 1 ? 'bg-indigo-500 animate-pulse' : 'bg-slate-300'}`} />
                    <div className={`absolute left-0 top-4 bottom-0 w-0.5 ${currentStep > 1 ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                    
                    <h5 className={`font-bold text-sm ${currentStep >= 1 ? 'text-slate-900' : 'text-slate-500'}`}>1. Pengisian Form & Validasi Identitas</h5>
                    <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">Maba mengisi biodata, kontak, dan swafoto KTP untuk verifikasi identitas.</p>
                    
                    <div className="bg-slate-800 text-emerald-300 border border-slate-700 rounded-lg p-2.5 mt-2.5 text-[10px] font-mono shadow-inner">
                      <span className="text-slate-400 block mb-1">// Backend DB Update:</span>
                      profile.kycSubmitted = true;
                    </div>

                    {currentStep === 1 && (
                      <div className="mt-3 space-y-2">
                        <button 
                          onClick={() => {
                            const p = { ...profile, kycVerified: true, kycSubmitted: true, correctionStatus: 'none' };
                            setProfile(p);
                            if (onUpdateProfile) onUpdateProfile(p);
                            setCurrentStep(2);
                            toast.success('KYC disetujui (Simulasi)');
                          }}
                          className="w-full text-left px-3 py-2 text-xs font-bold rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 transition-colors shadow-sm flex justify-between items-center"
                        >
                          <span>Simulasi: Admin Approve KYC</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                        <button 
                          onClick={() => {
                            const p = { ...profile, correctionStatus: 'unlocked' };
                            setProfile(p);
                            if (onUpdateProfile) onUpdateProfile(p);
                            toast.success('Akses Koreksi Dibuka (Simulasi)');
                          }}
                          className="w-full text-left px-3 py-2 text-[11px] font-semibold rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors"
                        >
                          Simulasi: Buka Kunci Form (Unlock)
                        </button>
                      </div>
                    )}
                  </div>

                  {/* STEP 2: PEMILIHAN SKEMA */}
                  <div className="relative pl-5 pb-6">
                    <div className={`absolute left-[-5px] top-1 w-3 h-3 rounded-full border-2 border-white shadow-sm ${currentStep > 2 ? 'bg-emerald-500' : currentStep === 2 ? 'bg-indigo-500 animate-pulse' : 'bg-slate-300'}`} />
                    <div className={`absolute left-0 top-4 bottom-0 w-0.5 ${currentStep > 2 ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                    
                    <h5 className={`font-bold text-sm ${currentStep >= 2 ? 'text-slate-900' : 'text-slate-500'}`}>2. Konfigurasi Tagihan</h5>
                    <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">Sistem memproses skema tarif (Normal vs KIP). Maba memilih durasi sewa & cicilan.</p>
                    
                    <div className="bg-slate-800 text-emerald-300 border border-slate-700 rounded-lg p-2.5 mt-2.5 text-[10px] font-mono shadow-inner">
                      <span className="text-slate-400 block mb-1">// Backend DB Update:</span>
                      invoice.status = 'UNPAID';<br/>
                      invoice.totalBayar = calculated;
                    </div>
                  </div>

                  {/* STEP 3: PEMBAYARAN */}
                  <div className="relative pl-5 pb-6">
                    <div className={`absolute left-[-5px] top-1 w-3 h-3 rounded-full border-2 border-white shadow-sm ${currentStep > 3 ? 'bg-emerald-500' : currentStep === 3 ? 'bg-indigo-500 animate-pulse' : 'bg-slate-300'}`} />
                    <div className={`absolute left-0 top-4 bottom-0 w-0.5 ${currentStep > 3 ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                    
                    <h5 className={`font-bold text-sm ${currentStep >= 3 ? 'text-slate-900' : 'text-slate-500'}`}>3. Pembayaran Bank</h5>
                    <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">Maba mentransfer dana via Virtual Account atau Manual ke rekening bendahara.</p>
                    
                    <div className="bg-slate-800 text-emerald-300 border border-slate-700 rounded-lg p-2.5 mt-2.5 text-[10px] font-mono shadow-inner">
                      <span className="text-slate-400 block mb-1">// Callback dari Bank API:</span>
                      invoice.status = 'PAID';
                    </div>

                    {currentStep === 3 && (
                      <div className="mt-3 space-y-2">
                        <button 
                          onClick={() => {
                            const inv = { ...invoice, status: 'PAID' as const, isMigrated: false };
                            setInvoice(inv);
                            onUpdateInvoice(inv);
                            setCurrentStep(4);
                            toast.success('Simulasi: Invoice di-approve sebagai status BOOKING (Kamar terkunci, menunggu NIM SIDARA)');
                          }}
                          className="w-full text-left px-3 py-2 text-xs font-bold rounded-lg bg-amber-50 border border-amber-300 text-amber-900 hover:bg-amber-100 transition-colors shadow-sm flex justify-between items-center"
                        >
                          <span className="flex items-center gap-1.5">
                            <BookmarkCheck className="w-3.5 h-3.5 text-amber-600" />
                            <span>Simulasi: Approve Booking (Status Booking)</span>
                          </span>
                          <ArrowRight className="w-3 h-3" />
                        </button>

                        <button 
                          onClick={() => {
                            const inv = { ...invoice, status: 'PAID' as const, isMigrated: true };
                            const p = { ...profile, nim: profile.nim !== 'Belum tersedia' && !profile.nim.startsWith('PMB') ? profile.nim : '2640101088' };
                            setInvoice(inv);
                            setProfile(p);
                            onUpdateInvoice(inv);
                            if (onUpdateProfile) onUpdateProfile(p);
                            setCurrentStep(4);
                            toast.success('Simulasi: Invoice di-approve & NIM disinkronisasi ke Master Penyewa');
                          }}
                          className="w-full text-left px-3 py-2 text-xs font-bold rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-900 hover:bg-emerald-100 transition-colors shadow-sm flex justify-between items-center"
                        >
                          <span className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Simulasi: Approve & Sync NIM (Master)</span>
                          </span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* STEP 4: KONTRAK DIGITAL & PAKTA INTEGRITAS */}
                  <div className="relative pl-5 pb-6">
                    <div className={`absolute left-[-5px] top-1 w-3 h-3 rounded-full border-2 border-white shadow-sm ${currentStep > 4 ? 'bg-emerald-500' : currentStep === 4 ? 'bg-indigo-500 animate-pulse' : 'bg-slate-300'}`} />
                    <div className={`absolute left-0 top-4 bottom-0 w-0.5 ${currentStep > 4 ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                    
                    <h5 className={`font-bold text-sm ${currentStep >= 4 ? 'text-slate-900' : 'text-slate-500'}`}>4. Kontrak & Pakta Integritas (F-19 & F-02)</h5>
                    <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">Pengesahan naskah F-19 & F-02 serta tanda tangan digital/OTP.</p>
                    
                    <div className="bg-slate-800 text-emerald-300 border border-slate-700 rounded-lg p-2.5 mt-2.5 text-[10px] font-mono shadow-inner">
                      <span className="text-slate-400 block mb-1">// Backend DB Update:</span>
                      contract.status = 'SIGNED';
                    </div>

                    {currentStep === 4 && (
                      <div className="mt-3">
                        <button 
                          onClick={() => {
                            const c: DigitalContract = { 
                              ...contract, 
                              status: 'SIGNED' as const, 
                              signedAt: new Date().toISOString(),
                              documentHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
                            };
                            setContract(c);
                            onUpdateContract(c);
                            setCurrentStep(5);
                            toast.success('Kontrak F-19 & F-02 disahkan (Simulasi)');
                          }}
                          className="w-full text-left px-3 py-2 text-xs font-bold rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 transition-colors shadow-sm flex justify-between items-center"
                        >
                          <span>Simulasi: Sahkan Kontrak (F-19 & F-02)</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>

      {/* STEP 5: E-TICKET */}
                  <div className="relative pl-5 pb-6">
                    <div className={`absolute left-[-5px] top-1 w-3 h-3 rounded-full border-2 border-white shadow-sm ${currentStep > 5 ? 'bg-emerald-500' : currentStep === 5 ? 'bg-indigo-500 animate-pulse' : 'bg-slate-300'}`} />
                    <div className={`absolute left-0 top-4 bottom-0 w-0.5 ${currentStep > 5 ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                    
                    <h5 className={`font-bold text-sm ${currentStep >= 5 ? 'text-slate-900' : 'text-slate-500'}`}>5. Penerbitan e-Ticket</h5>
                    <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">E-Ticket diterbitkan untuk barcode pemindaian saat check-in fisik di asrama.</p>
                    
                    <div className="bg-slate-800 text-emerald-300 border border-slate-700 rounded-lg p-2.5 mt-2.5 text-[10px] font-mono shadow-inner">
                      <span className="text-slate-400 block mb-1">// Backend DB Update:</span>
                      ticket.status = 'ACTIVE';
                    </div>
                    
                    {currentStep === 5 && (
                      <div className="mt-3 space-y-2">
                        <button 
                          onClick={() => {
                            const t = { ...ticket, status: 'ACTIVE' as const };
                            onUpdateTicket(t);
                            setCurrentStep(6); 
                            toast.success('e-Ticket diaktifkan (Simulasi)');
                          }}
                          className="w-full text-left px-3 py-2 text-xs font-bold rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 transition-colors shadow-sm flex justify-between items-center"
                        >
                          <span>Simulasi: Generate Ticket</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* STEP 6: BASTK */}
                  <div className="relative pl-5">
                    <div className={`absolute left-[-5px] top-1 w-3 h-3 rounded-full border-2 border-white shadow-sm ${currentStep === 6 ? 'bg-indigo-500 animate-pulse' : 'bg-slate-300'}`} />
                    
                    <h5 className={`font-bold text-sm ${currentStep >= 6 ? 'text-slate-900' : 'text-slate-500'}`}>6. Serah Terima (BASTK)</h5>
                    <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">Penyewa check-in, memindai tiket, dan menandatangani Berita Acara Serah Terima Kamar.</p>
                  </div>
                </div>
              </div>
{/* Reset Footer */}
              <div className="p-4 bg-white border-t border-slate-200 shrink-0">
                <button 
                  onClick={() => {
                    const p = { ...profile, kycVerified: false, kycSubmitted: false, correctionStatus: 'none' as const };
                    const inv = { ...invoice, status: 'UNPAID' as const };
                    const c = { ...contract, status: 'DRAFT' as const };
                    setProfile(p);
                    setInvoice(inv);
                    setContract(c);
                    if (onUpdateProfile) onUpdateProfile(p);
                    onUpdateInvoice(inv);
                    onUpdateContract(c);
                    setCurrentStep(1);
                    localStorage.removeItem(`maba_progress_${profile.nim}`);
                    toast.success('Sistem direset ke Tahap 1');
                  }}
                  className="w-full bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2"
                >
                  <History className="w-4 h-4" /> Reset Semua Alur
                </button>
              </div>
            </div>
          </>
        )}

        {/* Non-intrusive Floating Trigger for Dev & Simulation Guide */}
        <button 
          onClick={() => setIsSandboxOpen(!isSandboxOpen)}
          className="fixed bottom-5 right-5 z-[90] bg-slate-900/90 hover:bg-slate-900 text-slate-200 hover:text-white px-3.5 py-2.5 rounded-full shadow-lg border border-slate-700/80 backdrop-blur-md transition-all flex items-center gap-2 text-xs font-semibold hover:shadow-xl active:scale-95 group"
          title="Buka Mode Simulasi & Uji Coba Cepat (Dev Tool)"
        >
          <Sparkles className="w-3.5 h-3.5 text-teal-400 group-hover:rotate-12 transition-transform" />
          <span className="hidden sm:inline">Mode Simulasi (Dev)</span>
          <span className="sm:hidden">Dev</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        </button>
      </>
    );
  };

    const isBooking = invoice.status === 'PAID' && (!invoice.isMigrated || profile.nim === 'Belum tersedia' || profile.nim.startsWith('PMB'));
    const isMasterMigrated = invoice.status === 'PAID' && invoice.isMigrated && profile.nim !== 'Belum tersedia' && !profile.nim.startsWith('PMB');

  // Computed Completion Status for Step 1 Visual Indicators
  const isCard1Complete = Boolean(profile.nama && profile.noPmb && profile.jenisKelamin && profile.prodi && profile.fakultas);
  const isCard2Complete = Boolean(profile.ktpUrl && profile.selfieUrl); // Upload KTP & Selfie
  const isCard3Complete = Boolean(profile.email?.trim() && profile.noHpWa?.trim() && profile.alamatKtpJalan?.trim() && profile.alamatKtpKota?.trim()); // Kontak Pribadi & Alamat
  const isCard4Complete = Boolean(profile.kontakDaruratNama?.trim() && profile.kontakDaruratHubungan?.trim() && profile.kontakDaruratNoHp?.trim() && profile.kontakDaruratAlamat?.trim()); // Kontak Darurat
  const isCard5Complete = Boolean(profile.tipeKamar && profile.preferensiLantai); // Preferensi Asrama

  return (
    <div className="max-w-5xl mx-auto space-y-3 sm:space-y-6 sm:px-4 lg:px-0 pb-6">
      {renderSandbox()}
      {/* HEADER DASHBOARD MABA */}
      <div className="bg-gradient-to-r from-teal-700 to-emerald-800 rounded-b-xl sm:rounded-3xl p-4 sm:p-6 md:p-8 text-white shadow-md sm:shadow-xl relative overflow-hidden -mx-0">
        <div className="absolute top-0 right-0 p-4 sm:p-8 opacity-10">
          <CheckCircle2 className="w-16 h-16 sm:w-32 sm:h-32" />
        </div>
        
        <div className="relative z-10">
          <h1 className="text-base sm:text-2xl md:text-3xl font-extrabold mb-1 sm:mb-2 text-transparent bg-clip-text bg-gradient-to-r from-white to-teal-100">
            Selamat Datang, {profile.nama.split(' ')[0]}!
          </h1>
          <p className="hidden sm:block text-teal-100 max-w-2xl text-xs sm:text-sm leading-snug sm:leading-relaxed mb-4 sm:mb-6">
            Selamat datang di Portal Layanan Asrama. Proses penerimaan terdiri dari <strong className="text-white">4 Tahap Utama</strong> (Registrasi, Booking & Pembayaran, Kontrak, dan e-Ticket). Selesaikan tahap Booking & Pembayaran agar sistem dapat melakukan <strong className="text-white">Plotting Kamar Otomatis</strong>, lalu selesaikan sisa tahapan untuk mendapatkan akses resmi ke kamar Anda.
          </p>
          <p className="sm:hidden text-teal-100/90 text-[11px] leading-snug">
            Selesaikan tahap pendaftaran asrama untuk mendapatkan akses kamar Anda.
          </p>

          <div className="hidden sm:flex flex-wrap gap-2.5 sm:gap-4 mt-3 sm:mt-0">
            <div className="bg-black/20 backdrop-blur-md px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl border border-white/10 flex items-center space-x-2.5 sm:space-x-3">
              <div className="bg-teal-500/30 p-1.5 sm:p-2 rounded-lg">
                <Scan className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-teal-100" />
              </div>
              <div>
                <p className="text-[9px] sm:text-[10px] text-teal-200 uppercase font-bold tracking-wider">No. PMB / Pendaftaran</p>
                <p className="font-mono text-xs sm:text-sm font-bold text-white">{profile.noPmb}</p>
              </div>
            </div>
            
            <div className="bg-black/20 backdrop-blur-md px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl border border-white/10 flex items-center space-x-2.5 sm:space-x-3">
              <div className="bg-teal-500/30 p-1.5 sm:p-2 rounded-lg">
                <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-teal-100" />
              </div>
              <div>
                <p className="text-[9px] sm:text-[10px] text-teal-200 uppercase font-bold tracking-wider">Status NIM (SSO)</p>
                <p className="font-mono text-xs sm:text-sm font-bold text-white">
                  {profile.nim === 'Belum tersedia' ? 'Menunggu Sinkronisasi' : profile.nim}
                </p>
              </div>
            </div>

            <div className="bg-black/20 backdrop-blur-md px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl border border-white/10 flex items-center space-x-2.5 sm:space-x-3">
              <div className={`p-1.5 sm:p-2 rounded-lg ${isBooking ? 'bg-amber-500/30' : isMasterMigrated ? 'bg-emerald-500/30' : 'bg-teal-500/30'}`}>
                {isBooking ? (
                  <BookmarkCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300" />
                ) : isMasterMigrated ? (
                  <UserCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-300" />
                ) : (
                  <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-teal-100" />
                )}
              </div>
              <div>
                <p className="text-[9px] sm:text-[10px] text-teal-200 uppercase font-bold tracking-wider">Status Pendaftaran</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {isBooking ? (
                    <span className="font-mono text-[10px] sm:text-xs font-extrabold text-amber-300 bg-amber-950/60 px-1.5 py-0.5 sm:px-2 rounded border border-amber-500/40">
                      🟡 BOOKING TERVERIFIKASI
                    </span>
                  ) : isMasterMigrated ? (
                    <span className="font-mono text-[10px] sm:text-xs font-extrabold text-emerald-300 bg-emerald-950/60 px-1.5 py-0.5 sm:px-2 rounded border border-emerald-500/40">
                      🟢 PENGHUNI AKTIF (MASTER)
                    </span>
                  ) : invoice.status === 'PENDING_VERIFICATION' ? (
                    <span className="font-mono text-[10px] sm:text-xs font-bold text-amber-200 bg-amber-950/40 px-1.5 py-0.5 sm:px-2 rounded">
                      ⏳ MENUNGGU VERIFIKASI
                    </span>
                  ) : (
                    <span className="font-mono text-[10px] sm:text-xs font-bold text-teal-100">
                      🔵 PROSES PENDAFTARAN
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* NOTIFIKASI STATUS BOOKING KAMAR */}
      {isBooking && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-5 shadow-sm text-slate-800 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                <BookmarkCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500 text-white shadow-xs">
                    Status: Booking Kamar Terkonfirmasi
                  </span>
                  <span className="text-xs font-mono font-bold text-amber-900 bg-amber-200/80 px-2.5 py-0.5 rounded border border-amber-300">
                    {room?.gedung || 'Gedung B'} — Kamar {room?.nomorKamar || '204'}
                  </span>
                </div>
                <h4 className="font-bold text-sm sm:text-base text-slate-900">
                  Pembayaran Terverifikasi & Kuota Kamar Anda Telah Terkunci Aman
                </h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed max-w-3xl">
                  Pembayaran awal registrasi Anda telah diverifikasi oleh Admin Keuangan. Kamar asrama Anda telah berhasil <strong>di-booking atas nama {profile.nama}</strong>. Akun hunian resmi (Master) dan e-Ticket Check-in akan aktif penuh setelah sinkronisasi NIM resmi dari sistem akademik SIDARA.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap md:flex-col gap-2 shrink-0 self-start md:self-center">
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-3 py-1 rounded-lg flex items-center gap-1.5 shadow-2xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Kuota Kamar Terkunci
              </span>
              <span className="text-[11px] font-bold text-amber-900 bg-amber-100 border border-amber-300 px-3 py-1 rounded-lg flex items-center gap-1.5 shadow-2xs">
                <Clock className="w-3.5 h-3.5 text-amber-600" /> Menunggu Sinkronisasi NIM
              </span>
            </div>
          </div>
        </div>
      )}

      {/* NOTIFIKASI STATUS MASTER PENYEWA AKTIF */}
      {isMasterMigrated && (
        <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-4 sm:p-5 shadow-sm text-slate-800 animate-in fade-in duration-300">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-600 text-white shadow-xs">
                  Status: Penghuni Aktif (Master Terintegrasi)
                </span>
                <span className="text-xs font-mono font-bold text-emerald-900 bg-emerald-200/80 px-2 py-0.5 rounded border border-emerald-300">
                  NIM SIDARA: {profile.nim}
                </span>
              </div>
              <h4 className="font-bold text-sm text-slate-900">
                Data Anda Telah Bermigrasi Penuh ke Master Penyewa Asrama
              </h4>
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                Akun SSO dan kamar Anda telah terintegrasi secara resmi dengan database induk UBT. Seluruh layanan asrama dan e-Ticket Check-in siap digunakan.
              </p>
            </div>
          </div>
        </div>
      )}

      {ssoNoticeBanner && typeof ssoNoticeBanner === 'string' && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 sm:p-4 flex items-start gap-3 shadow-sm relative overflow-hidden mb-6">
          <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1 pr-6">
            <h4 className="text-blue-900 font-bold text-xs sm:text-sm mb-0.5">
              {ssoNoticeBanner.startsWith('SSO Login Berhasil') ? 'SSO Login Berhasil' : 'Pemberitahuan Sistem'}
            </h4>
            <p className="text-blue-800 text-[11px] sm:text-xs leading-relaxed">
              {ssoNoticeBanner.startsWith('SSO Login Berhasil:') 
                ? ssoNoticeBanner.replace('SSO Login Berhasil: ', '') 
                : ssoNoticeBanner}
            </p>
          </div>
          {onClearSsoNotice && (
            <button 
              onClick={onClearSsoNotice}
              className="absolute top-2 right-2 text-blue-400 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 p-1.5 rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
            {/* COMBINED COMPACT STEPPER (Macro Phases + Micro Steps + SOP) */}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-slate-200 mb-4 sm:mb-6 overflow-hidden">
        {/* MOBILE COLLAPSED SUMMARY */}
        <div 
          className="md:hidden flex items-center justify-between p-3 sm:p-4 bg-slate-50 border-b border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors"
          onClick={() => setIsStepperExpandedMobile(!isStepperExpandedMobile)}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center text-sm font-bold shadow-sm">
              {currentStep}
            </div>
            <div>
              <p className="text-[10px] text-teal-700 font-bold uppercase tracking-wider mb-0.5">
                Tahap {expandedMacro}
              </p>
              <h4 className="text-xs sm:text-sm font-bold text-slate-800 leading-tight">
                {[
                  { step: 1, label: 'Validasi Identitas' },
                  { step: 2, label: 'Pilih Skema' },
                  { step: 3, label: 'Pembayaran' },
                  { step: 4, label: 'Tanda Tangan Kontrak' },
                  { step: 5, label: 'Penerbitan' },
                  { step: 6, label: 'Cetak BASTK' }
                ].find(s => s.step === currentStep)?.label || 'Proses'}
              </h4>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-500 bg-slate-200/50 px-2 py-0.5 rounded-full">
              {isStepperExpandedMobile ? 'Tutup' : 'Lihat Detail'}
            </span>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isStepperExpandedMobile ? 'rotate-180' : ''}`} />
          </div>
        </div>

        {/* DESKTOP (Always Visible) & MOBILE (Collapsible) STEPPER BODY */}
        <div className={`md:block ${isStepperExpandedMobile ? 'block' : 'hidden'} animate-in slide-in-from-top-2 duration-300`}>
          {/* MACRO PHASES (Scrollable on mobile) */}
          <div id="macro-stepper-container" className="flex overflow-x-auto hide-scrollbar bg-slate-50 border-b border-slate-200 p-2 gap-2">
            {[
            { id: 1, label: 'Tahap 1: Registrasi', icon: ShieldCheck, isDone: currentStep > 1, isActive: expandedMacro === 1 },
            { id: 2, label: 'Tahap 2: Booking & Pembayaran', icon: CreditCard, isDone: currentStep > 3, isActive: expandedMacro === 2 },
            { id: 3, label: 'Tahap 3: Kontrak', icon: FileSignature, isDone: currentStep > 5, isActive: expandedMacro === 3 },
            { id: 4, label: 'Tahap 4: e-Ticket', icon: QrCode, isDone: currentStep === 6 && (ticket?.status === 'ACTIVE' || ticket?.status === 'USED'), isActive: expandedMacro === 4 }
          ].map(phase => (
            <button 
              id={`macro-step-${phase.id}`}
              key={phase.id} 
              onClick={() => setExpandedMacro(phase.id)}
              className={`flex items-center px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                phase.isActive 
                  ? 'bg-teal-600 text-white shadow-md' 
                  : phase.isDone 
                    ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' 
                    : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {phase.isDone ? <CheckCircle2 className="w-4 h-4 mr-2" /> : <phase.icon className="w-4 h-4 mr-2" />}
              {phase.label}
            </button>
          ))}
        </div>

        {/* MICRO STEPS & SOP BUTTON */}
        <div className="p-3 md:p-4 flex flex-row items-center justify-between gap-3 overflow-x-auto hide-scrollbar relative">
          <div className="flex flex-nowrap items-center gap-2 md:gap-3 flex-1">
            {[
              { step: 1, macroId: 1, label: 'Validasi Identitas', icon: FileCheck },
              { step: 2, macroId: 2, label: 'Pilih Skema', icon: CreditCard },
              { step: 3, macroId: 2, label: 'Pembayaran', icon: CheckCircle2 },
              { step: 4, macroId: 3, label: 'Tanda Tangan', icon: PenTool },
              { step: 5, macroId: 3, label: 'Penerbitan', icon: Ticket },
              { step: 6, macroId: 4, label: 'BASTK', icon: Printer }
            ].filter(item => item.macroId === expandedMacro).map((item, index, array) => {
              const isCompleted = currentStep > item.step || (item.step === 6 && showBastk);
              const isCurrent = currentStep === item.step;
              const Icon = item.icon;
              return (
                <div key={item.step} className="flex items-center shrink-0">
                  <button
                    onClick={() => handleStepNavigation(item.step as AdmissionStep)}
                    className={`flex items-center space-x-1.5 md:space-x-2 px-2 py-1.5 md:px-3 md:py-1.5 rounded-lg transition-all ${
                      isCurrent 
                        ? 'bg-teal-50 border border-teal-200 text-teal-700' 
                        : isCompleted
                        ? 'text-teal-600 hover:bg-teal-50'
                        : 'text-slate-400 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center text-[10px] font-bold border ${
                      isCompleted ? 'bg-teal-500 border-teal-500 text-white' : 
                      isCurrent ? 'bg-teal-600 border-teal-600 text-white' : 
                      'bg-white border-slate-300'
                    }`}>
                      {isCompleted ? <CheckCircle2 className="w-3 h-3 md:w-3.5 md:h-3.5" /> : item.step}
                    </div>
                    <span className={`text-[11px] md:text-xs font-bold ${isCurrent ? 'text-teal-700' : isCompleted ? 'text-teal-600' : 'text-slate-500'}`}>
                      {item.label}
                    </span>
                  </button>
                  {index < array.length - 1 && (
                    <ArrowRight className="w-3 h-3 md:w-4 md:h-4 text-slate-300 mx-1 md:mx-1" />
                  )}
                </div>
              );
            })}
          </div>
          
          <div className="shrink-0 border-l border-slate-200 pl-3 md:pl-4 sticky right-0 bg-white shadow-[-8px_0_12px_-4px_rgba(255,255,255,0.9)] md:shadow-none">
            <button 
              onClick={(e) => handleOpenSop(expandedMacro, e)} 
              className="flex items-center justify-center p-2 md:px-4 md:py-2 bg-slate-50 hover:bg-teal-50 text-teal-700 rounded-xl border border-slate-200 transition-colors shadow-sm"
              title={`Panduan Tahap ${expandedMacro}`}
            >
              <HelpCircle className="w-4 h-4 md:w-4 md:h-4 md:mr-2 flex-shrink-0" /> 
              <span className="hidden md:inline text-xs font-bold whitespace-nowrap">Panduan Tahap {[1, 2, 3, 4][expandedMacro - 1]}</span>
            </button>
          </div>
        </div>
        </div>
      </div>

      {/* <AutoResumeBanner currentStep={currentStep} onResume={(step) => handleStepNavigation(step as AdmissionStep)} /> */}

      {/* STEP 1: VALIDASI IDENTITAS & PERSETUJUAN */}
      {currentStep === 1 && (
        <div id="step-1-panel" className="space-y-4 sm:space-y-6">
          {/* Hidden File Pickers & Native Camera Inputs */}
          <input
            type="file"
            ref={ktpFileInputRef}
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFileChange(e, 'ktp')}
          />
          <input
            type="file"
            ref={ktpNativeCamRef}
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => handleFileChange(e, 'ktp')}
          />
          <input
            type="file"
            ref={selfieFileInputRef}
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFileChange(e, 'selfie')}
          />
          <input
            type="file"
            ref={selfieNativeCamRef}
            accept="image/*"
            capture="user"
            className="hidden"
            onChange={(e) => handleFileChange(e, 'selfie')}
          />

          {/* HEADER TEXT & AUTO-SAVE STATUS */}
          <div className="mb-4 pt-1 lg:pt-4">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5 sm:gap-3">
              <div className="flex-1">
                <div className="hidden sm:flex items-center space-x-2 text-[10px] sm:text-[11px] font-bold text-teal-700 uppercase tracking-widest mb-1.5">
                  <span>ADMISSION FORM</span>
                  <span className="text-teal-300">•</span>
                  <span>ASRAMA UBT</span>
                </div>
                
                <h2 className="text-[15px] sm:text-xl md:text-2xl font-extrabold text-slate-900 mb-1 leading-tight">
                  Registrasi Data Penghuni Asrama & Validasi Identitas
                </h2>
                
                <p className="hidden sm:block text-slate-500 text-[11px] sm:text-xs md:text-sm max-w-3xl leading-relaxed">
                  Lengkapi formulir data diri, kontak darurat wali, preferensi kamar asrama, serta unggah dokumen identitas resmi untuk verifikasi keamanan dan kepenghunian Asrama Universitas Bunda Thamrin.
                </p>
                
                {/* Mobile-only compact subtitle */}
                <p className="sm:hidden text-slate-500 text-[10px] leading-snug">
                  Lengkapi formulir data diri & unggah dokumen identitas resmi.
                </p>
              </div>

              {/* Debounced Auto-Save Status Indicator */}
              <div className="flex items-center gap-1.5 sm:gap-2 self-start mt-1 sm:mt-0">
                {autoSaveStatus === 'saving' && (
                  <div className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[9px] sm:text-[10px] md:text-xs font-semibold animate-pulse shadow-xs">
                    <Loader2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 animate-spin text-amber-600" />
                    <span>Menyimpan...</span>
                  </div>
                )}
                {autoSaveStatus === 'saved' && (
                  <div className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[9px] sm:text-[10px] md:text-xs font-semibold shadow-xs">
                    <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-600" />
                    <span className="hidden sm:inline">
                      Draf tersimpan {lastSavedTime ? `pk. ${lastSavedTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}` : ''}
                    </span>
                    <span className="sm:hidden">
                      Tersimpan {lastSavedTime ? `${lastSavedTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}` : ''}
                    </span>
                  </div>
                )}
                {autoSaveStatus === 'restored' && (
                  <div className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-[9px] sm:text-[10px] md:text-xs font-semibold shadow-xs">
                    <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-600" />
                    <span className="hidden sm:inline">Draf dipulihkan</span>
                    <span className="sm:hidden">Draf dipulihkan</span>
                    {hasRestoredDraft && (
                      <button 
                        onClick={() => setHasRestoredDraft(false)}
                        className="sm:hidden ml-1 -mr-1 text-blue-600 hover:text-blue-800 bg-blue-200/50 rounded-full px-1.5 py-0.5 text-[8px] font-bold"
                      >
                        Tutup
                      </button>
                    )}
                  </div>
                )}
                {autoSaveStatus === 'idle' && (
                  <div className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-[9px] sm:text-[10px] md:text-xs font-medium">
                    <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-500" />
                    <span className="hidden sm:inline">Auto-Save Aktif</span>
                    <span className="sm:hidden">Auto-Save</span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={handleManualSaveDraft}
                  disabled={autoSaveStatus === 'saving'}
                  title="Simpan draf isian formulir sekarang ke penyimpanan lokal"
                  className="inline-flex items-center justify-center p-1.5 sm:px-2.5 sm:py-1 bg-white hover:bg-slate-100 text-slate-700 text-[10px] sm:text-xs font-semibold rounded-lg border border-slate-200 transition-colors shadow-xs"
                >
                  <Save className="w-3.5 h-3.5 text-slate-600" />
                  <span className="hidden sm:inline ml-1.5">Simpan</span>
                </button>
              </div>
            </div>
          </div>

          {/* SESSION RECOVERY ALERT (If Draft Restored from Previous Interrupted Session) */}
          {hasRestoredDraft && !profile.kycSubmitted && (
            <div className="hidden sm:flex bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 items-center justify-between gap-3 shadow-sm animate-in fade-in duration-300">
              <div className="flex items-center gap-2 overflow-hidden">
                <Sparkles className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span className="text-[11px] text-blue-900 font-medium truncate">
                  Draf dipulihkan {lastSavedTime ? `(pk. ${lastSavedTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })})` : ''}. Lanjutkan isian Anda.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setHasRestoredDraft(false)}
                className="text-blue-700 hover:text-blue-900 font-bold text-[10px] whitespace-nowrap bg-blue-100 hover:bg-blue-200 px-2 py-1 rounded"
              >
                Tutup
              </button>
            </div>
          )}

          {profile.kycSubmitted && profile.correctionStatus !== 'unlocked' && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm">
              <div>
                <div className="flex items-center gap-2">
                  <span className="bg-amber-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">TERKUNCI</span>
                  <h3 className="font-bold text-amber-950 text-sm">Data Formulir Telah Dikunci untuk Validasi</h3>
                </div>
                <p className="text-xs text-amber-800 mt-1 max-w-3xl">
                  Data Anda telah tersimpan dan siap diproses. Jika ada perubahan data kontak/wali, Anda dapat mengajukan permohonan koreksi data kepada administrator asrama atau membuka kunci untuk simulasi ulang.
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    updateProfileObject({ kycSubmitted: false, kycVerified: false });
                    toast.success('Kunci formulir dibuka untuk pengeditan dan simulasi.');
                  }}
                  className="bg-white border border-amber-300 text-amber-900 px-4 py-2 rounded-xl font-bold text-xs hover:bg-amber-100 transition-colors"
                >
                  Buka Kunci (Simulasi)
                </button>
                <button
                  type="button"
                  onClick={() => setCorrectionModalOpen(true)}
                  className="bg-slate-900 text-white px-4 py-2 rounded-xl font-bold text-xs hover:bg-slate-800 transition-colors"
                >
                  Ajukan Koreksi Data
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 items-start">
              {/* CARD 1: DATA AKADEMIK */}
              <div className={`bg-white border rounded-2xl p-4 sm:p-6 shadow-sm transition-all duration-300 ${isCard1Complete ? 'border-emerald-400 ring-1 ring-emerald-400/30' : 'border-slate-200'}`}>
                <div className="flex justify-between items-start mb-0">
                  <div 
                    className="flex-1 cursor-pointer flex items-center justify-between pr-4"
                    onClick={() => setIsAcademicExpanded(!isAcademicExpanded)}
                  >
                    <div>
                      <h3 className="text-xs sm:text-[15px] font-bold text-slate-900 flex items-center space-x-2">
                        {isCard1Complete ? (
                          <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] sm:text-xs font-bold flex-shrink-0"><CheckCircle2 className="w-3.5 h-3.5" /></span>
                        ) : (
                          <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-teal-700 text-white flex items-center justify-center text-[10px] sm:text-xs font-bold flex-shrink-0">1</span>
                        )}
                        <span>Data Akademik & PMB</span>
                        {isAcademicExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                      </h3>
                      <p className="text-[9px] sm:text-[11px] text-slate-500 mt-0.5 ml-8 leading-tight">
                        {isEditingAcademic ? 'Mode edit aktif untuk keperluan uji coba' : 'Sinkronisasi langsung dari SIAKAD / PMB UBT'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsEditingAcademic(!isEditingAcademic);
                      if (!isEditingAcademic) {
                        setIsAcademicExpanded(true); // Auto expand if editing
                        toast.info('Mode edit data akademik aktif. Anda dapat mengubah nama, NIM, atau prodi.');
                      } else {
                        toast.success('Perubahan data akademik disimpan.');
                      }
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border flex-shrink-0 ${
                      isEditingAcademic
                        ? 'bg-teal-600 border-teal-600 text-white hover:bg-teal-700'
                        : 'bg-slate-50 border-slate-300 text-slate-700 hover:bg-teal-50 hover:text-teal-700'
                    }`}
                  >
                    {isEditingAcademic ? '✓ Selesai' : '⚙ Ubah'}
                  </button>
                </div>

                {/* Collapsed Compact View (Mobile & Tablet) */}
                {!isAcademicExpanded && (
                  <div 
                    className="mt-4 ml-0 sm:ml-8 p-3.5 bg-slate-50 hover:bg-teal-50/50 rounded-xl border border-slate-200/80 flex flex-col gap-2.5 transition-all cursor-pointer group shadow-xs" 
                    onClick={() => setIsAcademicExpanded(true)}
                    title="Klik untuk membuka detail lengkap form akademik"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xs sm:text-sm font-bold text-slate-800 truncate">
                          {profile.nama || 'Nama Belum Tersedia'}
                        </span>
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60 shrink-0">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Terverifikasi
                        </span>
                      </div>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200/70 shrink-0">
                        {profile.kategori || 'Reguler'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-200/70 text-[11px]">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <span className="text-slate-400 font-medium text-[10px] uppercase tracking-wider">NIM:</span>
                        <span className="font-mono font-bold text-slate-800">
                          {profile.nim && profile.nim !== 'Belum tersedia' ? profile.nim : (profile.noPmb || '-')}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <span className="text-slate-400 font-medium text-[10px] uppercase tracking-wider">Prodi:</span>
                        <span className="font-semibold text-slate-800 truncate">
                          {profile.prodi || '-'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-600 col-span-1 sm:col-span-2">
                        <span className="text-slate-400 font-medium text-[10px] uppercase tracking-wider">NIK KTP:</span>
                        <span className="font-mono font-semibold text-slate-800">
                          {profile.nik || (profile.kycVerified ? '6403051204050001 (Valid)' : profile.ktpUrl ? '6403051204050001 (Terekstraksi)' : 'Menunggu Unggah KTP')}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-teal-700 font-medium pt-1 border-t border-dashed border-slate-200">
                      <span className="text-slate-400">Sinkronisasi SIAKAD / PMB</span>
                      <span className="group-hover:translate-x-0.5 transition-transform font-bold flex items-center gap-0.5">
                        Ketuk untuk ubah / detail &rarr;
                      </span>
                    </div>
                  </div>
                )}

                {/* Expanded Form View */}
                <div className={`mt-5 grid grid-cols-2 gap-4 transition-all duration-300 ${isAcademicExpanded ? 'block' : 'hidden'}`}>
                  <div className="col-span-2 md:col-span-1">
                    <label className="text-slate-700 block mb-1 text-[11px] font-bold">Nama Lengkap *</label>
                    {isEditingAcademic ? (
                      <input
                        type="text"
                        value={profile.nama || ''}
                        onChange={(e) => updateProfileField('nama', e.target.value)}
                        className="w-full bg-white border border-teal-400 focus:ring-2 focus:ring-teal-500 rounded-lg px-3 py-2 text-slate-900 font-medium text-xs"
                      />
                    ) : (
                      <input
                        type="text"
                        value={profile.nama || ''}
                        readOnly
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 font-medium text-xs cursor-default"
                      />
                    )}
                  </div>

                  <div className="col-span-2 md:col-span-1">
                    <label className="text-slate-700 block mb-1 text-[11px] font-bold">No PMB / Registrasi *</label>
                    {isEditingAcademic ? (
                      <input
                        type="text"
                        value={profile.noPmb || ''}
                        onChange={(e) => updateProfileField('noPmb', e.target.value)}
                        className="w-full bg-white border border-teal-400 focus:ring-2 focus:ring-teal-500 rounded-lg px-3 py-2 text-slate-900 font-medium text-xs"
                      />
                    ) : (
                      <input
                        type="text"
                        value={profile.noPmb || ''}
                        readOnly
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 font-medium text-xs cursor-default"
                      />
                    )}
                  </div>

                  <div className="col-span-2 md:col-span-1">
                    <label className="text-slate-700 block mb-1 text-[11px] font-bold">NIM (Nomor Induk Mahasiswa)</label>
                    {isEditingAcademic ? (
                      <input
                        type="text"
                        value={profile.nim || ''}
                        onChange={(e) => updateProfileField('nim', e.target.value)}
                        placeholder="Contoh: 2601015001"
                        className="w-full bg-white border border-teal-400 focus:ring-2 focus:ring-teal-500 rounded-lg px-3 py-2 text-slate-900 font-medium text-xs"
                      />
                    ) : (
                      <input
                        type="text"
                        value={profile.nim || 'Belum tersedia'}
                        readOnly
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 font-medium text-xs cursor-default"
                      />
                    )}
                  </div>

                  <div className="col-span-2 md:col-span-1">
                    <label className="text-slate-700 block mb-1 text-[11px] font-bold">NIK KTP (e-KYC)</label>
                    <input
                      type="text"
                      value={profile.nik || (profile.kycVerified ? '6403051204050001 (Valid)' : profile.ktpUrl ? '6403051204050001 (Terekstraksi)' : 'Menunggu Unggah KTP...')}
                      readOnly
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 font-medium text-xs cursor-default"
                    />
                  </div>

                  <div className="col-span-2 md:col-span-1">
                    <label className="text-slate-700 block mb-1 text-[11px] font-bold">Program Studi *</label>
                    {isEditingAcademic ? (
                      <input
                        type="text"
                        value={profile.prodi || ''}
                        onChange={(e) => updateProfileField('prodi', e.target.value)}
                        className="w-full bg-white border border-teal-400 focus:ring-2 focus:ring-teal-500 rounded-lg px-3 py-2 text-slate-900 font-medium text-xs"
                      />
                    ) : (
                      <input
                        type="text"
                        value={profile.prodi || ''}
                        readOnly
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 font-medium text-xs cursor-default"
                      />
                    )}
                  </div>

                  <div className="col-span-2 md:col-span-1">
                    <label className="text-slate-700 block mb-1 text-[11px] font-bold">Fakultas *</label>
                    {isEditingAcademic ? (
                      <input
                        type="text"
                        value={profile.fakultas || ''}
                        onChange={(e) => updateProfileField('fakultas', e.target.value)}
                        className="w-full bg-white border border-teal-400 focus:ring-2 focus:ring-teal-500 rounded-lg px-3 py-2 text-slate-900 font-medium text-xs"
                      />
                    ) : (
                      <input
                        type="text"
                        value={profile.fakultas || ''}
                        readOnly
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 font-medium text-xs cursor-default"
                      />
                    )}
                  </div>

                  <div className="col-span-2 md:col-span-1">
                    <label className="text-slate-700 block mb-1 text-[11px] font-bold">Angkatan</label>
                    <input
                      type="text"
                      value={profile.angkatan || '2026'}
                      onChange={(e) => updateProfileField('angkatan', e.target.value)}
                      readOnly={!isEditingAcademic}
                      className={`w-full rounded-lg px-3 py-2 font-medium text-xs ${
                        isEditingAcademic
                          ? 'bg-white border border-teal-400 text-slate-900'
                          : 'bg-slate-50 border border-slate-200 text-slate-700'
                      }`}
                    />
                  </div>

                  <div className="col-span-2 md:col-span-1">
                    <label className="text-slate-700 block mb-1 text-[11px] font-bold">Jenis Kelamin *</label>
                    {isEditingAcademic ? (
                      <select
                        value={profile.jenisKelamin || 'Laki-laki'}
                        onChange={(e) => updateProfileField('jenisKelamin', e.target.value)}
                        className="w-full bg-white border border-teal-400 focus:ring-2 focus:ring-teal-500 rounded-lg px-3 py-2 text-slate-900 font-medium text-xs"
                      >
                        <option value="Laki-laki">Laki-laki</option>
                        <option value="Perempuan">Perempuan</option>
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={profile.jenisKelamin === 'L' ? 'Laki-laki' : profile.jenisKelamin === 'P' ? 'Perempuan' : profile.jenisKelamin || 'Laki-laki'}
                        readOnly
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 font-medium text-xs cursor-default"
                      />
                    )}
                  </div>

                  <div className="col-span-2">
                    <label className="text-slate-700 block mb-1 text-[11px] font-bold">Kategori Status Penerimaan</label>
                    <div className="flex gap-2">
                      <select
                        value={profile.kategori || 'Reguler'}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateProfileObject({
                            kategori: val,
                            isKipStudent: val.toLowerCase().includes('kip'),
                          });
                        }}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-bold text-xs focus:ring-2 focus:ring-teal-500"
                      >
                        <option value="Reguler">Reguler (Mandiri / SNBP / SNBT)</option>
                        <option value="KIP-Kuliah">Penerima Beasiswa KIP-Kuliah</option>
                        <option value="Afirmasi 3T">Afirmasi Daerah 3T / Terpencil</option>
                        <option value="Internasional">Mahasiswa Asing / Internasional</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* CARD 2: UPLOAD DOKUMEN & e-KYC */}
          <div className={`bg-white border rounded-2xl p-4 sm:p-6 shadow-sm transition-all duration-300 ${isCard2Complete ? 'border-emerald-400 ring-1 ring-emerald-400/30' : 'border-slate-200'}`}>
            <div className="flex flex-wrap gap-4 justify-between items-start mb-6">
              <div className="flex-1">
                <h3 className="text-xs sm:text-[15px] font-bold text-slate-900 flex items-center space-x-2">
                  {isCard2Complete ? (
                    <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] sm:text-xs font-bold flex-shrink-0"><CheckCircle2 className="w-3.5 h-3.5" /></span>
                  ) : (
                    <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-teal-700 text-white flex items-center justify-center text-[10px] sm:text-xs font-bold flex-shrink-0">2</span>
                  )}
                  <span>Upload Dokumen Identitas Resmi</span>
                </h3>
                <p className="text-[9px] sm:text-[11px] text-slate-500 mt-0.5 ml-8 leading-tight">
                  KTP dan Pasfoto Selfie disimpan pada Secure Encrypted Storage dengan ekstraksi AI & biometrik.
                </p>
              </div>
              {isCard2Complete ? (
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100 flex items-center gap-1 flex-shrink-0 mt-1 md:mt-0">
                  <CheckCircle2 className="w-3 h-3" /> Tuntas
                </span>
              ) : (
                <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-full border border-amber-200 flex items-center gap-1 flex-shrink-0 mt-1 md:mt-0">
                  <AlertCircle className="w-3 h-3" /> Wajib Diisi
                </span>
              )}
              <span className="bg-teal-50 text-teal-800 border border-teal-200 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide flex items-center gap-1">
                <Lock className="w-3 h-3 text-teal-600" /> Private Encrypted Disk
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-xl border border-slate-200 border-dashed">
              {/* KTP UPLOAD */}
              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-teal-50 text-teal-700 rounded-lg border border-teal-100">
                    <Camera className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-800">Kartu Tanda Penduduk (KTP) *</h4>
                    <p className="text-[10px] text-slate-500">Scan KTP Asli / Foto Jelas (Maksimal 5MB)</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => { setCameraTarget('ktp'); setCameraModalOpen(true); }}
                    className="flex items-center justify-center gap-1.5 py-2.5 bg-teal-800 hover:bg-teal-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm active:scale-95"
                  >
                    <Camera className="w-3.5 h-3.5" /> Kamera Live
                  </button>
                  <button
                    type="button"
                    onClick={() => ktpNativeCamRef.current?.click()}
                    className="flex items-center justify-center gap-1.5 py-2.5 bg-white border border-teal-600 text-teal-700 hover:bg-teal-50 rounded-lg text-xs font-bold transition-colors active:scale-95"
                  >
                    <Smartphone className="w-3.5 h-3.5" /> Kamera HP Direct
                  </button>
                  <button
                    type="button"
                    onClick={() => ktpFileInputRef.current?.click()}
                    className="flex items-center justify-center gap-1.5 py-2.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-bold transition-colors active:scale-95"
                  >
                    <ImageIcon className="w-3.5 h-3.5" /> Pilih File Galeri
                  </button>
                </div>

                <div className="mt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      const mockNik = '640305' + Math.floor(1000000000 + Math.random() * 9000000000);
                      updateProfileObject({ ktpUrl: 'mock_ktp.jpg', nik: mockNik });
                      setKtpFileName('KTP_Scan_Simulasi.jpg');
                      setKtpPreview('mock_ktp.jpg');
                      setVerificationHistory((prev) => [
                        {
                          id: Date.now().toString(),
                          timestamp: new Date(),
                          type: 'KTP',
                          status: 'success',
                          message: `Simulasi KTP Valid. NIK terverifikasi: ${mockNik}`,
                        },
                        ...prev,
                      ]);
                      toast.success(`Simulasi KTP Berhasil! NIK ${mockNik} terekstraksi.`);
                    }}
                    className="text-[11px] text-slate-400 hover:text-teal-700 flex items-center gap-1 transition-colors"
                  >
                    <Sparkles className="w-3 h-3 text-teal-500" /> Simulasi File KTP (Dev)
                  </button>
                </div>

                {profile.ktpUrl && (
                  <div className="mt-4 border border-slate-200 rounded-xl overflow-hidden relative group">
                    <img
                      src={profile.ktpUrl !== 'mock_ktp.jpg' ? profile.ktpUrl : 'https://placehold.co/600x400/e2e8f0/0f766e?text=Dokumen+KTP+Terverifikasi'}
                      alt="KTP Preview"
                      className="w-full h-40 object-cover"
                    />
                    <div className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => ktpFileInputRef.current?.click()}
                        className="bg-white text-slate-800 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-slate-100"
                      >
                        Ganti Foto
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setKtpPreview(null);
                          setKtpFileName('');
                          updateProfileObject({ ktpUrl: undefined });
                          toast.info('File KTP dihapus.');
                        }}
                        className="bg-rose-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-rose-700"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Hapus
                      </button>
                    </div>
                    <div className="absolute top-2 left-2 bg-teal-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">
                      Terverifikasi AI • NIK {profile.nik || '6403051204050001'}
                    </div>
                  </div>
                )}
              </div>

              {/* SELFIE UPLOAD */}
              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-teal-50 text-teal-700 rounded-lg border border-teal-100">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-800">Pasfoto Selfie + KTP *</h4>
                    <p className="text-[10px] text-slate-500">Kamera Depan • Verifikasi Biometrik Wajah Calon Penghuni</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => { setCameraTarget('selfie'); setCameraModalOpen(true); }}
                    className="flex items-center justify-center gap-1.5 py-2.5 bg-teal-800 hover:bg-teal-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm active:scale-95"
                  >
                    <Camera className="w-3.5 h-3.5" /> Kamera Selfie
                  </button>
                  <button
                    type="button"
                    onClick={() => selfieNativeCamRef.current?.click()}
                    className="flex items-center justify-center gap-1.5 py-2.5 bg-white border border-teal-600 text-teal-700 hover:bg-teal-50 rounded-lg text-xs font-bold transition-colors active:scale-95"
                  >
                    <Smartphone className="w-3.5 h-3.5" /> Kamera HP Direct
                  </button>
                  <button
                    type="button"
                    onClick={() => selfieFileInputRef.current?.click()}
                    className="flex items-center justify-center gap-1.5 py-2.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-bold transition-colors active:scale-95"
                  >
                    <ImageIcon className="w-3.5 h-3.5" /> Pilih File Galeri
                  </button>
                </div>

                <div className="mt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      updateProfileObject({ selfieUrl: 'mock_selfie.jpg' });
                      setSelfieFileName('Selfie_KTP_Simulasi.jpg');
                      setSelfiePreview('mock_selfie.jpg');
                      setVerificationHistory((prev) => [
                        {
                          id: Date.now().toString(),
                          timestamp: new Date(),
                          type: 'Selfie',
                          status: 'success',
                          message: 'Simulasi Wajah Terdeteksi & Biometrik Cocok dengan KTP.',
                        },
                        ...prev,
                      ]);
                      toast.success('Simulasi Pasfoto Selfie Berhasil! Wajah terdeteksi.');
                    }}
                    className="text-[11px] text-slate-400 hover:text-teal-700 flex items-center gap-1 transition-colors"
                  >
                    <Sparkles className="w-3 h-3 text-teal-500" /> Simulasi Foto Selfie (Dev)
                  </button>
                </div>

                {profile.selfieUrl && (
                  <div className="mt-4 border border-slate-200 rounded-xl overflow-hidden relative group">
                    <img
                      src={profile.selfieUrl !== 'mock_selfie.jpg' ? profile.selfieUrl : 'https://placehold.co/400x400/e2e8f0/0f766e?text=Pasfoto+Selfie+Biometrik+Valid'}
                      alt="Selfie Preview"
                      className="w-full h-40 object-cover"
                    />
                    <div className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => selfieFileInputRef.current?.click()}
                        className="bg-white text-slate-800 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-slate-100"
                      >
                        Ganti Foto
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelfiePreview(null);
                          setSelfieFileName('');
                          updateProfileObject({ selfieUrl: undefined });
                          toast.info('File selfie dihapus.');
                        }}
                        className="bg-rose-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-rose-700"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Hapus
                      </button>
                    </div>
                    <div className="absolute top-2 left-2 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">
                      Biometrik Valid • Wajah Terverifikasi
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* CARD 3: KONTAK PRIBADI & ALAMAT */}
              <div className={`bg-white border rounded-2xl p-4 sm:p-6 shadow-sm transition-all duration-300 ${isCard3Complete ? 'border-emerald-400 ring-1 ring-emerald-400/30' : 'border-slate-200'}`}>
                <div className="mb-5 flex items-start justify-between">
                  <div>
                    <h3 className="text-xs sm:text-[15px] font-bold text-slate-900 flex items-center space-x-2">
                      {isCard3Complete ? (
                        <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] sm:text-xs font-bold flex-shrink-0"><CheckCircle2 className="w-3.5 h-3.5" /></span>
                      ) : (
                        <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-teal-700 text-white flex items-center justify-center text-[10px] sm:text-xs font-bold flex-shrink-0">3</span>
                      )}
                      <span>Kontak Pribadi & Alamat</span>
                    </h3>
                    <p className="text-[9px] sm:text-[11px] text-slate-500 mt-0.5 ml-8 leading-tight">Nomor komunikasi aktif dan alamat asal calon penghuni asrama</p>
                  </div>
                  {isCard3Complete ? (
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100 flex items-center gap-1 flex-shrink-0">
                      <CheckCircle2 className="w-3 h-3" /> Tuntas
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-full border border-amber-200 flex items-center gap-1 flex-shrink-0">
                      <AlertCircle className="w-3 h-3" /> Wajib Diisi
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 md:col-span-1">
                    <label className="text-slate-700 block mb-1 text-[11px] font-bold">Email Aktif *</label>
                    <input
                      type="email"
                      required
                      placeholder="nama@mhs.ubtsu.ac.id"
                      value={profile.email || ''}
                      onChange={(e) => updateProfileField('email', e.target.value)}
                      className="w-full bg-white border border-slate-300 focus:ring-2 focus:ring-teal-500 rounded-lg px-3 py-2 text-slate-900 font-medium text-xs"
                    />
                  </div>

                  <div className="col-span-2 md:col-span-1">
                    <label className="text-slate-700 block mb-1 text-[11px] font-bold">No HP / WhatsApp Mahasiswa *</label>
                    <input
                      type="tel"
                      required
                      placeholder="081234567890"
                      value={profile.noHpWa || ''}
                      onChange={(e) => updateProfileField('noHpWa', e.target.value)}
                      className="w-full bg-white border border-slate-300 focus:ring-2 focus:ring-teal-500 rounded-lg px-3 py-2 text-slate-900 font-medium text-xs"
                    />
                  </div>

                  <div className="col-span-2 mt-2 pt-3 border-t border-slate-100">
                    <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-3">
                      <MapPin className="w-3.5 h-3.5 text-teal-600" /> Alamat Asal (Sesuai KTP)
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <label className="text-slate-700 block mb-1 text-[10px] font-bold">Jalan / Dusun / No Rumah *</label>
                        <input
                          type="text"
                          required
                          placeholder="Jl. MH Thamrin No. 45"
                          value={profile.alamatKtpJalan || ''}
                          onChange={(e) => updateProfileField('alamatKtpJalan', e.target.value)}
                          className="w-full bg-white border border-slate-300 focus:ring-2 focus:ring-teal-500 rounded-lg px-3 py-2 text-slate-900 font-medium text-xs"
                        />
                      </div>

                      <div>
                        <label className="text-slate-700 block mb-1 text-[10px] font-bold">RT / RW *</label>
                        <input
                          type="text"
                          required
                          placeholder="002/004"
                          value={profile.alamatKtpRtRw || ''}
                          onChange={(e) => updateProfileField('alamatKtpRtRw', e.target.value)}
                          className="w-full bg-white border border-slate-300 focus:ring-2 focus:ring-teal-500 rounded-lg px-3 py-2 text-slate-900 font-medium text-xs"
                        />
                      </div>

                      {/* Cascading National Administrative Selector for KTP */}
                      <IndonesianRegionSelector
                        province={profile.alamatKtpProvinsi || ''}
                        regency={profile.alamatKtpKabupatenKota || ''}
                        district={profile.alamatKtpKecamatan || ''}
                        village={profile.alamatKtpKelurahan || ''}
                        postalCode={profile.alamatKtpKodePos || ''}
                        onProvinceChange={(prov) => updateProfileField('alamatKtpProvinsi', prov)}
                        onRegencyChange={(reg) => updateProfileField('alamatKtpKabupatenKota', reg)}
                        onDistrictChange={(dist) => updateProfileField('alamatKtpKecamatan', dist)}
                        onVillageChange={(vil, postal) => {
                          updateProfileObject({
                            alamatKtpKelurahan: vil,
                            ...(postal ? { alamatKtpKodePos: postal } : {}),
                          });
                        }}
                        onPostalCodeChange={(postal) => updateProfileField('alamatKtpKodePos', postal)}
                      />

                      <div className="pt-2">
                        <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 font-medium select-none">
                          <input
                            type="checkbox"
                            checked={profile.isAlamatDomisiliSamaDenganKtp !== false}
                            onChange={(e) => {
                              const isChecked = e.target.checked;
                              if (isChecked) {
                                updateProfileObject({
                                  isAlamatDomisiliSamaDenganKtp: true,
                                  alamatDomisiliJalan: profile.alamatKtpJalan,
                                  alamatDomisiliRtRw: profile.alamatKtpRtRw,
                                  alamatDomisiliKelurahan: profile.alamatKtpKelurahan,
                                  alamatDomisiliKecamatan: profile.alamatKtpKecamatan,
                                  alamatDomisiliKabupatenKota: profile.alamatKtpKabupatenKota,
                                  alamatDomisiliProvinsi: profile.alamatKtpProvinsi,
                                  alamatDomisiliKodePos: profile.alamatKtpKodePos,
                                });
                              } else {
                                updateProfileObject({
                                  isAlamatDomisiliSamaDenganKtp: false,
                                });
                              }
                            }}
                            className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 w-4 h-4"
                          />
                          <span>Alamat domisili saat ini sama dengan alamat KTP</span>
                        </label>
                      </div>

                      {/* CONDITIONAL DOMISILI INPUTS: HANYA MUNCUL JIKA TIDAK DICENTANG (isAlamatDomisiliSamaDenganKtp === false) */}
                      {!profile.isAlamatDomisiliSamaDenganKtp && (
                        <div className="mt-4 pt-4 border-t border-dashed border-slate-300 bg-amber-50/50 p-4 rounded-xl space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-amber-600" /> Alamat Domisili Saat Ini (Kos / Tempat Tinggal Sekarang)
                            </h4>
                            <span className="text-[10px] font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">Berbeda dengan KTP</span>
                          </div>

                          <div>
                            <label className="text-slate-700 block mb-1 text-[10px] font-bold">Jalan / Dusun / Kos / No Rumah (Domisili) *</label>
                            <input
                              type="text"
                              required
                              placeholder="Jl. Pelajar No. 12 (Kost Mawar)"
                              value={profile.alamatDomisiliJalan || ''}
                              onChange={(e) => updateProfileField('alamatDomisiliJalan', e.target.value)}
                              className="w-full bg-white border border-slate-300 focus:ring-2 focus:ring-teal-500 rounded-lg px-3 py-2 text-slate-900 font-medium text-xs"
                            />
                          </div>

                          <div>
                            <label className="text-slate-700 block mb-1 text-[10px] font-bold">RT / RW (Domisili) *</label>
                            <input
                              type="text"
                              required
                              placeholder="001/002"
                              value={profile.alamatDomisiliRtRw || ''}
                              onChange={(e) => updateProfileField('alamatDomisiliRtRw', e.target.value)}
                              className="w-full bg-white border border-slate-300 focus:ring-2 focus:ring-teal-500 rounded-lg px-3 py-2 text-slate-900 font-medium text-xs"
                            />
                          </div>

                          {/* Cascading National Administrative Selector for Domisili */}
                          <IndonesianRegionSelector
                            labelSuffix="(Domisili)"
                            province={profile.alamatDomisiliProvinsi || ''}
                            regency={profile.alamatDomisiliKabupatenKota || ''}
                            district={profile.alamatDomisiliKecamatan || ''}
                            village={profile.alamatDomisiliKelurahan || ''}
                            postalCode={profile.alamatDomisiliKodePos || ''}
                            onProvinceChange={(prov) => updateProfileField('alamatDomisiliProvinsi', prov)}
                            onRegencyChange={(reg) => updateProfileField('alamatDomisiliKabupatenKota', reg)}
                            onDistrictChange={(dist) => updateProfileField('alamatDomisiliKecamatan', dist)}
                            onVillageChange={(vil, postal) => {
                              updateProfileObject({
                                alamatDomisiliKelurahan: vil,
                                ...(postal ? { alamatDomisiliKodePos: postal } : {}),
                              });
                            }}
                            onPostalCodeChange={(postal) => updateProfileField('alamatDomisiliKodePos', postal)}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            
              {/* CARD 4: KONTAK DARURAT */}
              <div className={`bg-white border rounded-2xl p-4 sm:p-6 shadow-sm transition-all duration-300 ${isCard4Complete ? 'border-emerald-400 ring-1 ring-emerald-400/30' : 'border-slate-200'}`}>
                <div className="mb-5 flex items-start justify-between">
                  <div>
                    <h3 className="text-xs sm:text-[15px] font-bold text-slate-900 flex items-center space-x-2">
                      {isCard4Complete ? (
                        <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] sm:text-xs font-bold flex-shrink-0"><CheckCircle2 className="w-3.5 h-3.5" /></span>
                      ) : (
                        <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-teal-700 text-white flex items-center justify-center text-[10px] sm:text-xs font-bold flex-shrink-0">4</span>
                      )}
                      <span>Kontak Darurat (Orang Tua / Wali)</span>
                    </h3>
                    <p className="text-[9px] sm:text-[11px] text-slate-500 mt-0.5 ml-8 leading-tight">Wajib untuk komunikasi resmi asrama dan pengiriman OTP Orang Tua / Wali</p>
                  </div>
                  {isCard4Complete ? (
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100 flex items-center gap-1 flex-shrink-0">
                      <CheckCircle2 className="w-3 h-3" /> Tuntas
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-full border border-amber-200 flex items-center gap-1 flex-shrink-0">
                      <AlertCircle className="w-3 h-3" /> Wajib Diisi
                    </span>
                  )}
                </div>

                <div className="space-y-5">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 flex items-center gap-2 mb-3">
                      <PhoneCall className="w-3.5 h-3.5 text-teal-600" /> Kontak Utama (Wajib)
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2 md:col-span-1">
                        <label className="text-slate-700 block mb-1 text-[11px] font-bold">Nama Lengkap Orang Tua / Wali *</label>
                        <input
                          type="text"
                          required
                          placeholder="Bpk. Bambang Winata"
                          value={profile.kontakDaruratNama || ''}
                          onChange={(e) => updateProfileField('kontakDaruratNama', e.target.value)}
                          className="w-full bg-white border border-slate-300 focus:ring-2 focus:ring-teal-500 rounded-lg px-3 py-2 text-slate-900 font-medium text-xs"
                        />
                      </div>
                      <div className="col-span-2 md:col-span-1">
                        <label className="text-slate-700 block mb-1 text-[11px] font-bold">Hubungan *</label>
                        <select
                          value={profile.kontakDaruratHubungan || ''}
                          onChange={(e) => updateProfileField('kontakDaruratHubungan', e.target.value)}
                          className="w-full bg-white border border-slate-300 focus:ring-2 focus:ring-teal-500 rounded-lg px-3 py-2 text-slate-900 font-medium text-xs"
                        >
                          <option value="">Pilih Hubungan...</option>
                          <option value="Ayah">Orang Tua (Ayah)</option>
                          <option value="Ibu">Orang Tua (Ibu)</option>
                          <option value="Wali">Wali Resmi</option>
                          <option value="Kakak/Saudara">Kakak / Saudara Kandung</option>
                        </select>
                      </div>
                      <div className="col-span-2 md:col-span-1">
                        <label className="text-slate-700 block mb-1 text-[11px] font-bold">No HP / WhatsApp Orang Tua / Wali *</label>
                        <input
                          type="tel"
                          required
                          placeholder="081299999999"
                          value={profile.kontakDaruratNoHp || ''}
                          onChange={(e) => updateProfileField('kontakDaruratNoHp', e.target.value)}
                          className="w-full bg-white border border-slate-300 focus:ring-2 focus:ring-teal-500 rounded-lg px-3 py-2 text-slate-900 font-medium text-xs"
                        />
                      </div>
                      <div className="col-span-2 md:col-span-1">
                        <label className="text-slate-700 block mb-1 text-[11px] font-bold">Alamat Ringkas Orang Tua / Wali *</label>
                        <input
                          type="text"
                          required
                          placeholder="Jl. MH Thamrin No. 45, Kota Medan"
                          value={profile.kontakDaruratAlamat || ''}
                          onChange={(e) => updateProfileField('kontakDaruratAlamat', e.target.value)}
                          className="w-full bg-white border border-slate-300 focus:ring-2 focus:ring-teal-500 rounded-lg px-3 py-2 text-slate-900 font-medium text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <h4 className="text-xs font-bold text-slate-800 flex items-center gap-2 mb-3">
                      <PhoneCall className="w-3.5 h-3.5 text-slate-400" /> Kontak Alternatif 2 (Opsional)
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2 md:col-span-1">
                        <label className="text-slate-700 block mb-1 text-[11px] font-bold">Nama Kontak 2</label>
                        <input
                          type="text"
                          placeholder="Ibu Winata"
                          value={profile.kontakDarurat2Nama || ''}
                          onChange={(e) => updateProfileField('kontakDarurat2Nama', e.target.value)}
                          className="w-full bg-white border border-slate-300 focus:ring-2 focus:ring-teal-500 rounded-lg px-3 py-2 text-slate-900 font-medium text-xs"
                        />
                      </div>
                      <div className="col-span-2 md:col-span-1">
                        <label className="text-slate-700 block mb-1 text-[11px] font-bold">Hubungan Kontak 2</label>
                        <select
                          value={profile.kontakDarurat2Hubungan || ''}
                          onChange={(e) => updateProfileField('kontakDarurat2Hubungan', e.target.value)}
                          className="w-full bg-white border border-slate-300 focus:ring-2 focus:ring-teal-500 rounded-lg px-3 py-2 text-slate-900 font-medium text-xs"
                        >
                          <option value="">Pilih Hubungan...</option>
                          <option value="Ibu">Ibu</option>
                          <option value="Ayah">Ayah</option>
                          <option value="Saudara">Saudara</option>
                          <option value="Paman/Bibi">Paman / Bibi</option>
                        </select>
                      </div>
                      <div className="col-span-2 md:col-span-1">
                        <label className="text-slate-700 block mb-1 text-[11px] font-bold">No HP / WhatsApp 2</label>
                        <input
                          type="tel"
                          placeholder="081288888888"
                          value={profile.kontakDarurat2NoHp || ''}
                          onChange={(e) => updateProfileField('kontakDarurat2NoHp', e.target.value)}
                          className="w-full bg-white border border-slate-300 focus:ring-2 focus:ring-teal-500 rounded-lg px-3 py-2 text-slate-900 font-medium text-xs"
                        />
                      </div>
                      <div className="col-span-2 md:col-span-1">
                        <label className="text-slate-700 block mb-1 text-[11px] font-bold">Alamat Ringkas 2</label>
                        <input
                          type="text"
                          placeholder="Kota Medan"
                          value={profile.kontakDarurat2Alamat || ''}
                          onChange={(e) => updateProfileField('kontakDarurat2Alamat', e.target.value)}
                          className="w-full bg-white border border-slate-300 focus:ring-2 focus:ring-teal-500 rounded-lg px-3 py-2 text-slate-900 font-medium text-xs"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* CARD 5: PREFERENSI HUNIAN */}
              <div className={`bg-white border rounded-2xl p-4 sm:p-6 shadow-sm transition-all duration-300 ${isCard5Complete ? 'border-emerald-400 ring-1 ring-emerald-400/30' : 'border-slate-200'}`}>
                <div className="mb-5 flex items-start justify-between">
                  <div>
                    <h3 className="text-xs sm:text-[15px] font-bold text-slate-900 flex items-center space-x-2">
                      {isCard5Complete ? (
                        <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] sm:text-xs font-bold flex-shrink-0"><CheckCircle2 className="w-3.5 h-3.5" /></span>
                      ) : (
                        <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-teal-700 text-white flex items-center justify-center text-[10px] sm:text-xs font-bold flex-shrink-0">5</span>
                      )}
                      <span>Preferensi Hunian & Catatan Khusus</span>
                    </h3>
                    <p className="text-[9px] sm:text-[11px] text-slate-500 mt-0.5 ml-8 leading-tight">Penentuan alokasi kamar dan catatan fasilitas kesehatan</p>
                  </div>
                  {isCard5Complete ? (
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100 flex items-center gap-1 flex-shrink-0">
                      <CheckCircle2 className="w-3 h-3" /> Tuntas
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-full border border-amber-200 flex items-center gap-1 flex-shrink-0">
                      <AlertCircle className="w-3 h-3" /> Wajib Diisi
                    </span>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 md:col-span-1">
                      <label className="text-slate-700 block mb-1 text-[11px] font-bold">Tipe Asrama / Kamar *</label>
                      <select
                        value={profile.tipeKamar || 'Asrama 54 (Kapasitas 2 Orang)'}
                        onChange={(e) => updateProfileField('tipeKamar', e.target.value)}
                        className="w-full bg-white border border-slate-300 focus:ring-2 focus:ring-teal-500 rounded-lg px-3 py-2 text-slate-900 font-medium text-xs"
                      >
                        <option value="Asrama 54 (Kapasitas 2 Orang)">Asrama 54 (Kapasitas 2 Orang - Standar)</option>
                        <option value="Asrama 54 (Kapasitas 4 Orang)">Asrama 54 (Kapasitas 4 Orang - Hemat)</option>
                      </select>
                    </div>
                    <div className="col-span-2 md:col-span-1">
                      <label className="text-slate-700 block mb-1 text-[11px] font-bold">Preferensi Lantai</label>
                      <select
                        value={profile.preferensiLantai || 'Lantai 2'}
                        onChange={(e) => updateProfileField('preferensiLantai', e.target.value)}
                        className="w-full bg-white border border-slate-300 focus:ring-2 focus:ring-teal-500 rounded-lg px-3 py-2 text-slate-900 font-medium text-xs"
                      >
                        <option value="Lantai 1">Lantai 1 (Akses Cepat & Disabilitas)</option>
                        <option value="Lantai 2">Lantai 2 (Standar Populer)</option>
                        <option value="Lantai 3">Lantai 3 (Tenang / Quiet Zone)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-700 block mb-1 text-[11px] font-bold">Kebutuhan Khusus / Aksesibilitas</label>
                    <input
                      type="text"
                      placeholder="Contoh: Tidak ada / Membutuhkan lantai dasar"
                      value={profile.kebutuhanKhusus || ''}
                      onChange={(e) => updateProfileField('kebutuhanKhusus', e.target.value)}
                      className="w-full bg-white border border-slate-300 focus:ring-2 focus:ring-teal-500 rounded-lg px-3 py-2 text-slate-900 font-medium text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-slate-700 block mb-1 text-[11px] font-bold">Catatan Kesehatan / Riwayat Alergi</label>
                    <input
                      type="text"
                      placeholder="Contoh: Alergi debu ringan / Tidak ada riwayat penyakit berat"
                      value={profile.catatanKesehatan || ''}
                      onChange={(e) => updateProfileField('catatanKesehatan', e.target.value)}
                      className="w-full bg-white border border-slate-300 focus:ring-2 focus:ring-teal-500 rounded-lg px-3 py-2 text-slate-900 font-medium text-xs"
                    />
                  </div>
                </div>
              </div>
            

          {/* CARD 6: METODE PERSETUJUAN */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="mb-4">
              <h3 className="text-xs sm:text-[15px] font-bold text-slate-900 flex items-center space-x-2">
                <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-teal-700 text-white flex items-center justify-center text-[10px] sm:text-xs font-bold">6</span>
                <span>Metode Persetujuan Orang Tua / Wali (F-20)</span>
              </h3>
              <p className="text-[9px] sm:text-[11px] text-slate-500 mt-0.5 leading-tight">Pilih salah satu metode persetujuan yang tersedia bagi Anda.</p>
            </div>
            <div className="space-y-3">
              <select
                value={profile.metodePersetujuanOrtu || 'TERTULIS_F20'}
                onChange={(e) => updateProfileField('metodePersetujuanOrtu', e.target.value)}
                className="w-full bg-white border border-slate-300 focus:ring-2 focus:ring-teal-500 rounded-lg px-3 py-2.5 text-slate-900 font-medium text-xs"
              >
                <option value="TERTULIS_F20">Dokumen Fisik F-20 (Dicetak, ditandatangani basah, dan diserahkan saat check-in)</option>
                <option value="ELEKTRONIK_OTP">Persetujuan Elektronik via Portal (Kode OTP dikirim langsung ke WhatsApp Wali)</option>
                <option value="VIDEO_CALL">Verifikasi Jarak Jauh (Video Call langsung dengan Petugas Asrama)</option>
                {profile.isKipStudent && (
                  <option value="REUSE_KIP">Penggunaan Kembali Dokumen KIP (Khusus Penerima Beasiswa KIP-Kuliah)</option>
                )}
              </select>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-600">
                {profile.metodePersetujuanOrtu === 'ELEKTRONIK_OTP' ? (
                  <p className="flex items-center gap-2 text-teal-800 font-medium">
                    <Smartphone className="w-4 h-4 text-teal-600 flex-shrink-0" />
                    <span>Pada Step 4 (Tanda Tangan Kontrak), sistem akan mengirimkan kode OTP verifikasi 6-digit ke nomor WhatsApp Orang Tua / Wali ({profile.kontakDaruratNoHp || 'Nomor Orang Tua/Wali'}) untuk penandatanganan elektronik.</span>
                  </p>
                ) : profile.metodePersetujuanOrtu === 'VIDEO_CALL' ? (
                  <p className="flex items-center gap-2 text-slate-700">
                    <UserCheck className="w-4 h-4 text-slate-500 flex-shrink-0" />
                    <span>Petugas asrama akan mengagendakan sesi video call dengan orang tua/wali untuk verifikasi izin tinggal sebelum e-Ticket diterbitkan.</span>
                  </p>
                ) : (
                  <p className="flex items-center gap-2 text-slate-700">
                    <FileText className="w-4 h-4 text-slate-500 flex-shrink-0" />
                    <span>Formulir F-20 Surat Persetujuan Orang Tua dapat diunduh pada portal dan wajib dibawa saat penyerahan kunci kamar.</span>
                  </p>
                )}
              </div>
            </div>
          </div>
          </div>

          {/* PERSETUJUAN */}
          <div className="bg-teal-50 border border-teal-200 rounded-2xl p-5 flex items-start gap-4">
            <input
              type="checkbox"
              id="cb-persetujuan-awal"
              className="mt-1 w-5 h-5 text-teal-600 rounded border-teal-300 focus:ring-teal-500 cursor-pointer"
              checked={profile.persetujuanAwal || false}
              onChange={(e) => updateProfileField('persetujuanAwal', e.target.checked)}
            />
            <label htmlFor="cb-persetujuan-awal" className="cursor-pointer">
              <h4 className="font-bold text-teal-950 text-sm mb-1">Persetujuan Pendaftaran & Pernyataan Kebenaran Data:</h4>
              <p className="text-xs text-teal-900/80 leading-relaxed">
                Saya menyatakan dengan sungguh-sungguh bahwa seluruh data identitas, kontak darurat wali, preferensi hunian, dan lampiran dokumen identitas yang saya isi di atas adalah benar dan sah. Saya bersedia mematuhi Tata Tertib Asrama Universitas Bunda Thamrin.
              </p>
            </label>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-slate-200">
            <div className="text-xs text-slate-500">
              Semua perubahan tersimpan otomatis secara lokal di perangkat Anda.
            </div>
            <button
              type="button"
              id="btn-submit-step1"
              onClick={() => {
                if (!profile.email || !profile.email.trim()) {
                  toast.error('Email aktif mahasiswa wajib diisi.');
                  return;
                }
                if (!profile.noHpWa || !profile.noHpWa.trim()) {
                  toast.error('Nomor HP/WhatsApp mahasiswa wajib diisi.');
                  return;
                }
                if (!profile.alamatKtpJalan || !profile.alamatKtpJalan.trim()) {
                  toast.error('Alamat Jalan / Dusun KTP wajib diisi.');
                  return;
                }
                if (!profile.kontakDaruratNama || !profile.kontakDaruratNama.trim() || !profile.kontakDaruratNoHp || !profile.kontakDaruratNoHp.trim()) {
                  toast.error('Kontak darurat utama (Nama & Nomor HP Orang Tua / Wali) wajib diisi.');
                  return;
                }
                if (!profile.ktpUrl) {
                  toast.error('Harap unggah atau simulasikan foto KTP terlebih dahulu.');
                  return;
                }
                if (!profile.selfieUrl) {
                  toast.error('Harap unggah atau simulasikan pasfoto Selfie KTP terlebih dahulu.');
                  return;
                }
                if (!profile.persetujuanAwal) {
                  toast.error('Harap centang kotak persetujuan pendaftaran terlebih dahulu.');
                  return;
                }

                const updated = {
                  ...profile,
                  isKycRequired: true,
                  kycSubmitted: true,
                  kycVerified: true,
                  correctionStatus: undefined,
                };
                // Clean up draft from localStorage upon successful submission
                try {
                  const draftKey = getDraftStorageKey(updated.nim, updated.noPmb);
                  localStorage.removeItem(draftKey);
                  localStorage.removeItem(`mabaProfileDraft_${updated.nim}`);
                  localStorage.removeItem(`mabaKtpNameDraft_${updated.nim}`);
                  localStorage.removeItem(`mabaSelfieNameDraft_${updated.nim}`);
                } catch (e) {}
                setProfile(updated);
                if (onUpdateProfile) onUpdateProfile(updated);
                setVerificationHistory((prev) => [
                  {
                    id: Date.now().toString(),
                    timestamp: new Date(),
                    type: 'KYC_SUBMISSION',
                    status: 'success',
                    message: 'Formulir Pendaftaran & Berkas Identitas berhasil dikirim dan diverifikasi.',
                  },
                  ...prev,
                ]);
                toast.success('Formulir pendaftaran dan validasi identitas berhasil disimpan! Melanjutkan ke Skema Pembayaran.');
                handleStepNavigation(2);
              }}
              className="w-full sm:w-auto bg-teal-700 hover:bg-teal-600 text-white px-8 py-3.5 rounded-xl font-bold transition-all shadow-md flex items-center justify-center gap-2 active:scale-95"
            >
              <span>Kirim Formulir Pendaftaran & Lanjut ke Pembayaran</span>
              <CheckCircle2 className="w-5 h-5" />
            </button>
          </div>

          {/* AUDIT LOG BOX */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden mt-8 shadow-sm">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <History className="w-4 h-4 text-teal-600" /> Riwayat Aktivitas & Validasi Identitas (Audit Log)
              </h4>
              <span className="text-[10px] font-mono text-slate-500">DFD Level 2 Compliant</span>
            </div>
            <div className="p-6">
              {verificationHistory.length > 0 ? (
                <div className="space-y-4 relative before:absolute before:left-5 before:top-4 before:bottom-4 before:w-[2px] before:bg-slate-200">
                  {verificationHistory.map((item) => (
                    <div key={item.id} className="flex items-start gap-3 relative z-10">
                      {/* Visual Status Indicator for the Timeline */}
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 border-white shadow-sm shrink-0 ${
                        item.status === 'success' ? 'bg-emerald-100 text-emerald-600' :
                        item.status === 'error' ? 'bg-rose-100 text-rose-600' :
                        'bg-amber-100 text-amber-600'
                      }`}>
                        {item.status === 'success' ? <CheckCircle2 className="w-5 h-5" /> : 
                         item.status === 'error' ? <XCircle className="w-5 h-5" /> : 
                         <Clock className="w-5 h-5" />}
                      </div>

                      <div className={`flex-1 p-3 rounded-xl border ${
                        item.status === 'success' ? 'bg-emerald-50/30 border-emerald-100' :
                        item.status === 'error' ? 'bg-rose-50/30 border-rose-100' :
                        'bg-amber-50/30 border-amber-100'
                      }`}>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1.5">
                          <div className={`text-[10px] font-bold px-2 py-0.5 rounded-md inline-block self-start ${
                            item.status === 'success' ? 'bg-emerald-100 text-emerald-800' :
                            item.status === 'error' ? 'bg-rose-100 text-rose-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {item.type}
                          </div>
                          <div className="text-[10px] font-mono text-slate-500">
                            {new Date(item.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </div>
                        </div>
                        <div className="text-xs font-semibold text-slate-800 leading-relaxed">
                          {item.message}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-xs text-slate-500">
                  <Clock className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  Belum ada aktivitas baru. Aktivitas pengunggahan KTP, ekstraksi AI, dan pengiriman form akan tercatat di sini.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {currentStep === 2 && (
        <div id="step-2-panel" className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-sm space-y-4 sm:space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <h3 className="text-xs sm:text-[15px] font-bold text-slate-900 flex items-center space-x-2">
              <Calculator className="w-5 h-5 text-teal-600" />
              <span>Step 2: Konfigurasi Skema Pembayaran</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Rincian biaya dan skema cicilan dihitung otomatis berdasarkan regulasi <strong>Konfigurasi Master Tarif & Skema Cicilan</strong> yang aktif.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-6">
            {/* Status Jalur & Pengaturan Master Tarif Aktif */}
            <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-teal-100 text-teal-800 border border-teal-200">
                      Master Tarif Terpasang
                    </span>
                    <h4 className="font-bold text-sm text-slate-800">
                      Kelompok: {studentCategory === 'KIP' ? 'Jalur KIP-Kuliah' : studentCategory === 'INTERNAL' ? 'Jalur Internal' : studentCategory === 'EXTERNAL' ? 'Jalur External' : studentCategory === 'SCHOLARSHIP' ? 'Jalur Beasiswa' : 'Jalur Reguler (Non-KIP)'}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Aturan tarif sewa, deposit jaminan dasar, dan fasilitas tenor cicilan disesuaikan dengan kelompok jalur masuk pendaftaran.
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-center">
                  <span className="text-xs font-semibold text-slate-700 hidden sm:inline">KIP-Kuliah:</span>
                  <button
                    type="button"
                    onClick={handleToggleKip}
                    disabled={invoice.status !== 'UNPAID'}
                    title="Alihkan status KIP-Kuliah untuk menguji penyesuaian Master Tarif"
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      profile.isKipStudent ? 'bg-teal-600' : 'bg-slate-300'
                    } ${invoice.status !== 'UNPAID' ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      profile.isKipStudent ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              </div>

              {/* Quick Parameter Summary from Master Tarif */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-500 text-[11px] block">Tarif Sewa Kamar:</span>
                  <span className="font-bold text-slate-900 font-mono text-xs sm:text-sm">{formatRupiah(tarifSewa)} / bln</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-500 text-[11px] block">Deposit Dasar (1x):</span>
                  <span className="font-bold text-slate-900 font-mono text-xs sm:text-sm">{formatRupiah(nominalDepositBase)}</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-500 text-[11px] block">Biaya Administrasi:</span>
                  <span className="font-bold text-slate-900 font-mono text-xs sm:text-sm">{formatRupiah(nominalPerlengkapan)}</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-500 text-[11px] block">Skema Cicilan:</span>
                  <span className="font-bold text-indigo-900 text-xs sm:text-sm">
                    {maxCicilan > 1 ? `Maks. ${maxCicilan}x (${installmentMultiplier}x)` : 'Hanya Lunas 1x'}
                  </span>
                </div>
              </div>
            </div>

            {/* Pilihan Skema Pembayaran Sewa (1, 2, 3, 6, 12 Bulan) */}
            <div className="space-y-4">
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                      <Bed className="w-4 h-4 text-teal-600" />
                      Skema Pembayaran Sewa Kamar Asrama
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Pilih jangka waktu pembayaran sewa di muka. Kontrak hunian mengikat <strong>minimal 6 bulan (1 semester)</strong> atau 12 bulan (1 tahun).
                    </p>
                  </div>
                  <span className="text-[11px] font-bold text-teal-800 bg-teal-50 border border-teal-200 px-2.5 py-1 rounded-lg self-start sm:self-auto">
                    Komitmen Kontrak: {invoice.durasiBulan || 6} Bulan
                  </span>
                </div>

                {/* Tombol Opsi Pembayaran Sewa: 1, 2, 3, 6, 12 Bulan */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-semibold text-slate-700">Pilih Opsi Bayar Sewa Awal:</span>
                    <span className="text-[11px] text-slate-500 font-mono">Tarif: {formatRupiah(tarifSewa)}/bulan</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                    {[
                      { bulan: 1, label: '1 Bulan', tag: 'Bulanan', desc: 'Bayar bln ke-1' },
                      { bulan: 2, label: '2 Bulan', tag: 'Bimestral', desc: 'Bayar 2 bln awal' },
                      { bulan: 3, label: '3 Bulan', tag: 'Triwulan', desc: 'Bayar 3 bln awal' },
                      { bulan: 6, label: '6 Bulan', tag: '1 Semester', desc: 'Lunas 1 Semester' },
                      { bulan: 12, label: '12 Bulan', tag: '1 Tahun', desc: 'Lunas 1 Thn Penuh' },
                    ].map(item => {
                      const durasiBayarSekarang = invoice.biayaSewa && tarifSewa > 0 ? Math.round(invoice.biayaSewa / tarifSewa) : 6;
                      const isSelected = durasiBayarSekarang === item.bulan;
                      return (
                        <button
                          key={item.bulan}
                          type="button"
                          onClick={() => handleConfigureBilling(item.bulan, invoice.opsiCicilan || 1, item.bulan === 12 ? 12 : 6)}
                          disabled={invoice.status !== 'UNPAID'}
                          className={`p-3 rounded-xl border text-center transition-all ${
                            isSelected
                              ? 'bg-teal-50 border-teal-600 ring-2 ring-teal-500 text-teal-950 font-bold shadow-sm'
                              : invoice.status !== 'UNPAID'
                              ? 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                              {item.tag}
                            </span>
                            {item.bulan >= 6 && (
                              <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200">
                                Lunas
                              </span>
                            )}
                          </div>
                          <div className="text-sm font-black text-slate-900 mt-1">{item.label}</div>
                          <div className="text-xs font-mono font-bold text-teal-700 mt-0.5">
                            {formatRupiah(item.bulan * tarifSewa)}
                          </div>
                          <div className="text-[10px] text-slate-500 mt-1 leading-tight">{item.desc}</div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Keterangan Status Pembayaran & Sisa Angsuran */}
                  <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="text-slate-600">
                      {(() => {
                        const durasiBayarSekarang = invoice.biayaSewa && tarifSewa > 0 ? Math.round(invoice.biayaSewa / tarifSewa) : 6;
                        const durasiKontrak = invoice.durasiBulan || 6;
                        if (durasiBayarSekarang >= durasiKontrak) {
                          return (
                            <span>
                              🟢 <strong className="text-emerald-800">Pembayaran Sewa Lunas di Muka:</strong> Anda membayar sewa {durasiBayarSekarang} bulan sekaligus. Bebas tagihan sewa berkala selama masa kontrak.
                            </span>
                          );
                        } else {
                          const sisaBulan = durasiKontrak - durasiBayarSekarang;
                          const sisaNominal = sisaBulan * tarifSewa;
                          return (
                            <span>
                              🔵 <strong className="text-blue-800">Pembayaran Sewa Bertahap:</strong> Membayar sewa {durasiBayarSekarang} bulan awal pada invoice ini. Sisa sewa kontrak sebesar <strong className="text-slate-900">{formatRupiah(sisaNominal)}</strong> ({sisaBulan} bulan) akan ditagihkan berkala pada portal mahasiswa.
                            </span>
                          );
                        }
                      })()}
                    </div>
                    <div className="text-[11px] font-medium text-slate-500 shrink-0">
                      Komitmen Legal: <strong className="text-slate-800">{invoice.durasiBulan || 6} Bulan</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Opsi Pembayaran Deposit */}
            <div>
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
                <div className="mb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <h4 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      Opsi Skema Pembayaran Deposit Jaminan
                    </h4>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                        isDepositInstallmentAllowed 
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                          : 'bg-slate-100 text-slate-700 border-slate-300'
                      }`}>
                        {isDepositInstallmentAllowed ? `CICILAN AKTIF (Tenor Maks: ${maxCicilan}x)` : 'CICILAN: NONAKTIF / OFF (LUNAS 1X)'}
                      </span>
                      {isDepositInstallmentAllowed && (
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-800 border border-indigo-200">
                          Pengali: {installmentMultiplier}x
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {isDepositInstallmentAllowed
                      ? `Administrator telah mengaktifkan opsi cicilan. Anda dapat memilih pembayaran deposit Lunas (1x) atau Cicilan hingga ${maxCicilan} termin dengan pengali ${installmentMultiplier}x.`
                      : 'Opsi cicilan deposit jaminan saat ini dinonaktifkan (OFF) oleh Administrator Asrama. Pembayaran deposit wajib diselesaikan penuh (Lunas 1x dimuka).'}
                  </p>
                </div>

                {!isDepositInstallmentAllowed && (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl mb-3 flex items-start gap-2.5 text-xs text-slate-700">
                    <div className="p-1 bg-slate-200 rounded-md text-slate-600 mt-0.5 shrink-0">
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="font-bold text-slate-800 block text-xs">Kebijakan Finansial Asrama: Cicilan Deposit Nonaktif</span>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                        Sesuai standar operasional yang berlaku, opsi cicilan deposit berstatus nonaktif (OFF). Mahasiswa baru diwajibkan melakukan pembayaran deposit Lunas 1x. Opsi cicilan dapat diaktifkan sewaktu-waktu oleh pihak pengelola melalui Menu Admin (Master Tarif & Skema Cicilan).
                      </p>
                    </div>
                  </div>
                )}
                
                <div className={`grid grid-cols-1 gap-3 ${maxCicilan >= 3 ? "md:grid-cols-3" : maxCicilan === 2 ? "md:grid-cols-2" : "md:grid-cols-1"}`}>
                  {Array.from({ length: maxCicilan }, (_, i) => i + 1).map(opsi => {
                    const isLunas = opsi === 1;
                    const multiplier = isLunas ? 1.0 : installmentMultiplier;
                    const calculatedDeposit = nominalDepositBase * multiplier;
                    const termin1 = calculatedDeposit / opsi;
                    const sisa = calculatedDeposit - termin1;

                    const durasiBayarSekarang = invoice.biayaSewa && tarifSewa > 0 ? Math.round(invoice.biayaSewa / tarifSewa) : 6;
                    return (
                      <div key={opsi} className="h-full">
                        <button
                          type="button"
                          onClick={() => handleConfigureBilling(durasiBayarSekarang, opsi, invoice.durasiBulan || 6)}
                          disabled={invoice.status !== 'UNPAID'}
                          className={`w-full h-full p-3.5 rounded-xl border text-left transition-all ${
                            invoice.opsiCicilan === opsi
                              ? (isLunas ? 'bg-emerald-50 border-emerald-600 ring-2 ring-emerald-500 text-emerald-950 shadow-sm' : 'bg-amber-50 border-amber-600 ring-2 ring-amber-500 text-amber-950 shadow-sm')
                              : invoice.status !== 'UNPAID'
                              ? 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="font-bold text-xs">{isLunas ? 'LUNAS / 1X BAYAR' : `CICILAN ${opsi}X`}</span>
                            <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold border ${isLunas ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-amber-100 text-amber-900 border-amber-300'}`}>
                              {isLunas ? '1.0x' : `${multiplier.toString().replace('.', ',')}x`} = {formatRupiah(calculatedDeposit)}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 leading-relaxed">
                            {isLunas
                              ? `Dibayar penuh ${formatRupiah(calculatedDeposit)} di awal pendaftaran (Bebas biaya pengali cicilan).`
                              : `Termin 1 (Pendaftaran): ${formatRupiah(termin1)}. Sisa ${formatRupiah(sisa)} dicicil ${opsi - 1} bulan berikutnya (@ ${formatRupiah(termin1)}/bln).`
                            }
                          </p>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Rincian Komponen Tagihan Berdasarkan Master Tarif */}
            <div className="space-y-3 text-xs bg-white p-4 rounded-xl border border-slate-200">
              <h5 className="font-bold text-slate-800 text-xs uppercase tracking-wider text-slate-600 pb-1 border-b border-slate-100">
                Rincian Komponen Tagihan (Sesuai Master Tarif & Pilihan)
              </h5>
              
              <div className="flex justify-between py-2 border-b border-slate-100">
                <div>
                  <span className="text-slate-700 font-medium">Biaya Sewa Kamar Asrama:</span>
                  <span className="text-[11px] text-slate-500 block">
                    {invoice.skemaBayarSewa === 'BULANAN' ? (
                      <>
                        <strong className="text-blue-700">Skema Bayar Bulanan:</strong> Tagihan Bulan ke-1 ({formatRupiah(tarifSewa)}). Total komitmen kontrak: {invoice.durasiBulan || 6} Bulan ({formatRupiah(invoice.biayaSewaTotalKontrak || (invoice.durasiBulan || 6) * tarifSewa)}). Sisa {formatRupiah(invoice.sisaSewaKontrak || 0)} diangsur bulanan.
                      </>
                    ) : (
                      <>
                        <strong className="text-emerald-700">Skema Lunas di Muka:</strong> {invoice.durasiBulan || 6} Bulan × {formatRupiah(tarifSewa)}/bln (Lunas Penuh).
                      </>
                    )}
                  </span>
                </div>
                <span className="font-mono text-slate-900 font-bold">{formatRupiah(invoice.biayaSewa)}</span>
              </div>

              <div className="flex justify-between py-2 border-b border-slate-100">
                <div>
                  <span className="text-slate-700 font-medium">Uang Deposit Asrama (Termin 1 Pendaftaran):</span>
                  {invoice.isCicilanDeposit ? (
                    <span className="text-[11px] text-amber-700 block font-medium">
                      *Skema Cicilan {invoice.opsiCicilan}x (Total terikat: {formatRupiah(invoice.biayaDepositTotal || 0)} dengan pengali {installmentMultiplier}x) — Sisa {formatRupiah(invoice.sisaCicilanDeposit || 0)} ditagihkan {invoice.opsiCicilan - 1} bulan berikutnya.
                    </span>
                  ) : (
                    <span className="text-[11px] text-emerald-700 block font-medium">
                      *Skema Deposit Lunas (1.0x Acuan Master: {formatRupiah(nominalDepositBase)}) — Dibayar penuh di awal.
                    </span>
                  )}
                </div>
                <span className="font-mono text-slate-900 font-bold">{formatRupiah(invoice.biayaDeposit)}</span>
              </div>

              <div className="flex justify-between py-2 border-b border-slate-100">
                <div>
                  <span className="text-slate-700 font-medium">Biaya Administrasi:</span>
                  <span className="text-[11px] text-slate-500 block">
                    {perlengkapanTariff.name || 'Biaya Administrasi'}
                  </span>
                </div>
                <span className="font-mono text-slate-900 font-bold">{formatRupiah(invoice.biayaPerlengkapanAwal || nominalPerlengkapan)}</span>
              </div>

              <div className="flex justify-between items-center py-2 bg-amber-50/70 p-3 rounded-xl text-amber-900 border border-amber-200">
                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <div>
                    <span className="font-bold text-xs block">Kode Unik Pembayaran (Wajib Ditransfer Presisi):</span>
                    <span className="text-[10px] text-amber-800">Ditambahkan ke total bayar untuk verifikasi otomatis pencocokan mutasi bank.</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-mono font-extrabold text-amber-900 text-base bg-amber-200/80 px-2.5 py-1 rounded-lg border border-amber-300">
                    +{invoice.kodeUnik}
                  </span>
                  <button
                    type="button"
                    onClick={handleRegenerateKodeUnik}
                    className="p-1.5 bg-white hover:bg-amber-100 border border-amber-300 rounded-lg text-amber-800 text-xs font-bold transition-all flex items-center gap-1 shadow-xs"
                    title="Acak Ulang Kode Unik Pembayaran"
                  >
                    <RefreshCw className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-100 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  {invoice.skemaBayarSewa === 'BULANAN' || (invoice.isCicilanDeposit && invoice.opsiCicilan > 1) 
                    ? `Total Pembayaran Awal Pendaftaran (Termin 1)` 
                    : `Total Biaya Masuk Asrama (${invoice.durasiBulan || 6} Bulan Lunas)`}
                </span>
                <span className="block text-xs text-slate-500 mt-0.5">
                  {invoice.skemaBayarSewa === 'BULANAN' 
                    ? `Termasuk Sewa Bulan ke-1 + Deposit Awal + Biaya Administrasi + Kode Unik (Kontrak Wajib ${invoice.durasiBulan || 6} Bln)`
                    : `Termasuk Sewa Penuh ${invoice.durasiBulan || 6} Bulan + Deposit Jaminan + Biaya Administrasi + Kode Unik`}
                </span>
              </div>
              <span className="text-2xl font-extrabold font-mono text-teal-800 bg-white px-4 py-1.5 rounded-xl border border-slate-200 shadow-sm self-start sm:self-auto">
                {formatRupiah(invoice.totalBayar)}
              </span>
            </div>

            <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl flex items-start gap-3 text-sm">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900 block">Aturan Pengikatan Deposit (Tahap Pendaftaran & Fase Check-out):</span>
                {invoice.isCicilanDeposit ? (
                  <span>
                    Anda memilih <strong className="text-amber-800">Skema Cicilan Deposit {invoice.opsiCicilan}x</strong>. Total deposit terikat adalah <strong>{formatRupiah(invoice.biayaDepositTotal || 0)}</strong> ({installmentMultiplier}x tarif dasar). Anda membayar <strong>{formatRupiah(invoice.biayaDeposit)}</strong> pada pendaftaran ini, dan sisanya <strong>{formatRupiah(invoice.sisaCicilanDeposit || 0)}</strong> akan dicicil pada bulan berikutnya.
                  </span>
                ) : (
                  <span>
                    Anda memilih <strong className="text-emerald-800">Skema Deposit Lunas</strong>. Uang deposit sebesar <strong>{formatRupiah(invoice.biayaDepositTotal || 0)}</strong> (1.0x tarif dasar) dibayar penuh di awal.
                  </span>
                )}
                <span className="block mt-1 text-slate-500 text-xs">
                  Deposit digunakan sebagai jaminan keutuhan fasilitas kamar dan akan di-refund utuh saat Check-out (Fase C) jika tidak ada kerusakan fasilitas/tunggakan.
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={() => handleStepNavigation(3)}
              className="bg-teal-700 hover:bg-teal-800 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-all shadow-md flex items-center space-x-2"
            >
              <span>Lanjut Pilih Metode Pembayaran (Step 3)</span>
              <CreditCard className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: OPSI PEMBAYARAN */}
      {currentStep === 3 && (
        <div id="step-3-panel" className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-sm space-y-4 sm:space-y-6">
          <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xs sm:text-[15px] font-bold text-slate-900 flex items-center space-x-2">
                <CreditCard className="w-5 h-5 text-teal-600" />
                <span>Step 3: Pilihan Metode Pembayaran</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">Pilih metode transfer bank (Virtual Account atau Manual). Batas waktu pembayaran: 24 Jam.</p>
            </div>
          </div>
          
                    <StudentInvoiceSummary invoice={invoice} currentStep={currentStep} />

          {/* SIMULASI METODE PEMBAYARAN */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-800 text-sm">Pilih Metode Pembayaran</h4>
                <p className="text-xs text-slate-500">Metode Transfer Manual BSI merupakan kanal pembayaran utama resmi yang aktif.</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* METODE UTAMA: Transfer Manual BSI */}
              <div 
                className={`border-2 rounded-2xl p-5 transition-all relative ${
                  invoice.status === 'PAID' 
                    ? 'border-emerald-500 bg-emerald-50 pointer-events-none' 
                    : invoice.status === 'PENDING_VERIFICATION'
                    ? 'border-amber-400 bg-amber-50/70'
                    : 'border-teal-600 bg-teal-50/40 shadow-sm ring-2 ring-teal-600/20'
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="inline-block text-[10px] uppercase font-extrabold px-2 py-0.5 rounded bg-teal-700 text-white mb-1.5 shadow-2xs">
                      Kanal Utama Resmi
                    </span>
                    <h5 className="font-extrabold text-slate-900 text-base">Transfer Manual (Bank BSI)</h5>
                  </div>
                  <div className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] px-2 py-0.5 rounded-full font-bold">
                    Verifikasi 1×24 Jam
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-3 mb-3 text-center">
                  <div className="text-[11px] text-slate-500 font-medium">Nomor Rekening Tujuan:</div>
                  <div className="font-mono font-bold text-base text-slate-900 tracking-wide mt-0.5">
                    7123 456 789
                  </div>
                  <div className="text-[11px] text-slate-600 font-semibold mt-0.5">a.n. Asrama Universitas Bunda Thamrin</div>
                </div>

                <div className="text-[11px] text-slate-600 space-y-1 mb-4">
                  <p>• Transfer sesuai nominal total tepat beserta <strong>Kode Unik ({invoice.kodeUnik})</strong>.</p>
                  <p>• Unggah bukti transfer struk/m-banking untuk divalidasi oleh Admin Keuangan.</p>
                </div>
                
                {invoice.status !== 'PAID' && (
                  <button 
                    onClick={() => {
                      const updated = { ...invoice, status: 'PENDING_VERIFICATION' as 'PENDING_VERIFICATION' };
                      onUpdateInvoice(updated);
                      setInvoice(updated);
                      toast.success('Simulasi Transfer Manual Terkirim. Menunggu verifikasi admin.');
                    }}
                    className="w-full bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold py-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
                  >
                    <span>Simulasikan Kirim Bukti Transfer (Utama)</span>
                  </button>
                )}
              </div>

              {/* METODE KEDUA: Virtual Account BNI (Opsional / Dalam Pengembangan) */}
              <div 
                className={`border-2 rounded-2xl p-5 transition-all relative ${
                  invoice.status === 'PAID' 
                    ? 'border-emerald-500 bg-emerald-50 opacity-50 pointer-events-none' 
                    : 'border-slate-200 bg-slate-50/80 hover:bg-slate-50'
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="inline-block text-[10px] uppercase font-extrabold px-2 py-0.5 rounded bg-slate-200 text-slate-700 border border-slate-300 mb-1.5">
                      Opsional / Integrasi Host-to-Host
                    </span>
                    <h5 className="font-bold text-slate-700 text-base">Virtual Account BNI</h5>
                  </div>
                  <div className="bg-purple-100 text-purple-800 border border-purple-200 text-[10px] px-2 py-0.5 rounded-full font-bold">
                    Dalam Pengembangan
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-3 mb-3 text-center">
                  <div className="text-[11px] text-slate-500 font-medium">Nomor VA Uji Coba:</div>
                  <div className="font-mono font-bold text-base text-slate-700 tracking-wide mt-0.5">
                    9881 2345 6789 0123
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">(Gateway Otomatis)</div>
                </div>

                <div className="text-[11px] text-slate-500 space-y-1 mb-4">
                  <p>• Fitur Virtual Account terintegrasi sedang dalam tahap pengembangan & uji konektivitas perbankan.</p>
                  <p>• Tombol simulasi berikut disediakan untuk pengujian alur otomatis.</p>
                </div>
                
                {invoice.status !== 'PAID' && (
                  <button 
                    onClick={() => {
                      const updated = { ...invoice, status: 'PAID' as 'PAID' };
                      onUpdateInvoice(updated);
                      setInvoice(updated);
                      toast.success('Simulasi Pembayaran VA Berhasil. Status menjadi PAID.');
                      setTimeout(() => handleStepNavigation(4), 1500);
                    }}
                    className="w-full bg-slate-700 hover:bg-slate-800 text-white text-xs font-bold py-2.5 rounded-xl transition-colors shadow-xs"
                  >
                    Simulasikan Bayar VA (Testing Sandbox)
                  </button>
                )}
              </div>
            </div>
            
            {invoice.status === 'PAID' && (
              <div className={`border rounded-xl p-4 flex gap-4 ${isBooking ? 'bg-amber-50 border-amber-300' : 'bg-emerald-50 border-emerald-200 animate-pulse'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${isBooking ? 'bg-amber-100' : 'bg-emerald-100'}`}>
                  {isBooking ? (
                    <BookmarkCheck className="w-5 h-5 text-amber-600" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <h4 className={`font-bold text-sm ${isBooking ? 'text-amber-900' : 'text-emerald-900'}`}>
                      {isBooking ? 'Status: BOOKING KAMAR TERVERIFIKASI' : 'Pembayaran Lunas & Terverifikasi (Master)'}
                    </h4>
                    {isBooking && (
                      <span className="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full font-extrabold border border-amber-300">
                        🟡 BOOKING
                      </span>
                    )}
                  </div>
                  <p className={`text-xs mt-1 leading-relaxed ${isBooking ? 'text-amber-800' : 'text-emerald-700'}`}>
                    {isBooking ? (
                      <>
                        Pembayaran registrasi awal Anda telah berhasil divalidasi. Kamar <strong>{room?.gedung || 'Gedung B'} - Kamar {room?.nomorKamar || '204'}</strong> telah terkunci aman dalam status <strong>BOOKING</strong>. Silakan lanjutkan ke tahap Tanda Tangan Kontrak Digital (Step 4).
                      </>
                    ) : (
                      <>
                        Terima kasih, sistem telah memvalidasi pembayaran tagihan dan data Anda telah terverifikasi penuh di master penyewa. Anda dapat melanjutkan ke tahap Tanda Tangan Kontrak.
                      </>
                    )}
                  </p>
                </div>
              </div>
            )}
            {invoice.status === 'PENDING_VERIFICATION' && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-4">
                <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h4 className="font-bold text-amber-900 text-sm">Menunggu Verifikasi Admin</h4>
                  <p className="text-xs text-amber-700 mt-1">
                    Bukti transfer manual Anda sedang diperiksa oleh Admin Keuangan. Anda juga dapat mensimulasikan verifikasi Admin melalui panel Admin.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={() => handleStepNavigation(4)}
              disabled={invoice.status === 'UNPAID'}
              className={`font-bold px-6 py-2.5 rounded-xl text-sm transition-all shadow-md flex items-center space-x-2 ${
                invoice.status === 'PAID' 
                  ? 'bg-teal-700 hover:bg-teal-800 text-white' 
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <span>Lanjut Tanda Tangan Kontrak (Step 4)</span>
              <PenTool className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: DIGITAL CONTRACT (F-19) & PAKTA INTEGRITAS (F-02) */}
      {currentStep === 4 && (
        <DigitalContractView
          profile={profile}
          room={room}
          invoice={invoice}
          contract={contract}
          onUpdateContract={(updatedContract) => {
            setContract(updatedContract);
            onUpdateContract(updatedContract);
          }}
          onAdvanceStep={() => handleStepNavigation(5)}
          onRequestProfileCorrection={(note) => {
            setCurrentStep(1);
            if (note) {
              setCorrectionNotes(note);
            }
            setCorrectionModalOpen(true);
          }}
          onOpenWaSimulator={() => setShowWaSimulator(true)}
          otpSentMessage={otpSentMessage}
          otpTimer={otpTimer}
          onSendOtp={handleSendOtp}
        />
      )}

      {/* STEP 5: E-TICKET */}
      {currentStep === 5 && (
        <div id="step-5-panel" className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
           <div className="border-b border-slate-200 pb-4">
            <h3 className="text-xs sm:text-[15px] font-bold text-slate-900 flex items-center space-x-2">
              <Ticket className="w-5 h-5 text-teal-600" />
              <span>Step 5: Penerbitan e-Ticket Check-in</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">E-Ticket ini digunakan untuk pemindaian saat Anda tiba di asrama (Check-in fisik).</p>
          </div>

          {ticket.status === 'ACTIVE' ? (
            <div className="flex flex-col md:flex-row gap-6 bg-slate-50 rounded-2xl p-6 border border-slate-200 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                 <Ticket className="w-32 h-32" />
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center min-w-[200px]">
                <QRCodeSVG value={ticket.qrCode || ticket.ticketId} size={150} />
                <span className="font-mono font-bold text-slate-800 mt-3 text-sm tracking-widest">{ticket.ticketId}</span>
              </div>
              <div className="flex-1 space-y-4 z-10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-xl font-black text-slate-900 uppercase">E-TICKET ASRAMA UBT</h4>
                    <p className="text-slate-500 text-sm font-medium">Berlaku untuk Check-in Fisik Tahun Ajaran 2026/2027</p>
                  </div>
                  <div>
                    {isBooking ? (
                      <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 border border-amber-300 font-extrabold text-[11px] px-2.5 py-1 rounded-lg">
                        <BookmarkCheck className="w-3.5 h-3.5 text-amber-600" />
                        <span>STATUS: BOOKING (MENUNGGU NIM)</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-900 border border-emerald-300 font-extrabold text-[11px] px-2.5 py-1 rounded-lg">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>STATUS: PENGHUNI AKTIF (MASTER)</span>
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                  <div>
                    <span className="block text-[10px] text-slate-500 uppercase font-bold tracking-wider">Nama Mahasiswa</span>
                    <span className="block text-sm font-bold text-slate-900">{profile.nama}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-500 uppercase font-bold tracking-wider">NIM / No. PMB</span>
                    <span className="block text-sm font-bold text-slate-900">{profile.nim !== 'Belum tersedia' ? profile.nim : profile.noPmb}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-500 uppercase font-bold tracking-wider">Gedung Asrama</span>
                    <span className="block text-sm font-bold text-teal-700">{room?.gedung}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-500 uppercase font-bold tracking-wider">Nomor Kamar</span>
                    <span className="block text-sm font-bold text-teal-700">Kamar {room?.nomorKamar}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 mt-4">
                   <button 
                     onClick={downloadTicketPdf}
                     className="bg-slate-800 hover:bg-slate-900 text-white font-bold py-2 px-4 rounded-lg text-xs transition-colors flex items-center shadow-sm"
                   >
                     <Download className="w-4 h-4 mr-2" /> Download PDF
                   </button>
                   <button 
                     onClick={() => handleStepNavigation(6)}
                     className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-lg text-xs transition-colors flex items-center shadow-sm"
                   >
                     Selesai & Lanjut (Step 6) <ArrowRight className="w-4 h-4 ml-2" />
                   </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200 border-dashed rounded-xl p-8 text-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <Ticket className="w-8 h-8 text-teal-600" />
              </div>
              <h4 className="font-bold text-slate-800 mb-2">Penerbitan E-Ticket</h4>
              <p className="text-sm text-slate-600 mb-6 max-w-md mx-auto">
                Anda telah menyelesaikan seluruh persyaratan administrasi dan pembayaran. Klik tombol di bawah untuk men-generate e-Ticket Check-in Anda.
              </p>
              <button
                onClick={handleGenerateTicket}
                className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-md inline-flex items-center space-x-2"
              >
                <QrCode className="w-5 h-5" />
                <span>Generate e-Ticket Sekarang</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* STEP 6: BASTK */}
      {currentStep === 6 && (
        <div id="step-6-panel" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
           {!showBastk ? (
             <div className="bg-teal-50 border-l-4 border-teal-600 p-6 rounded-r-xl shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
                <div>
                  <h4 className="font-bold text-teal-900 text-lg">Semua Tahapan Selesai! 🎉</h4>
                  <p className="text-teal-800 text-sm mt-1">Anda sekarang dapat mencetak form BASTK (Berita Acara Serah Terima Kamar) untuk diserahkan saat check-in fisik.</p>
                </div>
                <button
                  onClick={() => setShowBastk(true)}
                  className="bg-teal-700 hover:bg-teal-800 text-white font-bold px-6 py-2.5 rounded-xl shadow-md whitespace-nowrap transition-colors"
                >
                  Tampilkan BASTK
                </button>
             </div>
           ) : (
             <BastkStep nim={profile.nim} nama={profile.nama} kamar={room ? room.nomorKamar : ""} onComplete={() => {}} />
           )}
        </div>
      )}
      
      {/* Audit Log View untuk Transparansi */}
      <AuditLogView logs={[]} />

      {/* SOP Modal */}
      {sopModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-7 w-full max-w-xl shadow-2xl relative overflow-hidden flex flex-col max-h-[88vh] border border-slate-200">
            {/* Header Modal */}
            <div className="flex flex-col sm:flex-row justify-between items-start pb-4 sm:pb-5 border-b border-slate-100 mb-5 gap-3">
              <div className="pr-8 sm:pr-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="text-[9px] sm:text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-teal-100 text-teal-800 border border-teal-200 leading-none">
                    Panduan Pengisian
                  </span>
                  <span className="text-[10px] sm:text-xs font-mono font-bold text-slate-400 leading-none">
                    Tahap {sopPhaseId || 1} dari 4
                  </span>
                </div>
                <h3 className="text-[13px] sm:text-base md:text-xl font-black text-slate-900 flex items-start sm:items-center leading-snug">
                  <HelpCircle className="w-5 h-5 mr-2 sm:mr-2.5 text-teal-600 flex-shrink-0 mt-0.5 sm:mt-0" />
                  <span>
                    {sopPhaseId === 1 && 'Tahap 1: Pengisian Data Diri & Verifikasi Identitas (e-KYC)'}
                    {sopPhaseId === 2 && 'Tahap 2: Konfigurasi Tagihan & Pembayaran Asrama'}
                    {sopPhaseId === 3 && 'Tahap 3: Penandatanganan Kontrak Hunian'}
                    {sopPhaseId === 4 && 'Tahap 4: Penerbitan e-Ticket & Serah Terima'}
                  </span>
                </h3>
              </div>
              <button 
                onClick={() => setSopModalOpen(false)} 
                className="absolute sm:relative right-4 top-4 sm:right-auto sm:top-auto text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 p-2 rounded-full transition-colors shrink-0"
                title="Tutup panduan"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            {/* Content Modal */}
            <div className="overflow-y-auto pr-2 text-sm text-slate-700 space-y-4 flex-1">
              {sopPhaseId === 1 && (
                <div className="space-y-4">
                  <p className="text-[11px] sm:text-xs text-slate-700 leading-relaxed bg-teal-50/70 p-4 rounded-2xl border border-teal-100">
                    Pada Tahap 1, Anda diwajibkan untuk melengkapi profil penghuni, melakukan verifikasi dokumen identitas, dan mengatur informasi kontak darurat serta preferensi kamar.
                  </p>

                  <div className="space-y-3">
                    <div className="flex items-start gap-3.5 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <div className="w-6 h-6 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">1</div>
                      <div>
                        <h5 className="font-bold text-slate-900 text-xs sm:text-sm mb-1">Data Akademik & e-KYC (Identitas)</h5>
                        <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed">
                          Sistem akan memuat data PMB Anda. Langkah terpenting adalah mengunggah <strong>KTP dan Pasfoto Selfie</strong>. Sistem kami dibekali teknologi AI untuk membaca NIK pada KTP dan mencocokkan wajah Anda demi keamanan asrama.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3.5 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <div className="w-6 h-6 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">2</div>
                      <div>
                        <h5 className="font-bold text-slate-900 text-xs sm:text-sm mb-1">Alamat Pribadi & Kontak Darurat</h5>
                        <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed">
                          Cantumkan email dan WhatsApp aktif Anda. Setelah itu, lengkapi data <strong>Kontak Darurat</strong> (orang tua/wali/kerabat) yang valid dan dapat dihubungi sewaktu-waktu oleh pihak asrama.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3.5 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <div className="w-6 h-6 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">3</div>
                      <div>
                        <h5 className="font-bold text-slate-900 text-xs sm:text-sm mb-1">Preferensi Kamar & Persetujuan Wali</h5>
                        <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed">
                          Pilih kebutuhan spesifik hunian (contoh: preferensi lantai bawah karena cedera). Lalu pilih <strong>Metode Persetujuan Wali</strong> (Formulir Fisik, OTP WhatsApp, atau Video Call) yang paling memudahkan.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3.5 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <div className="w-6 h-6 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">4</div>
                      <div>
                        <h5 className="font-bold text-slate-900 text-xs sm:text-sm mb-1">Auto-Save & Koreksi Data</h5>
                        <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed">
                          Selama pengisian, data tersimpan otomatis. Apabila Anda terputus dari jaringan, Anda dapat melanjutkannya nanti. Jika telah <i>Disubmit</i> namun ada kesalahan, gunakan tombol <strong>Ajukan Koreksi Data</strong>.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {sopPhaseId === 2 && (
                <div className="space-y-4">
                  <p className="text-xs text-slate-600 leading-relaxed bg-blue-50/70 p-3.5 rounded-2xl border border-blue-100">
                    Tahap ini mencakup pemilihan durasi sewa kamar, rincian biaya deposit jaminan, perlengkapan awal, serta tata cara pelunasan tagihan.
                  </p>

                  <div className="space-y-3">
                    <div className="flex items-start gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                      <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">1</div>
                      <div>
                        <h5 className="font-bold text-slate-900 text-xs sm:text-sm">Pilihan Pembayaran Sewa (1, 2, 3, 6, 12 Bulan)</h5>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                          Anda dapat memilih jangka waktu pembayaran sewa di muka yang fleksibel: <strong>1 Bulan (Bulanan)</strong>, <strong>2 Bulan (Bimestral)</strong>, <strong>3 Bulan (Triwulan)</strong>, <strong>6 Bulan (1 Semester / Lunas)</strong>, atau <strong>12 Bulan (1 Tahun Penuh)</strong>. Kontrak hunian mengikat minimal 6 bulan.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                      <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">2</div>
                      <div>
                        <h5 className="font-bold text-slate-900 text-xs sm:text-sm">Skema Uang Deposit Jaminan & Biaya Administrasi</h5>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                          Uang deposit berfungsi sebagai jaminan pemeliharaan fasilitas kamar dan akan <strong>dikembalikan utuh 100%</strong> saat Anda selesai menginap (check-out) bila tidak ada kerusakan. Bagi penerima KIP-Kuliah/Beasiswa, tersedia kemudahan cicilan deposit hingga 3 termin.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                      <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">3</div>
                      <div>
                        <h5 className="font-bold text-slate-900 text-xs sm:text-sm">Metode Pembayaran Transfer Manual BSI (Utama)</h5>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                          Lakukan transfer ke Rekening Resmi Asrama Bank BSI (7123 456 789) sesuai nominal tepat hingga <strong>3 digit kode unik</strong>. Unggah foto struk/tangkapan layar m-banking untuk diverifikasi oleh Bagian Keuangan dalam 1×24 jam.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                      <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">4</div>
                      <div>
                        <h5 className="font-bold text-slate-900 text-xs sm:text-sm">Kanal Virtual Account BNI (Opsional Sandbox)</h5>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                          Kanal Virtual Account Host-to-Host otomatis saat ini disediakan untuk kemudahan simulasi pengujian cepat alur sistem asrama.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {sopPhaseId === 3 && (
                <div className="space-y-4">
                  <p className="text-xs text-slate-600 leading-relaxed bg-amber-50/70 p-3.5 rounded-2xl border border-amber-100">
                    Setelah pembayaran tervalidasi, Anda diwajibkan membaca naskah perjanjian hunian dan pakta integritas tata tertib sebelum membubuhkan tanda tangan elektronik.
                  </p>

                  <div className="space-y-3">
                    <div className="flex items-start gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                      <div className="w-6 h-6 rounded-full bg-amber-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">1</div>
                      <div>
                        <h5 className="font-bold text-slate-900 text-xs sm:text-sm">Pembacaan Naskah Perjanjian (F-19 & F-02)</h5>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                          Pelajari hak dan kewajiban penghuni, fasilitas kamar, jam malam asrama (pukul 22.00 WIB), serta larangan keras terhadap narkoba, minuman keras, senjata tajam, dan tindakan asusila demi kenyamanan bersama.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                      <div className="w-6 h-6 rounded-full bg-amber-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">2</div>
                      <div>
                        <h5 className="font-bold text-slate-900 text-xs sm:text-sm">Tanda Tangan Elektronik & Verifikasi OTP WhatsApp</h5>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                          Bubuhkan tanda tangan pada kanvas digital yang disediakan, lalu masukkan 6 digit kode OTP yang dikirimkan ke nomor WhatsApp Anda sebagai bukti keabsahan persetujuan kontrak secara sah dan mengikat.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                      <div className="w-6 h-6 rounded-full bg-amber-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">3</div>
                      <div>
                        <h5 className="font-bold text-slate-900 text-xs sm:text-sm">Pengesahan Dokumen Digital Sah & Mengikat</h5>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                          Seluruh proses persetujuan dan penandatanganan dilakukan secara mandiri melalui portal ini. Dokumen kontrak digital yang telah disahkan memiliki kekuatan hukum penuh dan menjadi bukti hak hunian kamar Anda.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {sopPhaseId === 4 && (
                <div className="space-y-4">
                  <p className="text-xs text-slate-600 leading-relaxed bg-emerald-50/70 p-3.5 rounded-2xl border border-emerald-100">
                    Tahap akhir ini adalah penerbitan kartu masuk digital (e-Ticket) dan panduan prosedur hari-H kedatangan untuk serah terima kunci serta kamar.
                  </p>

                  <div className="space-y-3">
                    <div className="flex items-start gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                      <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">1</div>
                      <div>
                        <h5 className="font-bold text-slate-900 text-xs sm:text-sm">Unduh & Simpan Tiket Masuk Digital (e-Ticket)</h5>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                          Tiket digital Anda memuat nomor kamar resmi, gedung, tanggal kedatangan, dan Barcode/QR Code akses gerbang. Anda dapat menyimpannya di ponsel atau mencetak dokumen PDF tiket tersebut.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                      <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">2</div>
                      <div>
                        <h5 className="font-bold text-slate-900 text-xs sm:text-sm">Prosedur Hari-H Kedatangan di Loket Asrama</h5>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                          Tunjukkan e-Ticket serta KTP asli kepada petugas loket asrama untuk pemindaian barcode, pengambilan kunci kamar fisik, dan paket perlengkapan awal (kasur pad & kit kebersihan).
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                      <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">3</div>
                      <div>
                        <h5 className="font-bold text-slate-900 text-xs sm:text-sm">Inspeksi Kamar & Tanda Tangan BASTK (F-03)</h5>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                          Bersama petugas asrama, lakukan pengecekan kelengkapan fasilitas kamar (tempat tidur, lemari, meja belajar, lampu, dan sanitasi). Tanda tangani formulir <strong>Berita Acara Serah Terima Kamar (BASTK)</strong> sebagai dasar kepemilikan hak hunian yang sah.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Modal */}
            <div className="pt-4 border-t border-slate-100 flex justify-between items-center bg-slate-50/50 -mx-6 sm:-mx-7 -mb-6 sm:-mb-7 px-6 sm:px-7 py-3 mt-4">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                <span>Butuh bantuan lebih lanjut?</span>
                <span className="text-teal-700 font-bold">Pusat Layanan Asrama UBT</span>
              </div>
              <button 
                onClick={() => setSopModalOpen(false)}
                className="bg-slate-900 hover:bg-black text-white text-xs font-bold px-5 py-2 rounded-xl transition-all shadow-xs"
              >
                Saya Mengerti
              </button>
            </div>
          </div>
        </div>
      )}

      {correctionModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-extrabold text-slate-900 flex items-center space-x-2">
                <FileEdit className="w-5 h-5 text-indigo-600" />
                <span>Pengajuan Koreksi Data</span>
              </h3>
              <button
                type="button"
                onClick={() => setCorrectionModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4 text-sm text-slate-700">
              <p>
                Silakan tuliskan dengan jelas data mana yang salah dan perlu dikoreksi. 
                Admin akan meninjau permintaan Anda dan membuka kunci form jika disetujui.
              </p>
              
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Catatan Kesalahan Data *</label>
                <textarea 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:ring-1 focus:ring-indigo-500 min-h-[120px]"
                  placeholder="Contoh: Nomor HP Wali saya salah ketik, seharusnya 0812345..."
                  value={correctionNotes}
                  onChange={(e) => setCorrectionNotes(e.target.value)}
                />
              </div>
            </div>
            
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setCorrectionModalOpen(false)}
                className="px-5 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-200 transition-colors text-xs"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onUpdateProfile) {
                    onUpdateProfile({ ...profile, correctionStatus: 'pending' });
                  }
                  setCorrectionModalOpen(false);
                  toast.success('Pengajuan koreksi berhasil dikirim ke Admin.', { icon: '📝' });
                }}
                disabled={!correctionNotes.trim()}
                className="px-5 py-2.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-colors text-xs flex items-center gap-2"
              >
                <FileEdit className="w-4 h-4" />
                <span>Kirim Pengajuan</span>
              </button>
            </div>
          </div>
        </div>
      )}

      
      {/* WA SIMULATOR MODAL */}
      {showWaSimulator && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row relative">
            <button onClick={() => setShowWaSimulator(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 z-10 bg-white/50 p-1 rounded-full backdrop-blur">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            
            {/* Left: Smartphone Simulator */}
            <div className="bg-slate-100 p-6 md:w-1/2 border-r border-slate-200 flex flex-col items-center justify-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-200 rounded-full blur-3xl opacity-50 -mr-10 -mt-10"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-200 rounded-full blur-3xl opacity-50 -ml-10 -mb-10"></div>
              
              <div className="w-[260px] h-[520px] bg-white rounded-[2.5rem] border-[10px] border-slate-800 overflow-hidden relative shadow-xl z-10 flex flex-col">
                 {/* Notch */}
                 <div className="absolute top-0 inset-x-0 h-5 bg-slate-800 rounded-b-2xl mx-16 z-20"></div>
                 {/* WA Header */}
                 <div className="bg-[#075E54] text-white p-3 pt-7 flex items-center gap-3 shadow-sm z-10">
                    <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-5 h-5 text-white"/>
                    </div>
                    <div>
                      <div className="text-sm font-bold leading-tight">Asrama UBT Official</div>
                      <div className="text-[10px] opacity-80 leading-tight">Akun Bisnis Resmi</div>
                    </div>
                 </div>
                 {/* Chat Area */}
                 <div className="bg-[#E5DDD5] flex-1 p-3 space-y-4 overflow-y-auto custom-scrollbar flex flex-col">
                    <div className="text-center my-2">
                      <span className="bg-[#D4EAF4] text-slate-600 text-[9px] px-2 py-1 rounded-md font-medium uppercase tracking-wider">Hari Ini</span>
                    </div>
                    
                    {/* Message 1: Student */}
                    <div className="bg-white p-2.5 rounded-lg rounded-tl-none text-xs text-slate-800 shadow-sm max-w-[90%] relative animate-in slide-in-from-left-2 duration-300">
                       <span className="font-bold text-[#075E54] block mb-1">Asrama UBT</span>
                       [SIMULASI WHATSAPP MAHASISWA]<br/><br/>
                       Halo <strong>{profile.nama}</strong>,<br/>
                       Kode OTP untuk pengesahan kontrak Asrama Anda (F-19 & F-02):<br/>
                       <span className="block my-2 text-center text-lg font-black tracking-widest text-slate-900 bg-slate-100 py-1 rounded border border-slate-200">123456</span>
                       Tujuan: Memastikan nomor HP/WhatsApp Anda valid. Berlaku 5 menit.
                       <span className="block text-[9px] text-right text-slate-400 mt-1">{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>

                    {/* Message 2: Parent (Only if ELEKTRONIK_OTP) */}
                    {profile.metodePersetujuanOrtu === 'ELEKTRONIK_OTP' ? (
                      <div className="bg-white p-2.5 rounded-lg rounded-tl-none text-xs text-slate-800 shadow-sm max-w-[90%] relative animate-in slide-in-from-left-2 duration-500 delay-150 fill-mode-both">
                         <span className="font-bold text-[#075E54] block mb-1">Asrama UBT</span>
                         [SIMULASI WHATSAPP WALI]<br/><br/>
                         Kode OTP Wali untuk persetujuan kontrak Asrama (F-20 & F-19) atas nama <strong>{profile.nama}</strong>:<br/>
                         <span className="block my-2 text-center text-lg font-black tracking-widest text-slate-900 bg-slate-100 py-1 rounded border border-slate-200">654321</span>
                         <span className="block text-[9px] text-right text-slate-400 mt-1">{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                    ) : (
                      <div className="bg-[#E1F5FE] p-2.5 rounded-lg text-xs text-slate-800 shadow-sm max-w-[90%] border border-[#B3E5FC]">
                        <span className="font-bold text-sky-800 block mb-1">Info Metode Persetujuan Wali</span>
                        Metode terpilih: <strong>{profile.metodePersetujuanOrtu || 'Dokumen Fisik F-20'}</strong>.<br/>
                        Persetujuan wali dilakukan terpisah (melalui formulir fisik di loket / panggilan video daring).
                      </div>
                    )}
                 </div>
              </div>
            </div>
            
            {/* Right: Input Form */}
            <div className="p-8 md:w-1/2 flex flex-col bg-white">
              <div className="flex-1">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-4">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">Verifikasi OTP WhatsApp</h3>
                <p className="text-sm text-slate-500 mb-6">
                  {profile.metodePersetujuanOrtu === 'ELEKTRONIK_OTP'
                    ? 'Masukkan 6 digit kode OTP Mahasiswa dan 6 digit kode OTP Wali yang dikirimkan.'
                    : 'Masukkan 6 digit kode OTP Mahasiswa untuk memvalidasi nomor kontak terdaftar dan mengesahkan tanda tangan elektronik.'}
                </p>
                
                <div className="space-y-5">
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="text-slate-700 text-xs font-bold uppercase tracking-wider">OTP Mahasiswa (6-Digit)</label>
                        <button 
                          type="button" 
                          onClick={() => setStudentOtp('123456')}
                          className="text-xs text-teal-700 font-bold hover:underline"
                        >
                          Isi 123456
                        </button>
                      </div>
                      <input 
                        type="text" 
                        maxLength={6}
                        placeholder="123456"
                        value={studentOtp}
                        onChange={e => setStudentOtp(e.target.value.replace(/\D/g, ''))}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3.5 text-slate-900 font-black tracking-[0.5em] text-center focus:ring-2 focus:ring-emerald-500 text-xl shadow-inner transition-shadow" 
                      />
                    </div>

                    {profile.metodePersetujuanOrtu === 'ELEKTRONIK_OTP' ? (
                      <div>
                        <div className="flex justify-between items-center mb-1.5">
                          <label className="text-slate-700 text-xs font-bold uppercase tracking-wider">OTP Wali (6-Digit)</label>
                          <button 
                            type="button" 
                            onClick={() => setParentOtp('654321')}
                            className="text-xs text-amber-800 font-bold hover:underline"
                          >
                            Isi 654321
                          </button>
                        </div>
                        <input 
                          type="text" 
                          maxLength={6}
                          placeholder="654321"
                          value={parentOtp}
                          onChange={e => setParentOtp(e.target.value.replace(/\D/g, ''))}
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3.5 text-slate-900 font-black tracking-[0.5em] text-center focus:ring-2 focus:ring-emerald-500 text-xl shadow-inner transition-shadow" 
                        />
                      </div>
                    ) : (
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-600">
                        <span className="font-bold block text-slate-800 mb-1">Status Persetujuan Wali:</span>
                        Menggunakan metode <strong>{profile.metodePersetujuanOrtu || 'Dokumen Fisik F-20'}</strong> (tidak memerlukan OTP online wali).
                      </div>
                    )}
                </div>
              </div>

              <div className="mt-8">
                <button 
                  onClick={handleVerifyOtp}
                  disabled={studentOtp.length !== 6 || (profile.metodePersetujuanOrtu === 'ELEKTRONIK_OTP' && parentOtp.length !== 6) || isVerifyingOtp}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-4 rounded-xl transition-all shadow-lg flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isVerifyingOtp ? (
                    <>Mencocokkan Hash OTP...</>
                  ) : (
                    <><ShieldCheck className="w-5 h-5" /> Sahkan Kontrak Elektronik (F-19 & F-02)</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CAMERA MODAL */}
      {cameraModalOpen && cameraTarget && (
        <CaptureComponent 
          target={cameraTarget}
          onCapture={handleCapture}
          onCancel={() => {
             setCameraModalOpen(false);
             setCameraTarget(null);
          }}
        />
      )}
    </div>
  );
};

