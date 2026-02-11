import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { build } from 'vite';

import { createConfig } from './vite.config.js';

/* eslint-disable no-console */

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Build each framework individually
const frameworks = ['vanilla', 'vue', 'svelte'];

async function buildAll() {
  console.log('Starting individual framework builds...\n');

  for (const framework of frameworks) {
    console.log(`Building ${framework}...`);
    try {
      const config = createConfig({
        outDir: resolve(__dirname, `dist/${framework}`),
        input: {
          [framework]: resolve(__dirname, `src/${framework}/index.html`),
        },
      });

      await build(config);
      console.log(`✓ ${framework} build complete\n`);
    } catch (error) {
      console.error(`✗ ${framework} build failed:`, error);
      process.exit(1);
    }
  }

  console.log('All builds completed successfully!');
}

buildAll();
