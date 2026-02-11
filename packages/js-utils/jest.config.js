// Sync object
const config = {
  preset: 'ts-jest',
  testEnvironment: '@stytch/jest-environment',
  moduleDirectories: ['node_modules', '<rootDir>/node_modules', __dirname],
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.*'],
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
