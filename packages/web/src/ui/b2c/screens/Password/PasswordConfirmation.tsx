import { StytchEventType } from '@stytch/core/public';
import * as React from 'react';

import { Confirmation } from '../../../components/molecules/Confirmation';
import { useMountEffect } from '../../../hooks/useMountEffect';
import { useEventCallback } from '../../GlobalContextProvider';

export const PasswordConfirmation = () => {
  const onEvent = useEventCallback();
  useMountEffect(() => {
    onEvent({ type: StytchEventType.AuthenticateFlowComplete, data: {} });
  });

  return <Confirmation />;
};
