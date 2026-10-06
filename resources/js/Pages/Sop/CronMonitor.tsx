import React from 'react';
import { CronEngineMonitor } from '../../../src/components/sop/CronEngineMonitor';
import { Header } from '../../../src/components/Header';
import { Head } from '@inertiajs/react';

export default function CronMonitor() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Head title="Monitor Mesin CRON SOP Penegakan Toleransi 5+5 Hari" />
      <Header currentRole="admin" userName="Bpk. Ahmad Fauzi (Admin Asrama)" />
      <main className="flex-1 py-8 px-4 sm:px-6 max-w-7xl mx-auto w-full">
        <CronEngineMonitor />
      </main>
    </div>
  );
}
