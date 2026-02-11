import type { Meta, StoryObj } from '@storybook/react';
import { expect } from '@storybook/test';
import { Products } from '@stytch/core/public';
import Container from '../../Container';
import { AppScreens } from '../../GlobalContextProvider';

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
              type: 'passwordless',
            },
          },
        },
        config: {
          products: [Products.emailMagicLinks, Products.passwords],
          emailMagicLinksOptions: {
            loginRedirectURL: 'https://example.com/login',
            signupRedirectURL: 'https://example.com/signup',
          },
        },
      },
    },
  },
} satisfies Meta<typeof Container>;

export default meta;

type Story = StoryObj<typeof meta>;

export const _PasswordlessCreate = {
  play: async ({ canvas }) => {
    await expect(await canvas.findByText('Create a password instead')).toBeInTheDocument();
    await expect(await canvas.findByText('newuser@example.com')).toBeInTheDocument();
  },
} satisfies Story;
