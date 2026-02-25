import type { Meta, StoryObj } from '@storybook/react';
import {
  B2BSCIMGetConnectionGroupsOptions,
  B2BSCIMGetConnectionGroupsResponse,
  B2BSCIMGetConnectionResponse,
  Organization,
  ResponseCommon,
  SCIMConnection,
  SCIMGroup,
} from '@stytch/core/public';
import { MOCK_ORGANIZATION } from '@stytch/internal-mocks';
import { http, HttpResponse } from 'msw';
import {
  expect,
  findByRole,
  getAllByRole,
  getByRole,
  userEvent,
  waitFor,
  waitForElementToBeRemoved,
  within,
} from 'storybook/test';

import { DataResponse, makeB2BSessionAuthenticateHandler, organizationMeResponse } from '../../../.storybook/handlers';
import { MAX_LIMIT_CONNECTION_GROUPS } from '../utils/useScimConnectionGroups';
import { OrgSettingsRoleAssignmentsSection } from './OrgSettingsRoleAssignmentsSection';

const meta = {
  component: OrgSettingsRoleAssignmentsSection,
  args: {
    orgInfo: organizationMeResponse,
  },
  parameters: {
    adminPortal: true,
    msw: {
      handlers: {
        b2bSessionAuthenticate: makeB2BSessionAuthenticateHandler({ roles: ['stytch_admin', 'stytch_member'] }),
      },
    },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const View = {} satisfies Story;

export const FlowClickEdit = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => expect(canvas.getByText('Edit')));
    const editbutton = canvas.getByRole('button', { name: 'Edit' });
    await userEvent.click(editbutton);
  },
} satisfies Story;

export const FlowAddEmailRoleAssignment = {
  ...FlowClickEdit,
  play: async (params) => {
    await FlowClickEdit.play(params);
    const { canvasElement } = params;
    const canvas = within(canvasElement);

    const roleRow = canvas.getByText('stytch_admin');
    await userEvent.click(roleRow);

    const addButton = canvas.getByRole('button', { name: 'Add Role assignment' });
    await userEvent.click(addButton);

    const modal = getByRole(canvasElement.ownerDocument.body, 'dialog');
    const modalSavebutton = within(modal).getByRole('button', { name: 'Save' });

    await waitFor(() => expect(modalSavebutton).toBeDisabled());

    const roleSelect = within(modal).getByLabelText('Select Role');
    await userEvent.click(roleSelect);

    const roleMenu = await getByRole(document.body, 'listbox');

    await waitFor(() => expect(modalSavebutton).toBeDisabled());

    const menuItems = within(roleMenu).getAllByRole('menuitem');
    await userEvent.click(menuItems[0]);

    const sourceSelect = within(modal).getByLabelText('Select Source');
    await userEvent.click(sourceSelect);

    const sourceMenu = await getByRole(document.body, 'listbox');

    const sourceMenuItems = within(sourceMenu).getAllByRole('menuitem');
    await userEvent.click(sourceMenuItems[0]);

    const emailInput = within(modal).getByLabelText('Domain');
    await userEvent.type(emailInput, 'example.com');

    await userEvent.click(modalSavebutton);

    await waitFor(() => expect(canvas.getByText('example.com')).toBeInTheDocument());
  },
} satisfies Story;

export const FlowAddSSOConnectionAssignment = {
  ...FlowClickEdit,
  play: async (params) => {
    await FlowClickEdit.play(params);
    const { canvasElement } = params;
    const canvas = within(canvasElement);

    const roleRow = canvas.getByText('stytch_admin');
    await userEvent.click(roleRow);

    const addButton = canvas.getByRole('button', { name: 'Add Role assignment' });
    await userEvent.click(addButton);

    const modal = getByRole(canvasElement.ownerDocument.body, 'dialog');
    const modalSavebutton = within(modal).getByRole('button', { name: 'Save' });

    await waitFor(() => expect(modalSavebutton).toBeDisabled());

    const roleSelect = within(modal).getByLabelText('Select Role');
    await userEvent.click(roleSelect);

    const roleMenu = await getByRole(document.body, 'listbox');

    await waitFor(() => expect(modalSavebutton).toBeDisabled());

    const menuItems = within(roleMenu).getAllByRole('menuitem');
    await userEvent.click(menuItems[0]);

    const sourceSelect = within(modal).getByLabelText('Select Source');
    await userEvent.click(sourceSelect);

    const sourceMenu = await getByRole(document.body, 'listbox');

    const ssoMenuItem = within(sourceMenu).getByRole('menuitem', { name: 'SSO' });
    await userEvent.click(ssoMenuItem);
  },
} satisfies Story;

