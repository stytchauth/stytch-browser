import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import { B2BMFAProducts } from '@stytch/core/public';
import { AppScreens } from '../types/AppScreens';
import { SMSOTPEntryScreen } from './SMSOTPEntryScreen';

const meta = {
  component: SMSOTPEntryScreen,
  parameters: {
    stytch: {
      b2b: {
        initialState: {
          mfa: {
            primaryInfo: {
              enrolledMfaMethods: [B2BMFAProducts.smsOtp],
              memberPhoneNumber: '+15005550006',
              memberId: 'fake-member-id',
              organizationId: 'fake-organization-id',
              organizationMfaOptionsSupported: [],
              postAuthScreen: AppScreens.LoggedIn,
            },
            smsOtp: {
              codeExpiration: new Date(Date.now() + 1000 * 60 * 5),
              formattedDestination: '+1 (500) 555-0006',
            },
          },
        },
      },
    },
  },
} satisfies Meta<typeof SMSOTPEntryScreen>;

export default meta;

type Story = StoryObj<typeof meta>;

export const _SMSOTPEntryScreen = {} satisfies Story;

export const TOTPEnabled = {
  parameters: {
    stytch: {
      b2b: {
        initialState: {
          mfa: {
            primaryInfo: {
              ...meta.parameters.stytch.b2b.initialState.mfa.primaryInfo,
              enrolledMfaMethods: [B2BMFAProducts.smsOtp, B2BMFAProducts.totp],
            },
          },
        },
      },
    },
  },
} satisfies Story;

export const ValidationError = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByLabelText('One-time passcode'), '987654', { delay: 100 });

    const errorMessageEl = await waitFor(() => canvas.findByText('Invalid passcode, please try again.'));
    expect(errorMessageEl).toBeInTheDocument();
  },
} satisfies Story;
