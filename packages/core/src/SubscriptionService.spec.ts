import { MOCK_AUTHENTICATE_PAYLOAD } from '@stytch/internal-mocks';

import { ConsumerState, Session, StytchProjectConfigurationInput, User } from './public';
import { B2BSubscriptionService, ConsumerSubscriptionService, SubscriptionService } from './SubscriptionService';
import { createResolvablePromise, PUBLIC_TOKEN } from './testing';
import { MOCK_STORAGE_CLIENT } from './testing/mockStorageClient';

const MOCK_STATE_AND_TOKENS = {
  state: {
    user: { created_at: new Date().toISOString() } as User,
    session: { expires_at: new Date().toISOString() } as Session,
  },
  session_token: 'existing-session-token',
  session_jwt: 'existing-session-jwt',
  intermediate_session_token: null,
};

const MOCK_UPDATED_STATE_AND_TOKENS = {
  state: {
    user: { created_at: new Date().toISOString() } as User,
    session: { expires_at: new Date().toISOString() } as Session,
  },
  session_token: 'existing-session-token',
  session_jwt: 'existing-session-jwt',
  intermediate_session_token: null,
};

const MOCK_LOGGED_OUT_STATE = { state: null, session_token: null, session_jwt: null, intermediate_session_token: null };
const DEFAULT_UPDATE_SESSION_OPTIONS = { fromCache: false };

