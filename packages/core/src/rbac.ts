export const WILDCARD_ACTION = '*';

export type RBACPolicyRole = {
  role_id: string;
  description: string;
  permissions: {
    resource_id: string;
    actions: string[];
  }[];
};

export type RBACPolicyScope = {
  scope: string;
  description: string;
  permissions: {
    resource_id: string;
    actions: string[];
  }[];
};

export type RBACPolicyResource = {
  resource_id: string;
  description: string;
  actions: string[];
};

export type RBACPolicyRaw = {
  roles: RBACPolicyRole[];
  resources: RBACPolicyResource[];
  scopes: RBACPolicyScope[];
};

/**
 * RBACPolicy represents an instance of a parsed Stytch RBAC policy object
 * It contains methods for computing outcomes for various permissions questions
 */
export class RBACPolicy {
  private rolesByID: Record<string, RBACPolicyRole>;

  constructor(
    public roles: RBACPolicyRole[],
    public resources: RBACPolicyResource[],
  ) {
    this.rolesByID = {};
    roles.forEach((role) => (this.rolesByID[role.role_id] = role));
  }

  static fromJSON(input: RBACPolicyRaw): RBACPolicy {
    return new RBACPolicy(input.roles, input.resources);
  }

  /**
   * Merges organization custom roles with this project policy.
   * Custom roles are additive - they add additional roles on top of the base project policy.
   * Resources remain from the project policy, roles are combined.
   * @param customRoles Array of custom organization roles to add
   * @returns A new RBACPolicy instance with merged roles
   */
  mergeWithCustomRoles(customRoles: RBACPolicyRole[]): RBACPolicy {
    const mergedRoles = [...this.roles, ...customRoles];

    // Resources come from the project policy - custom roles don't define new resources
    return new RBACPolicy(mergedRoles, this.resources);
  }

  /**
   * isAuthorized returns whether or not a user with a specific set of roles can perform a desired action
   * @example
   *  const canDoIt = policy.callerIsAuthorized(roles, 'files', 'create')
   *  console.log(canDoIt) // true
   */
  callerIsAuthorized(memberRoles: string[], resourceId: string, action: string): boolean {
    return !!memberRoles
      .map((roleId) => this.rolesByID[roleId])
      // Defense in depth: filter out null/undefined in case memberRoles contains a role that doesn't match the policy
      // This may happen if the member is loaded _before_ a fresh RBAC policy is loaded
      .filter((v) => v)
      .flatMap((role) => role.permissions)
      .filter((permission) => permission.resource_id === resourceId)
      .find((permission) => permission.actions.includes(action) || permission.actions.includes(WILDCARD_ACTION));
  }

  /**
   * allPermissions generates a map that allows quick lookup of all the permissions available to the user
   * @example
   *   const perms = policy.allPermissions(roles)
   *   console.log(perms.files.create) // true
   *   console.log(perms.files.delete) // false
   */
  allPermissionsForCaller(memberRoles: string[]): Record<string, Record<string, boolean>> {
    const allPermsMap: Record<string, Record<string, boolean>> = Object.create(null);
    this.resources.forEach((resource) => {
      allPermsMap[resource.resource_id] = {};
      resource.actions.forEach((action) => {
        allPermsMap[resource.resource_id][action] = this.callerIsAuthorized(memberRoles, resource.resource_id, action);
      });
    });
    return allPermsMap;
  }
}
