import {
  AuthFlowType,
  B2BProducts,
  createStytchB2BClient,
  StytchB2B,
  StytchB2BProvider,
  type StytchB2BUIConfig,
} from '@stytch/react/b2b';

const stytch = createStytchB2BClient('');

const config: StytchB2BUIConfig = {
  authFlowType: AuthFlowType.Discovery,
  sessionOptions: { sessionDurationMinutes: 60 },
  products: [B2BProducts.emailMagicLinks],
};

export const app = (
  <StytchB2BProvider stytch={stytch}>
    <StytchB2B config={config} />
  </StytchB2BProvider>
);

/* eslint-disable no-console */
// Side effect needed to avoid Vite from aggressively tree shaking most of this away
console.log(app);
