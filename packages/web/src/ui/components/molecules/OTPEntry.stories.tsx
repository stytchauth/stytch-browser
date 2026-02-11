import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { expect, userEvent, waitFor } from 'storybook/test';

import OTPEntry from './OTPEntry';

const meta: Meta<typeof InteractiveComponent> = {
  component: OTPEntry,
  args: {},
  parameters: {
    layout: 'centered',
  },
  render: () => <InteractiveComponent />,
};

export default meta;

type Story = StoryObj<typeof meta>;

const InteractiveComponent = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();

  return (
    <OTPEntry
      header="Enter verification code"
      instruction="Please enter the 6-digit code sent to your device"
      helperContent="Didn't receive a code? Check your spam folder or request a new one."
      isSubmitting={isSubmitting}
      errorMessage={errorMessage}
      onSubmit={(otp) => {
        setIsSubmitting(true);
        setErrorMessage(undefined);

        // Simulate API call
        setTimeout(() => {
          if (otp === '123456') {
            setIsSubmitting(false);
            // Success - could show success state or redirect
          } else {
            setIsSubmitting(false);
            setErrorMessage('Invalid code. Please try again.');
          }
        }, 100);
      }}
    />
  );
};

export const Default = {} satisfies Story;

export const PartialInput: Story = {
  play: async ({ canvas }) => {
    const input = canvas.getByLabelText('One-time passcode');
    await userEvent.type(input, '1234', { delay: 100 });

    await expect(input).toHaveValue('1234');
    await expect(input).toHaveFocus();
  },
};

export const CompleteInput = {
  play: async ({ canvas }) => {
    const input = canvas.getByLabelText('One-time passcode');
    await userEvent.type(input, '123456', { delay: 100 });

    await expect(input).toHaveValue('123456');

    // Submitting
    await expect(input).toBeDisabled();

    await waitFor(async () => {
      await expect(input).toBeEnabled();
    });
  },
} satisfies Story;

export const WithError = {
  play: async ({ canvas }) => {
    const input = canvas.getByLabelText('One-time passcode');
    await userEvent.type(input, '999999', { delay: 100 });

    await expect(input).toHaveValue('999999');

    // Submitting
    await expect(input).toBeDisabled();

    await waitFor(async () => {
      await expect(input).toBeEnabled();
    });

    // Check for error message - wait for it to appear
    await waitFor(async () => {
      await expect(canvas.getByText('Invalid code. Please try again.')).toBeInTheDocument();
    });
  },
} satisfies Story;

export const Backspace = {
  ...CompleteInput,
  play: async (params) => {
    await CompleteInput.play(params);

    const input = params.canvas.getByLabelText('One-time passcode');
    await userEvent.click(input);
    // Something in input-otp breaks this test without this delay. I suspect this is caused by
    // the weird setTimeout nonsense in
    // https://github.com/guilhermerodz/input-otp/blob/fc38e258bdb8fe2bb07c8c6a76562a26673a446a/packages/input-otp/src/input.tsx#L241
    await new Promise((resolve) => setTimeout(resolve, 10));
    await userEvent.type(input, '{backspace}');
    await expect(input).toHaveValue('12345');
  },
} satisfies Story;

export const PastedInput = {
  play: async ({ canvas }) => {
    const input = canvas.getByLabelText('One-time passcode');
    await userEvent.click(input);
    await userEvent.paste('123456');

    await expect(input).toHaveValue('123456');

    // Submitting
    await expect(input).toBeDisabled();

    await waitFor(async () => {
      await expect(input).toBeEnabled();
    });
  },
} satisfies Story;
