import { StytchProjectConfiguration, StytchProjectConfigurationInput } from '@stytch/core/public';
import React, { useContext } from 'react';

import { StytchB2BClient } from '../b2b/StytchB2BClient';
import { AdminPortalMemberManagementUIConfig } from './memberManagement/AdminPortalMemberManagementContainer';
import { AdminPortalOrgUIConfig } from './settings/AdminPortalOrgSettingsContainer';
import { AdminPortalSSOUIConfig } from './sso/AdminPortalSSOContainer';

export type AdminPortalContext<TProjectConfiguration extends StytchProjectConfigurationInput, TAdminPortalConfig> = {
  client: StytchB2BClient<TProjectConfiguration> | null;
  config?: TAdminPortalConfig;
};

export const StytchClientContext = React.createContext<AdminPortalContext<StytchProjectConfiguration, unknown>>({
  client: null,
});

export const useAdminPortalContext = <T>() =>
  useContext(StytchClientContext as React.Context<AdminPortalContext<StytchProjectConfiguration, T>>);
export const useAdminPortalUIConfig = <T>() => useAdminPortalContext<T>().config;

export const useAdminPortalOrgUIConfig = useAdminPortalUIConfig<AdminPortalOrgUIConfig>;
export const useAdminPortalMemberManagementUIConfig = useAdminPortalUIConfig<AdminPortalMemberManagementUIConfig>;

export const useAdminPortalSSOUIConfig = useAdminPortalUIConfig<AdminPortalSSOUIConfig>;
