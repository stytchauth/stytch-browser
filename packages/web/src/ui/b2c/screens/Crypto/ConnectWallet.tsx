import { useLingui } from '@lingui/react/macro';
import { StytchEventType } from '@stytch/core/public';
import React from 'react';

import { connectWithWallet, isSolanaWallet } from '../../../../utils/crypto';
import Button from '../../../components/atoms/Button';
import Column from '../../../components/atoms/Column';
import TextColumn from '../../../components/molecules/TextColumn';
import { useMountEffect } from '../../../hooks/useMountEffect';
import {
  AppScreens,
  useErrorCallback,
  useEventCallback,
  useGlobalReducer,
  useStytch,
} from '../../GlobalContextProvider';

export const ConnectWallet = () => {
  const { t } = useLingui();
  const onEvent = useEventCallback();
  const onError = useErrorCallback();
  const handleError = () => {
    // eslint-disable-next-line lingui/no-unlocalized-strings -- This is not shown in the UI, just sent to the error callback
    onError({ message: '[Error] Could not connect to wallet' });
    dispatch({ type: 'transition', screen: AppScreens.CryptoError });
  };
  const stytchClient = useStytch();
  const [state, dispatch] = useGlobalReducer();
  const walletOption = state.formState.cryptoState.walletOption;
  const walletType = isSolanaWallet(walletOption) ? 'solana' : 'ethereum';

  const onConnectWallet = async () => {
    const address = await connectWithWallet({ wallet: walletOption });
    stytchClient.cryptoWallets
      .authenticateStart({
        crypto_wallet_address: address,
        crypto_wallet_type: walletType,
      })
      .then((data) => {
        onEvent({ type: StytchEventType.CryptoWalletAuthenticateStart, data });
        dispatch({
          type: 'update_crypto_state',
          cryptoState: {
            walletAddress: address,
            walletChallenge: data.challenge,
            walletOption: walletOption,
          },
        });

        dispatch({ type: 'transition', screen: AppScreens.CryptoSignMessage });
      })
      .catch(handleError);
  };

  useMountEffect(() => {
    onConnectWallet();
  });

  return (
    <Column gap={6}>
      <TextColumn
        header={t({ id: 'crypto.connectWallet.title', message: 'Connecting to your wallet...' })}
        body={t({
          id: 'crypto.connectWallet.instructionPopup',
          message: 'Complete sign in by connecting through the wallet pop up in the right corner of your screen.',
        })}
        helper={t({
          id: 'crypto.troubleHelp',
          message: 'If you are having trouble, go back to the main screen and try logging in again.',
        })}
      />
      <Button variant="outline" onClick={() => dispatch({ type: 'transition', screen: AppScreens.Main })}>
        {t({ id: 'button.goBack', message: 'Go back' })}
      </Button>
    </Column>
  );
};
