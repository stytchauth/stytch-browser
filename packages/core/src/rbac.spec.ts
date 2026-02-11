import { RBACPolicy, RBACPolicyRaw, RBACPolicyRole } from './rbac';

const MOCK_RBAC_POLICY: RBACPolicyRaw = {
  resources: [
    {
      resource_id: 'documents',
      description: '',
      actions: ['create', 'read', 'write', 'delete'],
    },
    {
      resource_id: 'images',
      description: '',
      actions: ['create', 'read', 'delete'],
    },
    {
      resource_id: 'secrets',
      description: '',
      actions: ['read'],
    },
  ],
  roles: [
    {
      role_id: 'default',
      description: '',
      permissions: [],
    },
    {
      role_id: 'organization_admin',
      description: '',
      permissions: [
        {
          actions: ['*'],
          resource_id: 'documents',
        },
        {
          actions: ['*'],
          resource_id: 'images',
        },
        {
          actions: ['*'],
          resource_id: 'secrets',
        },
      ],
    },
    {
      role_id: 'editor',
      description: '',
      permissions: [
        {
          actions: ['read', 'write'],
          resource_id: 'documents',
        },
        {
          actions: ['create', 'read', 'delete'],
          resource_id: 'images',
        },
      ],
    },
    {
      role_id: 'reader',
      description: '',
      permissions: [
        {
          actions: ['read'],
          resource_id: 'documents',
        },
        {
          actions: ['read'],
          resource_id: 'images',
        },
      ],
    },
  ],
  scopes: [],
};

