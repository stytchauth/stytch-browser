import type { Meta, StoryObj } from '@storybook/react';
import { B2BMFAProducts } from '@stytch/core/public';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { AppScreens } from '../types/AppScreens';
import { TOTPEntryScreen } from './TOTPEntryScreen';

const meta = {
  component: TOTPEntryScreen,
  parameters: {
    stytch: {
      b2b: {
        initialState: {
          mfa: {
            primaryInfo: {
              memberId: 'fake-member-id',
              organizationId: 'fake-organization-id',
              enrolledMfaMethods: [B2BMFAProducts.totp],
              memberPhoneNumber: null,
              organizationMfaOptionsSupported: [],
              postAuthScreen: AppScreens.LoggedIn,
            },
          },
        },
      },
    },
  },
} satisfies Meta<typeof TOTPEntryScreen>;

export default meta;

type Story = StoryObj<typeof meta>;

export const _TOTPEntryScreen = {} satisfies Story;

export const SMSEnabled = {
  parameters: {
    stytch: {
      b2b: {
        initialState: {
          mfa: {
            primaryInfo: {
              ...meta.parameters.stytch.b2b.initialState.mfa.primaryInfo,
              enrolledMfaMethods: [B2BMFAProducts.smsOtp, B2BMFAProducts.totp],
              memberPhoneNumber: '+15005550006',
            },
          },
        },
      },
    },
  },
} satisfies Story;

export const Enrollment = {
  parameters: {
    stytch: {
      b2b: {
        initialState: {
          mfa: {
            primaryInfo: {
              ...meta.parameters.stytch.b2b.initialState.mfa.primaryInfo,
              enrolledMfaMethods: [],
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
    await userEvent.type(canvas.getByLabelText('One-time passcode'), '123456');

    const errorMessageEl = await waitFor(() => canvas.findByText('Invalid passcode, please try again.'));
    expect(errorMessageEl).toBeInTheDocument();
  },
} satisfies Story;
