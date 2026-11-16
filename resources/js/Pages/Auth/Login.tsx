import React, { useEffect } from 'react';
import { LoginDualTab } from '@/src/components/auth/LoginDualTab';
import { Head, router } from '@inertiajs/react';
import { ErrorBoundary } from '@/resources/js/Components/ErrorBoundary';
import { TestingModeProvider } from '@/src/context/TestingModeContext';
import { Toaster } from 'sonner';

export default function Login() {
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.title = 'Gerbang SSO Masuk SI-GABUNG 54';
    }
  }, []);

  const handleLoginSuccess = (role: string, nim: string, nama: string) => {
    try {
      if (role === 'maba') {
        router.visit('/maba/dashboard');
      } else if (role === 'admin' || role === 'keuangan') {
        router.visit('/admin/dashboard');
      } else if (role === 'eksisting') {
        router.visit('/eksisting/dashboard');
      } else {
        router.visit('/login');
      }
    } catch {
      // Fallback navigasi peramban standar jika Inertia Router mengalami interupsi
      if (role === 'maba') {
        window.location.href = '/maba/dashboard';
      } else if (role === 'admin' || role === 'keuangan') {
        window.location.href = '/admin/dashboard';
      } else if (role === 'eksisting') {
        window.location.href = '/eksisting/dashboard';
      } else {
        window.location.href = '/login';
      }
    }
  };

  return (
    <ErrorBoundary
      fallbackTitle="Kendala Memuat Gerbang Login"
      fallbackMessage="Gagal merender formulir autentikasi PMB/SSO. Silakan muat ulang halaman atau periksa koneksi backend Laragon."
    >
      <TestingModeProvider>
        <div className="min-h-screen bg-slate-100 font-sans">
          <Head title="Gerbang Masuk SI-GABUNG 54 · Universitas Bunda Thamrin" />
          <LoginDualTab onLoginSuccess={handleLoginSuccess} />
          <Toaster richColors position="top-right" />
        </div>
      </TestingModeProvider>
    </ErrorBoundary>
  );
}
