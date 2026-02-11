import type { StorybookConfig } from '@storybook/preact-vite';
import { dirname, join } from 'path';

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
    getAbsolutePath('@storybook/addon-essentials'),
    getAbsolutePath('@storybook/addon-interactions'),
    getAbsolutePath('@storybook/addon-themes'),
    join(__dirname, './addon-locale-test-switcher'),
  ],
  framework: {
    name: getAbsolutePath('@storybook/preact-vite'),
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
  staticDirs: ['./public', join(__dirname, '../../../internal/assets/dist')],
  viteFinal: async (config) => {
    // This must be imported first, before any MUI components are imported
    // see: https://mui.com/material-ui/experimental-api/classname-generator/
    config.optimizeDeps = config.optimizeDeps || {};
    config.optimizeDeps.entries = ['./src/adminPortal/MuiClassNameSetup.ts', ...(config.optimizeDeps.entries || [])];

    // HACK: We only use @storybook/react for types, but Storybook tries to be clever and add it pre-bundle optimization list
    //  which breaks preact compat, so we forcibly exclude it
    config.optimizeDeps.include = config.optimizeDeps.include?.filter((entry) => !entry.includes('@storybook/react'));

    return config;
  },
};
export default config;
