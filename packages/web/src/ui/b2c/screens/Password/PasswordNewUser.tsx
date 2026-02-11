import { useLingui } from '@lingui/react/macro';
import { DEFAULT_SESSION_DURATION_MINUTES } from '@stytch/core';
import { StytchAPIError, StytchEventType } from '@stytch/core/public';
import React, { useMemo, useState } from 'react';

import { convertPasswordResetOptions, debounce, noop } from '../../../../utils';
import { getTranslatedError } from '../../../../utils/getTranslatedError';
import Button from '../../../components/atoms/Button';
import Column from '../../../components/atoms/Column';
import EmailInput from '../../../components/molecules/EmailInput';
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

export const PasswordNewUser = () => {
  const { t } = useLingui();
  const stytchClient = useStytch();
  const { bootstrap } = useBootstrap();
  const config = useConfig();
  const passwordOptions = config.passwordOptions;

  const [state, dispatch] = useGlobalReducer();

  const onEvent = useEventCallback();
  const onError = useErrorCallback();

  const email = state.formState.passwordState.email;
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [passwordError, setPasswordError] = useState<PasswordErrorProps>({ policy: 'notLoaded' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateStrengthCheck = useMemo(
    () =>
      debounce((email: string, password: string) => {
        setErrorMessage('');
        stytchClient.passwords
          .strengthCheck({ email, password })
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
          })
          .catch((e: StytchAPIError) => {
            setErrorMessage(getTranslatedError(e, t));
          });
      }),
    [stytchClient.passwords, t],
  );

  const onPasswordChange = (password: string) => {
    setPassword(password);
    updateStrengthCheck(email, password);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);
    stytchClient.passwords
      .create({
        email,
        password,
        session_duration_minutes: config.sessionOptions?.sessionDurationMinutes ?? DEFAULT_SESSION_DURATION_MINUTES,
      })
      .then((data) => {
        setIsSubmitting(false);
        onEvent({ type: StytchEventType.PasswordCreate, data });
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

  const passwordInputProps = getNewPasswordProps(bootstrap, passwordError.policy);

  return (
    <Column as="form" onSubmit={handleSubmit} gap={4}>
      <EmailInput email={email} setEmail={noop} disabled />

      <PasswordInput password={password} setPassword={onPasswordChange} error={errorMessage} {...passwordInputProps} />

      <PasswordError bootstrap={bootstrap} {...passwordError} />

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
    </Column>
  );
};
