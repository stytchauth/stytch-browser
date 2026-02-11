import type { Meta, StoryObj } from '@storybook/react';
import Container from './Container';
import { AppScreens } from './GlobalContextProvider';

const meta = {
  component: Container,
  parameters: {
    stytch: {
      // Container provides its own snackbar
      disableSnackbar: true,
    },
  },
} satisfies Meta<typeof Container>;

export default meta;

type Story = StoryObj<typeof meta>;

export const SMS = {
  parameters: {
    stytch: {
      b2c: {
        config: {
          products: ['otp'],
          otpOptions: {
            expirationMinutes: 60,
            methods: ['sms'],
          },
        },
      },
    },
  },
} satisfies Story;

export const LargeBorderRadiusSMS = {
  parameters: {
    stytch: SMS.parameters.stytch,
    theme: {
      config: {
        container: {
          borderRadius: '200px',
        },
      },
    },
  },
} satisfies Story;

export const SMSNarrowWidth = {
  ...SMS,
  parameters: {
    ...SMS.parameters,
    theme: {
      config: {
        container: {
          width: '300px',
        },
      },
    },
  },
};

export const DisplayWatermarkSMS = {
  parameters: {
    stytch: SMS.parameters.stytch,
  },
  globals: {
    watermark: 'on',
  },
} satisfies Story;

export const DisplayWatermarkWithLargeBorderRadiusSMS = {
  parameters: {
    stytch: SMS.parameters.stytch,
    theme: {
      ...LargeBorderRadiusSMS.parameters.theme,
    },
  },
  globals: {
    watermark: 'on',
  },
} satisfies Story;

export const ErrorState = {
  parameters: {
    stytch: {
      b2c: {
        initialState: {
          screen: AppScreens.Main,
          formState: {
            errorMessage: 'Something went wrong. Please try again.',
          },
        },
      },
    },
  },
} satisfies Story;
