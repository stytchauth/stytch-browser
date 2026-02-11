import { useMemo } from 'react';
import { ROLE_ID_STYTCH_MEMBER } from './roles';
import { useGetRoleDisplayName } from './useGetRoleDisplayName';
import { useRoles } from './useRoles';

export const useStytchMemberRoleDisplayName = () => {
  const allRoles = useRoles();
  const stytchMemberRole = useMemo(() => allRoles?.find((role) => role.role_id === ROLE_ID_STYTCH_MEMBER), [allRoles]);

  const getRoleDisplayName = useGetRoleDisplayName();

  return stytchMemberRole ? getRoleDisplayName(stytchMemberRole) : ROLE_ID_STYTCH_MEMBER;
};
