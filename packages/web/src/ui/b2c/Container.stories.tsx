import type { Meta, StoryObj } from '@storybook/react-vite';
import { OTPMethods } from '@stytch/core/public';

import * as Products from '../../ui/b2c/Products';
import Container from './Container';

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
          products: [Products.otp],
          otpOptions: {
            expirationMinutes: 60,
            methods: [OTPMethods.SMS],
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
    watermark: 'Show watermark',
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
    watermark: 'Show watermark',
  },
} satisfies Story;
