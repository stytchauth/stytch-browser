import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { TOTPEntry } from './TOTPEntry';

const meta = {
  component: TOTPEntry,
  args: {
    onSubmit: fn(),
    isSubmitting: false,
    helperContent: 'If the verification code doesn’t work, go back to your authenticator app to get a new code.',
  },
  argTypes: {
    onSubmit: { action: 'submit' },
  },
} satisfies Meta<typeof TOTPEntry>;

export default meta;

type Story = StoryObj<typeof meta>;

export const _TOTPEntry = {} satisfies Story;

export const WithError = {
  args: {
    errorMessage: 'Invalid passcode, please try again.',
  },
} satisfies Story;

export const Submitting = {
  args: {
    isSubmitting: true,
  },
} satisfies Story;
