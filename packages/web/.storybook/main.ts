import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

import { lingui } from '@lingui/vite-plugin';
import type { StorybookConfig } from '@storybook/react-vite';
import { dirname, join } from 'path';
import type { TransformPluginContext } from 'rollup';
import react from '@vitejs/plugin-react-swc';

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
    name: getAbsolutePath('@storybook/react-vite'),
    options: {},
  },

  staticDirs: ['./public', join(__dirname, '../../../internal/assets/dist')],

  features: {
    // Background is controlled by themes instead
    backgrounds: false,
  },

  viteFinal: async (config) => {
    const { mergeConfig } = await import('vite');

    const result = mergeConfig(config, {
      optimizeDeps: {
        // This must be imported first, before any MUI components are imported
        // see: https://mui.com/material-ui/experimental-api/classname-generator/
        entries: ['./src/adminPortal/MuiClassNameSetup.ts', ...(config.optimizeDeps?.entries ?? [])],
      },

      plugins: [
        react({
          plugins: [['@lingui/swc-plugin', {}]],
        }),
        lingui(),
        {
          // TODO: Replace with better mock, this replacement is not strictly syntactically correct or safe.
          //       We could have our functions call something that updates window.location, then mock it in Vite instead.
          name: 'mock-window-location',
          transform(this: TransformPluginContext, code: string, id: string) {
            // Avoid external packages by default. If there are other packages that also navigate which you'd want to mock,
            // adjust the id check here
            if (!id.match(/\.[jt]sx?$/) || id.includes('node_modules')) {
              return null;
            }

            // Replace direct window.location.href assignments
            const transformedCode = code.replace(
              /\bwindow\.location\.href\s*=\s*([^;]+)(;|$)/g,
              `if (typeof window !== 'undefined' && window.__STORYBOOK_MOCK_LOCATION__) {
            window.__STORYBOOK_MOCK_LOCATION__.href = $1;
          } else {
            window.location.href = $1;
          }`,
            );

            if (transformedCode !== code) {
              this.debug('Mocking window.location.href');
            }

            return {
              code: transformedCode,
              map: null,
            };
          },
        },
      ],
    });

    console.log(result);
    console.log(result.plugins);

    return result;
  },
};
export default config;
