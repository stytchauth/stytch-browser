import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent } from '@storybook/test';
import {
  AuthFlowType,
  B2BDiscoveryOTPEmailSendOptions,
  B2BDiscoveryOTPEmailSendResponse,
  B2BMagicLinkLoginOrSignupOptions,
  B2BMagicLinkLoginOrSignupResponse,
  B2BMagicLinksEmailDiscoverySendOptions,
  B2BMagicLinksEmailDiscoverySendResponse,
  B2BOTPsEmailLoginOrSignupOptions,
  B2BOTPsEmailLoginOrSignupResponse,
  B2BProducts,
} from '@stytch/core/public';
import { http } from 'msw';
import { DataResponse, infiniteResolver } from '../../../../.storybook/handlers';
import { EmailMethodSelectionScreen } from './EmailMethodSelectionScreen';

const meta = {
  component: EmailMethodSelectionScreen,
  parameters: {
    stytch: {
      b2b: {
        config: {
          products: [B2BProducts.emailMagicLinks, B2BProducts.emailOtp],
        },
        initialState: {
          flowState: {
            type: AuthFlowType.Discovery,
          },
        },
      },
    },
    msw: {
      handlers: {
        b2bMagicLinkEmailLoginOrSignup: http.post<
          never,
          B2BMagicLinkLoginOrSignupOptions,
          DataResponse<B2BMagicLinkLoginOrSignupResponse>
        >('https://api.stytch.com/sdk/v1/b2b/magic_links/email/login_or_signup', infiniteResolver),
        b2bMagicLinksEmailDiscoverySend: http.post<
          never,
          B2BMagicLinksEmailDiscoverySendOptions,
          DataResponse<B2BMagicLinksEmailDiscoverySendResponse>
        >('https://api.stytch.com/sdk/v1/b2b/magic_links/email/discovery/send', infiniteResolver),
        b2bOtpEmailLoginOrSignup: http.post<
          never,
          B2BOTPsEmailLoginOrSignupOptions,
          DataResponse<B2BOTPsEmailLoginOrSignupResponse>
        >('https://api.stytch.com/sdk/v1/b2b/otps/email/login_or_signup', infiniteResolver),
        b2bOtpEmailDiscoverySend: http.post<
          never,
          B2BDiscoveryOTPEmailSendOptions,
          DataResponse<B2BDiscoveryOTPEmailSendResponse>
        >('https://api.stytch.com/sdk/v1/b2b/otps/email/discovery/send', infiniteResolver),
      },
    },
  },
} satisfies Meta<typeof EmailMethodSelectionScreen>;

export default meta;

type Story = StoryObj<typeof meta>;

export const _EmailMethodSelectionScreen = {
  play: async ({ canvas }) => {
    const emlButton = canvas.getByRole('button', { name: 'Email me a log in link' });
    const otpButton = canvas.getByRole('button', { name: 'Email me a log in code' });

    await expect(emlButton).toBeEnabled();
    await expect(otpButton).toBeEnabled();

    await expect(emlButton.compareDocumentPosition(otpButton)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  },
} satisfies Story;

export const Reordered = {
  parameters: {
    stytch: {
      b2b: {
        config: {
          products: [B2BProducts.emailOtp, B2BProducts.emailMagicLinks],
        },
      },
    },
  },
  play: async ({ canvas }) => {
    const emlButton = canvas.getByRole('button', { name: 'Email me a log in link' });
    const otpButton = canvas.getByRole('button', { name: 'Email me a log in code' });

    await expect(emlButton).toBeEnabled();
    await expect(otpButton).toBeEnabled();

    await expect(otpButton.compareDocumentPosition(emlButton)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  },
} satisfies Story;

export const Disabled = {
  play: async ({ canvas }) => {
    const emlButton = canvas.getByRole('button', { name: 'Email me a log in link' });
    const otpButton = canvas.getByRole('button', { name: 'Email me a log in code' });

    await userEvent.click(emlButton);

    await expect(emlButton).toBeDisabled();
    await expect(otpButton).toBeDisabled();
  },
} satisfies Story;
