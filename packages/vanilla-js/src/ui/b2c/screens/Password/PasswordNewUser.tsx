import React, { useMemo, useState } from 'react';
import { useLingui } from '@lingui/react/macro';
import { StytchAPIError, StytchEventType } from '@stytch/core/public';
import { DEFAULT_SESSION_DURATION_MINUTES } from '@stytch/core';

import { Flex } from '../../../components/Flex';
import { Text } from '../../../components/Text';
import { SubmitButton } from '../../../components/SubmitButton';
import { EmailInput } from '../../../components/EmailInput';
import { PasswordInput } from '../../../components/PasswordInput';

import {
  AppScreens,
  useConfig,
  useErrorCallback,
  useEventCallback,
  useGlobalReducer,
  useStytch,
} from '../../GlobalContextProvider';

import { convertPasswordResetOptions, debounce } from '../../../../utils';

import { PasswordB2CError } from '../../../components/PasswordError';
import { getTranslatedError } from '../../../../utils/getTranslatedError';
import { useErrorProps } from '../../../../utils/accessibility';
import { Label } from '../../../components/Label';

export const PasswordNewUser = () => {
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
  const [passwordScore, setPasswordScore] = useState<number>(0);
  const [passwordWarning, setPasswordWarning] = useState('');
  const [passwordSuggestions, setPasswordSuggestions] = useState<string[]>([]);
  const [invalidPassword, setInvalidPassword] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [strengthPolicy, setStrengthPolicy] = useState<'zxcvbn' | 'luds' | 'none'>('none');
  const [missingCharacters, setMissingCharacters] = useState(0);
  const [missingComplexity, setMissingComplexity] = useState(0);
  const [isPasswordBreached, setIsPasswordBreached] = useState(false);

  const passwordProps = useErrorProps(errorMessage);

  const updateStrengthCheck = useMemo(() => {
    return debounce((email: string, password: string) => {
      setErrorMessage('');
      stytchClient.passwords
        .strengthCheck({ email, password })
        .then(({ score, feedback, valid_password, strength_policy, breached_password }) => {
          setStrengthPolicy(strength_policy);

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

          setInvalidPassword(!valid_password);
        })
        .catch((e: StytchAPIError) => {
          setErrorMessage(getTranslatedError(e, t));
        });
    });
  }, [stytchClient.passwords, t]);

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

  return (
    <form onSubmit={handleSubmit}>
      <Flex direction="column" gap={8}>
        <Text>
          {t({
            id: 'password.createAccount.content',
            message: 'Finish creating your account by setting a password.',
          })}
        </Text>
        <Flex direction="column" gap={2}>
          <Label htmlFor="email-input">
            {t({
              id: 'formField.email.label',
              message: 'Email',
            })}
          </Label>
          <EmailInput email={email} setEmail={setEmail} disableInput={true} />
        </Flex>
        <Flex direction="column" gap={4}>
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
    </form>
  );
};
