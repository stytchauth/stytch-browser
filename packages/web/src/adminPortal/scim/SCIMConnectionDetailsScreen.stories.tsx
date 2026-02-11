import type { Meta, StoryObj } from '@storybook/react';

import { makeB2BSessionAuthenticateHandler } from '../../../.storybook/handlers';
import { AdminPortalOrgUIConfig } from '../settings/AdminPortalOrgSettingsContainer';
import { makeFakeScimConnection } from '../testUtils/makeFakeScimConnection';
import { SCIMConnectionDetailsScreen } from './SCIMConnectionDetailsScreen';

const meta = {
  args: {
    connection: makeFakeScimConnection({
      identity_provider: 'generic',
    }),
  },
  component: SCIMConnectionDetailsScreen,
  parameters: {
    msw: {
      handlers: {
        b2bSessionAuthenticate: makeB2BSessionAuthenticateHandler({ roles: ['stytch_admin', 'stytch_member'] }),
      },
    },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Generic = {} satisfies Story;

export const Okta = {
  args: {
    connection: makeFakeScimConnection({
      identity_provider: 'okta',
    }),
  },
} satisfies Story;

export const Entra = {
  args: {
    connection: makeFakeScimConnection({
      identity_provider: 'microsoft-entra',
    }),
  },
} satisfies Story;

export const CyberArk = {
  args: {
    connection: makeFakeScimConnection({
      identity_provider: 'cyberark',
    }),
  },
} satisfies Story;

export const JumpCloud = {
  args: {
    connection: makeFakeScimConnection({
      identity_provider: 'jumpcloud',
    }),
  },
} satisfies Story;

export const OneLogin = {
  args: {
    connection: makeFakeScimConnection({
      identity_provider: 'onelogin',
    }),
  },
} satisfies Story;

export const PingFederate = {
  args: {
    connection: makeFakeScimConnection({
      identity_provider: 'pingfederate',
    }),
  },
} satisfies Story;

export const Rippling = {
  args: {
    connection: makeFakeScimConnection({
      identity_provider: 'rippling',
    }),
  },
} satisfies Story;

// TODO: SDK-2108, Fix this flaky test
// export const FlowClickEdit = {
//   args: {
//     connection: makeFakeScimConnection({
//       identity_provider: 'generic',
//     }),
//   },
//   play: async ({ canvasElement }) => {
//     const canvas = within(canvasElement);
//     await waitFor(() => expect(canvas.getByText('Edit')));
//     const editbutton = canvas.getByRole('button', { name: 'Edit' });
//     await userEvent.click(editbutton);
//   },
// } satisfies Story;

// export const FlowEditRoleAssignments = {
//   ...FlowClickEdit,
//   play: async (params) => {
//     const { canvasElement } = params;
//     const canvas = within(canvasElement);
//     await FlowClickEdit.play(params);

//     const roleSelect = canvas.getAllByLabelText('Group Role');
//     await userEvent.click(roleSelect[0]);

//     const options = await getAllByRole(document.body, 'option');
//     await userEvent.click(options[0]);
//   },
// } satisfies Story;

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

// TODO: SDK-2108, Fix this flaky test
// export const NoSCIMGroupRoleAssignments = {
//   ...FlowClickEdit,
//   args: {
//     connection: makeFakeScimConnection({
//       identity_provider: 'generic',
//       scim_group_implicit_role_assignments: [],
//     }),
//   },
//   play: async (params) => {
//     const { canvasElement } = params;
//     const canvas = within(canvasElement);
//     await FlowClickEdit.play(params);

//     const button = await waitFor(() => canvas.getByRole('button', { name: 'Add group roles' }));
//     await userEvent.click(button);

//     const roleSelect = canvas.getAllByLabelText('Group Role');
//     await userEvent.click(roleSelect[0]);

//     const options = await getAllByRole(document.body, 'option');
//     await userEvent.click(options[0]);

//     const saveButton = await waitFor(() => canvas.getByRole('button', { name: 'Save' }));

//     await waitFor(() => expect(saveButton).toBeEnabled());
//   },
// } satisfies Story;
