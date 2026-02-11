import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';

import Button from './Button';
import { errorToast, ToastContainer } from './Toast';

let id = 1;

const ToastWrapper = () => {
  return (
    <div>
      <ToastContainer />
      <Button variant="primary" onClick={() => errorToast({ message: 'This is an error message ' + id++ })}>
        Show Toast
      </Button>
    </div>
  );
};

const meta = {
  component: ToastWrapper,
} satisfies Meta<typeof ToastWrapper>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default = {
  render: () => <ToastWrapper />,
} satisfies Story;
