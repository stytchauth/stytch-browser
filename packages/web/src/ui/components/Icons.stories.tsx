import type { Meta, StoryObj } from '@storybook/react';
import React, { ComponentType } from 'react';

import * as Icons from '../../assets';
import * as LogosBlack from '../../assets/logo-black';
import * as Logos from '../../assets/logo-color';
import * as LogosWhite from '../../assets/logo-white';
import { IconProps } from '../../assets/types';
import Typography from './atoms/Typography';

const meta: Meta = {
  component: () => null,
  argTypes: {
    size: {
      type: 'number',
      control: { min: 12 },
    },
    color: { type: 'string' },
    showOutline: { type: 'boolean' },
  },
  parameters: {
    rootWidth: '100%',
  },
};

export default meta;
type Story = StoryObj;

const IconPreview = ({
  icons,
  size,
  showOutline,
  color = 'var(--st-foreground)',
}: {
  icons: Record<string, ComponentType<IconProps>>;
  showOutline?: boolean;
  size?: number;
  color?: string;
}) => {
  const iconComponents = Object.entries(icons).filter(([, component]) => typeof component === 'function');
  const maxNameLength = Math.max(...iconComponents.map(([name]) => name.length));
  const columnWidth = `calc(${size ? size + 'px' : '20px'} + ${maxNameLength}ch + var(--st-spacing-2))`;

  return (
    <Typography
      font="mono"
      variant="helper"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fill, minmax(${columnWidth}, 1fr))`,
        gap: '24px 8px',
        color,
      }}
    >
      {iconComponents.map(([name, IconComponent]) => (
        <div style={{ display: 'flex', gap: 'var(--st-spacing-2)', alignItems: 'center' }}>
          <IconComponent size={size} style={{ outline: showOutline ? '1px solid' : '0' }} />
          <span>{name}</span>
        </div>
      ))}
    </Typography>
  );
};

export const _Icons: Story = {
  render: (args) => <IconPreview icons={Icons} {...args} />,
};

export const Logo: Story = {
  render: (args) => <IconPreview icons={Logos} {...args} />,
};

export const LogoWhite: Story = {
  render: (args) => <IconPreview icons={LogosWhite} {...args} />,
};

export const LogoBlack: Story = {
  render: (args) => <IconPreview icons={LogosBlack} {...args} />,
};
