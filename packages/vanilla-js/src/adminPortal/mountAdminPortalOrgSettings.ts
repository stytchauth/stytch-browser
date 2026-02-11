import { AdminPortalOrgSettingsContainer } from '@stytch/web/adminPortal';

import { makeAdminPortalComponentMountFn } from '../bindings/makeAdminPortalComponentMountFn';
export type { AdminPortalOrgSettingsMountOptions } from '@stytch/web/adminPortal/types';

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
export const mountAdminPortalOrgSettings = /* @__PURE__ */ makeAdminPortalComponentMountFn(
  AdminPortalOrgSettingsContainer,
  'stytch-b2b-admin-portal-org-settings-ui',
  'mountAdminPortalOrgSettings',
);
