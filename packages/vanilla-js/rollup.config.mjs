import alias from '@rollup/plugin-alias';
import { defineRollupConfig } from '@stytch/internal-build-config';
import packageJson from './package.json' with { type: 'json' };

/** @type {import('rollup').RollupOptions[]} */
const config = defineRollupConfig({
  browser: true,
  iife: true,
  entrypoints: [
    'index', //
    'index.headless',
    'b2b/index',
    'b2b/index.headless',
    'adminPortal/index',
    'compat',
  ],
  packageJson,
  plugins: [
    alias({
      entries: [
        { find: 'react', replacement: 'preact/compat' },
        { find: 'react-dom/test-utils', replacement: 'preact/test-utils' },
        { find: 'react-dom', replacement: 'preact/compat' },
        { find: 'react/jsx-runtime', replacement: 'preact/jsx-runtime' },
      ],
    }),
  ],
  outputs: ['cjs', 'esm', 'esm-dev'],
});

export default config;
