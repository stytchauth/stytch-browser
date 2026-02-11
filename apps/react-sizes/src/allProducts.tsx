import { createStytchClient, StytchLogin, StytchProvider } from '@stytch/react';
import { Products, type StytchLoginConfig } from '@stytch/react';

const stytch = createStytchClient('');

const config: StytchLoginConfig = {
  products: Object.values(Products),
};

export const app = (
  <StytchProvider stytch={stytch}>
    <StytchLogin config={config} />
  </StytchProvider>
);

/* eslint-disable no-console */
// Side effect needed to avoid Vite from aggressively tree shaking most of this away
console.log(app);
