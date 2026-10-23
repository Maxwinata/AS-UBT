import './bootstrap';
import '../css/app.css';

import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';

const appName = window.document.getElementsByTagName('title')[0]?.innerText || 'Portal SI-GABUNG 54';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => {
        const pages = import.meta.glob('./Pages/**/*.{tsx,jsx}', { eager: true });
        const page = (pages[`./Pages/${name}.tsx`] || pages[`./Pages/${name}.jsx`]) as any;
        if (!page) {
            throw new Error(`Halaman Inertia tidak ditemukan: ./Pages/${name}.tsx`);
        }
        return page.default ?? page;
    },
    setup({ el, App, props }) {
        const root = createRoot(el);
        root.render(<App {...props} />);
    },
    progress: {
        color: '#0d9488',
    },
});