describe('SubscriptionService', () => {
  let service: SubscriptionService<ConsumerState>;

  beforeEach(() => {
    service = new SubscriptionService(PUBLIC_TOKEN, MOCK_STORAGE_CLIENT);
  });

  describe('destroyState', () => {
    it('passes a logged out state to updateStateAndTokens', () => {
      const updateStateAndTokensSpy = jest.spyOn(service, 'updateStateAndTokens').mockImplementation(jest.fn());
      service.destroyState();
      expect(updateStateAndTokensSpy).toHaveBeenCalledWith(MOCK_LOGGED_OUT_STATE);
      updateStateAndTokensSpy.mockRestore();
    });
  });

  describe('updateStateAndTokens', () => {
    it('calls expected methods', () => {
      const updateStateAndTokensInternalSpy = jest
        .spyOn(service as any, '_updateStateAndTokensInternal')
        .mockImplementation(jest.fn());
      const syncToLocalStorageSpy = jest
        .spyOn((service as any)._datalayer, 'syncToLocalStorage')
        .mockImplementation(jest.fn());
      service.updateStateAndTokens(MOCK_STATE_AND_TOKENS);
      expect(updateStateAndTokensInternalSpy).toHaveBeenCalledWith(
        MOCK_STATE_AND_TOKENS,
        DEFAULT_UPDATE_SESSION_OPTIONS,
      );
      expect(syncToLocalStorageSpy).toHaveBeenCalled();
      updateStateAndTokensInternalSpy.mockRestore();
      syncToLocalStorageSpy.mockRestore();
    });
  });

  describe('_updateStateAndTokensInternal', () => {
    describe('when passed a logged in state', () => {
      it('successfully sets the state in the datalayer', () => {
        service._updateStateAndTokensInternal(MOCK_STATE_AND_TOKENS, DEFAULT_UPDATE_SESSION_OPTIONS);
        expect((service as any)._datalayer.state).toStrictEqual(MOCK_STATE_AND_TOKENS.state);
        expect((service as any)._datalayer.session_token).toStrictEqual(MOCK_STATE_AND_TOKENS.session_token);
        expect((service as any)._datalayer.session_jwt).toStrictEqual(MOCK_STATE_AND_TOKENS.session_jwt);
      });
    });
    describe('when passed an updated state', () => {
      it('successfully updates the state in the datalayer', () => {
        service._updateStateAndTokensInternal(MOCK_STATE_AND_TOKENS, DEFAULT_UPDATE_SESSION_OPTIONS);
        expect((service as any)._datalayer.state).toStrictEqual(MOCK_STATE_AND_TOKENS.state);
        expect((service as any)._datalayer.session_token).toStrictEqual(MOCK_STATE_AND_TOKENS.session_token);
        expect((service as any)._datalayer.session_jwt).toStrictEqual(MOCK_STATE_AND_TOKENS.session_jwt);
        service._updateStateAndTokensInternal(MOCK_UPDATED_STATE_AND_TOKENS, DEFAULT_UPDATE_SESSION_OPTIONS);
        expect((service as any)._datalayer.state).toStrictEqual(MOCK_UPDATED_STATE_AND_TOKENS.state);
        expect((service as any)._datalayer.session_token).toStrictEqual(MOCK_UPDATED_STATE_AND_TOKENS.session_token);
        expect((service as any)._datalayer.session_jwt).toStrictEqual(MOCK_UPDATED_STATE_AND_TOKENS.session_jwt);
      });
    });
    describe('when passed a logged out state', () => {
      it('successfully clears state from the datalayer', () => {
        service._updateStateAndTokensInternal(MOCK_STATE_AND_TOKENS, DEFAULT_UPDATE_SESSION_OPTIONS);
        expect((service as any)._datalayer.state).toStrictEqual(MOCK_STATE_AND_TOKENS.state);
        expect((service as any)._datalayer.session_token).toStrictEqual(MOCK_STATE_AND_TOKENS.session_token);
        expect((service as any)._datalayer.session_jwt).toStrictEqual(MOCK_STATE_AND_TOKENS.session_jwt);

        service._updateStateAndTokensInternal(MOCK_LOGGED_OUT_STATE, DEFAULT_UPDATE_SESSION_OPTIONS);
        expect((service as any)._datalayer.state).toBe(null);
        expect((service as any)._datalayer.session_token).toBe(null);
        expect((service as any)._datalayer.session_jwt).toBe(null);
      });
    });
  });

  describe('updateTokens', () => {
    it('updates the token in the datalayer and syncs to local storage', () => {
      expect((service as any)._datalayer.session_token).toStrictEqual(null);
      const syncToLocalStorageSpy = jest
        .spyOn((service as any)._datalayer, 'syncToLocalStorage')
        .mockImplementation(jest.fn());
      service.updateTokens({ session_token: 'new-session-token', session_jwt: 'new-session-jwt' });
      expect((service as any)._datalayer.session_token).toStrictEqual('new-session-token');
      expect((service as any)._datalayer.session_jwt).toStrictEqual('new-session-jwt');
      service.updateTokens({ session_token: 'new-session-token-2', session_jwt: '' });
      expect((service as any)._datalayer.session_token).toStrictEqual('new-session-token-2');
      expect((service as any)._datalayer.session_jwt).toStrictEqual('');
      service.updateTokens({ session_token: '', session_jwt: 'new-session-jwt-2' });
      expect((service as any)._datalayer.session_token).toStrictEqual('');
      expect((service as any)._datalayer.session_jwt).toStrictEqual('new-session-jwt-2');
      expect(syncToLocalStorageSpy).toHaveBeenCalled();
    });
  });

  describe('fromCache', () => {
    it('is true by default', () => {
      expect(service.getFromCache()).toBe(true);
    });

    it('is false after a state update', () => {
      service.updateStateAndTokens(MOCK_STATE_AND_TOKENS);
      expect(service.getFromCache()).toBe(false);
    });

    it('is false after state is destroyed', () => {
      service.destroyState();
      expect(service.getFromCache()).toBe(false);
    });

    it('is false after retrieving no data from device storage', async () => {
      const storageClient = { ...MOCK_STORAGE_CLIENT, getData: jest.fn().mockResolvedValue(null) };

      service = new SubscriptionService(PUBLIC_TOKEN, storageClient);

      const { promise, resolve } = createResolvablePromise();
      const syncComplete = jest.fn(resolve);
      service.syncFromDeviceStorage(syncComplete);

      await promise;
      expect(service.getFromCache()).toBe(false);
    });

    it('is false after retrieving missing session from device storage', async () => {
      const storageClient = {
        ...MOCK_STORAGE_CLIENT,
        getData: jest.fn().mockResolvedValue(JSON.stringify({ state: { session: null } })),
      };
      service = new SubscriptionService(PUBLIC_TOKEN, storageClient);

      const { promise, resolve } = createResolvablePromise();
      const syncComplete = jest.fn(resolve);
      service.syncFromDeviceStorage(syncComplete);

      await promise;
      expect(service.getFromCache()).toBe(false);
    });

    it('is false after retrieving expired session from device storage', async () => {
      const storageClient = {
        ...MOCK_STORAGE_CLIENT,
        getData: jest
          .fn()
          .mockResolvedValue(JSON.stringify({ state: { session: { expires_at: new Date(Date.now() - 600000) } } })),
      };
      service = new SubscriptionService(PUBLIC_TOKEN, storageClient);

      const { promise, resolve } = createResolvablePromise();
      const syncComplete = jest.fn(resolve);
      service.syncFromDeviceStorage(syncComplete);

      await promise;
      expect(service.getFromCache()).toBe(false);
    });

    it('remains true after retrieving valid data from device storage', async () => {
      const storageClient = {
        ...MOCK_STORAGE_CLIENT,
        getData: jest
          .fn()
          .mockResolvedValue(JSON.stringify({ state: { session: { expires_at: new Date(Date.now() + 600000) } } })),
      };
      service = new SubscriptionService(PUBLIC_TOKEN, storageClient);

      const { promise, resolve } = createResolvablePromise();
      const syncComplete = jest.fn(resolve);
      service.syncFromDeviceStorage(syncComplete);

      await promise;
      expect(service.getFromCache()).toBe(true);
    });
  });
});

