import { MOCK_MEMBER, MOCK_MEMBER_COMMON_RESPONSE, MOCK_ORGANIZATION, MOCK_REQUEST_ID } from '@stytch/internal-mocks';

import { StytchProjectConfigurationInput } from '../../public/typeConfig';
import { createB2BTestFixtures } from '../../testing';
import { HeadlessB2BOrganizationClient } from './HeadlessB2BOrganizationClient';

describe('HeadlessB2BOrganizationClient', () => {
  const { networkClient, apiNetworkClient, subscriptionService } = createB2BTestFixtures();
  let client: HeadlessB2BOrganizationClient<StytchProjectConfigurationInput>;

  beforeAll(() => {
    client = new HeadlessB2BOrganizationClient(networkClient, apiNetworkClient, subscriptionService);
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('get', () => {
    it('Calls the backend API and strips out the request ID and status code', async () => {
      networkClient.fetchSDK.mockResolvedValue({
        organization: MOCK_ORGANIZATION,
        request_id: MOCK_REQUEST_ID,
        status_code: 200,
      });

      await expect(client.get()).resolves.toEqual(MOCK_ORGANIZATION);

      expect(networkClient.fetchSDK).toHaveBeenCalledWith({
        url: `/b2b/organizations/me`,
        method: 'GET',
      });
    });
  });

  describe('update', () => {
    it('Calls the backend API', async () => {
      networkClient.fetchSDK.mockResolvedValue({
        organization: MOCK_ORGANIZATION,
        request_id: MOCK_REQUEST_ID,
        status_code: 200,
      });

      await expect(client.update({ organization_name: 'new name' })).resolves.toEqual({
        organization: MOCK_ORGANIZATION,
        request_id: MOCK_REQUEST_ID,
        status_code: 200,
      });

      expect(networkClient.fetchSDK).toHaveBeenCalledWith({
        url: `/b2b/organizations/me`,
        method: 'PUT',
        body: { organization_name: 'new name' },
      });

      expect(subscriptionService.updateOrganization).toHaveBeenCalledWith(MOCK_ORGANIZATION);
    });
  });

  describe('delete', () => {
    it('Calls the backend API and destroys the logged-in state', async () => {
      networkClient.fetchSDK.mockResolvedValue({
        organization_id: MOCK_ORGANIZATION.organization_id,
        request_id: MOCK_REQUEST_ID,
        status_code: 200,
      });

      await expect(client.delete()).resolves.toEqual({
        organization_id: MOCK_ORGANIZATION.organization_id,
        request_id: MOCK_REQUEST_ID,
        status_code: 200,
      });

      expect(networkClient.fetchSDK).toHaveBeenCalledWith({
        url: `/b2b/organizations/me`,
        method: 'DELETE',
      });

      expect(subscriptionService.destroyState).toHaveBeenCalled();
    });
  });

  describe('getBySlug', () => {
    it('Calls the backend API', async () => {
      networkClient.fetchSDK.mockResolvedValue(MOCK_ORGANIZATION);

      await expect(client.getBySlug({ organization_slug: 'slug' })).resolves.toEqual(MOCK_ORGANIZATION);

      expect(networkClient.fetchSDK).toHaveBeenCalledWith({
        url: `/b2b/organizations/search`,
        method: 'POST',
        body: { organization_slug: 'slug' },
      });
    });
  });

  describe('members', () => {
    describe('create', () => {
      it('Calls the backend API', async () => {
        networkClient.fetchSDK.mockResolvedValue(MOCK_MEMBER_COMMON_RESPONSE);

        await expect(client.members.create({ email_address: 'email@example.com' })).resolves.toEqual(
          MOCK_MEMBER_COMMON_RESPONSE,
        );

        expect(networkClient.fetchSDK).toHaveBeenCalledWith({
          url: `/b2b/organizations/members`,
          method: 'POST',
          body: { email_address: 'email@example.com' },
        });
      });
    });

    describe('update', () => {
      it('Calls the backend API', async () => {
        networkClient.fetchSDK.mockResolvedValue(MOCK_MEMBER_COMMON_RESPONSE);

        await expect(
          client.members.update({
            member_id: MOCK_MEMBER.member_id,
            name: 'New Name',
          }),
        ).resolves.toEqual(MOCK_MEMBER_COMMON_RESPONSE);

        expect(networkClient.fetchSDK).toHaveBeenCalledWith({
          url: `/b2b/organizations/members/${MOCK_MEMBER.member_id}`,
          method: 'PUT',
          body: { member_id: MOCK_MEMBER.member_id, name: 'New Name' },
        });
      });

      it('Updates member data in subscription service if member is self', async () => {
        networkClient.fetchSDK.mockResolvedValue(MOCK_MEMBER_COMMON_RESPONSE);
        subscriptionService.getMember.mockReturnValue(MOCK_MEMBER);

        await expect(
          client.members.update({
            member_id: MOCK_MEMBER.member_id,
            name: 'New Name',
          }),
        ).resolves.toEqual(MOCK_MEMBER_COMMON_RESPONSE);

        expect(subscriptionService.updateMember).toHaveBeenCalledWith(MOCK_MEMBER);
      });

      it('Does not update member data if member is not self', async () => {
        networkClient.fetchSDK.mockResolvedValue(MOCK_MEMBER_COMMON_RESPONSE);
        subscriptionService.getMember.mockReturnValue({ ...MOCK_MEMBER, member_id: 'different-id' });

        await expect(
          client.members.update({
            member_id: MOCK_MEMBER.member_id,
            name: 'New Name',
          }),
        ).resolves.toEqual(MOCK_MEMBER_COMMON_RESPONSE);

        expect(subscriptionService.updateMember).not.toHaveBeenCalled();
      });
    });

    describe('deletePassword', () => {
      it('Calls the backend API', async () => {
        networkClient.fetchSDK.mockResolvedValue(MOCK_MEMBER_COMMON_RESPONSE);

        await expect(client.members.deletePassword(MOCK_MEMBER.member_password_id)).resolves.toEqual(
          MOCK_MEMBER_COMMON_RESPONSE,
        );

        expect(networkClient.fetchSDK).toHaveBeenCalledWith({
          url: `/b2b/organizations/members/passwords/${MOCK_MEMBER.member_password_id}`,
          method: 'DELETE',
        });
      });

      it('Updates member data in subscription service if member is self', async () => {
        networkClient.fetchSDK.mockResolvedValue(MOCK_MEMBER_COMMON_RESPONSE);
        subscriptionService.getMember.mockReturnValue(MOCK_MEMBER);

        await expect(client.members.deletePassword(MOCK_MEMBER.member_password_id)).resolves.toEqual(
          MOCK_MEMBER_COMMON_RESPONSE,
        );

        expect(subscriptionService.updateMember).toHaveBeenCalledWith(MOCK_MEMBER);
      });

      it('Does not update member data if member is not self', async () => {
        networkClient.fetchSDK.mockResolvedValue(MOCK_MEMBER_COMMON_RESPONSE);
        subscriptionService.getMember.mockReturnValue({ ...MOCK_MEMBER, member_id: 'different-id' });

        await expect(client.members.deletePassword(MOCK_MEMBER.member_password_id)).resolves.toEqual(
          MOCK_MEMBER_COMMON_RESPONSE,
        );

        expect(subscriptionService.updateMember).not.toHaveBeenCalled();
      });
    });

    describe('deleteMFAPhoneNumber', () => {
      it('Calls the backend API', async () => {
        networkClient.fetchSDK.mockResolvedValue(MOCK_MEMBER_COMMON_RESPONSE);

        await expect(client.members.deleteMFAPhoneNumber(MOCK_MEMBER.member_id)).resolves.toEqual(
          MOCK_MEMBER_COMMON_RESPONSE,
        );

        expect(networkClient.fetchSDK).toHaveBeenCalledWith({
          url: `/b2b/organizations/members/mfa_phone_numbers/${MOCK_MEMBER.member_id}`,
          method: 'DELETE',
        });
      });

      it('Updates member data in subscription service if member is self', async () => {
        networkClient.fetchSDK.mockResolvedValue(MOCK_MEMBER_COMMON_RESPONSE);
        subscriptionService.getMember.mockReturnValue(MOCK_MEMBER);

        await expect(client.members.deleteMFAPhoneNumber(MOCK_MEMBER.member_id)).resolves.toEqual(
          MOCK_MEMBER_COMMON_RESPONSE,
        );

        expect(subscriptionService.updateMember).toHaveBeenCalledWith(MOCK_MEMBER);
      });

      it('Does not update member data if member is not self', async () => {
        networkClient.fetchSDK.mockResolvedValue(MOCK_MEMBER_COMMON_RESPONSE);
        subscriptionService.getMember.mockReturnValue({ ...MOCK_MEMBER, member_id: 'different-id' });

        await expect(client.members.deleteMFAPhoneNumber(MOCK_MEMBER.member_id)).resolves.toEqual(
          MOCK_MEMBER_COMMON_RESPONSE,
        );

        expect(subscriptionService.updateMember).not.toHaveBeenCalled();
      });
    });

    describe('deleteMFATOTP', () => {
      it('Calls the backend API', async () => {
        networkClient.fetchSDK.mockResolvedValue(MOCK_MEMBER_COMMON_RESPONSE);

        await expect(client.members.deleteMFATOTP(MOCK_MEMBER.member_id)).resolves.toEqual(MOCK_MEMBER_COMMON_RESPONSE);

        expect(networkClient.fetchSDK).toHaveBeenCalledWith({
          url: `/b2b/organizations/members/totp/${MOCK_MEMBER.member_id}`,
          method: 'DELETE',
        });
      });

      it('Updates member data in subscription service if member is self', async () => {
        networkClient.fetchSDK.mockResolvedValue(MOCK_MEMBER_COMMON_RESPONSE);
        subscriptionService.getMember.mockReturnValue(MOCK_MEMBER);

        await expect(client.members.deleteMFATOTP(MOCK_MEMBER.member_id)).resolves.toEqual(MOCK_MEMBER_COMMON_RESPONSE);

        expect(subscriptionService.updateMember).toHaveBeenCalledWith(MOCK_MEMBER);
      });

      it('Does not update member data if member is not self', async () => {
        networkClient.fetchSDK.mockResolvedValue(MOCK_MEMBER_COMMON_RESPONSE);
        subscriptionService.getMember.mockReturnValue({ ...MOCK_MEMBER, member_id: 'different-id' });

        await expect(client.members.deleteMFATOTP(MOCK_MEMBER.member_id)).resolves.toEqual(MOCK_MEMBER_COMMON_RESPONSE);

        expect(subscriptionService.updateMember).not.toHaveBeenCalled();
      });
    });

    describe('delete', () => {
      it('Calls the backend API', async () => {
        networkClient.fetchSDK.mockResolvedValue({
          member_id: MOCK_MEMBER.member_id,
          request_id: MOCK_REQUEST_ID,
          status_code: 200,
        });

        await expect(client.members.delete(MOCK_MEMBER.member_id)).resolves.toEqual({
          member_id: MOCK_MEMBER.member_id,
          request_id: MOCK_REQUEST_ID,
          status_code: 200,
        });

        expect(networkClient.fetchSDK).toHaveBeenCalledWith({
          url: `/b2b/organizations/members/${MOCK_MEMBER.member_id}`,
          method: 'DELETE',
        });
      });

      it('Destroys state if deleted member is self', async () => {
        networkClient.fetchSDK.mockResolvedValue(MOCK_MEMBER_COMMON_RESPONSE);
        subscriptionService.getMember.mockReturnValue(MOCK_MEMBER);

        await expect(client.members.delete(MOCK_MEMBER.member_id)).resolves.toEqual(MOCK_MEMBER_COMMON_RESPONSE);

        expect(subscriptionService.destroyState).toHaveBeenCalled();
      });

      it('Does not destroy state if deleted member is not self', async () => {
        networkClient.fetchSDK.mockResolvedValue(MOCK_MEMBER_COMMON_RESPONSE);
        subscriptionService.getMember.mockReturnValue({ ...MOCK_MEMBER, member_id: 'different-id' });

        await expect(client.members.delete(MOCK_MEMBER.member_id)).resolves.toEqual(MOCK_MEMBER_COMMON_RESPONSE);

        expect(subscriptionService.destroyState).not.toHaveBeenCalled();
      });
    });

    describe('reactivate', () => {
      it('Calls the backend API', async () => {
        networkClient.fetchSDK.mockResolvedValue(MOCK_MEMBER_COMMON_RESPONSE);

        await expect(client.members.reactivate(MOCK_MEMBER.member_id)).resolves.toEqual(MOCK_MEMBER_COMMON_RESPONSE);

        expect(networkClient.fetchSDK).toHaveBeenCalledWith({
          url: `/b2b/organizations/members/${MOCK_MEMBER.member_id}/reactivate`,
          method: 'PUT',
        });
      });
    });

    describe('unlinkRetiredEmail', () => {
      it('Calls the backend API', async () => {
        apiNetworkClient.fetchSDK.mockResolvedValue(MOCK_MEMBER_COMMON_RESPONSE);

        const mockRetiredEmailId = 'mock_retired_email_id';
        const mockRetiredEmailAddress = 'mock@testemail.com';
        const resp = await client.members.unlinkRetiredEmail({
          member_id: MOCK_MEMBER.member_id,
          email_id: mockRetiredEmailId,
          email_address: mockRetiredEmailAddress,
        });
        expect(resp).toEqual(MOCK_MEMBER_COMMON_RESPONSE);

        expect(apiNetworkClient.fetchSDK).toHaveBeenCalledWith({
          url: `/b2b/organizations/members/${MOCK_MEMBER.member_id}/unlink_retired_email`,
          method: 'POST',
          body: {
            email_id: mockRetiredEmailId,
            email_address: mockRetiredEmailAddress,
          },
        });
      });

      it('Updates member data in subscription service if member is self', async () => {
        apiNetworkClient.fetchSDK.mockResolvedValue(MOCK_MEMBER_COMMON_RESPONSE);
        subscriptionService.getMember.mockReturnValue(MOCK_MEMBER);

        await expect(
          client.members.unlinkRetiredEmail({
            member_id: MOCK_MEMBER.member_id,
            email_id: 'mock_retired_email_id',
            email_address: 'retired@example.com',
          }),
        ).resolves.toEqual(MOCK_MEMBER_COMMON_RESPONSE);

        expect(subscriptionService.updateMember).toHaveBeenCalledWith(MOCK_MEMBER);
      });

      it('Does not update member data if member is not self', async () => {
        apiNetworkClient.fetchSDK.mockResolvedValue(MOCK_MEMBER_COMMON_RESPONSE);
        subscriptionService.getMember.mockReturnValue({ ...MOCK_MEMBER, member_id: 'different-id' });

        await expect(
          client.members.unlinkRetiredEmail({
            member_id: MOCK_MEMBER.member_id,
            email_id: 'mock_retired_email_id',
            email_address: 'retired@example.com',
          }),
        ).resolves.toEqual(MOCK_MEMBER_COMMON_RESPONSE);

        expect(subscriptionService.updateMember).not.toHaveBeenCalled();
      });
    });

    describe('startEmailUpdate', () => {
      it('Calls the backend API', async () => {
        apiNetworkClient.fetchSDK.mockResolvedValue(MOCK_MEMBER_COMMON_RESPONSE);

        await expect(
          client.members.startEmailUpdate({
            member_id: MOCK_MEMBER.member_id,
            email_address: 'new@example.com',
          }),
        ).resolves.toEqual(MOCK_MEMBER_COMMON_RESPONSE);

        expect(apiNetworkClient.fetchSDK).toHaveBeenCalledWith({
          url: `/b2b/organizations/members/${MOCK_MEMBER.member_id}/start_email_update`,
          method: 'POST',
          body: { email_address: 'new@example.com' },
        });
      });

      it('Updates member data in subscription service if member is self', async () => {
        apiNetworkClient.fetchSDK.mockResolvedValue(MOCK_MEMBER_COMMON_RESPONSE);
        subscriptionService.getMember.mockReturnValue(MOCK_MEMBER);

        await expect(
          client.members.startEmailUpdate({
            member_id: MOCK_MEMBER.member_id,
            email_address: 'new@example.com',
          }),
        ).resolves.toEqual(MOCK_MEMBER_COMMON_RESPONSE);

        expect(subscriptionService.updateMember).toHaveBeenCalledWith(MOCK_MEMBER);
      });

      it('Does not update member data if member is not self', async () => {
        apiNetworkClient.fetchSDK.mockResolvedValue(MOCK_MEMBER_COMMON_RESPONSE);
        subscriptionService.getMember.mockReturnValue({ ...MOCK_MEMBER, member_id: 'different-id' });

        await expect(
          client.members.startEmailUpdate({
            member_id: MOCK_MEMBER.member_id,
            email_address: 'new@example.com',
          }),
        ).resolves.toEqual(MOCK_MEMBER_COMMON_RESPONSE);

        expect(subscriptionService.updateMember).not.toHaveBeenCalled();
      });
    });
  });
});
