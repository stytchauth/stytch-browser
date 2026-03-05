import type { Meta, StoryObj } from '@storybook/react-vite';
import { AuthFlowType, B2BMFAProducts, B2BTOTPCreateOptions } from '@stytch/core/public';
import { delay, http } from 'msw';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { infiniteResolver, makeErrorResponse } from '../../../../.storybook/handlers';
import { MOCK_ORGANIZATION, MOCK_TOTP_SECRET } from '../../../testUtils';
import Container from '../Container';
import ContainerMeta from '../Container.stories';
import { getBackButton } from '../storyUtils';
import { AppScreens } from '../types/AppScreens';

const meta = {
  ...ContainerMeta,
  title: 'b2b/Container/MFA TOTP',
} satisfies Meta<typeof Container>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Enrollment = {
  parameters: {
    stytch: {
      b2b: {
        initialState: {
          screen: AppScreens.TOTPEnrollmentQRCode,
          flowState: {
            type: AuthFlowType.Organization,
            organization: MOCK_ORGANIZATION,
          },
          mfa: {
            primaryInfo: {
              enrolledMfaMethods: [],
              memberId: 'fake-member-id',
              memberPhoneNumber: null,
              organizationId: MOCK_ORGANIZATION.organization_id,
              organizationMfaOptionsSupported: [],
              postAuthScreen: AppScreens.LoggedIn,
            },
            isEnrolling: true,
          },
        },
      },
    },
  },
} satisfies Story;

export const EnrollmentLoading = {
  ...Enrollment,
  parameters: {
    ...Enrollment.parameters,
    msw: {
      handlers: {
        b2bTotpCreate: http.post<never, B2BTOTPCreateOptions, never>(
          'https://api.stytch.com/sdk/v1/b2b/totp',
          infiniteResolver,
        ),
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() =>
      expect(canvas.getByText('Scan the QR code to link your authenticator app')).toBeInTheDocument(),
    );
    await expect(canvas.queryByAltText('QR code for TOTP enrollment')).not.toBeInTheDocument();
  },
} satisfies Story;

export const EnrollmentNetworkError = {
  ...Enrollment,
  parameters: {
    ...Enrollment.parameters,
    msw: {
      handlers: {
        b2bTotpCreate: http.post<never, B2BTOTPCreateOptions, never>(
          'https://api.stytch.com/sdk/v1/b2b/totp',
          async () => {
            await delay(300);
            return makeErrorResponse({
              errorType: 'test',
              statusCode: 400,
              message: 'Unable to contact our servers.',
            });
          },
        ),
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() =>
      expect(canvas.getByText('Scan the QR code to link your authenticator app')).toBeInTheDocument(),
    );
    await expect(canvas.queryByAltText('QR code for TOTP enrollment')).not.toBeInTheDocument();
    await waitFor(() => expect(canvas.getByText('Unable to contact our servers.')).toBeInTheDocument());
  },
} satisfies Story;

export const EnrollmentManual = {
  ...Enrollment,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => userEvent.click(canvas.getByRole('button', { name: 'Having trouble scanning?' })));

    await waitFor(() => expect(canvas.getByText('Having trouble scanning the QR code?')).toBeInTheDocument());
    // We can't use get because it returns more than one element - both the code and its container have the same textContent
    await expect(
      canvas.getAllByText((_, element) => element?.textContent?.trim() === MOCK_TOTP_SECRET.toLowerCase()),
    ).not.toEqual([]);
  },
} satisfies Story;

export const EnrollmentManualScanAgain = {
  ...EnrollmentManual,
  play: async (params) => {
    await EnrollmentManual.play(params);

    const { canvasElement } = params;
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: 'Try to scan the QR code again' }));
    await waitFor(() =>
      expect(canvas.getByText('Scan the QR code to link your authenticator app')).toBeInTheDocument(),
    );
  },
} satisfies Story;

