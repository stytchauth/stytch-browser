import { RBACPolicyRole } from '@stytch/core';
import { useEffect, useState } from 'react';
import { useB2BInternals } from './useB2BInternals';

export const useRoles = (includeOrgRoles = false) => {
  const b2bInternals = useB2BInternals();
  const [roles, setRoles] = useState<RBACPolicyRole[] | undefined>(b2bInternals.bootstrap.getSync().rbacPolicy?.roles);
  useEffect(() => {
    b2bInternals.bootstrap.getAsync().then((value) => {
      setRoles(value.rbacPolicy?.roles);
    });
  });

  let allRoles = roles;
  if (includeOrgRoles) {
    const orgRoles: RBACPolicyRole[] = b2bInternals.dataLayer.state?.organization?.custom_roles ?? [];
    allRoles = (roles ?? []).concat(orgRoles ?? []);
  }

  return allRoles;
};
