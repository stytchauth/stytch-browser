import type { Preview } from '@storybook/preact';
import { initialize, mswLoader } from 'msw-storybook-addon';
import { handlers } from './handlers';
import { I18nDecorator } from './I18nDecorator';
import { stytchDecorator } from './stytchDecorator';
import { swrCacheDecorator } from './swrCacheDecorator';
import { themeDecorator, themes } from './themeDecorator';
import { windowLocationDecorator } from './windowLocationDecorator';

// Initialize MSW
initialize();

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    msw: { handlers: handlers() },
  },
  decorators: [windowLocationDecorator, stytchDecorator, themeDecorator, swrCacheDecorator, I18nDecorator],
  loaders: [mswLoader],
  globalTypes: {
    theme: {
      description: 'Global theme for components',
      toolbar: {
        title: 'Theme',
        icon: 'paintbrush',
        items: Object.keys(themes),
        dynamicTitle: true,
      },
    },
    locale: {
      description: 'String locale dictionary',
      toolbar: {
        title: 'locale',
        icon: 'globe',
        items: ['en', 'pseudo', 'id', 'custom'],
        dynamicTitle: true,
      },
    },
    watermark: {
      description: 'Control display of Stytch watermark',
      toolbar: {
        title: 'watermark',
        icon: 'credit',
        items: ['off', 'on'],
        dynamicTitle: true,
      },
    },
    logo: {
      description: 'Control display of customer logo',
      toolbar: {
        title: 'logo',
        icon: 'eye',
        items: ['off', 'on'],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    theme: Object.keys(themes)[0],
    watermark: 'off',
    locale: 'en',
  },
};

export default preview;
