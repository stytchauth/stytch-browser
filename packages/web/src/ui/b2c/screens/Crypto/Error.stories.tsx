import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import { Error } from './Error';

const meta = {
  component: Error,
  parameters: {
    stytch: {
      disableSnackbar: true,
    },
  },
} satisfies Meta<typeof Error>;

export default meta;
type Story = StoryObj<typeof meta>;

export const _Error: Story = {
  play: async ({ canvas }) => {
    await expect(await canvas.findByText('Looks like there was an error')).toBeInTheDocument();
  },
};
