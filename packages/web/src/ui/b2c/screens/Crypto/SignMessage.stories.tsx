import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import { SignMessage } from './SignMessage';

const meta = {
  component: SignMessage,
  parameters: {
    stytch: {
      disableSnackbar: true,
    },
  },
} satisfies Meta<typeof SignMessage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const _SignMessage: Story = {
  play: async ({ canvas }) => {
    await expect(await canvas.findByText('Completing signature request...')).toBeInTheDocument();
  },
};
