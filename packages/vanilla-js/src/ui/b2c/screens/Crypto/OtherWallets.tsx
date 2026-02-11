import React from 'react';
import { useLingui } from '@lingui/react/macro';
import { Flex } from '../../../components/Flex';
import { Text } from '../../../components/Text';
import { AppScreens, useGlobalReducer } from '../../GlobalContextProvider';
import { CryptoWalletButtons } from './WalletButtons';
import BackArrowIcon from '../../../../assets/backArrow';

export const OtherCryptoWallets = () => {
  const { t } = useLingui();
  const [, dispatch] = useGlobalReducer();

  return (
    <Flex direction="column" gap={24}>
      <BackArrowIcon onClick={() => dispatch({ type: 'transition', screen: AppScreens.Main })} />
      <Text size="header">
        {t({ id: 'crypto.continueWithOtherWallet.title', message: 'Continue with other wallet' })}
      </Text>
      <CryptoWalletButtons type="other" />
    </Flex>
  );
};
