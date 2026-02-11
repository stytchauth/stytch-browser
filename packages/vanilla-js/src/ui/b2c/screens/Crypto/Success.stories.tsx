import type { Meta, StoryObj } from '@storybook/react';
import { expect } from '@storybook/test';
import { Success } from './Success';

const meta = {
  component: Success,
  parameters: {
    stytch: {
      disableSnackbar: true,
    },
  },
} satisfies Meta<typeof Success>;

export default meta;
type Story = StoryObj<typeof meta>;

export const _Success: Story = {
  play: async ({ canvas }) => {
    await expect(await canvas.findByText('You have successfully connected your wallet.')).toBeInTheDocument();
  },
};
