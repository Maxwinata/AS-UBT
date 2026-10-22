import { Toaster, toast } from 'sonner';
import React, { useState } from 'react';
import { UserRole, MabaProfile, BillingInvoice, RoomPlot, DigitalContract, ETicket, ModificationLog, TariffItem, PaymentScheme, ApiLinkRecord, SiakadMahasiswaStgRecord } from './types/asrama';
import {
  INITIAL_MABA,
  INITIAL_INVOICE,
  INITIAL_ROOMS,
  INITIAL_CONTRACT,
  INITIAL_TICKET,
  initialTariffs,
  initialPaymentSchemes,
  INITIAL_API_LINKS,
  INITIAL_SIAKAD_STAGING,
  INITIAL_SIMABA_STUDENTS,
} from './data/initialData';
import { Header } from './components/Header';
import { SidebarGuide } from './components/SidebarGuide';
import { LoginDualTab } from './components/auth/LoginDualTab';
import { MabaDashboard } from './components/maba/MabaDashboard';
import { EksistingDashboard } from './components/eksisting/EksistingDashboard';
import { AdminKeuangan } from './components/admin/AdminKeuangan';
import { AdminAsrama } from './components/admin/AdminAsrama';
import { CronEngineMonitor } from './components/sop/CronEngineMonitor';
import { DFDViewer } from './components/architecture/DFDViewer';
import { LaravelBlueprint } from './components/architecture/LaravelBlueprint';
import { SqlImporter } from './components/architecture/SqlImporter';
import { SchemaDiagram } from './components/architecture/SchemaDiagram';
import { NotificationProvider } from './context/NotificationContext';
import { MaintenanceTicketing } from './components/maintenance/MaintenanceTicketing';
import { TestingModeProvider, useTestingMode } from './context/TestingModeContext';
import { MinimalTestingLayout } from './components/layout/MinimalTestingLayout';

