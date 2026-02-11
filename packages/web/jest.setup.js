const { TextEncoder } = require('util');

const crypto = require('crypto');

const noop = () => {
  // noop
};

/**
 * TextEncoder and crypto are used for PKCE - so the PKCEClient
 * and all tests that depend on it (Today: OAuth, Magic Links. Tomorrow: ?)
 */
Object.defineProperty(globalThis, 'TextEncoder', {
  value: TextEncoder,
});

Object.defineProperty(globalThis, 'crypto', {
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
 * This is Jest's recommendation from their docs for a matchMedia mock
 * https://jestjs.io/docs/manual-mocks#mocking-methods-which-are-not-implemented-in-jsdom
 */

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: noop, // deprecated
    removeListener: noop, // deprecated
    addEventListener: noop,
    removeEventListener: noop,
    dispatchEvent: noop,
  }),
});

/**
 * ResizeObserver is used by input-otp package but isn't implemented in JSDOM.
 * This mock provides a minimal implementation for testing.
 */
global.ResizeObserver ??= class {
  observe = noop;
  unobserve = noop;
  disconnect = noop;
};

/**
 * document.elementFromPoint is used by input-otp package but isn't implemented in JSDOM.
 * This mock provides a minimal implementation for testing.
 */
Object.defineProperty(document, 'elementFromPoint', {
  writable: true,
  value: () => null,
});

/**
 * Used by toasts and other things to run animations. We don't need to actually need to animate anything
 * in tests so making this a noop is fine
 */
Object.defineProperty(window.Element.prototype, 'animate', {
  value: noop,
});
