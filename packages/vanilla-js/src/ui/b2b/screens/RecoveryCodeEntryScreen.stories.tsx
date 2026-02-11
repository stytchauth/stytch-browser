import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import { B2BMFAProducts } from '@stytch/core/public';
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

    await expect(canvas.getByText('Continue')).toBeDisabled();
  },
} satisfies Story;

export const CodeEntered = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.type(canvas.getByLabelText('Backup code'), 'ckss-2skx-ebow');

    await expect(canvas.getByText('Continue')).toBeEnabled();
  },
} satisfies Story;

export const ValidationError = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByLabelText('Backup code'), 'ckss-2skx-ebow');
    await userEvent.click(canvas.getByText('Continue'));

    const errorMessageEl = await waitFor(() => canvas.findByText('Invalid backup code, please try again.'));
    await expect(errorMessageEl).toBeInTheDocument();
    await expect(canvas.getByText('Continue')).toBeEnabled();
  },
} satisfies Story;
