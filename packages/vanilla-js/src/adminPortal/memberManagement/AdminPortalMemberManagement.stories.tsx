import type { Meta, StoryObj } from '@storybook/react';
import { expect, screen, userEvent, waitForElementToBeRemoved, within } from '@storybook/test';
import React from 'react';
import { makeB2BSessionAuthenticateHandler } from '../../../.storybook/handlers';
import { MainContainer } from '../MainContainer';
import { AdminPortalMemberManagementUIConfig, Content } from './AdminPortalMemberManagement';

const meta = {
  component: Content,
  render: (args) => (
    <MainContainer>
      <Content {...args} />
    </MainContainer>
  ),
  parameters: {
    msw: {
      handlers: {
        b2bSessionAuthenticate: makeB2BSessionAuthenticateHandler({
          roles: ['stytch_admin', 'stytch_member'],
          memberId: 'member-id-1',
        }),
      },
    },
    layout: 'fullscreen',
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const _AdminPortalMemberManagement = {} satisfies Story;

export const NoPermission = {
  parameters: {
    msw: {
      handlers: {
        b2bSessionAuthenticate: makeB2BSessionAuthenticateHandler({ roles: [] }),
      },
    },
  },
} satisfies Story;

export const SelfPermission = {
  parameters: {
    msw: {
      handlers: {
        b2bSessionAuthenticate: makeB2BSessionAuthenticateHandler({
          roles: ['self'],
          memberId: 'member-id-1',
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
      } satisfies AdminPortalMemberManagementUIConfig,
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

export const Invite = {
  play: async ({ canvas, canvasElement }) => {
    const inviteButton = await canvas.findByRole('button', { name: 'Invite' });
    await userEvent.click(inviteButton);

    const modal = await within(canvasElement.ownerDocument.body).findByRole('dialog', { name: 'Invite Member' });
    await expect(modal).toBeInTheDocument();
  },
} satisfies Story;

export const InviteSend = {
  ...Invite,
  play: async (params) => {
    await Invite.play(params);

    const { canvasElement } = params;
    const modal = await within(canvasElement.ownerDocument.body).findByRole('dialog', { name: 'Invite Member' });

    await userEvent.type(within(modal).getByLabelText('Name (optional)'), 'John Doe');
    await userEvent.type(within(modal).getByLabelText('Email address'), 'john.doe@example.com');

    await userEvent.click(within(modal).getByRole('button', { name: 'Invite' }));

    await waitForElementToBeRemoved(modal);
  },
} satisfies Story;

export const InviteSendWithTemplateId = {
  ...Invite,
  parameters: {
    stytch: {
      adminPortalConfig: {
        inviteTemplateId: 'template-from-storybook',
      },
    },
  },
  play: async (params) => {
    await Invite.play(params);

    const { canvasElement } = params;
    const modal = await within(canvasElement.ownerDocument.body).findByRole('dialog', { name: 'Invite Member' });

    await userEvent.type(within(modal).getByLabelText('Name (optional)'), 'John Doe');
    await userEvent.type(within(modal).getByLabelText('Email address'), 'john.doe+require-template-id@example.com');
    await userEvent.click(within(modal).getByRole('button', { name: 'Invite' }));

    await waitForElementToBeRemoved(modal);
  },
} satisfies Story;

export const InviteSendError = {
  ...Invite,
  play: async (params) => {
    await Invite.play(params);

    const { canvasElement } = params;
    const modal = await within(canvasElement.ownerDocument.body).findByRole('dialog', { name: 'Invite Member' });

    await userEvent.type(within(modal).getByLabelText('Name (optional)'), 'John Doe');
    await userEvent.type(within(modal).getByLabelText('Email address'), 'john.doe+require-template-id@example.com');
    await userEvent.click(within(modal).getByRole('button', { name: 'Invite' }));

    expect(await screen.findByText('Invite template ID is required for this email address.')).toBeInTheDocument();

    expect(modal).toBeInTheDocument();
  },
} satisfies Story;
