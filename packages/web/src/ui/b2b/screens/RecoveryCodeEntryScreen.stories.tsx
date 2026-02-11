import type { Meta, StoryObj } from '@storybook/react';
import { B2BMFAProducts } from '@stytch/core/public';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { AppScreens } from '../types/AppScreens';
import { RecoveryCodeEntryScreen } from './RecoveryCodeEntryScreen';

const meta = {
  component: RecoveryCodeEntryScreen,
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
              postAuthScreen: AppScreens.Main,
            },
          },
        },
      },
    },
  },
} satisfies Meta<typeof RecoveryCodeEntryScreen>;

export default meta;

type Story = StoryObj<typeof meta>;

export const _RecoveryCodeEntryScreen = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole('button', { name: 'Continue' })).toBeDisabled();
  },
} satisfies Story;

export const CodeEntered = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.type(canvas.getByLabelText('Backup code'), 'ckss-2skx-ebow');

    await expect(canvas.getByRole('button', { name: 'Continue' })).toBeEnabled();
  },
} satisfies Story;

export const ValidationError = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByLabelText('Backup code'), 'ckss-2skx-ebow');
    await userEvent.click(canvas.getByRole('button', { name: 'Continue' }));

    const errorMessageEl = await waitFor(() => canvas.findByText('Invalid backup code, please try again.'));
    await expect(errorMessageEl).toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: 'Continue' })).toBeEnabled();
  },
} satisfies Story;
