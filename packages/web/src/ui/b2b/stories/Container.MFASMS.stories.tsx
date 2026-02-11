import type { Meta, StoryObj } from '@storybook/react';
import { AuthFlowType, B2BMFAProducts, B2BSMSSendOptions, B2BTOTPCreateOptions } from '@stytch/core/public';
import { delay, http } from 'msw';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { clientsideServicesLoader } from '../../../../.storybook/clientsideServicesStorybookLoader';
import { ErrorResponse, infiniteResolver, makeErrorResponse } from '../../../../.storybook/handlers';
import { MOCK_ORGANIZATION } from '../../../testUtils';
import Container from '../Container';
import ContainerMeta from '../Container.stories';
import { completeSmsOtpEnrollment } from '../storyUtils';
import { AppScreens } from '../types/AppScreens';

const meta = {
  ...ContainerMeta,
  title: 'b2b/Container/MFA SMS',
  loaders: [clientsideServicesLoader],
} satisfies Meta<typeof Container>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Enrollment = {
  parameters: {
    stytch: {
      b2b: {
        initialState: {
          screen: AppScreens.SMSOTPEnrollment,
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

export const EnrollmentInvalidPhoneNumber = {
  ...Enrollment,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByRole('textbox'), '123', { delay: 10 });
    await waitFor(() => expect(canvas.getByRole('button', { name: 'Continue' })).toBeEnabled());
    await userEvent.click(canvas.getByRole('button', { name: 'Continue' }));
    await waitFor(() =>
      expect(
        canvas.getByText('Phone number format is invalid. Ensure the phone number is in the E.164 format.'),
      ).toBeInTheDocument(),
    );
  },
} satisfies Story;

export const EnrollmentNetworkError = {
  ...Enrollment,
  parameters: {
    ...Enrollment.parameters,
    msw: {
      handlers: {
        b2bSmsOtpSend: http.post<never, B2BSMSSendOptions, never>(
          'https://api.stytch.com/sdk/v1/b2b/otps/sms/send',
          async () => {
            await delay(300);
            return makeErrorResponse({
              errorType: 'test',
              statusCode: 400,
              message:
                'We were unable to reach this phone number. Please try another phone number or contact your admin.',
            });
          },
        ),
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await completeSmsOtpEnrollment(canvas);
    await waitFor(() =>
      expect(
        canvas.getByText(
          'We were unable to reach this phone number. Please try another phone number or contact your admin.',
        ),
      ).toBeInTheDocument(),
    );
  },
} satisfies Story;

export const Entry = {
  parameters: {
    stytch: {
      b2b: {
        initialState: {
          screen: AppScreens.SMSOTPEntry,
          flowState: {
            type: AuthFlowType.Organization,
            organization: MOCK_ORGANIZATION,
          },
          mfa: {
            primaryInfo: {
              enrolledMfaMethods: [B2BMFAProducts.smsOtp],
              memberId: 'fake-member-id',
              memberPhoneNumber: '+15005550006',
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
    await waitFor(() => expect(canvas.getByText('Enter passcode')).toBeInTheDocument());
    await userEvent.type(canvas.getByLabelText('One-time passcode'), '987654', { delay: 100 });
    await waitFor(() => expect(canvas.getByText('Invalid passcode, please try again.')).toBeInTheDocument());
  },
} satisfies Story;

export const EntryLoading = {
  ...Entry,
  parameters: {
    ...Entry.parameters,
    msw: {
      handlers: {
        b2bOtpsSmsAuthenticate: http.post<never, B2BTOTPCreateOptions, never>(
          'https://api.stytch.com/sdk/v1/b2b/otps/sms/authenticate',
          infiniteResolver,
        ),
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => expect(canvas.getByText('Enter passcode')).toBeInTheDocument());
    await userEvent.type(canvas.getByLabelText('One-time passcode'), '987654', { delay: 100 });
  },
} satisfies Story;

export const EntryResendCode = {
  ...Entry,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => expect(canvas.getByText('Enter passcode')).toBeInTheDocument());
    await waitFor(() => expect(canvas.getByText(/Your code expires in 2:00/)).toBeInTheDocument());
    await waitFor(() =>
      expect(
        canvas.getByText(
          (_, element) => element?.textContent === 'A 6-digit passcode was sent to you at (500) 555-0006.',
        ),
      ).toBeInTheDocument(),
    );
    await waitFor(() => expect(canvas.getByText(/Your code expires in 1:59/)).toBeInTheDocument(), { timeout: 1500 });
    await waitFor(() => expect(canvas.getByText(/Your code expires in 1:58/)).toBeInTheDocument(), { timeout: 1500 });

    await userEvent.click(canvas.getByRole('button', { name: 'Resend code' }));
    await waitFor(() => expect(canvas.getByText(/Your code expires in 2:00/)).toBeInTheDocument());
    await waitFor(() => expect(canvas.getByText('Enter passcode')).toBeInTheDocument());
    await waitFor(() =>
      expect(
        canvas.getByText(
          (_, element) => element?.textContent === 'A 6-digit passcode was sent to you at (500) 555-0006.',
        ),
      ).toBeInTheDocument(),
    );
  },
} satisfies Story;

export const EntrySendError = {
  ...Entry,
  parameters: {
    ...Entry.parameters,
    msw: {
      handlers: {
        b2bSmsOtpSend: http.post<never, B2BSMSSendOptions, ErrorResponse>(
          'https://api.stytch.com/sdk/v1/b2b/otps/sms/send',
          async () => {
            await delay(300);
            return makeErrorResponse({
              errorType: 'phone_number_not_found',
              statusCode: 404,
              message: 'Phone number could not be found.',
            });
          },
        ),
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => expect(canvas.getByText('Resend code')).toBeInTheDocument());
    await waitFor(() => expect(canvas.getByText('Phone number could not be found.')).toBeInTheDocument());
  },
} satisfies Story;

export const EntrySendNetworkError = {
  ...Entry,
  parameters: {
    ...Entry.parameters,
    msw: {
      handlers: {
        b2bSmsOtpSend: http.post<never, B2BSMSSendOptions, never>(
          'https://api.stytch.com/sdk/v1/b2b/otps/sms/send',
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
    await waitFor(() => expect(canvas.getByText('Resend code')).toBeInTheDocument());
    await waitFor(() => expect(canvas.getByText('Unable to contact our servers.')).toBeInTheDocument());
  },
} satisfies Story;

export const EntrySwitchToTOTP = {
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
              enrolledMfaMethods: [B2BMFAProducts.totp, B2BMFAProducts.smsOtp],
            },
          },
        },
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => expect(canvas.getByText('Enter passcode')).toBeInTheDocument());
    await userEvent.click(canvas.getByRole('button', { name: 'Use an authenticator app' }));
    await waitFor(() => expect(canvas.getByText('Enter verification code')).toBeInTheDocument());
    await waitFor(() => expect(canvas.getByText('Text me a code instead')).toBeInTheDocument());
  },
} satisfies Story;
