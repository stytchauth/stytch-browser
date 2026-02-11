import type { Meta, StoryObj } from '@storybook/react';
import { StyledComponentProps } from '../../utils/StyledComponentProps';
import Button from './Button';

type Props = StyledComponentProps<typeof Button>;

const meta = {
  component: Button,
  tags: ['autodocs'],
} satisfies Meta<Props>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary = {
  args: {
    children: 'Primary Button',
    variant: 'primary',
  },
} satisfies Story;

export const Outlined = {
  args: {
    children: 'Outlined Button',
    variant: 'outlined',
  },
} satisfies Story;

export const Text = {
  args: {
    children: 'Text Button',
    variant: 'text',
  },
} satisfies Story;

export const Disabled = {
  args: {
    ...Primary.args,
    children: 'Disabled Button',
    disabled: true,
  },
} satisfies Story;

export const OutlinedDisabled = {
  args: {
    ...Outlined.args,
    children: 'Outlined Disabled Button',
    disabled: true,
  },
} satisfies Story;

export const TextDisabled = {
  args: {
    ...Text.args,
    children: 'Text Disabled Button',
    disabled: true,
  },
} satisfies Story;
