// Sync object
const config = {
  preset: 'ts-jest',
  testEnvironment: '@stytch/jest-environment',
  collectCoverage: true,
  moduleDirectories: ['node_modules', '<rootDir>/node_modules', __dirname],
  moduleNameMapper: {
    // TODO: Unsure why this is required
    uuid: '<rootDir>/../../node_modules/uuid/dist/umd/uuid.min.js',
  },
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        // Setting this greatly speeds up test execution time
        // https://stackoverflow.com/questions/45087018/jest-simple-tests-are-slow
        isolatedModules: true,
      },
    ],
  },
};

module.exports = config;
