import { HeadlessB2BOTPsClient } from './HeadlessB2BOTPsClient';
import {
  createB2BTestFixtures,
  IB2BSubscriptionServiceMock,
  INetworkClientMock,
  MockDFPProtectedAuthDFPOnly,
  MockDFPProtectedAuthDisabled,
} from '../../testing';
import {
  MOCK_B2B_AUTHENTICATE_PAYLOAD,
  MOCK_B2B_DISCOVERY_AUTHENTICATE_PAYLOAD,
  MOCK_DFP_TELEMTRY_ID,
  MOCK_EMAIL,
  MOCK_MEMBER,
  MOCK_ORGANIZATION,
  MOCK_PHONE_NUMBER,
} from '@stytch/internal-mocks';
import { StytchProjectConfigurationInput } from '../../public/typeConfig';

describe('HeadlessB2BOTPsClient', () => {
  let networkClient: INetworkClientMock;
  let subscriptionService: IB2BSubscriptionServiceMock;
  let client: HeadlessB2BOTPsClient<StytchProjectConfigurationInput>;

  beforeEach(() => {
    jest.resetAllMocks();
    ({ networkClient, subscriptionService } = createB2BTestFixtures());
    client = new HeadlessB2BOTPsClient(networkClient, subscriptionService, MockDFPProtectedAuthDisabled());
  });

  describe('otps.sms.send', () => {
    it('Calls the SMS send endpoint', async () => {
      await client.sms.send({
        organization_id: MOCK_ORGANIZATION.organization_id,
        member_id: MOCK_MEMBER.member_id,
        mfa_phone_number: MOCK_PHONE_NUMBER,
      });
      expect(networkClient.retriableFetchSDK).toHaveBeenCalledWith({
        body: {
          organization_id: MOCK_ORGANIZATION.organization_id,
          member_id: MOCK_MEMBER.member_id,
          mfa_phone_number: MOCK_PHONE_NUMBER,
        },
        method: 'POST',
        url: '/b2b/otps/sms/send',
        retryCallback: expect.any(Function),
      });
    });
    it('Passes the enable_autofill parameter', async () => {
      await client.sms.send({
        organization_id: MOCK_ORGANIZATION.organization_id,
        member_id: MOCK_MEMBER.member_id,
        mfa_phone_number: MOCK_PHONE_NUMBER,
        enable_autofill: true,
      });
      expect(networkClient.retriableFetchSDK).toHaveBeenCalledWith({
        body: {
          organization_id: MOCK_ORGANIZATION.organization_id,
          member_id: MOCK_MEMBER.member_id,
          mfa_phone_number: MOCK_PHONE_NUMBER,
          enable_autofill: true,
        },
        method: 'POST',
        url: '/b2b/otps/sms/send',
        retryCallback: expect.any(Function),
      });
    });
    it('Calls the SMS send endpoint with IST', async () => {
      subscriptionService.getIntermediateSessionToken.mockReturnValueOnce('mock-intermediate-session-token');
      await client.sms.send({
        organization_id: MOCK_ORGANIZATION.organization_id,
        member_id: MOCK_MEMBER.member_id,
        mfa_phone_number: MOCK_PHONE_NUMBER,
      });
      expect(subscriptionService.getIntermediateSessionToken).toHaveBeenCalledTimes(1);
      expect(networkClient.retriableFetchSDK).toHaveBeenCalledWith({
        body: {
          organization_id: MOCK_ORGANIZATION.organization_id,
          member_id: MOCK_MEMBER.member_id,
          mfa_phone_number: MOCK_PHONE_NUMBER,
          intermediate_session_token: 'mock-intermediate-session-token',
        },
        method: 'POST',
        url: '/b2b/otps/sms/send',
        retryCallback: expect.any(Function),
      });
    });
    it('Calls with dfp telemetry id', async () => {
      client = new HeadlessB2BOTPsClient(networkClient, subscriptionService, MockDFPProtectedAuthDFPOnly());
      await client.sms.send({
        organization_id: MOCK_ORGANIZATION.organization_id,
        member_id: MOCK_MEMBER.member_id,
        mfa_phone_number: MOCK_PHONE_NUMBER,
      });
      expect(networkClient.retriableFetchSDK).toHaveBeenCalledWith({
        body: {
          organization_id: MOCK_ORGANIZATION.organization_id,
          member_id: MOCK_MEMBER.member_id,
          mfa_phone_number: MOCK_PHONE_NUMBER,
          dfp_telemetry_id: MOCK_DFP_TELEMTRY_ID,
        },
        method: 'POST',
        url: '/b2b/otps/sms/send',
        retryCallback: expect.any(Function),
      });
    });
  });

  describe('otps.sms.authenticate', () => {
    it('Calls the SMS authenticate endpoint with an IST', async () => {
      subscriptionService.getIntermediateSessionToken.mockReturnValueOnce('mock-intermediate-session-token');
      networkClient.retriableFetchSDK.mockResolvedValueOnce(MOCK_B2B_AUTHENTICATE_PAYLOAD);
      const res = await client.sms.authenticate({
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
        url: '/b2b/otps/sms/authenticate',
        retryCallback: expect.any(Function),
      });
    });
  });

  describe('otps.email.loginOrSignup', () => {
    it('Calls the email login or signup endpoint with all params', async () => {
      await client.email.loginOrSignup({
        organization_id: MOCK_ORGANIZATION.organization_id,
        email_address: MOCK_EMAIL,
        login_template_id: 'login-template-id',
        signup_template_id: 'signup-template-id',
        locale: 'en',
      });
      expect(networkClient.retriableFetchSDK).toHaveBeenCalledWith({
        body: {
          organization_id: MOCK_ORGANIZATION.organization_id,
          email_address: MOCK_EMAIL,
          login_template_id: 'login-template-id',
          signup_template_id: 'signup-template-id',
          locale: 'en',
        },
        method: 'POST',
        url: '/b2b/otps/email/login_or_signup',
        retryCallback: expect.any(Function),
      });
    });
    it('Calls the email loginOrSignup endpoint with DFP telemetry ID', async () => {
      client = new HeadlessB2BOTPsClient(networkClient, subscriptionService, MockDFPProtectedAuthDFPOnly());
      await client.email.loginOrSignup({
        organization_id: MOCK_ORGANIZATION.organization_id,
        email_address: MOCK_EMAIL,
      });
      expect(networkClient.retriableFetchSDK).toHaveBeenCalledWith({
        body: {
          organization_id: MOCK_ORGANIZATION.organization_id,
          email_address: MOCK_EMAIL,
          dfp_telemetry_id: MOCK_DFP_TELEMTRY_ID,
        },
        method: 'POST',
        url: '/b2b/otps/email/login_or_signup',
        retryCallback: expect.any(Function),
      });
    });
  });

  describe('otps.email.authenticate', () => {
    it('Calls the email authenticate endpoint', async () => {
      await client.email.authenticate({
        code: '1234',
        organization_id: MOCK_ORGANIZATION.organization_id,
        email_address: MOCK_EMAIL,
        session_duration_minutes: 10,
      });
      expect(networkClient.retriableFetchSDK).toHaveBeenCalledWith({
        body: {
          code: '1234',
          email_address: MOCK_EMAIL,
          organization_id: MOCK_ORGANIZATION.organization_id,
          session_duration_minutes: 10,
        },
        method: 'POST',
        url: '/b2b/otps/email/authenticate',
        retryCallback: expect.any(Function),
      });
    });
    it('Calls the email authenticate endpoint with an Intermediate Session Token', async () => {
      subscriptionService.getIntermediateSessionToken.mockReturnValueOnce('mock-intermediate-session-token');
      await client.email.authenticate({
        organization_id: MOCK_ORGANIZATION.organization_id,
        code: '1234',
        email_address: MOCK_EMAIL,
        session_duration_minutes: 10,
      });

      expect(subscriptionService.getIntermediateSessionToken).toHaveBeenCalledTimes(1);
      expect(networkClient.retriableFetchSDK).toHaveBeenCalledWith({
        body: {
          code: '1234',
          email_address: MOCK_EMAIL,
          organization_id: MOCK_ORGANIZATION.organization_id,
          session_duration_minutes: 10,
          intermediate_session_token: 'mock-intermediate-session-token',
        },
        method: 'POST',
        url: '/b2b/otps/email/authenticate',
        retryCallback: expect.any(Function),
      });
    });
    it('Calls the email authenticate endpoint with DFP telemetry ID', async () => {
      client = new HeadlessB2BOTPsClient(networkClient, subscriptionService, MockDFPProtectedAuthDFPOnly());
      await client.email.authenticate({
        organization_id: MOCK_ORGANIZATION.organization_id,
        code: '1234',
        email_address: MOCK_EMAIL,
        session_duration_minutes: 10,
      });
      expect(networkClient.retriableFetchSDK).toHaveBeenCalledWith({
        body: {
          code: '1234',
          email_address: MOCK_EMAIL,
          organization_id: MOCK_ORGANIZATION.organization_id,
          session_duration_minutes: 10,
          dfp_telemetry_id: MOCK_DFP_TELEMTRY_ID,
        },
        method: 'POST',
        url: '/b2b/otps/email/authenticate',
        retryCallback: expect.any(Function),
      });
    });
    it('Handles successful authentication response and updates session state', async () => {
      networkClient.retriableFetchSDK.mockResolvedValueOnce(MOCK_B2B_AUTHENTICATE_PAYLOAD);
      const res = await client.email.authenticate({
        organization_id: MOCK_ORGANIZATION.organization_id,
        code: '1234',
        email_address: MOCK_EMAIL,
        session_duration_minutes: 10,
      });
      expect(res).toEqual(MOCK_B2B_AUTHENTICATE_PAYLOAD);
      expect(subscriptionService.updateSession).toHaveBeenCalledTimes(1);
      expect(subscriptionService.updateSession).toHaveBeenCalledWith(MOCK_B2B_AUTHENTICATE_PAYLOAD);
    });
  });

  describe('otps.email.discovery', () => {
    describe('send', () => {
      it('Calls the email discovery send endpoint', async () => {
        await client.email.discovery.send({
          email_address: MOCK_EMAIL,
          login_template_id: 'login-template-id',
          locale: 'en',
        });

        expect(networkClient.retriableFetchSDK).toHaveBeenCalledWith({
          body: {
            email_address: MOCK_EMAIL,
            login_template_id: 'login-template-id',
            locale: 'en',
          },
          method: 'POST',
          url: '/b2b/otps/email/discovery/send',
          retryCallback: expect.any(Function),
        });
      });
      it('Calls the email discovery send endpoint with DFP telemetry ID', async () => {
        client = new HeadlessB2BOTPsClient(networkClient, subscriptionService, MockDFPProtectedAuthDFPOnly());
        await client.email.discovery.send({
          email_address: MOCK_EMAIL,
        });

        expect(networkClient.retriableFetchSDK).toHaveBeenCalledWith({
          body: {
            email_address: MOCK_EMAIL,
            dfp_telemetry_id: MOCK_DFP_TELEMTRY_ID,
          },
          method: 'POST',
          url: '/b2b/otps/email/discovery/send',
          retryCallback: expect.any(Function),
        });
      });
    });
    describe('authenticate', () => {
      beforeEach(() => {
        networkClient.retriableFetchSDK.mockResolvedValue(MOCK_B2B_DISCOVERY_AUTHENTICATE_PAYLOAD);
      });
      it('Calls the email discovery authenticate endpoint', async () => {
        await client.email.discovery.authenticate({
          code: '1234',
          email_address: MOCK_EMAIL,
        });

        expect(networkClient.retriableFetchSDK).toHaveBeenCalledWith({
          body: {
            code: '1234',
            email_address: MOCK_EMAIL,
          },
          method: 'POST',
          url: '/b2b/otps/email/discovery/authenticate',
          retryCallback: expect.any(Function),
        });
      });
      it('Handles successful authentication response and updates session state', async () => {
        const res = await client.email.discovery.authenticate({
          code: '1234',
          email_address: MOCK_EMAIL,
        });

        expect(res).toEqual(MOCK_B2B_DISCOVERY_AUTHENTICATE_PAYLOAD);
        expect(subscriptionService.updateSession).toHaveBeenCalledTimes(1);
        expect(subscriptionService.updateSession).toHaveBeenCalledWith(MOCK_B2B_DISCOVERY_AUTHENTICATE_PAYLOAD);
      });
      it('Calls the email discovery authenticate endpoint with DFP telemetry ID', async () => {
        client = new HeadlessB2BOTPsClient(networkClient, subscriptionService, MockDFPProtectedAuthDFPOnly());
        await client.email.discovery.authenticate({
          code: '1234',
          email_address: MOCK_EMAIL,
        });
        expect(networkClient.retriableFetchSDK).toHaveBeenCalledWith({
          body: {
            code: '1234',
            email_address: MOCK_EMAIL,
            dfp_telemetry_id: MOCK_DFP_TELEMTRY_ID,
          },
          method: 'POST',
          url: '/b2b/otps/email/discovery/authenticate',
          retryCallback: expect.any(Function),
        });
      });
    });
  });

  it('Calls the SMS authenticate endpoint with no IST', async () => {
    subscriptionService.getIntermediateSessionToken.mockReturnValueOnce(null);
    networkClient.retriableFetchSDK.mockResolvedValueOnce(MOCK_B2B_AUTHENTICATE_PAYLOAD);
    const res = await client.sms.authenticate({
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
      url: '/b2b/otps/sms/authenticate',
      retryCallback: expect.any(Function),
    });
  });

  it('Calls with DFP Protected Auth', async () => {
    client = new HeadlessB2BOTPsClient(networkClient, subscriptionService, MockDFPProtectedAuthDFPOnly());
    subscriptionService.getIntermediateSessionToken.mockReturnValueOnce(null);
    networkClient.retriableFetchSDK.mockResolvedValueOnce(MOCK_B2B_AUTHENTICATE_PAYLOAD);
    const res = await client.sms.authenticate({
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
      url: '/b2b/otps/sms/authenticate',
      retryCallback: expect.any(Function),
    });
  });
});
