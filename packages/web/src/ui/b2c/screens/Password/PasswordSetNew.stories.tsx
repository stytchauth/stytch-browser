import type { Meta, StoryObj } from '@storybook/react';
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
          screen: AppScreens.PasswordSetNew,
          formState: {
            resetPasswordState: {
              token: 'password-reset-token-123',
            },
            passwordState: {
              email: 'user@example.com',
              type: 'password',
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

export const _PasswordSetNew = {
  play: async ({ canvas }) => {
    await expect(await canvas.findByText('Check your email')).toBeInTheDocument();
    await expect(await canvas.findByText('user@example.com')).toBeInTheDocument();
    await expect(await canvas.findByText('Resend email')).toBeInTheDocument();
  },
} satisfies Story;
