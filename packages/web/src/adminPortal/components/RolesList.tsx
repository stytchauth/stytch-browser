import React, { useMemo } from 'react';

import { ROLE_ID_STYTCH_MEMBER } from '../utils/roles';
import { useRoleSortFn } from '../utils/useRoleSortFn';
import { TagList } from './TagList';

interface RolesListProps {
  roles:
    | readonly {
        role_id: string;
      }[]
    | readonly string[];
  /**
   * Specifies whether to omit `stytch_member` if there are other roles present
   */
  hideStytchMemberWithOtherRoles?: boolean;
}

export const RolesList = ({ hideStytchMemberWithOtherRoles, roles }: RolesListProps) => {
  const sortRows = useRoleSortFn();
  const roleObjects = useMemo(
    () => roles.map((role) => (typeof role === 'string' ? { role_id: role } : role)),
    [roles],
  );
  const sortedRoles = useMemo(
    () =>
      sortRows(
        // When specified, only show `stytch_member` if it is the only role
        !hideStytchMemberWithOtherRoles || roleObjects.length === 1
          ? roleObjects
          : roleObjects.filter((role) => role.role_id !== ROLE_ID_STYTCH_MEMBER),
      ).map((role) => role.displayName),
    [hideStytchMemberWithOtherRoles, roleObjects, sortRows],
  );

  return <TagList tags={sortedRoles} />;
};
