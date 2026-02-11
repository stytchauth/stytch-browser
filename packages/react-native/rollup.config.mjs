import { defineRollupConfig } from '@stytch/internal-build-config';
import { imageAssetPlugin } from './imageAssetPlugin.mjs';
import packageJson from './package.json' with { type: 'json' };

/** @type {import('rollup').RollupOptions[]} */
const config = defineRollupConfig({
  entrypoints: ['index', 'b2b/index'],
  packageJson,
  plugins: [imageAssetPlugin()],
  // For now, we're omitting ESM output because:
  // - Rollup is not properly handling interop with ESM output
  //   (https://github.com/rollup/rollup/issues/5265), which is a problem for
  //   `react-native-uuid`
  // - It's unclear how we should treat conditional `require` statements in ESM
  //   output (hoist? dynamic import? keep as is?)
  // - Historically, we've only published CJS output for React Native, and the
  //   benefits of ESM output are more pronounced for web
  outputs: ['cjs', 'cjs-legacy', 'cjs-dev'],
});

export default config;
