import { defineConfig } from 'eslint/config';

const OFF = 0;

export default defineConfig([
  {
    rules: {
      'react/prop-types': OFF,
    },
  },
]);
