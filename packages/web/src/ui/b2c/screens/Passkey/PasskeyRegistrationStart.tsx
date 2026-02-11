import { useLingui } from '@lingui/react/macro';
import { DEFAULT_SESSION_DURATION_MINUTES } from '@stytch/core';
import { StytchAPIError, StytchEventType } from '@stytch/core/public';
import React, { useEffect, useState } from 'react';

import {
  CHROME_CROSS_DEVICE_DUPLICATE_REG_ERROR_MESSAGE,
  SAFARI_CROSS_DEVICE_DUPLICATE_REG_ERROR_MESSAGE,
} from '../../../../utils/passkeys';
import Button from '../../../components/atoms/Button';
import Column from '../../../components/atoms/Column';
import ButtonColumn from '../../../components/molecules/ButtonColumn';
import ErrorText from '../../../components/molecules/ErrorText';
import { LoadingScreen } from '../../../components/molecules/Loading';
import TextColumn from '../../../components/molecules/TextColumn';
import {
  AppScreens,
  useConfig,
  useErrorCallback,
  useEventCallback,
  useGlobalReducer,
  useStytch,
} from '../../GlobalContextProvider';

export const PasskeyRegistrationStart = () => {
  const { t } = useLingui();
  const stytchClient = useStytch();
  const [userState, setUserState] = useState<'noUser' | 'hasUser' | 'loading'>(() =>
    // We'll optimistically say if the user has a cached session then they are logged in, otherwise we try loading first
    stytchClient.user.getSync() != null ? 'hasUser' : 'loading',
  );
  const [error, setError] = useState<string>();
  const config = useConfig();

  const onEvent = useEventCallback();
  const onError = useErrorCallback();

  useEffect(() => {
    stytchClient.user
      .get()
      .then(() => {
        setUserState('hasUser');
      })
      .catch((e: StytchAPIError) => {
        setUserState('noUser');
        onError(e);
      });
  }, [onError, stytchClient]);

  const [, dispatch] = useGlobalReducer();

  const onCreatePasskey = () => {
    setError(undefined);

    stytchClient.webauthn
      .register({
        domain: config.passkeyOptions?.domain,
        is_passkey: true,
        session_duration_minutes: config.sessionOptions?.sessionDurationMinutes ?? DEFAULT_SESSION_DURATION_MINUTES,
      })
      .then((data) => {
        onEvent({ type: StytchEventType.PasskeyRegister, data });
        dispatch({ type: 'transition', screen: AppScreens.PasskeyRegistrationSuccess });
      })
      .catch((e: StytchAPIError) => {
        onError(e);

        if (
          e.message.includes(SAFARI_CROSS_DEVICE_DUPLICATE_REG_ERROR_MESSAGE) ||
          e.message.includes(CHROME_CROSS_DEVICE_DUPLICATE_REG_ERROR_MESSAGE)
        ) {
          setError(
            t({
              id: 'error.duplicatePasskey',
              message:
                'The Passkey cannot be created as it seems to be already registered. It is possible this Passkey was registered on another device but has synced cross-device.',
            }),
          );
          return;
        } else {
          setError(
            t({
              id: 'error.passkeyNotCreated',
              message:
                'Your Passkey was not created. Click “Create a Passkey” to try again or skip without adding a Passkey.',
            }),
          );
        }
      });
  };

  const onSkip = () => {
    onEvent({ type: StytchEventType.PasskeySkip, data: {} });
    dispatch({ type: 'transition', screen: AppScreens.PasskeyRegistrationSuccess });
  };

  if (userState === 'loading') {
    return <LoadingScreen />;
  }

  if (userState === 'noUser') {
    return (
      <ErrorText>
        {t({
          id: 'passkey.registrationStart.error.noUser',
          message: 'Error: Cannot use PasskeyRegistration component without active user authenticated.',
        })}
      </ErrorText>
    );
  }

  return (
    <Column gap={6}>
      <TextColumn
        header={t({
          id: 'passkey.registrationStart.title',
          message: 'Set up a new Passkey',
        })}
        body={t({
          id: 'passkey.registrationStart.subtitle',
          message: "With Passkeys you don't need to remember complex passwords.",
        })}
        helper={t({
          id: 'passkey.registrationStart.description',
          message:
            'Passkeys are encrypted digital keys you create using your fingerprint, face, or screen lock. Creating a Passkey will allow you to easily and securely log in to your account.',
        })}
      />

      <ButtonColumn>
        <Button variant="primary" onClick={() => onCreatePasskey()}>
          {t({
            id: 'button.createPasskey',
            message: 'Create a Passkey',
          })}
        </Button>

        {error && <ErrorText>{error}</ErrorText>}

        <Button variant="ghost" onClick={() => onSkip()}>
          {t({
            id: 'button.skip',
            message: 'Skip',
          })}
        </Button>
      </ButtonColumn>
    </Column>
  );
};
