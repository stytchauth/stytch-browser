import type { Meta, StoryObj } from '@storybook/react';
import { Typography } from './Typography';

const meta: Meta<typeof Typography> = {
  component: Typography,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Heading1 = {
  args: {
    children: 'This is a heading',
    variant: 'h1',
  },
} satisfies Story;

export const Heading2 = {
  args: {
    children: 'This is a subheading',
    variant: 'h2',
  },
} satisfies Story;

export const Heading3 = {
  args: {
    children: 'This is a subheading',
    variant: 'h3',
  },
} satisfies Story;

export const Heading4 = {
  args: {
    children: 'This is a subheading',
    variant: 'h4',
  },
} satisfies Story;

export const Body1 = {
  args: {
    children: 'This is a paragraph',
    variant: 'body1',
  },
} satisfies Story;

export const Body2 = {
  args: {
    children: 'This is a paragraph',
    variant: 'body2',
  },
} satisfies Story;

export const Secondary = {
  args: {
    ...Body1.args,
    color: 'secondary',
  },
} satisfies Story;

export const Error = {
  args: {
    ...Body1.args,
    color: 'error',
  },
} satisfies Story;

export const Disabled = {
  args: {
    ...Body1.args,
    disabled: true,
  },
} satisfies Story;
