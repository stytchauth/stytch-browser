import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { Decorator } from '@storybook/react-vite';
import { PartialDeep } from '@stytch/core';
import { StyleConfig } from '@stytch/core/public';
import merge from 'lodash.merge';
import React, { useMemo } from 'react';

import { AdminPortalStyleConfig } from '../src/adminPortal/AdminPortalStyleConfig';
import { getTheme } from '../src/adminPortal/utils/theme';
import * as LogosBlack from '../src/assets/logo-black';
import * as LogosWhite from '../src/assets/logo-white';
import * as B2BProducts from '../src/ui/b2b/B2BProducts';
import * as Products from '../src/ui/b2c/Products';
import { StorybookRoot } from '../src/ui/components/atoms/StorybookRoot';
import type { IconRegistry } from '../src/ui/components/IconRegistry';
import { PresentationContext, usePresentationWithDefault } from '../src/ui/components/PresentationConfig';
import * as additionalThemes from '../src/ui/components/themes/additionalThemes';
import { defaultDarkTheme, defaultTheme } from '../src/ui/components/themes/themes';
import { DeepRequired } from '../src/utils';
import { StorybookGlobal } from './storybook';

export const DEFAULT_STYLE_CONFIG: Omit<DeepRequired<StyleConfig>, 'inputs'> = {
  container: {
    backgroundColor: '#FFFFFF',
    borderColor: '#ADBCC5',
    borderRadius: '8px',
    width: '400px',
  },
  colors: {
    primary: '#19303D',
    secondary: '#5C727D',
    success: '#0C5A56',
    warning: '#FFD94A',
    error: '#8B1214',
    accent: '#ECFAFF',
  },
  buttons: {
    primary: {
      backgroundColor: '#19303D',
      textColor: '#FFFFFF',
      borderColor: '#19303D',
      borderRadius: '4px',
    },
    secondary: {
      backgroundColor: '#FFFFFF',
      textColor: '#19303D',
      borderColor: '#19303D',
      borderRadius: '4px',
    },
    disabled: {
      backgroundColor: '#F3F5F6',
      textColor: '#8296A1',
      borderColor: '#F3F5F6',
      borderRadius: '4px',
    },
  },
  fontFamily: 'Arial, Helvetica, sans-serif',
  hideHeaderText: false,
  logo: {
    logoImageUrl: '',
  },
};

const DEFAULT_DARK_THEME = {
  config: {
    container: {
      backgroundColor: '#000000',
      borderColor: '#728b9a',
      borderRadius: '8px',
      width: '400px',
    },
    colors: {
      primary: '#dadada',
      secondary: '#80a6be',
      success: '#84df7c',
      error: '#ea5f80',
      subtle: '#333333',
      accentText: '#ffffff',
      accent: '#333333',
    },
    buttons: {
      primary: {
        backgroundColor: '#afdffa',
        textColor: '#000000',
        borderColor: '#728b9a',
        borderRadius: '4px',
      },
      secondary: {
        backgroundColor: '#1e1e1e',
        textColor: '#a6d0e8',
        borderColor: '#728b9a',
        borderRadius: '4px',
      },
    },
    inputs: {
      backgroundColor: '#FFFFFF00',
      borderColor: '#728b9a',
      borderRadius: '4px',
      placeholderColor: '#a1deff',
      textColor: '#ffffff',
    },
  },
};

export const adminThemes = {
  default: { config: {} },
  light: { config: DEFAULT_STYLE_CONFIG },
  dark: DEFAULT_DARK_THEME,
} satisfies Record<string, { config: PartialDeep<AdminPortalStyleConfig & StyleConfig> }>;

const themes = {
  defaultTheme,
  defaultDarkTheme,
  ...additionalThemes,
  // Dynamic theme selecting default light / dark mode based on system color scheme
  systemColorScheme: [defaultTheme, defaultDarkTheme] as const,
};

export { themes };

function iconsGlobalToRegistry(iconType: StorybookGlobal['icons']) {
  const components =
    iconType === 'White logo'
      ? LogosWhite
      : iconType === 'Black logo'
        ? LogosBlack //
        : undefined;

  if (!components) return components;
  const registry: IconRegistry<string> = {};
  for (const [name, component] of Object.entries(components)) {
    // Icon name = Component name in camelCase (rather than TitleCase) and without the Icon suffix
    const iconName = name.slice(0, 1).toLowerCase() + name.slice(1, -4);
    registry[iconName] = component;
  }
  return registry;
}

const MetaThemeProvider = ({
  adminTheme: { config },
  displayLogo,
  children,
}: {
  adminTheme: { config: PartialDeep<AdminPortalStyleConfig & StyleConfig> };
  displayLogo: boolean;
  children: React.ReactNode;
}) => {
  const modifiedConfig = useMemo(() => {
    if (displayLogo) {
      return { ...config, logo: { logoImageUrl: '/twilio.png' } };
    }
    return config;
  }, [config, displayLogo]);

  const muiTheme = getTheme(modifiedConfig as PartialDeep<AdminPortalStyleConfig>);

  return <MuiThemeProvider theme={muiTheme}>{children}</MuiThemeProvider>;
};

export const themeDecorator: Decorator = (storyFn, context) => {
  const globals = context.globals as StorybookGlobal;

  const theme = themes[globals.theme];
  const adminTheme = adminThemes[globals.adminTheme] ?? adminThemes.default;
  const overrides = context.parameters.theme;
  const rootWidth = context.parameters.rootWidth;

  const displayWatermark = globals.watermark === 'Show watermark';
  const displayLogo = globals.logo === 'Show customer logo';

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const presentationValue = usePresentationWithDefault(
    {
      theme,
      options: {
        hideHeaderText: false,
        logo: displayLogo ? { url: '/twilio.png', alt: 'Twilio' } : undefined,
        icons: iconsGlobalToRegistry(globals.icons),
      },
    },
    displayWatermark,
    {
      products: [...Object.values(Products), ...Object.values(B2BProducts)],
    },
  );

  if (context.parameters.adminPortal) {
    return (
      <MetaThemeProvider adminTheme={merge({}, adminTheme, overrides)} displayLogo={displayLogo}>
        {storyFn() as React.ReactNode}
      </MetaThemeProvider>
    );
  } else {
    return (
      <PresentationContext.Provider value={presentationValue}>
        <style>{
          // We disable the background add-on and use the theme's background instead
          // since we already have our own background theme variable and there's no point in
          // having two configs that do the same thing
          `body, .docs-story { 
           background-color: ${presentationValue.theme.background};
           ${rootWidth ? `--storybook-width: ${rootWidth};` : ''}
         }`
        }</style>

        <StorybookRoot theme={presentationValue.theme}>{storyFn() as React.ReactNode}</StorybookRoot>
      </PresentationContext.Provider>
    );
  }
};
