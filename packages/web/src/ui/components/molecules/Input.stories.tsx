import type { Meta, StoryObj } from '@storybook/react-vite';
import React, { useState } from 'react';
import { fn } from 'storybook/test';

import Button from '../atoms/Button';
import Input from './Input';

const meta = {
  component: Input,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    id: 'input',
    label: 'Label',
    onChange: fn(),
  },
  argTypes: {
    disabled: { type: 'boolean' },
  },
} satisfies Meta<typeof Input>;

export default meta;

type Story = StoryObj<typeof meta>;

export const _Input = {} satisfies Story;

export const HideLabel = {
  args: { hideLabel: true },
} satisfies Story;

export const Placeholder = {
  args: {
    label: 'Email',
    type: 'email',
    placeholder: 'example@example.com',
  },
} satisfies Story;

export const Action = {
  args: {
    label: 'Password',
  },
  render: function Render(props) {
    const [showPassword, setShowPassword] = useState(false);
    return (
      <Input
        {...props}
        type={showPassword ? 'password' : 'text'}
        action={
          <Button onClick={() => setShowPassword(!showPassword)} variant="outline">
            {showPassword ? 'Hide' : 'Show'} password
          </Button>
        }
      />
    );
  },
} satisfies Story;
