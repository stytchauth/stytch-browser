const config = {
  preset: '@stytch/internal-jest-config/web',
  setupFilesAfterEnv: ['./jest.setup.js'],
  moduleNameMapper: {
    '^react$': 'preact/compat',
    '^react-dom/test-utils$': 'preact/test-utils',
    '^react-dom$': 'preact/compat',
    '^react/jsx-runtime$': 'preact/jsx-runtime',

    // Tests use @testing-library/react in code for types, and @testing-library/preact at runtime
    // because that's the actual runtime when the tests are running
    '^@testing-library/react$': '@testing-library/preact',
  },
};

module.exports = config;
