import { useLingui } from '@lingui/react/macro';
import { DEFAULT_SESSION_DURATION_MINUTES } from '@stytch/core';
import { StytchEventType } from '@stytch/core/public';
import React from 'react';

import { isSolanaWallet, signMessageWithWallet } from '../../../../utils/crypto';
import Button from '../../../components/atoms/Button';
import Column from '../../../components/atoms/Column';
import TextColumn from '../../../components/molecules/TextColumn';
import { useMountEffect } from '../../../hooks/useMountEffect';
import {
  AppScreens,
  useConfig,
  useErrorCallback,
  useEventCallback,
  useGlobalReducer,
  useStytch,
} from '../../GlobalContextProvider';

export const SignMessage = () => {
  const { t } = useLingui();
  const onEvent = useEventCallback();
  const onError = useErrorCallback();
  const handleError = () => {
    // eslint-disable-next-line lingui/no-unlocalized-strings -- This is not shown in the UI, just sent to the error callback
    onError({ message: '[Error] Could not sign message' });
    dispatch({ type: 'transition', screen: AppScreens.CryptoError });
  };
  const stytchClient = useStytch();
  const config = useConfig();
  const [state, dispatch] = useGlobalReducer();
  const { walletChallenge, walletAddress, walletOption } = state.formState.cryptoState;
  const walletType = isSolanaWallet(walletOption) ? 'solana' : 'ethereum';

  const onSignWallet = async () => {
    const signature = await signMessageWithWallet({
      wallet: walletOption,
      message: walletChallenge,
      address: walletAddress,
    });

    stytchClient.cryptoWallets
      .authenticate({
        crypto_wallet_address: walletAddress,
        crypto_wallet_type: walletType,
        signature,
        session_duration_minutes: config.sessionOptions?.sessionDurationMinutes ?? DEFAULT_SESSION_DURATION_MINUTES,
      })
      .then((data) => {
        onEvent({ type: StytchEventType.CryptoWalletAuthenticate, data });
        dispatch({ type: 'transition', screen: AppScreens.CryptoConfirmation });
      })
      .catch(handleError);
  };

  useMountEffect(() => {
    onSignWallet();
  });

  return (
    <Column gap={6}>
      <TextColumn
        header={t({ id: 'crypto.signMessage.title', message: 'Completing signature request...' })}
        body={t({
          id: 'crypto.signMessage.instruction',
          message: 'Complete the signature request through the wallet pop up in the right corner of your screen.',
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
