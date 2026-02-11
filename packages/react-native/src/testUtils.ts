import { IAsyncPKCEManager, ProofkeyPair } from '@stytch/core';
import {
  createB2BTestFixtures,
  createTestFixtures as coreCreateTestFixtures,
  getMockStorageClient,
  IB2BSubscriptionServiceMock,
  IConsumerSubscriptionServiceMock,
  INetworkClientMock,
  MockDFPProtectedAuth,
} from '@stytch/core/testUtils';

import { MOCK_CAPTCHA, MOCK_DFP_TELEMETRY_ID, MOCK_KEYPAIR } from './mocks';

class MockPKCEManager implements IAsyncPKCEManager {
  private pair: ProofkeyPair | undefined;

  constructor() {
    this.pair = undefined;
  }

  setPKPair(pair: ProofkeyPair) {
    this.pair = pair;
  }

  clearPKPair(): Promise<void> {
    this.pair = undefined;
    return Promise.resolve();
  }

  async getPKPair(): Promise<ProofkeyPair | undefined> {
    return Promise.resolve(this.pair);
  }

  startPKCETransaction(): Promise<ProofkeyPair> {
    this.pair = MOCK_KEYPAIR;
    return Promise.resolve(this.pair);
  }
}

export const createTestFixtures = (): {
  networkClient: INetworkClientMock;
  subscriptionService: IConsumerSubscriptionServiceMock;
  b2bSubscriptionService: IB2BSubscriptionServiceMock;
  pkceManager: MockPKCEManager;
  captchaProvider: () => Promise<string>;
  dfpProtectedAuth: MockDFPProtectedAuth;
} => {
  const { networkClient, subscriptionService, captchaProvider, dfpProtectedAuth } = coreCreateTestFixtures();
  const { subscriptionService: b2bSubscriptionService } = createB2BTestFixtures();

  const pkceManager = new MockPKCEManager();

  return {
    networkClient,
    subscriptionService,
    b2bSubscriptionService,
    pkceManager,
    captchaProvider,
    dfpProtectedAuth,
  };
};

export const MOCK_STORAGE_CLIENT = getMockStorageClient();

export const MockDFPProtectedAuthWithCaptcha = () =>
  new MockDFPProtectedAuth(true, MOCK_DFP_TELEMETRY_ID, () => Promise.resolve(MOCK_CAPTCHA));

export type { IB2BSubscriptionServiceMock, IConsumerSubscriptionServiceMock, INetworkClientMock };

export {
  createResolvablePromise,
  MockDFPProtectedAuth,
  MockDFPProtectedAuthCaptchaOnly,
  MockDFPProtectedAuthDFPAndCaptcha,
  MockDFPProtectedAuthDFPOnly,
  MockDFPProtectedAuthDisabled,
} from '@stytch/core/testUtils';
