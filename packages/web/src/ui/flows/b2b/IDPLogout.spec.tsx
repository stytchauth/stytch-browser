import { logger } from '@stytch/core';
import { Callbacks, IDPOAuthFlowMissingParamError, StytchAPIError } from '@stytch/core/public';
import { MOCK_MEMBER } from '@stytch/internal-mocks';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { render, screen, waitFor } from '../../../testUtils';
import * as internals from '../../../utils/internal';
import { B2BInternals } from '../../../utils/internal';
import { IDPConsentScreen } from '../../b2b/screens/IDPConsent';
import { MockClient, MockGlobalContextProvider } from './helpers';

jest.mock('@stytch/core', () => ({
  ...jest.requireActual('@stytch/core'),
  logger: {
    debug: jest.fn(),
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

const urlParams = {
  client_id: 'mock-client-123',
  post_logout_redirect_uri: 'https://oauthdebugger.com/debug',
  id_token_hint: 'eYJ...',
  state: 'code',
};
describe('B2B IDP Logout Consent Flow', () => {
  // This is a temporary fix to stop tests in Github actions from failing. See https://github.com/facebook/jest/issues/12670.
  jest.setTimeout(10000);

  const callbacks: Callbacks = {
    onEvent: jest.fn(),
    onError: jest.fn(),
  };

  const oauthLogoutStartSpy = jest.fn();

  const client = {
    onStateChange: jest.fn(),
    self: {
      getSync: jest.fn().mockReturnValue(MOCK_MEMBER),
    },
    session: {
      revoke: jest.fn().mockResolvedValueOnce(void 0),
    },
    idp: {
      oauthLogoutStart: oauthLogoutStartSpy,
    },
  } satisfies MockClient;

  const setHrefSpy = jest.fn();
  const getSearchParams = () => `?${new URLSearchParams(urlParams).toString()}`;

  const renderIDPApp = (searchParams?: string) =>
    render(
      <MockGlobalContextProvider client={client} callbacks={callbacks}>
        <IDPConsentScreen searchParams={searchParams ?? getSearchParams()} navigate={setHrefSpy} />
      </MockGlobalContextProvider>,
    );

  beforeEach(() => {
    const mockReadInternals = jest.spyOn(internals, 'readB2BInternals');
    mockReadInternals.mockImplementation(
      () =>
        ({
          bootstrap: {
            getSync: jest.fn().mockReturnValue({ projectName: 'Test Project' }),
            getAsync: jest.fn().mockResolvedValue({ projectName: 'Test Project' }),
          },
        }) as unknown as B2BInternals,
    );
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('Error on missing required fields', async () => {
    renderIDPApp('?');

    await screen.findByText('Required parameter is missing: client_id. Please reach out to the application developer.');
    expect(callbacks.onError).toHaveBeenCalledWith(expect.any(IDPOAuthFlowMissingParamError));
    expect(callbacks.onEvent).not.toHaveBeenCalled();
    expect(logger.warn).toHaveBeenCalledWith('Unable to parse host from redirect URI.', expect.anything());
  });

  it('Success when all provided fields are present and auto-submit can occur', async () => {
    expect(logger.warn).not.toHaveBeenCalled();
    oauthLogoutStartSpy.mockResolvedValueOnce({ consent_required: false, redirect_uri: 'https://final-location.com' });
    renderIDPApp();

    await waitFor(() => {
      expect(setHrefSpy).toHaveBeenCalledWith('https://final-location.com');
    });
    expect(client.session.revoke).toHaveBeenCalled();
  });

  it('Success even when revoke fails', async () => {
    oauthLogoutStartSpy.mockResolvedValueOnce({ consent_required: false, redirect_uri: 'https://final-location.com' });
    client.session.revoke.mockRejectedValueOnce(
      new StytchAPIError({
        error_message: 'Session not found',
        error_type: 'session_not_found',
        error_url: 'https://stytch.com',
        status_code: 400,
        request_id: 'request-id-123',
      }),
    );
    renderIDPApp();

    await waitFor(() => {
      expect(setHrefSpy).toHaveBeenCalledWith('https://final-location.com');
    });
    expect(client.session.revoke).toHaveBeenCalled();
  });

  it('Shows consent screen when required and submits on Allow', async () => {
    oauthLogoutStartSpy.mockResolvedValueOnce({ consent_required: true, redirect_uri: 'https://final-location.com' });
    renderIDPApp();

    await screen.findByText('Log out?');

    await userEvent.click(screen.getByRole('button', { name: 'Yes' }));

    await waitFor(() => {
      expect(setHrefSpy).toHaveBeenCalledWith('https://final-location.com');
    });
    expect(client.session.revoke).toHaveBeenCalled();
  });

  it('Shows consent screen when required and submits on Deny', async () => {
    oauthLogoutStartSpy.mockResolvedValueOnce({ consent_required: true, redirect_uri: 'https://final-location.com' });
    renderIDPApp();

    await screen.findByText('Log out?');

    await userEvent.click(screen.getByRole('button', { name: 'No' }));

    await screen.findByText('You have not been logged out. You may close this page.');

    expect(setHrefSpy).not.toHaveBeenCalled();
    expect(client.session.revoke).not.toHaveBeenCalled();
  });

  it('Shows an error when Authorize Start fails', async () => {
    oauthLogoutStartSpy.mockRejectedValueOnce(
      new StytchAPIError({
        error_message: 'Client not allowed around these parts no more',
        error_type: 'client_not_allowed',
        error_url: 'https://stytch.com',
        status_code: 400,
        request_id: 'request-id-123',
      }),
    );
    renderIDPApp();

    await screen.findByText('Looks like there was an error!');
    expect(callbacks.onError).toHaveBeenCalledWith(expect.any(StytchAPIError));
  });
});
