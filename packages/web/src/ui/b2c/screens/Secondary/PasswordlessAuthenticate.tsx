import { useLingui } from '@lingui/react/macro';
import { StytchAPIError, StytchEventType } from '@stytch/core/public';
import React, { useState } from 'react';

import { convertPasswordResetOptions } from '../../../../utils';
import { getTranslatedError } from '../../../../utils/getTranslatedError';
import Button from '../../../components/atoms/Button';
import Column from '../../../components/atoms/Column';
import Divider from '../../../components/molecules/Divider';
import ErrorText from '../../../components/molecules/ErrorText';
import { useMountEffect } from '../../../hooks/useMountEffect';
import {
  AppScreens,
  useConfig,
  useErrorCallback,
  useEventCallback,
  useGlobalReducer,
  useStytch,
} from '../../GlobalContextProvider';
import { EmailConfirmation } from './EmailConfirmation';
import { OTPAuthenticate } from './OTPAuthenticate';
import { usePasswordlessAuthenticate } from './usePasswordlessAuthenticate';

type PasswordlessAuthenticateProps = {
  secondaryType: 'eml' | 'otp' | undefined;
};

export const PasswordlessAuthenticate = ({ secondaryType }: PasswordlessAuthenticateProps) => {
  const { t } = useLingui();
  const stytchClient = useStytch();
  const config = useConfig();
  const [state, dispatch] = useGlobalReducer();
  const onEvent = useEventCallback();
  const onError = useErrorCallback();

  const [errorMessage, setErrorMessage] = useState('');

  const { sendLink, sendCode } = usePasswordlessAuthenticate();
  const passwordOptions = config.passwordOptions;

  const email = state.formState.passwordState.email;

  const resetPassword = () => {
    stytchClient.passwords
      .resetByEmailStart(convertPasswordResetOptions(email, passwordOptions))
      .then((data) => {
        onEvent({ type: StytchEventType.PasswordResetByEmailStart, data });
        dispatch({ type: 'transition', screen: AppScreens.PasswordSetNew });
      })
      .catch((e: StytchAPIError) => {
        onError(e);
        setErrorMessage(getTranslatedError(e, t));
      });
  };

  useMountEffect(() => {
    switch (secondaryType) {
      case 'eml':
        sendLink().catch(() => {
          // Swallow error to avoid unhandled promise errors, sendLink() will already show error toast
        });
        return;

      case 'otp':
        sendCode().catch(() => {
          // Swallow error to avoid unhandled promise errors, sendLink() will already show error toast
        });
        return;

      default:
        stytchClient.passwords
          .resetByEmailStart(convertPasswordResetOptions(email, passwordOptions))
          .then((data) => {
            onEvent({ type: StytchEventType.PasswordResetByEmailStart, data });
            dispatch({ type: 'transition', screen: AppScreens.PasswordSetNew });
          })
          .catch((e: StytchAPIError) => {
            onError(e);
          });
        return;
    }
  });

  if (!secondaryType) {
    return null;
  }

  return (
    <>
      {secondaryType === 'eml' ? <EmailConfirmation showGoBack={false} /> : <OTPAuthenticate hideBackButton />}

      <Divider />

      <Column gap={2}>
        <Button onClick={resetPassword} variant="outline">
          {t({ id: 'button.createPasswordInstead', message: 'Create a password instead' })}
        </Button>
        {errorMessage && <ErrorText>{errorMessage}</ErrorText>}
      </Column>
    </>
  );
};
