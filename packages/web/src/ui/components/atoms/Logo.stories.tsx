import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';

import Logo from './Logo';

const meta = {
  component: Logo,
  tags: ['autodocs'],
  argTypes: {
    orgLogo: {
      control: 'object',
    },
    appLogo: {
      control: 'object',
    },
  },
  render: (args) => (
    // Add a border to demonstrate where the bounding box is
    <div style={{ outline: '1px solid var(--st-border)', width: 'fit-content' }}>
      <Logo {...args} />
    </div>
  ),
} satisfies Meta<typeof Logo>;

export default meta;

type Story = StoryObj<typeof meta>;

const orgLogo = {
  url: '/stytch.jpg',
  alt: 'Organization Logo',
};

const appLogo = {
  url: '/twilio.png',
  alt: 'Application Logo',
};

export const OrganizationLogo = {
  args: {
    orgLogo,
  },
} satisfies Story;
export const AppLogo = {
  args: {
    appLogo,
  },
} satisfies Story;

export const BothLogos = {
  args: {
    orgLogo,
    appLogo,
  },
} satisfies Story;

export const NoLogos = {
  args: {},
} satisfies Story;
