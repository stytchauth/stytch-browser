import { useLingui } from '@lingui/react/macro';
import { StytchEventType } from '@stytch/core/public';
import * as React from 'react';

import { Confirmation } from '../../../components/molecules/Confirmation';
import { useMountEffect } from '../../../hooks/useMountEffect';
import { useEventCallback } from '../../GlobalContextProvider';

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
