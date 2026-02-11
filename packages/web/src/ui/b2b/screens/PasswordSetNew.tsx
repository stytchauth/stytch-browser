import { Trans } from '@lingui/react';
import { useLingui } from '@lingui/react/macro';
import { StytchEventType } from '@stytch/core/public';
import React from 'react';

import EmailActionLayout from '../../components/molecules/EmailActionLayout';
import { useConfig, useEventCallback, useGlobalReducer } from '../GlobalContextProvider';
import { AppScreens } from '../types/AppScreens';
import { usePasswordInput } from '../usePasswordInput';

export const PasswordSetNew = () => {
  const [, dispatch] = useGlobalReducer();
  const onEvent = useEventCallback();
  const config = useConfig();
  const { t } = useLingui();

  const { stytch, onError, email, organization, setIsSubmitting } = usePasswordInput();

  const resendResetPassword = () => {
    if (!organization) {
      return stytch.passwords.discovery
        .resetByEmailStart({
          email_address: email,
          discovery_redirect_url: config.passwordOptions?.discoveryRedirectURL,
          reset_password_redirect_url: config.passwordOptions?.resetPasswordRedirectURL,
          reset_password_expiration_minutes: config.passwordOptions?.resetPasswordExpirationMinutes,
          reset_password_template_id: config.passwordOptions?.resetPasswordTemplateId,
          verify_email_template_id: config.passwordOptions?.verifyEmailTemplateId,
          locale: config.passwordOptions?.locale,
        })
        .then((data) => {
          setIsSubmitting(false);
          onEvent({ type: StytchEventType.B2BPasswordDiscoveryResetStart, data });
        });
    } else {
      return stytch.passwords
        .resetByEmailStart({
          email_address: email,
          organization_id: organization.organization_id,
          login_redirect_url: config.passwordOptions?.loginRedirectURL,
          reset_password_redirect_url: config.passwordOptions?.resetPasswordRedirectURL,
          reset_password_expiration_minutes: config.passwordOptions?.resetPasswordExpirationMinutes,
          reset_password_template_id: config.passwordOptions?.resetPasswordTemplateId,
          verify_email_template_id: config.passwordOptions?.verifyEmailTemplateId,
          locale: config.passwordOptions?.locale,
        })
        .then((data) => {
          setIsSubmitting(false);
          onEvent({ type: StytchEventType.B2BPasswordResetByEmailStart, data });
        })
        .catch((e: Error) => {
          onError(e);
          throw e;
        });
    }
  };

  return (
    <EmailActionLayout
      header={t({ id: 'password.reset.emailSent.title', message: 'Check your email' })}
      description={
        <Trans
          id="password.reset.emailSent.content"
          message="A login link was sent to you at <bold>{email}</bold>."
          components={{ bold: <b /> }}
          values={{ email }}
        />
      }
      resend={resendResetPassword}
      goBack={() => dispatch({ type: 'transition', screen: AppScreens.Main })}
    />
  );
};
