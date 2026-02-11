import React from 'react';
import toast from 'react-hot-toast';

import { StytchEventType } from '@stytch/core/public';

import { usePasswordInput } from '../usePasswordInput';
import { useConfig, useEventCallback, useGlobalReducer } from '../GlobalContextProvider';
import { AppScreens } from '../types/AppScreens';
import { Flex } from '../../components/Flex';
import { Text } from '../../components/Text';
import BackArrowIcon from '../../../assets/backArrow';
import { useLingui } from '@lingui/react/macro';
import { Trans } from '@lingui/react';

const ResendButton = ({ onClick, children }: { onClick: () => void; children?: React.ReactNode }) => (
  <button onClick={onClick} style={{ all: 'unset' }}>
    <b style={{ cursor: 'pointer' }}>{children}</b>
  </button>
);

export const PasswordSetNew = () => {
  const [, dispatch] = useGlobalReducer();
  const onEvent = useEventCallback();
  const config = useConfig();
  const { t } = useLingui();

  const { stytch, onError, email, organization, setIsSubmitting } = usePasswordInput();

  const resendResetPassword = () => {
    if (!organization) {
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
        .then((data) => {
          toast.success(t({ id: 'password.reset.toast.emailResent', message: 'Email resent' }));
          setIsSubmitting(false);
          onEvent({ type: StytchEventType.B2BPasswordDiscoveryResetStart, data });
        });
    } else {
      stytch.passwords
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
          toast.success(t({ id: 'password.reset.toast.emailResent', message: 'Email resent' }));
          setIsSubmitting(false);
          onEvent({ type: StytchEventType.B2BPasswordResetByEmailStart, data });
        })
        .catch((e: Error) => {
          onError(e);
        });
    }
  };

  return (
    <Flex direction="column" gap={24}>
      <BackArrowIcon onClick={() => dispatch({ type: 'transition', screen: AppScreens.Main })} />
      <Text size="header">{t({ id: 'password.reset.emailSent.title', message: 'Check your email!' })}</Text>
      <Text>
        <Trans
          id="password.reset.emailSent.content"
          message="A login link was sent to you at <bold>{email}</bold>."
          components={{ bold: <b /> }}
          values={{ email }}
        />
      </Text>
      <Text>
        <Trans
          id="password.reset.emailSent.resendText"
          message="Didn&#39;t get it? <resendButton>Resend email</resendButton>"
          components={{
            resendButton: <ResendButton onClick={resendResetPassword} />,
          }}
        />
      </Text>
    </Flex>
  );
};
