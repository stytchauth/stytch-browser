import { StytchProjectConfigurationInput } from '@stytch/core/public';
import React from 'react';

import { AdminPortalOrgSettingsContainer as AdminPortalOrgSettingsContainer } from '../../../adminPortal';
import { AdminPortalOrgSettingsMountOptions } from '../../../adminPortal/settings/AdminPortalOrgSettingsContainer';
import { useStytchB2BClient } from '../b2b';
import { useIsMounted__INTERNAL } from '../b2b/StytchB2BContext';
import { noProviderError } from '../utils/errors';
import { invariant } from '../utils/invariant';
import { ExcludeInjectedOptions } from './makeAdminPortalComponent';

export type AdminPortalOrgSettingsProps<
  TProjectConfiguration extends StytchProjectConfigurationInput = Stytch.DefaultProjectConfiguration,
> = ExcludeInjectedOptions<AdminPortalOrgSettingsMountOptions<TProjectConfiguration>>;

/**
 * The Admin Portal Organization Settings UI component.
 * This component must be rendered within a {@link StytchB2BProvider}.
 *
 * See the {@link https://stytch.com/docs/b2b/sdks/javascript-sdk online reference}
 */
export const AdminPortalOrgSettings = <TProjectConfiguration extends StytchProjectConfigurationInput>(
  props: AdminPortalOrgSettingsProps<TProjectConfiguration>,
) => {
  invariant(useIsMounted__INTERNAL(), noProviderError('<AdminPortalMemberManagement />', 'StytchB2BProvider'));
  const stytchClient = useStytchB2BClient<TProjectConfiguration>();

  return <AdminPortalOrgSettingsContainer client={stytchClient} {...props} />;
};
