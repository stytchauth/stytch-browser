import type { Meta, StoryObj } from '@storybook/react';
import { OTPMethods } from '@stytch/core/public';
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
          screen: AppScreens.OTPConfirmation,
        },
        config: {
          products: [Products.otp],
          otpOptions: {
            expirationMinutes: 60,
            methods: [OTPMethods.SMS],
          },
        },
      },
    },
  },
} satisfies Meta<typeof Container>;

export default meta;

type Story = StoryObj<typeof meta>;

export const _OTPConfirmation = {
  play: async ({ canvas }) => {
    await expect(await canvas.findByText('Your passcode has been successfully verified.')).toBeInTheDocument();
  },
} satisfies Story;
