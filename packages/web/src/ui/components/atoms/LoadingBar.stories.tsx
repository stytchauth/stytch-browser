import type { Meta, StoryObj } from '@storybook/react';

import LoadingBar from './LoadingBar';

const meta = {
  component: LoadingBar,
  args: {
    isLoading: true,
  },
} satisfies Meta<typeof LoadingBar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const _LoadingBar = {} satisfies Story;
