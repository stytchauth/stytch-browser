import { makeAdminPortalComponentMountFn } from '../makeAdminPortalComponentMountFn';
import { AdminPortalSCIM } from './AdminPortalSCIM';

export type { AdminPortalSCIMMountOptions } from './AdminPortalSCIM';

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
export const mountAdminPortalSCIM = makeAdminPortalComponentMountFn(
  AdminPortalSCIM,
  'stytch-b2b-admin-portal-scim',
  'mountAdminPortalSCIM',
);
