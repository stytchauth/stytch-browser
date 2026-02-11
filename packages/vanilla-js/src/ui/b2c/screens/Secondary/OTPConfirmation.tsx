import * as React from 'react';
import { StytchEventType } from '@stytch/core/public';
import { useLingui } from '@lingui/react/macro';
import { useMountEffect } from '../../../hooks/useMountEffect';
import { useEventCallback } from '../../GlobalContextProvider';
import { Confirmation } from '../../../components/Confirmation';

export const OTPConfirmation = () => {
  const { t } = useLingui();
  const onEvent = useEventCallback();
  useMountEffect(() => {
    onEvent({ type: StytchEventType.AuthenticateFlowComplete, data: {} });
  });

  return (
    <Confirmation text={t({ id: 'otp.success.content', message: 'Your passcode has been successfully verified.' })} />
  );
};
