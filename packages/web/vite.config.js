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
      // TODO: Replace with better mock, this replacement is not strictly syntactically correct or safe.
      //       We could have our functions call something that updates window.location, then mock it in Vite instead.
      name: 'mock-window-location',
      transform(code, id) {
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
