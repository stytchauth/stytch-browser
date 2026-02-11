import { Trans } from '@lingui/react';
import { useLingui } from '@lingui/react/macro';
import { StytchEventType } from '@stytch/core/public';
import React from 'react';

import EmailActionLayout from '../../../components/molecules/EmailActionLayout';
import { useErrorCallback, useEventCallback } from '../../GlobalContextProvider';
import { useResetResendPasswordActions } from './useResetResendPasswordActions';

export const PasswordSetNew = () => {
  const { t } = useLingui();
  const onError = useErrorCallback();
  const onEvent = useEventCallback();

  const { email, resendResetPassword, goBack } = useResetResendPasswordActions();

  return (
    <EmailActionLayout
      header={t({
        id: 'password.setNew.title',
        message: 'Check your email',
      })}
      description={
        <Trans
          id="password.setNew.content"
          message="A login link was sent to you at <bold>{email}</bold>."
          components={{ bold: <b /> }}
          values={{ email }}
        />
      }
      resend={async () => {
        try {
          const data = await resendResetPassword();
          onEvent({ type: StytchEventType.PasswordResetByEmailStart, data });

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (e: any) {
          onError(e);
          throw e;
        }
      }}
      goBack={goBack}
    />
  );
};
