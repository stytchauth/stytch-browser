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
          screen: AppScreens.PasswordDedupe,
          formState: {
            passwordState: {
              email: 'existing.user@example.com',
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

export const _PasswordDedupe = {
  play: async ({ canvas }) => {
    await expect(await canvas.findByText('Check your email to set a new password')).toBeInTheDocument();
    await expect(await canvas.findByText('existing.user@example.com')).toBeInTheDocument();
  },
} satisfies Story;
