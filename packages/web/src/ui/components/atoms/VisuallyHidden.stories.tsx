import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';

import Button from './Button';
import VisuallyHidden from './VisuallyHidden';

const meta = {
  component: VisuallyHidden,
  argTypes: {
    focusable: { type: 'boolean' },
    children: { type: 'string' },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof VisuallyHidden>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Hidden = {
  args: {
    children: 'This text is hidden but accessible to screen readers',
  },
  render: (args) => (
    <div>
      <p>There is visually hidden text between this line...</p>
      <VisuallyHidden {...args} />
      <p>...and this line. Use screen reader to hear it.</p>
    </div>
  ),
} satisfies Story;

export const Focusable = {
  args: {
    children: 'This text is hidden but becomes visible when focused',
    focusable: true,
  },
  render: (args) => (
    <div>
      <p>Focus the button below to focus the hidden element:</p>
      <VisuallyHidden {...args}>
        <p>{args.children}</p>
        <Button variant="outline" onClick={() => alert('Visually hidden button clicked!')}>
          Focus me
        </Button>
      </VisuallyHidden>
    </div>
  ),
} satisfies Story;
