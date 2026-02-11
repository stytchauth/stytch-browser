import type { Meta, StoryObj } from '@storybook/react';
import { expect } from '@storybook/test';
import { OtherCryptoWallets } from './OtherWallets';

const meta = {
  component: OtherCryptoWallets,
  parameters: {
    stytch: {
      disableSnackbar: true,
    },
  },
} satisfies Meta<typeof OtherCryptoWallets>;

export default meta;
type Story = StoryObj<typeof meta>;

export const _OtherWallets: Story = {
  play: async ({ canvas }) => {
    await expect(await canvas.findByText('Continue with other wallet')).toBeInTheDocument();
  },
};
