import {
  MOCK_B2B_AUTHENTICATE_PAYLOAD,
  MOCK_B2B_AUTHENTICATE_RETURN_VALUE,
  MOCK_ORG_ID,
  MOCK_B2B_AUTHENTICATE_WITH_MFA_NOT_REQUIRED_PAYLOAD,
  MOCK_B2B_AUTHENTICATE_WITH_MFA_REQUIRED_PAYLOAD,
  MOCK_MEMBER_SESSION,
  MOCK_INTERMEDIATE_SESSION_TOKEN,
} from '@stytch/internal-mocks';
import { MOCK_RECOVERABLE_ERROR, MOCK_UNRECOVERABLE_ERROR } from '../../mocks';
import {
  createB2BTestFixtures,
  createResolvablePromise,
  IB2BSubscriptionServiceMock,
  INetworkClientMock,
} from '../../testing';
import { HeadlessB2BSessionClient } from './HeadlessB2BSessionClient';
import { StytchProjectConfigurationInput } from '../../public';

describe('HeadlessB2BSessionClient', () => {
  let networkClient: INetworkClientMock;
  let subscriptionService: IB2BSubscriptionServiceMock;
  let client: HeadlessB2BSessionClient<StytchProjectConfigurationInput>;

  beforeEach(() => {
    jest.resetAllMocks();
    ({ networkClient, subscriptionService } = createB2BTestFixtures());
    client = new HeadlessB2BSessionClient(networkClient, subscriptionService);
  });

  describe('revoke', () => {
    it('Destroys the state on an unrecoverable error', async () => {
      networkClient.fetchSDK.mockRejectedValueOnce(MOCK_UNRECOVERABLE_ERROR);
      await expect(client.revoke()).rejects.toEqual(MOCK_UNRECOVERABLE_ERROR);
      expect(networkClient.fetchSDK).toHaveBeenCalledWith({
        method: 'POST',
        url: '/b2b/sessions/revoke',
      });
      expect(subscriptionService.destroyState).toHaveBeenCalled();
    });

    it('Does not destroy the state on a recoverable error', async () => {
      networkClient.fetchSDK.mockRejectedValueOnce(MOCK_RECOVERABLE_ERROR);
      await expect(client.revoke()).rejects.toEqual(MOCK_RECOVERABLE_ERROR);
      expect(networkClient.fetchSDK).toHaveBeenCalledWith({
        method: 'POST',
        url: '/b2b/sessions/revoke',
      });
      expect(subscriptionService.destroyState).not.toHaveBeenCalled();
    });

    it('Destroys the state on a recoverable error when the forceClear is true', async () => {
      networkClient.fetchSDK.mockRejectedValueOnce(MOCK_RECOVERABLE_ERROR);
      await expect(client.revoke({ forceClear: true })).rejects.toEqual(MOCK_RECOVERABLE_ERROR);
      expect(networkClient.fetchSDK).toHaveBeenCalledWith({
        method: 'POST',
        url: '/b2b/sessions/revoke',
      });
      expect(subscriptionService.destroyState).toHaveBeenCalled();
    });

    it('Destroys the state when the revoke call suceeds', async () => {
      networkClient.fetchSDK.mockResolvedValueOnce({ request_id: 'request_id', status_code: 200 });
      await expect(client.revoke()).resolves.toEqual({ request_id: 'request_id', status_code: 200 });
      expect(networkClient.fetchSDK).toHaveBeenCalledWith({
        method: 'POST',
        url: '/b2b/sessions/revoke',
      });
      expect(subscriptionService.destroyState).toHaveBeenCalled();
    });
  });

  describe('authenticate', () => {
    it('Calls the authenticate API', async () => {
      networkClient.fetchSDK.mockResolvedValueOnce(MOCK_B2B_AUTHENTICATE_PAYLOAD);
      await expect(client.authenticate({ session_duration_minutes: 60 })).resolves.toEqual(
        MOCK_B2B_AUTHENTICATE_RETURN_VALUE,
      );

      expect(networkClient.fetchSDK).toHaveBeenCalledWith({
        method: 'POST',
        url: '/b2b/sessions/authenticate',
        body: { session_duration_minutes: 60 },
      });
      expect(subscriptionService.updateSession).toHaveBeenCalledWith(
        expect.objectContaining(MOCK_B2B_AUTHENTICATE_PAYLOAD),
      );
    });

    it('Destroys the session on an unrecoverable error', async () => {
      networkClient.fetchSDK.mockRejectedValueOnce(MOCK_UNRECOVERABLE_ERROR);
      subscriptionService.getIntermediateSessionToken.mockReturnValue(MOCK_INTERMEDIATE_SESSION_TOKEN);
      await expect(client.authenticate({ session_duration_minutes: 60 })).rejects.toEqual(MOCK_UNRECOVERABLE_ERROR);
      expect(subscriptionService.destroySession).toHaveBeenCalled();
      expect(subscriptionService.destroyState).not.toHaveBeenCalled();
    });

    it('Does not destroy the session on a recoverable error', async () => {
      networkClient.fetchSDK.mockRejectedValueOnce(MOCK_RECOVERABLE_ERROR);
      await expect(client.authenticate({ session_duration_minutes: 60 })).rejects.toEqual(MOCK_RECOVERABLE_ERROR);
      expect(subscriptionService.destroySession).not.toHaveBeenCalled();
      expect(subscriptionService.destroyState).not.toHaveBeenCalled();
      expect(subscriptionService.updateSession).not.toHaveBeenCalled();
    });

    it('Retries a successful request when session becomes stale in flight', async () => {
      const oldSession = { ...MOCK_MEMBER_SESSION, member_session_id: 'old-session-id' };
      const mutatedSession = { ...MOCK_MEMBER_SESSION, member_session_id: 'mutated-session-id' };
      const newSession = { ...MOCK_MEMBER_SESSION, member_session_id: 'new-session-id' };

      const mockAuthenticatePayload2 = { ...MOCK_B2B_AUTHENTICATE_PAYLOAD, member_session: newSession };

      subscriptionService.getSession.mockReturnValue(oldSession);

      const { promise: firstFetch, resolve: resolveFirstFetch } = createResolvablePromise();
      const { promise: updatedMocks, resolve: resolveUpdatedMocks } = createResolvablePromise();
      const { promise: secondFetch, resolve: resolveSecondFetch } = createResolvablePromise();
      const { promise: preliminaryAssertions, resolve: resolvePreliminaryAssertions } = createResolvablePromise();

      networkClient.fetchSDK.mockImplementationOnce(async () => {
        resolveFirstFetch();

        await updatedMocks;
        return MOCK_B2B_AUTHENTICATE_PAYLOAD;
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

      await expect(resultPromise).resolves.toEqual({
        ...MOCK_B2B_AUTHENTICATE_RETURN_VALUE,
        member_session: newSession,
      });

      expect(subscriptionService.updateSession).toHaveBeenCalledTimes(1);
      expect(subscriptionService.updateSession).toHaveBeenCalledWith(expect.objectContaining(mockAuthenticatePayload2));
    });

    it('Retries an unrecoverable error and retains state when session becomes stale in flight', async () => {
      const oldSession = { ...MOCK_MEMBER_SESSION, member_session_id: 'old-session-id' };
      const mutatedSession = { ...MOCK_MEMBER_SESSION, member_session_id: 'mutated-session-id' };
      const newSession = { ...MOCK_MEMBER_SESSION, member_session_id: 'new-session-id' };

      const mockAuthenticatePayload2 = { ...MOCK_B2B_AUTHENTICATE_PAYLOAD, member_session: newSession };

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

      await expect(resultPromise).resolves.toEqual({
        ...MOCK_B2B_AUTHENTICATE_RETURN_VALUE,
        member_session: newSession,
      });

      expect(subscriptionService.destroyState).not.toHaveBeenCalled();
      expect(subscriptionService.updateSession).toHaveBeenCalledTimes(1);
      expect(subscriptionService.updateSession).toHaveBeenCalledWith(mockAuthenticatePayload2);
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

  describe('exchange', () => {
    it('Calls the exchange API', async () => {
      networkClient.fetchSDK.mockResolvedValueOnce(MOCK_B2B_AUTHENTICATE_WITH_MFA_NOT_REQUIRED_PAYLOAD);
      await expect(
        client.exchange({ organization_id: MOCK_ORG_ID, session_duration_minutes: 60, locale: 'es' }),
      ).resolves.toEqual(MOCK_B2B_AUTHENTICATE_WITH_MFA_NOT_REQUIRED_PAYLOAD);

      expect(networkClient.fetchSDK).toHaveBeenCalledWith({
        method: 'POST',
        url: '/b2b/sessions/exchange',
        body: { organization_id: MOCK_ORG_ID, session_duration_minutes: 60, locale: 'es' },
      });
      expect(subscriptionService.updateSession).toHaveBeenCalledWith(
        expect.objectContaining(MOCK_B2B_AUTHENTICATE_WITH_MFA_NOT_REQUIRED_PAYLOAD),
      );
    });

    it('Calls the exchange API and updates the IST is an IST is returned', async () => {
      networkClient.fetchSDK.mockResolvedValueOnce(MOCK_B2B_AUTHENTICATE_WITH_MFA_REQUIRED_PAYLOAD);
      await expect(
        client.exchange({ organization_id: MOCK_ORG_ID, session_duration_minutes: 60, locale: 'es' }),
      ).resolves.toEqual(MOCK_B2B_AUTHENTICATE_WITH_MFA_REQUIRED_PAYLOAD);

      expect(networkClient.fetchSDK).toHaveBeenCalledWith({
        method: 'POST',
        url: '/b2b/sessions/exchange',
        body: { organization_id: MOCK_ORG_ID, session_duration_minutes: 60, locale: 'es' },
      });
      expect(subscriptionService.updateSession).toHaveBeenCalledWith(
        expect.objectContaining(MOCK_B2B_AUTHENTICATE_WITH_MFA_REQUIRED_PAYLOAD),
      );
    });

    it('Does not destroy the state on an unrecoverable error', async () => {
      networkClient.fetchSDK.mockRejectedValueOnce(MOCK_UNRECOVERABLE_ERROR);
      await expect(client.exchange({ organization_id: MOCK_ORG_ID, session_duration_minutes: 60 })).rejects.toEqual(
        MOCK_UNRECOVERABLE_ERROR,
      );
      expect(subscriptionService.destroyState).not.toHaveBeenCalled();
    });

    it('Does not destroy the state on a recoverable error', async () => {
      networkClient.fetchSDK.mockRejectedValueOnce(MOCK_RECOVERABLE_ERROR);
      await expect(client.exchange({ organization_id: MOCK_ORG_ID, session_duration_minutes: 60 })).rejects.toEqual(
        MOCK_RECOVERABLE_ERROR,
      );
      expect(subscriptionService.destroyState).not.toHaveBeenCalled();
    });
  });

  describe('exchangeAccessToken', () => {
    it('Calls the exchange API', async () => {
      networkClient.fetchSDK.mockResolvedValueOnce(MOCK_B2B_AUTHENTICATE_PAYLOAD);
      await expect(
        client.exchangeAccessToken({ access_token: 'mock-access-token', session_duration_minutes: 60 }),
      ).resolves.toEqual(MOCK_B2B_AUTHENTICATE_PAYLOAD);

      expect(networkClient.fetchSDK).toHaveBeenCalledWith({
        method: 'POST',
        url: '/b2b/sessions/exchange_access_token',
        body: { access_token: 'mock-access-token', session_duration_minutes: 60 },
      });
      expect(subscriptionService.updateSession).toHaveBeenCalledWith(
        expect.objectContaining(MOCK_B2B_AUTHENTICATE_PAYLOAD),
      );
    });

    it('Handles successful authentication response and updates session state', async () => {
      networkClient.fetchSDK.mockResolvedValueOnce(MOCK_B2B_AUTHENTICATE_PAYLOAD);
      await client.exchangeAccessToken({ access_token: 'mock-access-token', session_duration_minutes: 60 });

      expect(subscriptionService.updateSession).toHaveBeenCalledTimes(1);
      expect(subscriptionService.updateSession).toHaveBeenCalledWith(
        expect.objectContaining(MOCK_B2B_AUTHENTICATE_PAYLOAD),
      );
    });
  });

  describe('attest', () => {
    const mockB2BAttestResponse = {
      request_id: 'request_id',
      status_code: 200,
      member_session: MOCK_MEMBER_SESSION,
      session_token: 'session_token',
      session_jwt: 'session_jwt',
    };

    it('Calls the attest API', async () => {
      networkClient.fetchSDK.mockResolvedValueOnce(mockB2BAttestResponse);
      await expect(
        client.attest({
          organization_id: MOCK_ORG_ID,
          profile_id: 'profile_123',
          token: 'attest_token_123',
          session_duration_minutes: 60,
        }),
      ).resolves.toEqual(mockB2BAttestResponse);

      expect(networkClient.fetchSDK).toHaveBeenCalledWith({
        method: 'POST',
        url: '/b2b/sessions/attest',
        body: {
          organization_id: MOCK_ORG_ID,
          profile_id: 'profile_123',
          token: 'attest_token_123',
          session_duration_minutes: 60,
        },
      });
      expect(subscriptionService.updateSession).toHaveBeenCalledWith(expect.objectContaining(mockB2BAttestResponse));
    });
  });
});
