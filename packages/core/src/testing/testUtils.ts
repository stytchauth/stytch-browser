import { MOCK_CAPTCHA, MOCK_DFP_TELEMTRY_ID, MOCK_KEYPAIR } from '@stytch/internal-mocks';

import { INetworkClient, RetriableError, SDKBaseRequestInfo } from '../NetworkClient';
import { ISyncPKCEManager, ProofkeyPair } from '../PKCEManager';
import { StytchProjectConfigurationInput } from '../public/typeConfig';
import { IStorageClient } from '../StorageClient';
import { IB2BSubscriptionService, IConsumerSubscriptionService } from '../SubscriptionService';

type DFPProtectedAuthState = {
  mockTelemetryID?: string;
  enabled: boolean;
  executeRecaptcha: () => Promise<string | undefined>;
};

export class MockDFPProtectedAuth {
  private state: DFPProtectedAuthState;

  constructor(
    enabled: boolean,
    mockTelemetryID: string | undefined,
    executeRecaptcha: () => Promise<string | undefined> = () => Promise.resolve(undefined),
  ) {
    this.state = {
      enabled,
      mockTelemetryID,
      executeRecaptcha,
    };
  }

  isEnabled = async (): Promise<boolean> => {
    return Promise.resolve(this.state.enabled);
  };

  getTelemetryID = async (): Promise<string | undefined> => {
    return Promise.resolve(this.state.mockTelemetryID);
  };

  getDFPTelemetryIDAndCaptcha = async (): Promise<{ dfp_telemetry_id?: string; captcha_token?: string }> => {
    const { enabled, executeRecaptcha } = await this.state;

    let dfp_telemetry_id: string | undefined = undefined;
    let captcha_token: string | undefined = undefined;
    if (enabled) {
      dfp_telemetry_id = await this.getTelemetryID();
    } else {
      captcha_token = await executeRecaptcha();
    }
    return { dfp_telemetry_id, captcha_token };
  };

  executeRecaptcha = async (): Promise<string | undefined> => {
    return this.executeRecaptcha();
  };

  retryWithCaptchaAndDFP = async (e: RetriableError, req: SDKBaseRequestInfo): Promise<SDKBaseRequestInfo> => {
    if (this.state.enabled) {
      if (req.body) {
        req.body.dfp_telemetry_id = this.state.mockTelemetryID;
        req.body.captcha_token = await this.executeRecaptcha();
      }
      return req;
    }
    return req;
  };
}

export const MockDFPProtectedAuthDisabled = (): MockDFPProtectedAuth =>
  new MockDFPProtectedAuth(false, undefined, () => Promise.resolve(undefined));

export const MockDFPProtectedAuthCaptchaOnly = () =>
  new MockDFPProtectedAuth(false, undefined, () => Promise.resolve(MOCK_CAPTCHA));

export const MockDFPProtectedAuthDFPAndCaptcha = () =>
  new MockDFPProtectedAuth(true, MOCK_DFP_TELEMTRY_ID, () => Promise.resolve(MOCK_CAPTCHA));

export const MockDFPProtectedAuthDFPOnly = () =>
  new MockDFPProtectedAuth(true, MOCK_DFP_TELEMTRY_ID, () => Promise.resolve(undefined));

export class MockPKCEManager implements ISyncPKCEManager {
  private pair: ProofkeyPair | undefined;

  constructor() {
    this.pair = undefined;
  }

  setPKPair(pair: ProofkeyPair) {
    this.pair = pair;
  }

  clearPKPair(): void {
    this.pair = undefined;
  }

  getPKPair(): ProofkeyPair | undefined {
    return this.pair;
  }

  startPKCETransaction(): Promise<ProofkeyPair> {
    this.pair = MOCK_KEYPAIR;
    return Promise.resolve(this.pair);
  }
}

export type INetworkClientMock = {
  [k in keyof INetworkClient]: jest.Mock;
};

export type IConsumerSubscriptionServiceMock = {
  [k in keyof IConsumerSubscriptionService<StytchProjectConfigurationInput>]: jest.Mock;
};

export type IB2BSubscriptionServiceMock = {
  [k in keyof IB2BSubscriptionService<StytchProjectConfigurationInput>]: jest.Mock;
};

