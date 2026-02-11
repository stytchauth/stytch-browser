import {
  MOCK_B2B_AUTHENTICATE_PAYLOAD,
  MOCK_DFP_TELEMTRY_ID,
  MOCK_MEMBER,
  MOCK_MEMBER_COMMON_RESPONSE,
  MOCK_ORGANIZATION,
} from '@stytch/internal-mocks';

import { B2BTOTPCreateResponse, MemberResponseCommon } from '../../public';
import { StytchProjectConfigurationInput } from '../../public/typeConfig';
import {
  createB2BTestFixtures,
  IB2BSubscriptionServiceMock,
  INetworkClientMock,
  MockDFPProtectedAuthDFPOnly,
  MockDFPProtectedAuthDisabled,
} from '../../testing';
import { HeadlessB2BTOTPsClient } from './HeadlessB2BTOTPsClient';

describe('HeadlessB2BTOTPsClient', () => {
  let networkClient: INetworkClientMock;
  let subscriptionService: IB2BSubscriptionServiceMock;
  let client: HeadlessB2BTOTPsClient<StytchProjectConfigurationInput>;

  beforeEach(() => {
    jest.resetAllMocks();
    ({ networkClient, subscriptionService } = createB2BTestFixtures());
    client = new HeadlessB2BTOTPsClient(networkClient, subscriptionService, MockDFPProtectedAuthDisabled());
  });

  describe('totp.create', () => {
    const mockResponse = {
      ...(MOCK_MEMBER_COMMON_RESPONSE as unknown as MemberResponseCommon),
      totp_registration_id: 'totp-test-123',
      secret: 'secret-test-123',
      qr_code: 'qr-code-test-123',
      recovery_codes: ['recovery-code-1', 'recovery-code-2'],
    } satisfies B2BTOTPCreateResponse;

    it('Calls the TOTPs create endpoint', async () => {
      networkClient.retriableFetchSDK.mockResolvedValueOnce(mockResponse);
      await client.create({
        organization_id: MOCK_ORGANIZATION.organization_id,
        member_id: MOCK_MEMBER.member_id,
        expiration_minutes: 10,
      });
      expect(networkClient.retriableFetchSDK).toHaveBeenCalledWith({
        body: {
          organization_id: MOCK_ORGANIZATION.organization_id,
          member_id: MOCK_MEMBER.member_id,
          expiration_minutes: 10,
        },
        method: 'POST',
        url: '/b2b/totp',
        retryCallback: expect.any(Function),
      });
    });
    it('Calls the TOTPs create endpoint with IST', async () => {
      subscriptionService.getIntermediateSessionToken.mockReturnValueOnce('mock-intermediate-session-token');
      networkClient.retriableFetchSDK.mockResolvedValueOnce(mockResponse);
      await client.create({
        organization_id: MOCK_ORGANIZATION.organization_id,
        member_id: MOCK_MEMBER.member_id,
        expiration_minutes: 10,
      });
      expect(subscriptionService.getIntermediateSessionToken).toHaveBeenCalledTimes(1);
      expect(networkClient.retriableFetchSDK).toHaveBeenCalledWith({
        body: {
          organization_id: MOCK_ORGANIZATION.organization_id,
          member_id: MOCK_MEMBER.member_id,
          expiration_minutes: 10,
          intermediate_session_token: 'mock-intermediate-session-token',
        },
        method: 'POST',
        url: '/b2b/totp',
        retryCallback: expect.any(Function),
      });
    });
    it('Calls with dfp telemetry id', async () => {
      client = new HeadlessB2BTOTPsClient(networkClient, subscriptionService, MockDFPProtectedAuthDFPOnly());
      networkClient.retriableFetchSDK.mockResolvedValueOnce(mockResponse);
      await client.create({
        organization_id: MOCK_ORGANIZATION.organization_id,
        member_id: MOCK_MEMBER.member_id,
        expiration_minutes: 10,
      });
      expect(networkClient.retriableFetchSDK).toHaveBeenCalledWith({
        body: {
          organization_id: MOCK_ORGANIZATION.organization_id,
          member_id: MOCK_MEMBER.member_id,
          dfp_telemetry_id: MOCK_DFP_TELEMTRY_ID,
          expiration_minutes: 10,
        },
        method: 'POST',
        url: '/b2b/totp',
        retryCallback: expect.any(Function),
      });
    });

    it('Updates member data in subscription service after successful create', async () => {
      networkClient.retriableFetchSDK.mockResolvedValueOnce(mockResponse);
      subscriptionService.getMember.mockReturnValue(MOCK_MEMBER);

      const response = await client.create({
        organization_id: MOCK_ORGANIZATION.organization_id,
        member_id: MOCK_MEMBER.member_id,
      });

      expect(response).toEqual(mockResponse);
      expect(subscriptionService.updateMember).toHaveBeenCalledWith(MOCK_MEMBER);
    });

    it('Does not update member data in subscription service if member_id does not match', async () => {
      networkClient.retriableFetchSDK.mockResolvedValueOnce(mockResponse);
      subscriptionService.getMember.mockReturnValue({ ...MOCK_MEMBER, member_id: 'different-id' });

      const response = await client.create({
        organization_id: MOCK_ORGANIZATION.organization_id,
        member_id: MOCK_MEMBER.member_id,
      });

      expect(response).toEqual(mockResponse);
      expect(subscriptionService.updateMember).not.toHaveBeenCalled();
    });
  });

  describe('totp.authenticate', () => {
    it('Calls authenticate endpoint with an IST', async () => {
      subscriptionService.getIntermediateSessionToken.mockReturnValueOnce('mock-intermediate-session-token');
      networkClient.retriableFetchSDK.mockResolvedValueOnce(MOCK_B2B_AUTHENTICATE_PAYLOAD);
      const res = await client.authenticate({
        organization_id: MOCK_ORGANIZATION.organization_id,
        member_id: MOCK_MEMBER.member_id,
        code: '1234',
        session_duration_minutes: 60,
      });
      expect(res).toEqual(MOCK_B2B_AUTHENTICATE_PAYLOAD);

      expect(subscriptionService.updateSession).toHaveBeenCalledWith(MOCK_B2B_AUTHENTICATE_PAYLOAD);
      expect(subscriptionService.getIntermediateSessionToken).toHaveBeenCalled();

      expect(networkClient.retriableFetchSDK).toHaveBeenCalledWith({
        body: {
          organization_id: MOCK_ORGANIZATION.organization_id,
          member_id: MOCK_MEMBER.member_id,
          code: '1234',
          intermediate_session_token: 'mock-intermediate-session-token',
          session_duration_minutes: 60,
        },
        method: 'POST',
        url: '/b2b/totp/authenticate',
        retryCallback: expect.any(Function),
      });
    });
    it('Calls authenticate endpoint with no IST', async () => {
      subscriptionService.getIntermediateSessionToken.mockReturnValueOnce(null);
      networkClient.retriableFetchSDK.mockResolvedValueOnce(MOCK_B2B_AUTHENTICATE_PAYLOAD);
      const res = await client.authenticate({
        organization_id: MOCK_ORGANIZATION.organization_id,
        member_id: MOCK_MEMBER.member_id,
        code: '1234',
        session_duration_minutes: 60,
      });
      expect(res).toEqual(MOCK_B2B_AUTHENTICATE_PAYLOAD);

      expect(subscriptionService.updateSession).toHaveBeenCalledWith(MOCK_B2B_AUTHENTICATE_PAYLOAD);
      expect(subscriptionService.getIntermediateSessionToken).toHaveBeenCalled();

      expect(networkClient.retriableFetchSDK).toHaveBeenCalledWith({
        body: {
          organization_id: MOCK_ORGANIZATION.organization_id,
          member_id: MOCK_MEMBER.member_id,
          code: '1234',
          intermediate_session_token: undefined,
          session_duration_minutes: 60,
        },
        method: 'POST',
        url: '/b2b/totp/authenticate',
        retryCallback: expect.any(Function),
      });
    });
    it('Calls with DFP Protected Auth', async () => {
      client = new HeadlessB2BTOTPsClient(networkClient, subscriptionService, MockDFPProtectedAuthDFPOnly());
      subscriptionService.getIntermediateSessionToken.mockReturnValueOnce(null);
      networkClient.retriableFetchSDK.mockResolvedValueOnce(MOCK_B2B_AUTHENTICATE_PAYLOAD);
      const res = await client.authenticate({
        organization_id: MOCK_ORGANIZATION.organization_id,
        member_id: MOCK_MEMBER.member_id,
        code: '1234',
        session_duration_minutes: 60,
      });
      expect(res).toEqual(MOCK_B2B_AUTHENTICATE_PAYLOAD);

      expect(subscriptionService.updateSession).toHaveBeenCalledWith(MOCK_B2B_AUTHENTICATE_PAYLOAD);
      expect(subscriptionService.getIntermediateSessionToken).toHaveBeenCalled();

      expect(networkClient.retriableFetchSDK).toHaveBeenCalledWith({
        body: {
          organization_id: MOCK_ORGANIZATION.organization_id,
          member_id: MOCK_MEMBER.member_id,
          code: '1234',
          intermediate_session_token: undefined,
          session_duration_minutes: 60,
          dfp_telemetry_id: MOCK_DFP_TELEMTRY_ID,
        },
        method: 'POST',
        url: '/b2b/totp/authenticate',
        retryCallback: expect.any(Function),
      });
    });
  });
});
