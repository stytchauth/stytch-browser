import type { Meta, StoryObj } from '@storybook/react-vite';
import React, { ComponentType } from 'react';
import { fn } from 'storybook/test';

import { useCountdown } from '../atoms/Countdown';
import { ResendOTPButton, ResendOTPButtonProps } from './ResendOTPButton';

type RenderProps = Omit<ResendOTPButtonProps, 'countdown'>;
const resendOTP = fn(() => Promise.resolve());

const meta = {
  component: ResendOTPButton as ComponentType<RenderProps>,
  parameters: {
    layout: 'centered',
  },
  args: {
    isSubmitting: false,
    resendOTP,
  },
  render: function Render(args) {
    const countdown = useCountdown();
    return <ResendOTPButton {...args} countdown={countdown} />;
  },
} satisfies Meta<RenderProps>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default = {} satisfies Story;

export const Submitting = {
  args: {
    isSubmitting: true,
  },
} satisfies Story;

export const WithResendError: Story = {
  args: {
    resendOTP: fn(
      () =>
        new Promise<void>((_resolve, reject) => {
          setTimeout(() => {
            reject(new Error('Oh no bees'));
          }, 2_500);
        }),
    ),
  },
};
