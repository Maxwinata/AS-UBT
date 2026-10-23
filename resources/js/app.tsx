import './bootstrap';
import '../css/app.css';

import React from 'react';
import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import { ErrorBoundary } from './Components/ErrorBoundary';
import { Toaster } from 'sonner';

const appName = window.document.getElementsByTagName('title')[0]?.innerText || 'Sistem Informasi Asrama UBT (Roemah 54)';

// Periksa keberadaan kontainer Inertia (#app) dengan data-page
const inertiaContainer = document.getElementById('app');

if (inertiaContainer && inertiaContainer.dataset.page) {
    createInertiaApp({
        title: (title) => `${title} - ${appName}`,
        resolve: (name) => {
            const pages = import.meta.glob('./Pages/**/*.{tsx,jsx}', { eager: true });
            const page = (pages[`./Pages/${name}.tsx`] || pages[`./Pages/${name}.jsx`]) as any;
            if (!page) {
                console.error(`[Inertia] Halaman tidak ditemukan: ./Pages/${name}.tsx`);
                throw new Error(`Halaman Inertia tidak ditemukan: ./Pages/${name}.tsx`);
            }
            return page.default ?? page;
        },
        setup({ el, App, props }) {
            const root = createRoot(el);
            root.render(
                <ErrorBoundary>
                    <App {...props} />
                    <Toaster richColors position="top-right" />
                </ErrorBoundary>
            );
        },
        progress: {
            color: '#0d9488',
        },
    });
} else {
    // Jalur Fallback: Jika dibuka di luar payload Inertia (misalnya kontainer SPA #root)
    const fallbackContainer = document.getElementById('root') || inertiaContainer;
    if (fallbackContainer) {
        import('./Pages/Auth/Login').then(({ default: Login }) => {
            const root = createRoot(fallbackContainer);
            root.render(
                <ErrorBoundary>
                    <Login />
                    <Toaster richColors position="top-right" />
                </ErrorBoundary>
            );
        }).catch((err) => {
            console.error('[App] Gagal memuat fallback Login:', err);
        });
    }
}

