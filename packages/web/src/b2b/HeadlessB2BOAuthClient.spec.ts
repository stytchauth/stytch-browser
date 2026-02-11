import { LIVE_API_URL, TEST_API_URL } from '@stytch/core';
import { StytchProjectConfigurationInput } from '@stytch/core/public';

import { GoogleOneTapClient } from '../oneTap/GoogleOneTapClient';
import { createB2BTestFixtures, createTestFixtures, MockDFPProtectedAuthCaptchaOnly } from '../testUtils';
import { HeadlessB2BOAuthClient } from './HeadlessB2BOAuthClient';

describe('HeadlessB2BOAuthClient', () => {
  const { networkClient, subscriptionService, pkceManager } = createB2BTestFixtures();
  const { b2bOneTap } = createTestFixtures();

  let client: HeadlessB2BOAuthClient<StytchProjectConfigurationInput>;
  let mockOneTapClient: GoogleOneTapClient;

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
    client = new HeadlessB2BOAuthClient(
      networkClient,
      subscriptionService,
      pkceManager,
      MockDynamicConfig,
      MockConfig,
      MockDFPProtectedAuthCaptchaOnly(),
      b2bOneTap,
    );
    mockOneTapClient = {
      cancel: jest.fn(),
      render: jest.fn(),
    } as unknown as GoogleOneTapClient;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('oauth.googleOneTap.discovery.start', () => {
    it('correctly uses the redirect_url to create a successHandler and render the prompt', async () => {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      const noop = () => {};

      (b2bOneTap.createOneTapClient as jest.Mock).mockResolvedValue({ success: true, client: mockOneTapClient });
      (mockOneTapClient.render as jest.Mock).mockResolvedValue({ success: true });
      (b2bOneTap.createOnDiscoverySuccessHandler as jest.Mock).mockImplementation(() => noop);

      const data = await client.googleOneTap.discovery.start({
        discovery_redirect_url: 'https://example.com/foo',
      });

      expect(b2bOneTap.createOneTapClient).toHaveBeenCalledTimes(1);
      expect(b2bOneTap.createOnDiscoverySuccessHandler).toHaveBeenCalledWith({
        discoveryRedirectUrl: 'https://example.com/foo',
        onSuccess: expect.any(Function),
      });
      expect(mockOneTapClient.render).toHaveBeenCalledWith({
        callback: noop,
        style: { position: 'floating' },
      });
      expect(data).toStrictEqual({ success: true });
    });
    it('throws an error when the OneTapClient cannot be created', async () => {
      (b2bOneTap.createOneTapClient as jest.Mock).mockResolvedValue({ success: false });

      await expect(() =>
        client.googleOneTap.discovery.start({
          discovery_redirect_url: 'https://example.com/foo',
        }),
      ).rejects.toThrow('One Tap could not load');
    });
    it('returns false when one tap cannot render the prompt', async () => {
      (b2bOneTap.createOneTapClient as jest.Mock).mockResolvedValue({ success: true, client: mockOneTapClient });
      (mockOneTapClient.render as jest.Mock).mockResolvedValue({ success: false, reason: 'reason' });

      const data = await client.googleOneTap.discovery.start({
        discovery_redirect_url: 'https://example.com/foo',
      });

      expect(data).toStrictEqual({ success: false, reason: 'reason' });
    });
  });

  describe('oauth.googleOneTap.start', () => {
    it('correctly creates a successHandler and render the prompt', async () => {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      const noop = () => {};

      (b2bOneTap.createOneTapClient as jest.Mock).mockResolvedValue({ success: true, client: mockOneTapClient });
      (mockOneTapClient.render as jest.Mock).mockResolvedValue({ success: true });
      (b2bOneTap.createOnSuccessHandler as jest.Mock).mockImplementation(() => noop);

      const data = await client.googleOneTap.start({
        organization_id: 'org-test-123',
      });

      expect(b2bOneTap.createOneTapClient).toHaveBeenCalledTimes(1);
      expect(b2bOneTap.createOnSuccessHandler).toHaveBeenCalledWith({
        organizationId: 'org-test-123',
        onSuccess: expect.any(Function),
      });
      expect(mockOneTapClient.render).toHaveBeenCalledWith({
        callback: noop,
        style: { position: 'floating' },
      });
      expect(data).toStrictEqual({ success: true });
    });
    it('correctly creates a successHandler and render the prompt with redirect_url parameters', async () => {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      const noop = () => {};

      (b2bOneTap.createOneTapClient as jest.Mock).mockResolvedValue({ success: true, client: mockOneTapClient });
      (mockOneTapClient.render as jest.Mock).mockResolvedValue({ success: true });
      (b2bOneTap.createOnSuccessHandler as jest.Mock).mockImplementation(() => noop);

      const data = await client.googleOneTap.start({
        organization_id: 'org-test-123',
        login_redirect_url: 'https://example.com/login',
        signup_redirect_url: 'https://example.com/signup',
      });

      expect(b2bOneTap.createOneTapClient).toHaveBeenCalledTimes(1);
      expect(b2bOneTap.createOnSuccessHandler).toHaveBeenCalledWith({
        organizationId: 'org-test-123',
        loginRedirectUrl: 'https://example.com/login',
        signupRedirectUrl: 'https://example.com/signup',
        onSuccess: expect.any(Function),
      });
      expect(mockOneTapClient.render).toHaveBeenCalledWith({
        callback: noop,
        style: { position: 'floating' },
      });
      expect(data).toStrictEqual({ success: true });
    });
    it('throws an error when the OneTapClient cannot be created', async () => {
      (b2bOneTap.createOneTapClient as jest.Mock).mockResolvedValue({ success: false });

      await expect(() =>
        client.googleOneTap.start({
          organization_id: 'org-test-123',
        }),
      ).rejects.toThrow('One Tap could not load');
    });
    it('returns false when one tap cannot render the prompt', async () => {
      (b2bOneTap.createOneTapClient as jest.Mock).mockResolvedValue({ success: true, client: mockOneTapClient });
      (mockOneTapClient.render as jest.Mock).mockResolvedValue({ success: false, reason: 'reason' });

      const data = await client.googleOneTap.start({
        organization_id: 'org-test-123',
      });

      expect(data).toStrictEqual({ success: false, reason: 'reason' });
    });
    it('throws an error when organization_id is not present', async () => {
      await expect(() =>
        client.googleOneTap.start({
          organization_id: '',
        }),
      ).rejects.toThrow('organization_id is a required argument');
    });
  });
});
