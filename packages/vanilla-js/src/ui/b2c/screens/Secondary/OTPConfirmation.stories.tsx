import type { Meta, StoryObj } from '@storybook/react';
import { expect } from '@storybook/test';
import { Products, OTPMethods } from '@stytch/core/public';
import Container from '../../Container';
import { AppScreens } from '../../GlobalContextProvider';

const meta = {
  component: Container,
  parameters: {
    stytch: {
      disableSnackbar: true,
      b2c: {
        initialState: {
          screen: AppScreens.OTPConfirmation,
          phoneNumber: '+15551234567',
          otpMethod: OTPMethods.SMS,
        },
        config: {
          products: [Products.otp],
          otpOptions: {
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
