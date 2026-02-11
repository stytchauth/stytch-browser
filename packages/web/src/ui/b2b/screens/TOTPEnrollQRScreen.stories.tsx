import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from 'storybook/test';

import { MOCK_QR_CODE_PNG_DATA, MOCK_TOTP_RECOVERY_CODES, MOCK_TOTP_SECRET } from '../../../testUtils';
import { AppScreens } from '../types/AppScreens';
import { TOTPEnrollQRScreen } from './TOTPEnrollQRScreen';

const meta = {
  component: TOTPEnrollQRScreen,
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
            totp: {
              enrollment: {
                method: 'qr',
                qrCode: MOCK_QR_CODE_PNG_DATA,
                recoveryCodes: MOCK_TOTP_RECOVERY_CODES,
                secret: MOCK_TOTP_SECRET,
              },
            },
          },
        },
      },
    },
  },
} satisfies Meta<typeof TOTPEnrollQRScreen>;

export default meta;

type Story = StoryObj<typeof meta>;

export const _TOTPEnrollQRScreen = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByText('Not now')).not.toBeInTheDocument();
  },
} satisfies Story;
