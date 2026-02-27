import type { Meta, StoryObj } from '@storybook/react-vite';

import { Code, CodeProps } from './Code';

const meta = {
  component: Code,
  parameters: {
    adminPortal: true,
  },
} satisfies Meta<CodeProps>;

export default meta;

type Story = StoryObj<typeof meta>;

export const _Code = {
  args: {
    children: 'example code',
  },
} satisfies Story;
