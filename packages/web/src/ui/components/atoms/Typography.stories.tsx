import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';

import Typography from './Typography';

const ALL_COLORS = ['foreground', 'muted', 'destructive', 'warning', 'success'] as const;
const ALL_WEIGHTS = ['regular', 'medium', 'semibold', 'bold'] as const;

const meta = {
  component: Typography,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['header', 'body', 'helper'],
    },
    color: {
      control: { type: 'select' },
      options: ALL_COLORS,
    },
    weight: {
      control: { type: 'select' },
      options: ALL_WEIGHTS,
    },
    align: {
      control: { type: 'select' },
      options: ['start', 'center', 'end'],
    },
    font: {
      control: { type: 'select' },
      options: ['default', 'mono'],
    },
    as: {
      control: { type: 'text' },
    },
  },
} satisfies Meta<typeof Typography>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Header = {
  args: {
    children: 'This is a header',
    variant: 'header',
  },
} satisfies Story;

export const Body = {
  args: {
    children: 'This is body text that provides the main content for the page.',
    variant: 'body',
  },
} satisfies Story;

export const Helper = {
  args: {
    children: 'This is helper text that provides additional instructions.',
    variant: 'helper',
  },
} satisfies Story;

export const Mono = {
  args: {
    font: 'mono',
    children: '22o0-e6e9-plwt op50-5jj9-vojv',
  },
};

export const AllColors = {
  render: ({ color, children, ...props }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {ALL_COLORS.map((color) => (
        <Typography color={color} key={color} {...props}>
          {color} - Lorem ipsum dolor sit amet, consectetur adipiscing elit
        </Typography>
      ))}
    </div>
  ),
} satisfies Story;

export const AllWeights = {
  render: ({ color, children, ...props }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {ALL_WEIGHTS.map((weight) => (
        <Typography weight={weight} key={weight} {...props}>
          {weight} - Lorem ipsum dolor sit amet, consectetur adipiscing elit
        </Typography>
      ))}
    </div>
  ),
} satisfies Story;

export const AllVariants = {
  render: ({ variant, children, ...props }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Typography variant="header" {...props}>
        Header
      </Typography>
      <Typography variant="body" {...props}>
        Body text that provides the main content for the page.
      </Typography>
      <Typography variant="helper" {...props}>
        Helper text that provides additional context or instructions.
      </Typography>
    </div>
  ),
} satisfies Story;