describe('ConsumerSubscriptionService', () => {
  let service: ConsumerSubscriptionService<StytchProjectConfigurationInput>;

  beforeEach(() => {
    service = new ConsumerSubscriptionService(PUBLIC_TOKEN, MOCK_STORAGE_CLIENT);
  });

  describe('withUpdateSession', () => {
    it('should pass through response', async () => {
      const authenticate = jest.fn().mockResolvedValueOnce(MOCK_AUTHENTICATE_PAYLOAD);
      const updateSessionSpy = jest.spyOn(service, 'updateSession');
      const wrapped = service.withUpdateSession(authenticate);

      await wrapped();

      expect(authenticate).toHaveBeenCalled();
      expect(updateSessionSpy).toHaveBeenCalledWith(MOCK_AUTHENTICATE_PAYLOAD, {});
    });

    it('should pass through session duration', async () => {
      const authenticate = jest.fn().mockResolvedValueOnce(MOCK_AUTHENTICATE_PAYLOAD);
      const updateSessionSpy = jest.spyOn(service, 'updateSession');
      const wrapped = service.withUpdateSession(authenticate);

      await wrapped('token', 'stuff', {
        session_duration_minutes: 30,
        ignore_this_property: 'asdf',
      });

      expect(authenticate).toHaveBeenCalledWith('token', 'stuff', {
        session_duration_minutes: 30,
        ignore_this_property: 'asdf',
      });

      expect(updateSessionSpy).toHaveBeenCalledWith(MOCK_AUTHENTICATE_PAYLOAD, {
        sessionDurationMinutes: 30,
      });
    });
  });
});

describe('B2BSubscriptionService', () => {
  let service: B2BSubscriptionService<StytchProjectConfigurationInput>;

  beforeEach(() => {
    service = new B2BSubscriptionService(PUBLIC_TOKEN, MOCK_STORAGE_CLIENT);
  });

  describe('withUpdateSession', () => {
    it('should pass through response', async () => {
      const authenticate = jest.fn().mockResolvedValueOnce(MOCK_AUTHENTICATE_PAYLOAD);
      const updateSessionSpy = jest.spyOn(service, 'updateSession');
      const wrapped = service.withUpdateSession(authenticate);

      await wrapped({
        token: 'asdf',
      });

      expect(authenticate).toHaveBeenCalledWith({
        token: 'asdf',
      });
      expect(updateSessionSpy).toHaveBeenCalledWith(MOCK_AUTHENTICATE_PAYLOAD, {});
    });

    it('should pass through session duration', async () => {
      const authenticate = jest.fn().mockResolvedValueOnce(MOCK_AUTHENTICATE_PAYLOAD);
      const updateSessionSpy = jest.spyOn(service, 'updateSession');
      const wrapped = service.withUpdateSession(authenticate);

      await wrapped({
        session_duration_minutes: 30,
        ignore_this_property: 'asdf',
      });

      expect(authenticate).toHaveBeenCalledWith({
        session_duration_minutes: 30,
        ignore_this_property: 'asdf',
      });

      expect(updateSessionSpy).toHaveBeenCalledWith(MOCK_AUTHENTICATE_PAYLOAD, {
        sessionDurationMinutes: 30,
      });
    });
  });
});
