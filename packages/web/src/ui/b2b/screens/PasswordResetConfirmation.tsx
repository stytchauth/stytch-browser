import { Trans } from '@lingui/react';
import { useLingui } from '@lingui/react/macro';
import React from 'react';

import Button from '../../components/atoms/Button';
import EmailActionLayout from '../../components/molecules/EmailActionLayout';
import { emailProviderInfo, EmailProviderLink } from '../../components/molecules/EmailProviderLink';
import { useGlobalReducer } from '../GlobalContextProvider';
import { AppScreens } from '../types/AppScreens';
import { useEmailDomain } from './useEmailDomain';

export const PasswordResetConfirmation = () => {
  const { t } = useLingui();

  const [state, dispatch] = useGlobalReducer();
  const emailDomain = useEmailDomain();
  const email = state.formState.passwordState.email;

  const reset = () => {
    dispatch({ type: 'set_user_supplied_email', email: '' });
    dispatch({ type: 'transition', screen: AppScreens.Main });
  };

  return (
    <EmailActionLayout
      header={t({
        id: 'password.verification.title',
        message: 'Verify your email first.',
      })}
      description={
        <Trans
          id="password.verification.content"
          message="A login link was sent to you at <bold>{email}</bold>."
          components={{ bold: <b /> }}
          values={{ email }}
        />
      }
      additionalActions={
        <>
          <EmailProviderLink emailDomain={emailDomain} providerInfo={emailProviderInfo.gmail} />
          <EmailProviderLink emailDomain={emailDomain} providerInfo={emailProviderInfo.outlook} />
          <Button variant="ghost" onClick={reset}>
            {t({ id: 'button.retry', message: 'Try again' })}
          </Button>
        </>
      }
    />
  );
};