describe('RBACPolicy', () => {
  const policy = RBACPolicy.fromJSON(MOCK_RBAC_POLICY);

  describe('callerIsAuthorized', () => {
    it.each([
      {
        name: 'Success case - exact match',
        subjectRoles: ['default', 'reader'],
        resourceId: 'documents',
        action: 'read',
        callerIsAuthorized: true,
      },
      {
        name: 'Success case - wildcard match',
        subjectRoles: ['default', 'organization_admin'],
        resourceId: 'documents',
        action: 'read',
        callerIsAuthorized: true,
      },
      {
        name: 'Success case - multiple matches',
        subjectRoles: ['default', 'reader', 'editor', 'organization_admin'],
        resourceId: 'documents',
        action: 'read',
        callerIsAuthorized: true,
      },
      {
        name: 'Success case - multiple matches II',
        subjectRoles: ['default', 'reader', 'editor', 'organization_admin'],
        resourceId: 'images',
        action: 'create',
        callerIsAuthorized: true,
      },
      {
        name: 'Failure case - unauthorized action',
        subjectRoles: ['default', 'reader'],
        resourceId: 'images',
        action: 'create',
        callerIsAuthorized: false,
      },
      {
        name: 'Failure case - unauthorized resource',
        subjectRoles: ['default', 'reader'],
        resourceId: 'secrets',
        action: 'read',
        callerIsAuthorized: false,
      },
      {
        name: 'Failure case - invalid action',
        subjectRoles: ['default', 'editor'],
        resourceId: 'documents',
        action: 'burn',
        callerIsAuthorized: false,
      },
      {
        name: 'Failure case - invalid resource',
        subjectRoles: ['default', 'editor'],
        resourceId: 'squirrels',
        action: 'write',
        callerIsAuthorized: false,
      },
      {
        name: 'Failure case - invalid role',
        subjectRoles: ['default', 'wizard'],
        resourceId: 'documents',
        action: 'write',
        callerIsAuthorized: false,
      },
    ])('$name', ({ subjectRoles, resourceId, action, callerIsAuthorized }) => {
      const actual = policy.callerIsAuthorized(subjectRoles, resourceId, action);
      expect(actual).toEqual(callerIsAuthorized);
    });
  });

  describe('allPermissionsForCaller', () => {
    it.each([
      {
        name: 'Returns all false for a caller with no permissions',
        subjectRoles: ['default'],
        expectedPermissionManifest: {
          documents: {
            create: false,
            delete: false,
            read: false,
            write: false,
          },
          images: {
            create: false,
            delete: false,
            read: false,
          },
          secrets: {
            read: false,
          },
        },
      },
      {
        name: 'Returns a mix for a caller with some permissions',
        subjectRoles: ['reader'],
        expectedPermissionManifest: {
          documents: {
            create: false,
            delete: false,
            read: true,
            write: false,
          },
          images: {
            create: false,
            delete: false,
            read: true,
          },
          secrets: {
            read: false,
          },
        },
      },
      {
        name: 'Returns the union for a caller with multiple roles',
        subjectRoles: ['reader', 'editor'],
        expectedPermissionManifest: {
          documents: {
            create: false,
            delete: false,
            read: true,
            write: true,
          },
          images: {
            create: true,
            delete: true,
            read: true,
          },
          secrets: {
            read: false,
          },
        },
      },
      {
        name: 'Returns all true for a caller with all permissions',
        subjectRoles: ['organization_admin'],
        expectedPermissionManifest: {
          documents: {
            create: true,
            delete: true,
            read: true,
            write: true,
          },
          images: {
            create: true,
            delete: true,
            read: true,
          },
          secrets: {
            read: true,
          },
        },
      },
    ])('$name', ({ subjectRoles, expectedPermissionManifest }) => {
      const actual = policy.allPermissionsForCaller(subjectRoles);
      expect(actual).toEqual(expectedPermissionManifest);
    });
  });

  describe('mergeWithCustomRoles', () => {
    it('Merges custom roles with project policy roles', () => {
      const projectPolicy = RBACPolicy.fromJSON(MOCK_RBAC_POLICY);
      const customRoles = [
        {
          role_id: 'custom_org_role',
          description: 'Custom organization role',
          permissions: [
            {
              actions: ['create', 'write'],
              resource_id: 'documents',
            },
          ],
        },
      ];

      const merged = projectPolicy.mergeWithCustomRoles(customRoles);

      expect(merged.roles).toHaveLength(5);
      expect(merged.roles.map((r) => r.role_id)).toContain('custom_org_role');
      expect(merged.resources).toEqual(projectPolicy.resources);
    });

    it('Merged policy correctly evaluates permissions for custom roles', () => {
      const projectPolicy = RBACPolicy.fromJSON(MOCK_RBAC_POLICY);
      const customRoles = [
        {
          role_id: 'org_manager',
          description: 'Organization manager',
          permissions: [
            {
              actions: ['create', 'delete'],
              resource_id: 'images',
            },
          ],
        },
      ];

      const merged = projectPolicy.mergeWithCustomRoles(customRoles);

      expect(merged.callerIsAuthorized(['org_manager'], 'images', 'create')).toBe(true);
      expect(merged.callerIsAuthorized(['org_manager'], 'images', 'delete')).toBe(true);
      expect(merged.callerIsAuthorized(['org_manager'], 'images', 'read')).toBe(false);
      expect(merged.callerIsAuthorized(['org_manager'], 'documents', 'read')).toBe(false);
    });

    it('Handles empty custom roles array gracefully', () => {
      const projectPolicy = RBACPolicy.fromJSON(MOCK_RBAC_POLICY);
      const emptyCustomRoles: RBACPolicyRole[] = [];

      const merged = projectPolicy.mergeWithCustomRoles(emptyCustomRoles);

      expect(merged.roles).toEqual(projectPolicy.roles);
      expect(merged.resources).toEqual(projectPolicy.resources);
    });

    it('Merged policy combines permissions from both project and custom roles', () => {
      const projectPolicy = RBACPolicy.fromJSON(MOCK_RBAC_POLICY);
      const customRoles = [
        {
          role_id: 'custom_role',
          description: 'Custom role',
          permissions: [
            {
              actions: ['delete'],
              resource_id: 'images',
            },
          ],
        },
      ];

      const merged = projectPolicy.mergeWithCustomRoles(customRoles);
      const allPerms = merged.allPermissionsForCaller(['reader', 'custom_role']);

      expect(allPerms.documents.read).toBe(true);
      expect(allPerms.images.read).toBe(true);
      expect(allPerms.images.delete).toBe(true);
    });
  });
});
