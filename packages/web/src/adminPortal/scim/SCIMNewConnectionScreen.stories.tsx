import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, getByRole, userEvent, waitFor, waitForElementToBeRemoved, within } from 'storybook/test';

import { makeB2BSessionAuthenticateHandler } from '../../../.storybook/handlers';
import { SCIMNewConnectionScreen } from './SCIMNewConnectionScreen';

const meta = {
  component: SCIMNewConnectionScreen,
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

export const Default = {} satisfies Story;

export const FlowCreateConnection = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const createButton = canvas.getByRole('button', { name: 'Create' });

    const button = canvas.getByRole('combobox');
    await userEvent.click(button);

    await waitFor(() => expect(createButton).toBeDisabled());

    const idpMenu = await getByRole(document.body, 'listbox');
    const [oktaMenuItem] = within(idpMenu).getAllByRole('menuitem');
    await userEvent.click(oktaMenuItem);
    await waitForElementToBeRemoved(oktaMenuItem);

    await expect(idpMenu).toHaveTextContent('Okta');

    const input = canvas.getByPlaceholderText('Display name');
    await userEvent.type(input, 'test');
    await expect(input).toHaveValue('test');

    await waitFor(() => expect(createButton).toBeEnabled());
  },
} satisfies Story;
