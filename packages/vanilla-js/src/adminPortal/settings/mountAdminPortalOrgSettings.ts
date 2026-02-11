import { makeAdminPortalComponentMountFn } from '../makeAdminPortalComponentMountFn';
import { AdminPortalOrgSettings } from './AdminPortalOrgSettings';

export type { AdminPortalOrgSettingsMountOptions } from './AdminPortalOrgSettings';

/**
 * Mounts the Admin Portal Organization Settings Management component inside the element provided.
 * If the component already been rendered inside the element, it will be updated
 * to use the new options passed in.
 * @example
 * mountAdminPortalOrgSettings{
 *   client: stytchClient,
 *   element: '#container',
 *   styles: {...},
 *   config: {...},
 * });
 *
 * @throws An error when the element specified by element cannot be found.
 */
export const mountAdminPortalOrgSettings = makeAdminPortalComponentMountFn(
  AdminPortalOrgSettings,
  'stytch-b2b-admin-portal-org-settings-ui',
  'mountAdminPortalOrgSettings',
);
