import { B2BIdentityProvider, createStytchB2BClient, StytchB2BProvider } from '@stytch/react/b2b';

const stytch = createStytchB2BClient('');

export const app = (
  <StytchB2BProvider stytch={stytch}>
    <B2BIdentityProvider />
  </StytchB2BProvider>
);

/* eslint-disable no-console */
// Side effect needed to avoid Vite from aggressively tree shaking most of this away
console.log(app);
