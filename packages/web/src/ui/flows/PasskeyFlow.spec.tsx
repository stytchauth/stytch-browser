import { DEFAULT_SESSION_DURATION_MINUTES } from '@stytch/core';
import { Callbacks, StytchAPIError } from '@stytch/core/public';
import { MOCK_UNRECOVERABLE_ERROR_DATA, MOCK_WEBAUTHN_REG_NOT_FOUND_DATA } from '@stytch/internal-mocks';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { messages } from '../../messages/en';
import {
  cleanup,
  MockClient,
  MockConfig,
  MockGlobalContextProvider,
  MockState,
  render,
  screen,
  waitFor,
} from '../../testUtils';
import Container from '../b2c/Container';
import { AppScreens } from '../b2c/GlobalContextProvider';
import * as Products from '../b2c/Products';
import { I18nProviderWrapper } from '../components/atoms/I18nProviderWrapper';

const MOCK_UNRECOVERABLE_ERROR = new StytchAPIError(MOCK_UNRECOVERABLE_ERROR_DATA);

const MOCK_WEBAUTHN_REG_NOT_FOUND = new StytchAPIError(MOCK_WEBAUTHN_REG_NOT_FOUND_DATA);

describe('Passkey Login Flow', () => {
  const config: MockConfig = {
    products: [Products.emailMagicLinks, Products.passkeys],
  };

  const renderAppWithConfig = (config?: MockConfig, state?: MockState, client?: MockClient, callbacks?: Callbacks) => {
    return render(
      <MockGlobalContextProvider config={config} state={state} client={client} callbacks={callbacks}>
        <I18nProviderWrapper messages={messages}>
          <Container />
        </I18nProviderWrapper>
      </MockGlobalContextProvider>,
    );
  };

  const expectMainLoginScreen = async () => {
    await waitFor(() => {
      screen.getByText('Sign up or log in');
    });
  };

  const expectLoginWithAPasskey = async () => {
    await waitFor(() => {
      screen.getByText('Login with a Passkey');
    });
  };

  const waitForSuccessPage = async () => {
    await waitFor(() => {
      screen.getByText('Your Passkey has been successfully authenticated.');
    });
  };

  const expectGenericStytchErr = async () => {
    await waitFor(() => {
      screen.getByText('Unknown error occurred during passkey authentication. Please try again.');
    });
  };

  const expectWebauthnRegNotFoundErr = async () => {
    await waitFor(() => {
      screen.getByText(
        'Passkey registration not found. You may have deleted the passkey from your account but not password manager. Please try again.',
      );
    });
  };

  const expectPasskeySoloConfigError = async () => {
    await waitFor(() => {
      screen.getByText('Error: Cannot use Passkeys by itself, please add another product to the config.');
    });
  };

  const clickLoginWithAPasskey = async () => {
    await userEvent.click(screen.getByRole('button', { name: 'Login with a Passkey' }));
  };

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('Successfully logs in with a passkey (autofill not supported)', async () => {
    const client: MockClient = {
      webauthn: {
        authenticate: jest.fn().mockResolvedValue({}),
        browserSupportsAutofill: jest.fn().mockResolvedValue(false),
      },
    };

    const state: MockState = {
      screen: AppScreens.Main,
      formState: {},
    };

    renderAppWithConfig(config, state, client);

    await expectMainLoginScreen();
    await expectLoginWithAPasskey();
    await clickLoginWithAPasskey();
    await waitForSuccessPage();
    expect(client.webauthn?.authenticate).toHaveBeenCalledWith({
      conditional_mediation: false,
      disable_input_check: false,
      is_passkey: true,
      session_duration_minutes: DEFAULT_SESSION_DURATION_MINUTES,
    });
    expect(client.webauthn?.authenticate).toHaveBeenCalledTimes(1);
  });

  it('Successfully logs in with a passkey (autofill supported)', async () => {
    const client: MockClient = {
      webauthn: {
        authenticate: jest.fn().mockResolvedValue({}),
        browserSupportsAutofill: jest.fn().mockResolvedValue(true),
      },
    };

    const state: MockState = {
      screen: AppScreens.Main,
      formState: {},
    };

    renderAppWithConfig(config, state, client);
    await waitForSuccessPage();
    expect(client.webauthn?.authenticate).toHaveBeenCalledTimes(1);
    expect(client.webauthn?.authenticate).toHaveBeenCalledWith({
      conditional_mediation: true,
      disable_input_check: false,
      is_passkey: true,
      session_duration_minutes: DEFAULT_SESSION_DURATION_MINUTES,
      signal: expect.any(Object),
    });
  });

  it('Error on just passkey specified in config', async () => {
    const client: MockClient = {
      webauthn: {
        authenticate: jest.fn().mockResolvedValue({}),
        browserSupportsAutofill: jest.fn().mockResolvedValue(true),
      },
    };

    const config: MockConfig = {
      products: [Products.passkeys],
    };

    const state: MockState = {
      screen: AppScreens.Main,
      formState: {},
    };

    renderAppWithConfig(config, state, client);
    await expectPasskeySoloConfigError();
  });

  it('Webauthn reg not found', async () => {
    const client: MockClient = {
      webauthn: {
        authenticate: jest.fn().mockRejectedValue(MOCK_WEBAUTHN_REG_NOT_FOUND),
        browserSupportsAutofill: jest.fn().mockResolvedValue(true),
      },
    };

    const state: MockState = {
      screen: AppScreens.Main,
      formState: {},
    };

    renderAppWithConfig(config, state, client);
    await expectMainLoginScreen();
    await expectWebauthnRegNotFoundErr();
    await waitFor(() => {
      expect(client.webauthn?.authenticate).toHaveBeenCalledTimes(5); // 5 retries
    });
    expect(client.webauthn?.authenticate).toHaveBeenCalledWith({
      conditional_mediation: true,
      disable_input_check: false,
      is_passkey: true,
      session_duration_minutes: DEFAULT_SESSION_DURATION_MINUTES,
      signal: expect.any(Object),
    });
  });

  it('Stytch error results in generic alert message and retries', async () => {
    const client: MockClient = {
      webauthn: {
        authenticate: jest.fn().mockRejectedValue(MOCK_UNRECOVERABLE_ERROR),
        browserSupportsAutofill: jest.fn().mockResolvedValue(true),
      },
    };

    const state: MockState = {
      screen: AppScreens.Main,
      formState: {},
    };

    renderAppWithConfig(config, state, client);
    await expectMainLoginScreen();
    await waitFor(() => {
      expect(client.webauthn?.authenticate).toHaveBeenCalledTimes(5);
    });
    expect(client.webauthn?.authenticate).toHaveBeenCalledWith({
      conditional_mediation: true,
      disable_input_check: false,
      is_passkey: true,
      session_duration_minutes: DEFAULT_SESSION_DURATION_MINUTES,
      signal: expect.any(Object),
    });
    // Generic error displayed
    await expectGenericStytchErr();
    // No success screen
    expect(screen.queryByText('Your Passkey has been successfully authenticated.')).toBeNull();
    cleanup();
  });

  it('Random error results in no alert message or retries and no success page', async () => {
    const client: MockClient = {
      webauthn: {
        authenticate: jest.fn().mockRejectedValue(new Error('Simulated error')),
        browserSupportsAutofill: jest.fn().mockResolvedValue(true),
      },
    };

    const state: MockState = {
      screen: AppScreens.Main,
      formState: {},
    };

    renderAppWithConfig(config, state, client);
    await expectMainLoginScreen();
    expect(screen.queryByText('Unknown error occurred during passkey authentication. Please try again.')).toBeNull();
    expect(
      screen.queryByText(
        'Passkey registration not found. You may have deleted the passkey from your account but not password manager. Please try again.',
      ),
    ).toBeNull();
    // No success screen
    expect(screen.queryByText('Your Passkey has been successfully authenticated.')).toBeNull();
  });
});
