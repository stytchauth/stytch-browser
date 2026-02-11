const { defineConfig } = require('eslint/config');

const OFF = 0;

module.exports = defineConfig([
  {
    rules: {
      'react/prop-types': OFF,
    },
  },
]);
