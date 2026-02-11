import {
  MOCK_AUTHENTICATE_PAYLOAD,
  MOCK_AUTHENTICATE_RETURN_VALUE,
  MOCK_AUTHENTICATE_STATE_UPDATE,
  MOCK_PUBLIC_TOKEN,
} from '@stytch/internal-mocks';

import { MULTIPLE_STYTCH_CLIENTS_DETECTED_WARNING } from './constants';
import { HeadlessSessionClient } from './HeadlessClients';
import { MOCK_RECOVERABLE_ERROR, MOCK_UNRECOVERABLE_ERROR } from './mocks';
import { AuthenticateResponse } from './public';
import { StytchProjectConfigurationInput } from './public/typeConfig';
import type { SessionManager } from './SessionManager';
import { IStorageClient } from './StorageClient';
import { ConsumerSubscriptionService } from './SubscriptionService';
import { createTestFixtures } from './testing';
import { logger } from './utils/logger';

jest.mock('./utils/logger', () => ({
  logger: {
    debug: jest.fn(),
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

// In order to run the v8 event loop to make sure .then() callbacks
// get executed as expected, we use new Promise(done => setTimeout(done), 0)
// in many places. We need a pointer to the OG setTimeout before jest monkey patches it
// since we use fake timers here.
// TODO: Pull this into a util
const originalSetTimeout = global.setTimeout;
const runEventLoop = () => new Promise((tick) => originalSetTimeout(tick, 0));

class InMemoryStorageClient implements IStorageClient {
  private _data: Record<string, string>;
  constructor() {
    this._data = {};
  }
  clearData(key: string) {
    delete this._data[key];
    return Promise.resolve({ success: true });
  }

  getData(key: string) {
    return Promise.resolve(this._data[key] ?? null);
  }

  setData(key: string, data: string) {
    this._data[key] = data;
    return Promise.resolve({ success: true });
  }
}

// SessionManager is stateful, so we want to isolate its state between tests
const importSessionManagerModule = async () => {
  let sessionManagerModule: typeof import('./SessionManager');
  await jest.isolateModulesAsync(async () => {
    sessionManagerModule = await import('./SessionManager');
  });
  return sessionManagerModule!;
};

describe('SessionManager', () => {
  const { networkClient } = createTestFixtures();
  let sessionManager: SessionManager<StytchProjectConfigurationInput>;
  let subscriptionService: ConsumerSubscriptionService<StytchProjectConfigurationInput>;

  const createSessionManager = async (options: { keepSessionAlive?: boolean } = {}) => {
    const storageClient = new InMemoryStorageClient();
    subscriptionService = new ConsumerSubscriptionService(MOCK_PUBLIC_TOKEN, storageClient);
    jest.spyOn(subscriptionService, 'updateStateAndTokens');
    jest.spyOn(subscriptionService, 'destroySession');
    const sessionClient = new HeadlessSessionClient(networkClient, subscriptionService);
    sessionManager = new (await importSessionManagerModule()).SessionManager(
      subscriptionService,
      sessionClient,
      MOCK_PUBLIC_TOKEN,
      options,
    );
    sessionManager.performBackgroundRefresh();
    return sessionManager;
  };

  const setupAuthenticate = (pattern: unknown[]) => {
    pattern.forEach((response) => {
      if (response instanceof Error) {
        networkClient.fetchSDK.mockRejectedValueOnce(response);
      } else {
        networkClient.fetchSDK.mockResolvedValueOnce(response);
      }
    });
  };

  const expectWorkerToBeScheduled = () => expect(jest.getTimerCount()).toBe(1);

  const expectNoWorkerToBeScheduled = () => expect(jest.getTimerCount()).toBe(0);

  beforeEach(() => {
    jest.resetAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    sessionManager?.cancelBackgroundRefresh();
  });

  it('On initialization, it authenticates the current session and sets a background worker to do so again', async () => {
    setupAuthenticate([MOCK_AUTHENTICATE_PAYLOAD]);
    sessionManager = await createSessionManager();
    await runEventLoop();
    expect(networkClient.fetchSDK).toHaveBeenCalledTimes(1);
    expect(subscriptionService.updateStateAndTokens).toHaveBeenCalled();
    expectWorkerToBeScheduled();
  });

  it('On initialization, if the current session cannot be initialized, no worker is created', async () => {
    setupAuthenticate([MOCK_UNRECOVERABLE_ERROR]);
    sessionManager = await createSessionManager();
    await runEventLoop();
    expect(networkClient.fetchSDK).toHaveBeenCalledTimes(1);
    expect(subscriptionService.destroySession).toHaveBeenCalled();
    expectNoWorkerToBeScheduled();
  });

  it('The client will retry validating the session multiple times until it succeeds and schedules a worker', async () => {
    setupAuthenticate([MOCK_RECOVERABLE_ERROR, MOCK_RECOVERABLE_ERROR, MOCK_AUTHENTICATE_PAYLOAD]);
    sessionManager = await createSessionManager();
    await runEventLoop();
    expect(networkClient.fetchSDK).toHaveBeenCalledTimes(1);
    expectWorkerToBeScheduled();

    jest.runAllTimers();
    await runEventLoop();
    expect(networkClient.fetchSDK).toHaveBeenCalledTimes(2);
    expectWorkerToBeScheduled();

    jest.runAllTimers();
    await runEventLoop();
    expect(networkClient.fetchSDK).toHaveBeenCalledTimes(3);
    expect(subscriptionService.updateStateAndTokens).toHaveBeenCalled();
    expectWorkerToBeScheduled();
  });

  it('The client will never stop retrying so long as it is given a recoverable error', async () => {
    setupAuthenticate(new Array(100).fill(MOCK_RECOVERABLE_ERROR).concat(MOCK_UNRECOVERABLE_ERROR));
    sessionManager = await createSessionManager();

    for (let i = 1; i < 101; i++) {
      await runEventLoop();
      expect(networkClient.fetchSDK).toHaveBeenCalledTimes(i);
      expectWorkerToBeScheduled();

      jest.runAllTimers();
    }
    expect(subscriptionService.destroySession).not.toHaveBeenCalled();

    await runEventLoop();
    expect(networkClient.fetchSDK).toHaveBeenCalledTimes(101);
    expect(subscriptionService.destroySession).toHaveBeenCalled();
    expectNoWorkerToBeScheduled();
  });

  it('The client will stop retrying when it encounters an unrecoverable error', async () => {
    setupAuthenticate([MOCK_RECOVERABLE_ERROR, MOCK_RECOVERABLE_ERROR, MOCK_UNRECOVERABLE_ERROR]);
    sessionManager = await createSessionManager();
    await runEventLoop();
    expect(networkClient.fetchSDK).toHaveBeenCalledTimes(1);
    expectWorkerToBeScheduled();

    jest.runAllTimers();
    await runEventLoop();
    expect(networkClient.fetchSDK).toHaveBeenCalledTimes(2);
    expectWorkerToBeScheduled();

    jest.runAllTimers();
    await runEventLoop();
    expect(networkClient.fetchSDK).toHaveBeenCalledTimes(3);
    expect(subscriptionService.destroySession).toHaveBeenCalled();
    expectNoWorkerToBeScheduled();
  });
  jest.setTimeout(100000000000000);
  it('In steady state, the client will make an API call to refresh the session every 3 minutes', async () => {
    setupAuthenticate([
      MOCK_AUTHENTICATE_PAYLOAD,
      MOCK_AUTHENTICATE_PAYLOAD,
      MOCK_AUTHENTICATE_PAYLOAD,
      MOCK_AUTHENTICATE_PAYLOAD,
      MOCK_AUTHENTICATE_PAYLOAD,
      MOCK_AUTHENTICATE_PAYLOAD,
    ]);
    sessionManager = await createSessionManager();
    await runEventLoop();
    expect(networkClient.fetchSDK).toHaveBeenCalledTimes(1);
    expect(subscriptionService.updateStateAndTokens).toHaveBeenCalledTimes(1);
    expectWorkerToBeScheduled();

    jest.advanceTimersByTime(1800001);
    await runEventLoop();
    expect(networkClient.fetchSDK).toHaveBeenCalledTimes(2);
    expect(subscriptionService.updateStateAndTokens).toHaveBeenCalledTimes(2);
    expectWorkerToBeScheduled();

    jest.advanceTimersByTime(1800001);
    await runEventLoop();
    expect(networkClient.fetchSDK).toHaveBeenCalledTimes(3);
    expect(subscriptionService.updateStateAndTokens).toHaveBeenCalledTimes(3);
    expectWorkerToBeScheduled();

    jest.advanceTimersByTime(1800001);
    await runEventLoop();
    expect(networkClient.fetchSDK).toHaveBeenCalledTimes(4);
    expect(subscriptionService.updateStateAndTokens).toHaveBeenCalledTimes(4);
    expectWorkerToBeScheduled();
  });

  describe('onChange event handling', () => {
    it('When another process logs in the user, schedule a worker', async () => {
      setupAuthenticate([MOCK_UNRECOVERABLE_ERROR]);
      sessionManager = await createSessionManager();
      await runEventLoop();
      expectNoWorkerToBeScheduled();
      subscriptionService.updateStateAndTokens(MOCK_AUTHENTICATE_STATE_UPDATE as any);
      expectWorkerToBeScheduled();
    });

    it('When another process logs out the user, cancel the worker', async () => {
      setupAuthenticate([MOCK_AUTHENTICATE_PAYLOAD]);
      sessionManager = await createSessionManager();
      await runEventLoop();
      expectWorkerToBeScheduled();
      subscriptionService.updateState({
        user: undefined,
        session: undefined,
      });
      expectNoWorkerToBeScheduled();
    });
  });

  describe('timeoutForAttempt', () => {
    let random: jest.SpiedFunction<typeof Math.random>;

    beforeEach(() => {
      random = jest.spyOn(Math, 'random');
    });

    afterEach(() => {
      random.mockRestore();
    });

    it('Produces an exponential backoff call pattern', async () => {
      random.mockReturnValue(0.5);
      const { SessionManager } = await importSessionManagerModule();
      expect(SessionManager.timeoutForAttempt(0)).toBe(2e3);
      expect(SessionManager.timeoutForAttempt(1)).toBe(4e3);
      expect(SessionManager.timeoutForAttempt(2)).toBe(8e3);
      expect(SessionManager.timeoutForAttempt(3)).toBe(16e3);
      expect(SessionManager.timeoutForAttempt(4)).toBe(32e3);
      expect(SessionManager.timeoutForAttempt(5)).toBe(64e3);
      expect(SessionManager.timeoutForAttempt(6)).toBe(128e3);
      expect(SessionManager.timeoutForAttempt(7)).toBe(256e3);
      expect(SessionManager.timeoutForAttempt(8)).toBe(256e3);
      expect(SessionManager.timeoutForAttempt(9)).toBe(256e3);
      expect(SessionManager.timeoutForAttempt(10)).toBe(256e3);
    });

    it('Incorporates a little bit of jitter, as a treat', async () => {
      random.mockReturnValue(0.3456756);
      const { SessionManager } = await importSessionManagerModule();
      expect(SessionManager.timeoutForAttempt(0)).toBe(1945);
    });
  });

  describe('keepSessionAlive', () => {
    it('should not add session_duration_minutes if not enabled', async () => {
      setupAuthenticate([MOCK_AUTHENTICATE_PAYLOAD, MOCK_AUTHENTICATE_PAYLOAD]);
      sessionManager = await createSessionManager();

      // TODO: Investigate type error
      subscriptionService.updateSession(MOCK_AUTHENTICATE_RETURN_VALUE as AuthenticateResponse, {
        sessionDurationMinutes: 1200,
      });
      await runEventLoop();
      jest.advanceTimersByTime(1800001);
      await runEventLoop();

      expect(networkClient.fetchSDK.mock.calls.map(([{ body }]) => body.session_duration_minutes)).toEqual([
        undefined,
        undefined,
      ]);
    });

    it('should call session.authenticate with the last authenticate session_duration_minutes if enabled', async () => {
      setupAuthenticate([MOCK_AUTHENTICATE_PAYLOAD, MOCK_AUTHENTICATE_PAYLOAD]);
      sessionManager = await createSessionManager({ keepSessionAlive: true });

      // TODO: Investigate type error
      subscriptionService.updateSession(MOCK_AUTHENTICATE_RETURN_VALUE as AuthenticateResponse, {
        sessionDurationMinutes: 1200,
      });
      await runEventLoop();
      jest.advanceTimersByTime(1800001);
      await runEventLoop();

      // The first call is made before updateSession() so session_duration_minutes is undefined,
      // the second call will have the new sessionDurationMinutes
      expect(networkClient.fetchSDK.mock.calls).toMatchInlineSnapshot(`
        [
          [
            {
              "body": {
                "session_duration_minutes": undefined,
              },
              "method": "POST",
              "url": "/sessions/authenticate",
            },
          ],
          [
            {
              "body": {
                "session_duration_minutes": 1200,
              },
              "method": "POST",
              "url": "/sessions/authenticate",
            },
          ],
        ]
      `);
    });
  });

  describe('stateful registry', () => {
    it('Prevents multiple SessionManager instances from scheduling timeouts for the same public token', async () => {
      const { SessionManager } = await importSessionManagerModule();
      setupAuthenticate([MOCK_AUTHENTICATE_PAYLOAD, MOCK_AUTHENTICATE_PAYLOAD]);
      const storageClient = new InMemoryStorageClient();
      const subscriptionService1 = new ConsumerSubscriptionService(MOCK_PUBLIC_TOKEN, storageClient);
      const subscriptionService2 = new ConsumerSubscriptionService(MOCK_PUBLIC_TOKEN, storageClient);
      const sessionClient1 = new HeadlessSessionClient(networkClient, subscriptionService1);
      const sessionClient2 = new HeadlessSessionClient(networkClient, subscriptionService2);

      const sessionManager1 = new SessionManager(subscriptionService1, sessionClient1, MOCK_PUBLIC_TOKEN, {});
      const sessionManager2 = new SessionManager(subscriptionService2, sessionClient2, MOCK_PUBLIC_TOKEN, {});

      sessionManager1.performBackgroundRefresh();
      await runEventLoop();
      expectWorkerToBeScheduled();

      sessionManager2.performBackgroundRefresh();
      await runEventLoop();
      expectWorkerToBeScheduled();

      expect(logger.warn).toHaveBeenCalledTimes(1);
      expect(logger.warn).toHaveBeenCalledWith(MULTIPLE_STYTCH_CLIENTS_DETECTED_WARNING);
    });

    it('Allows multiple SessionManager instances with different public tokens to schedule timeouts', async () => {
      const { SessionManager } = await importSessionManagerModule();
      setupAuthenticate([MOCK_AUTHENTICATE_PAYLOAD, MOCK_AUTHENTICATE_PAYLOAD]);
      const storageClient = new InMemoryStorageClient();
      const subscriptionService1 = new ConsumerSubscriptionService(MOCK_PUBLIC_TOKEN, storageClient);
      const subscriptionService2 = new ConsumerSubscriptionService('different-token', storageClient);
      const sessionClient1 = new HeadlessSessionClient(networkClient, subscriptionService1);
      const sessionClient2 = new HeadlessSessionClient(networkClient, subscriptionService2);

      const sessionManager1 = new SessionManager(subscriptionService1, sessionClient1, MOCK_PUBLIC_TOKEN, {});
      const sessionManager2 = new SessionManager(subscriptionService2, sessionClient2, 'different-token', {});

      sessionManager1.performBackgroundRefresh();
      await runEventLoop();
      expectWorkerToBeScheduled();

      sessionManager2.performBackgroundRefresh();
      await runEventLoop();
      expect(jest.getTimerCount()).toBe(2);

      expect(logger.warn).not.toHaveBeenCalled();
    });

    it('Properly cleans up timeouts when cancelBackgroundRefresh is called', async () => {
      const { SessionManager } = await importSessionManagerModule();
      setupAuthenticate([MOCK_AUTHENTICATE_PAYLOAD, MOCK_AUTHENTICATE_PAYLOAD]);
      const storageClient = new InMemoryStorageClient();
      const subscriptionService1 = new ConsumerSubscriptionService(MOCK_PUBLIC_TOKEN, storageClient);
      const subscriptionService2 = new ConsumerSubscriptionService(MOCK_PUBLIC_TOKEN, storageClient);
      const sessionClient1 = new HeadlessSessionClient(networkClient, subscriptionService1);
      const sessionClient2 = new HeadlessSessionClient(networkClient, subscriptionService2);

      const sessionManager1 = new SessionManager(subscriptionService1, sessionClient1, MOCK_PUBLIC_TOKEN, {});
      const sessionManager2 = new SessionManager(subscriptionService2, sessionClient2, MOCK_PUBLIC_TOKEN, {});

      sessionManager1.performBackgroundRefresh();
      await runEventLoop();
      expectWorkerToBeScheduled();

      sessionManager1.cancelBackgroundRefresh();
      await runEventLoop();
      expectNoWorkerToBeScheduled();

      sessionManager2.performBackgroundRefresh();
      await runEventLoop();
      expectWorkerToBeScheduled();

      expect(logger.warn).not.toHaveBeenCalled();
    });
  });
});
