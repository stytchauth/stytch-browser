import { KnownOAuthTenantProvider } from './oAuthProviders';

export const getDisplayStatus = (status: string) => {
  switch (status) {
    case 'active':
      return 'Active';
    case 'pending':
      return 'Pending';
    default:
      return status;
  }
};

export const getDisplayKnownTenantProvider = (provider: KnownOAuthTenantProvider) => {
  switch (provider) {
    case 'github':
      return 'GitHub';
    case 'hubspot':
      return 'HubSpot';
    case 'slack':
      return 'Slack';
  }
};

export const getDisplayTenantProvider = (provider: string) => {
  return getDisplayKnownTenantProvider(provider as KnownOAuthTenantProvider) || provider;
};
