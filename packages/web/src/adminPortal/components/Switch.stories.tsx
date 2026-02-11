import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';

import { Switch, SwitchProps } from './Switch';

const meta = {
  component: Switch,
  tags: ['autodocs'],
  render: (args, context) => {
    const Component = context.component as typeof Switch;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Component {...args} />
        <Component {...args} checked />
      </div>
    );
  },
} satisfies Meta<SwitchProps>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Enabled = {
  args: {
    label: 'Enabled',
  },
} satisfies Story;

export const ReadOnly = {
  args: {
    label: 'Read Only',
    readOnly: true,
  },
} satisfies Story;
