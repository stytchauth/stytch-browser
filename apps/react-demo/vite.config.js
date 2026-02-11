import react from '@vitejs/plugin-react';
import Sonda from 'sonda/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    Sonda({
      open: false,
      deep: true,
      gzip: true,
    }),
    react(),
  ],
  envPrefix: 'REACT_APP_',
  build: {
    sourcemap: true,
  },
  server: {
    port: 3000,
  },
  test: {
    globals: true,
    environment: 'jsdom',
  },
});
