import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { useArgs } from 'storybook/preview-api';
import { fn } from 'storybook/test';

import { PasswordInput, PasswordInputProps } from './PasswordInput';

const meta = {
  component: PasswordInput,
  args: {
    password: '',
    setPassword: fn(),
    type: 'new',
  },
  argTypes: {
    type: {
      options: ['new', 'current'],
      control: { type: 'select' },
    },
    hideLabel: {
      control: { type: 'boolean' },
    },
  },
  render: function Render() {
    const [{ setPassword, ...args }, updateArgs] = useArgs<PasswordInputProps>();
    return (
      <PasswordInput
        setPassword={(password) => {
          updateArgs({ password });
          setPassword(password);
        }}
        {...args}
      />
    );
  },
} satisfies Meta<typeof PasswordInput>;

export default meta;

type Story = StoryObj<typeof meta>;

export const _PasswordInput = {} satisfies Story;
