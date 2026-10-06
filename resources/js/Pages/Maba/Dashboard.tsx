import React, { useState, useEffect } from 'react';
import { MabaProfile, BillingInvoice, RoomPlot, DigitalContract, ETicket, TariffItem, PaymentScheme } from '../../../src/types/asrama';
import { INITIAL_MABA, INITIAL_INVOICE, INITIAL_ROOMS, initialTariffs, initialPaymentSchemes } from '../../../src/data/initialData';
import { MabaDashboard } from '../../../src/components/maba/MabaDashboard';
import { Header } from '../../../src/components/Header';
import { Head, router, usePage } from '@inertiajs/react';
import { toast } from 'sonner';

interface MabaPageProps {
  profile?: MabaProfile;
  invoice?: BillingInvoice;
  contract?: DigitalContract;
  ticket?: ETicket;
  tariffs?: TariffItem[];
  paymentSchemes?: PaymentScheme[];
  rooms?: RoomPlot[];
  flash?: {
    success?: string;
    error?: string;
    warning?: string;
  };
}

export default function Dashboard(props: MabaPageProps) {
  const { flash } = usePage<{ flash?: { success?: string; error?: string } }>().props;
  const [profile, setProfile] = useState<MabaProfile>(props.profile || INITIAL_MABA);
  const [invoice, setInvoice] = useState<BillingInvoice>(props.invoice || INITIAL_INVOICE);
  const [tariffs] = useState<TariffItem[]>(props.tariffs || initialTariffs);
  const [paymentSchemes] = useState<PaymentScheme[]>(props.paymentSchemes || initialPaymentSchemes);
  const [rooms] = useState<RoomPlot[]>(props.rooms || INITIAL_ROOMS);

  // Tangkap Flash Message dari Laravel Session
  useEffect(() => {
    if (flash?.success) {
      toast.success(flash.success);
    }
    if (flash?.error) {
      toast.error(flash.error);
    }
  }, [flash]);

  const handleUpdateProfile = (updated: MabaProfile) => {
    setProfile(updated);
    // Jika berjalan di lingkungan Laravel Inertia, sinkronisasi ke backend
    if (typeof window !== 'undefined' && (window as any).route) {
      router.post('/maba/profile', {
        nama: updated.nama,
        no_hp_wa: updated.noHpWa,
        is_kip_student: updated.isKipStudent,
        tipe_kamar: updated.tipeKamar,
        preferensi_lantai: updated.preferensiLantai,
        alamat_ktp_jalan: updated.alamatKtpJalan,
        alamat_ktp_kabupaten_kota: updated.alamatKtpKabupatenKota,
        kontak_darurat_nama: updated.kontakDaruratNama,
        kontak_darurat_no_hp: updated.kontakDaruratNoHp,
      }, { preserveScroll: true });
    }
  };

  const handleUpdateInvoice = (updated: BillingInvoice) => {
    setInvoice(updated);
    if (typeof window !== 'undefined' && (window as any).route) {
      router.post('/maba/invoice/configure', {
        durasi_bayar: updated.durasiBulan >= 6 ? 6 : 1,
        opsi_deposit: updated.opsiCicilan || 1,
        durasi_kontrak_total: updated.durasiBulan || 6,
      }, { preserveScroll: true });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Head title="Portal Registrasi Mahasiswa Baru - SI-GABUNG 54" />
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