export const createTestFixtures = (): {
  networkClient: INetworkClientMock;
  apiNetworkClient: INetworkClientMock;
  subscriptionService: IConsumerSubscriptionServiceMock;
  pkceManager: MockPKCEManager;
  secondPKCEManager: MockPKCEManager;
  captchaProvider: () => Promise<string>;
  dfpProtectedAuth: MockDFPProtectedAuth;
} => {
  const networkClient: INetworkClientMock = {
    fetchSDK: jest.fn(),
    retriableFetchSDK: jest.fn(),
    logEvent: jest.fn(),
    createTelemetryBlob: jest.fn(),
    updateSessionToken: jest.fn(),
  };

  const apiNetworkClient: INetworkClientMock = {
    fetchSDK: jest.fn(),
    retriableFetchSDK: jest.fn(),
    logEvent: jest.fn(),
    createTelemetryBlob: jest.fn(),
    updateSessionToken: jest.fn(),
  };

  const updateSession = jest.fn();
  const subscriptionService: IConsumerSubscriptionServiceMock = {
    updateStateAndTokens: jest.fn(),
    updateState: jest.fn(),
    getState: jest.fn(),
    updateUser: jest.fn(),
    destroyState: jest.fn(),
    updateSession,
    withUpdateSession: jest.fn().mockImplementation((fn) => async (...args: unknown[]) => {
      const resp = await fn(...args);
      updateSession(resp);
      return resp;
    }),
    destroySession: jest.fn(),
    getSession: jest.fn(),
    subscribeToState: jest.fn(),
    getUser: jest.fn(),
    getTokens: jest.fn(),
    syncFromDeviceStorage: jest.fn(),
    updateTokens: jest.fn(),
    getIntermediateSessionToken: jest.fn(),
    getFromCache: jest.fn(),
    setCacheRefreshed: jest.fn(),
  };

  const pkceManager = new MockPKCEManager();
  const secondPKCEManager = new MockPKCEManager();

  const captchaProvider = () => Promise.resolve(MOCK_CAPTCHA);

  const dfpProtectedAuth = new MockDFPProtectedAuth(false, undefined, captchaProvider);

  return {
    networkClient,
    apiNetworkClient,
    subscriptionService,
    pkceManager,
    secondPKCEManager,
    captchaProvider,
    dfpProtectedAuth,
  };
};

export const createB2BTestFixtures = (): {
  networkClient: INetworkClientMock;
  apiNetworkClient: INetworkClientMock;
  subscriptionService: IB2BSubscriptionServiceMock;
  pkceManager: MockPKCEManager;
  secondPKCEManager: MockPKCEManager;
  captchaProvider: () => Promise<string>;
} => {
  const networkClient: INetworkClientMock = {
    fetchSDK: jest.fn(),
    retriableFetchSDK: jest.fn(),
    logEvent: jest.fn(),
    createTelemetryBlob: jest.fn(),
    updateSessionToken: jest.fn(),
  };

  const apiNetworkClient: INetworkClientMock = {
    fetchSDK: jest.fn(),
    retriableFetchSDK: jest.fn(),
    logEvent: jest.fn(),
    createTelemetryBlob: jest.fn(),
    updateSessionToken: jest.fn(),
  };

  const updateSession = jest.fn();
  const subscriptionService: IB2BSubscriptionServiceMock = {
    updateStateAndTokens: jest.fn(),
    updateState: jest.fn(),
    getState: jest.fn(),
    updateMember: jest.fn(),
    destroyState: jest.fn(),
    updateSession,
    withUpdateSession: jest.fn().mockImplementation((fn) => async (...args: unknown[]) => {
      const resp = await fn(...args);
      updateSession(resp);
      return resp;
    }),
    destroySession: jest.fn(),
    getSession: jest.fn(),
    subscribeToState: jest.fn(),
    getMember: jest.fn(),
    getTokens: jest.fn(),
    syncFromDeviceStorage: jest.fn(),
    updateTokens: jest.fn(),
    getIntermediateSessionToken: jest.fn(),
    getOrganization: jest.fn(),
    updateOrganization: jest.fn(),
    getFromCache: jest.fn(),
    setCacheRefreshed: jest.fn(),
  };

  const pkceManager = new MockPKCEManager();
  const secondPKCEManager = new MockPKCEManager();

  const captchaProvider = () => Promise.resolve(MOCK_CAPTCHA);

  return {
    networkClient,
    apiNetworkClient,
    subscriptionService,
    pkceManager,
    secondPKCEManager,
    captchaProvider,
  };
};

export const createResolvablePromise = <T = void>() => {
  let resolve: ((value: T) => void) | undefined;
  let reject: ((error?: unknown) => void) | undefined;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve: resolve as NonNullable<typeof resolve>, reject: reject as NonNullable<typeof reject> };
};

export function getMockStorageClient() {
  return {
    getData: jest.fn(),
    setData: jest.fn(),
    clearData: jest.fn(),
  } satisfies IStorageClient;
}

export const PUBLIC_TOKEN = 'public-token-test-1234';
