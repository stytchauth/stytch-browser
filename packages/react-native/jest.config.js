const config = {
  preset: 'react-native',
  transform: {
    '^.+\\.jsx?$': 'babel-jest',
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: 'tsconfig.spec.json' }],
  },
  testEnvironment: '@stytch/jest-environment',
  moduleDirectories: ['node_modules', '<rootDir>/node_modules', __dirname],
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.*'],
};

module.exports = config;
