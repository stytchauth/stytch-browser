import React from 'react';
import { useLingui } from '@lingui/react/macro';
import { Wallets } from '@stytch/core/public';
import { AppScreens, useGlobalReducer } from '../../GlobalContextProvider';
import { WalletToIcon } from '../../../../utils/crypto';
import { Text } from '../../../components/Text';
import { Flex } from '../../../components/Flex';
import BackArrowIcon from '../../../../assets/backArrow';

const WalletIcon = ({ icon, name, link }: { icon: JSX.Element; name: string; link: string }) => {
  return (
    <a href={link} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {icon}
        <span>{name}</span>
      </div>
    </a>
  );
};

export const SetupNewWallet = () => {
  const { t } = useLingui();
  const [, dispatch] = useGlobalReducer();

  const WalletIconComponent = ({ wallet }: { wallet: Wallets }) => {
    const Icon = WalletToIcon[wallet];
    return <Icon />;
  };

  return (
    <Flex direction="column" gap={24}>
      <BackArrowIcon onClick={() => dispatch({ type: 'transition', screen: AppScreens.Main })} />
      <Text size="header">{t({ id: 'crypto.setupNewWallet.title', message: 'Set up a new crypto wallet' })}</Text>
      <Text>
        {t({
          id: 'crypto.setupNewWallet.content',
          message: 'Signing in with a crypto wallet can help keep your account private and secure.',
        })}
      </Text>
      <Text>
        {t({
          id: 'crypto.setupNewWallet.instruction',
          message:
            'Get started by downloading any Ethereum or Solana wallet. We’ve included a few examples of wallet extensions you can find below. Once you’ve set up your wallet, you can use it to sign in!',
        })}
      </Text>
      <Flex direction="column" gap={24}>
        <Flex justifyContent="space-evenly">
          <WalletIcon
            icon={<WalletIconComponent wallet={Wallets.Metamask} />}
            name={t({ id: 'crypto.wallet.metamask', message: 'Metamask' })}
            link="https://metamask.io/"
          />
          <WalletIcon
            icon={<WalletIconComponent wallet={Wallets.Phantom} />}
            name={t({ id: 'crypto.wallet.phantom', message: 'Phantom' })}
            link="https://phantom.app/"
          />
        </Flex>
        <Flex justifyContent="space-evenly">
          <WalletIcon
            icon={<WalletIconComponent wallet={Wallets.Coinbase} />}
            name={t({ id: 'crypto.wallet.coinbase', message: 'Coinbase' })}
            link="https://www.coinbase.com/wallet"
          />
          <WalletIcon
            icon={<WalletIconComponent wallet={Wallets.Binance} />}
            name={t({ id: 'crypto.wallet.binance', message: 'Binance' })}
            link="https://www.bnbchain.world/en/binance-wallet"
          />
        </Flex>
      </Flex>
    </Flex>
  );
};
