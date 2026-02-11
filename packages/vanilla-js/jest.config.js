// Sync object
const config = {
  testEnvironment: '@stytch/jest-environment',
  testEnvironmentOptions: {
    customExportConditions: [], // fixes unexpected token 'export' when running Jest
  },
  moduleDirectories: ['node_modules', '<rootDir>/node_modules', __dirname],
  setupFilesAfterEnv: ['./jest.setup.js'],
  moduleNameMapper: {
    '^react$': '<rootDir>/node_modules/preact/compat',
    '^react-dom/test-utils$': '<rootDir>/node_modules/preact/test-utils',
    '^react-dom$': '<rootDir>/node_modules/preact/compat',
    '^react/jsx-runtime$': '<rootDir>/node_modules/preact/jsx-runtime',
  },
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.*'],
  transform: {
    '^.+\\.tsx?$': [
      'babel-jest',
      {
        plugins: ['@lingui/babel-plugin-lingui-macro'],
        presets: [
          ['@babel/preset-env', { loose: true, targets: { node: 'current' } }],
          '@babel/preset-react',
          '@babel/preset-typescript',
        ],
      },
    ],
  },
  // prettier v3 is not supported, so disable it
  // https://jestjs.io/docs/configuration/#prettierpath-string
  prettierPath: null,
};

module.exports = config;
