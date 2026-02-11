import { HeadlessOAuthClient } from './HeadlessOAuthClient';
import { LIVE_API_URL, TEST_API_URL } from '@stytch/core';
import { GoogleOneTapClient } from './oneTap/GoogleOneTapClient';

import { createTestFixtures } from './testUtils';
import { StytchProjectConfigurationInput } from '@stytch/core/public';

describe('HeadlessOAuthClient', () => {
  const { networkClient, subscriptionService, pkceManager, oneTap } = createTestFixtures();

  const mockOneTapClient = {
    cancel: jest.fn(),
    render: jest.fn(),
  } as unknown as GoogleOneTapClient;
  let client: HeadlessOAuthClient<StytchProjectConfigurationInput>;

  const MockDynamicConfig = Promise.resolve({
    cnameDomain: null,
    pkceRequiredForOAuth: true,
  });

  const MockConfig = {
    publicToken: 'MOCK_PUBLIC_TOKEN',
    liveAPIURL: LIVE_API_URL,
    testAPIURL: TEST_API_URL,
  };

  beforeAll(() => {
    client = new HeadlessOAuthClient(
      networkClient,
      subscriptionService,
      pkceManager,
      MockDynamicConfig,
      MockConfig,
      oneTap,
    );
  });

  describe('oauth.googleOneTap.start', () => {
    it('correctly uses uses the redirect_urls and onOneTapCancelled to create an successHandler and successfully renders the prompt', async () => {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      const noop = () => {};

      (oneTap.createOneTapClient as jest.Mock).mockResolvedValue({ success: true, client: mockOneTapClient });
      (mockOneTapClient.render as jest.Mock).mockResolvedValue({ success: true });
      (oneTap.createOnSuccessHandler as jest.Mock).mockImplementation(() => noop);

      const data = await client.googleOneTap.start({
        signup_redirect_url: 'https://example.com/foo',
        login_redirect_url: 'https://example.com/foo',
        onOneTapCancelled: noop,
      });

      expect(oneTap.createOneTapClient).toHaveBeenCalledTimes(1);
      expect(oneTap.createOnSuccessHandler).toHaveBeenCalledWith({
        loginRedirectUrl: 'https://example.com/foo',
        signupRedirectUrl: 'https://example.com/foo',
        onSuccess: expect.any(Function),
      });
      expect(mockOneTapClient.render).toHaveBeenCalledWith({
        callback: noop,
        onOneTapCancelled: noop,
        style: { position: 'floating' },
      });
      expect(data).toStrictEqual({ success: true });
    });

    it('throws an error when the OneTapClient cannot be created', async () => {
      (oneTap.createOneTapClient as jest.Mock).mockResolvedValue({ success: false });

      await expect(() =>
        client.googleOneTap.start({
          signup_redirect_url: 'https://example.com/foo',
          login_redirect_url: 'https://example.com/foo',
        }),
      ).rejects.toThrow('One Tap could not load');
    });

    it('returns false when one tap cannot render the prompt', async () => {
      (oneTap.createOneTapClient as jest.Mock).mockResolvedValue({ success: true, client: mockOneTapClient });
      (mockOneTapClient.render as jest.Mock).mockResolvedValue({ success: false, reason: 'reason' });

      const data = await client.googleOneTap.start({
        signup_redirect_url: 'https://example.com/foo',
        login_redirect_url: 'https://example.com/foo',
      });

      expect(data).toStrictEqual({ success: false, reason: 'reason' });
    });
  });
});