export const EnrollmentManualContinue = {
  ...EnrollmentManual,
  play: async (params) => {
    await EnrollmentManual.play(params);

    const { canvasElement } = params;
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: 'Continue' }));
    await waitFor(() => expect(canvas.getByText('Enter verification code')).toBeInTheDocument());
  },
} satisfies Story;

export const EnrollmentManualContinueBack = {
  ...EnrollmentManualContinue,
  play: async (params) => {
    await EnrollmentManualContinue.play(params);

    const { canvasElement } = params;
    const canvas = within(canvasElement);

    await userEvent.click(getBackButton(canvas));
    await waitFor(() => expect(canvas.getByText('Having trouble scanning the QR code?')).toBeInTheDocument());
  },
} satisfies Story;

export const Entry = {
  parameters: {
    stytch: {
      b2b: {
        initialState: {
          screen: AppScreens.TOTPEntry,
          flowState: {
            type: AuthFlowType.Organization,
            organization: MOCK_ORGANIZATION,
          },
          mfa: {
            primaryInfo: {
              enrolledMfaMethods: [B2BMFAProducts.totp],
              memberId: 'fake-member-id',
              memberPhoneNumber: null,
              organizationId: MOCK_ORGANIZATION.organization_id,
              organizationMfaOptionsSupported: [],
              postAuthScreen: AppScreens.LoggedIn,
            },
          },
        },
      },
    },
  },
} satisfies Story;

export const EntryInvalidCode = {
  ...Entry,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => expect(canvas.getByText('Enter verification code')).toBeInTheDocument());
    await userEvent.type(canvas.getByLabelText('One-time passcode'), '987654', { delay: 100 });
    await waitFor(() => expect(canvas.getByText('Invalid passcode, please try again.')).toBeInTheDocument());
  },
} satisfies Story;

export const EntrySwitchToSMSOTP = {
  ...Entry,
  parameters: {
    ...Entry.parameters,
    stytch: {
      b2b: {
        initialState: {
          ...Entry.parameters.stytch.b2b.initialState,
          mfa: {
            ...Entry.parameters.stytch.b2b.initialState.mfa,
            primaryInfo: {
              ...Entry.parameters.stytch.b2b.initialState.mfa.primaryInfo,
              enrolledMfaMethods: [B2BMFAProducts.smsOtp, B2BMFAProducts.totp],
              memberPhoneNumber: '+15005550006',
            },
          },
        },
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => expect(canvas.getByText('Enter verification code')).toBeInTheDocument());
    await userEvent.click(canvas.getByRole('button', { name: 'Text me a code instead' }));
    await waitFor(() => expect(canvas.getByText('Enter passcode')).toBeInTheDocument());
  },
} satisfies Story;

export const EntryBackupCode = {
  ...Entry,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => expect(canvas.getByText('Enter verification code')).toBeInTheDocument());
    await userEvent.click(canvas.getByRole('button', { name: 'Use a backup code' }));
    await waitFor(() => expect(canvas.getByText('Enter backup code')).toBeInTheDocument());
  },
} satisfies Story;

export const EntryBackupCodeBack = {
  ...EntryBackupCode,
  play: async (params) => {
    await EntryBackupCode.play(params);

    const { canvasElement } = params;
    const canvas = within(canvasElement);

    await userEvent.click(getBackButton(canvas));
    await waitFor(() => expect(canvas.getByText('Enter verification code')).toBeInTheDocument());
  },
} satisfies Story;

export const EntryBackupCodeInvalid = {
  ...EntryBackupCode,
  play: async (params) => {
    await EntryBackupCode.play(params);

    const { canvasElement } = params;
    const canvas = within(canvasElement);

    await userEvent.type(canvas.getByPlaceholderText('Enter backup code'), 'bad-code');
    await waitFor(() => expect(canvas.getByRole('button', { name: 'Continue' })).toBeEnabled());
    await userEvent.click(canvas.getByRole('button', { name: 'Continue' }));
    await waitFor(() => expect(canvas.getByText('Invalid backup code, please try again.')).toBeInTheDocument());
  },
} satisfies Story;
