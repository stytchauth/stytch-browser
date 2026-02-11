// eslint-disable-next-line @typescript-eslint/no-require-imports
const { TextEncoder } = require('util');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const crypto = require('crypto');

/**
 * TextEncoder and crypto are used for PKCE - so the PKCEClient
 * and all tests that depend on it (Today: OAuth, Magic Links. Tomorrow: ?)
 */
Object.defineProperty(global.self, 'TextEncoder', {
  value: TextEncoder,
});

Object.defineProperty(global.self, 'crypto', {
  value: {
    getRandomValues: function (buffer) {
      // By ensuring getRandomValues always sets the buffer to a known value (all zeros)
      // we ensure that all crypto operations we do that depend on grv
      // will have a consistent result
      return buffer.fill(0);
    },
    subtle: crypto.webcrypto.subtle,
  },
});

/**
 * We're using react-hot-toast for our Snackbar component. It uses window.matchMedia
 * which isn't implemented in JSDOM. This is Jest's reccomendation from their docs:
 * https://jestjs.io/docs/manual-mocks#mocking-methods-which-are-not-implemented-in-jsdom
 */

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});
