import { MOCK_REQUEST_ID } from '@stytch/internal-mocks';

import { HeadlessB2BSCIMClient } from '../..';
import { StytchProjectConfigurationInput } from '../../public/typeConfig';
import { createB2BTestFixtures } from '../../testing';

const MOCK_SCIM_CONNECTION_ID = 'mock-scim-connection-id-123';

describe('HeadlessB2BSCIMClient', () => {
  const { networkClient, subscriptionService } = createB2BTestFixtures();
  let client: HeadlessB2BSCIMClient<StytchProjectConfigurationInput>;

  beforeAll(() => {
    client = new HeadlessB2BSCIMClient(networkClient, subscriptionService);
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('scim.getConnection', () => {
    it('Calls the backend API and returns the response', async () => {
      networkClient.fetchSDK.mockReturnValue({
        connection: 'mock-connection',
        request_id: MOCK_REQUEST_ID,
        status_code: 200,
      });

      await expect(client.getConnection()).resolves.toEqual({
        connection: 'mock-connection',
        request_id: MOCK_REQUEST_ID,
        status_code: 200,
      });

      expect(networkClient.fetchSDK).toHaveBeenCalledWith({
        method: 'GET',
        url: '/b2b/scim',
      });
    });
  });

  describe('scim.deleteConnection', () => {
    it('Calls the backend API and returns the response', async () => {
      networkClient.fetchSDK.mockReturnValue({
        connection_id: MOCK_SCIM_CONNECTION_ID,
        request_id: MOCK_REQUEST_ID,
        status_code: 200,
      });

      await expect(client.deleteConnection('mock-connection-id')).resolves.toEqual({
        connection_id: MOCK_SCIM_CONNECTION_ID,
        request_id: MOCK_REQUEST_ID,
        status_code: 200,
      });

      expect(networkClient.fetchSDK).toHaveBeenCalledWith({
        method: 'DELETE',
        url: '/b2b/scim/mock-connection-id',
      });
    });
  });

  describe('scim.createConnection', () => {
    it('Calls the backend API and returns the response', async () => {
      networkClient.fetchSDK.mockReturnValue({
        connection: 'mock-connection',
        request_id: MOCK_REQUEST_ID,
        status_code: 200,
      });

      await expect(
        client.createConnection({ display_name: 'My Connection', identity_provider: 'okta' }),
      ).resolves.toEqual({
        connection: 'mock-connection',
        request_id: MOCK_REQUEST_ID,
        status_code: 200,
      });

      expect(networkClient.fetchSDK).toHaveBeenCalledWith({
        method: 'POST',
        url: '/b2b/scim',
        body: {
          display_name: 'My Connection',
          identity_provider: 'okta',
        },
      });
    });
  });

  describe('scim.updateConnection', () => {
    it('Calls the backend API and returns the response', async () => {
      networkClient.fetchSDK.mockReturnValue({
        connection: 'mock-connection',
        request_id: MOCK_REQUEST_ID,
        status_code: 200,
      });

      await expect(
        client.updateConnection({
          connection_id: MOCK_SCIM_CONNECTION_ID,
          display_name: 'new display name',
          identity_provider: 'rippling',
          scim_group_implicit_role_assignments: [
            {
              group_id: 'mock-group-id',
              role_id: 'mock-role-id',
            },
          ],
        }),
      ).resolves.toEqual({
        connection: 'mock-connection',
        request_id: MOCK_REQUEST_ID,
        status_code: 200,
      });

      expect(networkClient.fetchSDK).toHaveBeenCalledWith({
        method: 'PUT',
        url: `/b2b/scim/${MOCK_SCIM_CONNECTION_ID}`,
        body: {
          connection_id: MOCK_SCIM_CONNECTION_ID,
          display_name: 'new display name',
          identity_provider: 'rippling',
          scim_group_implicit_role_assignments: [
            {
              group_id: 'mock-group-id',
              role_id: 'mock-role-id',
            },
          ],
        },
      });
    });
  });

  describe('rotateStart', () => {
    it('Calls the backend API to start token rotation', async () => {
      networkClient.fetchSDK.mockReturnValue({
        request_id: MOCK_REQUEST_ID,
        status_code: 200,
      });

      await expect(client.rotateStart(MOCK_SCIM_CONNECTION_ID)).resolves.toEqual({
        request_id: MOCK_REQUEST_ID,
        status_code: 200,
      });

      expect(networkClient.fetchSDK).toHaveBeenCalledWith({
        method: 'POST',
        url: `/b2b/scim/rotate/start`,
        body: { connection_id: MOCK_SCIM_CONNECTION_ID },
      });
    });
  });

  describe('rotateComplete', () => {
    it('Calls the backend API to complete token rotation', async () => {
      networkClient.fetchSDK.mockReturnValue({
        request_id: MOCK_REQUEST_ID,
        status_code: 200,
      });

      await expect(client.rotateComplete(MOCK_SCIM_CONNECTION_ID)).resolves.toEqual({
        request_id: MOCK_REQUEST_ID,
        status_code: 200,
      });

      expect(networkClient.fetchSDK).toHaveBeenCalledWith({
        method: 'POST',
        url: `/b2b/scim/rotate/complete`,
        body: { connection_id: MOCK_SCIM_CONNECTION_ID },
      });
    });
  });

  describe('rotateCancel', () => {
    it('Calls the backend API to cancel token rotation', async () => {
      networkClient.fetchSDK.mockReturnValue({
        request_id: MOCK_REQUEST_ID,
        status_code: 200,
      });

      await expect(client.rotateCancel(MOCK_SCIM_CONNECTION_ID)).resolves.toEqual({
        request_id: MOCK_REQUEST_ID,
        status_code: 200,
      });

      expect(networkClient.fetchSDK).toHaveBeenCalledWith({
        method: 'POST',
        url: `/b2b/scim/rotate/cancel`,
        body: { connection_id: MOCK_SCIM_CONNECTION_ID },
      });
    });
  });

  describe('scim.getConnectionGroups', () => {
    it('Calls the backend API and returns the response', async () => {
      networkClient.fetchSDK.mockReturnValue({
        next_cursor: 'mock-next-cursor',
        scim_groups: 'mock-scim-groups',
        request_id: MOCK_REQUEST_ID,
        status_code: 200,
      });

      await expect(
        client.getConnectionGroups({
          limit: 1,
          cursor: 'mock-cursor',
        }),
      ).resolves.toEqual({
        next_cursor: 'mock-next-cursor',
        scim_groups: 'mock-scim-groups',
        request_id: MOCK_REQUEST_ID,
        status_code: 200,
      });

      expect(networkClient.fetchSDK).toHaveBeenCalledWith({
        method: 'POST',
        url: `/b2b/scim/groups`,
        body: {
          limit: 1,
          cursor: 'mock-cursor',
        },
      });
    });
  });
});
