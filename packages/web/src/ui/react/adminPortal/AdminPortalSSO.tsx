import { StytchProjectConfigurationInput } from '@stytch/core/public';
import React from 'react';

import { AdminPortalSSOContainer } from '../../../adminPortal';
import { AdminPortalSSOMountOptions } from '../../../adminPortal/sso/AdminPortalSSOContainer';
import { useStytchB2BClient } from '../b2b';
import { useIsMounted__INTERNAL } from '../b2b/StytchB2BContext';
import { noProviderError } from '../utils/errors';
import { invariant } from '../utils/invariant';
import { ExcludeInjectedOptions } from './makeAdminPortalComponent';

export type AdminPortalSSOProps<
  TProjectConfiguration extends StytchProjectConfigurationInput = Stytch.DefaultProjectConfiguration,
> = ExcludeInjectedOptions<AdminPortalSSOMountOptions<TProjectConfiguration>>;

/**
 * The Admin Portal SSO UI component.
 * This component must be rendered within a {@link StytchB2BProvider}.
 *
 * See the {@link https://stytch.com/docs/b2b/sdks/javascript-sdk online reference}
 */
export const AdminPortalSSO = <TProjectConfiguration extends StytchProjectConfigurationInput>(
  props: AdminPortalSSOProps<TProjectConfiguration>,
) => {
  invariant(useIsMounted__INTERNAL(), noProviderError('<AdminPortalMemberManagement />', 'StytchB2BProvider'));
  const stytchClient = useStytchB2BClient<TProjectConfiguration>();

  return <AdminPortalSSOContainer client={stytchClient} {...props} />;
};
