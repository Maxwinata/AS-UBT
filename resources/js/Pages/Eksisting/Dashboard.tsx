import React from 'react';
import { EksistingDashboard } from '../../../src/components/eksisting/EksistingDashboard';
import { Header } from '../../../src/components/Header';
import { Head } from '@inertiajs/react';

interface EksistingPageProps {
  nim?: string;
  nama?: string;
  kamar?: string;
}

export default function Dashboard(props: EksistingPageProps) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Head title="Portal Mahasiswa Penghuni Asrama (Senior)" />
      <Header currentRole="eksisting" userName={props.nama || "Rizky Ramadhan"} userNim={props.nim || "2024-08102"} />
      <main className="flex-1 py-8 px-4 sm:px-6 max-w-7xl mx-auto w-full">
        <EksistingDashboard
          nim={props.nim || "2024-08102"}
          nama={props.nama || "Rizky Ramadhan"}
          kamar={props.kamar || "204 (Gedung B)"}
        />
      </main>
    </div>
  );
}
