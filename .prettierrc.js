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
  ],
};
