import { MOCK_MEMBER, MOCK_MEMBER_COMMON_RESPONSE, MOCK_REQUEST_ID } from '@stytch/internal-mocks';

import { StytchProjectConfigurationInput } from '../../public/typeConfig';
import { createB2BTestFixtures } from '../../testing';
import { HeadlessB2BSelfClient } from './HeadlessB2BSelfClient';

describe('HeadlessB2BSelfClient', () => {
  const { networkClient, apiNetworkClient, subscriptionService } = createB2BTestFixtures();
  let client: HeadlessB2BSelfClient<StytchProjectConfigurationInput>;

  beforeAll(() => {
    client = new HeadlessB2BSelfClient(networkClient, apiNetworkClient, subscriptionService);
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('get', () => {
    it('Calls the backend API and strips out the request ID and status code', async () => {
      networkClient.fetchSDK.mockResolvedValue({
        member: MOCK_MEMBER,
        request_id: MOCK_REQUEST_ID,
        status_code: 200,
      });

      await expect(client.get()).resolves.toEqual(MOCK_MEMBER);

      expect(subscriptionService.updateMember).toHaveBeenCalledWith(MOCK_MEMBER);

      expect(networkClient.fetchSDK).toHaveBeenCalledWith({
        url: `/b2b/organizations/members/me`,
        method: 'GET',
      });
    });
  });

  describe('update', () => {
    it('Calls the backend API', async () => {
      networkClient.fetchSDK.mockResolvedValueOnce(MOCK_MEMBER_COMMON_RESPONSE);
      const res = await client.update({
        name: 'joe',
        untrusted_metadata: { preferred_locale: 'es' },
        mfa_enrolled: true,
        mfa_phone_number: '+1234567890',
        default_mfa_method: 'sms_otp',
      });
      expect(res).toEqual(MOCK_MEMBER_COMMON_RESPONSE);

      expect(subscriptionService.updateMember).toHaveBeenCalledWith(MOCK_MEMBER);

      expect(networkClient.fetchSDK).toHaveBeenCalledWith({
        body: {
          name: 'joe',
          untrusted_metadata: { preferred_locale: 'es' },
          mfa_enrolled: true,
          mfa_phone_number: '+1234567890',
          default_mfa_method: 'sms_otp',
        },
        url: `/b2b/organizations/members/update`,
        method: 'PUT',
      });
    });
  });

  describe('delete phone number', () => {
    it('Calls the backend API', async () => {
      networkClient.fetchSDK.mockResolvedValueOnce(MOCK_MEMBER_COMMON_RESPONSE);
      const res = await client.deleteMFAPhoneNumber();
      expect(res).toEqual(MOCK_MEMBER_COMMON_RESPONSE);

      expect(subscriptionService.updateMember).toHaveBeenCalledWith(MOCK_MEMBER);

      expect(networkClient.fetchSDK).toHaveBeenCalledWith({
        url: `/b2b/organizations/members/deletePhoneNumber`,
        method: 'DELETE',
      });
    });
  });

  describe('delete member password', () => {
    it('Calls the backend API', async () => {
      networkClient.fetchSDK.mockResolvedValueOnce(MOCK_MEMBER_COMMON_RESPONSE);
      const res = await client.deletePassword('mock-password-id');
      expect(res).toEqual(MOCK_MEMBER_COMMON_RESPONSE);

      expect(subscriptionService.updateMember).toHaveBeenCalledWith(MOCK_MEMBER);

      expect(networkClient.fetchSDK).toHaveBeenCalledWith({
        url: `/b2b/organizations/members/passwords/mock-password-id`,
        method: 'DELETE',
      });
    });
  });

  describe('delete member totp', () => {
    it('Calls the backend API', async () => {
      networkClient.fetchSDK.mockResolvedValueOnce(MOCK_MEMBER_COMMON_RESPONSE);
      const res = await client.deleteMFATOTP();
      expect(res).toEqual(MOCK_MEMBER_COMMON_RESPONSE);

      expect(subscriptionService.updateMember).toHaveBeenCalledWith(MOCK_MEMBER);

      expect(networkClient.fetchSDK).toHaveBeenCalledWith({
        url: `/b2b/organizations/members/deleteTOTP`,
        method: 'DELETE',
      });
    });
  });

  describe('unlink retired email', () => {
    it('Calls the backend API', async () => {
      apiNetworkClient.fetchSDK.mockResolvedValueOnce(MOCK_MEMBER_COMMON_RESPONSE);

      const emailId = 'test_email_id';
      const emailAddress = 'test_email_address@fake.com';
      const res = await client.unlinkRetiredEmail({
        email_id: emailId,
        email_address: emailAddress,
      });
      expect(res).toEqual(MOCK_MEMBER_COMMON_RESPONSE);
      expect(subscriptionService.updateMember).toHaveBeenCalledWith(MOCK_MEMBER);
      expect(apiNetworkClient.fetchSDK).toHaveBeenCalledWith({
        url: '/b2b/organizations/members/unlink_retired_email',
        method: 'POST',
        body: {
          email_id: emailId,
          email_address: emailAddress,
        },
      });
    });
  });

  describe('start email update', () => {
    it('Calls the backend API', async () => {
      apiNetworkClient.fetchSDK.mockResolvedValueOnce(MOCK_MEMBER_COMMON_RESPONSE);

      const res = await client.startEmailUpdate({ email_address: 'new@example.com' });
      expect(res).toEqual(MOCK_MEMBER_COMMON_RESPONSE);
      expect(subscriptionService.updateMember).toHaveBeenCalledWith(MOCK_MEMBER);
      expect(apiNetworkClient.fetchSDK).toHaveBeenCalledWith({
        url: '/b2b/organizations/members/start_email_update',
        method: 'POST',
        body: { email_address: 'new@example.com' },
      });
    });
  });
});
