import { useLingui } from '@lingui/react/macro';
import { DEFAULT_SESSION_DURATION_MINUTES } from '@stytch/core';
import { StytchAPIError, StytchEventType } from '@stytch/core/public';
import React, { useEffect, useMemo, useState } from 'react';

import { debounce } from '../../../../utils';
import { getTranslatedError } from '../../../../utils/getTranslatedError';
import Button from '../../../components/atoms/Button';
import Column from '../../../components/atoms/Column';
import Typography from '../../../components/atoms/Typography';
import VerticalTransition from '../../../components/atoms/VerticalTransition';
import ButtonColumn from '../../../components/molecules/ButtonColumn';
import ErrorText from '../../../components/molecules/ErrorText';
import { getNewPasswordProps, PasswordError, PasswordErrorProps } from '../../../components/molecules/PasswordError';
import { PasswordInput } from '../../../components/molecules/PasswordInput';
import {
  AppScreens,
  useConfig,
  useErrorCallback,
  useEventCallback,
  useGlobalReducer,
  useStytch,
} from '../../GlobalContextProvider';
import { useBootstrap } from '../../utils';

export const ResetPasswordScreen = () => {
  const { t } = useLingui();
  const stytchClient = useStytch();
  const config = useConfig();
  const { bootstrap } = useBootstrap();
  const [state, dispatch] = useGlobalReducer();
  const passwordToken = state.formState.resetPasswordState.token;

  const onEvent = useEventCallback();
  const onError = useErrorCallback();

  const resetTokenType = useMemo(() => {
    const parsed = stytchClient.parseAuthenticateUrl();
    return parsed?.tokenType ?? '';
  }, [stytchClient]);

  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState<PasswordErrorProps>({ policy: 'notLoaded' });
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Passwordless login states
  const [loginErrorMessage, setLoginErrorMessage] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const updateStrengthCheck = useMemo(
    () =>
      debounce((password: string) => {
        setErrorMessage('');
        return stytchClient.passwords
          .strengthCheck({ password })
          .then(({ score, feedback, valid_password, strength_policy, breached_password }) => {
            const common = {
              passwordInvalid: !valid_password,
              isPasswordBreached: breached_password,
            };

            if (strength_policy === 'zxcvbn') {
              setPasswordError({
                policy: strength_policy,
                ...common,
                passwordScore: score,
                passwordWarning: feedback.warning,
                passwordSuggestions: feedback.suggestions,
              });
            } else if (strength_policy === 'luds') {
              setPasswordError({
                policy: strength_policy,
                ...common,
                missingCharacters: feedback.luds_requirements.missing_characters,
                missingComplexity: feedback.luds_requirements.missing_complexity,
              });
            }
          });
      }),
    [stytchClient.passwords],
  );

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

  const handlePasswordlessLogin = () => {
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
      // Same as <LoggingInScreen>, but use its own string ID
      <Typography variant="header" align="center">
        {t({
          id: 'password.reset.loggingInProgress',
          message: 'Logging in...',
        })}
      </Typography>
    );
  }

  const passwordInputProps = getNewPasswordProps(bootstrap, passwordError.policy);

  return (
    <form onSubmit={handleSubmit}>
      <Column gap={6}>
        <Typography variant="header">
          {t({
            id: 'password.reset.title',
            message: 'Reset your password',
          })}
        </Typography>

        <Column gap={2}>
          <PasswordInput
            password={password}
            setPassword={onPasswordChange}
            error={errorMessage}
            {...passwordInputProps}
          />

          <div>
            {errorMessage && <ErrorText>{errorMessage}</ErrorText>}
            <PasswordError bootstrap={bootstrap} {...passwordError} />
          </div>
        </Column>

        <ButtonColumn
          top={
            <Button
              variant="primary"
              loading={isSubmitting}
              type="submit"
              disabled={passwordError.policy === 'notLoaded' || passwordError.passwordInvalid}
            >
              {t({
                id: 'button.continue',
                message: 'Continue',
              })}
            </Button>
          }
          bottom={
            <Column gap={2}>
              <Button variant="outline" disabled={isLoggingIn} onClick={handlePasswordlessLogin} loading={isLoggingIn}>
                <VerticalTransition
                  primary={t({
                    id: 'password.reset.loginWithoutPassword',
                    message: 'Login without a password',
                  })}
                  secondary={t({
                    id: 'login.loading',
                    message: 'Logging in...',
                  })}
                  triggered={isLoggingIn}
                />
              </Button>

              {loginErrorMessage && <ErrorText>{loginErrorMessage}</ErrorText>}
            </Column>
          }
        />
      </Column>
    </form>
  );
};