export const FlowAddSSOGroupConnectionAssignment = {
  ...FlowAddSSOConnectionAssignment,

  play: async (params) => {
    await FlowAddSSOConnectionAssignment.play(params);
    const { canvasElement } = params;
    const modal = await waitFor(() => getByRole(canvasElement.ownerDocument.body, 'dialog'));

    const displayNameSelect = within(modal).getByLabelText('Select');
    await userEvent.click(displayNameSelect);

    const displayNameMenu = await getByRole(document.body, 'listbox');

    const connectionMenuItem = await within(displayNameMenu).getByRole('menuitem', {
      name: 'Fake okta SAML connection',
    });
    await userEvent.click(connectionMenuItem);
    await waitForElementToBeRemoved(connectionMenuItem);

    const groupNameInput = within(modal).getByLabelText('Group name');
    await userEvent.type(groupNameInput, 'Group with spaces');

    await expect(groupNameInput).toBeEnabled();
    await expect(groupNameInput).toHaveValue('Group with spaces');
  },
} satisfies Story;

export const FlowAddSSOGroupConnectionAssignmentMultiple = {
  ...FlowAddSSOGroupConnectionAssignment,
  play: async (params) => {
    await FlowAddSSOGroupConnectionAssignment.play(params);
    const { canvasElement } = params;
    const modal = await waitFor(() => getByRole(canvasElement.ownerDocument.body, 'dialog'));

    const addButton = within(modal).getByRole('button', { name: 'Add SSO Role assignment' });
    await userEvent.click(addButton);

    const displayNameSelect = within(modal).getByLabelText('Select');
    await userEvent.click(displayNameSelect);

    const displayNameMenu = await getByRole(document.body, 'listbox');

    const connectionMenuItem = await within(displayNameMenu).getByRole('menuitem', {
      name: 'Fake okta SAML connection',
    });
    await userEvent.click(connectionMenuItem);

    const groupNameInputs = await within(modal).findAllByLabelText('Group name');
    const newGroupNameInput = groupNameInputs[1];

    await userEvent.type(newGroupNameInput, 'Additional group');

    await expect(newGroupNameInput).toBeEnabled();
    await expect(newGroupNameInput).toHaveValue('Additional group');
  },
} satisfies Story;

export const FlowAddSSOGroupConnectionAssignmentSave = {
  ...FlowAddSSOGroupConnectionAssignment,
  play: async (params) => {
    await FlowAddSSOGroupConnectionAssignment.play(params);

    const { canvasElement, canvas } = params;

    const modal = getByRole(canvasElement.ownerDocument.body, 'dialog');
    const modalSavebutton = within(modal).getByRole('button', { name: 'Save' });

    await userEvent.click(modalSavebutton);

    const row = (await canvas.findByText('stytch_member')).closest('tr');
    expect(row).toBeInTheDocument();

    const nextRow = row!.nextElementSibling;
    expect(nextRow).toBeInTheDocument();

    const table = await within(nextRow as HTMLElement).findByRole('table');
    await expect(await within(table).findByText('Group with spaces')).toBeInTheDocument();
  },
} satisfies Story;

