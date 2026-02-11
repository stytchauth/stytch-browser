module.exports = {
  singleQuote: true,
  printWidth: 120,
  overrides: [
    {
      files: '.cursor/**/*.mdc',
      options: {
        parser: 'markdown',
      },
    },
    {
      files: '*.svelte',
      options: { parser: 'svelte' },
    },
  ],
  plugins: ['prettier-plugin-svelte'],
};
