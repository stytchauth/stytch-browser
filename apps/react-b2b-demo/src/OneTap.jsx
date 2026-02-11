import { AuthFlowType, B2BOAuthProviders, B2BProducts, StytchB2B } from '@stytch/react/b2b';
import React from 'react';

import { presentation } from './configuration.js';

const OneTap = () => {
  return (
    <StytchB2B
      config={{
        products: [B2BProducts.oauth],
        sessionOptions: { sessionDurationMinutes: 60 },
        authFlowType: AuthFlowType.Discovery,
        oauthOptions: {
          discoveryRedirectURL: window.location.origin + '/authenticate',
          providers: [{ type: B2BOAuthProviders.Google, one_tap: true }],
        },
      }}
      presentation={presentation}
    />
  );
};

export default OneTap;
