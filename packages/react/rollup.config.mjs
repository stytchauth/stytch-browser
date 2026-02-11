import { defineRollupConfig } from '@stytch/internal-build-config';
import packageJson from './package.json' with { type: 'json' };

/** @type {import('rollup').RollupOptions[]} */
const config = defineRollupConfig({
  browser: true,
  entrypoints: [
    'index', //
    'index.headless',
    'b2b/index',
    'b2b/index.headless',
    'adminPortal/index',
    'compat',
  ],
  packageJson,
  outputs: ['cjs', 'esm'],
});

export default config;
