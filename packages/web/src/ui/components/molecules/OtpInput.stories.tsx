import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent } from 'storybook/test';

import OtpInput from './OtpInput';

const onSubmit = fn();

const meta = {
  component: OtpInput,
  parameters: {
    layout: 'centered',
  },
  args: {
    onSubmit,
    defaultOtp: '',
    disabled: false,
  },
  argTypes: {
    defaultOtp: {
      control: { type: 'text' },
    },
  },
} satisfies Meta<typeof OtpInput>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default = {} satisfies Story;

export const PasteBehavior = {
  play: async ({ canvas }) => {
    const input = canvas.getByLabelText('One-time passcode');
    await userEvent.click(input);
    await userEvent.paste(' 123-456 ');
    await expect(onSubmit).toHaveBeenCalledWith('123456');
  },
} satisfies Story;
