import { useLingui } from '@lingui/react/macro';
import React from 'react';

import { PasskeyIcon } from '../../../../../assets';
import Button from '../../../../components/atoms/Button';
import { StartPasskeyAuth } from '../../../../hooks/usePromptPasskey';

export const PasskeyButton = ({ startPasskeyAuth }: { startPasskeyAuth: StartPasskeyAuth }) => {
  const { t } = useLingui();

  return (
    <Button icon={<PasskeyIcon />} variant="outline" onClick={startPasskeyAuth}>
      {t({ id: 'button.loginWithPasskey', message: 'Login with a Passkey' })}
    </Button>
  );
};
