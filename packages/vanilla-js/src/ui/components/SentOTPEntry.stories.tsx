import type { Meta, StoryObj } from '@storybook/react';
import { SentOTPEntry } from './SentOTPEntry';
import { fn } from '@storybook/test';

const meta = {
  component: SentOTPEntry,
  args: {
    expiration: new Date(Date.now() + 1000 * 60 * 5),
    formattedDestination: '+1 (123) 456-7890',
    isSubmitting: false,
    onSubmit: fn(),
    resendOTP: fn(),
  },
  argTypes: {
    onSubmit: { action: 'submit' },
    resendOTP: { action: 'resendOTP' },
  },
} satisfies Meta<typeof SentOTPEntry>;

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
    expiration: new Date(Date.now() - 1000),
  },
} satisfies Story;

export const Submitting = {
  args: {
    isSubmitting: true,
  },
} satisfies Story;
