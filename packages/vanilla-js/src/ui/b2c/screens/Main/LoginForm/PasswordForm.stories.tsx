import type { Meta, StoryObj } from '@storybook/react';
import { expect } from '@storybook/test';
import { Products } from '@stytch/core/public';
import Container from '../../../Container';
import { AppScreens } from '../../../GlobalContextProvider';

const meta = {
  component: Container,
  parameters: {
    stytch: {
      disableSnackbar: true,
      b2c: {
        initialState: {
          screen: AppScreens.Main,
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

export const _PasswordForm = {
  parameters: {
    stytch: {
      b2c: {
        config: {
          products: [Products.passwords],
        },
      },
    },
  },
  play: async ({ canvas }) => {
    await expect(await canvas.findByText('Continue with email')).toBeInTheDocument();
    await expect(await canvas.findByPlaceholderText('example@email.com')).toBeEnabled();
  },
} satisfies Story;
