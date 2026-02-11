import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent } from '@storybook/test';
import React, { useState } from 'react';
import { OTPInput } from './OTPInput';

const meta = {
  component: OTPInput,
  args: {
    otp: '',
    setOtp: fn(),
  },
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof OTPInput>;

export default meta;

type Story = StoryObj<typeof meta>;

const InteractiveComponent = ({ setOtp: setOtpArg }: { setOtp: (otp: string) => void }) => {
  const [otp, setOtp] = useState('');
  return (
    <OTPInput
      otp={otp}
      setOtp={(otp) => {
        setOtp(otp);
        setOtpArg(otp);
      }}
    />
  );
};

export const _OTPInput = {
  play: async ({ args, canvas }) => {
    const input = await canvas.findByLabelText('One-time passcode');
    await userEvent.type(input, '123456');
    await expect(input).toHaveValue('123456');
    await expect(args.setOtp).toBeCalledTimes(6);
    await expect(args.setOtp).lastCalledWith('123456');
  },
} satisfies Story;

export const WithPartialValue = {
  args: {
    otp: '1234',
  },
} satisfies Story;

export const WithCompleteValue = {
  args: {
    otp: '123456',
  },
} satisfies Story;

export const Interactive = {
  render: (args) => <InteractiveComponent setOtp={args.setOtp} />,
} satisfies Story;

export const InvalidInput = {
  ...Interactive,
  play: async ({ args, canvas }) => {
    const input = await canvas.findByLabelText('One-time passcode');
    await userEvent.type(input, '123abc45');
    await expect(input).toHaveValue('12345');
    await expect(args.setOtp.mock.calls).toStrictEqual([['1'], ['12'], ['123'], ['1234'], ['12345']]);
  },
} satisfies Story;

export const PastedInput: Story = {
  ...Interactive,
  play: async ({ args, canvas }) => {
    const input = await canvas.findByLabelText('One-time passcode');
    await userEvent.click(input);
    await userEvent.paste('abc: 123456.');
    await expect(input).toHaveValue('123456');
    await expect(args.setOtp.mock.calls).toStrictEqual([['123456']]);
  },
};
