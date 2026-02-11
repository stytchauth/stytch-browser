import { Meta, StoryObj } from '@storybook/preact';
import { AlertBox } from './AlertBox';

const meta = {
  component: AlertBox,
  tags: ['autodocs'],
  args: {
    text: "'Twas the night before Christmas, when all through the house not a creature was stirring, not even a mouse. The stockings were hung by the chimney with care, in hopes that St. Nicholas soon would be there. ",
  },
  argTypes: {
    variant: {
      control: 'radio',
      options: ['success', 'warning', 'error'],
    },
  },
} satisfies Meta<typeof AlertBox>;

export default meta;

type Story = StoryObj<typeof AlertBox>;

export const Success = {
  args: {
    variant: 'success',
  },
} satisfies Story;

export const Warning = {
  args: {
    variant: 'warning',
  },
} satisfies Story;

export const Error = {
  args: {
    variant: 'error',
  },
} satisfies Story;
