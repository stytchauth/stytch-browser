import type { Meta, StoryObj } from '@storybook/react';
import { expect } from 'storybook/test';

import { CryptoWalletButtons } from './WalletButtons';

// Helper function to clear all wallet globals
const clearAllWallets = () => {
  // @ts-expect-error - Clear wallet globals for clean state
  window.ethereum = undefined;
  // @ts-expect-error - Clear wallet globals for clean state
  window.solana = undefined;
  // @ts-expect-error - Clear wallet globals for clean state
  window.BinanceChain = undefined;
};

const meta = {
  component: CryptoWalletButtons,
  args: {
    type: 'main',
  },
  parameters: {
    stytch: {
      disableSnackbar: true,
    },
  },
} satisfies Meta<typeof CryptoWalletButtons>;

export default meta;

type Story = StoryObj<typeof meta>;

export const AllWallets: Story = {
  beforeEach: () => {
    // Clear all wallets first for clean state
    clearAllWallets();

    // Mock all Ethereum wallets
    window.ethereum = {
      providers: [
        { isMetaMask: true, request: () => [] as string[] },
        { isCoinbaseWallet: true, request: () => [] as string[] },
      ],
    };
    // Mock Phantom (Solana)
    window.solana = {
      isPhantom: true,
      connect: () => ({ publicKey: { toString: () => 'phantom-public-key' } }),
      request: () => ({ signature: new Uint8Array() }),
    };
    // Mock Binance Chain
    window.BinanceChain = { request: () => [] as string[] };
  },
  play: async ({ canvas }) => {
    await expect(await canvas.findByText('Continue with Metamask')).toBeInTheDocument();
    await expect(await canvas.findByText('Continue with Coinbase')).toBeInTheDocument();
    await expect(await canvas.findByText('Continue with Phantom')).toBeInTheDocument();
    await expect(await canvas.findByText('Continue with Binance')).toBeInTheDocument();
  },
};

export const GenericSolanaWallet: Story = {
  beforeEach: () => {
    // Clear all wallets first for clean state
    clearAllWallets();

    // Mock generic Solana wallet (not Phantom)
    window.solana = {
      isPhantom: false, // This triggers GenericSolanaWallet detection
      connect: () => ({ publicKey: { toString: () => 'solana-public-key' } }),
      request: () => ({ signature: new Uint8Array() }),
    };
  },
  play: async ({ canvas }) => {
    await expect(await canvas.findByText('Continue with Other Solana Wallet')).toBeInTheDocument();
  },
};

export const GenericEthereumWallet: Story = {
  beforeEach: () => {
    // Clear all wallets first for clean state
    clearAllWallets();

    // Mock generic Ethereum wallet (not MetaMask or Coinbase)
    window.ethereum = {
      request: () => [] as string[],
      // No isMetaMask or isCoinbaseWallet flags = generic Ethereum wallet
    };
  },
  play: async ({ canvas }) => {
    await expect(await canvas.findByText('Continue with Other Ethereum Wallet')).toBeInTheDocument();
  },
};

export const NoWalletsDetected: Story = {
  beforeEach: () => {
    // Clear all wallets for no wallet detection scenario
    clearAllWallets();
  },
  play: async ({ canvas }) => {
    await expect(await canvas.findByText('Set up a new crypto wallet')).toBeInTheDocument();
  },
};
