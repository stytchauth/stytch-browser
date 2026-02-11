import React from 'react';
import { encode } from 'bs58';

import Container from '../b2c/Container';
import { MockConfig, MockGlobalContextProvider, render, screen, MockClient, waitFor } from '../../testUtils';
import { CryptoWalletAuthenticateResponse, CryptoWalletAuthenticateStartResponse, Products } from '@stytch/core/public';
import { createResolvablePromise } from '../../testUtils';
import userEvent from '@testing-library/user-event';

describe('Crypto Wallet Flow', () => {
  const renderAppWithConfig = (config?: MockConfig, client?: MockClient) => {
    return render(
      <MockGlobalContextProvider config={config} client={client}>
        <Container />
      </MockGlobalContextProvider>,
    );
  };

  afterEach(() => {
    // @ts-expect-error -- ethereum is typed as required, but should be optional
    delete window.ethereum;
    // @ts-expect-error -- solana is typed as required, but should be optional
    delete window.solana;
  });

  it('Successfully handles an ethereum crypto login', async () => {
    const walletAddress = '0x1234567890';
    const walletSignature = '0x987654321';
    const walletChallenge = '12345';
    window.ethereum = {
      isMetaMask: true,
      request: jest.fn().mockImplementation(({ method }) => {
        switch (method) {
          case 'eth_requestAccounts':
            return [walletAddress];
          case 'personal_sign':
            return walletSignature;
          default:
            return '';
        }
      }),
    };
    const config: MockConfig = {
      products: [Products.crypto],
      sessionOptions: {
        sessionDurationMinutes: 60,
      },
    };

    const authenticateStartPromise = createResolvablePromise<CryptoWalletAuthenticateStartResponse>();
    const authenticatePromise = createResolvablePromise<CryptoWalletAuthenticateResponse>();

    const client: MockClient = {
      cryptoWallets: {
        authenticateStart: jest.fn().mockReturnValue(authenticateStartPromise.promise),
        authenticate: jest.fn().mockReturnValue(authenticatePromise.promise),
      },
    };

    renderAppWithConfig(config, client);

    const metamaskButton = await screen.findByText('Continue with Metamask');
    await userEvent.click(metamaskButton);

    await waitFor(() => {
      const connectWalletScreen = screen.getByText('Connecting to your wallet...');
      expect(connectWalletScreen).toBeDefined();
    });

    expect(window.ethereum.request).toHaveBeenCalledTimes(1);
    expect(window.ethereum.request).toHaveBeenCalledWith({
      method: 'eth_requestAccounts',
    });
    expect(client.cryptoWallets?.authenticateStart).toHaveBeenCalledWith({
      crypto_wallet_address: walletAddress,
      crypto_wallet_type: 'ethereum',
    });

    authenticateStartPromise.resolve({ challenge: walletChallenge } as CryptoWalletAuthenticateStartResponse);

    await waitFor(() => {
      const signMessageScreen = screen.getByText('Completing signature request...');
      expect(signMessageScreen).toBeDefined();
    });

    authenticatePromise.resolve({} as CryptoWalletAuthenticateResponse);

    await waitFor(() => {
      const foundSuccessScreen = screen.getByText('You have successfully connected your wallet.');
      expect(foundSuccessScreen).toBeDefined();
    });

    expect(window.ethereum.request).toHaveBeenCalledTimes(2);
    expect(window.ethereum.request).toHaveBeenNthCalledWith(2, {
      method: 'personal_sign',
      params: [walletChallenge, walletAddress],
    });
    expect(client.cryptoWallets?.authenticate).toHaveBeenCalledWith({
      crypto_wallet_address: walletAddress,
      signature: walletSignature,
      crypto_wallet_type: 'ethereum',
      session_duration_minutes: config.sessionOptions?.sessionDurationMinutes,
    });
  });

  it('Successfully handles a solana crypto login', async () => {
    const walletAddress = '0x1234567890';
    const walletSignature = new Uint8Array([0x98, 0x76, 0x54, 0x32, 0x10]);
    const encodedSignature = encode(walletSignature);
    const walletChallenge = '12345';
    window.solana = {
      isPhantom: true,
      connect: jest.fn().mockImplementation(() => ({
        publicKey: { toString: () => walletAddress },
      })),
      request: jest.fn().mockImplementation(() => {
        return { signature: walletSignature };
      }),
    };
    const config: MockConfig = {
      products: [Products.crypto],
      sessionOptions: {
        sessionDurationMinutes: 60,
      },
    };

    const authenticateStartPromise = createResolvablePromise<CryptoWalletAuthenticateStartResponse>();
    const authenticatePromise = createResolvablePromise<CryptoWalletAuthenticateResponse>();

    const client: MockClient = {
      cryptoWallets: {
        authenticateStart: jest.fn().mockReturnValue(authenticateStartPromise.promise),
        authenticate: jest.fn().mockReturnValue(authenticatePromise.promise),
      },
    };

    renderAppWithConfig(config, client);

    const phantomButton = await screen.findByText('Continue with Phantom');
    await userEvent.click(phantomButton);

    await waitFor(() => {
      const connectWalletScreen = screen.getByText('Connecting to your wallet...');
      expect(connectWalletScreen).toBeDefined();
    });

    expect(window.solana.connect).toHaveBeenCalledTimes(1);
    expect(client.cryptoWallets?.authenticateStart).toHaveBeenCalledWith({
      crypto_wallet_address: walletAddress,
      crypto_wallet_type: 'solana',
    });

    authenticateStartPromise.resolve({ challenge: walletChallenge } as CryptoWalletAuthenticateStartResponse);

    await waitFor(() => {
      const signMessageScreen = screen.getByText('Completing signature request...');
      expect(signMessageScreen).toBeDefined();
    });

    authenticatePromise.resolve({} as CryptoWalletAuthenticateResponse);

    await waitFor(() => {
      const foundSuccessScreen = screen.getByText('You have successfully connected your wallet.');
      expect(foundSuccessScreen).toBeDefined();
    });

    expect(window.solana.request).toHaveBeenCalledTimes(1);
    expect(window.solana.request).toHaveBeenCalledWith({
      method: 'signMessage',
      params: {
        message: new TextEncoder().encode(walletChallenge),
        display: 'utf8',
      },
    });
    expect(client.cryptoWallets?.authenticate).toHaveBeenCalledWith({
      crypto_wallet_address: walletAddress,
      signature: encodedSignature,
      crypto_wallet_type: 'solana',
      session_duration_minutes: config.sessionOptions?.sessionDurationMinutes,
    });
  });

  it('Successfully handles an error', async () => {
    window.ethereum = {
      isMetaMask: true,
    };

    const config: MockConfig = {
      products: [Products.crypto],
      sessionOptions: {
        sessionDurationMinutes: 60,
      },
    };

    const authenticateStartPromise = createResolvablePromise<CryptoWalletAuthenticateStartResponse>();

    const client: MockClient = {
      cryptoWallets: {
        authenticateStart: jest.fn().mockReturnValue(authenticateStartPromise.promise),
        authenticate: jest.fn().mockRejectedValue(new Error('Something went wrong')),
      },
    };

    renderAppWithConfig(config, client);

    const metamaskButton = await screen.findByText('Continue with Metamask');
    await userEvent.click(metamaskButton);

    await waitFor(() => {
      const connectWalletScreen = screen.getByText('Connecting to your wallet...');
      expect(connectWalletScreen).toBeDefined();
    });

    authenticateStartPromise.reject(new Error('Something went wrong'));

    await waitFor(() => {
      const foundErrorScreen = screen.getByText('Looks like there was an error!');
      expect(foundErrorScreen).toBeDefined();
    });
  });

  it('Successfully navigates to set up a new wallet', async () => {
    const config: MockConfig = {
      products: [Products.crypto],
    };

    renderAppWithConfig(config);
    await userEvent.click(screen.getByText('Set up a new crypto wallet'));

    const foundSetUpScreen = screen.getByText('Set up a new crypto wallet');

    expect(foundSetUpScreen).toBeDefined();
  });
});
