import React from 'react';
import { StytchB2B } from '@stytch/react/b2b';
import { B2BProducts, AuthFlowType, B2BOAuthProviders } from '@stytch/vanilla-js/b2b';
import { useB2BStrings } from './useStrings';

const Discover = () => {
  const strings = useB2BStrings();

  return (
    <StytchB2B
      config={{
        products: [
          B2BProducts.emailMagicLinks,
          B2BProducts.emailOtp,
          B2BProducts.oauth,
          B2BProducts.passwords,
          B2BProducts.sso,
        ],
        sessionOptions: { sessionDurationMinutes: 60 },
        authFlowType: AuthFlowType.Discovery,
        emailMagicLinksOptions: {
          loginRedirectURL: window.location.origin + '/authenticate',
          signupRedirectURL: window.location.origin + '/authenticate',
        },
        oauthOptions: {
          loginRedirectURL: window.location.origin + '/authenticate',
          signupRedirectURL: window.location.origin + '/authenticate',
          discoveryRedirectURL: window.location.origin + '/authenticate',
          providers: [
            B2BOAuthProviders.Microsoft,
            { type: B2BOAuthProviders.Google, one_tap: true },
            B2BOAuthProviders.HubSpot,
            B2BOAuthProviders.Slack,
            B2BOAuthProviders.GitHub,
          ],
        },
        passwordOptions: {
          loginRedirectURL: window.location.origin + '/authenticate',
          resetPasswordRedirectURL: window.location.origin + '/passwords/reset',
          resetPasswordExpirationMinutes: 60,
        },
      }}
      strings={strings}
    />
  );
};

export default Discover;
