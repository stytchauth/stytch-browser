import { AdminPortalMemberManagementContainer } from '@stytch/web/adminPortal';

import { makeAdminPortalComponentMountFn } from '../bindings/makeAdminPortalComponentMountFn';

export type { AdminPortalMemberManagementMountOptions } from '@stytch/web/adminPortal/types';

/**
 * Mounts the Admin Portal Member Management component inside the element provided.
 * If the component already been rendered inside the element, it will be updated
 * to use the new options passed in.
 * @example
 * mountAdminPortalMemberManagement({
 *   client: stytchClient,
 *   element: '#container',
 *   styles: {...}
 * });
 *
 * @throws An error when the element specified cannot be found.
 */
export const mountAdminPortalMemberManagement = /* @__PURE__ */ makeAdminPortalComponentMountFn(
  AdminPortalMemberManagementContainer,
  'stytch-b2b-admin-portal-member-management-ui',
  'mountAdminPortalMemberManagement',
);
