import type { Meta, StoryObj } from '@storybook/react';
import { CopyableText, CopyableTextProps } from './CopyableText';

const meta = {
  component: CopyableText,
} satisfies Meta<CopyableTextProps>;

export default meta;

type Story = StoryObj<typeof meta>;

export const _CopyableText = {
  args: {
    children: 'Content',
    label: 'Label',
  },
} satisfies Story;
