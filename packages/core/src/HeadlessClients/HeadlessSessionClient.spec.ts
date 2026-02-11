import {
  MOCK_AUTHENTICATE_PAYLOAD,
  updateSessionExpect,
  MOCK_AUTHENTICATE_RETURN_VALUE,
  MOCK_SESSION,
} from '@stytch/internal-mocks';
import { MOCK_UNRECOVERABLE_ERROR, MOCK_RECOVERABLE_ERROR } from '../mocks';
import {
  createResolvablePromise,
  createTestFixtures,
  IConsumerSubscriptionServiceMock,
  INetworkClientMock,
} from '../testing';
import { HeadlessSessionClient } from './HeadlessSessionClient';
import { StytchProjectConfigurationInput } from '../public';

describe('HeadlessSessionClient', () => {
  let networkClient: INetworkClientMock;
  let subscriptionService: IConsumerSubscriptionServiceMock;
  let client: HeadlessSessionClient<StytchProjectConfigurationInput>;

  beforeEach(() => {
    jest.resetAllMocks();

    ({ networkClient, subscriptionService } = createTestFixtures());
    client = new HeadlessSessionClient(networkClient, subscriptionService);
  });

  describe('revoke', () => {
    it('Destroys the state on an unrecoverable error', async () => {
      networkClient.fetchSDK.mockRejectedValueOnce(MOCK_UNRECOVERABLE_ERROR);
      await expect(client.revoke()).rejects.toEqual(MOCK_UNRECOVERABLE_ERROR);
      expect(networkClient.fetchSDK).toHaveBeenCalledWith({
        method: 'POST',
        url: '/sessions/revoke',
      });
      expect(subscriptionService.destroyState).toHaveBeenCalled();
    });

    it('Does not destroy the state on a recoverable error', async () => {
      networkClient.fetchSDK.mockRejectedValueOnce(MOCK_RECOVERABLE_ERROR);
      await expect(client.revoke()).rejects.toEqual(MOCK_RECOVERABLE_ERROR);
      expect(networkClient.fetchSDK).toHaveBeenCalledWith({
        method: 'POST',
        url: '/sessions/revoke',
      });
      expect(subscriptionService.destroyState).not.toHaveBeenCalled();
    });

    it('Destroys the state on a recoverable error when the forceClear is true', async () => {
      networkClient.fetchSDK.mockRejectedValueOnce(MOCK_RECOVERABLE_ERROR);
      await expect(client.revoke({ forceClear: true })).rejects.toEqual(MOCK_RECOVERABLE_ERROR);
      expect(networkClient.fetchSDK).toHaveBeenCalledWith({
        method: 'POST',
        url: '/sessions/revoke',
      });
      expect(subscriptionService.destroyState).toHaveBeenCalled();
    });

    it('Destroys the state when the revoke call suceeds', async () => {
      networkClient.fetchSDK.mockResolvedValueOnce({ request_id: 'request_id', status_code: 200 });
      await expect(client.revoke()).resolves.toEqual({ request_id: 'request_id', status_code: 200 });
      expect(networkClient.fetchSDK).toHaveBeenCalledWith({
        method: 'POST',
        url: '/sessions/revoke',
      });
      expect(subscriptionService.destroyState).toHaveBeenCalled();
    });
  });

  describe('authenticate', () => {
    it('Calls the authenticate API', async () => {
      networkClient.fetchSDK.mockResolvedValueOnce(MOCK_AUTHENTICATE_PAYLOAD);
      await expect(client.authenticate({ session_duration_minutes: 60 })).resolves.toEqual(
        MOCK_AUTHENTICATE_RETURN_VALUE,
      );

      expect(networkClient.fetchSDK).toHaveBeenCalledWith({
        method: 'POST',
        url: '/sessions/authenticate',
        body: { session_duration_minutes: 60 },
      });
      expect(subscriptionService.updateSession).toHaveBeenCalledWith(updateSessionExpect());
    });

    it('Destroys the session on an unrecoverable error', async () => {
      networkClient.fetchSDK.mockRejectedValueOnce(MOCK_UNRECOVERABLE_ERROR);
      await expect(client.authenticate({ session_duration_minutes: 60 })).rejects.toEqual(MOCK_UNRECOVERABLE_ERROR);
      expect(subscriptionService.destroySession).toHaveBeenCalled();
    });

    it('Does not destroy the session on a recoverable error', async () => {
      networkClient.fetchSDK.mockRejectedValueOnce(MOCK_RECOVERABLE_ERROR);
      await expect(client.authenticate({ session_duration_minutes: 60 })).rejects.toEqual(MOCK_RECOVERABLE_ERROR);
      expect(subscriptionService.destroySession).not.toHaveBeenCalled();
    });

    it('Retries a successful request when session becomes stale in flight', async () => {
      const oldSession = { ...MOCK_SESSION, session_id: 'old-session-id' };
      const mutatedSession = { ...MOCK_SESSION, session_id: 'mutated-session-id' };
      const newSession = { ...MOCK_SESSION, session_id: 'new-session-id' };

      const mockAuthenticatePayload2 = { ...MOCK_AUTHENTICATE_PAYLOAD, session: newSession };

      subscriptionService.getSession.mockReturnValue(oldSession);

      const { promise: firstFetch, resolve: resolveFirstFetch } = createResolvablePromise();
      const { promise: updatedMocks, resolve: resolveUpdatedMocks } = createResolvablePromise();
      const { promise: secondFetch, resolve: resolveSecondFetch } = createResolvablePromise();
      const { promise: preliminaryAssertions, resolve: resolvePreliminaryAssertions } = createResolvablePromise();

      networkClient.fetchSDK.mockImplementationOnce(async () => {
        resolveFirstFetch();

        await updatedMocks;
        return MOCK_AUTHENTICATE_PAYLOAD;
      });

      const resultPromise = client.authenticate({ session_duration_minutes: 60 });

      await firstFetch;
      subscriptionService.getSession.mockReturnValue(mutatedSession);

      networkClient.fetchSDK.mockImplementationOnce(async () => {
        resolveSecondFetch();

        await preliminaryAssertions;
        return mockAuthenticatePayload2;
      });

      resolveUpdatedMocks();

      await secondFetch;
      expect(subscriptionService.updateSession).not.toHaveBeenCalled();
      resolvePreliminaryAssertions();

      await expect(resultPromise).resolves.toEqual({ ...MOCK_AUTHENTICATE_RETURN_VALUE, session: newSession });

      expect(subscriptionService.updateSession).toHaveBeenCalledTimes(1);
      expect(subscriptionService.updateSession).toHaveBeenCalledWith(updateSessionExpect({ session: newSession }));
    });

    it('Retries an unrecoverable error and retains state when session becomes stale in flight', async () => {
      const oldSession = { ...MOCK_SESSION, session_id: 'old-session-id' };
      const mutatedSession = { ...MOCK_SESSION, session_id: 'mutated-session-id' };
      const newSession = { ...MOCK_SESSION, session_id: 'new-session-id' };

      const mockAuthenticatePayload2 = { ...MOCK_AUTHENTICATE_PAYLOAD, session: newSession };

      subscriptionService.getSession.mockReturnValue(oldSession);

      const { promise: firstFetch, resolve: resolveFirstFetch } = createResolvablePromise();
      const { promise: updatedMocks, resolve: resolveUpdatedMocks } = createResolvablePromise();
      const { promise: secondFetch, resolve: resolveSecondFetch } = createResolvablePromise();
      const { promise: preliminaryAssertions, resolve: resolvePreliminaryAssertions } = createResolvablePromise();

      networkClient.fetchSDK.mockImplementationOnce(async () => {
        resolveFirstFetch();

        await updatedMocks;
        return Promise.reject(MOCK_UNRECOVERABLE_ERROR);
      });

      const resultPromise = client.authenticate({ session_duration_minutes: 60 });

      await firstFetch;
      subscriptionService.getSession.mockReturnValue(mutatedSession);

      networkClient.fetchSDK.mockImplementationOnce(async () => {
        resolveSecondFetch();

        await preliminaryAssertions;
        return mockAuthenticatePayload2;
      });

      resolveUpdatedMocks();

      await secondFetch;
      expect(subscriptionService.updateSession).not.toHaveBeenCalled();
      resolvePreliminaryAssertions();

      await expect(resultPromise).resolves.toEqual({ ...MOCK_AUTHENTICATE_RETURN_VALUE, session: newSession });

      expect(subscriptionService.destroyState).not.toHaveBeenCalled();
      expect(subscriptionService.updateSession).toHaveBeenCalledTimes(1);
      expect(subscriptionService.updateSession).toHaveBeenCalledWith(updateSessionExpect({ session: newSession }));
    });
  });

  describe('exchangeAccessToken', () => {
    it('Calls the exchange API', async () => {
      networkClient.fetchSDK.mockResolvedValueOnce(MOCK_AUTHENTICATE_PAYLOAD);
      await expect(
        client.exchangeAccessToken({ access_token: 'mock-access-token', session_duration_minutes: 60 }),
      ).resolves.toEqual(MOCK_AUTHENTICATE_RETURN_VALUE);

      expect(networkClient.fetchSDK).toHaveBeenCalledWith({
        method: 'POST',
        url: '/sessions/exchange_access_token',
        body: { access_token: 'mock-access-token', session_duration_minutes: 60 },
      });
      expect(subscriptionService.updateSession).toHaveBeenCalledWith(updateSessionExpect());
    });
  });

  describe('updateSession', () => {
    it('delegates setting the session tokens to the subscriptionservice', () => {
      subscriptionService.updateTokens.mockImplementationOnce(jest.fn());
      const newTokens = { session_token: 'new-session-token', session_jwt: 'new-session-jwt' };
      client.updateSession(newTokens);
      expect(subscriptionService.updateTokens).toHaveBeenCalledWith(newTokens);
    });
  });

  describe('attest', () => {
    const mockAttestResponse = {
      request_id: 'request_id',
      status_code: 200,
      session: MOCK_SESSION,
      session_token: 'session_token',
      session_jwt: 'session_jwt',
    };

    it('Calls the attest API', async () => {
      networkClient.fetchSDK.mockResolvedValueOnce(mockAttestResponse);
      await expect(
        client.attest({
          profile_id: 'profile_123',
          token: 'attest_token_123',
          session_duration_minutes: 60,
        }),
      ).resolves.toEqual(mockAttestResponse);

      expect(networkClient.fetchSDK).toHaveBeenCalledWith({
        method: 'POST',
        url: '/sessions/attest',
        body: {
          profile_id: 'profile_123',
          token: 'attest_token_123',
          session_duration_minutes: 60,
        },
      });
      expect(subscriptionService.updateSession).toHaveBeenCalledWith(mockAttestResponse);
    });
  });
});
