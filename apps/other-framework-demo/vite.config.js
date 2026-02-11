import { svelte } from '@sveltejs/vite-plugin-svelte';
import tailwindcss from '@tailwindcss/vite';
import vue from '@vitejs/plugin-vue';
import { dirname, resolve } from 'path';
import Sonda from 'sonda/vite';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Shared configuration factory
export function createConfig(options = {}) {
  const {
    outDir = resolve(__dirname, 'dist'),
    input = {
      main: resolve(__dirname, 'src/index.html'),
      vanilla: resolve(__dirname, 'src/vanilla/index.html'),
      vue: resolve(__dirname, 'src/vue/index.html'),
      svelte: resolve(__dirname, 'src/svelte/index.html'),
      tailwind: resolve(__dirname, 'src/tailwind/index.html'),
    },
  } = options;

  return {
    root: resolve(__dirname, 'src'),
    plugins: [
      vue(),
      svelte(),
      tailwindcss(),
      Sonda({
        open: false,
        deep: true,
        gzip: true,
        sources: true,
        outputDir: outDir,
      }),
    ],
    build: {
      sourcemap: true,
      outDir,
      emptyOutDir: true,
      rollupOptions: {
        input,
      },
    },
    envDir: __dirname,
    envPrefix: 'REACT_APP_',
    optimizeDeps: {
      // svelte is buggy in dev mode when bundled in this way, not entirely sure why but if it
      // is not excluded then mount will not even exist in the import
      exclude: ['svelte'],
    },
  };
}

export default defineConfig(createConfig());
