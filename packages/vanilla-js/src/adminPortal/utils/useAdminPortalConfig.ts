import { ResponseCommon } from '@stytch/core/public';
import useSWR from 'swr';
import { useNetworkClient } from './useApiNetworkClient';

export interface AdminPortalConfigResponse extends ResponseCommon {
  sso_config: {
    sso_enabled: boolean;
    can_create_saml_connection: boolean;
    can_create_oidc_connection: boolean;
  };
  organization_config: {
    mfa_controls_enabled: boolean;
  };
  scim_config: {
    scim_enabled: boolean;
  };
}

export const useAdminPortalConfig = ({ shouldFetch }: { shouldFetch: boolean }) => {
  const networkClient = useNetworkClient();

  return useSWR(shouldFetch ? '/b2b/admin_portal_config' : null, () => {
    return networkClient.fetchSDK<AdminPortalConfigResponse>({
      url: '/b2b/admin_portal_config',
      method: 'GET',
    });
  });
};
