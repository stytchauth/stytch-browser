import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent } from '@storybook/test';
import { Products, OTPMethods } from '@stytch/core/public';
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
          products: [Products.otp],
          otpOptions: {
            methods: [OTPMethods.SMS],
            expirationMinutes: 10,
          },
        },
      },
    },
  },
} satisfies Meta<typeof Container>;

export default meta;

type Story = StoryObj<typeof meta>;

export const SMSForm = {
  parameters: {
    stytch: {
      b2c: {
        config: {
          products: [Products.otp],
          otpOptions: {
            methods: [OTPMethods.SMS],
            expirationMinutes: 10,
          },
        },
      },
    },
  },
  play: async ({ canvas }) => {
    await expect(await canvas.findByText('Continue with text message')).toBeInTheDocument();
  },
} satisfies Story;

export const EmailForm = {
  parameters: {
    stytch: {
      b2c: {
        config: {
          products: [Products.emailMagicLinks],
          otpOptions: {
            methods: [OTPMethods.Email],
            expirationMinutes: 10,
          },
        },
      },
    },
  },
  play: async ({ canvas }) => {
    await expect(await canvas.findByText('Continue with email')).toBeInTheDocument();
    await expect(await canvas.findByPlaceholderText('example@email.com')).toBeEnabled();
  },
} satisfies Story;

export const WhatsAppForm = {
  parameters: {
    stytch: {
      b2c: {
        config: {
          products: [Products.otp],
          otpOptions: {
            methods: [OTPMethods.WhatsApp],
            expirationMinutes: 10,
          },
        },
      },
    },
  },
  play: async ({ canvas }) => {
    await expect(await canvas.findByText('Continue with WhatsApp')).toBeInTheDocument();
    await expect(await canvas.findByPlaceholderText('(123) 456-7890')).toBeEnabled();
  },
} satisfies Story;

export const AllOTPMethods = {
  parameters: {
    stytch: {
      b2c: {
        config: {
          products: [Products.otp],
          otpOptions: {
            methods: [OTPMethods.SMS, OTPMethods.WhatsApp],
            expirationMinutes: 10,
          },
        },
      },
    },
  },
  play: async ({ canvas }) => {
    // Check that all tabs are visible
    await expect(await canvas.findByText('Text')).toBeInTheDocument();
    await expect(await canvas.findByText('WhatsApp')).toBeInTheDocument();
    await expect(await canvas.findByText('Email')).toBeInTheDocument();

    // Text tab should be active by default - check for SMS content
    await expect(await canvas.findByText('Continue with text message')).toBeInTheDocument();
    await expect(await canvas.findByPlaceholderText('(123) 456-7890')).toBeInTheDocument();

    // Click WhatsApp tab and verify WhatsApp content
    const whatsappTab = await canvas.findByText('WhatsApp');
    await userEvent.click(whatsappTab);
    await expect(await canvas.findByText('Continue with WhatsApp')).toBeInTheDocument();
    await expect(await canvas.findByPlaceholderText('(123) 456-7890')).toBeInTheDocument();

    // Click Email tab and verify Email content
    const emailTab = await canvas.findByText('Email');
    await userEvent.click(emailTab);
    await expect(await canvas.findByText('Continue with email')).toBeInTheDocument();
    await expect(await canvas.findByPlaceholderText('example@email.com')).toBeInTheDocument();

    // Click back to Text tab
    const textTab = await canvas.findByText('Text');
    await userEvent.click(textTab);
    await expect(await canvas.findByText('Continue with text message')).toBeInTheDocument();
    await expect(await canvas.findByPlaceholderText('(123) 456-7890')).toBeInTheDocument();
  },
} satisfies Story;

export const InvalidEmailValidation = {
  parameters: {
    stytch: {
      b2c: {
        config: {
          products: [Products.emailMagicLinks],
          otpOptions: {
            methods: [OTPMethods.Email],
          },
        },
      },
    },
  },
  play: async ({ canvas }) => {
    const emailInput = await canvas.findByPlaceholderText('example@email.com');
    await userEvent.type(emailInput, 'invalid-email');
    await expect(emailInput).toHaveValue('invalid-email');

    const continueButton = await canvas.findByText('Continue with email');
    await userEvent.click(continueButton);

    await expect(emailInput).toBeInvalid();
    expect((emailInput as HTMLInputElement).validationMessage).toContain("Please include an '@' in the email address");
  },
} satisfies Story;
