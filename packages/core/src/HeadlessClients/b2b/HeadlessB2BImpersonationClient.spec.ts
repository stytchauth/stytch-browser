import { createB2BTestFixtures, MockDFPProtectedAuthCaptchaOnly } from '../../testing';
import { StytchProjectConfigurationInput } from '../../public/typeConfig';
import { MOCK_B2B_AUTHENTICATE_WITH_MFA_NOT_REQUIRED_PAYLOAD, MOCK_CAPTCHA } from '@stytch/internal-mocks';
import { HeadlessB2BImpersonationClient } from './HeadlessB2BImpersonationClient';

describe('HeadlessB2BImpersonationClient', () => {
  const { networkClient, subscriptionService } = createB2BTestFixtures();
  let client: HeadlessB2BImpersonationClient<StytchProjectConfigurationInput>;

  beforeAll(() => {
    client = new HeadlessB2BImpersonationClient(networkClient, subscriptionService, MockDFPProtectedAuthCaptchaOnly());
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('impersonation.authenticate', () => {
    it('Calls the backend API and updates the state when a session is returned', async () => {
      networkClient.retriableFetchSDK.mockResolvedValueOnce(MOCK_B2B_AUTHENTICATE_WITH_MFA_NOT_REQUIRED_PAYLOAD);
      const res = await client.authenticate({
        impersonation_token: 'impersonation_token',
      });
      expect(res).toEqual(MOCK_B2B_AUTHENTICATE_WITH_MFA_NOT_REQUIRED_PAYLOAD);

      expect(subscriptionService.updateSession).toHaveBeenCalledWith(res);

      expect(networkClient.retriableFetchSDK).toHaveBeenCalledWith({
        body: { impersonation_token: 'impersonation_token', captcha_token: MOCK_CAPTCHA },
        method: 'POST',
        url: '/b2b/impersonation/authenticate',
        retryCallback: expect.any(Function),
      });
    });
  });
});
