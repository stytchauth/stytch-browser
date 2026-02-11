import { createRouter } from '../Router';
import type { ScimRouterMappedProps } from './AdminPortalSCIMContainer';

export const {
  RouterProvider: ScimRouterProvider,
  Router: ScimRouter,
  useRouterController: useScimRouterController,
  useRouterState: useScimRouterState,
} = createRouter<ScimRouterMappedProps>();
