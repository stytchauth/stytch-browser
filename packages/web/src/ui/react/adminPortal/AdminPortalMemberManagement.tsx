import { StytchProjectConfigurationInput } from '@stytch/core/public';
import React from 'react';

import { AdminPortalMemberManagementContainer as AdminPortalMemberManagementContainer } from '../../../adminPortal';
import { AdminPortalMemberManagementMountOptions } from '../../../adminPortal/memberManagement/AdminPortalMemberManagementContainer';
import { useIsMounted__INTERNAL, useStytchB2BClient } from '../b2b/StytchB2BContext';
import { noProviderError } from '../utils/errors';
import { invariant } from '../utils/invariant';
import { ExcludeInjectedOptions } from './makeAdminPortalComponent';

export type AdminPortalMemberManagementProps<
  TProjectConfiguration extends StytchProjectConfigurationInput = Stytch.DefaultProjectConfiguration,
> = ExcludeInjectedOptions<AdminPortalMemberManagementMountOptions<TProjectConfiguration>>;

/**
 * The Admin Portal member management UI component.
 * This component must be rendered within a {@link StytchB2BProvider}.
 *
 * See the {@link https://stytch.com/docs/b2b/sdks/javascript-sdk online reference}
 */
export const AdminPortalMemberManagement = <TProjectConfiguration extends StytchProjectConfigurationInput>(
  props: AdminPortalMemberManagementProps<TProjectConfiguration>,
) => {
  invariant(useIsMounted__INTERNAL(), noProviderError('<AdminPortalMemberManagement />', 'StytchB2BProvider'));
  const stytchClient = useStytchB2BClient<TProjectConfiguration>();

  return <AdminPortalMemberManagementContainer client={stytchClient} {...props} />;
};
