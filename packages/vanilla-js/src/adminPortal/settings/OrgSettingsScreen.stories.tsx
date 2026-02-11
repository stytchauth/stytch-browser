import type { Meta, StoryObj } from '@storybook/react';
import {
  DataResponse,
  infiniteResolver,
  makeB2BSessionAuthenticateHandler,
  organizationMeResponse,
} from '../../../.storybook/handlers';
import { OrgSettingsScreen } from './OrgSettingsScreen';
import { waitFor, within, expect } from '@storybook/test';
import { http } from 'msw';

const meta = {
  args: {
    orgInfo: organizationMeResponse,
  },
  component: OrgSettingsScreen,
  parameters: {
    msw: {
      handlers: {
        b2bSessionAuthenticate: makeB2BSessionAuthenticateHandler({ roles: ['stytch_member', 'stytch_admin'] }),
      },
    },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default = {} satisfies Story;

export const DisableEdit = {
  parameters: {
    msw: {
      handlers: {
        b2bSessionAuthenticate: makeB2BSessionAuthenticateHandler({ roles: ['stytch_member'] }),
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => expect(canvas.getByText('Details')));

    await new Promise((resolve) => setTimeout(resolve, 1000));
    await expect(canvas.queryByRole('button', { name: 'Edit' })).not.toBeInTheDocument();
  },
} satisfies Story;

export const Loading = {
  parameters: {
    msw: {
      handlers: {
        b2bOrganizationMe: http.get<never, never, DataResponse<never>>(
          'https://api.stytch.com/sdk/v1/b2b/organizations/me',
          infiniteResolver,
        ),
      },
    },
  },
};
