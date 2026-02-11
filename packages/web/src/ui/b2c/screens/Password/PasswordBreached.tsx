import { Trans } from '@lingui/react';
import { useLingui } from '@lingui/react/macro';
import React from 'react';

import EmailActionLayout from '../../../components/molecules/EmailActionLayout';
import { useResetResendPasswordActions } from './useResetResendPasswordActions';

export const PasswordBreached = () => {
  const { t } = useLingui();

  const { email, resendResetPassword, sendMagicLink, goBack } = useResetResendPasswordActions();

  return (
    <EmailActionLayout
      header={t({
        id: 'password.breached.title',
        message: 'Check your email to set a new password',
      })}
      description={
        <Trans
          id="password.breached.content"
          message="A different site where you use the same password had a security issue recently. For your safety, an email was sent to you at <bold>{email}</bold> to reset your password."
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
