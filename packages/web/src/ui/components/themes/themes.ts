import type { Theme } from './ThemeConfig';

/* eslint-disable lingui/no-unlocalized-strings */

export const defaultShared = {
  // Fonts
  'font-family': 'system-ui, sans-serif',
  'font-family-mono':
    "ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, Consolas, 'DejaVu Sans Mono', monospace",

  // Sizes
  spacing: '4px',
  'rounded-base': '4px',
  'text-base': '1rem',
  'container-width': '400px',
  'mobile-breakpoint': '768px',

  // Durations
  'transition-duration': '0.15s',

  'destructive-foreground': '#fff',
} satisfies Partial<Theme>;

export const defaultTheme: Theme = {
  ...defaultShared,

  'color-scheme': 'light',

  // Colors
  background: 'oklch(1 0 0)',
  foreground: 'oklch(0.14 0 0)',

  primary: 'oklch(0.2 0 0)',
  'primary-foreground': 'oklch(0.99 0 0)',

  secondary: 'oklch(0.97 0 0)',
  'secondary-foreground': 'oklch(0.2 0 0)',

  muted: 'oklch(0.97 0 0)',
  'muted-foreground': 'oklch(0.52 0 0)',

  accent: 'oklch(0.97 0 0)',
  'accent-foreground': 'oklch(0.2 0 0)',

  border: 'oklch(0.92 0 0)',
  input: 'oklch(0.92 0 0)',
  ring: 'oklch(0.72 0 0)',

  destructive: 'oklch(0.577 0.245 27.325)',
  warning: 'oklch(0.67 0.16 58)',
  success: 'oklch(0.6 0.13 163)',
};

export const defaultDarkTheme: Theme = {
  ...defaultShared,

  'color-scheme': 'dark',

  background: 'oklch(0.145 0 0)',
  foreground: 'oklch(0.985 0 0)',

  primary: 'oklch(0.922 0 0)',
  'primary-foreground': 'oklch(0.205 0 0)',
  secondary: 'oklch(0.269 0 0)',
  'secondary-foreground': 'oklch(0.985 0 0)',
  muted: 'oklch(0.269 0 0)',
  'muted-foreground': 'oklch(0.708 0 0)',
  accent: 'oklch(0.269 0 0)',
  'accent-foreground': 'oklch(0.985 0 0)',

  border: 'oklch(1 0 0 / 10%)',
  input: 'oklch(1 0 0 / 15%)',
  ring: 'oklch(0.556 0 0)',

  destructive: 'oklch(0.704 0.191 22.216)',
  warning: 'oklch(0.754 0.16 58)',
  success: 'oklch(0.704 0.13 163)',
};
