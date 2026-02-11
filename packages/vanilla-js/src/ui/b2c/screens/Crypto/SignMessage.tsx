import React, { useEffect } from 'react';
import { useLingui } from '@lingui/react/macro';
import styled from 'styled-components';
import { DEFAULT_SESSION_DURATION_MINUTES } from '@stytch/core';
import { StytchEventType } from '@stytch/core/public';
import {
  AppScreens,
  useGlobalReducer,
  useStytch,
  useConfig,
  useErrorCallback,
  useEventCallback,
} from '../../GlobalContextProvider';
import { signMessageWithWallet, isSolanaWallet, WalletToIcon } from '../../../../utils/crypto';
import { Text } from '../../../components/Text';
import { Flex } from '../../../components/Flex';
import BackArrowIcon from '../../../../assets/backArrow';

const ImageContainer = styled(Flex)`
  > div {
    height: 200px;
    width: 200px;
  }
`;

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

  useEffect(() => {
    onSignWallet();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- SDK-1354
  }, []);

  const WalletImage = WalletToIcon[walletOption];

  return (
    <Flex direction="column" gap={24}>
      <BackArrowIcon onClick={() => dispatch({ type: 'transition', screen: AppScreens.Main })} />
      <Text size="header">{t({ id: 'crypto.signMessage.title', message: 'Completing signature request...' })}</Text>
      <ImageContainer justifyContent="center">
        <WalletImage />
      </ImageContainer>
      <Text>
        {t({
          id: 'crypto.signMessage.instruction',
          message: 'Complete the signature request through the wallet pop up in the right corner of your screen.',
        })}
      </Text>
      <Text>
        {t({
          id: 'crypto.troubleHelp',
          message: 'Having trouble? Use the back arrow to return to the main screen and try logging in again.',
        })}
      </Text>
    </Flex>
  );
};
