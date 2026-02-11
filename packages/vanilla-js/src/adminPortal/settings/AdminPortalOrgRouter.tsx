import { createRouter } from '../Router';
import type { OrgSettingsRouterMappedProps } from './AdminPortalOrgSettings';

export const {
  RouterProvider: OrgSettingsRouterProvider,
  Router: OrgSettingsRouter,
  useRouterController: useOrgSettingsRouterController,
  useRouterState: useOrgSettingsRouterState,
} = createRouter<OrgSettingsRouterMappedProps>();
