import React from 'react';
import { useLingui } from '@lingui/react/macro';
import { Flex } from '../../../../components/Flex';
import Button from '../../../../components/Button';
import { StartPasskeyAuth } from '../../../../hooks/usePromptPasskey';
import PasskeysIcon from '../../../../../assets/passkeys';

export const PasskeyButton = ({ startPasskeyAuth }: { startPasskeyAuth: StartPasskeyAuth }) => {
  const { t } = useLingui();

  return (
    <Flex direction="column" gap={8}>
      <Button type="button" variant="outlined" onClick={startPasskeyAuth}>
        <Flex justifyContent="center" alignItems="center" gap={4}>
          <PasskeysIcon />
          <span style={{ verticalAlign: 'middle' }}>
            {t({ id: 'button.loginWithPasskey', message: 'Login with a Passkey' })}
          </span>
        </Flex>
      </Button>
    </Flex>
  );
};
