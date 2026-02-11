import { useConfig, useEventCallback, useGlobalReducer } from '../GlobalContextProvider';
import { AppScreens } from '../types/AppScreens';
import React from 'react';
import { Flex } from '../../components/Flex';
import BackArrowIcon from '../../../assets/backArrow';
import { Text } from '../../components/Text';
import { EmailInput } from '../../components/EmailInput';
import { ErrorText } from '../../components/ErrorText';
import { SubmitButton } from '../../components/SubmitButton';
import { EMAIL_REGEX } from '../../../utils';
import { readB2BInternals } from '../../../utils/internal';
import { StytchAPIError, StytchEventType } from '@stytch/core/public';
import { usePasswordInput } from '../usePasswordInput';
import { useLingui } from '@lingui/react/macro';
import { getTranslatedError } from '../../../utils/getTranslatedError';
import { useErrorProps } from '../../../utils/accessibility';
import { Label } from '../../components/Label';

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

  const emailProps = useErrorProps(errorMessage);

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
    <form onSubmit={handleSubmit}>
      <Flex direction="column" gap={24}>
        <BackArrowIcon onClick={() => dispatch({ type: 'transition', screen: AppScreens.Main })} />
        <Text size="header">
          {t({ id: 'password.forgot.title', message: 'Check your email for help signing in!' })}
        </Text>
        <Text>
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
        </Text>
        <Flex direction="column" gap={4}>
          <Label htmlFor="email-input">{t({ id: 'formField.email.label', message: 'Email' })}</Label>
          <EmailInput email={email} setEmail={setEmail} {...emailProps.input} />
          <ErrorText errorMessage={errorMessage} {...emailProps.error} />
          <SubmitButton isSubmitting={isSubmitting} text={t({ id: 'button.continue', message: 'Continue' })} />
        </Flex>
      </Flex>
    </form>
  );
};
