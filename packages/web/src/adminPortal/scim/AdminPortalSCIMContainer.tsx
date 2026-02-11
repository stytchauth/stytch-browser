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
import { SCIMConnectionDetailsScreen } from './SCIMConnectionDetailsScreen';
import { SCIMNewConnectionConfigureScreen } from './SCIMNewConnectionConfigureScreen';
import { SCIMNewConnectionScreen } from './SCIMNewConnectionScreen';
import { ScimRouter, ScimRouterProvider } from './SCIMRouter';
import { SCIMScreen } from './SCIMScreen';

/**
 * The UI configuration object for SCIM used in the Admin Portal.
 */
export type AdminPortalSCIMUIConfig = AdminPortalUIConfigRoleDisplayProvider;

export interface AdminPortalSCIMMountOptions<
  TProjectConfiguration extends StytchProjectConfigurationInput = Stytch.DefaultProjectConfiguration,
> extends AdminPortalCommonProps<TProjectConfiguration> {
  /**
   * An {@link AdminPortalSCIMUIConfig} object containing custom configuration.
   */
  config?: AdminPortalSCIMUIConfig;
}

const routeMap = {
  scimConnection: SCIMScreen,
  newConnection: SCIMNewConnectionScreen,
  newConnectionConfigure: SCIMNewConnectionConfigureScreen,
  scimConnectionDetails: SCIMConnectionDetailsScreen,
};

export type ScimRouterMappedProps = MappedPropsFromRouteMap<typeof routeMap>;

const initialRoute = { screen: 'scimConnection' } satisfies RouterStateEntry<ScimRouterMappedProps>;

export const Content = () => {
  const { self, fromCache } = useSelf();
  const { error: adminPortalConfigError, data: adminPortalConfig } = useAdminPortalConfig({ shouldFetch: !!self });
  const isScimEnabled = adminPortalConfig?.scim_config.scim_enabled;
  const { data: canGetScim } = useRbac('stytch.scim', 'get');

  const scimState = getFeatureState({
    self,
    fromCache,
    adminPortalConfigError,
    isFeatureEnabled: isScimEnabled,
    hasPermission: canGetScim,
  });
  return (
    <FeatureStateComponent
      featureState={scimState}
      notLoggedInValue={'Please log in to manage SCIM.'}
      errorValue={'SCIM could not be loaded. Please contact your admin if you think this is a mistake.'}
      featureNotEnabledValue={
        'SCIM Connections are not supported. Please contact your admin if you think this is a mistake.'
      }
      noPermissionValue={
        'You do not have permission to view SCIM Connections. Please contact your admin if you think this is a mistake.'
      }
    >
      <ScimRouterProvider initialRoute={initialRoute}>
        <ScimRouter routeMap={routeMap} />
      </ScimRouterProvider>
    </FeatureStateComponent>
  );
};

export const AdminPortalSCIMContainer = <TProjectConfiguration extends StytchProjectConfigurationInput>(
  props: AdminPortalSCIMMountOptions<TProjectConfiguration>,
) => {
  const initialClient = useRef(props.client);
  // only send an event on initial mount, even if the client changes
  useEffect(() => {
    readB2BInternals(initialClient.current).networkClient.logEvent({
      name: 'render_b2b_admin_portal_scim',
      details: {},
    });
  }, []);

  return (
    <AdminPortalWrapper options={props}>
      <Content />
    </AdminPortalWrapper>
  );
};
