import type { InputType, Preview } from '@storybook/preact-vite';
import { initialize, mswLoader } from 'msw-storybook-addon';

import { handlers } from './handlers';
import { I18nDecorator } from './I18nDecorator';
import { StorybookGlobal } from './storybook';
import { stytchDecorator } from './stytchDecorator';
import { swrCacheDecorator } from './swrCacheDecorator';
import { adminThemes, themeDecorator, themes } from './themeDecorator';
import { windowLocationDecorator } from './windowLocationDecorator';

// Initialize MSW
initialize();

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    backgrounds: { disabled: true },

    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    msw: { handlers: handlers() },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      // test: 'todo',
    },
  },
  decorators: [windowLocationDecorator, stytchDecorator, themeDecorator, swrCacheDecorator, I18nDecorator],
  loaders: [mswLoader],
  globalTypes: {
    theme: {
      description: 'Theme for Stytch UI components',
      toolbar: {
        title: 'Theme',
        icon: 'paintbrush',
        items: Object.keys(themes),
        dynamicTitle: true,
      },
    },
    adminTheme: {
      description: 'Theme for admin components',
      toolbar: {
        title: 'Admin Theme',
        icon: 'paintbrush',
        items: Object.keys(adminThemes),
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
      description: 'Show Stytch watermark',
      toolbar: {
        title: 'watermark',
        icon: 'credit',
        items: ['No watermark', 'Show watermark'],
        dynamicTitle: true,
      },
    },
    logo: {
      description: 'Show customer logo',
      toolbar: {
        title: 'logo',
        icon: 'eye',
        items: ['No customer logo', 'Show customer logo'],
        dynamicTitle: true,
      },
    },
    icons: {
      description: 'Logo icon set',
      toolbar: {
        title: 'icons',
        icon: 'component',
        items: ['Color logo', 'White logo', 'Black logo'],
        dynamicTitle: true,
      },
    },
    direction: {
      description: 'Text direction',
      toolbar: {
        title: 'Direction',
        icon: 'arrowleft',
        items: ['ltr', 'rtl'],
        dynamicTitle: true,
      },
    },
  } satisfies Record<keyof StorybookGlobal, InputType>,
  initialGlobals: {
    theme: 'defaultTheme',
    adminTheme: 'default',
    locale: 'en',
    watermark: 'No watermark',
    logo: 'No customer logo',
    direction: 'ltr',
    icons: 'Color logo',
  } satisfies StorybookGlobal,
};

export default preview;
