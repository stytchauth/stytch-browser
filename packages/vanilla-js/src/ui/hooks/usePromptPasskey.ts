import {
  Products,
  StytchEventType,
  StytchProjectConfigurationInput,
  WebAuthnAuthenticateResponse,
} from '@stytch/core/public';
import {
  AppScreens,
  useConfig,
  useErrorCallback,
  useEventCallback,
  useGlobalReducer,
  useStytch,
} from '../b2c/GlobalContextProvider';
import { DEFAULT_SESSION_DURATION_MINUTES } from '@stytch/core';
import { useCallback, useEffect, useState } from 'react';
import { extractErrorType } from '../../utils/extractErrorType';
import { extractErrorMessage } from '../../utils/extractErrorMessage';
import { useLingui } from '@lingui/react/macro';

const MAX_ATTEMPTS = 5;

export type StartPasskeyAuth = () => Promise<WebAuthnAuthenticateResponse<StytchProjectConfigurationInput>>;

export const usePromptPasskey = ({
  canAutofill,
}: {
  canAutofill: boolean;
}): [startPasskeyAuth: StartPasskeyAuth, error: string | undefined] => {
  const { t } = useLingui();
  const stytchClient = useStytch();
  const config = useConfig();
  const hasPasskeys = config.products.includes(Products.passkeys);

  const onEvent = useEventCallback();
  const onError = useErrorCallback();
  const [, dispatch] = useGlobalReducer();

  const [error, setError] = useState<string>();

  const startPasskeyAuth = useCallback(
    async ({
      conditionalMediation = false,
      abortController,
    }: {
      conditionalMediation?: boolean;
      abortController?: AbortController;
    } = {}) => {
      try {
        const resp = await stytchClient.webauthn.authenticate({
          domain: config.passkeyOptions?.domain,
          session_duration_minutes: config.sessionOptions?.sessionDurationMinutes ?? DEFAULT_SESSION_DURATION_MINUTES,
          conditional_mediation: conditionalMediation,
          is_passkey: true,
          signal: abortController?.signal,
        });

        if (!resp) {
          throw new Error('Empty response');
        }

        onEvent({ type: StytchEventType.PasskeyAuthenticate, data: resp });
        dispatch({ type: 'transition', screen: AppScreens.PasskeyConfirmation });
        return resp;
      } catch (e) {
        if (extractErrorType(e) === 'webauthn_registration_not_found') {
          setError(
            t({
              id: 'error.passkeyRegistrationNotFound',
              message:
                'Passkey registration not found. You may have deleted the passkey from your account but not password manager. Please try again.',
            }),
          );
        } else if (e instanceof Error && e.name === 'StytchAPIError') {
          setError(
            t({
              id: 'error.passkeyUnknown',
              message: 'Unknown error occurred during passkey authentication. Please try again.',
            }),
          );
        }

        const message = extractErrorMessage(e);
        if (message) {
          onError({ message });
        }

        throw e;
      }
    },
    [
      config.passkeyOptions?.domain,
      config.sessionOptions?.sessionDurationMinutes,
      dispatch,
      onError,
      onEvent,
      stytchClient.webauthn,
      t,
    ],
  );

  useEffect(() => {
    if (!hasPasskeys || !canAutofill) {
      return;
    }

    // Skip passkey authentication in Storybook environment
    if (process.env.STORYBOOK) {
      return;
    }

    const abortController = new AbortController();
    (async () => {
      if (!(await stytchClient.webauthn.browserSupportsAutofill())) {
        return;
      }

      for (let i = 0; i < MAX_ATTEMPTS; ++i) {
        if (abortController.signal.aborted) {
          return;
        }

        try {
          await startPasskeyAuth({ abortController, conditionalMediation: true });
          return;
        } catch (e) {
          // User denied permission
          if (e instanceof DOMException && e.name === 'NotAllowedError') {
            return;
          }

          // Otherwise swallow error
        }
      }
    })();

    return () => {
      abortController.abort();
    };
  }, [canAutofill, hasPasskeys, startPasskeyAuth, stytchClient.webauthn]);

  return [startPasskeyAuth, error];
};
