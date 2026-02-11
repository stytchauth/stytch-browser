import { Trans } from '@lingui/react';
import { useLingui } from '@lingui/react/macro';
import React from 'react';

import EmailActionLayout from '../../../components/molecules/EmailActionLayout';
import { useResetResendPasswordActions } from './useResetResendPasswordActions';

export const PasswordDedupe = () => {
  const { t } = useLingui();

  const { email, resendResetPassword, sendMagicLink, goBack } = useResetResendPasswordActions();

  return (
    <EmailActionLayout
      header={t({
        id: 'password.resetRequired.title',
        message: 'Check your email to set a new password',
      })}
      description={
        <Trans
          id="password.resetRequired.content"
          message="We want to make sure your account is secure and that it's really you logging in! A login link was sent to you at <bold>{email}</bold>."
          components={{ bold: <b /> }}
          values={{ email }}
        />
      }
      resend={resendResetPassword}
      sendMagicLink={sendMagicLink}
      goBack={goBack}
    />
  );
};
