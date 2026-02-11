import type { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';

import EmailInput from './EmailInput';

const meta = {
  component: EmailInput,
  args: {
    email: '',
    setEmail: fn(),
  },
  argTypes: {
    hideLabel: {
      control: { type: 'boolean' },
    },
    hasPasskeys: {
      control: { type: 'boolean' },
    },
    disabled: {
      control: { type: 'boolean' },
    },
  },
} satisfies Meta<typeof EmailInput>;

export default meta;

type Story = StoryObj<typeof meta>;

export const _EmailInput = {} satisfies Story;
