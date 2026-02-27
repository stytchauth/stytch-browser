import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent } from 'storybook/test';

import Container from '../../../Container';
import { AppScreens } from '../../../GlobalContextProvider';
import * as Products from '../../../Products';

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
          products: [Products.emailMagicLinks],
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

export const DefaultMagicLinkForm = {
  parameters: {
    stytch: {
      b2c: {
        config: {
          products: [Products.emailMagicLinks],
        },
      },
    },
  },
  play: async ({ canvas }) => {
    await expect(await canvas.findByText('Continue with email')).toBeInTheDocument();
    await expect(await canvas.findByLabelText('Email')).toBeEnabled();
  },
} satisfies Story;

export const ValidEmailInput = {
  parameters: {
    stytch: {
      b2c: {
        config: {
          products: [Products.emailMagicLinks],
        },
      },
    },
  },
  play: async ({ canvas }) => {
    const emailInput = await canvas.findByLabelText('Email');
    await userEvent.type(emailInput, 'user@example.com');

    await expect(emailInput).toHaveValue('user@example.com');

    const continueButton = await canvas.findByText('Continue with email');
    await expect(continueButton).toBeEnabled();
  },
} satisfies Story;

export const InvalidEmailValidation = {
  parameters: {
    stytch: {
      b2c: {
        config: {
          products: [Products.emailMagicLinks],
        },
      },
    },
  },
  play: async ({ canvas }) => {
    const emailInput = await canvas.findByLabelText('Email');
    await userEvent.type(emailInput, 'invalid-email');

    await expect(emailInput).toBeInvalid();
    expect((emailInput as HTMLInputElement).validationMessage).toContain("Please include an '@' in the email address");
  },
} satisfies Story;

export const IncompleteEmailValidation = {
  parameters: {
    stytch: {
      b2c: {
        config: {
          products: [Products.emailMagicLinks],
        },
      },
    },
  },
  play: async ({ canvas }) => {
    const emailInput = await canvas.findByLabelText('Email');
    await userEvent.type(emailInput, 'user@incomplete');

    const continueButton = await canvas.findByText('Continue with email');
    await userEvent.click(continueButton);

    // Should show validation error
    await expect(await canvas.findByText(/Email format is invalid./)).toBeInTheDocument();
  },
} satisfies Story;
