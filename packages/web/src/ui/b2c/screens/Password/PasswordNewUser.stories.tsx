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
          screen: AppScreens.PasswordCreateOrLogin,
          formState: {
            passwordState: {
              email: 'newuser@example.com',
              type: 'new',
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

export const _PasswordNewUser = {
  play: async ({ canvas }) => {
    await expect(await canvas.findByText('Finish creating your account by setting a password.')).toBeInTheDocument();
    await expect(await canvas.findByLabelText('Password')).toBeEnabled();
  },
} satisfies Story;
