import { createStytchClient, Products, StytchLogin, type StytchLoginConfig, StytchProvider } from '@stytch/react';

const stytch = createStytchClient('');

const config: StytchLoginConfig = {
  products: [Products.oauth],
};

export const app = (
  <StytchProvider stytch={stytch}>
    <StytchLogin config={config} />
  </StytchProvider>
);

/* eslint-disable no-console */
// Side effect needed to avoid Vite from aggressively tree shaking most of this away
console.log(app);
