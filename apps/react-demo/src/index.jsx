import './index.css';

import { createStytchClient, StytchProvider } from '@stytch/react';
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

const stytch = createStytchClient(STYTCH_PUBLIC_TOKEN, {
  cookieOptions: {
    jwtCookieName: `stytch_session_jwt_demo_app`,
    opaqueTokenCookieName: `stytch_session_demo_app`,
  },
  dfpCdnDomain: getDomainFromURL(configuration.dfpCdnDomain.value),
  endpoints: {
    liveAPIURL: configuration.liveAPIURL.value,
    testAPIURL: configuration.testAPIURL.value,
    dfpBackendURL: configuration.dfpBackendURL.value,
    clientsideServicesIframeURL: configuration.clientsideServicesIframeURL.value,
  },
});

window.stytch = stytch;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <StytchProvider stytch={stytch}>
      <App />
    </StytchProvider>
  </React.StrictMode>,
);
