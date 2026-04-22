import { useLingui } from '@lingui/react/macro';
import { DEFAULT_SESSION_DURATION_MINUTES } from '@stytch/core';
import { StytchAPIError, StytchEventType } from '@stytch/core/public';
import React, { useEffect, useMemo, useState } from 'react';

import { B2BSubscriptionDataLayer } from '../../../SubscriptionService';
import { debounce, noop } from '../../../utils';
import { clearStytchTokenParams } from '../../../utils/createAuthUrlHandler';
import { getTranslatedError } from '../../../utils/getTranslatedError';
import { readB2BInternals } from '../../../utils/internal';
import Button from '../../components/atoms/Button';
import Column from '../../components/atoms/Column';
import Typography from '../../components/atoms/Typography';
import EmailInput from '../../components/molecules/EmailInput';
import { getNewPasswordProps, PasswordError, PasswordErrorProps } from '../../components/molecules/PasswordError';
import { PasswordInput } from '../../components/molecules/PasswordInput';
import { useConfig, useErrorCallback, useEventCallback, useGlobalReducer, useStytch } from '../GlobalContextProvider';
import { AppScreens } from '../types/AppScreens';
import { onAuthenticateSuccess, useBootstrap as useB2BBootstrap } from '../utils';

export const PasswordResetForm = () => {
  const stytchClient = useStytch();
  const config = useConfig();
  const [, dispatch] = useGlobalReducer();
  const bootstrap = useB2BBootstrap();
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
  const [passwordError, setPasswordError] = useState<PasswordErrorProps>({ policy: 'notLoaded' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateStrengthCheck = useMemo(
    () =>
      debounce((password: string) => {
        setErrorMessage('');
        return stytchClient.passwords
          .strengthCheck({ password })
          .then(({ score, valid_password, zxcvbn_feedback, luds_feedback, strength_policy, breached_password }) => {
            const common = {
              passwordInvalid: !valid_password,
              isPasswordBreached: breached_password,
            };

            if (strength_policy === 'zxcvbn') {
              setPasswordError({
                policy: strength_policy,
                ...common,
                passwordScore: score,
                passwordWarning: zxcvbn_feedback.warning,
                passwordSuggestions: zxcvbn_feedback.suggestions,
              });
            } else if (strength_policy === 'luds') {
              setPasswordError({
                policy: strength_policy,
                ...common,
                missingCharacters: luds_feedback.missing_characters,
                missingComplexity: luds_feedback.missing_complexity,
              });
            }
          })
          .catch((e: StytchAPIError) => {
            setErrorMessage(getTranslatedError(e, t));
          });
      }),
    [stytchClient.passwords, t],
  );

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
          dispatch({
            type: 'set_discovery_state',
            email: data.email_address,
            discoveredOrganizations: data.discovered_organizations,
          });
          dispatch({ type: 'transition', screen: AppScreens.Discovery });
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

  const passwordInputProps = getNewPasswordProps(bootstrap, passwordError.policy);

  return (
    <Column gap={6} as="form" onSubmit={handleSubmit}>
      <Typography variant="header">{t({ id: 'password.setNew.title', message: 'Set a new password' })}</Typography>

      <Column gap={2}>
        {email ? <EmailInput email={email} setEmail={noop} disabled /> : null}

        <PasswordInput
          password={password}
          setPassword={onPasswordChange}
          error={errorMessage}
          {...passwordInputProps}
        />

        <PasswordError bootstrap={bootstrap} {...passwordError} />

        <Button
          variant="primary"
          loading={isSubmitting}
          type="submit"
          disabled={passwordError.policy === 'notLoaded' || passwordError.passwordInvalid}
        >
          {t({ id: 'button.continue', message: 'Continue' })}
        </Button>
      </Column>
    </Column>
  );
};
