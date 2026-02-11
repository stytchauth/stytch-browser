import { createRouter } from '../Router';
import type { SsoRouterMappedProps } from './AdminPortalSSOContainer';

export const {
  RouterProvider: SsoRouterProvider,
  Router: SsoRouter,
  useRouterController: useSsoRouterController,
  useRouterState: useSsoRouterState,
} = createRouter<SsoRouterMappedProps>();
