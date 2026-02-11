import { useLingui } from '@lingui/react/macro';
import { StytchAPIError, StytchEventType } from '@stytch/core/public';
import React from 'react';

import { EMAIL_REGEX } from '../../../utils';
import { getTranslatedError } from '../../../utils/getTranslatedError';
import { readB2BInternals } from '../../../utils/internal';
import Button from '../../components/atoms/Button';
import Column from '../../components/atoms/Column';
import Typography from '../../components/atoms/Typography';
import ButtonColumn from '../../components/molecules/ButtonColumn';
import EmailInput from '../../components/molecules/EmailInput';
import { useConfig, useEventCallback, useGlobalReducer } from '../GlobalContextProvider';
import { AppScreens } from '../types/AppScreens';
import { usePasswordInput } from '../usePasswordInput';

export const PasswordsForgotForm = () => {
  const [, dispatch] = useGlobalReducer();
  const config = useConfig();
  const onEvent = useEventCallback();
  const { t } = useLingui();

  const {
    stytch,
    email,
    setEmail,
    organization,
    errorMessage,
    setErrorMessage,
    isSubmitting,
    setIsSubmitting,
    handleNonMemberReset,
  } = usePasswordInput();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email.match(EMAIL_REGEX)) {
      setErrorMessage(t({ id: 'error.invalidEmailAddress', message: 'Invalid email address' }));
      return;
    }
    setErrorMessage('');
    setIsSubmitting(true);
    if (organization) {
      readB2BInternals(stytch)
        .searchManager.searchMember(email, organization.organization_id)
        .then(({ member }) => {
          if (!member) {
            handleNonMemberReset();
            return;
          }
          // Member password flow: call reset password start instead
          stytch.passwords
            .resetByEmailStart({
              email_address: email,
              organization_id: organization.organization_id,
              login_redirect_url: config.emailMagicLinksOptions?.loginRedirectURL,
              reset_password_redirect_url: config.passwordOptions?.resetPasswordRedirectURL,
              reset_password_expiration_minutes: config.passwordOptions?.resetPasswordExpirationMinutes,
              reset_password_template_id: config.passwordOptions?.resetPasswordTemplateId,
              verify_email_template_id: config.passwordOptions?.verifyEmailTemplateId,
              locale: config.passwordOptions?.locale,
            })
            .then((data) => {
              setIsSubmitting(false);
              onEvent({ type: StytchEventType.B2BPasswordResetByEmailStart, data });
              dispatch({ type: 'set_password_state', email: email });
              dispatch({ type: 'transition', screen: AppScreens.PasswordSetNewConfirmation });
            })
            .catch((err: StytchAPIError) => {
              setIsSubmitting(false);
              setErrorMessage(getTranslatedError(err, t));
            });
        })
        .catch((err: StytchAPIError) => {
          setIsSubmitting(false);
          setErrorMessage(getTranslatedError(err, t));
        });
    } else {
      // Discovery password flow: call discovery reset password start instead. This flow doesn't need a member object
      stytch.passwords.discovery
        .resetByEmailStart({
          email_address: email,
          discovery_redirect_url: config.passwordOptions?.discoveryRedirectURL,
          reset_password_redirect_url: config.passwordOptions?.resetPasswordRedirectURL,
          reset_password_expiration_minutes: config.passwordOptions?.resetPasswordExpirationMinutes,
          reset_password_template_id: config.passwordOptions?.resetPasswordTemplateId,
          verify_email_template_id: config.passwordOptions?.verifyEmailTemplateId,
          locale: config.passwordOptions?.locale,
        })
        .then(() => {
          setIsSubmitting(false);
          dispatch({ type: 'set_password_state', email: email });
          dispatch({ type: 'transition', screen: AppScreens.PasswordSetNewConfirmation });
        })
        .catch((err: StytchAPIError) => {
          setIsSubmitting(false);
          setErrorMessage(getTranslatedError(err, t));
        });
    }
  };

  return (
    <Column as="form" gap={6} onSubmit={handleSubmit}>
      <Typography variant="header">
        {t({ id: 'password.forgot.title', message: 'Check your email for help signing in' })}
      </Typography>
      <Typography variant="body">
        {!organization
          ? t({
              id: 'password.forgot.content.discovery',
              message:
                "We'll email you a verification link to sign up for an account or reset your password if you have one.",
            })
          : t({
              id: 'password.forgot.content.organization',
              message:
                "We'll email you a login link to sign in to your account directly or reset your password if you have one.",
            })}
      </Typography>

      <EmailInput email={email} setEmail={setEmail} error={errorMessage} />

      <ButtonColumn>
        <Button variant="primary" loading={isSubmitting} type="submit">
          {t({ id: 'button.continue', message: 'Continue' })}
        </Button>
        <Button variant="ghost" onClick={() => dispatch({ type: 'transition', screen: AppScreens.Main })}>
          {t({ id: 'button.goBack', message: 'Go back' })}
        </Button>
      </ButtonColumn>
    </Column>
  );
};
