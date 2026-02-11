import { useLingui } from '@lingui/react/macro';
import { DEFAULT_SESSION_DURATION_MINUTES } from '@stytch/core';
import { StytchAPIError, StytchEventType } from '@stytch/core/public';
import React, { useState } from 'react';

import { convertPasswordResetOptions } from '../../../../utils';
import { getTranslatedError } from '../../../../utils/getTranslatedError';
import Button from '../../../components/atoms/Button';
import Column from '../../../components/atoms/Column';
import ButtonColumn from '../../../components/molecules/ButtonColumn';
import EmailInput from '../../../components/molecules/EmailInput';
import { PasswordInput } from '../../../components/molecules/PasswordInput';
import {
  AppScreens,
  useConfig,
  useErrorCallback,
  useEventCallback,
  useGlobalReducer,
  useStytch,
} from '../../GlobalContextProvider';

export const PasswordAuthenticate = () => {
  const { t } = useLingui();
  const stytchClient = useStytch();
  const config = useConfig();
  const passwordOptions = config.passwordOptions;
  const [state, dispatch] = useGlobalReducer();

  const onEvent = useEventCallback();
  const onError = useErrorCallback();

  const [email, setEmail] = useState(state.formState.passwordState.email);
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);
    stytchClient.passwords
      .authenticate({
        email,
        password,
        session_duration_minutes: config.sessionOptions?.sessionDurationMinutes ?? DEFAULT_SESSION_DURATION_MINUTES,
      })
      .then((data) => {
        setIsSubmitting(false);
        onEvent({ type: StytchEventType.PasswordAuthenticate, data });
        dispatch({ type: 'transition', screen: AppScreens.PasswordConfirmation });
      })
      .catch((e: StytchAPIError) => {
        onError(e);
        if (e.error_type === 'reset_password') {
          stytchClient.passwords.resetByEmailStart(convertPasswordResetOptions(email, passwordOptions)).then(() => {
            dispatch({ type: 'transition', screen: AppScreens.PasswordDedupe });
          });
        } else {
          setErrorMessage(getTranslatedError(e, t));
        }
        setIsSubmitting(false);
      });
  };

  const onForgot = () => {
    stytchClient.passwords.resetByEmailStart(convertPasswordResetOptions(email, passwordOptions)).then(() => {
      dispatch({ type: 'transition', screen: AppScreens.PasswordForgot });
    });
  };

  return (
    <Column as="form" onSubmit={handleSubmit} gap={4}>
      <EmailInput email={email} setEmail={setEmail} disabled />

      <PasswordInput password={password} setPassword={setPassword} type="current" error={errorMessage} />

      <ButtonColumn>
        <Button variant="primary" loading={isSubmitting} type="submit">
          {t({ id: 'button.continue', message: 'Continue' })}
        </Button>

        <Button variant="outline" onClick={onForgot}>
          {t({ id: 'button.forgotPassword', message: 'Forgot your password?' })}
        </Button>
      </ButtonColumn>
    </Column>
  );
};
