import {
  createTestFixtures,
  IConsumerSubscriptionServiceMock,
  INetworkClientMock,
  MockDFPProtectedAuthCaptchaOnly,
  MockDFPProtectedAuthDFPOnly,
} from '../testing';
import { StytchProjectConfigurationInput } from '../public/typeConfig';
import {
  MOCK_AUTHENTICATE_PAYLOAD,
  updateSessionExpect,
  MOCK_AUTHENTICATE_RETURN_VALUE,
  MOCK_CAPTCHA,
  MOCK_DFP_TELEMTRY_ID,
} from '@stytch/internal-mocks';
import { HeadlessCryptoWalletClient } from './HeadlessCryptoWalletClient';

describe('HeadlessCryptoWalletClient', () => {
  let networkClient: INetworkClientMock;
  let subscriptionService: IConsumerSubscriptionServiceMock;
  let apiNetworkClient: INetworkClientMock;
  let captchaProvider: () => Promise<string>;

  let client: HeadlessCryptoWalletClient<StytchProjectConfigurationInput>;

  beforeEach(() => {
    jest.resetAllMocks();

    ({ networkClient, subscriptionService, captchaProvider, apiNetworkClient } = createTestFixtures());

    client = new HeadlessCryptoWalletClient(
      networkClient,
      apiNetworkClient,
      subscriptionService,
      captchaProvider,
      MockDFPProtectedAuthCaptchaOnly(),
    );
  });

  const authenticateStartOptions = {
    crypto_wallet_address: '0xDEADBEEF',
    crypto_wallet_type: 'StytchCoin',
  };

  describe('authenticateStart', () => {
    it('Calls the authenticateStartPrimary method when the user is not logged in yet', async () => {
      subscriptionService.getSession.mockReturnValue(null);
      await client.authenticateStart(authenticateStartOptions);
      expect(apiNetworkClient.fetchSDK).toHaveBeenCalledWith({
        url: '/crypto_wallets/authenticate/start/primary',
        method: 'POST',
        body: {
          crypto_wallet_address: '0xDEADBEEF',
          crypto_wallet_type: 'StytchCoin',
          captcha_token: MOCK_CAPTCHA,
        },
      });
    });

    it('Calls the authenticateStartSecondary method when the user is logged in', async () => {
      subscriptionService.getSession.mockReturnValue({ mock: 'session' });
      await client.authenticateStart(authenticateStartOptions);
      expect(apiNetworkClient.fetchSDK).toHaveBeenCalledWith({
        url: '/crypto_wallets/authenticate/start/secondary',
        method: 'POST',
        body: {
          crypto_wallet_address: '0xDEADBEEF',
          crypto_wallet_type: 'StytchCoin',
          captcha_token: MOCK_CAPTCHA,
        },
      });
    });
  });

  const authenticateOptions = {
    ...authenticateStartOptions,
    signature: 'signature',
    session_duration_minutes: 100,
  };
  describe('authenticate', () => {
    it('Calls the authenticate method, stores some data in the subscriptionService, and returns a cleaned response', async () => {
      apiNetworkClient.retriableFetchSDK.mockReturnValue(MOCK_AUTHENTICATE_PAYLOAD);

      await expect(client.authenticate(authenticateOptions)).resolves.toEqual(MOCK_AUTHENTICATE_RETURN_VALUE);

      expect(apiNetworkClient.retriableFetchSDK).toHaveBeenCalledWith({
        url: '/crypto_wallets/authenticate',
        method: 'POST',
        body: {
          crypto_wallet_address: '0xDEADBEEF',
          crypto_wallet_type: 'StytchCoin',
          signature: 'signature',
          session_duration_minutes: 100,
          captcha_token: MOCK_CAPTCHA,
        },
        retryCallback: expect.any(Function),
      });

      expect(subscriptionService.updateSession).toHaveBeenCalledWith(updateSessionExpect());
    });
    it('Calls the authenticate method with dfp protected auth enabled', async () => {
      client = new HeadlessCryptoWalletClient(
        networkClient,
        apiNetworkClient,
        subscriptionService,
        captchaProvider,
        MockDFPProtectedAuthDFPOnly(),
      );

      apiNetworkClient.retriableFetchSDK.mockReturnValue(MOCK_AUTHENTICATE_PAYLOAD);

      await expect(client.authenticate(authenticateOptions)).resolves.toEqual(MOCK_AUTHENTICATE_RETURN_VALUE);

      expect(apiNetworkClient.retriableFetchSDK).toHaveBeenCalledWith({
        url: '/crypto_wallets/authenticate',
        method: 'POST',
        body: {
          crypto_wallet_address: '0xDEADBEEF',
          crypto_wallet_type: 'StytchCoin',
          signature: 'signature',
          session_duration_minutes: 100,
          dfp_telemetry_id: MOCK_DFP_TELEMTRY_ID,
        },
        retryCallback: expect.any(Function),
      });

      expect(subscriptionService.updateSession).toHaveBeenCalledWith(updateSessionExpect());
    });
  });
});
