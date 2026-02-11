import React, { useState } from 'react';
import { StytchB2B } from '@stytch/react/b2b';
import { B2BProducts, AuthFlowType, B2BOAuthProviders } from '@stytch/vanilla-js/b2b';
import { useParams } from 'react-router-dom';
import { useB2BStrings } from './useStrings';

const Org = () => {
  const queryString = window.location.search;

  const { slug: slugParam } = useParams();
  const [organizationSlug, setOrganizationSlug] = useState();

  const urlParams = new URLSearchParams(queryString);
  const passwordOnly = urlParams.get('password-only');

  const strings = useB2BStrings();

  if (!slugParam && organizationSlug === undefined) {
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setOrganizationSlug(e.target.slug.value);
        }}
      >
        <div>
          <label htmlFor="slug">
            Organization Slug: <input type="text" name="slug" />
          </label>
        </div>
        <button type="submit">Show org login</button>
        <p>
          <button type="button" onClick={() => setOrganizationSlug(null)}>
            Show UI with null slug (error)
          </button>
        </p>
      </form>
    );
  }

  if (passwordOnly === 'true' || passwordOnly === '1') {
    return (
      <StytchB2B
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
