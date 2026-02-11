import { infiniteResolver, makeB2BSessionAuthenticateHandler } from '../../../.storybook/handlers';
import type { Meta, StoryObj } from '@storybook/react';
import { AdminPortalOrgUIConfig, Content } from './AdminPortalOrgSettings';
import { HttpResponse, http } from 'msw';
import { MainContainer } from '../MainContainer';
import React from 'react';

const meta = {
  component: Content,
  render: (args) => (
    <MainContainer>
      <Content {...args} />
    </MainContainer>
  ),
  parameters: {
    layout: 'fullscreen',
    msw: {
      handlers: {
        b2bSessionAuthenticate: makeB2BSessionAuthenticateHandler({ roles: ['stytch_admin', 'stytch_member'] }),
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const _AdminPortalOrgSettings = {} satisfies Story;

export const Loading = {
  parameters: {
    msw: {
      handlers: {
        b2bAdminPortalConfig: http.get('https://api.stytch.com/sdk/v1/b2b/admin_portal_config', infiniteResolver),
      },
    },
  },
} satisfies Story;

export const NetworkError = {
  parameters: {
    msw: {
      handlers: {
        b2bAdminPortalConfig: http.get('https://api.stytch.com/sdk/v1/b2b/admin_portal_config', () => {
          return HttpResponse.error();
        }),
      },
    },
  },
} satisfies Story;

export const CustomRoleDisplay = {
  parameters: {
    stytch: {
      adminPortalConfig: {
        getRoleDisplayName: (role) => `!!${role.role_id.toUpperCase()}!!`,
        getRoleDescription: (role) => `!!${role.description.toUpperCase()}!!`,
      } satisfies AdminPortalOrgUIConfig,
    },
  },
} satisfies Story;

export const CustomRoleSortOrderDisplay = {
  parameters: {
    stytch: {
      adminPortalConfig: {
        getRoleSortOrder: () => ['sso_delete', 'self', 'organization_update.settings.default-sso-connection'],
      },
    },
  },
} satisfies Story;
