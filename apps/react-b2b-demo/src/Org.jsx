import { AuthFlowType, B2BOAuthProviders, B2BProducts, StytchB2B } from '@stytch/react/b2b';
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { presentation } from './configuration.js';
import { useB2BStrings } from './useStrings';

const Org = () => {
  const queryString = window.location.search;

  const { slug: slugParam } = useParams();
  const navigate = useNavigate();
  const [forceShow, setForceShow] = useState(false);

  const urlParams = new URLSearchParams(queryString);
  const passwordOnly = urlParams.get('password-only');

  const strings = useB2BStrings();

  if (!forceShow && (!slugParam || slugParam === ':slug')) {
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          navigate('/org/' + e.target.slug.value);
        }}
      >
        <div>
          <label>
            Organization Slug: <input type="text" name="slug" />
          </label>
        </div>
        <button type="submit">Show org login</button>
        <p>
          <button
            type="button"
            onClick={() => {
              setForceShow(true);
            }}
          >
            Show UI with null slug (error)
          </button>
        </p>
      </form>
    );
  }

  const organizationSlug = slugParam;

  if (passwordOnly === 'true' || passwordOnly === '1') {
    return (
      <StytchB2B
        key={organizationSlug}
        config={{
          products: [B2BProducts.passwords],
          sessionOptions: { sessionDurationMinutes: 60 },
          authFlowType: AuthFlowType.Discovery,
          passwordOptions: {
            loginRedirectURL: window.location.origin + '/authenticate',
            resetPasswordRedirectURL: window.location.origin + '/passwords/reset',
            resetPasswordExpirationMinutes: 60,
          },
          organizationSlug,
        }}
        strings={strings}
        presentation={presentation}
      />
    );
  }

  return (
    <StytchB2B
      config={{
        products: [
          B2BProducts.emailMagicLinks,
          B2BProducts.emailOtp,
          B2BProducts.passwords,
          B2BProducts.oauth,
          B2BProducts.sso,
        ],
        sessionOptions: {
          sessionDurationMinutes: 60,
        },
        authFlowType: AuthFlowType.Organization,
        oauthOptions: {
          loginRedirectURL: window.location.origin + '/authenticate',
          signupRedirectURL: window.location.origin + '/authenticate',
          providers: [
            { type: B2BOAuthProviders.Google, one_tap: true, providerParams: { prompt: 'select_account' } },
            { type: B2BOAuthProviders.Microsoft },
            { type: B2BOAuthProviders.HubSpot },
            { type: B2BOAuthProviders.Slack },
            { type: B2BOAuthProviders.GitHub },
          ],
        },
        ssoOptions: {
          loginRedirectURL: window.location.origin + '/authenticate',
          signupRedirectURL: window.location.origin + '/authenticate',
        },
        emailMagicLinksOptions: {
          loginRedirectURL: window.location.origin + '/authenticate',
          signupRedirectURL: window.location.origin + '/authenticate',
        },
        passwordOptions: {
          loginRedirectURL: window.location.origin + '/authenticate',
          resetPasswordRedirectURL: window.location.origin + '/passwords/reset',
          resetPasswordExpirationMinutes: 60,
        },
        organizationSlug,
      }}
      presentation={presentation}
      callbacks={{
        onError: (error) => {
          // eslint-disable-next-line no-console
          console.log(error);
        },
        onEvent: (event) => {
          // eslint-disable-next-line no-console
          console.log(event);
        },
      }}
      strings={strings}
    />
  );
};

export default Org;
