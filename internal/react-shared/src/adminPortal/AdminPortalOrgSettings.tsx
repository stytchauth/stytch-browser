import { AdminPortalOrgSettingsMountOptions, mountAdminPortalOrgSettings } from '@stytch/vanilla-js/b2b/adminPortal';
import { ExcludeInjectedOptions, makeAdminPortalComponent } from './makeAdminPortalComponent';
import type { StytchProjectConfigurationInput } from '@stytch/vanilla-js';

export type AdminPortalOrgSettingsProps<
  TProjectConfiguration extends StytchProjectConfigurationInput = Stytch.DefaultProjectConfiguration,
> = ExcludeInjectedOptions<AdminPortalOrgSettingsMountOptions<TProjectConfiguration>>;

/**
 * The Admin Portal Organization Settings UI component.
 * This component must be rendered within a {@link StytchB2BProvider}.
 *
 * See the {@link https://stytch.com/docs/b2b/sdks/javascript-sdk online reference}
 */
export const AdminPortalOrgSettings = makeAdminPortalComponent<
  AdminPortalOrgSettingsMountOptions<StytchProjectConfigurationInput>
>(mountAdminPortalOrgSettings, 'AdminPortalOrgSettings');
