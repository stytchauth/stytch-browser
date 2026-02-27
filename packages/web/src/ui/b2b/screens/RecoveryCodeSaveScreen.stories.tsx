import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import {
  MOCK_ORGANIZATION,
  MOCK_QR_CODE_PNG_DATA,
  MOCK_TOTP_RECOVERY_CODES,
  MOCK_TOTP_SECRET,
} from '../../../testUtils';
import { AppScreens } from '../types/AppScreens';
import { RecoveryCodeSaveScreen } from './RecoveryCodeSaveScreen';

const meta = {
  component: RecoveryCodeSaveScreen,
  parameters: {
    stytch: {
      b2b: {
        initialState: {
          flowState: {
            organization: MOCK_ORGANIZATION,
          },
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
                secret: MOCK_TOTP_SECRET,
                qrCode: MOCK_QR_CODE_PNG_DATA,
                recoveryCodes: MOCK_TOTP_RECOVERY_CODES,
              },
            },
          },
        },
      },
    },
  },
} satisfies Meta<typeof RecoveryCodeSaveScreen>;

export default meta;

type Story = StoryObj<typeof meta>;

export const _RecoveryCodeSaveScreen = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('link', { name: 'Download .txt file' })).toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: 'Copy all to clipboard' })).toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: 'Done' })).toBeInTheDocument();
  },
} satisfies Story;
