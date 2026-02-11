import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor } from '@storybook/test';
import React, { useState } from 'react';
import { OTPControl } from './OTPControl';

const meta: Meta<typeof InteractiveComponent> = {
  component: OTPControl,
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
  return (
    <OTPControl
      isSubmitting={isSubmitting}
      onSubmit={() => {
        setIsSubmitting(true);
        setTimeout(() => {
          setIsSubmitting(false);
        }, 200);
      }}
    />
  );
};

export const _OTPControl = {} satisfies Story;

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

    await expect(input).toBeDisabled();

    await waitFor(async () => {
      await expect(input).toBeEnabled();
    });
    await waitFor(async () => {
      await expect(input).toHaveFocus();
    });
  },
} satisfies Story;

export const Backspace = {
  ...CompleteInput,
  play: async (params) => {
    await CompleteInput.play(params);

    const input = params.canvas.getByLabelText('One-time passcode');

    await userEvent.keyboard('{backspace}');
    await expect(input).toHaveValue('12345');
  },
} satisfies Story;

export const PastedInput = {
  play: async ({ canvas }) => {
    const input = canvas.getByLabelText('One-time passcode');
    await userEvent.click(input);
    await userEvent.paste('123456');

    await expect(input).toHaveValue('123456');

    await expect(input).toBeDisabled();

    await waitFor(async () => {
      await expect(input).toBeEnabled();
    });
    await waitFor(async () => {
      await expect(input).toHaveFocus();
    });
  },
} satisfies Story;
