const base = require('../jest-preset.js');

// Notes:
// - babel.config.js is a separate file because Jest config must be JSON serializable
//   which means plugins cannot be specified inline. If they were, they would be resolved
//   relative to the package using the Jest config, not this config package, which would
//   require plugins to be re-installed for every package.
// - The lingui plugin still requires there to be a lingui config file at the <rootDir>
//   which is the individual packages using this config. Currently this is done via
//   a symlink to web/lingui.config.ts. Reading the plugin source there might be a way to
//   configure this path directly but I can't get it to work, and we probably want RN packages
//   to be able to configure this separately anyway.
// - The Preact module mapper config is currently duplicated in web and vanilla-js.
//   We can't lift it here since React and Next don't use them, but we might consider
//   switching vanilla-js to use React for everything.

/** @type {import('@jest/types').Config.InitialOptions} */
const config = {
  ...base,

  transformIgnorePatterns: ['/node_modules/(?!(until-async)/)'],

  transform: {
    '^.+\\.[tj]sx?$': [
      'babel-jest',
      {
        extends: __dirname + '/babel.config.js',
      },
    ],
  },
};

module.exports = config;
