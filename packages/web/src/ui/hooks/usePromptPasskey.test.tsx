import { setTimeout } from 'node:timers/promises';

import { StytchAPIError, StytchEventType } from '@stytch/core/public';
import { act, renderHook, waitFor } from '@testing-library/react';
import React from 'react';

import { messages } from '../../messages/en';
import { MockClient, MockConfig, MockGlobalContextProvider, MockState } from '../../testUtils';
import { AppScreens, useGlobalReducer } from '../b2c/GlobalContextProvider';
import * as Products from '../b2c/Products';
import { I18nProviderWrapper } from '../components/atoms/I18nProviderWrapper';
import { usePromptPasskey } from './usePromptPasskey';

describe('usePromptPasskey', () => {
  const mockOnEvent = jest.fn();
  const mockOnError = jest.fn();

  const defaultConfig: MockConfig = {
    products: [Products.passkeys],
    sessionOptions: {
      sessionDurationMinutes: 60,
    },
  };

  const defaultState: MockState = {
    screen: AppScreens.Main,
    formState: {},
  };

  const client = {
    webauthn: {
      authenticate: jest.fn().mockResolvedValue({}),
      browserSupportsAutofill: jest.fn().mockResolvedValue(true),
    },
  } satisfies MockClient;

  const renderHookWithProviders = ({
    canAutofill,
    config = defaultConfig,
    state = defaultState,
  }: {
    canAutofill: boolean;
    config?: MockConfig;
    state?: MockState;
  }) =>
    renderHook(
      () => {
        const [prompt, error] = usePromptPasskey({ canAutofill, shadowDOM: false });
        const [state] = useGlobalReducer();
        return [prompt, error, state] as const;
      },
      {
        wrapper: ({ children }) => (
          <I18nProviderWrapper messages={messages}>
            <MockGlobalContextProvider
              config={config}
              client={client}
              state={state}
              callbacks={{
                onEvent: mockOnEvent,
                onError: mockOnError,
              }}
            >
              {children}
            </MockGlobalContextProvider>
          </I18nProviderWrapper>
        ),
      },
    );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('successful authentication', () => {
    it('should successfully authenticate with passkey', async () => {
      const mockResponse = {
        session: { session_token: 'mock-session-token' },
        user: { user_id: 'mock-user-id' },
      };

      client.webauthn.authenticate.mockResolvedValue(mockResponse);

      const { result } = renderHookWithProviders({ canAutofill: false });

      await act(async () => {
        const [prompt] = result.current;
        await prompt();
      });

      expect(client.webauthn.authenticate).toHaveBeenCalledWith({
        session_duration_minutes: 60,
        conditional_mediation: false,
        disable_input_check: false,
        is_passkey: true,
        signal: undefined,
      });

      expect(mockOnEvent).toHaveBeenCalledWith({
        type: StytchEventType.PasskeyAuthenticate,
        data: mockResponse,
      });

      // Verify the state transition occurred by checking the current state
      await waitFor(() => {
        const [, , currentState] = result.current;
        expect(currentState.screen).toBe(AppScreens.PasskeyConfirmation);
      });
    });
  });

  describe('error handling', () => {
    it('should handle webauthn_registration_not_found error', async () => {
      const registrationNotFoundError = new StytchAPIError({
        status_code: 404,
        error_type: 'webauthn_registration_not_found',
        error_message: 'Registration not found',
        error_url: 'https://stytch.com/docs/api/errors',
      });

      client.webauthn.authenticate.mockRejectedValue(registrationNotFoundError);

      const { result } = renderHookWithProviders({ canAutofill: false });

      const [prompt] = result.current;
      await act(() => expect(prompt()).rejects.toThrow('Registration not found'));

      // Wait for the error state to be set
      await waitFor(() => {
        const [, error] = result.current;
        expect(error).toBe(
          'Passkey registration not found. You may have deleted the passkey from your account but not password manager. Please try again.',
        );
      });
    });

    it('should handle StytchAPIError', async () => {
      const stytchError = new StytchAPIError({
        status_code: 400,
        error_type: 'unknown_error',
        error_message: 'Stytch API Error',
        error_url: 'https://stytch.com/docs/api/errors',
      });

      client.webauthn.authenticate.mockRejectedValue(stytchError);

      const { result } = renderHookWithProviders({ canAutofill: false });

      const [prompt] = result.current;
      await act(() => expect(prompt()).rejects.toThrow('Stytch API Error'));

      // Wait for the error state to be set
      await waitFor(() => {
        const [, error] = result.current;
        expect(error).toBe('Unknown error occurred during passkey authentication. Please try again.');
      });
    });

    it('should call onError with extracted error message', async () => {
      const customError = new StytchAPIError({
        status_code: 500,
        error_type: 'server_error',
        error_message: 'Custom error message',
        error_url: 'https://stytch.com/docs/api/errors',
      });

      client.webauthn.authenticate.mockRejectedValue(customError);

      const { result } = renderHookWithProviders({ canAutofill: false });

      const [prompt] = result.current;
      await act(() => expect(prompt()).rejects.toThrow('Custom error message'));

      expect(mockOnError).toHaveBeenCalledWith({ message: 'Custom error message' });
    });
  });

  describe('autofill behavior', () => {
    it('should not attempt autofill when canAutofill is false', async () => {
      renderHookWithProviders({ canAutofill: false });

      // Wait a bit to ensure no autofill attempts are made
      await setTimeout(10);

      expect(client.webauthn.browserSupportsAutofill).not.toHaveBeenCalled();
      expect(client.webauthn.authenticate).not.toHaveBeenCalled();
    });

    it('should not attempt autofill when passkeys product is not enabled', async () => {
      const config: MockConfig = {
        products: [Products.emailMagicLinks], // No passkeys
      };

      renderHookWithProviders({ canAutofill: true, config });

      // Wait a bit to ensure no autofill attempts are made
      await setTimeout(10);

      expect(client.webauthn.browserSupportsAutofill).not.toHaveBeenCalled();
      expect(client.webauthn.authenticate).not.toHaveBeenCalled();
    });

    it('should attempt autofill when conditions are met', async () => {
      client.webauthn.authenticate.mockResolvedValue({});
      client.webauthn.browserSupportsAutofill.mockResolvedValue(true);

      renderHookWithProviders({ canAutofill: true });

      await waitFor(() => {
        expect(client.webauthn.browserSupportsAutofill).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(client.webauthn.authenticate).toHaveBeenCalledWith({
          session_duration_minutes: 60,
          conditional_mediation: true,
          disable_input_check: false,
          is_passkey: true,
          signal: expect.any(AbortSignal),
        });
      });
    });

    it('should not attempt autofill when browser does not support it', async () => {
      client.webauthn.browserSupportsAutofill.mockResolvedValue(false);

      renderHookWithProviders({ canAutofill: true });

      await waitFor(() => {
        expect(client.webauthn.browserSupportsAutofill).toHaveBeenCalled();
      });

      // Wait a bit more to ensure no authenticate calls are made
      await setTimeout(10);

      expect(client.webauthn.authenticate).not.toHaveBeenCalled();
    });

    it('should retry up to MAX_ATTEMPTS times on failure', async () => {
      client.webauthn.authenticate.mockRejectedValue(new Error('Test error'));
      client.webauthn.browserSupportsAutofill.mockResolvedValue(true);

      renderHookWithProviders({ canAutofill: true });

      await waitFor(() => {
        expect(client.webauthn.authenticate).toHaveBeenCalledTimes(5); // MAX_ATTEMPTS
      });
    });

    it('should stop retrying on NotAllowedError', async () => {
      const notAllowedError = new DOMException('User denied permission', 'NotAllowedError');

      client.webauthn.authenticate.mockRejectedValue(notAllowedError);
      client.webauthn.browserSupportsAutofill.mockResolvedValue(true);

      renderHookWithProviders({ canAutofill: true });

      // Wait for the initial call
      await waitFor(() => expect(client.webauthn.authenticate).toHaveBeenCalledTimes(1));

      // Wait longer to ensure no additional retry attempts are made
      await setTimeout(20);
      expect(client.webauthn.authenticate).toHaveBeenCalledTimes(1);
    });

    it('should abort autofill attempts when component unmounts', async () => {
      let abortSignal: AbortSignal | undefined;

      client.webauthn.authenticate.mockImplementation((params) => {
        abortSignal = params.signal;
        return new Promise(() => {
          // Never resolves
        });
      });
      client.webauthn.browserSupportsAutofill.mockResolvedValue(true);

      const { unmount } = renderHookWithProviders({ canAutofill: true });

      await waitFor(() => expect(client.webauthn.authenticate).toHaveBeenCalled());

      // Verify the abort signal was captured
      expect(abortSignal).toBeInstanceOf(AbortSignal);

      unmount();

      // Verify the signal is aborted after unmount
      expect(abortSignal?.aborted).toBe(true);
    });
  });
});
