import { MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import { Wallets } from '@stytch/core/public';
import * as React from 'react';

import { GenericWalletIcon } from '../../../../assets';
import { isWalletVisible, useCryptoButtonProps, WalletToText } from '../../../../utils/crypto';
import Button from '../../../components/atoms/Button';
import ButtonColumn from '../../../components/molecules/ButtonColumn';
import { AppScreens, useConfig, useGlobalReducer } from '../../GlobalContextProvider';

const MAX_BUTTONS = 6;

const walletMessages = {
  [Wallets.Phantom]: msg({ id: 'crypto.wallet.continueWithPhantom', message: 'Continue with Phantom' }),
  [Wallets.Binance]: msg({ id: 'crypto.wallet.continueWithBinance', message: 'Continue with Binance' }),
  [Wallets.Coinbase]: msg({ id: 'crypto.wallet.continueWithCoinbase', message: 'Continue with Coinbase' }),
  [Wallets.Metamask]: msg({ id: 'crypto.wallet.continueWithMetamask', message: 'Continue with Metamask' }),
  [Wallets.GenericEthereumWallet]: msg({
    id: 'crypto.wallet.continueWithEthereum',
    message: 'Continue with Other Ethereum Wallet',
  }),
  [Wallets.GenericSolanaWallet]: msg({
    id: 'crypto.wallet.continueWithSolana',
    message: 'Continue with Other Solana Wallet',
  }),
} satisfies Record<Wallets, MessageDescriptor>;

export const CryptoWalletButtons = ({ type }: { type: 'main' | 'other' }) => {
  const { t } = useLingui();
  const [state, dispatch] = useGlobalReducer();
  const config = useConfig();

  const { getIcon, getId } = useCryptoButtonProps();

  const oAuthOptions = config.oauthOptions?.providers.length ?? 0;

  // Crypto Buttons on screen = Maximum Buttons - OAuth Buttons - 1 (Other crypto or set up new wallet)
  const cryptoButtonsOnMainScreen = MAX_BUTTONS - oAuthOptions - 1;
  const onWalletStart = (wallet: Wallets) => {
    dispatch({
      type: 'update_crypto_state',
      cryptoState: {
        ...state.formState.cryptoState,
        walletOption: wallet,
      },
    });
    dispatch({ type: 'transition', screen: AppScreens.CryptoConnect });
  };

  const allDetectedWallets = (Object.keys(Wallets) as (keyof typeof Wallets)[]).filter((wallet) =>
    isWalletVisible(Wallets[wallet]),
  );

  const renderOtherScreenButton = allDetectedWallets.length > cryptoButtonsOnMainScreen;

  const mainWallets = allDetectedWallets.slice(0, cryptoButtonsOnMainScreen);
  const otherWallet = allDetectedWallets.slice(cryptoButtonsOnMainScreen);

  const walletsToRender = type === 'main' ? mainWallets : otherWallet;

  return (
    <ButtonColumn>
      {walletsToRender.map((wallet) => {
        const walletEnum = Wallets[wallet];
        const Icon = getIcon(walletEnum);
        return (
          <Button
            key={wallet}
            variant="outline"
            icon={<Icon />}
            onClick={() => onWalletStart(walletEnum)}
            id={getId(walletEnum)}
          >
            {type === 'main' ? t(walletMessages[walletEnum]) : t(WalletToText[walletEnum])}
          </Button>
        );
      })}

      {renderOtherScreenButton && type === 'main' ? (
        <Button
          variant="outline"
          icon={<GenericWalletIcon />}
          onClick={() => dispatch({ type: 'transition', screen: AppScreens.CryptoOtherScreen })}
          id={getId(Wallets.GenericEthereumWallet)}
        >
          {t(msg({ id: 'crypto.wallet.continueWithOtherWallet', message: 'Continue with other Crypto Wallet' }))}
        </Button>
      ) : (
        <Button
          variant="outline"
          onClick={() => dispatch({ type: 'transition', screen: AppScreens.CryptoSetupWallet })}
        >
          {t(msg({ id: 'crypto.wallet.setupNewWallet', message: 'Set up a new crypto wallet' }))}
        </Button>
      )}
    </ButtonColumn>
  );
};
