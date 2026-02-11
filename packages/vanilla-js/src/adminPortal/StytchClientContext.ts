import React, { useContext } from 'react';
import { StytchB2BHeadlessClient } from '../b2b/StytchB2BHeadlessClient';
import { AdminPortalMemberManagementUIConfig } from './memberManagement/AdminPortalMemberManagement';
import { AdminPortalOrgUIConfig } from './settings/AdminPortalOrgSettings';
import { StytchProjectConfiguration, StytchProjectConfigurationInput } from '@stytch/core/public';
import { AdminPortalSSOUIConfig } from './sso/AdminPortalSSO';

export type AdminPortalContext<TProjectConfiguration extends StytchProjectConfigurationInput, TAdminPortalConfig> = {
  client: StytchB2BHeadlessClient<TProjectConfiguration> | null;
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
