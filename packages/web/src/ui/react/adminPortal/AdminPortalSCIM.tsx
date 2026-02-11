import { StytchProjectConfigurationInput } from '@stytch/core/public';
import React from 'react';

import { AdminPortalSCIMContainer as AdminPortalSCIMContainer } from '../../../adminPortal';
import { AdminPortalSCIMMountOptions } from '../../../adminPortal/scim/AdminPortalSCIMContainer';
import { useStytchB2BClient } from '../b2b';
import { useIsMounted__INTERNAL } from '../b2b/StytchB2BContext';
import { noProviderError } from '../utils/errors';
import { invariant } from '../utils/invariant';
import { ExcludeInjectedOptions } from './makeAdminPortalComponent';

export type AdminPortalSCIMProps<
  TProjectConfiguration extends StytchProjectConfigurationInput = Stytch.DefaultProjectConfiguration,
> = ExcludeInjectedOptions<AdminPortalSCIMMountOptions<TProjectConfiguration>>;

/**
 * The Admin Portal SCIM UI component.
 * This component must be rendered within a {@link StytchB2BProvider}.
 *
 * See the {@link https://stytch.com/docs/b2b/sdks/javascript-sdk online reference}
 */
export const AdminPortalSCIM = <TProjectConfiguration extends StytchProjectConfigurationInput>(
  props: AdminPortalSCIMProps<TProjectConfiguration>,
) => {
  invariant(useIsMounted__INTERNAL(), noProviderError('<AdminPortalMemberManagement />', 'StytchB2BProvider'));
  const stytchClient = useStytchB2BClient<TProjectConfiguration>();

  return <AdminPortalSCIMContainer client={stytchClient} {...props} />;
};
