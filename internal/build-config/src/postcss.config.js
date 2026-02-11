import postcssPresetEnv from 'postcss-preset-env';

/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: [
    postcssPresetEnv({
      preserve: true,
      browsers: 'chrome >= 109, firefox >= 106, safari >= 16',
    }),
  ],
};

export default config;
