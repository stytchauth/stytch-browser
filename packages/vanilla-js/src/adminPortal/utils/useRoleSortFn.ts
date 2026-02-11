import { RBACPolicyRole } from '@stytch/core';
import { useCallback, useMemo } from 'react';
import { getRoleDefaultDisplayName } from './getRoleDefaultDisplayName';
import { ROLE_ID_STYTCH_ADMIN, ROLE_ID_STYTCH_MEMBER } from './roles';
import { useGetRoleDisplayName } from './useGetRoleDisplayName';
import { useRoles } from './useRoles';
import { useGetRoleSortOrder } from './useGetRoleSortOrder';

const wellKnownRoleIds = [ROLE_ID_STYTCH_MEMBER, ROLE_ID_STYTCH_ADMIN];

/**
 * A sort comparison function for role IDs that prioritizes certain well-known
 * role IDs over others. Non-well-known roles are considered equivalent, so
 * their order is preserved.
 */
const compareWellKnownRoleIds = (a: string, b: string) => {
  if (a === b) {
    return 0;
  }

  for (const roleId of wellKnownRoleIds) {
    if (a === roleId) {
      return -1;
    }
    if (b === roleId) {
      return 1;
    }
  }

  return 0;
};

export const useRolesById = () => {
  const getRoleDisplayName = useGetRoleDisplayName();

  const allRoles = useRoles();
  return useMemo(
    () =>
      allRoles?.reduce<Record<string, RBACPolicyRole & { displayName: string }>>((acc, role) => {
        acc[role.role_id] = { ...role, displayName: getRoleDisplayName(role) || getRoleDefaultDisplayName(role) };
        return acc;
      }, {}),
    [allRoles, getRoleDisplayName],
  );
};

export const useRoleSortFn = () => {
  const rolesById = useRolesById();
  const sort = useGetRoleSortOrder();

  return useCallback(
    <T extends { role_id: string }>(roles: readonly T[]) => {
      const rolesWithDisplayNames = roles.map((role) => {
        const matchingPolicyRole = rolesById?.[role.role_id];

        const rbacRole: RBACPolicyRole = {
          role_id: matchingPolicyRole?.role_id ?? role.role_id,
          description: matchingPolicyRole?.description ?? '',
          permissions: matchingPolicyRole?.permissions ?? [],
        };
        return {
          ...rbacRole,
          ...role,
          displayName: matchingPolicyRole?.displayName ?? role.role_id,
        };
      });
      const preSortedRoles = rolesWithDisplayNames.sort((a, b) => {
        return compareWellKnownRoleIds(a.role_id, b.role_id) || a.displayName.localeCompare(b.displayName);
      });

      return sort(preSortedRoles);
    },
    [rolesById, sort],
  );
};
