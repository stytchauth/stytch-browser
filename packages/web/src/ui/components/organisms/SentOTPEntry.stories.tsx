import type { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';

import { SentOTPEntry } from './SentOTPEntry';

const meta: Meta<typeof SentOTPEntry> = {
  component: SentOTPEntry,
  args: {
    expiration: Date.now() + 1000 * 60 * 5,
    formattedDestination: '+1 (123) 456-7890',
    isSubmitting: false,
    onSubmit: fn(),
  },
  argTypes: {
    onSubmit: { action: 'submit' },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const _SentOTPEntry = {} satisfies Story;

export const WithError = {
  args: {
    errorMessage: 'Invalid passcode, please try again.',
  },
} satisfies Story;

export const ExpiredCode = {
  args: {
    expiration: Date.now() - 1000,
  },
} satisfies Story;

export const Submitting = {
  args: {
    isSubmitting: true,
  },
} satisfies Story;
