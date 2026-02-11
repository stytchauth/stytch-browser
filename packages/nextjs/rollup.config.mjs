import { defineRollupConfig } from '@stytch/internal-build-config';
import packageJson from './package.json' with { type: 'json' };
import preserveUseClientDirective from 'rollup-plugin-preserve-use-client';

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
  plugins: [preserveUseClientDirective()],
});

export default config;
