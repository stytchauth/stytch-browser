import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';

import { CircularProgress, CircularProgressProps } from './CircularProgress';

const meta = {
  component: CircularProgress,
  parameters: {
    layout: 'centered',
  },
  args: {
    size: 40,
  },
  argTypes: {
    thickness: { type: 'number' },
    color: { type: 'string' },
  },
  tags: ['autodocs'],
  render: ({ color, ...args }) => (
    <div style={{ color }}>
      <CircularProgress {...args} />
    </div>
  ),
} satisfies Meta<CircularProgressProps & { color?: string }>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default = {} satisfies Story;

export const Small = {
  args: {
    size: 16,
  },
} satisfies Story;

export const Large = {
  args: {
    size: 60,
  },
} satisfies Story;
