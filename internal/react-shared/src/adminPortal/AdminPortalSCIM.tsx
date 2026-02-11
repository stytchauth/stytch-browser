import { AdminPortalSCIMMountOptions, mountAdminPortalSCIM } from '@stytch/vanilla-js/b2b/adminPortal';
import { ExcludeInjectedOptions, makeAdminPortalComponent } from './makeAdminPortalComponent';
import type { StytchProjectConfigurationInput } from '@stytch/vanilla-js';

export type AdminPortalSCIMProps<
  TProjectConfiguration extends StytchProjectConfigurationInput = Stytch.DefaultProjectConfiguration,
> = ExcludeInjectedOptions<AdminPortalSCIMMountOptions<TProjectConfiguration>>;

/**
 * The Admin Portal SCIM UI component.
 * This component must be rendered within a {@link StytchB2BProvider}.
 *
 * See the {@link https://stytch.com/docs/b2b/sdks/javascript-sdk online reference}
 */
export const AdminPortalSCIM = makeAdminPortalComponent<AdminPortalSCIMMountOptions<StytchProjectConfigurationInput>>(
  mountAdminPortalSCIM,
  'AdminPortalSCIM',
);
