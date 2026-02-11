import React, { useEffect } from 'react';
import { useLingui } from '@lingui/react/macro';
import styled from 'styled-components';
import { StytchEventType } from '@stytch/core/public';
import {
  AppScreens,
  useErrorCallback,
  useGlobalReducer,
  useStytch,
  useEventCallback,
} from '../../GlobalContextProvider';
import { connectWithWallet, isSolanaWallet, WalletToIcon } from '../../../../utils/crypto';
import { Text } from '../../../components/Text';
import { Flex } from '../../../components/Flex';
import BackArrowIcon from '../../../../assets/backArrow';

const ImageContainer = styled(Flex)`
  > div {
    height: 200px;
    width: 200px;
  }
`;

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

  useEffect(() => {
    onConnectWallet();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- SDK-1354
  }, []);

  const WalletImage = WalletToIcon[walletOption];

  return (
    <Flex direction="column" gap={24}>
      <BackArrowIcon onClick={() => dispatch({ type: 'transition', screen: AppScreens.Main })} />
      <Text size="header">{t({ id: 'crypto.connectWallet.title', message: 'Connecting to your wallet...' })}</Text>
      <ImageContainer justifyContent="center">
        <WalletImage />
      </ImageContainer>
      <Text>
        {t({
          id: 'crypto.connectWallet.instructionPopup',
          message: 'Complete sign in by connecting through the wallet pop up in the right corner of your screen.',
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
