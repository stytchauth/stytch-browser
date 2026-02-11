import { logger, RBACPolicyRaw } from '@stytch/core';
import {
  Callbacks,
  ConnectedAppPublic,
  IDPOAuthFlowMissingParamError,
  NoCurrentSessionError,
  StytchAPIError,
} from '@stytch/core/public';
import { MOCK_USER } from '@stytch/internal-mocks';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { MOCK_OAUTH_AUTHORIZE_SUBMIT_RESPONSE } from '../../../.storybook/handlers';
import { MockClient, MockGlobalContextProvider, render, screen, waitFor } from '../../testUtils';
import { IDPConsentManifestGenerator } from '../../types';
import * as internals from '../../utils/internal';
import { B2CInternals } from '../../utils/internal';
import { IDPConsentScreen } from '../b2c/screens/IdentityProvider/IDPConsent';
import { IDPContextProvider } from '../components/organisms/IDPContextProvider';

const MOCK_CONNECTED_APP_CLIENT: ConnectedAppPublic = {
  client_id: 'mock-client-123',
  client_type: 'first_party',
  client_name: 'Sample Application',
  client_description: 'Some sample demo app/client for the tests',
};

const urlParams = {
  client_id: MOCK_CONNECTED_APP_CLIENT.client_id,
  redirect_uri: 'https://oauthdebugger.com/debug',
  scopes: ['openid', 'email', 'profile'],
  response_type: 'code',
  code_challenge: '-H0VY4_ZQvwA_NvG8krrkEdzeB5J-4R-9DkHzQ6KaUA',
  state: '931g8tkpvgv',
  nonce: 'uiv1hs2sk2p',
};

const rbacPolicy: RBACPolicyRaw = {
  roles: [],
  scopes: [
    { scope: 'admin', description: 'Administer your data', permissions: [] },
    { scope: 'reader', description: 'Read your data', permissions: [] },
  ],
  resources: [],
};

