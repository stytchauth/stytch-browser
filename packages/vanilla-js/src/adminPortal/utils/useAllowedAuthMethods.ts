import { B2BAllowedAuthMethods } from '@stytch/core/public';
import { useMemo } from 'react';
import { isTruthy } from '../../utils/isTruthy';
import { AdminPortalB2BProducts } from '../AdminPortalB2BProducts';
import { useAdminPortalOrgUIConfig } from '../StytchClientContext';

export const configAuthMethodMap: Record<AdminPortalB2BProducts, B2BAllowedAuthMethods> = {
  emailMagicLinks: 'magic_link',
  emailOtp: 'email_otp',
  sso: 'sso',
  password: 'password',
  oauthGoogle: 'google_oauth',
  oauthMicrosoft: 'microsoft_oauth',
  oauthHubspot: 'hubspot_oauth',
  oauthSlack: 'slack_oauth',
  oauthGithub: 'github_oauth',
};

export const useAllowedAuthMethods = () => {
  const orgUIConfig = useAdminPortalOrgUIConfig();

  return useMemo(() => {
    const authMethods =
      orgUIConfig?.allowedAuthMethods ?? (Object.keys(configAuthMethodMap) as AdminPortalB2BProducts[]);
    return authMethods.map((method) => configAuthMethodMap[method]).filter(isTruthy);
  }, [orgUIConfig?.allowedAuthMethods]);
};
