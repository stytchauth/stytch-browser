import React, { useState } from 'react';
import { useLingui } from '@lingui/react/macro';
import styled from 'styled-components';
import { DEFAULT_SESSION_DURATION_MINUTES } from '@stytch/core';
import { StytchEventType, StytchAPIError } from '@stytch/core/public';

import { Flex } from '../../../components/Flex';
import { Text } from '../../../components/Text';
import { SubmitButton } from '../../../components/SubmitButton';
import { EmailInput } from '../../../components/EmailInput';
import { PasswordInput } from '../../../components/PasswordInput';
import { ErrorText } from '../../../components/ErrorText';

import {
  useGlobalReducer,
  useStytch,
  AppScreens,
  useConfig,
  useEventCallback,
  useErrorCallback,
} from '../../GlobalContextProvider';
import { convertPasswordResetOptions } from '../../../../utils';
import { getTranslatedError } from '../../../../utils/getTranslatedError';
import { useErrorProps } from '../../../../utils/accessibility';
import { Label } from '../../../components/Label';

const ForgotPassword = styled(Text)`
  text-decoration: underline;
  cursor: pointer;
`;

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

  const passwordProps = useErrorProps(errorMessage);

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
    <Flex direction="column" gap={36}>
      <Text size="header">{t({ id: 'password.login.title', message: 'Log In' })}</Text>
      <form onSubmit={handleSubmit}>
        <Flex direction="column" gap={8}>
          <Flex direction="column" gap={2}>
            <Label htmlFor="email-input">{t({ id: 'formField.email.label', message: 'Email' })}</Label>
            <EmailInput email={email} setEmail={setEmail} disableInput={true} />
          </Flex>
          <Flex direction="column" gap={2}>
            <Label htmlFor="current-password">{t({ id: 'formField.password.label', message: 'Password' })}</Label>
            <PasswordInput password={password} setPassword={setPassword} type="current" {...passwordProps.input} />
            <ErrorText errorMessage={errorMessage} {...passwordProps.error} />
          </Flex>
          <Flex justifyContent="flex-end">
            <ForgotPassword onClick={onForgot}>
              {t({ id: 'button.forgotPassword', message: 'Forgot Password?' })}
            </ForgotPassword>
          </Flex>
          <SubmitButton isSubmitting={isSubmitting} text={t({ id: 'button.continue', message: 'Continue' })} />
        </Flex>
      </form>
    </Flex>
  );
};
