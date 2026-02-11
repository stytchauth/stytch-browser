import { Callbacks, StytchAPIError, StytchEventType } from '@stytch/core/public';

import { MockClient, MockConfig, screen, waitFor } from '../../testUtils';
import * as internals from '../../utils/internal';
import { B2CInternals } from '../../utils/internal';
import * as Products from '../b2c/Products';
import { changeEmail, clickContinueWithEmail, clickGoBackButton, renderFlow, waitForConfirmationPage } from './helpers';

const MOCK_EMAIL = 'example@email.com';

const mockReadInternals = jest.spyOn(internals, 'readB2CInternals');
mockReadInternals.mockImplementation(
  () =>
    ({
      bootstrap: {
        getSync: jest.fn().mockResolvedValueOnce({}),
        getAsync: jest.fn().mockResolvedValueOnce({}),
      },
      networkClient: {
        logEvent: jest.fn().mockResolvedValue({}),
      },
    }) as unknown as B2CInternals,
);

describe('Magic Link Flow', () => {
  const config: MockConfig = {
    products: [Products.emailMagicLinks],
    emailMagicLinksOptions: {
      createUserAsPending: true,
      loginExpirationMinutes: 30,
      loginRedirectURL: 'https://example.com/authenticate',
      signupExpirationMinutes: 30,
      signupRedirectURL: 'https://example.com/sign-up',
    },
  };

  it('Successfully handles a magic link send', async () => {
    const client: MockClient = {
      magicLinks: {
        email: {
          loginOrCreate: jest.fn().mockResolvedValue(void 0),
        },
        authenticate: jest.fn().mockResolvedValue(void 0),
      },
    };

    const callbacks: Callbacks = {
      onEvent: jest.fn(),
      onError: jest.fn(),
    };
    renderFlow({ config, client, callbacks });
    await changeEmail(MOCK_EMAIL);
    await clickContinueWithEmail();
    await waitForConfirmationPage();

    expect(client.magicLinks?.email?.loginOrCreate).toHaveBeenCalledTimes(1);
    expect(client.magicLinks?.email?.loginOrCreate).toHaveBeenCalledWith(MOCK_EMAIL, {
      login_expiration_minutes: 30,
      login_magic_link_url: 'https://example.com/authenticate',
      signup_expiration_minutes: 30,
      signup_magic_link_url: 'https://example.com/sign-up',
    });
    expect(callbacks.onEvent).toHaveBeenCalledTimes(1);
    expect(callbacks.onEvent).toHaveBeenCalledWith(
      expect.objectContaining({ type: StytchEventType.MagicLinkLoginOrCreateEvent }),
    );
  });

  it('Successfully handles an error thrown while sending a magic link', async () => {
    const client: MockClient = {
      magicLinks: {
        email: {
          loginOrCreate: jest
            .fn()
            .mockRejectedValueOnce(
              new StytchAPIError({
                error_message: 'Failed to send magic link the server is unplugged',
                error_type: 'test_error',
                status_code: 400,
                error_url: 'https://stytch.com/dashboard/sdk-configuration',
              }),
            )
            .mockResolvedValueOnce(void 0),
        },
        authenticate: jest.fn().mockResolvedValue(void 0),
      },
    };

    const callbacks: Callbacks = {
      onEvent: jest.fn(),
      onError: jest.fn(),
    };

    renderFlow({ config, client, callbacks });
    await changeEmail(MOCK_EMAIL);
    await clickContinueWithEmail();

    await waitFor(async () => {
      screen.getByText('Failed to send magic link the server is unplugged');
    });

    await clickContinueWithEmail();
    await waitForConfirmationPage();

    expect(client.magicLinks?.email?.loginOrCreate).toHaveBeenCalledTimes(2);
    expect(callbacks.onError).toHaveBeenCalledTimes(1);
    expect(callbacks.onEvent).toHaveBeenCalledTimes(1);
  });

  it('Returns to the main screen when the user clicks go back', async () => {
    const client: MockClient = {
      magicLinks: {
        email: {
          loginOrCreate: jest.fn().mockResolvedValue(void 0),
        },
        authenticate: jest.fn().mockResolvedValue(void 0),
      },
    };

    renderFlow({ config, client });
    await changeEmail(MOCK_EMAIL);
    await clickContinueWithEmail();
    await waitForConfirmationPage();
    await clickGoBackButton();

    await waitFor(async () => {
      screen.getByText('Continue with email');
    });
  });
});
