import { useLingui } from '@lingui/react/macro';
import { StytchEventType } from '@stytch/core/public';
import * as React from 'react';

import { Confirmation } from '../../../components/molecules/Confirmation';
import { useMountEffect } from '../../../hooks/useMountEffect';
import { useEventCallback } from '../../GlobalContextProvider';

export const PasskeyConfirmation = () => {
  const { t } = useLingui();
  const onEvent = useEventCallback();
  useMountEffect(() => {
    onEvent({ type: StytchEventType.AuthenticateFlowComplete, data: {} });
  });

  return (
    <Confirmation
      text={t({ id: 'passkey.success.content', message: 'Your Passkey has been successfully authenticated.' })}
    />
  );
};
