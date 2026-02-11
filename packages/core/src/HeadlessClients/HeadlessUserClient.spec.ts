import { HeadlessUserClient } from './HeadlessUserClient';
import { MOCK_USER, MOCK_REQUEST_ID } from '@stytch/internal-mocks';
import { createTestFixtures } from '../testing';
import { StytchProjectConfigurationInput } from '../public/typeConfig';
import { UserUpdateOptions } from '../public';

describe('HeadlessUserClient', () => {
  const { networkClient, subscriptionService } = createTestFixtures();
  let client: HeadlessUserClient<StytchProjectConfigurationInput>;

  beforeAll(() => {
    client = new HeadlessUserClient(networkClient, subscriptionService);
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('get', () => {
    it('Calls the backend API and strips out the request ID and status code', async () => {
      networkClient.fetchSDK.mockResolvedValueOnce({
        ...MOCK_USER,
        request_id: MOCK_REQUEST_ID,
        status_code: 200,
      });

      await expect(client.get()).resolves.toEqual(MOCK_USER);

      expect(subscriptionService.updateUser).toHaveBeenCalledWith(MOCK_USER);

      expect(networkClient.fetchSDK).toHaveBeenCalledWith({
        url: '/users/me',
        method: 'GET',
      });
    });
  });

  describe('update', () => {
    it('Calls the backend API and returns the response', async () => {
      networkClient.fetchSDK.mockReturnValue({
        __user: MOCK_USER,
        request_id: MOCK_REQUEST_ID,
        status_code: 200,
      });

      const payload = {
        name: { first_name: 'Test' },
        untrusted_metadata: { locale: 'EN' },
      };

      await expect(client.update(payload)).resolves.toEqual({
        request_id: MOCK_REQUEST_ID,
        status_code: 200,
      });

      expect(subscriptionService.updateUser).toHaveBeenCalledWith(MOCK_USER);

      expect(networkClient.fetchSDK).toHaveBeenCalledWith({
        url: '/users/me',
        body: payload,
        method: 'PUT',
      });
    });

    it('Throws a helpful error when scopes are not an array', async () => {
      const opts = {
        untrusted_metadata: ['not', 'an', 'obj'],
      } as unknown as UserUpdateOptions;
      await expect(() => client.update(opts)).rejects.toThrow(/untrusted_metadata must be an object/);
    });
  });

  describe('deleteEmail', () => {
    it('Calls the backend API and returns the response', async () => {
      networkClient.fetchSDK.mockReturnValue({
        __user: MOCK_USER,
        request_id: MOCK_REQUEST_ID,
        status_code: 200,
      });

      await expect(client.deleteEmail('mock-email-id')).resolves.toEqual({
        request_id: MOCK_REQUEST_ID,
        status_code: 200,
      });

      expect(subscriptionService.updateUser).toHaveBeenCalledWith(MOCK_USER);

      expect(networkClient.fetchSDK).toHaveBeenCalledWith({
        url: `/users/emails/mock-email-id`,
        method: 'DELETE',
      });
    });
  });

  describe('deletePhoneNumber', () => {
    it('Calls the backend API and returns the response', async () => {
      networkClient.fetchSDK.mockReturnValue({
        __user: MOCK_USER,
        request_id: MOCK_REQUEST_ID,
        status_code: 200,
      });

      await expect(client.deletePhoneNumber('mock-phone-id')).resolves.toEqual({
        request_id: MOCK_REQUEST_ID,
        status_code: 200,
      });

      expect(subscriptionService.updateUser).toHaveBeenCalledWith(MOCK_USER);

      expect(networkClient.fetchSDK).toHaveBeenCalledWith({
        url: `/users/phone_numbers/mock-phone-id`,
        method: 'DELETE',
      });
    });
  });

  describe('deleteTOTP', () => {
    it('Calls the backend API and returns the response', async () => {
      networkClient.fetchSDK.mockReturnValue({
        __user: MOCK_USER,
        request_id: MOCK_REQUEST_ID,
        status_code: 200,
      });

      await expect(client.deleteTOTP('mock-totp-id')).resolves.toEqual({
        request_id: MOCK_REQUEST_ID,
        status_code: 200,
      });

      expect(subscriptionService.updateUser).toHaveBeenCalledWith(MOCK_USER);

      expect(networkClient.fetchSDK).toHaveBeenCalledWith({
        url: `/users/totps/mock-totp-id`,
        method: 'DELETE',
      });
    });
  });

  describe('deleteCryptoWallet', () => {
    it('Calls the backend API and returns the response', async () => {
      networkClient.fetchSDK.mockReturnValue({
        __user: MOCK_USER,
        request_id: MOCK_REQUEST_ID,
        status_code: 200,
      });

      await expect(client.deleteCryptoWallet('mock-crypto-wallet-id')).resolves.toEqual({
        request_id: MOCK_REQUEST_ID,
        status_code: 200,
      });

      expect(subscriptionService.updateUser).toHaveBeenCalledWith(MOCK_USER);

      expect(networkClient.fetchSDK).toHaveBeenCalledWith({
        url: `/users/crypto_wallets/mock-crypto-wallet-id`,
        method: 'DELETE',
      });
    });
  });

  describe('deleteWebauthnRegistration', () => {
    it('Calls the backend API and returns the response', async () => {
      networkClient.fetchSDK.mockReturnValue({
        __user: MOCK_USER,
        request_id: MOCK_REQUEST_ID,
        status_code: 200,
      });

      await expect(client.deleteWebauthnRegistration('mock-webauthn-id')).resolves.toEqual({
        request_id: MOCK_REQUEST_ID,
        status_code: 200,
      });

      expect(subscriptionService.updateUser).toHaveBeenCalledWith(MOCK_USER);

      expect(networkClient.fetchSDK).toHaveBeenCalledWith({
        url: `/users/webauthn_registrations/mock-webauthn-id`,
        method: 'DELETE',
      });
    });
  });

  describe('deleteOAuthRegistration', () => {
    it('Calls the backend API and returns the response', async () => {
      networkClient.fetchSDK.mockReturnValue({
        __user: MOCK_USER,
        request_id: MOCK_REQUEST_ID,
        status_code: 200,
      });

      await expect(client.deleteOAuthRegistration('mock-oauth-id')).resolves.toEqual({
        request_id: MOCK_REQUEST_ID,
        status_code: 200,
      });

      expect(subscriptionService.updateUser).toHaveBeenCalledWith(MOCK_USER);

      expect(networkClient.fetchSDK).toHaveBeenCalledWith({
        url: `/users/oauth/mock-oauth-id`,
        method: 'DELETE',
      });
    });
  });

  describe('deleteBiometricRegistration', () => {
    it('Calls the backend API and returns the response', async () => {
      networkClient.fetchSDK.mockReturnValue({
        __user: MOCK_USER,
        request_id: MOCK_REQUEST_ID,
        status_code: 200,
      });

      await expect(client.deleteBiometricRegistration('mock-biometric-id')).resolves.toEqual({
        request_id: MOCK_REQUEST_ID,
        status_code: 200,
      });

      expect(subscriptionService.updateUser).toHaveBeenCalledWith(MOCK_USER);

      expect(networkClient.fetchSDK).toHaveBeenCalledWith({
        url: `/users/biometric_registrations/mock-biometric-id`,
        method: 'DELETE',
      });
    });
  });
});
