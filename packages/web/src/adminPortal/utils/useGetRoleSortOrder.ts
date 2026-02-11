import { RBACPolicyRole } from '@stytch/core';
import { useCallback } from 'react';

import { useAdminPortalUIConfig } from '../StytchClientContext';
import { AdminPortalUIConfigRoleDisplayProvider } from './AdminPortalUIConfigRoleDisplayProvider';

const filterToRBACFields = <T extends RBACPolicyRole>(role: T): RBACPolicyRole => {
  const { role_id, description, permissions } = role;

  return {
    role_id,
    description,
    permissions,
  } satisfies RBACPolicyRole;
};

export const useGetRoleSortOrder = () => {
  const config = useAdminPortalUIConfig<AdminPortalUIConfigRoleDisplayProvider>();
  return useCallback(
    <T extends RBACPolicyRole>(roles: T[]): T[] => {
      const filteredRoles = roles.map(filterToRBACFields);

      const sortOrder = config?.getRoleSortOrder ? config.getRoleSortOrder(filteredRoles) : [];

      if (!sortOrder.length) {
        return roles.slice();
      }

      const remainingRoles = new Map(roles.map((role) => [role.role_id, role]));

      const customSortedRoles: T[] = [];

      for (const roleId of sortOrder) {
        if (remainingRoles.has(roleId)) {
          customSortedRoles.push(remainingRoles.get(roleId)!);
          remainingRoles.delete(roleId);
        }
      }

      return customSortedRoles.concat([...remainingRoles.values()]);
    },
    [config],
  );
};
