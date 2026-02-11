import type { Meta, StoryObj } from '@storybook/react';

import { SubmitButton, SubmitButtonProps } from './SubmitButton';

const meta = {
  component: SubmitButton,
  args: {
    isSubmitting: false,
    disabled: false,
    text: 'Submit',
  },
  tags: ['autodocs'],
} satisfies Meta<SubmitButtonProps>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary = {} satisfies Story;

export const PrimarySubmitting = {
  args: {
    isSubmitting: true,
  },
} satisfies Story;
