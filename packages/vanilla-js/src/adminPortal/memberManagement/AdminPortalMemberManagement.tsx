import React, { useEffect, useRef } from 'react';
import { readB2BInternals } from '../../utils/internal';
import { AdminPortalWrapper } from '../AdminPortalWrapper';
import { MappedPropsFromRouteMap, RouterStateEntry } from '../Router';
import { AdminPortalComponentMountOptions } from '../makeAdminPortalComponentMountFn';
import { AdminPortalUIConfigRoleDisplayProvider } from '../utils/AdminPortalUIConfigRoleDisplayProvider';
import { useRbac } from '../utils/useRbac';
import { useSelf } from '../utils/useSelf';
import { MemberDetailsScreen } from './MemberDetailsScreen';
import { MemberListScreen } from './MemberListScreen';
import { MemberManagementRouter, MemberManagementRouterProvider } from './MemberManagementRouter';
import { getFeatureState } from '../utils/getFeatureState';
import { FeatureStateComponent } from '../utils/FeatureStateComponent';
import { StytchProjectConfigurationInput } from '@stytch/core/public';

/**
 * The UI configuration object for member management used in the Admin Portal.
 */
export interface AdminPortalMemberManagementUIConfig extends AdminPortalUIConfigRoleDisplayProvider {
  /**
   * The ID of the template to use when sending an invitation to join.
   */
  inviteTemplateId?: string;

  /**
   * The URL that the invited members click from the Email Magic Link.
   * If this value is not passed, the default `invite_redirect_url` that you set in your Dashboard is used.
   */
  inviteRedirectURL?: string;
}

export interface AdminPortalMemberManagementMountOptions<
  TProjectConfiguration extends StytchProjectConfigurationInput = Stytch.DefaultProjectConfiguration,
> extends AdminPortalComponentMountOptions<TProjectConfiguration> {
  /**
   * An {@link AdminPortalMemberManagementUIConfig} object containing custom configuration.
   */
  config?: AdminPortalMemberManagementUIConfig;
}

const routeMap = {
  membersList: MemberListScreen,
  memberDetails: MemberDetailsScreen,
};

export type MemberManagementRouterMappedProps = MappedPropsFromRouteMap<typeof routeMap>;

const initialRoute = { screen: 'membersList' } satisfies RouterStateEntry<MemberManagementRouterMappedProps>;

export const Content = () => {
  const { self, fromCache } = useSelf();
  const { data: canSearchMembers } = useRbac('stytch.member', 'search');

  const memberState = getFeatureState({
    self,
    fromCache,
    adminPortalConfigError: undefined,
    isFeatureEnabled: true,
    hasPermission: canSearchMembers,
  });

  return (
    <FeatureStateComponent
      featureState={memberState}
      notLoggedInValue={'Please log in to manage Members.'}
      errorValue={'Members could not be loaded. Please contact your admin if you think this is a mistake.'}
      featureNotEnabledValue={
        'Member Management is not supported. Please contact your admin if you think this is a mistake.'
      }
      noPermissionValue={
        'You do not have permission to manage Members. Please contact your admin if you think this is a mistake.'
      }
    >
      <MemberManagementRouterProvider initialRoute={initialRoute}>
        <MemberManagementRouter routeMap={routeMap} />
      </MemberManagementRouterProvider>
    </FeatureStateComponent>
  );
};

export const AdminPortalMemberManagement = <TProjectConfiguration extends StytchProjectConfigurationInput>(
  props: AdminPortalMemberManagementMountOptions<TProjectConfiguration>,
) => {
  // only send an event on initial mount, even if the client changes
  const initialClient = useRef(props.client);
  useEffect(() => {
    readB2BInternals(initialClient.current).networkClient.logEvent({
      name: 'render_b2b_admin_portal_member_management',
      details: {},
    });
  }, []);

  return (
    <AdminPortalWrapper options={props}>
      <Content />
    </AdminPortalWrapper>
  );
};
