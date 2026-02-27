import type { Meta, StoryObj } from '@storybook/react-vite';

import Divider from './Divider';

const meta = {
  component: Divider,
} satisfies Meta<typeof Divider>;

export default meta;

type Story = StoryObj<typeof meta>;

export const _Divider = {} satisfies Story;
