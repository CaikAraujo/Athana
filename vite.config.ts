import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcjs from '@tailwindcss/postcss';

export default defineConfig({
    plugins: [react()],
    css: {
        postcss: {
            plugins: [tailwindcjs()],
        },
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (!id.includes('node_modules')) return;

                    if (
                        id.includes('/react/') ||
                        id.includes('/react-dom/') ||
                        id.includes('/react-router-dom/') ||
                        id.includes('/@remix-run/router/') ||
                        id.includes('/history/')
                    ) {
                        return 'vendor-react';
                    }

                    if (
                        id.includes('/i18next/') ||
                        id.includes('/react-i18next/') ||
                        id.includes('/i18next-browser-languagedetector/')
                    ) {
                        return 'vendor-i18n';
                    }
                },
            },
        },
    },
});
