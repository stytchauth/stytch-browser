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

export const NewUserPasswordOnly = {
  parameters: {
    stytch: {
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
  play: async ({ canvas }) => {
    await expect(await canvas.findByText('Finish creating your account by setting a password.')).toBeInTheDocument();
    await expect(await canvas.findByLabelText('Password')).toBeEnabled();
  },
} satisfies Story;

export const NewUserWithEmailMagicLink = {
  parameters: {
    stytch: {
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
          products: [Products.passwords, Products.emailMagicLinks],
          emailMagicLinksOptions: {
            loginRedirectURL: 'https://example.com/login',
            signupRedirectURL: 'https://example.com/signup',
          },
        },
      },
    },
  },
  play: async ({ canvas }) => {
    await expect(await canvas.findByText('Create an account')).toBeInTheDocument();
    await expect(await canvas.findByText('Choose how you would like to create your account.')).toBeInTheDocument();
    await expect(await canvas.findByText('Email me a login link')).toBeInTheDocument();
  },
} satisfies Story;

export const NewUserWithOTP = {
  parameters: {
    stytch: {
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
          products: [Products.passwords, Products.otp],
          otpOptions: {
            methods: [OTPMethods.Email],
            expirationMinutes: 10,
          },
        },
      },
    },
  },
  play: async ({ canvas }) => {
    await expect(await canvas.findByText('Create an account')).toBeInTheDocument();
    await expect(await canvas.findByText('Choose how you would like to create your account.')).toBeInTheDocument();
    await expect(await canvas.findByText('Email me a login code')).toBeInTheDocument();
  },
} satisfies Story;

export const PasswordUserPasswordOnly = {
  parameters: {
    stytch: {
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
  play: async ({ canvas }) => {
    await expect(await canvas.findByText('Log in')).toBeInTheDocument();
    await expect(await canvas.findByDisplayValue('user@example.com')).toBeInTheDocument();
    await expect(await canvas.findByLabelText('Password')).toBeEnabled();
  },
} satisfies Story;

export const PasswordUserWithEmailMagicLink = {
  parameters: {
    stytch: {
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
          products: [Products.passwords, Products.emailMagicLinks],
          emailMagicLinksOptions: {
            loginRedirectURL: 'https://example.com/login',
            signupRedirectURL: 'https://example.com/signup',
          },
        },
      },
    },
  },
  play: async ({ canvas }) => {
    await expect(await canvas.findByText('Log in')).toBeInTheDocument();
    await expect(await canvas.findByLabelText('Password')).toBeEnabled();
    await expect(await canvas.findByText('Email me a login link')).toBeInTheDocument();
  },
} satisfies Story;

export const PasswordUserWithOTP = {
  parameters: {
    stytch: {
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
          products: [Products.passwords, Products.otp],
          otpOptions: {
            methods: [OTPMethods.Email],
            expirationMinutes: 10,
          },
        },
      },
    },
  },
  play: async ({ canvas }) => {
    await expect(await canvas.findByText('Log in')).toBeInTheDocument();
    await expect(await canvas.findByLabelText('Password')).toBeEnabled();
    await expect(await canvas.findByText('Email me a login code')).toBeInTheDocument();
  },
} satisfies Story;

export const PasswordlessUserWithEmailMagicLink = {
  parameters: {
    stytch: {
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
  play: async ({ canvas }) => {
    await expect(await canvas.findByText(/An email was sent to/)).toBeInTheDocument();
    await expect(await canvas.findByText('Create a password instead')).toBeInTheDocument();
  },
} satisfies Story;

export const PasswordlessUserWithOTP = {
  parameters: {
    stytch: {
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
          products: [Products.otp, Products.passwords],
          otpOptions: {
            methods: [OTPMethods.Email],
            expirationMinutes: 10,
          },
        },
      },
    },
  },
  play: async ({ canvas }) => {
    await expect(await canvas.findByText('Enter passcode')).toBeInTheDocument();
    await expect(await canvas.findByText('Create a password instead')).toBeInTheDocument();
  },
} satisfies Story;
