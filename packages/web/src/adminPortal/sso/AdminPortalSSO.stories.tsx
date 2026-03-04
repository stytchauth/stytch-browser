import type { Meta, StoryObj } from '@storybook/react-vite';
import { http, HttpResponse } from 'msw';
import React from 'react';

import { infiniteResolver, makeB2BSessionAuthenticateHandler } from '../../../.storybook/handlers';
import { MainContainer } from '../MainContainer';
import type { AdminPortalOrgUIConfig } from '../settings/AdminPortalOrgSettingsContainer';
import { Content } from './AdminPortalSSOContainer';

const meta = {
  component: Content,
  render: (args) => (
    <MainContainer>
      <Content {...args} />
    </MainContainer>
  ),
  parameters: {
    adminPortal: true,
    msw: {
      handlers: {
        b2bSessionAuthenticate: makeB2BSessionAuthenticateHandler({ roles: ['stytch_admin', 'stytch_member'] }),
      },
    },
    layout: 'fullscreen',
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const _AdminPortalSSO = {} satisfies Story;

export const Loading = {
  parameters: {
    msw: {
      handlers: {
        b2bAdminPortalConfig: http.get('https://api.stytch.com/sdk/v1/b2b/admin_portal_config', infiniteResolver),
      },
    },
  },
} satisfies Story;

export const NoPermission = {
  parameters: {
    msw: {
      handlers: {
        b2bSessionAuthenticate: makeB2BSessionAuthenticateHandler({ roles: [] }),
      },
    },
  },
} satisfies Story;

export const NotEnabled = {
  parameters: {
    msw: {
      handlers: {
        b2bAdminPortalConfig: http.get('https://api.stytch.com/sdk/v1/b2b/admin_portal_config', () => {
          return HttpResponse.json({
            data: {
              sso_config: {
                can_create_oidc_connection: false,
                can_create_saml_connection: false,
                sso_enabled: false,
              },
            },
          });
        }),
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
