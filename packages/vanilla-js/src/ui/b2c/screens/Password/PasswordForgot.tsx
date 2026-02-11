import React from 'react';
import { useLingui } from '@lingui/react/macro';
import { Trans } from '@lingui/react';
import toast from 'react-hot-toast';

import { Flex } from '../../../components/Flex';
import { Text } from '../../../components/Text';
import BackArrowIcon from '../../../../assets/backArrow';
import { AppScreens, useConfig, useGlobalReducer, useStytch } from '../../GlobalContextProvider';
import { MagicLinkOption } from './MagicLinkOption';
import { convertPasswordResetOptions } from '../../../../utils';
import { readB2CInternals } from '../../../../utils/internal';
import { EmailSentType } from '@stytch/core';

const ResendButton = ({ onClick, children }: { onClick: () => void; children?: React.ReactNode }) => (
  <button onClick={onClick} style={{ all: 'unset' }}>
    <b style={{ cursor: 'pointer' }}>{children}</b>
  </button>
);

export const PasswordForgot = () => {
  const { t } = useLingui();
  const [state, dispatch] = useGlobalReducer();
  const stytchClient = useStytch();
  const config = useConfig();
  const passwordOptions = config.passwordOptions;
  const email = state.formState.passwordState.email;

  const resendResetPassword = async () => {
    readB2CInternals(stytchClient).networkClient.logEvent({
      name: 'email_try_again_clicked',
      details: { email: email, type: EmailSentType.ResetPassword },
    });
    stytchClient.passwords
      .resetByEmailStart(convertPasswordResetOptions(email, passwordOptions))
      .then(() => toast.success(t({ id: 'toast.emailResent', message: 'Email resent' })));
  };

  return (
    <Flex direction="column" gap={24}>
      <BackArrowIcon onClick={() => dispatch({ type: 'transition', screen: AppScreens.Main })} />
      <Text size="header">{t({ id: 'password.forgot.title', message: 'Forgot password?' })}</Text>
      <Text>
        <Trans
          id="password.forgot.content"
          message="A link to reset your password was sent to you at <bold>{email}</bold>."
          components={{ bold: <b /> }}
          values={{ email }}
        />
      </Text>
      <Text>
        <Trans
          id="password.didntGetItResend"
          message="Didn't get it? <resendButton>Resend email</resendButton>"
          components={{
            resendButton: <ResendButton onClick={resendResetPassword} />,
          }}
        />
      </Text>
      <MagicLinkOption />
    </Flex>
  );
};
