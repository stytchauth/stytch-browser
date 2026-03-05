import type { Meta, StoryObj } from '@storybook/react-vite';

import { CopyableText, CopyableTextProps } from './CopyableText';

const meta = {
  component: CopyableText,
  parameters: {
    adminPortal: true,
  },
} satisfies Meta<CopyableTextProps>;

export default meta;

type Story = StoryObj<typeof meta>;

export const _CopyableText = {
  args: {
    children: 'Content',
    label: 'Label',
  },
} satisfies Story;
