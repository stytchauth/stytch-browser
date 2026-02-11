import { AdminPortalSSOContainer } from '@stytch/web/adminPortal';

import { makeAdminPortalComponentMountFn } from '../bindings/makeAdminPortalComponentMountFn';
export type { AdminPortalSSOMountOptions } from '@stytch/web/adminPortal/types';

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
export const mountAdminPortalSSO = /* @__PURE__ */ makeAdminPortalComponentMountFn(
  AdminPortalSSOContainer,
  'stytch-b2b-admin-portal-sso-ui',
  'mountAdminPortalSSO',
);
