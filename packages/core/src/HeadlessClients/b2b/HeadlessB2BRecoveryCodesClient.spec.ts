import { MOCK_B2B_AUTHENTICATE_PAYLOAD, MOCK_MEMBER, MOCK_ORGANIZATION } from '@stytch/internal-mocks';

import { StytchProjectConfigurationInput } from '../../public/typeConfig';
import {
  createB2BTestFixtures,
  IB2BSubscriptionServiceMock,
  INetworkClientMock,
  MockDFPProtectedAuthDisabled,
} from '../../testing';
import { HeadlessB2BRecoveryCodesClient } from './HeadlessB2BRecoveryCodesClient';

describe('HeadlessB2BRecoveryCodesClient', () => {
  let networkClient: INetworkClientMock;
  let subscriptionService: IB2BSubscriptionServiceMock;
  let client: HeadlessB2BRecoveryCodesClient<StytchProjectConfigurationInput>;

  beforeEach(() => {
    jest.resetAllMocks();
    ({ networkClient, subscriptionService } = createB2BTestFixtures());
    client = new HeadlessB2BRecoveryCodesClient(networkClient, subscriptionService, MockDFPProtectedAuthDisabled());
  });

  describe('recoveryCodes.recover', () => {
    it('Calls the recoveryCodes recover endpoint with an IST', async () => {
      subscriptionService.getIntermediateSessionToken.mockReturnValueOnce('mock-intermediate-session-token');
      networkClient.retriableFetchSDK.mockResolvedValueOnce(MOCK_B2B_AUTHENTICATE_PAYLOAD);

      const res = await client.recover({
        organization_id: MOCK_ORGANIZATION.organization_id,
        member_id: MOCK_MEMBER.member_id,
        recovery_code: '12345678',
        session_duration_minutes: 60,
      });

      expect(res).toEqual(MOCK_B2B_AUTHENTICATE_PAYLOAD);
      expect(subscriptionService.updateSession).toHaveBeenCalledWith(res);
      expect(subscriptionService.getIntermediateSessionToken).toHaveBeenCalled();
      expect(networkClient.retriableFetchSDK).toHaveBeenCalledWith({
        body: {
          organization_id: MOCK_ORGANIZATION.organization_id,
          member_id: MOCK_MEMBER.member_id,
          recovery_code: '12345678',
          intermediate_session_token: 'mock-intermediate-session-token',
          session_duration_minutes: 60,
        },
        method: 'POST',
        url: '/b2b/recovery_codes/recover',
        retryCallback: expect.any(Function),
      });
    });
    it('Calls the recoveryCodes recover endpoint without an IST', async () => {
      subscriptionService.getIntermediateSessionToken.mockReturnValueOnce(null);
      networkClient.retriableFetchSDK.mockResolvedValueOnce(MOCK_B2B_AUTHENTICATE_PAYLOAD);

      const res = await client.recover({
        organization_id: MOCK_ORGANIZATION.organization_id,
        member_id: MOCK_MEMBER.member_id,
        recovery_code: '12345678',
        session_duration_minutes: 60,
      });

      expect(res).toEqual(MOCK_B2B_AUTHENTICATE_PAYLOAD);
      expect(subscriptionService.updateSession).toHaveBeenCalledWith(res);
      expect(subscriptionService.getIntermediateSessionToken).toHaveBeenCalled();
      expect(networkClient.retriableFetchSDK).toHaveBeenCalledWith({
        body: {
          organization_id: MOCK_ORGANIZATION.organization_id,
          member_id: MOCK_MEMBER.member_id,
          recovery_code: '12345678',
          intermediate_session_token: undefined,
          session_duration_minutes: 60,
        },
        method: 'POST',
        url: '/b2b/recovery_codes/recover',
        retryCallback: expect.any(Function),
      });
    });
  });
  describe('recoveryCodes.rotate', () => {
    it('Calls the recoveryCodes rotate endpoint', async () => {
      networkClient.retriableFetchSDK.mockResolvedValueOnce(MOCK_B2B_AUTHENTICATE_PAYLOAD);

      const res = await client.rotate();

      expect(res).toEqual(MOCK_B2B_AUTHENTICATE_PAYLOAD);
      expect(networkClient.retriableFetchSDK).toHaveBeenCalledWith({
        body: {},
        method: 'POST',
        url: '/b2b/recovery_codes/rotate',
        retryCallback: expect.any(Function),
      });
    });
  });
  describe('recoveryCodes.get', () => {
    it('Calls the recoveryCodes get endpoint', async () => {
      networkClient.fetchSDK.mockResolvedValueOnce(MOCK_B2B_AUTHENTICATE_PAYLOAD);

      const res = await client.get();

      expect(res).toEqual(MOCK_B2B_AUTHENTICATE_PAYLOAD);
      expect(networkClient.fetchSDK).toHaveBeenCalledWith({
        method: 'GET',
        url: '/b2b/recovery_codes',
      });
    });
  });
});
