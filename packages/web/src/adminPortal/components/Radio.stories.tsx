import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';

import { Radio, RadioProps } from './Radio';

type RenderProps = Omit<RadioProps, 'checked'>;

const meta = {
  // Workaround type inference issue with custom render function
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: Radio as any,
  tags: ['autodocs'],
  args: {
    value: 'value',
  },
  render: (args: RenderProps) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <Radio {...args} checked={false} />
      <Radio {...args} checked />
    </div>
  ),
  parameters: {
    adminPortal: true,
  },
} satisfies Meta<RenderProps>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Enabled = {
  args: {
    label: 'Radio',
  },
} satisfies Story;

export const Disabled = {
  args: {
    label: 'Disabled',
    disabled: true,
  },
} satisfies Story;
