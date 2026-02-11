import React, { useState, useMemo, useEffect } from 'react';
import { useLingui } from '@lingui/react/macro';
import styled from 'styled-components';
import { DEFAULT_SESSION_DURATION_MINUTES } from '@stytch/core';
import { StytchAPIError, StytchEventType } from '@stytch/core/public';

import { Flex } from '../../../components/Flex';
import { Text } from '../../../components/Text';
import Button from '../../../components/Button';
import { CircularProgress } from '../../../components/CircularProgress';
import { PasswordInput } from '../../../components/PasswordInput';

import {
  useGlobalReducer,
  useStytch,
  AppScreens,
  useConfig,
  useErrorCallback,
  useEventCallback,
} from '../../GlobalContextProvider';
import { Divider } from '../../../components/Divider';

import { debounce } from '../../../../utils';
import { SubmitButton } from '../../../components/SubmitButton';

import { PasswordB2CError } from '../../../components/PasswordError';
import { ErrorText } from '../../../components/ErrorText';
import { getTranslatedError } from '../../../../utils/getTranslatedError';
import { useErrorProps } from '../../../../utils/accessibility';
import { Label } from '../../../components/Label';

const Form = styled.form`
  width: 100%;
`;

export const ResetPasswordScreen = () => {
  const { t } = useLingui();
  const stytchClient = useStytch();
  const config = useConfig();
  const [state, dispatch] = useGlobalReducer();
  const passwordToken = state.formState.resetPasswordState.token;

  const onEvent = useEventCallback();
  const onError = useErrorCallback();

  const resetTokenType = useMemo(() => {
    const parsed = stytchClient.parseAuthenticateUrl();
    return parsed?.tokenType ?? '';
  }, [stytchClient]);

  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [passwordScore, setPasswordScore] = useState<number>(0);
  const [passwordWarning, setPasswordWarning] = useState('');
  const [passwordSuggestions, setPasswordSuggestions] = useState<string[]>([]);
  const [invalidPassword, setInvalidPassword] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [strengthPolicy, setStrengthPolicy] = useState<'zxcvbn' | 'luds' | 'none'>('none');
  const [missingCharacters, setMissingCharacters] = useState(0);
  const [missingComplexity, setMissingComplexity] = useState(0);
  const [isPasswordBreached, setIsPasswordBreached] = useState(false);
  const [loginErrorMessage, setLoginErrorMessage] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const passwordProps = useErrorProps(errorMessage);

  const updateStrengthCheck = useMemo(() => {
    return debounce((password: string) =>
      stytchClient.passwords
        .strengthCheck({ password })
        .then(({ score, feedback, valid_password, strength_policy, breached_password }) => {
          setStrengthPolicy(strength_policy);
          setInvalidPassword(!valid_password);

          if (strength_policy === 'zxcvbn') {
            setPasswordScore(score);
            setPasswordWarning(feedback.warning);
            setPasswordSuggestions(feedback.suggestions);
            setIsPasswordBreached(breached_password);
          } else if (strength_policy === 'luds') {
            setMissingCharacters(feedback.luds_requirements.missing_characters);
            setMissingComplexity(feedback.luds_requirements.missing_complexity);
            setIsPasswordBreached(breached_password);
          }
        }),
    );
  }, [stytchClient.passwords]);

  useEffect(() => {
    if (resetTokenType === 'login') {
      stytchClient.magicLinks
        .authenticate(passwordToken, {
          session_duration_minutes: config.sessionOptions?.sessionDurationMinutes ?? DEFAULT_SESSION_DURATION_MINUTES,
        })
        .then(() => {
          dispatch({ type: 'transition', screen: AppScreens.PasswordConfirmation });
        })
        .catch((e: Error) => {
          onError(e);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- SDK-1354
  }, [resetTokenType]);

  const onPasswordChange = (password: string) => {
    setPassword(password);
    updateStrengthCheck(password);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);
    stytchClient.passwords
      .resetByEmail({
        token: passwordToken,
        password,
        session_duration_minutes: config.sessionOptions?.sessionDurationMinutes ?? DEFAULT_SESSION_DURATION_MINUTES,
      })
      .then((data) => {
        setIsSubmitting(false);
        onEvent({ type: StytchEventType.PasswordResetByEmail, data });
        dispatch({ type: 'transition', screen: AppScreens.PasswordConfirmation });
      })
      .catch((e: StytchAPIError) => {
        onError(e);
        setErrorMessage(getTranslatedError(e, t));
        setIsSubmitting(false);
      });
  };

  const handleLogin = () => {
    setLoginErrorMessage('');
    setIsLoggingIn(true);
    stytchClient.magicLinks
      .authenticate(passwordToken, {
        session_duration_minutes: config.sessionOptions?.sessionDurationMinutes ?? DEFAULT_SESSION_DURATION_MINUTES,
      })
      .then(() => {
        dispatch({ type: 'transition', screen: AppScreens.PasswordConfirmation });
      })
      .catch((e: StytchAPIError) => {
        onError(e);
        setLoginErrorMessage(getTranslatedError(e, t));
      })
      .finally(() => {
        setIsLoggingIn(false);
      });
  };

  if (resetTokenType === 'login') {
    return (
      <Flex direction="column" gap={36} className={'resetPasswordContainer'} alignItems="center">
        <Text size="header">
          {t({
            id: 'password.reset.loggingInProgress',
            message: 'Logging in...',
          })}
        </Text>
        <CircularProgress size={100} thickness={2} />
      </Flex>
    );
  }
  return (
    <Flex direction="column" gap={36} className={'resetPasswordContainer'} alignItems="center" width="100%">
      <Text size="header">
        {t({
          id: 'password.reset.title',
          message: 'Reset your password',
        })}
      </Text>
      <Form onSubmit={handleSubmit}>
        <Flex direction="column" gap={8}>
          <Flex direction="column" gap={2}>
            <Label htmlFor="new-password">
              {t({
                id: 'formField.password.label',
                message: 'Password',
              })}
            </Label>
            <PasswordInput password={password} setPassword={onPasswordChange} type="new" {...passwordProps.input} />
            <div {...passwordProps.error}>
              <PasswordB2CError
                passwordPolicy={strengthPolicy}
                passwordScore={passwordScore}
                errorMessage={errorMessage}
                passwordWarning={passwordWarning}
                passwordSuggestions={passwordSuggestions}
                missingCharacters={missingCharacters}
                missingComplexity={missingComplexity}
                isPasswordBreached={isPasswordBreached}
              />
            </div>
          </Flex>
          <SubmitButton
            isSubmitting={isSubmitting}
            text={t({
              id: 'button.continue',
              message: 'Continue',
            })}
            disabled={invalidPassword}
          />
        </Flex>
      </Form>
      <Divider />
      <Flex direction="column" gap={8} width="100%">
        <Button type="button" variant="text" disabled={isLoggingIn} onClick={handleLogin}>
          {isLoggingIn ? (
            <Flex justifyContent="center" alignItems="center" gap={8}>
              <CircularProgress size={18} thickness={1} />
              {t({
                id: 'login.loading',
                message: 'Logging in...',
              })}
            </Flex>
          ) : (
            t({
              id: 'password.reset.loginWithoutPassword',
              message: 'Login without a password',
            })
          )}
        </Button>
        {loginErrorMessage && <ErrorText errorMessage={loginErrorMessage} />}
      </Flex>
    </Flex>
  );
};
