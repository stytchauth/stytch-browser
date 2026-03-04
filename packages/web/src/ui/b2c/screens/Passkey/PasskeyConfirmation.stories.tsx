import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import { PasskeyConfirmation } from './PasskeyConfirmation';

const meta = {
  component: PasskeyConfirmation,
  parameters: {
    stytch: {
      disableSnackbar: true,
    },
  },
} satisfies Meta<typeof PasskeyConfirmation>;

export default meta;
type Story = StoryObj<typeof meta>;

export const _PasskeyConfirmation: Story = {
  play: async ({ canvas }) => {
    await expect(await canvas.findByText('Your Passkey has been successfully authenticated.')).toBeInTheDocument();
  },
};
