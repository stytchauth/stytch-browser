import type { Theme } from './ThemeConfig';
import { defaultShared, defaultTheme } from './themes';

export const shadcnTheme: Theme = {
  'color-scheme': 'shadcn',

  'font-family': `var(--font-sans, ${defaultShared['font-family']})`,
  'font-family-mono': `var(--font-mono, ${defaultShared['font-family-mono']})`,
  'text-base': 'var(--text-base)',

  'transition-duration': defaultShared['transition-duration'],
  spacing: 'var(--spacing)',
  'mobile-breakpoint': 'var(--breakpoint-sm)',

  'rounded-base': 'calc(var(--radius) / 2.5)',

  'container-width': defaultShared['container-width'],
  'container-radius': 'var(--radius-xl)',

  shadow: 'var(--shadow)',

  background: 'var(--background)',
  foreground: 'var(--foreground)',

  primary: 'var(--primary)',
  'primary-foreground': 'var(--primary-foreground)',
  secondary: 'var(--secondary)',
  'secondary-foreground': 'var(--secondary-foreground)',
  muted: 'var(--muted)',
  'muted-foreground': 'var(--muted-foreground)',
  accent: 'var(--accent)',
  'accent-foreground': 'var(--accent-foreground)',

  border: 'var(--border)',
  input: 'var(--input)',
  ring: 'var(--ring)',

  destructive: 'var(--destructive)',
  'destructive-foreground': defaultShared['destructive-foreground'],

  success: defaultTheme.success,
  warning: defaultTheme.warning,
};
