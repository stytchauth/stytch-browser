import { HeadlessB2BDiscoveryClient } from './HeadlessB2BDiscoveryClient';
import { createB2BTestFixtures } from '../../testing';
import { StytchProjectConfigurationInput } from '../../public/typeConfig';
import {
  MOCK_B2B_AUTHENTICATE_WITH_MFA_NOT_REQUIRED_PAYLOAD,
  MOCK_B2B_AUTHENTICATE_WITH_MFA_REQUIRED_PAYLOAD,
  MOCK_DISCOVERED_ORGANIZATION,
  MOCK_EMAIL,
  MOCK_INTERMEDIATE_SESSION_TOKEN,
  MOCK_ORG_ID,
} from '@stytch/internal-mocks';

const MOCK_B2B_ORGANIZATIONS_LIST_PAYLOAD = {
  email_address: MOCK_EMAIL,
  discovered_organizations: [MOCK_DISCOVERED_ORGANIZATION],
};

const MOCK_B2B_ORGANIZATIONS_CREATE_REQUEST = {
  session_duration_minutes: 10,
  organization_name: 'organization-name',
  organization_slug: 'organization-slug',
  sso_jit_provisioning: 'RESTRICTED',
  email_allowed_domains: ['stytch.com'],
  mfa_policy: 'REQUIRED_FOR_ALL',
};

const MOCK_B2B_INTERMEDIATE_SESSIONS_EXCHANGE_REQUEST = {
  organization_id: MOCK_ORG_ID,
  session_duration_minutes: 10,
  locale: 'es',
};

