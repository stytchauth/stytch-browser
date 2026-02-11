import { HeadlessRBACClient, RBACPolicyRaw } from '../';
import { StytchProjectConfigurationInput } from '../public/typeConfig';
import { createTestFixtures } from '../testing';

const MOCK_RBAC_POLICY: RBACPolicyRaw = {
  resources: [
    {
      resource_id: 'documents',
      description: '',
      actions: ['create', 'read', 'write', 'delete'],
    },
  ],
  roles: [
    {
      role_id: 'default',
      description: '',
      permissions: [{ actions: ['read'], resource_id: 'documents' }],
    },
    {
      role_id: 'all_docs',
      description: '',
      permissions: [{ actions: ['*'], resource_id: 'documents' }],
    },
  ],
  scopes: [],
};

const MOCK_RBAC_POLICY_WITHOUT_DEFAULT_ROLE: RBACPolicyRaw = {
  resources: [
    {
      resource_id: 'documents',
      description: '',
      actions: ['create', 'read', 'write', 'delete'],
    },
  ],
  roles: [
    {
      role_id: 'all_docs',
      description: '',
      permissions: [{ actions: ['*'], resource_id: 'documents' }],
    },
  ],
  scopes: [],
};

describe('HeadlessRBACClient', () => {
  const { subscriptionService } = createTestFixtures();
  let client: HeadlessRBACClient<StytchProjectConfigurationInput>;

  const MockCachedConfig = {
    rbacPolicy: MOCK_RBAC_POLICY_WITHOUT_DEFAULT_ROLE,
  };

  const MockDynamicConfig = Promise.resolve({
    rbacPolicy: MOCK_RBAC_POLICY,
  });

  beforeEach(() => {
    client = new HeadlessRBACClient(MockCachedConfig, MockDynamicConfig, subscriptionService);
  });

  const mockLoggedOutUser = () => {
    subscriptionService.getSession.mockReturnValue(null);
    subscriptionService.getUser.mockReturnValue(null);
  };

  const mockUserWithRoles = (...roles: string[]) => {
    subscriptionService.getSession.mockReturnValue({ roles });
    subscriptionService.getUser.mockReturnValue({ roles });
  };

  describe('allPermissions', () => {
    it('Calculates permissions for a logged-out user', async () => {
      mockLoggedOutUser();
      const allPerms = await client.allPermissions();
      expect(allPerms).toEqual({
        documents: { create: false, delete: false, read: false, write: false },
      });
    });

    it('Calculates permissions for a default user', async () => {
      mockUserWithRoles('default');
      const allPerms = await client.allPermissions();
      expect(allPerms).toEqual({
        documents: { create: false, delete: false, read: true, write: false },
      });
    });

    it('Calculates permissions for an all_Docs user', async () => {
      mockUserWithRoles('all_docs');
      const allPerms = await client.allPermissions();
      expect(allPerms).toEqual({
        documents: { create: true, delete: true, read: true, write: true },
      });
    });
  });

  describe('isAuthorizedSync', () => {
    it('Calculates permissions for a logged-out user', async () => {
      mockLoggedOutUser();
      const isAuthorized = client.isAuthorizedSync('documents', 'read');
      expect(isAuthorized).toEqual(false);
    });

    it('Updates the cached policy with the new policy when it becomes available', async () => {
      client = new HeadlessRBACClient(MockCachedConfig, MockDynamicConfig, subscriptionService);
      mockUserWithRoles('default');
      const isAuthorizedCached = client.isAuthorizedSync('documents', 'read');
      expect(isAuthorizedCached).toEqual(false);
      await new Promise((tick) => setInterval(tick, 0));
      const isAuthorizedFresh = client.isAuthorizedSync('documents', 'read');
      expect(isAuthorizedFresh).toEqual(true);
    });

    it('Calculates permissions for an all_docs user', async () => {
      mockUserWithRoles('all_docs');
      const isAuthorizedToRead = client.isAuthorizedSync('documents', 'read');
      expect(isAuthorizedToRead).toEqual(true);
      const isAuthorizedToDelete = client.isAuthorizedSync('documents', 'delete');
      expect(isAuthorizedToDelete).toEqual(true);
    });
  });

  describe('isAuthorized', () => {
    it('Calculates permissions for a logged-out user', async () => {
      mockLoggedOutUser();
      const isAuthorized = await client.isAuthorized('documents', 'read');
      expect(isAuthorized).toEqual(false);
    });

    it('Calculates permissions for a default user', async () => {
      mockUserWithRoles('default');
      const isAuthorizedToRead = await client.isAuthorized('documents', 'read');
      expect(isAuthorizedToRead).toEqual(true);
      const isAuthorizedToDelete = await client.isAuthorized('documents', 'delete');
      expect(isAuthorizedToDelete).toEqual(false);
    });

    it('Calculates permissions for an all_docs user', async () => {
      mockUserWithRoles('all_docs');
      const isAuthorizedToRead = await client.isAuthorized('documents', 'read');
      expect(isAuthorizedToRead).toEqual(true);
      const isAuthorizedToDelete = await client.isAuthorized('documents', 'delete');
      expect(isAuthorizedToDelete).toEqual(true);
    });
  });
});
