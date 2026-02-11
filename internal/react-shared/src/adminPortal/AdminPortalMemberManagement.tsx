import {
  AdminPortalMemberManagementMountOptions,
  mountAdminPortalMemberManagement,
} from '@stytch/vanilla-js/b2b/adminPortal';
import { ExcludeInjectedOptions, makeAdminPortalComponent } from './makeAdminPortalComponent';
import type { StytchProjectConfigurationInput } from '@stytch/vanilla-js';

export type AdminPortalMemberManagementProps<
  TProjectConfiguration extends StytchProjectConfigurationInput = Stytch.DefaultProjectConfiguration,
> = ExcludeInjectedOptions<AdminPortalMemberManagementMountOptions<TProjectConfiguration>>;

/**
 * The Admin Portal member management UI component.
 * This component must be rendered within a {@link StytchB2BProvider}.
 *
 * See the {@link https://stytch.com/docs/b2b/sdks/javascript-sdk online reference}
 */
export const AdminPortalMemberManagement = makeAdminPortalComponent<
  AdminPortalMemberManagementMountOptions<StytchProjectConfigurationInput>
>(mountAdminPortalMemberManagement, 'AdminPortalMemberManagement');
