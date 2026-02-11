import '../styles/globals.css';

import { createStytchClient, StytchProvider } from '@stytch/nextjs';
import React from 'react';

const stytch = createStytchClient(process.env.NEXT_PUBLIC_STYTCH_PUBLIC_TOKEN, {
  cookieOptions: {
    jwtCookieName: `stytch_session_jwt_demo_app`,
    opaqueTokenCookieName: `stytch_session_demo_app`,
  },
  dfpCdnDomain: process.env.NEXT_PUBLIC_DFP_CDN_DOMAIN,
  endpoints: {
    testAPIURL: process.env.NEXT_PUBLIC_TEST_API_URL,
    liveAPIURL: process.env.NEXT_PUBLIC_LIVE_API_URL,
    dfpBackendURL: process.env.NEXT_PUBLIC_DFP_BACKEND_URL,
    clientsideServicesIframeURL: process.env.NEXT_PUBLIC_CLIENTSIDE_SERVICES_IFRAME_URL,
  },
});

function MyApp({ Component, pageProps }) {
  return (
    <StytchProvider stytch={stytch}>
      <Component {...pageProps} />
    </StytchProvider>
  );
}

export default MyApp;
