import { createRouter } from '../Router';
import type { OrgSettingsRouterMappedProps } from './AdminPortalOrgSettingsContainer';

export const {
  RouterProvider: OrgSettingsRouterProvider,
  Router: OrgSettingsRouter,
  useRouterController: useOrgSettingsRouterController,
  useRouterState: useOrgSettingsRouterState,
} = createRouter<OrgSettingsRouterMappedProps>();
