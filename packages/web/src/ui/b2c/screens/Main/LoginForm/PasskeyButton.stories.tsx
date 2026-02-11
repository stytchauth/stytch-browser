import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn } from 'storybook/test';

import { PasskeyButton } from './PasskeyButton';

const meta = {
  component: PasskeyButton,
  args: {
    startPasskeyAuth: fn(),
  },
  parameters: {
    stytch: {
      disableSnackbar: true,
    },
  },
} satisfies Meta<typeof PasskeyButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const _PasskeyButton = {
  play: async ({ canvas }) => {
    await expect(await canvas.findByText('Login with a Passkey')).toBeInTheDocument();
    await expect(await canvas.findByRole('button', { name: /Login with a Passkey/ })).toBeEnabled();
  },
} satisfies Story;
