import './index.css';

import { createStytchB2BClient, StytchB2BProvider } from '@stytch/react/b2b';
import React from 'react';
import ReactDOM from 'react-dom/client';

import { App } from './App';
import { configuration } from './configuration';

const STYTCH_PUBLIC_TOKEN = configuration.stytchPublicToken.value;

const getDomainFromURL = (url) => {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
};

const stytch = createStytchB2BClient(STYTCH_PUBLIC_TOKEN, {
  cookieOptions: {
    jwtCookieName: `stytch_session_jwt_demo_b2b_app`,
    opaqueTokenCookieName: `stytch_session_demo_b2b_app`,
  },

  dfpCdnDomain: getDomainFromURL(configuration.dfpCdnDomain.value),
  endpoints: {
    testAPIURL: configuration.testAPIURL.value,
    liveAPIURL: configuration.liveAPIURL.value,
    dfpBackendURL: configuration.dfpBackendURL.value,
    clientsideServicesIframeURL: configuration.clientsideServicesIframeURL.value,
  },
});

window.stytch = stytch;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <StytchB2BProvider stytch={stytch}>
      <App />
    </StytchB2BProvider>
  </React.StrictMode>,
);
