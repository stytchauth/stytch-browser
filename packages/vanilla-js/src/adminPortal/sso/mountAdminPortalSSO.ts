import { makeAdminPortalComponentMountFn } from '../makeAdminPortalComponentMountFn';
import { AdminPortalSSO } from './AdminPortalSSO';

export type { AdminPortalSSOMountOptions } from './AdminPortalSSO';

/**
 * Mounts the Admin Portal SSO Management component inside the element provided.
 * If the component already been rendered inside the element, it will be updated
 * to use the new options passed in.
 * @example
 * mountAdminPortalSSO({
 *   client: stytchClient,
 *   element: '#container',
 *   styles: {...}
 * });
 *
 * @throws An error when the element specified by elementId cannot be found.
 */
export const mountAdminPortalSSO = makeAdminPortalComponentMountFn(
  AdminPortalSSO,
  'stytch-b2b-admin-portal-sso-ui',
  'mountAdminPortalSSO',
);
