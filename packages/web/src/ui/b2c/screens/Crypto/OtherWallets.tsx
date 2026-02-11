import { useLingui } from '@lingui/react/macro';
import React from 'react';

import Button from '../../../components/atoms/Button';
import Column from '../../../components/atoms/Column';
import Typography from '../../../components/atoms/Typography';
import ButtonColumn from '../../../components/molecules/ButtonColumn';
import { AppScreens, useGlobalReducer } from '../../GlobalContextProvider';
import { CryptoWalletButtons } from './WalletButtons';

export const OtherCryptoWallets = () => {
  const { t } = useLingui();
  const [, dispatch] = useGlobalReducer();

  return (
    <Column gap={6}>
      <Typography variant="header">
        {t({ id: 'crypto.continueWithOtherWallet.title', message: 'Continue with other wallet' })}
      </Typography>

      <ButtonColumn>
        <CryptoWalletButtons type="other" />
        <Button variant="ghost" onClick={() => dispatch({ type: 'transition', screen: AppScreens.Main })}>
          {t({ id: 'button.goBack', message: 'Go back' })}
        </Button>
      </ButtonColumn>
    </Column>
  );
};
