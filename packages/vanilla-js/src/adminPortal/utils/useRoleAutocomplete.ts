import { useMemo } from 'react';
import { ROLE_ID_STYTCH_MEMBER } from './roles';
import { useRoleDisplayInfo } from './useRoleDisplayInfo';
import { useRoleSortFn } from './useRoleSortFn';
import { useRoles } from './useRoles';

export const useRoleAutocomplete = ({
  excludeStytchMember = false,
  includeOrgRoles = false,
}: { excludeStytchMember?: boolean; includeOrgRoles?: boolean } = {}) => {
  const allRoles = useRoles(includeOrgRoles);
  const assignableRoles = useMemo(
    () => (excludeStytchMember ? allRoles?.filter((role) => role.role_id !== ROLE_ID_STYTCH_MEMBER) : allRoles),
    [allRoles, excludeStytchMember],
  );

  const sortRoles = useRoleSortFn();

  const roleSelectItems = useMemo(() => {
    return sortRoles(assignableRoles ?? []).map((role) => role.role_id);
  }, [assignableRoles, sortRoles]);

  const { roleInfo, getRoleIdDisplayName } = useRoleDisplayInfo(includeOrgRoles);

  return {
    selectItems: roleSelectItems,
    getOptionDescription: (roleId: string) => roleInfo[roleId].description,
    getOptionLabel: getRoleIdDisplayName,
  };
};
