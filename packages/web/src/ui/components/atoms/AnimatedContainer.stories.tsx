import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';

import AnimatedContainer from './AnimatedContainer';
import Button from './Button';
import Column from './Column';
import Typography from './Typography';

const meta = {
  component: AnimatedContainer,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof AnimatedContainer>;

export default meta;

type _Story = StoryObj<typeof meta>;

export const _AnimatedContainer = {
  render: function Render() {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <div>
        <Button variant="outline" onClick={() => setIsOpen(!isOpen)}>
          Toggle
        </Button>

        <AnimatedContainer isOpen={isOpen}>
          <Column gap={2} style={{ padding: 'var(--st-spacing-4)', backgroundColor: 'var(--muted)' }}>
            <Typography variant="header">Animated Content</Typography>
            <Typography>This content is visible when the container is open.</Typography>
            <Typography>It animates smoothly when toggling between open and closed states.</Typography>
          </Column>
        </AnimatedContainer>
      </div>
    );
  },
};
