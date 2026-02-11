import { MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import * as React from 'react';
import { Wallets } from '@stytch/core/public';
import { encode } from 'bs58';

import PhantomIcon from '../assets/phantom';
import MetamaskIcon from '../assets/metamask';
import VesselIcon from '../assets/vessel';
import BinanceIcon from '../assets/binance';
import CoinbaseIcon from '../assets/coinbase';
import GenericWalletIcon from '../assets/genericWallet';

type ProviderRequest = ({
  method,
  params,
}: {
  method: 'eth_requestAccounts' | 'personal_sign';
  params?: string[];
}) => string[] | string;

type ETHProvider = {
  isMetaMask?: boolean;
  isCoinbaseWallet?: boolean;
  request: ProviderRequest;
};

declare global {
  interface Window {
    solana: {
      isPhantom?: boolean;
      connect: () => { publicKey: { toString: () => string } };
      request: ({
        method,
        params,
      }: {
        method: 'signMessage';
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        params: Record<string, any>;
      }) => { signature: Uint8Array };
    };

    ethereum: {
      isMetaMask?: boolean;
      isCoinbaseWallet?: boolean;
      request?: ({ method, params }: { method: string; params?: string[] }) => string[] | string;
      providers?: ETHProvider[];
    };

    BinanceChain: { request: ProviderRequest };
    vessel: { ethereum: { request: ProviderRequest } };
  }
}

const hasMultipleEthereumWallets = () => !!window.ethereum?.providers;

const hasMetaMask = () =>
  !!(hasMultipleEthereumWallets()
    ? window.ethereum.providers?.find((wallet) => wallet.isMetaMask)
    : window.ethereum.isMetaMask);

const hasCoinbaseWallet = () =>
  !!(hasMultipleEthereumWallets()
    ? window.ethereum.providers?.find((wallet) => wallet.isCoinbaseWallet)
    : window.ethereum?.isCoinbaseWallet);

const hasOtherEthereumWallet = () => !hasMetaMask() && !hasCoinbaseWallet() && !!window.ethereum;

const getMetaMaskProvider = () =>
  hasMultipleEthereumWallets() ? window.ethereum.providers?.find((wallet) => wallet.isMetaMask) : window.ethereum;

const getCoinbaseProvider = () =>
  hasMultipleEthereumWallets() ? window.ethereum.providers?.find((wallet) => wallet.isCoinbaseWallet) : window.ethereum;

const getOtherInjectedProvider = () =>
  window.ethereum.providers?.find((wallet) => !wallet.isCoinbaseWallet && !wallet.isMetaMask);

export const WalletToIcon: Record<Wallets, React.FC> = {
  [Wallets.Phantom]: PhantomIcon,
  [Wallets.Vessel]: VesselIcon,
  [Wallets.Binance]: BinanceIcon,
  [Wallets.Coinbase]: CoinbaseIcon,
  [Wallets.Metamask]: MetamaskIcon,
  [Wallets.GenericEthereumWallet]: GenericWalletIcon,
  [Wallets.GenericSolanaWallet]: GenericWalletIcon,
};

export const WalletToText: Record<Wallets, MessageDescriptor> = {
  [Wallets.Phantom]: msg({ id: 'crypto.wallet.phantom', message: 'Phantom' }),
  [Wallets.Vessel]: msg({ id: 'crypto.wallet.vessel', message: 'Vessel' }),
  [Wallets.Binance]: msg({ id: 'crypto.wallet.binance', message: 'Binance' }),
  [Wallets.Coinbase]: msg({ id: 'crypto.wallet.coinbase', message: 'Coinbase' }),
  [Wallets.Metamask]: msg({ id: 'crypto.wallet.metamask', message: 'Metamask' }),
  [Wallets.GenericEthereumWallet]: msg({ id: 'crypto.wallet.otherEthereum', message: 'Other Ethereum Wallet' }),
  [Wallets.GenericSolanaWallet]: msg({ id: 'crypto.wallet.otherSolana', message: 'Other Solana Wallet' }),
};

export const isWalletVisible = (wallet: Wallets): boolean => {
  switch (wallet) {
    case Wallets.Metamask:
      return !!window.ethereum && hasMetaMask();
    case Wallets.Phantom:
      return (!!window.solana && window.solana?.isPhantom) ?? false;
    case Wallets.Vessel:
      return !!window.vessel;
    case Wallets.Binance:
      return !!window.BinanceChain;
    case Wallets.Coinbase:
      return !!window.ethereum && hasCoinbaseWallet();
    case Wallets.GenericEthereumWallet:
      return !!window.ethereum && hasOtherEthereumWallet();
    case Wallets.GenericSolanaWallet:
      return !!window.solana && !window.solana.isPhantom;
    default:
      return false;
  }
};

const connectWithEthereumProvider = async (request: ProviderRequest): Promise<string> => {
  const [address] = await request({
    method: 'eth_requestAccounts',
  });
  return address;
};

export const connectWithWallet = async ({ wallet }: { wallet: Wallets }): Promise<string> => {
  switch (wallet) {
    case Wallets.Metamask: {
      const provider = getMetaMaskProvider();
      return provider?.request ? connectWithEthereumProvider(provider?.request) : '';
    }
    case Wallets.Phantom: {
      const connectResp = await window.solana.connect();
      return connectResp.publicKey.toString();
    }
    case Wallets.Binance: {
      const provider = window.BinanceChain;
      return provider?.request ? connectWithEthereumProvider(provider?.request) : '';
    }
    case Wallets.Vessel: {
      const [response] = await window.vessel.ethereum.request({
        method: 'eth_requestAccounts',
      });
      return response;
    }
    case Wallets.Coinbase: {
      const provider = getCoinbaseProvider();
      return provider?.request ? connectWithEthereumProvider(provider?.request) : '';
    }
    case Wallets.GenericEthereumWallet: {
      const provider = getOtherInjectedProvider();
      return provider?.request ? connectWithEthereumProvider(provider?.request) : '';
    }
    case Wallets.GenericSolanaWallet: {
      const connectResp = await window.solana.connect();
      return connectResp.publicKey.toString();
    }
    default:
      return '';
  }
};

const signMessageWithSolanaProvider = async (message: string): Promise<string> => {
  const encodedMessage = new TextEncoder().encode(message);
  const signResp = await window.solana.request({
    method: 'signMessage',
    params: {
      message: encodedMessage,
      display: 'utf8',
    },
  });
  return encode(signResp.signature);
};

const signMessageWithEthereumProvider = async (
  request: ProviderRequest,
  message: string,
  address: string,
): Promise<string> => {
  const signature = await request({
    method: 'personal_sign',
    params: [message, address],
  });
  return signature as string;
};

export const signMessageWithWallet = async ({
  wallet,
  message,
  address,
}: {
  wallet: Wallets;
  message: string;
  address: string;
}): Promise<string> => {
  switch (wallet) {
    case Wallets.Phantom:
    case Wallets.GenericSolanaWallet:
      return signMessageWithSolanaProvider(message);
    case Wallets.Metamask: {
      const provider = getMetaMaskProvider();
      return provider?.request ? signMessageWithEthereumProvider(provider?.request, message, address) : '';
    }
    case Wallets.Vessel:
      return signMessageWithEthereumProvider(window.vessel.ethereum.request, message, address);
    case Wallets.Binance: {
      const provider = window.BinanceChain;
      return provider?.request ? signMessageWithEthereumProvider(provider?.request, message, address) : '';
    }
    case Wallets.Coinbase: {
      const provider = getCoinbaseProvider();
      return provider?.request ? signMessageWithEthereumProvider(provider?.request, message, address) : '';
    }
    case Wallets.GenericEthereumWallet: {
      const provider = getOtherInjectedProvider();
      return provider?.request ? signMessageWithEthereumProvider(provider?.request, message, address) : '';
    }
    default:
      return '';
  }
};

export const isSolanaWallet = (wallet: Wallets) => [Wallets.Phantom, Wallets.GenericSolanaWallet].includes(wallet);

export const isEthereumWallet = (wallet: Wallets) =>
  [Wallets.Vessel, Wallets.Binance, Wallets.GenericEthereumWallet, Wallets.Coinbase, Wallets.Metamask].includes(wallet);
