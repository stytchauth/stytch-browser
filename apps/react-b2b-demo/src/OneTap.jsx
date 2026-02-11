import React from 'react';
import { StytchB2B } from '@stytch/react/b2b';
import { B2BProducts, AuthFlowType, B2BOAuthProviders } from '@stytch/vanilla-js/b2b';

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
    />
  );
};

export default OneTap;
