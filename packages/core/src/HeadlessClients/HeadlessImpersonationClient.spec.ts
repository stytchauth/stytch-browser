import { createTestFixtures, MockDFPProtectedAuthCaptchaOnly } from '../testing';
import { MOCK_AUTHENTICATE_PAYLOAD, updateSessionExpect, MOCK_CAPTCHA } from '@stytch/internal-mocks';
import { HeadlessImpersonationClient } from './HeadlessImpersonationClient';
import { StytchProjectConfigurationInput } from '../public';

describe('HeadlessImpersonationClient', () => {
  const { networkClient, subscriptionService } = createTestFixtures();
  let client: HeadlessImpersonationClient<StytchProjectConfigurationInput>;

  beforeAll(() => {
    client = new HeadlessImpersonationClient(networkClient, subscriptionService, MockDFPProtectedAuthCaptchaOnly());
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('impersonation.authenticate', () => {
    beforeEach(() => {
      networkClient.retriableFetchSDK.mockResolvedValue(MOCK_AUTHENTICATE_PAYLOAD);
    });

    it('Calls the backend API and updates the state when a session is returned', async () => {
      const res = await client.authenticate({
        impersonation_token: 'token',
      });
      expect(res).toEqual(MOCK_AUTHENTICATE_PAYLOAD);

      expect(subscriptionService.updateSession).toHaveBeenCalledWith(updateSessionExpect());

      expect(networkClient.retriableFetchSDK).toHaveBeenCalledWith({
        body: {
          impersonation_token: 'token',
          dfp_telemetry_id: undefined,
          captcha_token: MOCK_CAPTCHA,
        },
        method: 'POST',
        url: '/impersonation/authenticate',
        retryCallback: expect.any(Function),
      });
    });
  });
});
