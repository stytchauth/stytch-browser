import { logger, RBACPolicyRaw } from '@stytch/core';
import {
  Callbacks,
  ConnectedAppPublic,
  IDPOAuthFlowMissingParamError,
  NoCurrentSessionError,
  StytchAPIError,
  StytchProjectConfigurationInput,
} from '@stytch/core/public';
import { MOCK_MEMBER } from '@stytch/internal-mocks';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { MOCK_OAUTH_AUTHORIZE_SUBMIT_RESPONSE } from '../../../../.storybook/handlers';
import { StytchB2BClient } from '../../../b2b/StytchB2BClient';
import { render, screen, waitFor } from '../../../testUtils';
import { B2BIDPConsentManifestGenerator } from '../../../types';
import * as internals from '../../../utils/internal';
import { B2BInternals, writeB2BInternals } from '../../../utils/internal';
import { IDPConsentScreen } from '../../b2b/screens/IDPConsent';
import { IDPContextProvider } from '../../components/organisms/IDPContextProvider';
import { MockClient, MockGlobalContextProvider } from './helpers';

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

describe('B2B IDP Consent Flow', () => {
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
  }: { logged_in?: boolean; generator?: B2BIDPConsentManifestGenerator; withAuthParams?: boolean } = {}) => {
    const client: MockClient = {
      onStateChange: jest.fn(),
      self: {
        getSync: jest.fn().mockReturnValue(logged_in ? MOCK_MEMBER : null),
      },
      session: {
        attest: attestTrustedTokenSpy,
        revoke: revokeSessionSpy,
        updateSession: jest.fn(),
      },
      idp: {
        oauthAuthorizeStart: oauthAuthorizeStartSpy,
        oauthAuthorizeSubmit: oauthAuthorizeSubmit,
      },
    };

    // Set up B2B internals on the client
    writeB2BInternals(
      client as StytchB2BClient<StytchProjectConfigurationInput>,
      {
        bootstrap: {
          getSync: jest.fn().mockReturnValue({ projectName: 'Test Project', rbacPolicy }),
          getAsync: jest.fn().mockResolvedValue({ projectName: 'Test Project', rbacPolicy }),
        },
      } as unknown as B2BInternals,
    );

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

    const mockReadInternals = jest.spyOn(internals, 'readB2BInternals');
    mockReadInternals.mockImplementation(
      () =>
        ({
          bootstrap: {
            getSync: jest.fn().mockReturnValue({ projectName: 'Test Project', rbacPolicy }),
            getAsync: jest.fn().mockResolvedValue({ projectName: 'Test Project', rbacPolicy }),
          },
        }) as unknown as B2BInternals,
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

  it('Error on no member in session', async () => {
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
    expect(logger.warn).toHaveBeenCalledWith('Unable to parse host from redirect URI.', expect.anything());
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
        { scope: 'admin', is_grantable: false, description: 'Administer your data' },
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
        { scope: 'admin', is_grantable: false, description: 'Administer your data' },
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
      ungrantable_scope: '',
    });
    renderIDPApp();

    await screen.findByText('Read your data');
  });

  it('Renders custom scopes automatically with generator', async () => {
    oauthAuthorizeStartSpy.mockResolvedValueOnce({
      consent_required: true,
      client: MOCK_CONNECTED_APP_CLIENT,
      scope_results: [
        { scope: 'openid', is_grantable: true, description: 'OpenID' },
        { scope: 'email', is_grantable: true, description: 'Email' },
        { scope: 'profile', is_grantable: true, description: 'Profile' },
        { scope: 'reader', is_grantable: true, description: 'Read your data' },
      ],
      ungrantable_scope: '',
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
      oauthAuthorizeSubmit.mockResolvedValueOnce(void 0);
      // Add default mock for oauthAuthorizeStartSpy
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
        member_session: {
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

      renderIDPApp({ logged_in: true, withAuthParams: true });

      // Should show consent screen
      await screen.findByText('Sign in to Sample Application with Test Project');

      // Click Allow to trigger attestTrustedToken
      await userEvent.click(screen.getByRole('button', { name: 'Allow' }));

      // Should call attest with the trusted auth token (no parameters in new implementation)
      expect(attestTrustedTokenSpy).toHaveBeenCalled();

      // Should continue with OAuth flow
      await screen.findByText('Success!');
    });

    it('Fails OAuth flow when trusted auth token verification fails', async () => {
      attestTrustedTokenSpy.mockRejectedValueOnce(
        new StytchAPIError({
          error_message: 'Invalid trusted auth token',
          error_type: 'invalid_trusted_auth_token',
          status_code: 400,
          request_id: 'request-id-123',
          error_url: 'https://example.com/error',
        }),
      );
      revokeSessionSpy.mockResolvedValueOnce({
        status_code: 200,
        request_id: 'request-id-123',
      });

      renderIDPApp({ withAuthParams: true });

      // Should have called revoke and then attestTrustedToken (await async effect ordering)
      await waitFor(() => expect(revokeSessionSpy).toHaveBeenCalled());
      await waitFor(() => expect(attestTrustedTokenSpy).toHaveBeenCalled());

      // Should surface error via onError callback (UI may still render children due to mocked member)
      await waitFor(() => {
        const calls = (callbacks.onError as jest.Mock).mock.calls.map(([err]) => err);
        expect(calls.some((e) => e instanceof StytchAPIError)).toBe(true);
      });
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
      revokeSessionSpy.mockResolvedValueOnce({
        status_code: 200,
        request_id: 'request-id-123',
      });

      renderIDPApp({ withAuthParams: true, logged_in: false });

      // Should have called attestTrustedToken but not revoke
      await waitFor(() => {
        expect(revokeSessionSpy).not.toHaveBeenCalled();
      });
      await waitFor(() => {
        expect(attestTrustedTokenSpy).toHaveBeenCalled();
      });

      // Should show error
      await screen.findByText('No active session detected. Please log in to continue.');
      const calls = (callbacks.onError as jest.Mock).mock.calls.map(([err]) => err);
      expect(calls.some((e) => e instanceof StytchAPIError)).toBe(true);
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

      renderIDPApp({ logged_in: true });

      // Should not call attest
      expect(attestTrustedTokenSpy).not.toHaveBeenCalled();

      // Should continue with normal OAuth flow
      await screen.findByText('Sign in to Sample Application with Test Project');
    });
  });
});
