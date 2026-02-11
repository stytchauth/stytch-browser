import {
  MOCK_AUTHENTICATE_PAYLOAD,
  MOCK_AUTHENTICATE_RETURN_VALUE,
  MOCK_CAPTCHA,
  MOCK_DFP_TELEMTRY_ID,
  MOCK_USER,
  updateSessionExpect,
} from '@stytch/internal-mocks';

import { StytchProjectConfigurationInput } from '../public/typeConfig';
import {
  createTestFixtures,
  IConsumerSubscriptionServiceMock,
  INetworkClientMock,
  MockDFPProtectedAuthCaptchaOnly,
  MockDFPProtectedAuthDFPOnly,
} from '../testing';
import { HeadlessTOTPClient } from './HeadlessTOTPClient';

describe('HeadlessTOTPClient', () => {
  let networkClient: INetworkClientMock;
  let subscriptionService: IConsumerSubscriptionServiceMock;
  let client: HeadlessTOTPClient<StytchProjectConfigurationInput>;

  beforeEach(() => {
    jest.resetAllMocks();
    ({ networkClient, subscriptionService } = createTestFixtures());
    client = new HeadlessTOTPClient(networkClient, subscriptionService, MockDFPProtectedAuthCaptchaOnly());
  });

  describe('create', () => {
    it('Is called with the expiration minutes which is specified', async () => {
      networkClient.fetchSDK.mockResolvedValueOnce({
        totp_id: 'totp-test-123',
        secret: 'ABC123',
        qr_code: 'qr-code-123456',
        recovery_codes: ['recovery-code-1', 'recovery-code-2', 'recovery-code-3'],
        __user: MOCK_USER,
      });

      await expect(client.create({ expiration_minutes: 10 })).resolves.toEqual({
        totp_id: 'totp-test-123',
        secret: 'ABC123',
        qr_code: 'qr-code-123456',
        recovery_codes: ['recovery-code-1', 'recovery-code-2', 'recovery-code-3'],
      });

      expect(subscriptionService.updateUser).toHaveBeenCalledWith(MOCK_USER);

      expect(networkClient.fetchSDK).toHaveBeenCalledWith({
        url: '/totps',
        method: 'POST',
        body: {
          expiration_minutes: 10,
        },
      });
    });
  });

  describe('authenticate', () => {
    it('Calls the authenticate method, stores some data in the subscriptionService, and returns a cleaned response', async () => {
      const authenticateOptions = {
        totp_code: '123456',
        session_duration_minutes: 10,
      };

      networkClient.retriableFetchSDK.mockReturnValue(MOCK_AUTHENTICATE_PAYLOAD);

      await expect(client.authenticate(authenticateOptions)).resolves.toEqual(MOCK_AUTHENTICATE_RETURN_VALUE);

      expect(subscriptionService.updateSession).toHaveBeenCalledWith(updateSessionExpect());

      expect(networkClient.retriableFetchSDK).toHaveBeenCalledWith({
        url: '/totps/authenticate',
        method: 'POST',
        body: {
          session_duration_minutes: 10,
          totp_code: '123456',
          captcha_token: MOCK_CAPTCHA,
        },
        retryCallback: expect.any(Function),
      });
    });
    it('Calls the authenticate method with dfp protected auth', async () => {
      const authenticateOptions = {
        totp_code: '123456',
        session_duration_minutes: 10,
      };

      client = new HeadlessTOTPClient(networkClient, subscriptionService, MockDFPProtectedAuthDFPOnly());

      networkClient.retriableFetchSDK.mockReturnValue(MOCK_AUTHENTICATE_PAYLOAD);

      await expect(client.authenticate(authenticateOptions)).resolves.toEqual(MOCK_AUTHENTICATE_RETURN_VALUE);

      expect(subscriptionService.updateSession).toHaveBeenCalledWith(updateSessionExpect());

      expect(networkClient.retriableFetchSDK).toHaveBeenCalledWith({
        url: '/totps/authenticate',
        method: 'POST',
        body: {
          session_duration_minutes: 10,
          totp_code: '123456',
          dfp_telemetry_id: MOCK_DFP_TELEMTRY_ID,
        },
        retryCallback: expect.any(Function),
      });
    });
  });

  describe('recoveryCodes', () => {
    it('Calls the recoveryCodes method and returns the response', async () => {
      networkClient.fetchSDK.mockReturnValue({
        user_id: 'user_id',
        totps: { totp_id: 'totp_id', verified: true, recovery_codes: [] },
      });

      await expect(client.recoveryCodes()).resolves.toEqual({
        user_id: 'user_id',
        totps: { totp_id: 'totp_id', verified: true, recovery_codes: [] },
      });

      expect(networkClient.fetchSDK).toHaveBeenCalledWith({
        url: '/totps/recovery_codes',
        method: 'POST',
      });
    });
  });

  describe('recover', () => {
    it('Calls the recover method, stores some data in the subscriptionService, and returns a cleaned response', async () => {
      const recoveryOptions = {
        recovery_code: '123456',
        session_duration_minutes: 10,
      };
      networkClient.retriableFetchSDK.mockReturnValue(MOCK_AUTHENTICATE_PAYLOAD);

      await expect(client.recover(recoveryOptions)).resolves.toEqual(MOCK_AUTHENTICATE_RETURN_VALUE);

      expect(subscriptionService.updateSession).toHaveBeenCalledWith(updateSessionExpect());

      expect(networkClient.retriableFetchSDK).toHaveBeenCalledWith({
        url: '/totps/recover',
        method: 'POST',
        body: {
          recovery_code: '123456',
          session_duration_minutes: 10,
          captcha_token: MOCK_CAPTCHA,
        },
        retryCallback: expect.any(Function),
      });
    });
    it('Calls the recover method with dfp protected auth', async () => {
      const recoveryOptions = {
        recovery_code: '123456',
        session_duration_minutes: 10,
      };
      client = new HeadlessTOTPClient(networkClient, subscriptionService, MockDFPProtectedAuthDFPOnly());
      networkClient.retriableFetchSDK.mockReturnValue(MOCK_AUTHENTICATE_PAYLOAD);

      await expect(client.recover(recoveryOptions)).resolves.toEqual(MOCK_AUTHENTICATE_RETURN_VALUE);

      expect(subscriptionService.updateSession).toHaveBeenCalledWith(updateSessionExpect());

      expect(networkClient.retriableFetchSDK).toHaveBeenCalledWith({
        url: '/totps/recover',
        method: 'POST',
        body: {
          recovery_code: '123456',
          session_duration_minutes: 10,
          dfp_telemetry_id: MOCK_DFP_TELEMTRY_ID,
        },
        retryCallback: expect.any(Function),
      });
    });
  });
});
