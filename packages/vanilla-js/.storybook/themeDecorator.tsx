import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { Decorator } from '@storybook/preact';
import { StyleConfig } from '@stytch/core/public';
import merge from 'lodash.merge';
import React, { useMemo } from 'react';
import { ThemeProvider, createGlobalStyle } from 'styled-components';
import { PartialDeep } from 'type-fest';
import { AdminPortalStyleConfig } from '../src/adminPortal/AdminPortalStyleConfig';
import { getTheme } from '../src/adminPortal/utils/theme';
import { DEFAULT_STYLE_CONFIG } from '../src/ui/b2c/GlobalContextProvider';
import { createTheme } from '../src/ui/theme';

const GlobalStyles = createGlobalStyle`
  body, .docs-story {
    font-family: ${({ theme }) => theme.typography.fontFamily};
    background-color: ${({ theme }) => theme.container.backgroundColor};
  }
`;
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

export const themes = {
  default: { config: {} },
  light: { config: DEFAULT_STYLE_CONFIG },
  dark: DEFAULT_DARK_THEME,
} satisfies Record<string, { config: PartialDeep<AdminPortalStyleConfig & StyleConfig> }>;

const MetaThemeProvider = ({
  theme: { config },
  displayWatermark,
  displayLogo,
  children,
}: {
  theme: (typeof themes)[keyof typeof themes];
  displayWatermark: boolean;
  displayLogo: boolean;
  children: React.ReactNode;
}) => {
  const modifiedConfig = useMemo(() => {
    if (displayLogo) {
      return { ...config, logo: { logoImageUrl: '/stytch.jpg' } };
    }
    return config;
  }, [config, displayLogo]);

  const scTheme = createTheme(modifiedConfig, displayWatermark);
  const muiTheme = getTheme(modifiedConfig as PartialDeep<AdminPortalStyleConfig>);

  return (
    <ThemeProvider theme={scTheme}>
      <MuiThemeProvider theme={muiTheme}>{children}</MuiThemeProvider>
    </ThemeProvider>
  );
};

export const themeDecorator: Decorator = (storyFn, context) => {
  const theme = themes[context.globals.theme] ?? themes.default;
  const overrides = context.parameters.theme;

  const displayWatermark = context.globals.watermark === 'on';
  const displayLogo = context.globals.logo === 'on';

  const combinedTheme = merge({}, theme, overrides);

  return (
    <MetaThemeProvider theme={combinedTheme} displayWatermark={displayWatermark} displayLogo={displayLogo}>
      <GlobalStyles />
      {storyFn() as React.ReactNode}
    </MetaThemeProvider>
  );
};
