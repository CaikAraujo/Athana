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
});
