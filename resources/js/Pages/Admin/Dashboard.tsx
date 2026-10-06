import React, { useState } from 'react';
import { BillingInvoice, RoomPlot, DelinquencyRecord, TariffItem, PaymentScheme, ModificationLog } from '../../../src/types/asrama';
import { INITIAL_INVOICE, INITIAL_ROOMS, initialTariffs, initialPaymentSchemes } from '../../../src/data/initialData';
import { AdminAsrama } from '../../../src/components/admin/AdminAsrama';
import { Header } from '../../../src/components/Header';
import { Head, router } from '@inertiajs/react';

interface AdminPageProps {
  invoices?: BillingInvoice[];
  rooms?: RoomPlot[];
  delinquencies?: DelinquencyRecord[];
  tariffs?: TariffItem[];
  paymentSchemes?: PaymentScheme[];
  logs?: ModificationLog[];
}

export default function Dashboard(props: AdminPageProps) {
  const [invoices, setInvoices] = useState<BillingInvoice[]>(props.invoices || [INITIAL_INVOICE]);
  const [rooms] = useState<RoomPlot[]>(props.rooms || INITIAL_ROOMS);
  const [tariffs, setTariffs] = useState<TariffItem[]>(props.tariffs || initialTariffs);
  const [paymentSchemes, setPaymentSchemes] = useState<PaymentScheme[]>(props.paymentSchemes || initialPaymentSchemes);
  const [logs, setLogs] = useState<ModificationLog[]>(props.logs || []);

  const handleVerifyInvoice = (invoiceId: string, action: 'APPROVE_AND_MIGRATE' | 'APPROVE_BOOKING' | 'REJECT' | 'MIGRATE_ONLY') => {
    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.invoiceId === invoiceId) {
          if (action === 'APPROVE_AND_MIGRATE') {
            return { ...inv, status: 'PAID', isCicilanDeposit: false, sisaCicilanDeposit: 0 };
          }
          if (action === 'APPROVE_BOOKING') {
            return { ...inv, status: 'PAID' };
          }
          if (action === 'REJECT') {
            return { ...inv, status: 'UNPAID' };
          }
        }
        return inv;
      })
    );

    // Sync ke Laravel Controller via Inertia
    if (typeof window !== 'undefined' && (window as any).route) {
      router.post(`/admin/invoice/${invoiceId}/verify`, { action }, { preserveScroll: true });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Head title="Panel Manajemen Pengelola Asrama" />
      <Header currentRole="admin" userName="Bpk. Ahmad Fauzi (Admin Asrama)" />
      <main className="flex-1 py-8 px-4 sm:px-6 max-w-7xl mx-auto w-full">
        <AdminAsrama
          invoices={invoices}
          rooms={rooms}
          tariffs={tariffs}
          paymentSchemes={paymentSchemes}
          modificationLogs={logs}
          onVerifyInvoice={handleVerifyInvoice}
          onUpdateTariffs={setTariffs}
          onUpdatePaymentSchemes={setPaymentSchemes}
          onRestoreData={() => {}}
        />
      </main>
    </div>
  );
}
