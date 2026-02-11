import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';

import { MainContainer } from './MainContainer';

const meta = {
  component: MainContainer,
  render: (args) => (
    <MainContainer>
      <div style={{ background: 'red', height: 300 }}>{args.children}</div>
    </MainContainer>
  ),
  args: {
    children: 'Inner content placeholder',
  },
  parameters: {
    layout: 'fullscreen',
    theme: {
      config: {
        container: {
          borderColor: 'blue',
        },
      },
    },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const _MainContainer = {} satisfies Story;

export const CustomBorderAndPadding = {
  parameters: {
    theme: {
      config: {
        container: {
          padding: '10rem',
          borderWidth: '2em',
        },
      },
    },
  },
} satisfies Story;

export const UnitlessBorderAndPadding = {
  parameters: {
    theme: {
      config: {
        container: {
          padding: 19,
          borderWidth: 5,
        },
      },
    },
  },
} satisfies Story;

export const NoBorderOrPadding = {
  parameters: {
    theme: {
      config: {
        container: {
          padding: 0,
          borderWidth: 0,
        },
      },
    },
  },
} satisfies Story;
