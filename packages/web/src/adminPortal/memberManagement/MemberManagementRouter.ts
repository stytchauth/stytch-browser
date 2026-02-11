import { createRouter } from '../Router';
import type { MemberManagementRouterMappedProps } from './AdminPortalMemberManagementContainer';

export const {
  RouterProvider: MemberManagementRouterProvider,
  Router: MemberManagementRouter,
  useRouterController: useMemberManagementRouterController,
  useRouterState: useMemberManagementRouterState,
} = createRouter<MemberManagementRouterMappedProps>();