function AppContent() {
  const [currentRole, setCurrentRole] = useState<UserRole>('maba');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false); // Default to false so user lands on login page first

  // Data Store
  const [mabaProfile, setMabaProfile] = useState<MabaProfile>(INITIAL_MABA);
  const [invoices, setInvoices] = useState<BillingInvoice[]>([INITIAL_INVOICE]);
  const [tariffs, setTariffs] = useState(initialTariffs);
  const [paymentSchemes, setPaymentSchemes] = useState(initialPaymentSchemes);
  const [rooms, setRooms] = useState<RoomPlot[]>(INITIAL_ROOMS);
  const [contract, setContract] = useState<DigitalContract>(INITIAL_CONTRACT);
  const [ticket, setTicket] = useState<ETicket>(INITIAL_TICKET);
  const [ssoNoticeBanner, setSsoNoticeBanner] = useState<string | null>(null);
  const [apiLinks, setApiLinks] = useState<ApiLinkRecord[]>(INITIAL_API_LINKS);
  const [siakadStaging, setSiakadStaging] = useState<SiakadMahasiswaStgRecord[]>(INITIAL_SIAKAD_STAGING);

  const handleTriggerSiakadSync = async () => {
    try {
      const response = await fetch('/api/siakad/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      });
      if (response.ok) {
        const result = await response.json();
        toast.success(result.message || 'Sinkronisasi live API SIDARA berhasil!');
      }
    } catch {
      // offline / mock fallback
    }
    setApiLinks(prev => prev.map(link => ({
      ...link,
      last_synced_at: new Date().toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'medium' }),
      total_records: link.kategori === 'kip' ? 65 : 48
    })));
  };

  const handlePromoteToMaster = async (stgId: number) => {
    const item = siakadStaging.find(s => s.id === stgId);
    if (!item) return;

    try {
      const response = await fetch(`/api/siakad/staging/${stgId}/promote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      });
      if (response.ok) {
        const resData = await response.json();
        toast.success(resData.message || `Promosi ${item.nama_lengkap} ke master berhasil!`);
      }
    } catch {
      // offline fallback
    }

    setSiakadStaging(prev => prev.map(it => it.id === stgId ? {
      ...it,
      status_klaim: 1,
      status_verifikasi_subsidi: 1,
      verified_by: 'Admin Asrama (Promoted)',
      verified_at: new Date().toISOString()
    } : it));

    setModificationLogs(prev => [...prev, {
      id: `log-promote-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: 'Admin',
      action: `Promosi Staging ke Master: Mahasiswa ${item.nomor_registrasi} (${item.nama_lengkap}) berhasil dibuatkan akun master users, maba_profiles, dan penyewa.`
    }]);

    toast.success(`Mahasiswa ${item.nama_lengkap} (${item.nomor_registrasi}) berhasil dipromosikan ke tabel master (users, maba_profiles, penyewa)!`);
  };

  const handleVerifySubsidi = (stgId: number, status: 1 | -1, notes?: string) => {
    const item = siakadStaging.find(s => s.id === stgId);
    if (item) {
      if (status === 1) {
        toast.success(`[SUBSIDI DISETUJUI] Calon mahasiswa ${item.nama_lengkap} (${item.nomor_registrasi}) resmi berhak atas subsidi tarif ${item.nama_beasiswa}!`);
      } else {
        toast.info(`[SUBSIDI DITOLAK] Calon mahasiswa ${item.nama_lengkap} ditetapkan menggunakan tarif asrama standar.`);
      }
    }
    setSiakadStaging(prev => prev.map(it => {
      if (it.id === stgId) {
        return {
          ...it,
          status_verifikasi_subsidi: status,
          verified_by: status === 1 ? 'Staf Keuangan Asrama' : undefined,
          verified_at: status === 1 ? new Date().toISOString() : undefined,
          catatan_admin: notes
        };
      }
      return it;
    }));
  };
  const [modificationLogs, setModificationLogs] = useState<ModificationLog[]>([
    {
      id: 'L1',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      actor: 'Admin',
      action: 'Tarif "Sewa Asrama Internal" diubah nominalnya menjadi Rp 300.000',
      changedFields: [{ field: 'amount', oldValue: '250000', newValue: '300000' }]
    },
    {
      id: 'L2',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      actor: 'System',
      action: 'Auto-plot Mahasiswa PMB2026-08942 ke Kamar 3A',
    }
  ]);
  const [currentScenario, setCurrentScenario] = useState<string | undefined>();

  
  const handleSetTariffs = (newTariffs: TariffItem[]) => {
    setModificationLogs(prev => [...prev, {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: 'Admin',
      action: 'Updated Tariff Master Data'
    }]);
    setTariffs(newTariffs);
  };

  const handleSetPaymentSchemes = (newSchemes: PaymentScheme[]) => {
    setModificationLogs(prev => [...prev, {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: 'Admin',
      action: 'Updated Payment Schemes Data'
    }]);
    setPaymentSchemes(newSchemes);
  };

  const handleLoginSuccess = (
    role: UserRole,
    nim: string,
    nama: string,
    notice?: string,
    scenario?: string,
    studentProfileData?: Partial<MabaProfile>
  ) => {
    setIsLoggedIn(true);
    setCurrentRole(role);
    setCurrentScenario(scenario);
    if (notice) {
      setSsoNoticeBanner(notice);
    } else {
      setSsoNoticeBanner(null);
    }
    
    if (role === 'maba') {
      const isOfficialNim = /^(22|23|24|25)\d{4,8}$/.test(nim) || Boolean(studentProfileData?.nim && /^\d{8,10}$/.test(studentProfileData.nim));
      const isRegistrationNumber = nim.startsWith('REG') || nim.startsWith('PMB') || /^26\d{7}$/.test(nim);
      const finalNim = isOfficialNim ? (studentProfileData?.nim || nim) : (isRegistrationNumber ? '' : (studentProfileData?.nim ?? ''));
      
      const simabaMatch = INITIAL_SIMABA_STUDENTS.find(
        (s) => s.nomor_pendaftaran.toLowerCase() === nim.toLowerCase() || (s.nik && s.nik === nim) || s.nama_mahasiswa.toLowerCase() === nama.toLowerCase()
      );

      const siakadMatch = siakadStaging.find(
        (s) => s.nomor_registrasi.toLowerCase() === nim.toLowerCase() || (s.nik && s.nik === nim) || (simabaMatch && s.nomor_registrasi === simabaMatch.nomor_pendaftaran)
      );

      const isKip = studentProfileData?.isKipStudent !== undefined
        ? studentProfileData.isKipStudent
        : (simabaMatch 
            ? simabaMatch.jenis_mahasiswa === 'kip' 
            : (siakadMatch ? siakadMatch.kategori_beasiswa === 'kip' : false));

      const studentName = studentProfileData?.nama || (simabaMatch ? simabaMatch.nama_mahasiswa : (siakadMatch ? siakadMatch.nama_lengkap : nama));
      const studentProdi = studentProfileData?.prodi || (simabaMatch ? simabaMatch.program_studi : (siakadMatch ? siakadMatch.program_studi : INITIAL_MABA.prodi));

      const computeFakultas = (prodi: string) => {
        if (/Gizi|Kesehatan|Keperawatan|Kebidanan|Farmasi/i.test(prodi)) return 'Fakultas Ilmu Kesehatan';
        if (/Hukum/i.test(prodi)) return 'Fakultas Hukum';
        if (/Informatika|Teknik|Komputer/i.test(prodi)) return 'Fakultas Teknik';
        if (/Manajemen|Ekonomi|Akuntansi/i.test(prodi)) return 'Fakultas Ekonomi & Bisnis';
        if (/Pendidikan|Guru|FKIP/i.test(prodi)) return 'Fakultas Keguruan & Ilmu Pendidikan';
        return 'Fakultas Terkait';
      };

      const studentFakultas = studentProfileData?.fakultas || (siakadMatch ? siakadMatch.fakultas : computeFakultas(studentProdi));
      const studentPhone = studentProfileData?.noHpWa || (simabaMatch ? (simabaMatch.no_hp || '') : (siakadMatch ? (siakadMatch.nomor_telepon || '') : INITIAL_MABA.noHpWa));
      const studentEmail = studentProfileData?.email || (simabaMatch ? (simabaMatch.email || '') : (siakadMatch ? (siakadMatch.email || '') : INITIAL_MABA.email));
      const studentNik = studentProfileData?.nik || simabaMatch?.nik || siakadMatch?.nik || INITIAL_MABA.nik;
      const studentGender = studentProfileData?.jenisKelamin || (simabaMatch 
        ? (simabaMatch.jenis_kelamin === 'P' ? 'Perempuan' : 'Laki-laki')
        : (siakadMatch?.jenis_kelamin
            ? (siakadMatch.jenis_kelamin === 'P' ? 'Perempuan' : 'Laki-laki')
            : INITIAL_MABA.jenisKelamin));
      const ssoId = studentProfileData?.ssoIdFromSidara || (siakadMatch?.sso_id_from_sidara !== undefined ? String(siakadMatch.sso_id_from_sidara) : undefined);
      const studentAlamat = studentProfileData?.alamatKtpJalan || simabaMatch?.alamat || siakadMatch?.alamat_lengkap || INITIAL_MABA.alamatKtpJalan;
      const studentNoPmb = studentProfileData?.noPmb || (simabaMatch ? simabaMatch.nomor_pendaftaran : (siakadMatch?.nomor_registrasi || nim));
      const studentKipNumber = isKip ? (studentProfileData?.kipNumber || simabaMatch?.nomorkip || siakadMatch?.nomorkip || studentNoPmb) : undefined;
      const studentTempatLahir = studentProfileData?.tempatLahir || simabaMatch?.tempat_lahir || siakadMatch?.tempat_lahir || 'TARAKAN';
      const studentTglLahir = studentProfileData?.tanggalLahirFormatted || simabaMatch?.tanggal_lahir_formatted || '';

      if (simabaMatch) {
        toast.success(`[SIMABA PMB] Data ${studentName} (${studentProdi} - ${isKip ? 'Jalur KIP' : 'Reguler'}) berhasil dimuat dari database SIMABA!`, { duration: 4500 });
      } else if (siakadMatch) {
        toast.success(`[SIAKAD CONNECTED] Data ${studentName} (${siakadMatch.nama_beasiswa || 'Akademik'}) berhasil ditarik otomatis ke formulir pendaftaran!`, { duration: 4500 });
      }

      const newMabaProfile: MabaProfile = {
        ...INITIAL_MABA,
        ...(studentProfileData || {}),
        nim: finalNim,
        noPmb: studentNoPmb,
        nama: studentName,
        prodi: studentProdi,
        fakultas: studentFakultas,
        noHpWa: studentPhone,
        email: studentEmail,
        nik: studentNik,
        jenisKelamin: studentGender,
        alamatKtpJalan: studentAlamat,
        alamatDomisiliJalan: studentAlamat,
        ssoIdFromSidara: ssoId,
        isKipStudent: isKip,
        kategori: isKip ? 'KIP-Kuliah' : 'Reguler',
        kipNumber: studentKipNumber,
        tempatLahir: studentTempatLahir,
        tanggalLahirFormatted: studentTglLahir,
        kycVerified: scenario === 'INVOICE_FORMED',
        kycSubmitted: scenario === 'INVOICE_FORMED',
        ktpUrl: scenario === 'INVOICE_FORMED' ? 'mock.jpg' : undefined,
        selfieUrl: scenario === 'INVOICE_FORMED' ? 'mock.jpg' : undefined,
        isFastTrackSso: false,
        isKycRequired: true,
        ssoSource: (scenario === 'SMART_PREFILL' || isOfficialNim) ? 'SIAKAD_SIDARA' : 'PMB',
      };

      setMabaProfile(newMabaProfile);

      setInvoices([{
        ...INITIAL_INVOICE,
        nim: finalNim || nim,
        nama: studentName,
        isKip,
        status: 'UNPAID',
        totalBayar: isKip ? 1600000 : 3600142,
        durasiBulan: 6,
        isCicilanDeposit: false,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
      }]);
      const studentRoom = studentGender === 'Perempuan' 
        ? {
            roomId: 'RM-B204',
            gedung: 'Gedung B (Roemah 54 - Putri)',
            lantai: 2,
            nomorKamar: '204',
            kapasitas: 2,
            terisi: 0,
            fasilitas: ['2 Bed Springbed', '2 Study Desk + Ergonomic Chair', 'AC 1.5PK', 'Kamar Mandi Dalam + Water Heater', 'Wi-Fi 100Mbps'],
          }
        : {
            roomId: 'RM-A101',
            gedung: 'Gedung A (Thamrin Utara - Putra)',
            lantai: 1,
            nomorKamar: '101',
            kapasitas: 2,
            terisi: 0,
            fasilitas: ['2 Kasur Busa Single', '2 Meja Belajar', 'AC 1PK', 'Kamar Mandi Dalam', 'Lemari 2 Pintu'],
          };

      const effectiveRegOrNim = finalNim || studentNoPmb || nim;

      setContract({
        ...INITIAL_CONTRACT,
        contractId: `KONTRAK-UBT-${effectiveRegOrNim.slice(-4)}-${Math.floor(100 + Math.random() * 900)}`,
        nim: effectiveRegOrNim,
        nama: studentName,
        nomorKamar: studentRoom.nomorKamar,
        gedung: studentRoom.gedung,
        waNumber: studentPhone || '081234567890',
        parentWaNumber: studentProfileData?.kontakDaruratNoHp || INITIAL_MABA.kontakDaruratNoHp,
        status: 'DRAFT',
        bastkSigned: false,
      });

      setTicket({
        ...INITIAL_TICKET,
        ticketId: `TCK-UBT-2026-${effectiveRegOrNim.slice(-4)}`,
        nim: effectiveRegOrNim,
        nama: studentName,
        gedung: studentRoom.gedung,
        kamar: `Kamar ${studentRoom.nomorKamar}`,
        status: 'PENDING',
        qrData: `UBT-CHECKIN|${effectiveRegOrNim}|${studentRoom.nomorKamar}|2026-08-15`,
        barcode: effectiveRegOrNim,
        isBastkVerified: false,
      });

      if (scenario === 'SMART_PREFILL' || scenario === 'FAST_TRACK') {
        toast.success(`[SMART PRE-FILL SIAKAD] Data akademik mahasiswa ${studentName} terhubung. Sesuai regulasi, wajib unggah e-KTP & lengkapi data orang tua di Tahap 1 sebelum membuka Skema Pembayaran.`, { duration: 6000 });
      } else if (scenario === 'INCOMPLETE_DATA') {
        toast.info(`[LENGKAPI BIODATA] Kredensial SSO SIDARA terhubung (${studentName}). Mohon lengkapi NIK dan kontak pada formulir Step 1.`, { duration: 5000 });
      }
    } else if (nim && nama) {
      // Role eksisting or other
      const savedProgress = localStorage.getItem(`maba_progress_${nim}`);
      if (savedProgress) {
        try {
          const parsed = JSON.parse(savedProgress);
          if (parsed.profile) setMabaProfile(parsed.profile);
          if (parsed.invoice) setInvoices([parsed.invoice]);
          if (parsed.contract) setContract(parsed.contract);
          if (parsed.ticket) setTicket(parsed.ticket);
        } catch (error) {
          console.error("Failed to parse saved progress", error);
        }
      }
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  const handleUpdateInvoice = React.useCallback((updated: BillingInvoice) => {
    queueMicrotask(() => {
      setInvoices((prev) => prev.map((inv) => (inv.invoiceId === updated.invoiceId ? updated : inv)));
    });
  }, []);

  const handleUpdateProfile = React.useCallback((updatedProfile: MabaProfile) => {
    queueMicrotask(() => {
      setMabaProfile(updatedProfile);
      const effectiveId = (updatedProfile.nim && !updatedProfile.nim.startsWith('REG') && updatedProfile.nim !== 'Belum tersedia' ? updatedProfile.nim : updatedProfile.noPmb) || '';
      
      setInvoices(prev => prev.map(inv => ({
        ...inv,
        nim: effectiveId || inv.nim,
        nama: updatedProfile.nama || inv.nama,
        isKip: updatedProfile.isKipStudent !== undefined ? updatedProfile.isKipStudent : inv.isKip,
      })));

      setContract(prev => ({
        ...prev,
        nim: effectiveId || prev.nim,
        nama: updatedProfile.nama || prev.nama,
        waNumber: updatedProfile.noHpWa || prev.waNumber,
        parentWaNumber: updatedProfile.kontakDaruratNoHp || prev.parentWaNumber,
      }));

      setTicket(prev => ({
        ...prev,
        nim: effectiveId || prev.nim,
        nama: updatedProfile.nama || prev.nama,
      }));
    });
  }, []);

  const handleUpdateContract = React.useCallback((updated: DigitalContract) => {
    queueMicrotask(() => {
      setContract(updated);
    });
  }, []);

  const handleUpdateTicket = React.useCallback((updated: ETicket) => {
    queueMicrotask(() => {
      setTicket(updated);
    });
  }, []);

  const handleClearSsoNotice = React.useCallback(() => {
    queueMicrotask(() => {
      setSsoNoticeBanner(null);
    });
  }, []);

  const handleAutoReleaseRoom = React.useCallback((invoiceId: string) => {
    setInvoices(prev => prev.map(inv => inv.invoiceId === invoiceId ? { ...inv, status: 'EXPIRED' } : inv));
    // Release occupant in room
    setRooms(prev => prev.map(r => r.terisi > 0 ? { ...r, terisi: r.terisi - 1 } : r));
    setModificationLogs(prev => [
      {
        id: `log-release-${Date.now()}`,
        timestamp: new Date().toISOString(),
        actor: 'System',
        action: `Auto-Release 48 Jam: Reservasi kamar untuk Invoice ${invoiceId} telah kedaluwarsa. Kamar dikembalikan ke pool ketersediaan umum.`,
      },
      ...prev,
    ]);
    toast.error('Batas waktu reservasi 48 jam telah berakhir. Kamar telah dilepas kembali ke pool umum.');
  }, []);

  const handleRebookRoom = React.useCallback(() => {
    const freshExpiresAt = new Date(Date.now() + 48 * 3600 * 1000).toISOString();
    const freshInvoiceId = 'INV-UBT-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);
    const freshNoReq = 'REQ-' + new Date().getFullYear() + '10-' + Math.floor(100 + Math.random() * 900);
    
    setInvoices(prev => [{
      ...prev[0],
      invoiceId: freshInvoiceId,
      noRequest: freshNoReq,
      status: 'UNPAID',
      createdAt: new Date().toISOString(),
      expiresAt: freshExpiresAt,
      paidAt: undefined,
      isMigrated: false
    }]);

    setRooms(prev => prev.map((r, idx) => idx === 1 ? { ...r, terisi: Math.min(r.kapasitas, r.terisi + 1) } : r));

    setModificationLogs(prev => [
      {
        id: `log-rebook-${Date.now()}`,
        timestamp: new Date().toISOString(),
        actor: 'User',
        action: `Pemesanan Ulang (Re-booking): Mahasiswa ${mabaProfile.nama} memperbarui reservasi kamar dengan tenggat baru 48 jam (${freshNoReq}).`,
      },
      ...prev,
    ]);
    toast.success('Reservasi diperbarui! Anda memiliki waktu 48 jam baru untuk menyelesaikan pembayaran.');
  }, [mabaProfile.nama]);

  const handleVerifyInvoiceFromAdmin = (invoiceId: string, action: 'APPROVE_AND_MIGRATE' | 'APPROVE_BOOKING' | 'REJECT' | 'MIGRATE_ONLY') => {
    const target = invoices.find(inv => inv.invoiceId === invoiceId);
    const reqNo = target?.noRequest || invoiceId;
    if (action === 'APPROVE_AND_MIGRATE') {
      toast.success(`[BRIDGING PROMOTION BERHASIL]\nPermintaan ${reqNo} disahkan ke Master Pembayaran!\n\n1. request_pembayaran ➔ pembayaran (${invoiceId})\n2. request_pembayaran_detail ➔ pembayaran_detail\n3. request_transaksi ➔ transaksi (Kas Asrama)\n4. Master penyewa aktif (operator_id = Admin Keuangan)`);
    } else if (action === 'APPROVE_BOOKING') {
      toast.info(`[BOOKING BERHASIL]\nPembayaran tagihan ${reqNo} disetujui sebagai BOOKING sementara.\nMenunggu sinkronisasi NIM resmi untuk aktivasi master penyewa.`);
    } else if (action === 'MIGRATE_ONLY') {
      toast.success(`[PROMOSI MASTER BERHASIL]\nMaba dengan Invoice ${invoiceId} berhasil dipromosikan ke master penyewa aktif.`);
    } else {
      toast.error(`[PERMINTAAN DITOLAK]\nPermintaan ${reqNo} ditolak. Status dikembalikan ke UNPAID.`);
    }

    if (action === 'APPROVE_AND_MIGRATE' || action === 'APPROVE_BOOKING') {
      const studentNim = target?.nim || mabaProfile.nim || 'PMB2026';
      const studentName = target?.nama || mabaProfile.nama;
      const newTicketId = 'TIX-UBT-' + Math.random().toString(36).substring(2, 8).toUpperCase();
      
      const studentKamar = contract.nomorKamar ? `${contract.gedung || 'Gedung B'} — Kamar ${contract.nomorKamar}` : 'Gedung B — Kamar 204';
      const studentGedung = contract.gedung || 'Gedung B';
      const studentRoomNo = contract.nomorKamar || '204';

      setTicket({
        ticketId: newTicketId,
        nim: studentNim,
        nama: studentName,
        kamar: studentKamar,
        gedung: studentGedung,
        validUntil: '2026-08-25',
        status: 'ACTIVE',
        qrCode: `UBT-TKT-${studentNim}-${newTicketId}`,
        qrData: `UBT-TKT-${studentNim}-${newTicketId}`,
        barcode: newTicketId,
        isBastkVerified: false,
      });

      setContract((prev) => ({
        ...prev,
        status: 'SIGNED',
        signedAt: prev.signedAt || new Date().toISOString(),
      }));

      setMabaProfile((prev) => ({
        ...prev,
        kycVerified: true,
      }));

      setRooms((prev) =>
        prev.map((r) =>
          r.nomorKamar === studentRoomNo
            ? { ...r, terisi: Math.min(r.kapasitas, r.terisi + 1) }
            : r
        )
      );

      setModificationLogs((prev) => [
        ...prev,
        {
          id: `log-approval-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actor: 'Admin',
          action: `Persetujuan Admin: Invoice ${invoiceId} disahkan (${action}). Kamar Gedung B 204 resmi dihuni dan e-Ticket ${newTicketId} aktif.`,
        },
      ]);
    }

    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.invoiceId === invoiceId) {
          if (action === 'APPROVE_AND_MIGRATE') {
            return { ...inv, status: 'PAID', isMigrated: true, paidAt: new Date().toISOString() };
          } else if (action === 'APPROVE_BOOKING') {
            return { ...inv, status: 'PAID', isMigrated: false, paidAt: new Date().toISOString() };
          } else if (action === 'MIGRATE_ONLY') {
            return { ...inv, isMigrated: true };
          } else {
            return { ...inv, status: 'UNPAID', paidAt: undefined, isMigrated: false };
          }
        }
        return inv;
      })
    );
  };

  const handleSyncNim = (invoiceId: string, newNim: string) => {
    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.invoiceId === invoiceId) {
          return { ...inv, nim: newNim, isMigrated: true };
        }
        return inv;
      })
    );
    // Sync the global mabaProfile mock for demo purposes
    setMabaProfile((prev) => ({ ...prev, nim: newNim }));
    toast.success(`[SIDARA SYNC SUCCESS] NIM ${newNim} berhasil disinkronisasi untuk Invoice ${invoiceId}. Status otomatis bermigrasi dari BOOKING menjadi PENYEWA (Master).`);
  };

  const { isCleanTesting } = useTestingMode();
  const currentInvoice = invoices[0] || INITIAL_INVOICE;

  const activeStudentRoom = React.useMemo(() => {
    const isFemale = mabaProfile.jenisKelamin === 'Perempuan' || mabaProfile.jenisKelamin === 'P';
    if (isFemale) {
      return rooms.find(r => r.gedung.includes('Putri')) || rooms[32] || rooms[0];
    } else {
      return rooms.find(r => r.gedung.includes('Putra')) || rooms[0];
    }
  }, [rooms, mabaProfile.jenisKelamin]);

  if (isCleanTesting) {
    return (
      <MinimalTestingLayout
        currentRole={currentRole}
        isLoggedIn={isLoggedIn}
        userName={mabaProfile.nama}
        onLogout={handleLogout}
        onSwitchRole={(role) => {
          setCurrentRole(role);
          if (!isLoggedIn) setIsLoggedIn(true);
        }}
      >
        <Toaster position="top-right" richColors />
        {!isLoggedIn ? (
          <LoginDualTab onLoginSuccess={handleLoginSuccess} siakadStaging={siakadStaging} />
        ) : (
          <>
            {currentRole === 'maba' && (
              <MabaDashboard
                tariffs={tariffs}
                paymentSchemes={paymentSchemes}
                siakadStaging={siakadStaging}
                profile={mabaProfile}
                invoice={currentInvoice}
                room={activeStudentRoom}
                contract={contract}
                ticket={ticket}
                ssoNoticeBanner={ssoNoticeBanner || undefined}
                onClearSsoNotice={handleClearSsoNotice}
                onUpdateInvoice={handleUpdateInvoice}
                onUpdateContract={handleUpdateContract}
                onUpdateTicket={handleUpdateTicket}
                onUpdateProfile={handleUpdateProfile}
                onAutoReleaseRoom={handleAutoReleaseRoom}
                onRebookRoom={handleRebookRoom}
              />
            )}

            {currentRole === 'admin_keuangan' && (
              <AdminKeuangan
                invoices={invoices}
                onVerifyInvoice={handleVerifyInvoiceFromAdmin}
                onSyncNim={handleSyncNim}
                tariffs={tariffs}
                setTariffs={handleSetTariffs}
                paymentSchemes={paymentSchemes}
                setPaymentSchemes={handleSetPaymentSchemes}
                apiLinks={apiLinks}
                siakadStaging={siakadStaging}
                onTriggerSiakadSync={handleTriggerSiakadSync}
                onVerifySubsidi={handleVerifySubsidi}
                onPromoteToMaster={handlePromoteToMaster}
              />
            )}

            {currentRole === 'admin_asrama' && (
              <AdminAsrama 
                rooms={rooms} 
                modificationLogs={modificationLogs} 
                invoices={invoices} 
                initialTab="operasional" 
                tariffs={tariffs} 
                setTariffs={handleSetTariffs} 
                paymentSchemes={paymentSchemes} 
                setPaymentSchemes={handleSetPaymentSchemes}
                apiLinks={apiLinks}
                siakadStaging={siakadStaging}
                onTriggerSiakadSync={handleTriggerSiakadSync}
                onVerifySubsidi={handleVerifySubsidi}
                onPromoteToMaster={handlePromoteToMaster}
              />
            )}

            {currentRole === 'eksisting' && (
              <EksistingDashboard
                nim="2240101004"
                nama="Ahmad Raihan"
                kamar="Gedung A (Enggang Utara) — Kamar 101"
                scenario={currentScenario}
                onOpenMaintenance={() => setCurrentRole('maintenance_ticketing')}
              />
            )}

            {currentRole === 'maintenance_ticketing' && (
              <MaintenanceTicketing
                userNim="2240101004"
                userName="Ahmad Raihan"
                userPhone="081254332190"
                userRoom="Gedung A (Enggang Utara) — Kamar 101"
                onNavigateHome={() => setCurrentRole('eksisting')}
              />
            )}
          </>
        )}
      </MinimalTestingLayout>
    );
  }

  return (
    <div id="app-root" className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans selection:bg-teal-600 selection:text-white">
      {/* Dev Tools & Persona Switcher */}
      <SidebarGuide 
        currentRole={currentRole} 
        onSelectRole={(role) => {
          setCurrentRole(role);
          if (!isLoggedIn) setIsLoggedIn(true);
        }} 
      />

      <Header
        currentRole={currentRole}
        isLoggedIn={isLoggedIn}
        onLogout={handleLogout}
        userName={mabaProfile.nama}
        mabaProfile={mabaProfile}
        isBooking={currentInvoice?.status === 'PAID' && !currentInvoice?.isMigrated}
        isMasterMigrated={currentInvoice?.isMigrated}
        invoiceStatus={currentInvoice?.status}
      />

      {/* Main View Area */}
      <main id="main-content" className="flex-1">
        {!isLoggedIn ? (
          <LoginDualTab onLoginSuccess={handleLoginSuccess} siakadStaging={siakadStaging} />
        ) : (
          <>
            {currentRole === 'maba' && (
              <MabaDashboard
                tariffs={tariffs}
                paymentSchemes={paymentSchemes}
                siakadStaging={siakadStaging}
                profile={mabaProfile}
                invoice={currentInvoice}
                room={activeStudentRoom}
                contract={contract}
                ticket={ticket}
                ssoNoticeBanner={ssoNoticeBanner || undefined}
                onClearSsoNotice={handleClearSsoNotice}
                onUpdateInvoice={handleUpdateInvoice}
                onUpdateContract={handleUpdateContract}
                onUpdateTicket={handleUpdateTicket}
                onUpdateProfile={handleUpdateProfile}
                onAutoReleaseRoom={handleAutoReleaseRoom}
                onRebookRoom={handleRebookRoom}
              />
            )}

            {currentRole === 'eksisting' && (
              <EksistingDashboard
                nim="2240101004"
                nama="Ahmad Raihan"
                kamar="Gedung A (Enggang Utara) — Kamar 101"
                scenario={currentScenario}
                onOpenMaintenance={() => setCurrentRole('maintenance_ticketing')}
              />
            )}

            {currentRole === 'maintenance_ticketing' && (
              <MaintenanceTicketing
                userNim="2240101004"
                userName="Ahmad Raihan"
                userPhone="081254332190"
                userRoom="Gedung A (Enggang Utara) — Kamar 101"
                onNavigateHome={() => setCurrentRole('eksisting')}
              />
            )}

            {currentRole === 'admin_keuangan' && (
              <AdminKeuangan
                invoices={invoices}
                onVerifyInvoice={handleVerifyInvoiceFromAdmin}
                onSyncNim={handleSyncNim}
                tariffs={tariffs}
                setTariffs={handleSetTariffs}
                paymentSchemes={paymentSchemes}
                setPaymentSchemes={handleSetPaymentSchemes}
                apiLinks={apiLinks}
                siakadStaging={siakadStaging}
                onTriggerSiakadSync={handleTriggerSiakadSync}
                onVerifySubsidi={handleVerifySubsidi}
                onPromoteToMaster={handlePromoteToMaster}
              />
            )}

            {currentRole === 'admin_asrama' && (
              <AdminAsrama 
                rooms={rooms} 
                modificationLogs={modificationLogs} 
                invoices={invoices} 
                initialTab="operasional" 
                tariffs={tariffs} 
                setTariffs={handleSetTariffs} 
                paymentSchemes={paymentSchemes} 
                setPaymentSchemes={handleSetPaymentSchemes}
                apiLinks={apiLinks}
                siakadStaging={siakadStaging}
                onTriggerSiakadSync={handleTriggerSiakadSync}
                onVerifySubsidi={handleVerifySubsidi}
                onPromoteToMaster={handlePromoteToMaster}
              />
            )}

            {currentRole === 'cron_monitor' && (
              <CronEngineMonitor />
            )}

            {currentRole === 'dfd_architecture' && (
              <DFDViewer />
            )}

            {currentRole === 'laravel_blueprint' && (
              <AdminAsrama rooms={rooms} modificationLogs={modificationLogs} invoices={invoices} initialTab="laravel" tariffs={tariffs} setTariffs={handleSetTariffs} paymentSchemes={paymentSchemes} setPaymentSchemes={handleSetPaymentSchemes} />
            )}

            {currentRole === 'sql_importer' && (
              <AdminAsrama rooms={rooms} modificationLogs={modificationLogs} invoices={invoices} initialTab="sql_importer" />
            )}
            
            {currentRole === 'schema_diagram' && (
              <SchemaDiagram />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer id="footer-root" className="bg-white border-t border-slate-200 py-6 text-xs text-slate-600 shadow-sm">
        <Toaster position="top-right" richColors />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-col space-y-1">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-teal-700 text-white rounded font-bold flex items-center justify-center text-[10px]">
                54
              </div>
              <span className="font-medium text-slate-800">© 2026 UBT — Portal SI-GABUNG (Kalibrasi v14)</span>
            </div>
            <span className="text-[10px] text-slate-500 mt-1">
              PORTAL SI-GABUNG (Sistem Informasi Gerbang Administrasi Baru dan Unit Naungan Gleni)
            </span>
          </div>
          <div className="flex items-center space-x-4 font-mono text-[11px] text-slate-500 mt-4 md:mt-0">
            <span>DFD Level 0 & 1 Compliant</span>
            <span>•</span>
            <span>Private e-KYC Storage</span>
            <span>•</span>
            <span>CRON SOP Engine</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <TestingModeProvider>
      <NotificationProvider>
        <AppContent />
      </NotificationProvider>
    </TestingModeProvider>
  );
}
