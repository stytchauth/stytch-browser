import type { Meta, StoryObj } from '@storybook/react';
import { expect } from 'storybook/test';

import { ConnectWallet } from './ConnectWallet';

const meta = {
  component: ConnectWallet,
  parameters: {
    stytch: {
      disableSnackbar: true,
    },
  },
} satisfies Meta<typeof ConnectWallet>;

export default meta;
type Story = StoryObj<typeof meta>;

export const _ConnectWallet: Story = {
  play: async ({ canvas }) => {
    await expect(await canvas.findByText('Connecting to your wallet...')).toBeInTheDocument();
  },
};
