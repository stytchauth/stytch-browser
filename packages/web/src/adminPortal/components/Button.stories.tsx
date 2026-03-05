import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';

import { Button, ButtonProps } from './Button';

const meta = {
  component: Button,
  tags: ['autodocs'],
  render: (args, context) => {
    const Component = context.component as typeof Button;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Component {...args} />
        <Component {...args} disabled>
          {args.children} (disabled)
        </Component>
        <Component {...args} warning>
          {args.children} (warning)
        </Component>
        <Component {...args} disabled warning>
          {args.children} (disabled warning)
        </Component>
      </div>
    );
  },
  parameters: {
    adminPortal: true,
  },
} satisfies Meta<ButtonProps>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary = {
  args: {
    children: 'Primary Button',
    variant: 'primary',
  },
} satisfies Story;

export const Ghost = {
  args: {
    children: 'Ghost Button',
    variant: 'ghost',
  },
} satisfies Story;

export const Text = {
  args: {
    children: 'Text Button',
    variant: 'text',
  },
} satisfies Story;
