import chroma from 'chroma-js';

import type { ColorMixFallback, Theme } from '../components/themes/ThemeConfig';

/* eslint-disable lingui/no-unlocalized-strings */

function rgba(color: chroma.Color) {
  if (color.alpha() === 1) return `rgb(${color.rgb().join(',')})`;
  return `rgba(${color.rgba().join(',')})`;
}

/**
 * Takes a theme and dynamically generate the styles that uses color-mix,
 * as a fallback for browsers that do not support color-mix()
 */
export function generateColorFallback(theme: Theme): ColorMixFallback {
  // Don't use chroma.colorMix since chroma.js treats transparent as rgba(0, 0, 0, 0)
  // which means our color is mixed with black rather than the original color
  // with alpha 0, which is what browsers so instead
  return {
    // --tab-background: color-mix(in oklab, var(--accent) 80%, transparent);
    'tab-background': rgba(chroma(theme.accent).alpha(0.8)),
    // --primary-button-hover: color-mix(in oklab, var(--primary) 90%, transparent);
    'primary-button-hover': rgba(chroma(theme.primary).alpha(0.9)),
    // --secondary-button-hover: color-mix(in oklab, var(--secondary) 80%, transparent);
    'secondary-button-hover': rgba(chroma(theme.secondary).alpha(0.8)),
    // --destructive-button-hover: color-mix(in oklab, var(--destructive) 80%, transparent);
    'destructive-button-hover': rgba(chroma(theme.destructive).alpha(0.8)),
    // --divider-color: color-mix(in oklab, var(--border) 50%, transparent);
    'divider-color': rgba(chroma(theme.border).alpha(0.5)),
    // --focus-ring-shadow: 0 0 0 3px color-mix(in oklab, var(--ring) 50%, transparent);
    'focus-ring-shadow': `0 0 0 3px ${rgba(chroma(theme.ring).alpha(0.5))}`,
  };
}

const colors = [
  'background',
  'foreground',
  'primary',
  'primary-foreground',
  'secondary',
  'secondary-foreground',
  'muted',
  'muted-foreground',
  'accent',
  'accent-foreground',
  'border',
  'input',
  'ring',
  'destructive',
  'warning',
  'success',
] as const satisfies (keyof Theme)[];

export function addColorFallback(theme: Theme): Theme {
  const updatedTheme = { ...theme, ...generateColorFallback(theme) };

  // RGB fallbacks for all Theme colors that use oklch, if the customer's browsers
  // don't support them
  for (const property of colors) {
    if (!chroma.valid(theme[property])) continue;
    updatedTheme[property] = rgba(chroma(theme[property]!));
  }

  return updatedTheme;
}
