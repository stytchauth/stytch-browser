import { defineConfig } from '@lingui/cli';
import { formatter } from '@lingui/format-po';

export default defineConfig({
  locales: ['en', 'pseudo-LOCALE'],
  pseudoLocale: 'pseudo-LOCALE',
  fallbackLocales: {
    'pseudo-LOCALE': 'en',
  },
  sourceLocale: 'en',
  catalogs: [],
  rootDir: 'src',
  experimental: {
    extractor: {
      entries: ['<rootDir>/index.ts', '<rootDir>/b2b/index.ts', '<rootDir>/adminPortal/index.ts'],
      output: 'messages/{entryDir}/{locale}',
    },
  },
  format: formatter({
    explicitIdAsDefault: true,
    origins: false,
    // hardcode the creation date to avoid spurious changes whenever it's updated
    customHeaderAttributes: { 'POT-Creation-Date': '2025-05-07 12:59-0400' },
  }),
  // 'ts' option will output TS but it's just the JSON output wrapped in JSON.parse so the output is bigger without any real benefit
  compileNamespace: 'json',
  orderBy: 'messageId',
});
