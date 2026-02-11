import { StytchProjectConfigurationInput } from '@stytch/core/public';
import React, { useEffect, useRef } from 'react';

import { readB2BInternals } from '../../utils/internal';
import { AdminPortalWrapper } from '../AdminPortalWrapper';
import { MappedPropsFromRouteMap, RouterStateEntry } from '../Router';
import { AdminPortalCommonProps } from '../utils/AdminPortalCommonProps';
import { AdminPortalUIConfigRoleDisplayProvider } from '../utils/AdminPortalUIConfigRoleDisplayProvider';
import { FeatureStateComponent } from '../utils/FeatureStateComponent';
import { getFeatureState } from '../utils/getFeatureState';
import { useAdminPortalConfig } from '../utils/useAdminPortalConfig';
import { useRbac } from '../utils/useRbac';
import { useSelf } from '../utils/useSelf';
import { SSOConnectionDetailsScreen } from './SSOConnectionDetailsScreen';
import { SSOConnectionsScreen } from './SSOConnectionsScreen';
import { SSONewConnectionConfigureScreen } from './SSONewConnectionConfigureScreen';
import { SSONewConnectionScreen } from './SSONewConnectionScreen';
import { SsoRouter, SsoRouterProvider } from './SSORouter';

/**
 * The UI configuration object for SSO configuration used in the Admin Portal.
 */
export type AdminPortalSSOUIConfig = AdminPortalUIConfigRoleDisplayProvider & {
  /**
   * The URL used when testing SSO connections via the test button on the SSO Connection Details screen.
   * If this value is not passed, the default `login_redirect_url` that you set in your Dashboard is used.
   */
  testLoginRedirectURL?: string;

  /**
   * The URL used when testing SSO connections via the test button on the SSO Connection Details screen.
   * If this value is not passed, the default `signup_redirect_url` that you set in your Dashboard is used.
   */
  testSignupRedirectURL?: string;
};

export interface AdminPortalSSOMountOptions<
  TProjectConfiguration extends StytchProjectConfigurationInput = Stytch.DefaultProjectConfiguration,
> extends AdminPortalCommonProps<TProjectConfiguration> {
  /**
   * An {@link AdminPortalSSOUIConfig} object containing custom configuration.
   */
  config?: AdminPortalSSOUIConfig;
}

const routeMap = {
  connectionDetails: SSOConnectionDetailsScreen,
  connectionsList: SSOConnectionsScreen,
  newConnection: SSONewConnectionScreen,
  newConnectionConfigure: SSONewConnectionConfigureScreen,
};

export type SsoRouterMappedProps = MappedPropsFromRouteMap<typeof routeMap>;

const initialRoute = { screen: 'connectionsList' } satisfies RouterStateEntry<SsoRouterMappedProps>;

export const Content = () => {
  const { data: canGetSso } = useRbac('stytch.sso', 'get');
  const { self, fromCache } = useSelf();
  const { data: adminPortalConfig, error: adminPortalConfigError } = useAdminPortalConfig({ shouldFetch: !!self });
  const isSsoEnabled = adminPortalConfig?.sso_config.sso_enabled;

  const ssoState = getFeatureState({
    self,
    fromCache,
    adminPortalConfigError: adminPortalConfigError,
    isFeatureEnabled: isSsoEnabled,
    hasPermission: canGetSso,
  });
  return (
    <FeatureStateComponent
      featureState={ssoState}
      notLoggedInValue={'Please log in to manage SSO.'}
      errorValue={'SSO Connections could not be loaded. Please contact your admin if you think this is a mistake.'}
      featureNotEnabledValue={
        'SSO Connections are not supported. Please contact your admin if you think this is a mistake.'
      }
      noPermissionValue={
        'You do not have permission to view SSO Connections. Please contact your admin if you think this is a mistake.'
      }
    >
      <SsoRouterProvider initialRoute={initialRoute}>
        <SsoRouter routeMap={routeMap} />
      </SsoRouterProvider>
    </FeatureStateComponent>
  );
};

export const AdminPortalSSOContainer = <TProjectConfiguration extends StytchProjectConfigurationInput>(
  props: AdminPortalSSOMountOptions<TProjectConfiguration>,
) => {
  // only send an event on initial mount, even if the client changes
  const initialClient = useRef(props.client);
  useEffect(() => {
    readB2BInternals(initialClient.current).networkClient.logEvent({
      name: 'render_b2b_admin_portal_sso',
      details: {},
    });
  }, []);

  return (
    <AdminPortalWrapper options={props}>
      <Content />
    </AdminPortalWrapper>
  );
};
