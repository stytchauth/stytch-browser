import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { DEFAULT_SESSION_DURATION_MINUTES } from '@stytch/core';
import { StytchAPIError, StytchEventType } from '@stytch/core/public';
import { useConfig, useErrorCallback, useEventCallback, useGlobalReducer, useStytch } from '../GlobalContextProvider';
import { AppScreens } from '../types/AppScreens';
import { debounce } from '../../../utils';
import { Flex } from '../../components/Flex';
import { Text } from '../../components/Text';
import { SubmitButton } from '../../components/SubmitButton';
import { PasswordInput } from '../../components/PasswordInput';
import { Input } from '../../components/Input';
import { readB2BInternals } from '../../../utils/internal';
import { B2BSubscriptionDataLayer } from '../../../SubscriptionService';
import { onAuthenticateSuccess } from '../utils';
import { useLingui } from '@lingui/react/macro';

import { PasswordB2BError } from '../../components/PasswordError';
import { clearStytchTokenParams } from '../../../utils/createAuthUrlHandler';
import { getTranslatedError } from '../../../utils/getTranslatedError';
import { useErrorProps } from '../../../utils/accessibility';
import { Label } from '../../components/Label';

const Form = styled.form`
  width: 100%;
`;

export const PasswordResetForm = () => {
  const stytchClient = useStytch();
  const config = useConfig();
  const [, dispatch] = useGlobalReducer();
  const { t } = useLingui();

  const onEvent = useEventCallback();
  const onError = useErrorCallback();

  const [resetToken, resetTokenType] = useMemo(() => {
    const parsed = stytchClient.parseAuthenticateUrl();
    if (!parsed) return ['', ''];
    return [parsed.token, parsed.tokenType];
  }, [stytchClient]);

  const dataLayer = readB2BInternals(stytchClient).dataLayer as B2BSubscriptionDataLayer;
  const email = dataLayer.getItem('reset-email-value');
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
    return debounce((password: string) =>
      stytchClient.passwords
        .strengthCheck({ password })
        .then(({ score, valid_password, zxcvbn_feedback, luds_feedback, strength_policy, breached_password }) => {
          setStrengthPolicy(strength_policy);
          setInvalidPassword(!valid_password);

          if (strength_policy === 'zxcvbn') {
            setPasswordScore(score);
            setPasswordWarning(zxcvbn_feedback.warning);
            setPasswordSuggestions(zxcvbn_feedback.suggestions);
            setIsPasswordBreached(breached_password);
          } else if (strength_policy === 'luds') {
            setMissingCharacters(luds_feedback.missing_characters);
            setMissingComplexity(luds_feedback.missing_complexity);
            setIsPasswordBreached(breached_password);
          }
        }),
    );
  }, [stytchClient.passwords]);

  useEffect(() => {
    if (resetTokenType === 'multi_tenant_magic_links') {
      stytchClient.magicLinks
        .authenticate({
          magic_links_token: resetToken,
          session_duration_minutes: config.sessionOptions?.sessionDurationMinutes ?? DEFAULT_SESSION_DURATION_MINUTES,
          locale: config.emailMagicLinksOptions?.locale,
        })
        .then((data) => {
          clearStytchTokenParams();
          dispatch({
            type: 'primary_authenticate_success',
            response: data,
            includedMfaMethods: config.mfaProductInclude,
            resetTokenType,
          });
        })
        .catch((e: StytchAPIError) => {
          setErrorMessage(getTranslatedError(e, t));
          onError(e);
        });
      return;
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

    if (resetTokenType == 'multi_tenant_passwords') {
      stytchClient.passwords
        .resetByEmail({
          password_reset_token: resetToken,
          password,
          session_duration_minutes: config.sessionOptions?.sessionDurationMinutes ?? DEFAULT_SESSION_DURATION_MINUTES,
          locale: config.passwordOptions?.locale,
        })
        .then((data) => {
          setIsSubmitting(false);
          onEvent({ type: StytchEventType.B2BPasswordResetByEmail, data });
          onAuthenticateSuccess(data, dispatch, config);
        })
        .catch((e: StytchAPIError) => {
          onError(e);
          setErrorMessage(getTranslatedError(e, t));
          setIsSubmitting(false);
        });
    } else if (resetTokenType == 'discovery') {
      stytchClient.passwords.discovery
        .resetByEmail({
          password_reset_token: resetToken,
          password,
        })
        .then((data) => {
          setIsSubmitting(false);
          onEvent({ type: StytchEventType.B2BDiscoveryPasswordReset, data });
          dispatch({ type: 'transition', screen: AppScreens.Discovery });
          dispatch({
            type: 'set_discovery_state',
            email: data.email_address,
            discoveredOrganizations: data.discovered_organizations,
          });
        })
        .catch((e: StytchAPIError) => {
          onError(e);
          setErrorMessage(getTranslatedError(e, t));
          setIsSubmitting(false);
        });
    } else {
      stytchClient.passwords
        .resetBySession({ password })
        .then((data) => {
          setIsSubmitting(false);
          onEvent({ type: StytchEventType.B2BPasswordResetBySession, data });
          dispatch({ type: 'transition', screen: AppScreens.LoggedIn });
        })
        .catch((e: StytchAPIError) => {
          onError(e);
          setErrorMessage(getTranslatedError(e, t));
          setIsSubmitting(false);
        });
    }
  };

  return (
    <Flex direction="column" gap={36} className={'resetPasswordContainer'}>
      <Text size="header">{t({ id: 'password.setNew.title', message: 'Set a new password' })}</Text>
      <Form onSubmit={handleSubmit}>
        <Flex direction="column" gap={8}>
          {email ? (
            <Flex direction="column" gap={2}>
              <Label htmlFor="email-input">{t({ id: 'formField.email.label', message: 'Email' })}</Label>
              <Input disabled name="email" id="email-input" value={email} />
            </Flex>
          ) : (
            <></>
          )}
          <Flex direction="column" gap={2}>
            <Label htmlFor="new-password">{t({ id: 'formField.password.label', message: 'Password' })}</Label>
            <PasswordInput password={password} setPassword={onPasswordChange} type="new" {...passwordProps.input} />
            <div {...passwordProps.error}>
              <PasswordB2BError
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
            text={t({ id: 'button.continue', message: 'Continue' })}
            disabled={invalidPassword}
          />
        </Flex>
      </Form>
    </Flex>
  );
};
