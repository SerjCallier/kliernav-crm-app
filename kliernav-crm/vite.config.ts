import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/kliernav-crm-app/',
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
  },
  define: {
    // Proporciona un objeto process.env básico para evitar errores en librerías externas
    'process.env': {
      NODE_ENV: JSON.stringify('production'),
      API_KEY: JSON.stringify(process.env.VITE_API_KEY || ''), 
          },
});
