// To run:
// yarn dlx tsx ./src/ui/compat/generateThemeColorFallback.script.ts

import { themes } from '../../../.storybook/themeDecorator';
import { isDynamicTheme } from '../components/PresentationConfig';
import { ColorMixFallback } from '../components/themes/ThemeConfig';
import { generateColorFallback } from './generateColorFallback';

/* eslint-disable no-console */
for (const [name, theme] of Object.entries(themes)) {
  if (isDynamicTheme(theme)) continue;

  const fallbacks = generateColorFallback(theme);

  console.log(name);
  console.log(fallbacks);

  for (const [_prop, value] of Object.entries(fallbacks)) {
    const prop = _prop as keyof ColorMixFallback;
    if (theme[prop] && theme[prop] !== value) {
      console.error(`Theme color mismatch: ${prop}: ${theme[prop]} should be updated to`);
      console.error(value);
    }
  }

  console.log('\n========================================\n');
}
