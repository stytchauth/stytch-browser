import type { Meta, StoryObj } from '@storybook/react';
import React, { CSSProperties, useState } from 'react';

import Button from './Button';
import Column from './Column';
import Typography from './Typography';
import VerticalTransition, { hoverTriggerClass } from './VerticalTransition';

const testElementStyles: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  border: '1px solid var(--st-border)',
  borderRadius: 'var(--st-rounded-md)',
  width: '160px',
  height: '30px',
  padding: '0 var(--st-spacing-4)',
};

const primary = (
  <div style={testElementStyles}>
    <Typography variant="helper">Primary</Typography>
  </div>
);

const secondary = (
  <div style={testElementStyles}>
    <Typography variant="helper">Secondary</Typography>
  </div>
);

// Use this rather than args to avoid these from breaking SB
const defaultProps = { primary, secondary };

const meta = {
  component: VerticalTransition,
} satisfies Meta<typeof VerticalTransition>;

export default meta;

// args is not going to be correct on render so we're just not using Story here
type _Story = StoryObj<typeof meta>;

export const ManuallyTriggered = {
  render: function Render() {
    const [triggered, setTriggered] = useState(false);
    return (
      <Column gap={2}>
        <Button variant="outline" onClick={() => setTriggered(!triggered)}>
          Trigger
        </Button>

        <VerticalTransition triggered={triggered} {...defaultProps} />
      </Column>
    );
  },
};

export const OnHover = {
  render: function Render() {
    return (
      <div
        style={{
          display: 'flex',
          gap: 'var(--st-spacing-2)',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 'var(--st-spacing-2)',
          border: '1px solid var(--st-border)',
        }}
        className={hoverTriggerClass}
      >
        <Typography>Hover me!</Typography>
        <VerticalTransition trigger="hover" {...defaultProps} />
      </div>
    );
  },
};
