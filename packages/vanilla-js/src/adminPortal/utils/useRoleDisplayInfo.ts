import { useCallback, useMemo } from 'react';
import { useGetRoleDescription } from './useGetRoleDescription';
import { useGetRoleDisplayName } from './useGetRoleDisplayName';
import { useRoles } from './useRoles';

export const useRoleDisplayInfo = (includeOrgRoles = false) => {
  const allRoles = useRoles(includeOrgRoles);

  const getRoleDisplayName = useGetRoleDisplayName();
  const getRoleDescription = useGetRoleDescription();

  const roleInfo = useMemo(() => {
    return (
      allRoles?.reduce<Record<string, { description: string; label: string }>>((acc, role) => {
        acc[role.role_id] = { description: getRoleDescription(role), label: getRoleDisplayName(role) };
        return acc;
      }, {}) ?? {}
    );
  }, [allRoles, getRoleDescription, getRoleDisplayName]);

  const getRoleIdDisplayName = useCallback((roleId: string) => roleInfo[roleId].label ?? roleId, [roleInfo]);

  return { roleInfo, getRoleIdDisplayName };
};
