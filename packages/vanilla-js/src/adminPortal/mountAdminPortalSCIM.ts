import { AdminPortalSCIMContainer } from '@stytch/web/adminPortal';

import { makeAdminPortalComponentMountFn } from '../bindings/makeAdminPortalComponentMountFn';
export type { AdminPortalSCIMMountOptions } from '@stytch/web/adminPortal/types';

/**
 * Mounts the Admin Portal SCIM Management component inside the element provided.
 * If the component already been rendered inside the element, it will be updated
 * to use the new options passed in.
 * @example
 * mountAdminPortalSCIM{
 *   client: stytchClient,
 *   element: '#container',
 *   styles: {...},
 * });
 *
 * @throws An error when the element specified by element cannot be found.
 */
export const mountAdminPortalSCIM = /* @__PURE__ */ makeAdminPortalComponentMountFn(
  AdminPortalSCIMContainer,
  'stytch-b2b-admin-portal-scim',
  'mountAdminPortalSCIM',
);
