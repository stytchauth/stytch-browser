import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import Container from '../../Container';
import { AppScreens } from '../../GlobalContextProvider';
import * as Products from '../../Products';

const meta = {
  component: Container,
  parameters: {
    stytch: {
      disableSnackbar: true,
      b2c: {
        initialState: {
          screen: AppScreens.PasswordForgot,
          formState: {
            passwordState: {
              email: 'test@example.com',
            },
          },
        },
        config: {
          products: [Products.passwords],
        },
      },
    },
  },
} satisfies Meta<typeof Container>;

export default meta;

type Story = StoryObj<typeof meta>;

export const _PasswordForgot = {
  play: async ({ canvas }) => {
    await expect(await canvas.findByText('Forgot your password?')).toBeInTheDocument();
    await expect(await canvas.findByText(/A link to reset your password was sent to you at/)).toBeInTheDocument();
    await expect(await canvas.findByText('test@example.com')).toBeInTheDocument();
    await expect(await canvas.findByText('Resend email')).toBeInTheDocument();
  },
} satisfies Story;
