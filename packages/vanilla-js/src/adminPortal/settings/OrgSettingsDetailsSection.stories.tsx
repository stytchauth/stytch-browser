import {
  invalidOrganizationSlugMessage,
  makeB2BSessionAuthenticateHandler,
  organizationMeResponse,
} from '../../../.storybook/handlers';
import type { Meta, StoryObj } from '@storybook/react';
import { userEvent, waitFor, within, expect } from '@storybook/test';
import { OrgSettingsDetailsSection } from './OrgSettingsDetailsSection';

const meta = {
  args: {
    orgInfo: organizationMeResponse,
  },
  component: OrgSettingsDetailsSection,
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

export const View = {} satisfies Story;

export const FlowClickEdit = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => expect(canvas.getByText('Edit')));
    const editbutton = canvas.getByRole('button', { name: 'Edit' });
    await userEvent.click(editbutton);
  },
} satisfies Story;

export const FlowUpdateSuccess = {
  ...FlowClickEdit,
  play: async (params) => {
    const { canvasElement } = params;
    const canvas = within(canvasElement);

    await FlowClickEdit.play(params);

    const slugInput = canvas.getByPlaceholderText('Enter Slug');
    await userEvent.clear(slugInput);
    await userEvent.type(slugInput, 'stytch');

    const saveButton = canvas.getByRole('button', { name: 'Save' });
    await userEvent.click(saveButton);

    const body = canvasElement.ownerDocument.body;
    const modal = within(body);
    await waitFor(() => expect(modal.findByText('Save changes?')));

    const saveChangesButton = modal.getByRole('button', { name: 'Save changes' });

    await userEvent.click(saveChangesButton);
    await waitFor(() => expect(canvas.getByText('Edit')).toBeVisible());
  },
} satisfies Story;

export const FlowUpdateFailure = {
  ...FlowClickEdit,
  play: async (params) => {
    const { canvasElement } = params;
    const canvas = within(canvasElement);
    await FlowClickEdit.play(params);

    const slugInput = canvas.getByPlaceholderText('Enter Slug');
    await userEvent.clear(slugInput);
    await userEvent.type(slugInput, 'stytch 1');
    const saveButton = canvas.getByRole('button', { name: 'Save' });

    await userEvent.click(saveButton);
    const body = canvasElement.ownerDocument.body;
    const modal = within(body);
    await waitFor(() => expect(modal.findByText('Save changes?')));

    const saveChangesButton = modal.getByRole('button', { name: 'Save changes' });
    await userEvent.click(saveChangesButton);
    await waitFor(() => expect(modal.getByRole('alert')));

    await waitFor(() => expect(slugInput, 'stytch 1').toBeInTheDocument());

    const toast = canvas.getByRole('alert');
    await waitFor(() => expect(toast).toHaveTextContent(invalidOrganizationSlugMessage));
  },
} satisfies Story;
