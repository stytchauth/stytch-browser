import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import { EmailConfirmation } from './EmailConfirmation';

const meta = {
  component: EmailConfirmation,
  argTypes: {
    showGoBack: { type: 'boolean' },
  },
  parameters: {
    stytch: {
      disableSnackbar: true,
    },
  },
} satisfies Meta<typeof EmailConfirmation>;

export default meta;

type Story = StoryObj<typeof meta>;

export const _EmailConfirmation = {
  play: async ({ canvas }) => {
    await expect(await canvas.findByText('Check your email')).toBeInTheDocument();
  },
} satisfies Story;
