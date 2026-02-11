import type { DefaultTheme } from 'styled-components';
import { useMemo } from 'react';
import merge from 'lodash.merge';

import { StyleConfig } from '@stytch/core/public';
import { DEFAULT_STYLE_CONFIG } from './b2c/GlobalContextProvider';

declare module 'styled-components' {
  export interface DefaultTheme {
    typography: {
      fontFamily: string;
      header: {
        fontFamily: string;
        fontSize: string | number;
        fontWeight: string | number;
        lineHeight: string;
      };
      body: {
        fontFamily: string;
        fontSize: string | number;
        fontWeight: string | number;
        lineHeight: string;
      };
      helper: {
        fontFamily: string;
        fontSize: string | number;
        fontWeight: string | number;
        lineHeight: string;
        whiteSpace?: 'pre-wrap';
      };
    };
    colors: {
      primary: string;
      secondary: string;
      success: string;
      warning: string;
      error: string;
      accent: string;
      disabledText: string;
      disabled: string;
    };
    container: {
      width: string;
      backgroundColor: string;
      border: string;
      borderRadius: string;
    };
    buttons: {
      primary: {
        backgroundColor: string;
        textColor: string;
        border: string;
        borderRadius: string;
      };
      secondary: {
        backgroundColor: string;
        textColor: string;
        border: string;
        borderRadius: string;
      };
      disabled: {
        backgroundColor: string;
        textColor: string;
        border: string;
        borderRadius: string;
      };
    };
    inputs: {
      backgroundColor: string;
      textColor: string;
      borderColor: string;
      borderRadius: string;
      placeholderColor: string;
    };
    displayHeader: boolean;
    displayWatermark: boolean;
    logo: {
      logoImageUrl: string;
    };
  }
}

const defaultDisabledTextColor = '#8296A1';

export const createTheme = (styles: StyleConfig | undefined, displayWatermark = false): DefaultTheme => {
  const styleConfig = merge({}, DEFAULT_STYLE_CONFIG, styles);
  const { fontFamily, colors, container, buttons, inputs } = styleConfig;

  return {
    typography: {
      fontFamily,
      header: {
        fontFamily,
        fontSize: 24,
        fontWeight: 600,
        lineHeight: '30px',
      },
      body: {
        fontFamily,
        fontSize: 16,
        fontWeight: 'normal',
        lineHeight: '21px',
      },
      helper: {
        fontFamily,
        fontSize: 14,
        fontWeight: '400',
        lineHeight: '20px',
        whiteSpace: 'pre-wrap',
      },
    },
    colors: {
      primary: colors.primary,
      secondary: colors.secondary,
      success: colors.success,
      warning: colors.warning,
      error: colors.error,
      accent: colors.accent,
      disabled: '#F3F5F6',
      disabledText: defaultDisabledTextColor,
    },
    container: {
      width: container.width,
      border: `1px solid ${container.borderColor}`,
      borderRadius: container.borderRadius,
      backgroundColor: container.backgroundColor,
    },
    buttons: {
      primary: {
        backgroundColor: buttons.primary.backgroundColor,
        textColor: buttons.primary.textColor,
        border: `1px solid ${buttons.primary.borderColor}`,
        borderRadius: buttons.primary.borderRadius,
      },
      secondary: {
        backgroundColor: buttons.secondary.backgroundColor,
        textColor: buttons.secondary.textColor,
        border: `1px solid ${buttons.secondary.borderColor}`,
        borderRadius: buttons.secondary.borderRadius,
      },
      disabled: {
        textColor: buttons.disabled.textColor,
        backgroundColor: buttons.disabled.backgroundColor,
        border: `1px solid ${buttons.disabled.borderColor}`,
        borderRadius: buttons.disabled.borderRadius,
      },
    },
    inputs: {
      backgroundColor: inputs?.backgroundColor ?? 'transparent',
      textColor: inputs?.textColor ?? colors.primary,
      borderColor: inputs?.borderColor ?? colors.primary,
      borderRadius: inputs?.borderRadius ?? '4px',
      placeholderColor: inputs?.placeholderColor ?? defaultDisabledTextColor,
    },
    displayHeader: !styleConfig.hideHeaderText,
    displayWatermark,
    logo: {
      logoImageUrl: styleConfig.logo.logoImageUrl,
    },
  };
};

export const useTheme = ({
  styles,
  displayWatermark,
}: {
  styles?: StyleConfig;
  displayWatermark: boolean;
}): DefaultTheme => useMemo<DefaultTheme>(() => createTheme(styles, displayWatermark), [styles, displayWatermark]);
