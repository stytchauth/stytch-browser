import type { StyleConfig } from '@stytch/core/public';

import { DeepRequired } from '../../../utils';
import { addColorFallback } from '../../compat/generateColorFallback';
import { styleToTheme } from '../../compat/styleToTheme';
import type { Theme } from './ThemeConfig';
import { defaultShared, defaultTheme } from './themes';

/* eslint-disable lingui/no-unlocalized-strings */

export const tangerine: Theme = {
  ...defaultShared,

  'color-scheme': 'light',

  background: 'oklch(0.9383 0.0042 236.4993)',
  foreground: 'oklch(0.3211 0 0)',

  primary: 'oklch(0.6397 0.1720 36.4421)',
  'primary-foreground': 'oklch(1.0000 0 0)',
  secondary: 'oklch(0.9670 0.0029 264.5419)',
  'secondary-foreground': 'oklch(0.4461 0.0263 256.8018)',
  muted: 'oklch(0.9846 0.0017 247.8389)',
  'muted-foreground': 'oklch(0.5510 0.0234 264.3637)',
  accent: 'oklch(0.9119 0.0222 243.8174)',
  'accent-foreground': 'oklch(0.3791 0.1378 265.5222)',

  border: 'oklch(0.9022 0.0052 247.8822)',
  input: 'oklch(0.9022 0.0052 247.8822)',
  ring: 'oklch(0.6397 0.1720 36.4421)',

  destructive: 'oklch(0.6368 0.2078 25.3313)',
  warning: 'oklch(0.67 0.16 58)',
  success: 'oklch(0.6 0.13 163)',
};
export const tangerineDark: Theme = {
  ...defaultShared,

  'color-scheme': 'dark',

  background: 'oklch(0.2598 0.0306 262.6666)',
  foreground: 'oklch(0.9219 0 0)',

  primary: 'oklch(0.6397 0.1720 36.4421)',
  'primary-foreground': 'oklch(1.0000 0 0)',
  secondary: 'oklch(0.3095 0.0266 266.7132)',
  'secondary-foreground': 'oklch(0.9219 0 0)',
  muted: 'oklch(0.3095 0.0266 266.7132)',
  'muted-foreground': 'oklch(0.7155 0 0)',
  accent: 'oklch(0.3380 0.0589 267.5867)',
  'accent-foreground': 'oklch(0.8823 0.0571 254.1284)',

  border: 'oklch(0.3843 0.0301 269.7337)',
  input: 'oklch(0.3843 0.0301 269.7337)',
  ring: 'oklch(0.6397 0.1720 36.4421)',

  destructive: 'oklch(0.6368 0.2078 25.3313)',
  warning: 'oklch(0.754 0.16 58)',
  success: 'oklch(0.704 0.13 163)',
};
export const bubblegum: Theme = {
  ...defaultShared,

  'color-scheme': 'light',

  shadow: 'rgb(209, 81, 154, 0.6) 3px 3px 0px 0px',

  background: 'oklch(0.9399 0.0203 345.6985)',
  foreground: 'oklch(0.4712 0 0)',

  primary: 'oklch(0.6209 0.1801 348.1385)',
  'primary-foreground': 'oklch(1.0000 0 0)',
  secondary: 'oklch(0.8095 0.0694 198.1863)',
  'secondary-foreground': 'oklch(0.3211 0 0)',
  muted: 'oklch(0.8800 0.0504 212.0952)',
  'muted-foreground': 'oklch(0.5795 0 0)',
  accent: 'oklch(0.9195 0.0801 87.6670)',
  'accent-foreground': 'oklch(0.3211 0 0)',

  border: 'oklch(0.6209 0.1801 348.1385)',
  input: 'oklch(0.6209 0.1801 348.1385)',
  ring: 'oklch(0.7002 0.1597 350.7532)',

  destructive: 'oklch(0.7091 0.1697 21.9551)',
  warning: 'oklch(0.754 0.16 58)',
  success: 'oklch(0.704 0.13 163)',
};
export const bubblegumDark: Theme = {
  ...defaultShared,

  'color-scheme': 'dark',

  background: 'oklch(0.2497 0.0305 234.1628)',
  foreground: 'oklch(0.9306 0.0197 349.0785)',

  primary: 'oklch(0.9195 0.0801 87.6670)',
  'primary-foreground': 'oklch(0.2497 0.0305 234.1628)',
  secondary: 'oklch(0.7794 0.0803 4.1330)',
  'secondary-foreground': 'oklch(0.2497 0.0305 234.1628)',
  muted: 'oklch(0.2713 0.0086 255.5780)',
  'muted-foreground': 'oklch(0.7794 0.0803 4.1330)',
  accent: 'oklch(0.6699 0.0988 356.9762)',
  'accent-foreground': 'oklch(0.9306 0.0197 349.0785)',

  border: 'oklch(0.3907 0.0399 242.2181)',
  input: 'oklch(0.3093 0.0305 232.0027)',
  ring: 'oklch(0.6998 0.0896 201.8672)',

  destructive: 'oklch(0.6702 0.1806 350.3599)',
  warning: 'oklch(0.754 0.16 58)',
  success: 'oklch(0.704 0.13 163)',
};
export const hotDogStand: Theme = {
  spacing: '4px',
  'text-base': '14px',

  'transition-duration': '0',
  'rounded-base': '0',
  'container-width': '400px',
  'mobile-breakpoint': '',

  'font-family': 'Courier New, monospace',
  'font-family-mono': 'Courier New, monospace',

  // From https://jdan.github.io/98.css/
  'shadow-button': 'inset -1px -1px #0a0a0a,inset 1px 1px #fff,inset -2px -2px grey,inset 2px 2px #dfdfdf',
  'shadow-input': 'inset -1px -1px #fff,inset 1px 1px grey,inset -2px -2px #dfdfdf,inset 2px 2px #0a0a0a',

  'color-scheme': 'dark',

  background: '#FF0000',
  foreground: '#000000',

  primary: '#FFFF00',
  'primary-foreground': '#000000',
  secondary: '#C0C0C0',
  'secondary-foreground': '#000000',
  muted: '#808080',
  'muted-foreground': '#FFFFFF',
  accent: '#000000',
  'accent-foreground': '#FFFFFF',

  border: '#000000',
  input: '#FFFF00',
  ring: '#000000',

  destructive: '#FF8040',
  'destructive-foreground': '#fff',
  warning: '#FFFF00',
  success: '#00FF00',
};

// Old SDK styling config
const DEFAULT_STYLE_CONFIG: Omit<DeepRequired<StyleConfig>, 'inputs'> = {
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

  // Unused in theme
  hideHeaderText: false,
  logo: {
    logoImageUrl: '',
  },
};

/**
 * Stytch SDK's old default style converted to a theme
 */
export const oldDefault: Theme = addColorFallback({
  ...defaultTheme,
  ...styleToTheme(DEFAULT_STYLE_CONFIG, { silent: true }).theme,
});
