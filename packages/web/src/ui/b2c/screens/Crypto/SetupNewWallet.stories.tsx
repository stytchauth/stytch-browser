import type { Meta, StoryObj } from '@storybook/react';
import { expect } from 'storybook/test';

import { SetupNewWallet } from './SetupNewWallet';

const meta = {
  component: SetupNewWallet,
  parameters: {
    stytch: {
      disableSnackbar: true,
    },
  },
} satisfies Meta<typeof SetupNewWallet>;

export default meta;
type Story = StoryObj<typeof meta>;

export const _SetupNewWallet: Story = {
  play: async ({ canvas }) => {
    await expect(await canvas.findByText('Set up a new crypto wallet')).toBeInTheDocument();
  },
};
