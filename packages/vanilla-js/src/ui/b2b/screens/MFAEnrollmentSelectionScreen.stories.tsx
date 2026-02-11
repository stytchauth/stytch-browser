import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from '@storybook/test';
import { B2BMFAProducts } from '@stytch/core/public';
import { AppScreens } from '../types/AppScreens';
import { MFAEnrollmentSelectionScreen } from './MFAEnrollmentSelectionScreen';

const meta = {
  component: MFAEnrollmentSelectionScreen,
  parameters: {
    stytch: {
      b2b: {
        initialState: {
          mfa: {
            primaryInfo: {
              enrolledMfaMethods: [],
              memberPhoneNumber: '+15005550006',
              memberId: 'fake-member-id',
              organizationId: 'fake-organization-id',
              organizationMfaOptionsSupported: [],
              postAuthScreen: AppScreens.LoggedIn,
            },
            isEnrolling: true,
          },
        },
      },
    },
  },
} satisfies Meta<typeof MFAEnrollmentSelectionScreen>;

export default meta;

type Story = StoryObj<typeof meta>;

export const _MFAEnrollmentSelectionScreen = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const totpButton = canvas.getByRole('button', { name: 'Use an authenticator app' });
    const smsButton = canvas.getByRole('button', { name: 'Text me a code' });

    await expect(totpButton).toBeEnabled();
    await expect(smsButton).toBeEnabled();

    await expect(totpButton.compareDocumentPosition(smsButton)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  },
} satisfies Story;

export const Reordered = {
  parameters: {
    stytch: {
      b2b: {
        config: {
          mfaProductOrder: [B2BMFAProducts.smsOtp, B2BMFAProducts.totp],
        },
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const totpButton = canvas.getByRole('button', { name: 'Use an authenticator app' });
    const smsButton = canvas.getByRole('button', { name: 'Text me a code' });

    await expect(totpButton).toBeEnabled();
    await expect(smsButton).toBeEnabled();

    await expect(smsButton.compareDocumentPosition(totpButton)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  },
} satisfies Story;

export const ReorderedPartial = {
  parameters: {
    stytch: {
      b2b: {
        config: {
          mfaProductOrder: [B2BMFAProducts.smsOtp],
        },
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const totpButton = canvas.getByRole('button', { name: 'Use an authenticator app' });
    const smsButton = canvas.getByRole('button', { name: 'Text me a code' });

    await expect(totpButton).toBeEnabled();
    await expect(smsButton).toBeEnabled();

    await expect(smsButton.compareDocumentPosition(totpButton)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  },
} satisfies Story;

export const Included = {
  parameters: {
    stytch: {
      b2b: {
        config: {
          mfaProductInclude: [B2BMFAProducts.smsOtp],
        },
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const smsButton = canvas.getByRole('button', { name: 'Text me a code' });

    await expect(smsButton).toBeEnabled();
    await expect(canvas.queryByRole('button', { name: 'Use an authenticator app' })).not.toBeInTheDocument();
  },
} satisfies Story;
