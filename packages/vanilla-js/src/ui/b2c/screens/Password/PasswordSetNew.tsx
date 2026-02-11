import React from 'react';
import { useLingui } from '@lingui/react/macro';
import { Trans } from '@lingui/react';
import toast from 'react-hot-toast';

import { StytchEventType } from '@stytch/core/public';
import { Flex } from '../../../components/Flex';
import { Text } from '../../../components/Text';
import BackArrowIcon from '../../../../assets/backArrow';
import {
  AppScreens,
  useConfig,
  useGlobalReducer,
  useStytch,
  useErrorCallback,
  useEventCallback,
} from '../../GlobalContextProvider';
import { convertPasswordResetOptions } from '../../../../utils';

const ResendButton = ({ onClick, children }: { onClick: () => void; children?: React.ReactNode }) => (
  <button onClick={onClick} style={{ all: 'unset' }}>
    <b style={{ cursor: 'pointer' }}>{children}</b>
  </button>
);

export const PasswordSetNew = () => {
  const { t } = useLingui();
  const [state, dispatch] = useGlobalReducer();
  const onError = useErrorCallback();
  const onEvent = useEventCallback();
  const stytchClient = useStytch();
  const config = useConfig();
  const passwordOptions = config.passwordOptions;
  const email = state.formState.passwordState.email;

  const resendResetPassword = () => {
    stytchClient.passwords
      .resetByEmailStart(convertPasswordResetOptions(email, passwordOptions))
      .then((data) => {
        toast.success(t({ id: 'toast.emailResent', message: 'Email resent' }));
        onEvent({ type: StytchEventType.PasswordResetByEmailStart, data });
      })
      .catch((e: Error) => {
        onError(e);
      });
  };

  return (
    <Flex direction="column" gap={24}>
      <BackArrowIcon onClick={() => dispatch({ type: 'transition', screen: AppScreens.Main })} />
      <Text size="header">
        {t({
          id: 'password.setNew.title',
          message: 'Check your email!',
        })}
      </Text>
      <Text>
        <Trans
          id="password.setNew.content"
          message="A login link was sent to you at <bold>{email}</bold>."
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
    </Flex>
  );
};