export const FlowAddSSOGroupConnectionAssignmentMultipleSave = {
  ...FlowAddSSOGroupConnectionAssignmentMultiple,
  play: async (params) => {
    await FlowAddSSOGroupConnectionAssignmentMultiple.play(params);

    const { canvasElement, canvas } = params;

    const modal = getByRole(canvasElement.ownerDocument.body, 'dialog');
    const modalSavebutton = within(modal).getByRole('button', { name: 'Save' });

    await userEvent.click(modalSavebutton);

    const row = (await canvas.findByText('stytch_member')).closest('tr');
    expect(row).toBeInTheDocument();

    const nextRow = row!.nextElementSibling;
    expect(nextRow).toBeInTheDocument();

    const table = await within(nextRow as HTMLElement).findByRole('table');
    await expect(await within(table).findByText('Group with spaces')).toBeInTheDocument();
    await expect(await within(table).findByText('Additional group')).toBeInTheDocument();
  },
} satisfies Story;

export const FlowAddSSOConnectionAssignmentWithoutGroup = {
  ...FlowClickEdit,
  play: async (params) => {
    await FlowClickEdit.play(params);

    const { canvasElement } = params;
    const canvas = within(canvasElement);

    const roleRow = canvas.getByText('stytch_admin');
    await userEvent.click(roleRow);

    const addButton = canvas.getByRole('button', { name: 'Add Role assignment' });
    await userEvent.click(addButton);

    const modal = getByRole(canvasElement.ownerDocument.body, 'dialog');
    const modalSavebutton = within(modal).getByRole('button', { name: 'Save' });

    await waitFor(() => expect(modalSavebutton).toBeDisabled());

    const roleSelect = within(modal).getByLabelText('Select Role');
    await userEvent.click(roleSelect);

    const roleMenu = await getByRole(document.body, 'listbox');

    await waitFor(() => expect(modalSavebutton).toBeDisabled());

    const menuItems = within(roleMenu).getAllByRole('menuitem');
    await userEvent.click(menuItems[2]);

    const sourceSelect = within(modal).getByLabelText('Select Source');
    await userEvent.click(sourceSelect);

    const sourceMenu = await getByRole(document.body, 'listbox');

    const ssoMenuItem = within(sourceMenu).getByRole('menuitem', { name: 'SSO' });
    await userEvent.click(ssoMenuItem);

    const displayNameSelect = within(modal).getByLabelText('Select');
    await userEvent.click(displayNameSelect);

    const displayNameMenu = await getByRole(document.body, 'listbox');
    const connectionMenuItem = await within(displayNameMenu).getByRole('menuitem', {
      name: 'Fake SAML Connection 5',
    });
    await userEvent.click(connectionMenuItem);

    const groupNameInput = within(modal).getByLabelText('Group name');

    await expect(groupNameInput).toBeDisabled();
    await expect(groupNameInput).toHaveAttribute('placeholder', 'Add a "groups" key first');
    await expect(groupNameInput).toHaveValue('');

    await userEvent.click(modalSavebutton);

    await waitFor(() =>
      expect(canvas.getByText('organization_update.settings.default-sso-connection')).toBeInTheDocument(),
    );
  },
} satisfies Story;

export const FlowAddSCIMConnectionAssignment = {
  ...FlowClickEdit,
  play: async (params) => {
    await FlowClickEdit.play(params);

    const { canvasElement } = params;
    const canvas = within(canvasElement);

    const addButton = canvas.getByRole('button', { name: 'Add Role assignment' });
    await userEvent.click(addButton);

    const modal = getByRole(canvasElement.ownerDocument.body, 'dialog');
    const modalSavebutton = within(modal).getByRole('button', { name: 'Save' });

    await waitFor(() => expect(modalSavebutton).toBeDisabled());

    const roleSelect = within(modal).getByLabelText('Select Role');
    await userEvent.click(roleSelect);

    const roleMenu = await getByRole(document.body, 'listbox');

    await waitFor(() => expect(modalSavebutton).toBeDisabled());

    const menuItems = within(roleMenu).getAllByRole('menuitem');
    await userEvent.click(menuItems[0]);

    const sourceSelect = within(modal).getByLabelText('Select Source');
    await userEvent.click(sourceSelect);

    const sourceMenu = await getByRole(document.body, 'listbox');

    const sourceMenuItems = within(sourceMenu).getAllByRole('menuitem');
    await userEvent.click(sourceMenuItems[2]);

    const input = await findByRole(document.body, 'combobox', { name: 'Group name' });
    await userEvent.type(input, 'readers');

    const options = await getAllByRole(document.body, 'option');
    await userEvent.click(options[0]);

    await userEvent.click(modalSavebutton);
    await waitFor(() => expect(canvas.getByText('readers')).toBeInTheDocument());
  },
} satisfies Story;

