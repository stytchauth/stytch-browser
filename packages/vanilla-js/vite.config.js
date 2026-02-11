import { lingui } from '@lingui/vite-plugin';
import preact from '@preact/preset-vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    preact({
      // https://github.com/storybookjs/storybook/issues/22553#issuecomment-1816096271
      prefreshEnabled: false,
      babel: {
        plugins: ['@lingui/babel-plugin-lingui-macro'],
      },
    }),
    lingui(),
    {
      name: 'mock-window-location',
      transform(code, id) {
        if (!id.match(/\.[jt]sx?$/)) {
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

        return {
          code: transformedCode,
          map: null,
        };
      },
    },
  ],
});
