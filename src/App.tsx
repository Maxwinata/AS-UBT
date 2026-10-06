import { Toaster } from 'sonner';
import React, { useState } from 'react';
import { UserRole, MabaProfile, BillingInvoice, RoomPlot, DigitalContract, ETicket, ModificationLog, TariffItem, PaymentScheme } from './types/asrama';
import {
  INITIAL_MABA,
  INITIAL_INVOICE,
  INITIAL_ROOMS,
  INITIAL_CONTRACT,
  INITIAL_TICKET,
  initialTariffs,
  initialPaymentSchemes,
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
      
      if (scenario === 'NEW') {
        setMabaProfile({ ...INITIAL_MABA, nim: finalNim, noPmb: nim, nama, kycVerified: false, kycSubmitted: false, ktpUrl: undefined, selfieUrl: undefined });
        setInvoices([{ ...INITIAL_INVOICE, nim: finalNim || nim, nama, status: 'UNPAID' }]);
        setTicket(INITIAL_TICKET);
        setContract(INITIAL_CONTRACT);
      } else if (scenario === 'INVOICE_FORMED') {
        setMabaProfile({ ...INITIAL_MABA, nim: finalNim, noPmb: nim, nama, kycVerified: true, kycSubmitted: true, ktpUrl: 'mock.jpg', selfieUrl: 'mock.jpg' });
        setInvoices([{ ...INITIAL_INVOICE, nim: finalNim || nim, nama, status: 'UNPAID', totalBayar: 3600142, durasiBulan: 6, isCicilanDeposit: false }]);
        setTicket(INITIAL_TICKET);
        setContract(INITIAL_CONTRACT);
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
        // 2. Fallback to basic assignment if no saved progress
        setMabaProfile((prev) => ({
          ...prev,
          nim: nim,
          nama: nama,
        }));
      }
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  const handleUpdateInvoice = (updated: BillingInvoice) => {
    setInvoices((prev) => prev.map((inv) => (inv.invoiceId === updated.invoiceId ? updated : inv)));
  };

  const handleVerifyInvoiceFromAdmin = (invoiceId: string, action: 'APPROVE_AND_MIGRATE' | 'APPROVE_BOOKING' | 'REJECT' | 'MIGRATE_ONLY') => {
    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.invoiceId === invoiceId) {
          if (action === 'APPROVE_AND_MIGRATE') {
            alert(`[MIGRATION SUCCESS]\n\nData Maba dengan Invoice ${invoiceId} berhasil di-approve & dimigrasi!\n\nProses Backend:\n1. Insert to \`penyewa\`\n2. Insert to \`pembayaran\`\n3. Insert to \`users\` (SSO)`);
            return { ...inv, status: 'PAID', isMigrated: true, paidAt: new Date().toISOString() };
          } else if (action === 'APPROVE_BOOKING') {
            alert(`[BOOKING SUCCESS]\n\nPembayaran deposit untuk Invoice ${invoiceId} berhasil di-approve!\n\nStatus Maba menjadi BOOKING. Belum dimigrasi ke master karena NIM belum tersedia.`);
            return { ...inv, status: 'PAID', isMigrated: false, paidAt: new Date().toISOString() };
          } else if (action === 'MIGRATE_ONLY') {
            alert(`[MIGRATION SUCCESS]\n\nMaba dengan Invoice ${invoiceId} berhasil dimigrasi ke master (NIM telah tersedia).`);
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
    alert(`[SIDARA SYNC SUCCESS]\n\nNIM ${newNim} berhasil disinkronisasi untuk Invoice ${invoiceId}.\nStatus otomatis bermigrasi dari BOOKING menjadi PENYEWA (Master).`);
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
                profile={mabaProfile}
                invoice={currentInvoice}
                room={rooms[1]} // Gedung B Kamar 204
                contract={contract}
                ticket={ticket}
                ssoNoticeBanner={ssoNoticeBanner || undefined}
                onClearSsoNotice={() => setSsoNoticeBanner(null)}
                onUpdateInvoice={handleUpdateInvoice}
                onUpdateContract={setContract}
                onUpdateTicket={setTicket}
                onUpdateProfile={(updatedProfile) => {
                  setMabaProfile(updatedProfile);
                  if (updatedProfile.nim && updatedProfile.nim !== currentInvoice.nim) {
                    setInvoices(prev => prev.map(inv => inv.invoiceId === currentInvoice.invoiceId ? { ...inv, nim: updatedProfile.nim } : inv));
                  }
                }}
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
