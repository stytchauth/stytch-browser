import { useLingui } from '@lingui/react/macro';
import { Wallets } from '@stytch/core/public';
import React from 'react';

import { useCryptoButtonProps, WalletToText } from '../../../../utils/crypto';
import Button, { ButtonAnchor } from '../../../components/atoms/Button';
import Column from '../../../components/atoms/Column';
import ButtonColumn from '../../../components/molecules/ButtonColumn';
import TextColumn from '../../../components/molecules/TextColumn';
import { AppScreens, useGlobalReducer } from '../../GlobalContextProvider';

export const SetupNewWallet = () => {
  const { t } = useLingui();
  const [, dispatch] = useGlobalReducer();

  const { getIcon, getId } = useCryptoButtonProps();
  const walletsToRender = [Wallets.Metamask, Wallets.Phantom, Wallets.Coinbase, Wallets.Binance];

  return (
    <Column gap={6}>
      <TextColumn
        header={t({ id: 'crypto.setupNewWallet.title', message: 'Set up a new crypto wallet' })}
        body={t({
          id: 'crypto.setupNewWallet.content',
          message: 'Get started by downloading any Ethereum or Solana wallet.',
        })}
        helper={t({
          id: 'crypto.setupNewWallet.instruction',
          message:
            'We’ve included a few examples of wallet extensions you can find below. Once you’ve set up your wallet, click “Go back” to use it and sign in.',
        })}
      />

      <ButtonColumn>
        {walletsToRender.map((wallet) => {
          const Icon = getIcon(wallet);
          return (
            <ButtonAnchor
              key={wallet}
              variant="outline"
              target="_blank"
              rel="noreferrer"
              icon={<Icon />}
              href="https://metamask.io/"
              id={getId(wallet)}
            >
              {t(WalletToText[wallet])}
            </ButtonAnchor>
          );
        })}

        <Button variant="primary" onClick={() => dispatch({ type: 'transition', screen: AppScreens.Main })}>
          {t({ id: 'button.goBack', message: 'Go back' })}
        </Button>
      </ButtonColumn>
    </Column>
  );
};
