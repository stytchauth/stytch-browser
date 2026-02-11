import { RBACPolicyRole } from '@stytch/core';
import { useCallback } from 'react';

import { useAdminPortalUIConfig } from '../StytchClientContext';
import { AdminPortalUIConfigRoleDisplayProvider } from './AdminPortalUIConfigRoleDisplayProvider';
import { getRoleDefaultDescription } from './getRoleDefaultDescription';

export const useGetRoleDescription = () => {
  const config = useAdminPortalUIConfig<AdminPortalUIConfigRoleDisplayProvider>();

  return useCallback(
    (role: RBACPolicyRole) => {
      return config?.getRoleDescription?.(role) || getRoleDefaultDescription(role);
    },
    [config],
  );
};
