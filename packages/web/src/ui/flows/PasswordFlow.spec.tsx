import { Callbacks, StytchEventType } from '@stytch/core/public';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { messages } from '../../messages/en';
import { MockClient, MockConfig, MockGlobalContextProvider, MockState, render, screen, waitFor } from '../../testUtils';
import * as internals from '../../utils/internal';
import { B2CInternals } from '../../utils/internal';
import Container from '../b2c/Container';
import { AppScreens } from '../b2c/GlobalContextProvider';
import * as Products from '../b2c/Products';
import { I18nProviderWrapper } from '../components/atoms/I18nProviderWrapper';
import { changeEmail, clickContinueWithEmail, renderFlow } from './helpers';

describe('Password Flow', () => {
  const MOCK_EMAIL = 'example@email.com';
  const MOCK_PASSWORD = 'lIzE9onk56$*';

  const config: MockConfig = {
    products: [Products.passwords],
    passwordOptions: {
      loginRedirectURL: 'https://example.com/reset',
      loginExpirationMinutes: 60,
      resetPasswordRedirectURL: 'https://example.com/reset',
      resetPasswordExpirationMinutes: 60,
    },
  };

  const callbacks: Callbacks = {
    onEvent: jest.fn(),
    onError: jest.fn(),
  };

  const mockReadInternals = jest.spyOn(internals, 'readB2CInternals');

  const initialEmailFlow = async (client: MockClient) => {
    renderFlow({ config, client, callbacks });
    await changeEmail(MOCK_EMAIL);
    await clickContinueWithEmail();
  };

  const renderAppWithConfig = (config?: MockConfig, state?: MockState, client?: MockClient) => {
    return render(
      <MockGlobalContextProvider config={config} state={state} client={client}>
        <I18nProviderWrapper messages={messages}>
          <Container />
        </I18nProviderWrapper>
      </MockGlobalContextProvider>,
    );
  };

  const changePassword = async (password: string) => {
    await userEvent.type(screen.getByLabelText('Password'), password);
  };

  const waitForSuccessfulLogin = async () => {
    await waitFor(async () => {
      screen.getByText('You have successfully logged in.');
    });
  };

  /**
   * TODO: Remove the manual enabling of the button.
   * Currently the state property is not being toggled when the mock client returns a valid password.
   */
  const clickContinue = async () => {
    const button = screen.getByRole('button', { name: 'Continue' });
    (button as HTMLButtonElement).disabled = false;
    await userEvent.click(screen.getByRole('button', { name: 'Continue' }));
  };

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('Successfully signs up as a new user', async () => {
    mockReadInternals.mockImplementation(
      () =>
        ({
          searchManager: {
            searchUser: jest.fn().mockResolvedValueOnce({ userType: 'new' }),
          },
          bootstrap: {
            getSync: jest.fn().mockResolvedValueOnce({ passwordConfig: null }),
            getAsync: jest.fn().mockResolvedValueOnce({ passwordConfig: null }),
          },
        }) as unknown as B2CInternals,
    );

    const mockCreateResponse = { email_id: 'email-12345' };
    const client: MockClient = {
      passwords: {
        create: jest.fn().mockResolvedValue(mockCreateResponse),
        strengthCheck: jest.fn().mockResolvedValue({
          valid_password: true,
          strength_policy: 'zxcvbn',
          score: 4,
          feedback: {
            warning: '',
            suggestions: [],
          },
        }),
      },
    };

    await initialEmailFlow(client);
    await waitFor(async () => {
      screen.getByText('Finish creating your account by setting a password.');
    });
    await changePassword(MOCK_PASSWORD);
    await waitFor(async () => {
      expect(client.passwords?.strengthCheck).toHaveBeenCalledWith({
        email: MOCK_EMAIL,
        password: MOCK_PASSWORD,
      });
    });
    await clickContinue();
    await waitForSuccessfulLogin();

    expect(client.passwords?.create).toHaveBeenCalledWith({
      email: MOCK_EMAIL,
      password: MOCK_PASSWORD,
      session_duration_minutes: 30,
    });
    expect(callbacks.onEvent).toHaveBeenCalledWith(
      expect.objectContaining({ type: StytchEventType.PasswordCreate, data: mockCreateResponse }),
    );
    await waitFor(() =>
      expect(callbacks.onEvent).toHaveBeenCalledWith(
        expect.objectContaining({ type: StytchEventType.AuthenticateFlowComplete, data: {} }),
      ),
    );
    expect(callbacks.onEvent).toHaveBeenCalledTimes(2);
  });

  it('Successfully logs in as an existing user', async () => {
    mockReadInternals.mockImplementation(
      () =>
        ({
          searchManager: {
            searchUser: jest.fn().mockResolvedValueOnce({ userType: 'password' }),
          },
          bootstrap: {
            getSync: jest.fn().mockResolvedValueOnce({ passwordConfig: null }),
            getAsync: jest.fn().mockResolvedValueOnce({ passwordConfig: null }),
          },
        }) as unknown as B2CInternals,
    );
    const mockAuthResponse = { email_id: 'email-12345' };
    const client: MockClient = {
      passwords: {
        authenticate: jest.fn().mockResolvedValue(mockAuthResponse),
      },
    };

    await initialEmailFlow(client);
    await screen.findByText('Log in');
    await changePassword(MOCK_PASSWORD);
    await clickContinue();
    await waitForSuccessfulLogin();

    expect(client.passwords?.authenticate).toHaveBeenCalledWith({
      email: MOCK_EMAIL,
      password: MOCK_PASSWORD,
      session_duration_minutes: 30,
    });
    expect(callbacks.onEvent).toHaveBeenCalledWith(
      expect.objectContaining({ type: StytchEventType.PasswordAuthenticate, data: mockAuthResponse }),
    );
    await waitFor(() =>
      expect(callbacks.onEvent).toHaveBeenCalledWith(
        expect.objectContaining({ type: StytchEventType.AuthenticateFlowComplete, data: {} }),
      ),
    );
    expect(callbacks.onEvent).toHaveBeenCalledTimes(2);
  });

  it('Successfully starts the reset password flow', async () => {
    mockReadInternals.mockImplementation(
      () =>
        ({
          searchManager: {
            searchUser: jest.fn().mockResolvedValueOnce({ userType: 'password' }),
          },
          bootstrap: {
            getSync: jest.fn().mockResolvedValueOnce({ passwordConfig: null }),
            getAsync: jest.fn().mockResolvedValueOnce({ passwordConfig: null }),
          },
          networkClient: {
            logEvent: jest.fn().mockResolvedValue({}),
          },
        }) as unknown as B2CInternals,
    );
    const client: MockClient = {
      passwords: {
        resetByEmailStart: jest.fn().mockResolvedValue({}),
      },
    };

    await initialEmailFlow(client);
    await screen.findByText('Log in');
    await userEvent.click(screen.getByRole('button', { name: 'Forgot your password?' }));
    await waitFor(async () => {
      screen.getByText((content) => content.startsWith('A link to reset your password was sent to you at'));
    });
    await userEvent.click(screen.getByRole('button', { name: 'Resend email' }));

    expect(client.passwords?.resetByEmailStart).toHaveBeenCalledTimes(2);
    expect(client.passwords?.resetByEmailStart).toHaveBeenCalledWith({
      email: MOCK_EMAIL,
      login_expiration_minutes: config.passwordOptions?.loginExpirationMinutes,
      login_redirect_url: config.passwordOptions?.loginRedirectURL,
      reset_password_expiration_minutes: config.passwordOptions?.resetPasswordExpirationMinutes,
      reset_password_redirect_url: config.passwordOptions?.resetPasswordRedirectURL,
    });
  });

  it('Successfully resets password', async () => {
    mockReadInternals.mockImplementation(
      () =>
        ({
          searchManager: {
            searchUser: jest.fn().mockResolvedValueOnce({ userType: 'password' }),
          },
          bootstrap: {
            getSync: jest.fn().mockResolvedValueOnce({ passwordConfig: null }),
            getAsync: jest.fn().mockResolvedValueOnce({ passwordConfig: null }),
          },
        }) as unknown as B2CInternals,
    );

    const client: MockClient = {
      passwords: {
        resetByEmail: jest.fn().mockResolvedValue({}),
        strengthCheck: jest.fn().mockResolvedValue({
          valid_password: true,
          feedback: {
            suggestions: [],
            warning: '',
          },
        }),
      },
    };
    const state: MockState = {
      screen: AppScreens.PasswordResetForm,
    };

    renderAppWithConfig(config, state, client);
    await changePassword(MOCK_PASSWORD);
    await waitFor(async () => {
      expect(client.passwords?.strengthCheck).toHaveBeenCalledWith({
        password: MOCK_PASSWORD,
      });
    });
    await clickContinue();
    await waitForSuccessfulLogin();

    expect(client.passwords?.resetByEmail).toHaveBeenCalledWith({
      password: MOCK_PASSWORD,
      session_duration_minutes: 30,
      token: '',
    });
  });

  it('Successfully pivots to logging in without password from reset flow', async () => {
    mockReadInternals.mockImplementation(
      () =>
        ({
          bootstrap: {
            getSync: jest.fn().mockResolvedValueOnce({ passwordConfig: null }),
            getAsync: jest.fn().mockResolvedValueOnce({ passwordConfig: null }),
          },
        }) as unknown as B2CInternals,
    );

    const client: MockClient = {
      magicLinks: {
        authenticate: jest.fn().mockResolvedValue({}),
      },
    };
    const state: MockState = {
      screen: AppScreens.PasswordResetForm,
      formState: {
        resetPasswordState: {
          token: 'fake_reset_token',
        },
      },
    };

    renderAppWithConfig(config, state, client);

    await userEvent.click(screen.getByRole('button', { name: 'Login without a password' }));

    await waitFor(async () => {
      expect(client.magicLinks?.authenticate).toHaveBeenCalledWith('fake_reset_token', {
        session_duration_minutes: 30,
      });
    });
    await waitForSuccessfulLogin();
  });

  it('Successfully starts reset password when password breached', async () => {
    const client: MockClient = {
      passwords: {
        resetByEmailStart: jest.fn().mockResolvedValue({}),
      },
    };
    const state: MockState = {
      screen: AppScreens.PasswordBreached,
      formState: {
        passwordState: {
          email: MOCK_EMAIL,
        },
      },
    };

    renderAppWithConfig(config, state, client);
    await userEvent.click(screen.getByRole('button', { name: 'Resend email' }));

    expect(client.passwords?.resetByEmailStart).toHaveBeenCalledWith({
      email: MOCK_EMAIL,
      login_expiration_minutes: config.passwordOptions?.loginExpirationMinutes,
      login_redirect_url: config.passwordOptions?.loginRedirectURL,
      reset_password_expiration_minutes: config.passwordOptions?.resetPasswordExpirationMinutes,
      reset_password_redirect_url: config.passwordOptions?.resetPasswordRedirectURL,
    });
  });

  it('Successfully starts set new password when existing user is passwordless', async () => {
    mockReadInternals.mockImplementation(
      () =>
        ({
          searchManager: {
            searchUser: jest.fn().mockResolvedValueOnce({ userType: 'passwordless' }),
          },
        }) as unknown as B2CInternals,
    );

    const client: MockClient = {
      passwords: {
        resetByEmailStart: jest.fn().mockResolvedValue({}),
      },
    };

    await initialEmailFlow(client);
    await waitFor(async () => {
      screen.getByText('Check your email');
    });

    expect(client.passwords?.resetByEmailStart).toHaveBeenCalled();
    expect(client.passwords?.resetByEmailStart).toHaveBeenCalledWith({
      email: MOCK_EMAIL,
      login_expiration_minutes: config.passwordOptions?.loginExpirationMinutes,
      login_redirect_url: config.passwordOptions?.loginRedirectURL,
      reset_password_expiration_minutes: config.passwordOptions?.resetPasswordExpirationMinutes,
      reset_password_redirect_url: config.passwordOptions?.resetPasswordRedirectURL,
    });
  });
});
