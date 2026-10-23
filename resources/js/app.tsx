import './bootstrap';
import '../css/app.css';

import React from 'react';
import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import { ErrorBoundary } from './Components/ErrorBoundary';
import { Toaster } from 'sonner';

const appName = window.document.getElementsByTagName('title')[0]?.innerText || 'Sistem Informasi Asrama UBT (Roemah 54)';

/**
 * Ekstraksi metadata initialPage secara aman dari dokumen DOM.
 * Mendukung pembacaan dari:
 * 1. Tag script JSON bawaan: <script data-page="app" type="application/json">...</script>
 * 2. Atribut dataset kontainer Inertia: <div id="app" data-page="..."></div>
 */
function getInitialInertiaPage(): any {
    // 1. Periksa script tag JSON
    const scriptEl = document.querySelector('script[data-page="app"][type="application/json"]');
    if (scriptEl?.textContent) {
        try {
            const parsed = JSON.parse(scriptEl.textContent);
            if (parsed && typeof parsed === 'object' && parsed.component) {
                return parsed;
            }
        } catch (e) {
            console.warn('[Inertia] Gagal mengurai script data-page JSON:', e);
        }
    }

    // 2. Periksa atribut dataset pada kontainer #app
    const el = document.getElementById('app');
    if (el?.dataset?.page) {
        try {
            const parsed = JSON.parse(el.dataset.page);
            if (parsed && typeof parsed === 'object' && parsed.component) {
                return parsed;
            }
        } catch (e) {
            console.warn('[Inertia] Gagal mengurai el.dataset.page:', e);
        }
    }

    return null;
}

const initialPage = getInitialInertiaPage();
const inertiaContainer = document.getElementById('app');

// Dynamic lazy import resolver untuk pemisahan chunk (code splitting)
const pages = import.meta.glob('./Pages/**/*.{tsx,jsx}');

if (initialPage && initialPage.component && inertiaContainer) {
    createInertiaApp({
        id: 'app',
        page: initialPage,
        title: (title) => `${title} - ${appName}`,
        resolve: async (name: string) => {
            const importPage = pages[`./Pages/${name}.tsx`] || pages[`./Pages/${name}.jsx`];
            if (!importPage) {
                console.error(`[Inertia] Halaman tidak ditemukan: ./Pages/${name}.tsx`);
                throw new Error(`Halaman Inertia tidak ditemukan: ./Pages/${name}.tsx`);
            }
            const module: any = await importPage();
            return module.default ?? module;
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
    // Jalur Fallback: Jika dibuka di luar payload Inertia (misalnya kontainer SPA #root atau data-page kosong)
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