describe('HeadlessB2BDiscoveryClient', () => {
  const { networkClient, subscriptionService } = createB2BTestFixtures();
  let client: HeadlessB2BDiscoveryClient<StytchProjectConfigurationInput>;

  beforeAll(() => {
    client = new HeadlessB2BDiscoveryClient(networkClient, subscriptionService);
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('discovery.organizations.list', () => {
    it('Calls the backend API', async () => {
      subscriptionService.getIntermediateSessionToken.mockReturnValueOnce(MOCK_INTERMEDIATE_SESSION_TOKEN);
      networkClient.fetchSDK.mockResolvedValueOnce(MOCK_B2B_ORGANIZATIONS_LIST_PAYLOAD);
      const res = await client.organizations.list();
      expect(res).toEqual(MOCK_B2B_ORGANIZATIONS_LIST_PAYLOAD);

      expect(subscriptionService.getIntermediateSessionToken).toHaveBeenCalled();

      expect(networkClient.fetchSDK).toHaveBeenCalledWith({
        body: { intermediate_session_token: MOCK_INTERMEDIATE_SESSION_TOKEN },
        method: 'POST',
        url: '/b2b/discovery/organizations',
      });
    });
  });

  describe('discovery.organizations.create', () => {
    it('Calls the backend API and updates the state when a session is returned', async () => {
      subscriptionService.getIntermediateSessionToken.mockReturnValueOnce(MOCK_INTERMEDIATE_SESSION_TOKEN);
      networkClient.fetchSDK.mockResolvedValueOnce(MOCK_B2B_AUTHENTICATE_WITH_MFA_NOT_REQUIRED_PAYLOAD);
      const res = await client.organizations.create(MOCK_B2B_ORGANIZATIONS_CREATE_REQUEST);
      expect(res).toEqual(MOCK_B2B_AUTHENTICATE_WITH_MFA_NOT_REQUIRED_PAYLOAD);

      expect(subscriptionService.updateSession).toHaveBeenCalledWith(res);
      expect(subscriptionService.getIntermediateSessionToken).toHaveBeenCalled();

      expect(networkClient.fetchSDK).toHaveBeenCalledWith({
        body: { ...MOCK_B2B_ORGANIZATIONS_CREATE_REQUEST, intermediate_session_token: MOCK_INTERMEDIATE_SESSION_TOKEN },
        method: 'POST',
        url: '/b2b/discovery/organizations/create',
      });
    });

    it('Calls the backend API and updates the IST when an IST is returned', async () => {
      subscriptionService.getIntermediateSessionToken.mockReturnValueOnce(MOCK_INTERMEDIATE_SESSION_TOKEN);
      networkClient.fetchSDK.mockResolvedValueOnce(MOCK_B2B_AUTHENTICATE_WITH_MFA_REQUIRED_PAYLOAD);
      const res = await client.organizations.create(MOCK_B2B_ORGANIZATIONS_CREATE_REQUEST);
      expect(res).toEqual(MOCK_B2B_AUTHENTICATE_WITH_MFA_REQUIRED_PAYLOAD);

      expect(subscriptionService.updateSession).toHaveBeenCalledWith(res);
      expect(subscriptionService.getIntermediateSessionToken).toHaveBeenCalled();

      expect(networkClient.fetchSDK).toHaveBeenCalledWith({
        body: { ...MOCK_B2B_ORGANIZATIONS_CREATE_REQUEST, intermediate_session_token: MOCK_INTERMEDIATE_SESSION_TOKEN },
        method: 'POST',
        url: '/b2b/discovery/organizations/create',
      });
    });
  });

  describe('discovery.intermediateSessions.exchange', () => {
    it('Calls the backend API and updates the state when a session is returned', async () => {
      subscriptionService.getIntermediateSessionToken.mockReturnValueOnce(MOCK_INTERMEDIATE_SESSION_TOKEN);
      networkClient.fetchSDK.mockResolvedValueOnce(MOCK_B2B_AUTHENTICATE_WITH_MFA_NOT_REQUIRED_PAYLOAD);
      const res = await client.intermediateSessions.exchange(MOCK_B2B_INTERMEDIATE_SESSIONS_EXCHANGE_REQUEST);
      expect(res).toEqual(MOCK_B2B_AUTHENTICATE_WITH_MFA_NOT_REQUIRED_PAYLOAD);

      expect(subscriptionService.updateSession).toHaveBeenCalledWith(res);
      expect(subscriptionService.getIntermediateSessionToken).toHaveBeenCalled();

      expect(networkClient.fetchSDK).toHaveBeenCalledWith({
        body: {
          ...MOCK_B2B_INTERMEDIATE_SESSIONS_EXCHANGE_REQUEST,
          intermediate_session_token: MOCK_INTERMEDIATE_SESSION_TOKEN,
        },
        method: 'POST',
        url: '/b2b/discovery/intermediate_sessions/exchange',
      });
    });
  });

  it('Calls the backend API and updates the IST when an IST is returned', async () => {
    subscriptionService.getIntermediateSessionToken.mockReturnValueOnce(MOCK_INTERMEDIATE_SESSION_TOKEN);
    networkClient.fetchSDK.mockResolvedValueOnce(MOCK_B2B_AUTHENTICATE_WITH_MFA_REQUIRED_PAYLOAD);
    const res = await client.intermediateSessions.exchange(MOCK_B2B_INTERMEDIATE_SESSIONS_EXCHANGE_REQUEST);
    expect(res).toEqual(MOCK_B2B_AUTHENTICATE_WITH_MFA_REQUIRED_PAYLOAD);

    expect(subscriptionService.updateSession).toHaveBeenCalledWith(res);
    expect(subscriptionService.getIntermediateSessionToken).toHaveBeenCalled();

    expect(networkClient.fetchSDK).toHaveBeenCalledWith({
      body: {
        ...MOCK_B2B_INTERMEDIATE_SESSIONS_EXCHANGE_REQUEST,
        intermediate_session_token: MOCK_INTERMEDIATE_SESSION_TOKEN,
      },
      method: 'POST',
      url: '/b2b/discovery/intermediate_sessions/exchange',
    });
  });
});
