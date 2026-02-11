const config = {
  preset: 'ts-jest',
  testEnvironment: '@stytch/jest-environment',
  collectCoverage: true,
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
