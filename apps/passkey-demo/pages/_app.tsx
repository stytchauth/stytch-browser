import React from 'react';
import { Box } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { StytchProvider } from '@stytch/nextjs';
import { createStytchUIClient } from '@stytch/nextjs/ui';
import { StytchClientOptions } from '@stytch/vanilla-js';
import type { AppProps } from 'next/app';
import '../styles/globals.css';

const stytchClientOptions = {
  cookieOptions: {
    jwtCookieName: `stytch_session_passkey_demo_jwt`,
    opaqueTokenCookieName: `stytch_session_passkey_demo`,
  },
  dfpCdnDomain: process.env.NEXT_PUBLIC_DFP_CDN_DOMAIN,
  endpoints: {
    testAPIURL: process.env.NEXT_PUBLIC_TEST_API_URL,
    liveAPIURL: process.env.NEXT_PUBLIC_LIVE_API_URL,
    dfpBackendURL: process.env.NEXT_PUBLIC_DFP_BACKEND_URL,
    clientsideServicesIframeURL: process.env.NEXT_PUBLIC_CLIENTSIDE_SERVICES_IFRAME_URL,
  },
} as StytchClientOptions;

const theme = createTheme({
  typography: {
    allVariants: {
      fontFamily: "'IBM Plex Sans', sans-serif;",
      textTransform: 'none',
    },
    h1: {
      fontSize: 40,
      lineHeight: '60px',
      fontWeight: 500,
    },
    h2: {
      fontSize: 30,
      lineHeight: '40px',
      fontWeight: 500,
    },
    h3: {
      fontSize: 24,
      lineHeight: '30px',
      fontWeight: 500,
    },
    caption: {
      fontSize: 16,
      lineHeight: '20px',
    },
    body1: {
      fontSize: 18,
      lineHeight: '25px',
    },
  },
});

function MyApp({ Component, pageProps }: AppProps) {
  const stytch = createStytchUIClient(process.env.NEXT_PUBLIC_STYTCH_PUBLIC_TOKEN as string, stytchClientOptions);

  return (
    <>
      <StytchProvider stytch={stytch}>
        <ThemeProvider theme={theme}>
          <Component {...pageProps} />
          <Box position={'absolute'} bottom={0} right={0} margin={2} width={'90%'} maxWidth={'800px'}></Box>
        </ThemeProvider>
      </StytchProvider>
    </>
  );
}

export default MyApp;
