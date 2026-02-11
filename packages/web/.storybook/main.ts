import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

import type { StorybookConfig } from '@storybook/preact-vite';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);

/**
 * This function is used to resolve the absolute path of a package.
 * It is needed in projects that use Yarn PnP or are set up within a monorepo.
 */
function getAbsolutePath(value: string): string {
  return dirname(require.resolve(join(value, 'package.json')));
}
const config: StorybookConfig = {
  stories: [{ directory: '../src/adminPortal', titlePrefix: 'Admin Portal' }, { directory: '../src/ui/' }],

  addons: [
    getAbsolutePath('@storybook/addon-links'),
    getAbsolutePath('@storybook/addon-themes'),
    getAbsolutePath('@storybook/addon-a11y'),
    join(__dirname, './addon-locale-test-switcher'),
  ],

  framework: {
    name: getAbsolutePath('@storybook/preact-vite'),
    options: {},
  },

  staticDirs: ['./public', join(__dirname, '../../../internal/assets/dist')],

  features: {
    // Background is controlled by themes instead
    backgrounds: false,
  },

  viteFinal: async (config) => {
    // This must be imported first, before any MUI components are imported
    // see: https://mui.com/material-ui/experimental-api/classname-generator/
    config.optimizeDeps = config.optimizeDeps || {};
    config.optimizeDeps.entries = ['./src/adminPortal/MuiClassNameSetup.ts', ...(config.optimizeDeps.entries || [])];

    return config;
  },
};
export default config;
