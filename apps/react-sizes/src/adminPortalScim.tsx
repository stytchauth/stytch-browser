import { createStytchB2BClient, StytchB2BProvider } from '@stytch/react/b2b';
import { AdminPortalSCIM } from '@stytch/react/b2b/adminPortal';

const styles = { fontFamily: 'Arial' };

const stytch = createStytchB2BClient('');

export const app = (
  <StytchB2BProvider stytch={stytch}>
    <AdminPortalSCIM styles={styles} />
  </StytchB2BProvider>
);

/* eslint-disable no-console */
// Side effect needed to avoid Vite from aggressively tree shaking most of this away
console.log(app);
