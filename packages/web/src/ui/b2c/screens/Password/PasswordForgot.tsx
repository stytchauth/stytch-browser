import { Trans } from '@lingui/react';
import { useLingui } from '@lingui/react/macro';
import { EmailSentType } from '@stytch/core';
import React from 'react';

import { readB2CInternals } from '../../../../utils/internal';
import EmailActionLayout from '../../../components/molecules/EmailActionLayout';
import { useStytch } from '../../GlobalContextProvider';
import { useResetResendPasswordActions } from './useResetResendPasswordActions';

export const PasswordForgot = () => {
  const { t } = useLingui();
  const stytchClient = useStytch();

  const { email, resendResetPassword, sendMagicLink, goBack } = useResetResendPasswordActions();

  return (
    <EmailActionLayout
      header={t({ id: 'password.forgot.title', message: 'Forgot your password?' })}
      description={
        <Trans
          id="password.forgot.content"
          message="A link to reset your password was sent to you at <bold>{email}</bold>."
          components={{ bold: <b /> }}
          values={{ email }}
        />
      }
      resend={() => {
        readB2CInternals(stytchClient).networkClient.logEvent({
          name: 'email_try_again_clicked',
          details: { email: email, type: EmailSentType.ResetPassword },
        });

        return resendResetPassword();
      }}
      sendMagicLink={sendMagicLink}
      goBack={goBack}
    />
  );
};
