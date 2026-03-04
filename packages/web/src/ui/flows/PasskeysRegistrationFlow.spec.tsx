import { DEFAULT_SESSION_DURATION_MINUTES, logger } from '@stytch/core';
import { Callbacks, WebAuthnRegistration } from '@stytch/core/public';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import React from 'react';

import { handlers } from '../../../.storybook/handlers';
import { StytchClient } from '../../StytchClient';
import { PasskeyHandlers, passkeyUpdateErrorHandlers } from '../../testing/msw/passkeyHandlers';
import { MockConfig, MockGlobalContextProvider, MockState, render, screen, waitFor, within } from '../../testUtils';
import {
  CHROME_CROSS_DEVICE_DUPLICATE_REG_ERROR_MESSAGE,
  SAFARI_CROSS_DEVICE_DUPLICATE_REG_ERROR_MESSAGE,
} from '../../utils/passkeys';
import Container from '../b2c/Container';
import { AppScreens } from '../b2c/GlobalContextProvider';
import * as Products from '../b2c/Products';
import { testId } from '../b2c/screens/Passkey/EditableRow';

describe('Passkey Registration Flow', () => {
  // This is a temporary fix to stop tests in Github actions from failing. See https://github.com/facebook/jest/issues/12670.
  jest.setTimeout(10_000);

  const passkeyHandlers = new PasskeyHandlers(5);

  const server = setupServer(
    ...Object.values({
      ...handlers({ networkDelay: 3 }),
      ...passkeyHandlers.handlers,
    }),
  );
  let client: StytchClient;

  beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' });
  });

  beforeEach(async () => {
    client = new StytchClient('public-token-fake-public-token');
    passkeyHandlers.mockRegister(client);

    // Update the client's state. The user must be authenticated on both screens
    await client.user.get();
  });

  afterEach(() => {
    server.resetHandlers();
    passkeyHandlers.reset();
    jest.resetAllMocks();
  });

  afterAll(() => {
    // Disable request interception and clean up.
    server.close();
  });

  const config: MockConfig = {
    products: [Products.passkeyRegistration],
  };

  const callbacks: Callbacks = {
    onEvent: jest.fn(),
    onError: jest.fn(),
  };

  const renderAppWithConfig = (state?: MockState) => {
    return render(
      <MockGlobalContextProvider client={client} config={config} state={state} callbacks={callbacks}>
        <Container />
      </MockGlobalContextProvider>,
    );
  };

  const expectErrorPage = async () => {
    await waitFor(() => {
      screen.getByText('Error: Cannot use PasskeyRegistration component without active user authenticated.');
    });
  };

  const expectRegistrationPage = async () => {
    await waitFor(() => {
      screen.getByText('Set up a new Passkey');
    });
  };

  const expectSuccessPage = async () => {
    await waitFor(() => {
      screen.getByText('Passkey successfully created!');
    });
  };

  const expectErrorAlert = async () => {
    await waitFor(() => {
      screen.getByText(
        'Your Passkey was not created. Click “Create a Passkey” to try again or skip without adding a Passkey.',
      );
    });
  };

  const expectDuplicateRegErrorAlert = async () => {
    await waitFor(() => {
      screen.getByText(
        'The Passkey cannot be created as it seems to be already registered. It is possible this Passkey was registered on another device but has synced cross-device.',
      );
    });
  };

  const getRegistration = (registration: WebAuthnRegistration) =>
    screen.queryByTestId(testId(registration.webauthn_registration_id));

  const waitForRegistration = async (registration: WebAuthnRegistration) =>
    screen.findByTestId(testId(registration.webauthn_registration_id));

  const clickPasskeyAction = async (row: HTMLElement, label: string) => {
    await userEvent.click(within(row).getByRole('button', { name: label }));
  };

  const clickCreateAPasskey = async () => {
    await userEvent.click(screen.getByRole('button', { name: 'Create a Passkey' }));
  };

  const clickSkip = async () => {
    await userEvent.click(screen.getByRole('button', { name: 'Skip' }));
  };

  const clickDone = async () => {
    await userEvent.click(screen.getByRole('button', { name: 'Done' }));
  };

  it('Successfully registers a passkey', async () => {
    const state: MockState = {
      screen: AppScreens.PasskeyRegistrationStart,
      formState: {},
    };

    renderAppWithConfig(state);
    await expectRegistrationPage();
    await clickCreateAPasskey();
    expect(client.webauthn.register).toHaveBeenCalledWith({
      is_passkey: true,
      session_duration_minutes: DEFAULT_SESSION_DURATION_MINUTES,
    });
    expect(client.webauthn.register).toHaveBeenCalledTimes(1);
    await expectSuccessPage();

    expect(passkeyHandlers.registrations).toHaveLength(3);
    for (const registration of passkeyHandlers.registrations) {
      await waitForRegistration(registration);
    }
  });

  it('Error on unsuccessful register', async () => {
    passkeyHandlers.mockRegister(client, new Error('Simulated Error'));

    const state: MockState = {
      screen: AppScreens.PasskeyRegistrationStart,
      formState: {},
    };

    renderAppWithConfig(state);
    await expectRegistrationPage();
    await clickCreateAPasskey();
    await expectErrorAlert();
  });

  it('Error on unsuccessful register duplicate cross device error. (Safari)', async () => {
    passkeyHandlers.mockRegister(client, new Error(SAFARI_CROSS_DEVICE_DUPLICATE_REG_ERROR_MESSAGE));

    const state: MockState = {
      screen: AppScreens.PasskeyRegistrationStart,
      formState: {},
    };

    renderAppWithConfig(state);
    await expectRegistrationPage();
    await clickCreateAPasskey();
    await expectDuplicateRegErrorAlert();
  });

  it('Error on unsuccessful register duplicate cross device error. (Chrome)', async () => {
    passkeyHandlers.mockRegister(client, new Error(CHROME_CROSS_DEVICE_DUPLICATE_REG_ERROR_MESSAGE));

    const state: MockState = {
      screen: AppScreens.PasskeyRegistrationStart,
      formState: {},
    };

    renderAppWithConfig(state);
    await expectRegistrationPage();
    await clickCreateAPasskey();
    await expectDuplicateRegErrorAlert();
  });

  it('Skip event fires', async () => {
    const state: MockState = {
      screen: AppScreens.PasskeyRegistrationStart,
      formState: {},
    };

    renderAppWithConfig(state);
    await expectRegistrationPage();
    await clickSkip();
    await expectSuccessPage();
    expect(callbacks.onEvent).toHaveBeenCalledWith({ data: {}, type: 'PASSKEY_SKIP' });
  });

  it('Done event fires', async () => {
    const state: MockState = {
      screen: AppScreens.PasskeyRegistrationSuccess,
      formState: {},
    };

    renderAppWithConfig(state);
    await clickDone();
    await expectSuccessPage();
    expect(callbacks.onEvent).toHaveBeenCalledWith({ data: {}, type: 'PASSKEY_DONE' });
  });

  it('Error on no user in session', async () => {
    server.use(http.get('https://api.stytch.com/sdk/v1/users/me', () => HttpResponse.json({}, { status: 401 })));

    const state: MockState = {
      screen: AppScreens.PasskeyRegistrationStart,
      formState: {},
    };

    renderAppWithConfig(state);
    await expectErrorPage();
  });

  // Success Page Tests
  const updateFailureHandler = Object.values(passkeyUpdateErrorHandlers({ networkDelay: process.env.CI ? 25 : 3 }));
  const waitForError = () => screen.findByText(/502.+Who knows.+Recoverable/);

  describe('editing passkey', () => {
    const NEW_NAME = 'new name';

    function getInput(registration: WebAuthnRegistration) {
      const row = getRegistration(registration)!;
      return within(row).getByLabelText<HTMLInputElement>('Passkey name');
    }

    async function editAndSave() {
      const state: MockState = {
        screen: AppScreens.PasskeyRegistrationSuccess,
        formState: {},
      };

      renderAppWithConfig(state);
      await expectSuccessPage();

      const [registration] = passkeyHandlers.registrations;
      const row1 = await waitForRegistration(registration);

      await clickPasskeyAction(row1, 'Edit');

      // Find the input field and change its value
      const input = getInput(registration);
      await userEvent.clear(input);
      await userEvent.type(input, NEW_NAME);

      await clickPasskeyAction(row1, 'Save');

      return registration;
    }

    it('successfully edits a passkey name', async () => {
      const registrationToEdit = await editAndSave();

      // Optimistically go to new state
      within(getRegistration(registrationToEdit)!).getByText(NEW_NAME);

      // Wait for server to update
      await waitFor(() => {
        const updatedName = passkeyHandlers.getRegistration(registrationToEdit)?.name;
        expect(updatedName).toBe(NEW_NAME);
      });

      within(getRegistration(registrationToEdit)!).getByText(NEW_NAME);
    });

    it('Handles failure correctly', async () => {
      jest.spyOn(logger, 'error').mockImplementation(() => {
        // noop
      });

      server.use(...updateFailureHandler);
      const registrationToEdit = await editAndSave();

      // Registration eagerly updated
      within(getRegistration(registrationToEdit)!).getByText(NEW_NAME);
      await waitForError();

      // Registration on server not updated
      expect(passkeyHandlers.getRegistration(registrationToEdit)?.name).toEqual(registrationToEdit.name);

      // Registration input goes back to being editable and autofilled with unsaved name
      expect(getInput(registrationToEdit).value).toBe(NEW_NAME);
      expect(getInput(registrationToEdit).disabled).toBe(false);
    });
  });

  describe('deleting passkey', () => {
    async function deleteRegistration() {
      const state: MockState = {
        screen: AppScreens.PasskeyRegistrationSuccess,
        formState: {},
      };

      renderAppWithConfig(state);
      await expectSuccessPage();

      const registration = passkeyHandlers.registrations[0];
      const row1 = await waitForRegistration(registration);

      // Click row delete button
      await clickPasskeyAction(row1, 'Delete');

      // Click delete confirmation button
      await userEvent.click(screen.getByRole('button', { name: 'Delete' }));
      return registration;
    }

    it('successfully edits a passkey name', async () => {
      const registrationToDelete = await deleteRegistration();

      // Registration eagerly removed
      expect(getRegistration(registrationToDelete)).toBeNull();
      await waitFor(() => {
        expect(passkeyHandlers.getRegistration(registrationToDelete)).toBeUndefined();
      });

      expect(passkeyHandlers.registrations).toHaveLength(1);
      expect(getRegistration(registrationToDelete)).toBeNull();
    });

    it('handles failure correctly', async () => {
      server.use(...updateFailureHandler);
      const registrationToDelete = await deleteRegistration();

      // Registration eagerly removed
      expect(getRegistration(registrationToDelete)).toBeNull();
      await waitForError();

      // Server state not updated
      expect(passkeyHandlers.registrations).toHaveLength(2);
      expect(passkeyHandlers.getRegistration(registrationToDelete)).toEqual(registrationToDelete);

      // Registration should come back on re-render
      await waitForRegistration(registrationToDelete);
    });
  });
});
