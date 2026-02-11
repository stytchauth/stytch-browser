import React, { useEffect, useRef } from 'react';
import { AdminPortalB2BProducts } from '../AdminPortalB2BProducts';
import { AdminPortalWrapper } from '../AdminPortalWrapper';
import { MappedPropsFromRouteMap, RouterStateEntry } from '../Router';
import { AdminPortalComponentMountOptions } from '../makeAdminPortalComponentMountFn';
import { OrgSettingsRouterProvider, OrgSettingsRouter } from './AdminPortalOrgRouter';
import { OrgSettingsScreen } from './OrgSettingsScreen';
import { useAdminPortalConfig } from '../utils/useAdminPortalConfig';
import { readB2BInternals } from '../../utils/internal';
import { B2BMFAProducts, StytchProjectConfigurationInput } from '@stytch/core/public';
import { EnumOrStringLiteral } from '@stytch/core';
import { useAdminPortalOrgUIConfig } from '../StytchClientContext';
import { AdminPortalUIConfigRoleDisplayProvider } from '../utils/AdminPortalUIConfigRoleDisplayProvider';
import { useSelf } from '../utils/useSelf';
import { getFeatureState } from '../utils/getFeatureState';
import { FeatureStateComponent } from '../utils/FeatureStateComponent';

const validateConfig = (config?: AdminPortalOrgUIConfig) => {
  if (!config) return;
  if (config.allowedAuthMethods?.length === 0) {
    throw new Error('allowedAuthMethods must contain at least one value');
  }
  if (config.allowedMfaAuthMethods?.length === 0) {
    throw new Error('mfaAuthMethods must contain at least one value');
  }
};
/**
 * The UI configuration object for organization used in the Admin Portal.
 */
export interface AdminPortalOrgUIConfig extends AdminPortalUIConfigRoleDisplayProvider {
  /**
   * Specify the auth methods that a member can choose to enable when restricting the organization's allowed auth methods.
   * If not specified, all auth methods are shown.
   */
  allowedAuthMethods?: EnumOrStringLiteral<AdminPortalB2BProducts>[];
  /**
   * Specify the MFA auth methods that a member can choose to enable when restricting the organization's allowed auth methods.
   * If not specified, all auth methods are shown.
   */
  allowedMfaAuthMethods?: EnumOrStringLiteral<B2BMFAProducts>[];
}
export interface AdminPortalOrgSettingsMountOptions<
  TProjectConfiguration extends StytchProjectConfigurationInput = Stytch.DefaultProjectConfiguration,
> extends AdminPortalComponentMountOptions<TProjectConfiguration> {
  /**
   * An {@link AdminPortalOrgUIConfig} object containing custom configuration.
   */
  config?: AdminPortalOrgUIConfig;
}

const routeMap = {
  orgSettingsScreen: OrgSettingsScreen,
};

export type OrgSettingsRouterMappedProps = MappedPropsFromRouteMap<typeof routeMap>;

const initialRoute = { screen: 'orgSettingsScreen' } satisfies RouterStateEntry<OrgSettingsRouterMappedProps>;

export const Content = () => {
  const { self, fromCache } = useSelf();
  const { error: adminPortalConfigError } = useAdminPortalConfig({
    shouldFetch: !!self,
  });

  const orgSettingsState = getFeatureState({
    self,
    fromCache,
    adminPortalConfigError: adminPortalConfigError,
    isFeatureEnabled: true,
    hasPermission: true,
  });
  return (
    <FeatureStateComponent
      featureState={orgSettingsState}
      notLoggedInValue={'Please log in to manage Authentication & Access.'}
      errorValue={
        'Authentication & Access Settings could not be loaded. Please contact your admin if you think this is a mistake.'
      }
      featureNotEnabledValue={
        'Authentication & Access is not supported. Please contact your admin if you think this is a mistake.'
      }
      noPermissionValue={
        'You do not have permission to view Authentication & Access. Please contact your admin if you think this is a mistake.'
      }
    >
      <OrgSettingsRouterProvider initialRoute={initialRoute}>
        <OrgSettingsRouter routeMap={routeMap} />
      </OrgSettingsRouterProvider>
    </FeatureStateComponent>
  );
};

export const AdminPortalOrgSettings = <TProjectConfiguration extends StytchProjectConfigurationInput>(
  props: AdminPortalOrgSettingsMountOptions<TProjectConfiguration>,
) => {
  const uiConfig = useAdminPortalOrgUIConfig();
  const initialClient = useRef(props.client);
  // only send an event on initial mount, even if the client changes
  useEffect(() => {
    readB2BInternals(initialClient.current).networkClient.logEvent({
      name: 'render_b2b_admin_portal_org_settings',
      details: {},
    });
  }, []);

  useEffect(() => {
    validateConfig(uiConfig);
  }, [uiConfig]);

  return (
    <AdminPortalWrapper options={props}>
      <Content />
    </AdminPortalWrapper>
  );
};
