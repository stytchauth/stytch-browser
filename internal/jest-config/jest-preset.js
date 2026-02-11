const { createDefaultPreset } = require('ts-jest');

// This is the base Jest config preset, used for non-web packages
// Usage: Specify { preset: '@stytch/internal-jest-config' } in jest.config.js
// For web packages, use '@stytch/internal-jest-config/web'

/** @type {import('@jest/types').Config.InitialOptions} */
const config = {
  ...createDefaultPreset(),
  testEnvironment: '@stytch/jest-environment',

  collectCoverage: true,
  collectCoverageFrom: ['<rootDir>/src/**/*.*'],

  // Resolve dependencies from both the current and root node_modules
  moduleDirectories: ['node_modules', '<rootDir>/../../node_modules'],
  moduleNameMapper: {
    // For CSS modules
    '\\.css$': 'identity-obj-proxy',
  },
};

module.exports = config;