const fakeScimGroups = Array.from({ length: 2000 }, (_, i) => {
  return {
    group_id: `scim_group_id${i}`,
    group_name: `Engineering ${i}`,
    organization_id: MOCK_ORGANIZATION.organization_id,
    connection_id: 'scim-connection-test-cdd5415a-c470-42be-8369-5c90cf7762dc',
  } satisfies SCIMGroup;
});

export const FlowManySCIMConnections = {
  parameters: {
    msw: {
      handlers: {
        b2bScimGroups: http.post<
          never,
          B2BSCIMGetConnectionGroupsOptions,
          DataResponse<B2BSCIMGetConnectionGroupsResponse>
        >('https://api.stytch.com/sdk/v1/b2b/scim/groups', async ({ request }) => {
          const { cursor, limit } = await request.json();

          const startIndex = cursor ? parseInt(cursor, 10) : 0;
          const endIndex = startIndex + (limit ?? MAX_LIMIT_CONNECTION_GROUPS);

          const pageScimGroups = fakeScimGroups.slice(startIndex, endIndex);

          return HttpResponse.json({
            data: {
              next_cursor: endIndex < fakeScimGroups.length ? endIndex.toString() : null,
              scim_groups: pageScimGroups,
              request_id: 'request-id-test-b05c992f-ebdc-489d-a754-c7e70ba13141',
              status_code: 200,
            },
          });
        }),
      },
    },
  },
} satisfies Story;

const organizationWithOnlySsoAssignments = {
  ...organizationMeResponse,
  rbac_email_implicit_role_assignments: [],
  scim_active_connection: null,
} satisfies Organization;

export const FlowDeleteSSOConnectionAssignments = {
  args: {
    orgInfo: organizationWithOnlySsoAssignments,
  },
  parameters: {
    msw: {
      handlers: {
        b2bOrganizationMe: http.get<never, never, DataResponse<{ organization: Organization } & ResponseCommon>>(
          'https://api.stytch.com/sdk/v1/b2b/organizations/me',
          () => {
            return HttpResponse.json({
              data: {
                organization: organizationWithOnlySsoAssignments,
                request_id: 'request-id-test-896c625f-89a6-4a0d-8615-3dcbdf00314d',
                status_code: 200,
              },
            });
          },
        ),
        b2bScim: http.get<never, never, DataResponse<B2BSCIMGetConnectionResponse>>(
          'https://api.stytch.com/sdk/v1/b2b/scim',
          () => {
            return HttpResponse.json({
              data: {
                connection: null as unknown as SCIMConnection,
                request_id: 'request-id-test-602dffcd-603a-471d-b3ca-60f01f7215da',
                status_code: 200,
              },
            });
          },
        ),
      },
    },
  },
  play: async (params) => {
    await FlowClickEdit.play(params);

    const { canvas } = params;

    const saveButton = await canvas.findByRole('button', { name: 'Save' });
    await expect(saveButton).toBeDisabled();

    const expandButtons = canvas.getAllByRole('button', { name: 'expand row' });

    for (const expandButton of expandButtons) {
      await userEvent.click(expandButton);

      const innerTable = within(expandButton.closest('tr')!.nextElementSibling as HTMLElement).getByRole('table');
      const ssoRows = within(innerTable)
        .getAllByRole('row')
        .filter((row) => within(row).queryByRole('cell', { name: 'SSO' }));

      for (const ssoRow of ssoRows) {
        const deleteButton = within(ssoRow).getByRole('button', { name: 'Delete' });
        await userEvent.click(deleteButton);
      }
    }

    await expect(saveButton).toBeEnabled();
  },
} satisfies Story;
