import React from 'react';
import { SsoLogin } from '../../../src/components/SsoLogin';
import { Head, router } from '@inertiajs/react';

export default function Login() {
  const handleLoginSuccess = (role: string, nim: string, nama: string) => {
    if (role === 'maba') {
      router.visit('/maba/dashboard');
    } else if (role === 'admin' || role === 'keuangan') {
      router.visit('/admin/dashboard');
    } else if (role === 'eksisting') {
      router.visit('/eksisting/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <Head title="Gerbang SSO Masuk SI-GABUNG 54" />
      <div className="w-full max-w-4xl">
        <SsoLogin onLoginSuccess={handleLoginSuccess} />
      </div>
    </div>
  );
}
