import { defineConfig } from 'eslint/config';
import customConfig from 'eslint-config-custom';
import { includeIgnoreFile } from '@eslint/compat';
import { fileURLToPath } from 'node:url';

const gitignorePath = fileURLToPath(new URL('.gitignore', import.meta.url));

export default defineConfig([
  // Include .gitignore patterns
  includeIgnoreFile(gitignorePath, '.gitignore'),

  // Base configuration from custom config
  customConfig,

  // Global settings
  {
    settings: {
      next: {
        rootDir: ['apps/*/'],
      },
    },
  },

  // Additional ignore patterns not covered by .gitignore
  {
    ignores: ['**/.next/**', 'Gemfile', '*.podspec'],
  },
]);
