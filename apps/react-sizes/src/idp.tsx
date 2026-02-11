import { createStytchClient, IdentityProvider, StytchProvider } from '@stytch/react';

const stytch = createStytchClient('');

export const app = (
  <StytchProvider stytch={stytch}>
    <IdentityProvider />
  </StytchProvider>
);

/* eslint-disable no-console */
// Side effect needed to avoid Vite from aggressively tree shaking most of this away
console.log(app);
