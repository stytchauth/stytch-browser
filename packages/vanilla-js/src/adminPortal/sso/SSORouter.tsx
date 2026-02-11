import { createRouter } from '../Router';
import type { SsoRouterMappedProps } from './AdminPortalSSO';

export const {
  RouterProvider: SsoRouterProvider,
  Router: SsoRouter,
  useRouterController: useSsoRouterController,
  useRouterState: useSsoRouterState,
} = createRouter<SsoRouterMappedProps>();
