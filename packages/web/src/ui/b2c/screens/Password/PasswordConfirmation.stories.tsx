import { Meta, StoryObj } from '@storybook/react';

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
          screen: AppScreens.PasswordConfirmation,
          formState: {},
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

export const _PasswordConfirmation = {} satisfies Story;
