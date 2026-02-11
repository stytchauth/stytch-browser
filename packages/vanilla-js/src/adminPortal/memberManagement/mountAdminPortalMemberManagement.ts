import { makeAdminPortalComponentMountFn } from '../makeAdminPortalComponentMountFn';
import { AdminPortalMemberManagement } from './AdminPortalMemberManagement';

export type { AdminPortalMemberManagementMountOptions } from './AdminPortalMemberManagement';

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
export const mountAdminPortalMemberManagement = makeAdminPortalComponentMountFn(
  AdminPortalMemberManagement,
  'stytch-b2b-admin-portal-member-management-ui',
  'mountAdminPortalMemberManagement',
);
