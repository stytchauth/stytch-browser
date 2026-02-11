'use client';

// This is not the correct way to config client but this is useful for the demo app
// for testing and overrides
import type { InternalStytchClientOptions } from '@stytch/core';
import { createStytchClient, StytchProvider } from '@stytch/nextjs';

const config: InternalStytchClientOptions = {
  cookieOptions: {
    jwtCookieName: `stytch_session_jwt_demo_app`,
    opaqueTokenCookieName: `stytch_session_demo_app`,
  },
  dfpCdnUrl: process.env.NEXT_PUBLIC_DFP_CDN_DOMAIN,
  endpoints: {
    testAPIURL: process.env.NEXT_PUBLIC_TEST_API_URL!,
    liveAPIURL: process.env.NEXT_PUBLIC_LIVE_API_URL!,
    dfpBackendURL: process.env.NEXT_PUBLIC_DFP_BACKEND_URL!,
    clientsideServicesIframeURL: process.env.NEXT_PUBLIC_CLIENTSIDE_SERVICES_IFRAME_URL!,
  },
};

const stytch = createStytchClient(process.env.NEXT_PUBLIC_STYTCH_PUBLIC_TOKEN!, config);

export const StytchContext = ({ children }: { children: React.ReactNode }) => (
  <StytchProvider stytch={stytch}>{children}</StytchProvider>
);