describe('IDP Consent Flow', () => {
  // This is a temporary fix to stop tests in Github actions from failing. See https://github.com/facebook/jest/issues/12670.
  jest.setTimeout(10000);

  const callbacks: Callbacks = {
    onEvent: jest.fn(),
    onError: jest.fn(),
  };

  const renderIDPApp = ({
    logged_in = true,
    generator,
    withAuthParams = false,
  }: { logged_in?: boolean; generator?: IDPConsentManifestGenerator; withAuthParams?: boolean } = {}) => {
    const client: MockClient = {
      onStateChange: jest.fn(),
      user: {
        getSync: jest.fn().mockReturnValue(logged_in ? MOCK_USER : null),
      },
      session: {
        attest: attestTrustedTokenSpy,
        revoke: revokeSessionSpy,
        updateSession: jest.fn(),
      },
      idp: {
        oauthAuthorizeStart: oauthAuthorizeStartSpy,
        oauthAuthorizeSubmit: oauthAuthorizeSubmit,
        oauthLogoutStart: jest.fn(),
      },
    };

    const authTokenParams = withAuthParams
      ? {
          trustedAuthToken: 'trusted-auth-token-123',
          tokenProfileID: 'profile-id-456',
        }
      : undefined;

    return render(
      <MockGlobalContextProvider client={client} callbacks={callbacks}>
        <IDPContextProvider consentManifestGenerator={generator} authTokenParams={authTokenParams}>
          <IDPConsentScreen />
        </IDPContextProvider>
      </MockGlobalContextProvider>,
    );
  };

  beforeEach(() => {
    const params = new URLSearchParams({ ...urlParams, scopes: urlParams.scopes.join(' ') });
    const url = `https://example.com?${params}`;
    jsdom.reconfigure({ url });

    // Silence warnings and not implemented errors in jsdom. TODO: There's probably a better way to do this?
    jest.spyOn(logger, 'warn');
    jest.spyOn(console, 'error');
  });

  const oauthAuthorizeStartSpy = jest.fn();
  const oauthAuthorizeSubmit = jest.fn();
  const attestTrustedTokenSpy = jest.fn();
  const revokeSessionSpy = jest.fn();

  beforeEach(() => {
    oauthAuthorizeSubmit.mockResolvedValueOnce(MOCK_OAUTH_AUTHORIZE_SUBMIT_RESPONSE);

    const mockReadInternals = jest.spyOn(internals, 'readB2CInternals');
    mockReadInternals.mockImplementation(
      () =>
        ({
          bootstrap: {
            getSync: jest.fn().mockReturnValue({ projectName: 'Test Project', rbacPolicy }),
            getAsync: jest.fn().mockResolvedValue({ projectName: 'Test Project', rbacPolicy }),
          },
        }) as unknown as B2CInternals,
    );
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  const expectOAuthAuthorizeFlowStartEvent = () =>
    expect(callbacks.onEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'OAUTH_AUTHORIZE_FLOW_START',
        data: {
          client_id: 'mock-client-123',
          redirect_uri: 'https://oauthdebugger.com/debug',
          scope: 'openid email profile',
        },
      }),
    );

  const expectOAuthAuthorizeFlowCompleteEvent = () =>
    expect(callbacks.onEvent).toHaveBeenCalledWith(expect.objectContaining({ type: 'OAUTH_AUTHORIZE_FLOW_COMPLETE' }));

  it('Error on no user in session', async () => {
    renderIDPApp({ logged_in: false });
    await screen.findByText('No active session detected. Please log in to continue.');
    expect(callbacks.onError).toHaveBeenCalledWith(expect.any(NoCurrentSessionError));
    expect(callbacks.onEvent).not.toHaveBeenCalled();
  });

  it('Error on missing required fields', async () => {
    jsdom.reconfigure({ url: 'https://example.com' });
    renderIDPApp();

    await screen.findByText('Required parameter is missing: client_id. Please reach out to the application developer.');
    expect(callbacks.onError).toHaveBeenCalledWith(expect.any(IDPOAuthFlowMissingParamError));
    expect(callbacks.onEvent).not.toHaveBeenCalled();
  });

  it('Success when all provided fields are present and auto-submit can occur', async () => {
    oauthAuthorizeStartSpy.mockResolvedValueOnce({ consent_required: false });
    renderIDPApp();

    await screen.findByText('Success!');

    expect(oauthAuthorizeSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        ...urlParams,
        consent_granted: false,
      }),
    );

    expectOAuthAuthorizeFlowStartEvent();
    expectOAuthAuthorizeFlowCompleteEvent();
  });

  it('Shows consent screen when required and submits on Allow', async () => {
    oauthAuthorizeStartSpy.mockResolvedValueOnce({
      consent_required: true,
      client: MOCK_CONNECTED_APP_CLIENT,
      scope_results: [
        { scope: 'openid', is_grantable: true, description: 'OpenID' },
        { scope: 'email', is_grantable: true, description: 'Email' },
        { scope: 'profile', is_grantable: true, description: 'Profile' },
      ],
    });
    renderIDPApp();

    await screen.findByText('Sign in to Sample Application with Test Project');

    expectOAuthAuthorizeFlowStartEvent();

    await userEvent.click(screen.getByRole('button', { name: 'Allow' }));

    await screen.findByText('Success!');

    expect(oauthAuthorizeSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        ...urlParams,
        consent_granted: true,
      }),
    );
    expectOAuthAuthorizeFlowCompleteEvent();
  });

  it('Shows consent screen when required and submits on Deny', async () => {
    oauthAuthorizeStartSpy.mockResolvedValueOnce({
      consent_required: true,
      client: MOCK_CONNECTED_APP_CLIENT,
      scope_results: [
        { scope: 'openid', is_grantable: true, description: 'OpenID' },
        { scope: 'email', is_grantable: true, description: 'Email' },
        { scope: 'profile', is_grantable: true, description: 'Profile' },
      ],
    });
    renderIDPApp();

    await screen.findByText('Sign in to Sample Application with Test Project');

    expectOAuthAuthorizeFlowStartEvent();

    await userEvent.click(screen.getByRole('button', { name: 'Deny' }));

    await screen.findByText('Access to the application was denied.');

    expect(oauthAuthorizeSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        ...urlParams,
        consent_granted: false,
      }),
    );

    expect(callbacks.onEvent).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'OAUTH_AUTHORIZE_FLOW_CONSENT_DENIED' }),
    );
  });

  it('Shows an error when Authorize Start fails', async () => {
    oauthAuthorizeStartSpy.mockRejectedValueOnce(
      new StytchAPIError({
        error_message: 'Client not allowed around these parts no more',
        error_type: 'client_not_allowed',
        error_url: 'https://stytch.com',
        status_code: 400,
        request_id: 'request-id-123',
      }),
    );
    renderIDPApp();

    expectOAuthAuthorizeFlowStartEvent();

    await screen.findByText('Looks like there was an error!');
    expect(callbacks.onError).toHaveBeenCalledWith(expect.any(StytchAPIError));
  });

  it('Renders ungrantable scope section when ungrantable scopes are present', async () => {
    oauthAuthorizeStartSpy.mockResolvedValueOnce({
      consent_required: true,
      client: MOCK_CONNECTED_APP_CLIENT,
      scope_results: [
        { scope: 'openid', is_grantable: true, description: 'OpenID' },
        { scope: 'email', is_grantable: true, description: 'Email' },
        { scope: 'profile', is_grantable: true, description: 'Profile' },
        { scope: 'admin', is_grantable: false, description: 'Administer your data' },
      ],
    });
    renderIDPApp();

    await screen.findByText(
      'You do not have permissions to grant Sample Application access to some of the requested scopes.',
    );
    await screen.findByText('Administer your data');
  });

  it('Renders custom scopes automatically', async () => {
    oauthAuthorizeStartSpy.mockResolvedValueOnce({
      consent_required: true,
      client: MOCK_CONNECTED_APP_CLIENT,
      scope_results: [
        { scope: 'openid', is_grantable: true, description: 'OpenID' },
        { scope: 'email', is_grantable: true, description: 'Email' },
        { scope: 'profile', is_grantable: true, description: 'Profile' },
        { scope: 'reader', is_grantable: true, description: 'Read your data' },
      ],
    });
    renderIDPApp();

    await screen.findByText('Read your data');
  });

  it('Support custom generator renderer', async () => {
    oauthAuthorizeStartSpy.mockResolvedValueOnce({
      consent_required: true,
      client: MOCK_CONNECTED_APP_CLIENT,
      scope_results: [
        { scope: 'openid', is_grantable: true, description: 'OpenID' },
        { scope: 'email', is_grantable: true, description: 'Email' },
        { scope: 'profile', is_grantable: true, description: 'Profile' },
        { scope: 'reader', is_grantable: true, description: 'Read your data' },
      ],
    });
    renderIDPApp({
      generator: ({ scopes, clientName }) => {
        return scopes.map((scope) => `${clientName} DEMANDS ${scope}`);
      },
    });

    await screen.findByText('Sample Application DEMANDS openid');
    await screen.findByText('Sample Application DEMANDS email');
    await screen.findByText('Sample Application DEMANDS profile');
    await screen.findByText('Sample Application DEMANDS reader');
  });

  describe('Trusted Auth Token', () => {
    beforeEach(() => {
      oauthAuthorizeStartSpy.mockResolvedValue({
        consent_required: true,
        client: MOCK_CONNECTED_APP_CLIENT,
        scope_results: [
          { scope: 'openid', is_grantable: true, description: 'OpenID' },
          { scope: 'email', is_grantable: true, description: 'Email' },
          { scope: 'profile', is_grantable: true, description: 'Profile' },
        ],
      });
    });

    it('Successfully verifies trusted auth token and continues OAuth flow', async () => {
      attestTrustedTokenSpy.mockResolvedValueOnce({
        status_code: 200,
        session: {
          session_token: 'new-session-token-123',
          session_jwt: 'new-session-jwt-456',
        },
      });

      oauthAuthorizeStartSpy.mockResolvedValueOnce({
        consent_required: true,
        client: MOCK_CONNECTED_APP_CLIENT,
        scope_results: [
          { scope: 'openid', is_grantable: true, description: 'OpenID' },
          { scope: 'email', is_grantable: true, description: 'Email' },
          { scope: 'profile', is_grantable: true, description: 'Profile' },
        ],
      });

      renderIDPApp({ withAuthParams: true });

      // Should show consent screen
      await screen.findByText('Sign in to Sample Application with Test Project');

      // Click Allow to trigger attestTrustedToken
      await userEvent.click(screen.getByRole('button', { name: 'Allow' }));

      // Should call attest
      expect(attestTrustedTokenSpy).toHaveBeenCalled();

      // Should continue with OAuth flow
      await screen.findByText('Success!');
    });

    it('Fails OAuth flow when trusted auth token verification fails without active session', async () => {
      attestTrustedTokenSpy.mockRejectedValueOnce(
        new StytchAPIError({
          error_message: 'Invalid trusted auth token',
          error_type: 'invalid_trusted_auth_token',
          status_code: 400,
          request_id: 'request-id-123',
          error_url: 'https://example.com/error',
        }),
      );

      renderIDPApp({ withAuthParams: true, logged_in: false });

      // Should call attestTrustedToken (which will fail)
      await waitFor(() => expect(attestTrustedTokenSpy).toHaveBeenCalled());
      await waitFor(() => expect(revokeSessionSpy).not.toHaveBeenCalled());

      // Should show error
      await screen.findByText('No active session detected. Please log in to continue.');
      await waitFor(() => expect(callbacks.onError).toHaveBeenCalledWith(expect.any(StytchAPIError)));
    });

    it('Fails OAuth flow when trusted auth token verification fails with active session', async () => {
      attestTrustedTokenSpy.mockRejectedValueOnce(
        new StytchAPIError({
          error_message: 'Invalid trusted auth token',
          error_type: 'invalid_trusted_auth_token',
          status_code: 400,
          request_id: 'request-id-123',
          error_url: 'https://example.com/error',
        }),
      );

      renderIDPApp({ withAuthParams: true, logged_in: true });

      // Should call attestTrustedToken (which will fail)
      await waitFor(() => expect(attestTrustedTokenSpy).toHaveBeenCalled());
      await waitFor(() => expect(revokeSessionSpy).toHaveBeenCalled());

      // Should surface error via onError callback (UI may still render children due to mocked user)
      await waitFor(() => expect(callbacks.onError).toHaveBeenCalledWith(expect.any(StytchAPIError)));
    });

    it('Continues OAuth flow when trusted auth token parameters are not provided', async () => {
      oauthAuthorizeStartSpy.mockResolvedValueOnce({
        consent_required: true,
        client: MOCK_CONNECTED_APP_CLIENT,
        scope_results: [
          { scope: 'openid', is_grantable: true, description: 'OpenID' },
          { scope: 'email', is_grantable: true, description: 'Email' },
          { scope: 'profile', is_grantable: true, description: 'Profile' },
        ],
      });

      renderIDPApp();

      // Should not call attest
      expect(attestTrustedTokenSpy).not.toHaveBeenCalled();

      // Should continue with normal OAuth flow
      await screen.findByText('Sign in to Sample Application with Test Project');
    });
  });
});
