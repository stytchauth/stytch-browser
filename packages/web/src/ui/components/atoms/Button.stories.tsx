import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';

import { GithubIcon } from '../../../assets/logo-color';
import Button, { ButtonAnchor, ButtonAnchorProps } from './Button';

const meta = {
  args: {
    variant: 'secondary',
  },
  argTypes: {
    variant: {
      options: ['primary', 'secondary', 'outline', 'ghost', 'destructive'],
      control: { type: 'select' },
    },
    block: {
      control: { type: 'boolean' },
    },
    disabled: {
      control: { type: 'boolean' },
    },
    loading: {
      control: { type: 'boolean' },
    },
  },
  component: Button,
  tags: ['autodocs'],
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary = {
  args: {
    children: 'Primary Button',
    variant: 'primary',
  },
} satisfies Story;

export const Secondary = {
  args: {
    children: 'Secondary Button',
    variant: 'secondary',
  },
} satisfies Story;

export const Outlined = {
  args: {
    children: 'Outlined Button',
    variant: 'outline',
  },
} satisfies Story;

export const Ghost = {
  args: {
    children: 'Ghost Button',
    variant: 'ghost',
  },
} satisfies Story;

export const Destructive = {
  args: {
    children: 'Destructive Button',
    variant: 'destructive',
  },
} satisfies Story;

export const WithIcon = {
  args: {
    children: 'With Icon',
    icon: <GithubIcon />,
  },
} satisfies Story;

export const Loading = {
  args: {
    children: 'Icon',
    icon: <GithubIcon />,
    loading: true,
  },
};

export const _ButtonAnchor = {
  component: ButtonAnchor,
  args: {
    children: 'Stytch',
    href: 'https://stytch.com',
    rel: 'noreferrer',
    target: '_blank',
  },
  render: (args: ButtonAnchorProps) => <ButtonAnchor {...args} />,
};

export const Inline = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--st-spacing-2)' }}>
      <Button variant="primary" block={false}>
        Primary
      </Button>
      <Button variant="secondary" icon={<GithubIcon />} block={false}>
        With Icon
      </Button>
      <Button variant="outline" block={false}>
        Outline
      </Button>
      <Button variant="secondary" block={false} loading>
        Loading
      </Button>
    </div>
  ),
};
