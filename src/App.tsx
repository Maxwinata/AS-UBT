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

export default function App() {
  const [currentRole, setCurrentRole] = useState<UserRole>('maba');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true); // Logged in by default to show working app instantly

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

  const handleTriggerSiakadSync = () => {
    setApiLinks(prev => prev.map(link => ({
      ...link,
      last_synced_at: new Date().toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'medium' }),
      total_records: link.kategori === 'kip' ? 65 : 48
    })));
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

  const handleLoginSuccess = (role: UserRole, nim: string, nama: string, notice?: string, scenario?: string) => {
    setIsLoggedIn(true);
    setCurrentRole(role);
    setCurrentScenario(scenario);
    if (notice) {
      setSsoNoticeBanner(notice);
    } else {
      setSsoNoticeBanner(null);
    }
    
    if (role === 'maba' && scenario) {
      const isSimulateNoNim = nim.startsWith('REG') || nim.startsWith('PMB');
      const finalNim = isSimulateNoNim ? '' : nim;
      
      const siakadMatch = siakadStaging.find(
        (s) => s.nomor_registrasi.toLowerCase() === nim.toLowerCase() || (s.nik && s.nik === nim)
      );
      const isKip = siakadMatch ? siakadMatch.kategori_beasiswa === 'kip' : false;
      const studentName = siakadMatch ? siakadMatch.nama_lengkap : nama;
      const studentProdi = siakadMatch ? siakadMatch.program_studi : INITIAL_MABA.prodi;
      const studentFakultas = siakadMatch ? siakadMatch.fakultas : INITIAL_MABA.fakultas;
      const studentPhone = siakadMatch ? (siakadMatch.nomor_telepon || '') : INITIAL_MABA.noHpWa;
      const studentNik = siakadMatch?.nik || INITIAL_MABA.nik;
      const studentGender = siakadMatch?.jenis_kelamin
        ? (siakadMatch.jenis_kelamin === 'P' ? 'Perempuan' : 'Laki-laki')
        : INITIAL_MABA.jenisKelamin;
      const ssoId = siakadMatch?.sso_id_from_sidara !== undefined ? String(siakadMatch.sso_id_from_sidara) : undefined;

      if (siakadMatch) {
        toast.success(`[SIAKAD CONNECTED] Data ${studentName} (${siakadMatch.nama_beasiswa}) berhasil ditarik otomatis ke formulir pendaftaran!`, { duration: 4500 });
      }
      
      if (scenario === 'NEW') {
        setMabaProfile({
          ...INITIAL_MABA,
          nim: finalNim,
          noPmb: nim,
          nama: studentName,
          prodi: studentProdi,
          fakultas: studentFakultas,
          noHpWa: studentPhone,
          nik: studentNik,
          jenisKelamin: studentGender,
          ssoIdFromSidara: ssoId,
          isKipStudent: isKip,
          kategori: isKip ? 'KIP' : 'Reguler',
          kipNumber: isKip ? nim : undefined,
          kycVerified: false,
          kycSubmitted: false,
          ktpUrl: undefined,
          selfieUrl: undefined
        });
        setInvoices([{
          ...INITIAL_INVOICE,
          nim: finalNim || nim,
          nama: studentName,
          isKip,
          status: 'UNPAID'
        }]);
        setTicket(INITIAL_TICKET);
        setContract(INITIAL_CONTRACT);
      } else if (scenario === 'INVOICE_FORMED') {
        setMabaProfile({
          ...INITIAL_MABA,
          nim: finalNim,
          noPmb: nim,
          nama: studentName,
          prodi: studentProdi,
          fakultas: studentFakultas,
          noHpWa: studentPhone,
          nik: studentNik,
          jenisKelamin: studentGender,
          ssoIdFromSidara: ssoId,
          isKipStudent: isKip,
          kategori: isKip ? 'KIP' : 'Reguler',
          kipNumber: isKip ? nim : undefined,
          kycVerified: true,
          kycSubmitted: true,
          ktpUrl: 'mock.jpg',
          selfieUrl: 'mock.jpg'
        });
        setInvoices([{
          ...INITIAL_INVOICE,
          nim: finalNim || nim,
          nama: studentName,
          isKip,
          status: 'UNPAID',
          totalBayar: isKip ? 1600000 : 3600142,
          durasiBulan: 6,
          isCicilanDeposit: false
        }]);
        setTicket(INITIAL_TICKET);
        setContract(INITIAL_CONTRACT);
      } else if (scenario === 'SMART_PREFILL' || scenario === 'FAST_TRACK') {
        // SKENARIO 2A: Mahasiswa Eksisting (Bukan Penghuni) - Smart Pre-Fill SIAKAD & SIDARA
        // Data akademik terisi otomatis, wajib melengkapi foto e-KTP, selfie, dan data orang tua di Step 1
        setMabaProfile({
          ...INITIAL_MABA,
          nim: finalNim || nim,
          noPmb: siakadMatch?.nomor_registrasi || nim,
          nama: studentName,
          prodi: studentProdi,
          fakultas: studentFakultas,
          noHpWa: studentPhone,
          nik: studentNik,
          jenisKelamin: studentGender,
          ssoIdFromSidara: ssoId,
          isKipStudent: isKip,
          kategori: isKip ? 'KIP' : 'Reguler',
          kipNumber: isKip ? nim : undefined,
          kycVerified: false, // Wajib unggah KTP fisik & selfie di Step 1
          kycSubmitted: false,
          ktpUrl: undefined,
          selfieUrl: undefined,
          isFastTrackSso: false,
          isKycRequired: true,
          ssoSource: 'SIAKAD_SIDARA',
        });
        setInvoices([{
          ...INITIAL_INVOICE,
          nim: finalNim || nim,
          nama: studentName,
          isKip,
          status: 'UNPAID',
          totalBayar: isKip ? 1600000 : 3600142,
          durasiBulan: 6,
          isCicilanDeposit: false,
        }]);
        setTicket(INITIAL_TICKET);
        setContract(INITIAL_CONTRACT);
        toast.success(`[SMART PRE-FILL SIAKAD] Data akademik mahasiswa ${studentName} terhubung. Sesuai regulasi, wajib unggah e-KTP & lengkapi data orang tua di Tahap 1 sebelum membuka Skema Pembayaran.`, { duration: 6000 });
      } else if (scenario === 'INCOMPLETE_DATA') {
        // SKENARIO 2B: Mahasiswa Eksisting (Bukan Penghuni) - Data Belum Lengkap
        setMabaProfile({
          ...INITIAL_MABA,
          nim: finalNim || nim,
          noPmb: siakadMatch?.nomor_registrasi || nim,
          nama: studentName,
          prodi: studentProdi,
          fakultas: studentFakultas,
          noHpWa: studentPhone,
          nik: studentNik,
          jenisKelamin: studentGender,
          ssoIdFromSidara: ssoId,
          isKipStudent: isKip,
          kategori: isKip ? 'KIP' : 'Reguler',
          kipNumber: isKip ? nim : undefined,
          kycVerified: false,
          kycSubmitted: false,
          isFastTrackSso: false,
          ssoSource: 'SIAKAD_SIDARA',
        });
        setInvoices([{
          ...INITIAL_INVOICE,
          nim: finalNim || nim,
          nama: studentName,
          isKip,
          status: 'UNPAID',
        }]);
        setTicket(INITIAL_TICKET);
        setContract(INITIAL_CONTRACT);
        toast.info(`[LENGKAPI BIODATA] Kredensial SSO SIDARA terhubung (${studentName}). Mohon lengkapi NIK dan kontak pada formulir Step 1.`, { duration: 5000 });
      }
    } else if (nim && nama) {
      // 1. Try to restore saved progress from localStorage (Auto-Resume)
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
      } else {
        const siakadMatch = siakadStaging.find(
          (s) => s.nomor_registrasi.toLowerCase() === nim.toLowerCase() || (s.nik && s.nik === nim)
        );
        if (siakadMatch) {
          setMabaProfile((prev) => ({
            ...prev,
            nim: nim.startsWith('PMB') ? '' : nim,
            noPmb: nim,
            nama: siakadMatch.nama_lengkap,
            prodi: siakadMatch.program_studi || prev.prodi,
            fakultas: siakadMatch.fakultas || prev.fakultas,
            noHpWa: siakadMatch.nomor_telepon || prev.noHpWa,
            nik: siakadMatch.nik || prev.nik,
            isKipStudent: siakadMatch.kategori_beasiswa === 'kip',
            kategori: siakadMatch.kategori_beasiswa === 'kip' ? 'KIP' : 'Reguler',
            kipNumber: siakadMatch.kategori_beasiswa === 'kip' ? nim : undefined,
          }));
        } else {
          setMabaProfile((prev) => ({
            ...prev,
            nim: nim,
            nama: nama,
          }));
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
      const currentInv = invoices[0];
      if (
        updatedProfile.nim &&
        !updatedProfile.nim.startsWith('REG') &&
        updatedProfile.nim !== 'Belum tersedia' &&
        currentInv &&
        updatedProfile.nim !== currentInv.nim
      ) {
        setInvoices(prev => prev.map(inv => inv.invoiceId === currentInv.invoiceId ? { ...inv, nim: updatedProfile.nim } : inv));
      }
    });
  }, [invoices]);

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

  const currentInvoice = invoices[0] || INITIAL_INVOICE;

  return (
    <NotificationProvider>
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
          <LoginDualTab onLoginSuccess={handleLoginSuccess} />
        ) : (
          <>
            {currentRole === 'maba' && (
              <MabaDashboard
                tariffs={tariffs}
                paymentSchemes={paymentSchemes}
                siakadStaging={siakadStaging}
                profile={mabaProfile}
                invoice={currentInvoice}
                room={rooms[1]} // Gedung B Kamar 204
                contract={contract}
                ticket={ticket}
                ssoNoticeBanner={ssoNoticeBanner || undefined}
                onClearSsoNotice={handleClearSsoNotice}
                onUpdateInvoice={handleUpdateInvoice}
                onUpdateContract={handleUpdateContract}
                onUpdateTicket={handleUpdateTicket}
                onUpdateProfile={handleUpdateProfile}
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
              />
            )}

            {currentRole === 'admin_asrama' && (
              <AdminAsrama rooms={rooms} modificationLogs={modificationLogs} invoices={invoices} initialTab="operasional" tariffs={tariffs} setTariffs={handleSetTariffs} paymentSchemes={paymentSchemes} setPaymentSchemes={handleSetPaymentSchemes} />
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
    </NotificationProvider>
  );
}
