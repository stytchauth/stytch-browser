import { RBACPolicyRole } from '@stytch/core';
import { useCallback } from 'react';
import { useAdminPortalUIConfig } from '../StytchClientContext';
import { AdminPortalUIConfigRoleDisplayProvider } from './AdminPortalUIConfigRoleDisplayProvider';
import { getRoleDefaultDisplayName } from './getRoleDefaultDisplayName';

export const useGetRoleDisplayName = () => {
  const config = useAdminPortalUIConfig<AdminPortalUIConfigRoleDisplayProvider>();

  return useCallback(
    (role: RBACPolicyRole) => {
      return config?.getRoleDisplayName?.(role) || getRoleDefaultDisplayName(role);
    },
    [config],
  );
};
