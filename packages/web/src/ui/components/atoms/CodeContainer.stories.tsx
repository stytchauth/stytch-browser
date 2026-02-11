import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';

import CodeContainer from './CodeContainer';
import Typography from './Typography';

const meta = {
  component: CodeContainer,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof CodeContainer>;

export default meta;

type Story = StoryObj<typeof meta>;

export const _CodeContainer = {
  args: {
    children: <Typography font="mono">Code goes here</Typography>,
  },
} satisfies Story;
