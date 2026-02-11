import { HeadlessB2BRBACClient, RBACPolicyRaw, RBACPolicyRole } from '../..';
import { Organization } from '../../public/b2b/common';
import { StytchProjectConfigurationInput } from '../../public/typeConfig';
import { createB2BTestFixtures } from '../../testing';

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
      role_id: 'organization_admin',
      description: '',
      permissions: [{ actions: ['*'], resource_id: 'documents' }],
    },
    {
      role_id: 'reader',
      description: '',
      permissions: [{ actions: ['read'], resource_id: 'documents' }],
    },
  ],
  scopes: [],
};

const MOCK_CUSTOM_ROLES: RBACPolicyRole[] = [
  {
    role_id: 'custom_org_role',
    description: 'Custom organization role',
    permissions: [{ actions: ['create', 'write'], resource_id: 'documents' }],
  },
];

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
      role_id: 'organization_admin',
      description: '',
      permissions: [{ actions: ['*'], resource_id: 'documents' }],
    },
  ],
  scopes: [],
};

describe('HeadlessB2BRBACClient', () => {
  const { subscriptionService } = createB2BTestFixtures();
  let client: HeadlessB2BRBACClient<StytchProjectConfigurationInput>;

  const MockCachedConfig = {
    rbacPolicy: MOCK_RBAC_POLICY_WITHOUT_DEFAULT_ROLE,
  };

  const MockDynamicConfig = Promise.resolve({
    rbacPolicy: MOCK_RBAC_POLICY,
  });

  beforeEach(() => {
    client = new HeadlessB2BRBACClient(MockCachedConfig, MockDynamicConfig, subscriptionService);
  });

  const mockLoggedOutMember = () => {
    subscriptionService.getSession.mockReturnValue(null);
    subscriptionService.getOrganization.mockReturnValue(null);
  };

  const mockMemberWithRoles = (...roles: string[]) => {
    subscriptionService.getSession.mockReturnValue({ roles } as any);
    subscriptionService.getOrganization.mockReturnValue(null);
  };

  const mockOrganizationWithCustomRoles = (customRoles: RBACPolicyRole[]) => {
    subscriptionService.getOrganization.mockReturnValue({
      organization_id: 'org_123',
      organization_name: 'Test Org',
      custom_roles: customRoles,
    } as Organization);
  };

  describe('allPermissions', () => {
    it('Calculates permissions for a logged-out member', async () => {
      mockLoggedOutMember();
      const allPerms = await client.allPermissions();
      expect(allPerms).toEqual({
        documents: { create: false, delete: false, read: false, write: false },
      });
    });

    it('Calculates permissions for a default member', async () => {
      mockMemberWithRoles('default');
      const allPerms = await client.allPermissions();
      expect(allPerms).toEqual({
        documents: { create: false, delete: false, read: true, write: false },
      });
    });

    it('Calculates permissions for an admin member', async () => {
      mockMemberWithRoles('organization_admin');
      const allPerms = await client.allPermissions();
      expect(allPerms).toEqual({
        documents: { create: true, delete: true, read: true, write: true },
      });
    });
  });

  describe('isAuthorizedSync', () => {
    it('Calculates permissions for a logged-out member', async () => {
      mockLoggedOutMember();
      const isAuthorized = client.isAuthorizedSync('documents', 'read');
      expect(isAuthorized).toEqual(false);
    });

    it('Updates the cached policy with the new policy when it becomes available', async () => {
      client = new HeadlessB2BRBACClient(MockCachedConfig, MockDynamicConfig, subscriptionService);
      mockMemberWithRoles('default');
      const isAuthorizedCached = client.isAuthorizedSync('documents', 'read');
      expect(isAuthorizedCached).toEqual(false);
      await new Promise((tick) => setInterval(tick, 0));
      const isAuthorizedFresh = client.isAuthorizedSync('documents', 'read');
      expect(isAuthorizedFresh).toEqual(true);
    });

    it('Calculates permissions for an admin member', async () => {
      mockMemberWithRoles('organization_admin');
      const isAuthorizedToRead = client.isAuthorizedSync('documents', 'read');
      expect(isAuthorizedToRead).toEqual(true);
      const isAuthorizedToDelete = client.isAuthorizedSync('documents', 'delete');
      expect(isAuthorizedToDelete).toEqual(true);
    });
  });

  describe('isAuthorized', () => {
    it('Calculates permissions for a logged-out member', async () => {
      mockLoggedOutMember();
      const isAuthorized = await client.isAuthorized('documents', 'read');
      expect(isAuthorized).toEqual(false);
    });

    it('Calculates permissions for a default member', async () => {
      mockMemberWithRoles('default');
      const isAuthorizedToRead = await client.isAuthorized('documents', 'read');
      expect(isAuthorizedToRead).toEqual(true);
      const isAuthorizedToDelete = await client.isAuthorized('documents', 'delete');
      expect(isAuthorizedToDelete).toEqual(false);
    });

    it('Calculates permissions for an admin member', async () => {
      mockMemberWithRoles('organization_admin');
      const isAuthorizedToRead = await client.isAuthorized('documents', 'read');
      expect(isAuthorizedToRead).toEqual(true);
      const isAuthorizedToDelete = await client.isAuthorized('documents', 'delete');
      expect(isAuthorizedToDelete).toEqual(true);
    });
  });

  describe('Organization custom roles', () => {
    describe('isAuthorized with custom roles', () => {
      it('Merges custom roles from organization object', async () => {
        mockMemberWithRoles('custom_org_role');
        mockOrganizationWithCustomRoles(MOCK_CUSTOM_ROLES);

        const isAuthorizedToCreate = await client.isAuthorized('documents', 'create');
        expect(isAuthorizedToCreate).toEqual(true);

        const isAuthorizedToWrite = await client.isAuthorized('documents', 'write');
        expect(isAuthorizedToWrite).toEqual(true);

        // Should not be authorized for actions not in custom role
        const isAuthorizedToDelete = await client.isAuthorized('documents', 'delete');
        expect(isAuthorizedToDelete).toEqual(false);
      });

      it('Uses only project policy when custom_roles is empty array', async () => {
        mockMemberWithRoles('organization_admin');
        mockOrganizationWithCustomRoles([]);

        const isAuthorized = await client.isAuthorized('documents', 'delete');
        expect(isAuthorized).toEqual(true);
      });

      it('Uses only project policy when no organization is set', async () => {
        mockMemberWithRoles('organization_admin');

        const isAuthorized = await client.isAuthorized('documents', 'delete');
        expect(isAuthorized).toEqual(true);
      });
    });

    describe('isAuthorizedSync with custom roles', () => {
      it('Uses custom roles from organization object synchronously', () => {
        mockMemberWithRoles('custom_org_role');
        mockOrganizationWithCustomRoles(MOCK_CUSTOM_ROLES);

        const isAuthorizedToCreate = client.isAuthorizedSync('documents', 'create');
        expect(isAuthorizedToCreate).toEqual(true);

        const isAuthorizedToWrite = client.isAuthorizedSync('documents', 'write');
        expect(isAuthorizedToWrite).toEqual(true);
      });

      it('Falls back to project policy when custom_roles is empty array', () => {
        mockMemberWithRoles('organization_admin');
        mockOrganizationWithCustomRoles([]);

        const isAuthorized = client.isAuthorizedSync('documents', 'delete');
        expect(isAuthorized).toEqual(true);
      });
    });

    describe('allPermissions with custom roles', () => {
      it('Includes permissions from merged custom roles', async () => {
        mockMemberWithRoles('custom_org_role');
        mockOrganizationWithCustomRoles(MOCK_CUSTOM_ROLES);

        const allPerms = await client.allPermissions();
        expect(allPerms).toEqual({
          documents: { create: true, delete: false, read: false, write: true },
        });
      });

      it('Combines permissions from both project and custom roles', async () => {
        mockMemberWithRoles('reader', 'custom_org_role');
        mockOrganizationWithCustomRoles(MOCK_CUSTOM_ROLES);

        const allPerms = await client.allPermissions();
        expect(allPerms).toEqual({
          documents: { create: true, delete: false, read: true, write: true },
        });
      });
    });
  });
});
