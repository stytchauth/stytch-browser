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
          screen: AppScreens.PasswordCreateOrLogin,
          formState: {
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

export const _PasswordAuthenticate = {
  play: async ({ canvas }) => {
    await expect(await canvas.findByText('Log in')).toBeInTheDocument();
    await expect(await canvas.findByDisplayValue('user@example.com')).toBeInTheDocument();
    await expect(await canvas.findByLabelText('Password')).toBeEnabled();
  },
} satisfies Story;
