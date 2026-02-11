const config = {
  preset: 'react-native',
  transform: {
    '^.+\\.jsx?$': 'babel-jest',
    // WARNING: This does NOT use the Babel preset, which means jest.mock() calls are NOT hoisted.
    // TODO: Swapping this for the recommended config will break a lot of jest.mock calls which to be fair
    //       we are probably not doing correctly since they violate hoisting rules
    // https://jestjs.io/docs/es6-class-mocks#calling-jestmock-with-the-module-factory-parameter
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: 'tsconfig.spec.json' }],
  },
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.*'],
};

module.exports = config;
