import React, { useState } from 'react';
import { MabaProfile, BillingInvoice, RoomPlot, DigitalContract, ETicket, TariffItem, PaymentScheme } from '../../../src/types/asrama';
import { INITIAL_MABA, INITIAL_INVOICE, INITIAL_ROOMS, initialTariffs, initialPaymentSchemes } from '../../../src/data/initialData';
import { MabaDashboard } from '../../../src/components/maba/MabaDashboard';
import { Header } from '../../../src/components/Header';
import { Head, router } from '@inertiajs/react';

interface MabaPageProps {
  profile?: MabaProfile;
  invoice?: BillingInvoice;
  contract?: DigitalContract;
  ticket?: ETicket;
  tariffs?: TariffItem[];
  paymentSchemes?: PaymentScheme[];
  rooms?: RoomPlot[];
}

export default function Dashboard(props: MabaPageProps) {
  const [profile, setProfile] = useState<MabaProfile>(props.profile || INITIAL_MABA);
  const [invoice, setInvoice] = useState<BillingInvoice>(props.invoice || INITIAL_INVOICE);
  const [tariffs] = useState<TariffItem[]>(props.tariffs || initialTariffs);
  const [paymentSchemes] = useState<PaymentScheme[]>(props.paymentSchemes || initialPaymentSchemes);
  const [rooms] = useState<RoomPlot[]>(props.rooms || INITIAL_ROOMS);

  const handleUpdateProfile = (updated: MabaProfile) => {
    setProfile(updated);
    // Jika berjalan di Inertia, sync ke backend Laravel:
    if (typeof window !== 'undefined' && (window as any).route) {
      router.post('/maba/profile', updated, { preserveScroll: true });
    }
  };

  const handleUpdateInvoice = (updated: BillingInvoice) => {
    setInvoice(updated);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Head title="Portal Registrasi Mahasiswa Baru" />
      <Header currentRole="maba" userName={profile.nama} userNim={profile.nim !== 'Belum tersedia' ? profile.nim : profile.noPmb} />
      <main className="flex-1 py-8 px-4 sm:px-6 max-w-7xl mx-auto w-full">
        <MabaDashboard
          profile={profile}
          invoice={invoice}
          tariffs={tariffs}
          paymentSchemes={paymentSchemes}
          rooms={rooms}
          onUpdateProfile={handleUpdateProfile}
          onUpdateInvoice={handleUpdateInvoice}
        />
      </main>
    </div>
  );
}
