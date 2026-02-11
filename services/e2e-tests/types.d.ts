declare namespace Cypress {
  type CustomWindow = AUTWindow & {
    stytch: import('@stytch/vanilla-js').StytchUIClient;
  };

  interface Chainable {
    window(): Chainable<CustomWindow>;
  }
}
