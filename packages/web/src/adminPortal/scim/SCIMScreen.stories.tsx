import type { Meta, StoryObj } from '@storybook/react';
import { B2BSCIMGetConnectionResponse, Organization, ResponseCommon } from '@stytch/core/public';
import { http, HttpResponse } from 'msw';
import { expect } from 'storybook/test';

import {
  DataResponse,
  infiniteResolver,
  makeB2BSessionAuthenticateHandler,
  organizationMeResponse,
} from '../../../.storybook/handlers';
import { SCIMScreen } from './SCIMScreen';

const meta = {
  component: SCIMScreen,
  parameters: {
    adminPortal: true,
    msw: {
      handlers: {
        b2bSessionAuthenticate: makeB2BSessionAuthenticateHandler({ roles: ['stytch_member', 'stytch_admin'] }),
      },
    },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const _SCIMScreen = {} satisfies Story;

export const NoConnection = {
  parameters: {
    msw: {
      handlers: {
        b2bOrganizationMe: http.get<never, never, DataResponse<{ organization: Organization } & ResponseCommon>>(
          'https://api.stytch.com/sdk/v1/b2b/organizations/me',
          () => {
            return HttpResponse.json({
              data: {
                organization: { ...organizationMeResponse, scim_active_connection: null },
                request_id: 'request-id-test-896c625f-89a6-4a0d-8615-3dcbdf00314d',
                status_code: 200,
              },
            });
          },
        ),
      },
    },
  },
  play: async ({ canvas }) => {
    await expect(await canvas.findByText('Set up a SCIM connection to sync from an IdP.')).toBeInTheDocument();
  },
} satisfies Story;

export const Loading = {
  parameters: {
    msw: {
      handlers: {
        b2bScim: http.get<never, never, DataResponse<B2BSCIMGetConnectionResponse>>(
          'https://api.stytch.com/sdk/v1/b2b/scim',
          () => {
            return infiniteResolver();
          },
        ),
      },
    },
  },
} satisfies Story;

export const Error = {
  parameters: {
    msw: {
      handlers: {
        b2bScim: http.get('https://api.stytch.com/sdk/v1/b2b/scim', () => {
          return HttpResponse.error();
        }),
      },
    },
  },
  play: async ({ canvas }) => {
    await expect(await canvas.findByText('There was an error loading the SCIM connection.')).toBeInTheDocument();
  },
} satisfies Story;
