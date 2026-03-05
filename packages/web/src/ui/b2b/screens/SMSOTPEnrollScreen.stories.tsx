import type { Meta, StoryObj } from '@storybook/react-vite';
import { B2BMFAProducts, B2BSMSSendOptions } from '@stytch/core/public';
import { delay, http, HttpResponse } from 'msw';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { makeErrorResponse } from '../../../../.storybook/handlers';
import { AppScreens } from '../types/AppScreens';
import { SMSOTPEnrollScreen } from './SMSOTPEnrollScreen';

const validPhoneNumber = '5005550006';
const invalidPhoneNumber = '123';
const duplicatePhoneNumber = '5005550007';

const meta = {
  component: SMSOTPEnrollScreen,
  parameters: {
    msw: {
      handlers: {
        b2bSmsOtpSend: http.post<never, B2BSMSSendOptions, never>(
          'https://api.stytch.com/sdk/v1/b2b/otps/sms/send',
          async ({ request }) => {
            const body = await request.json();
            await delay(300);

            if (body.mfa_phone_number === '+1' + duplicatePhoneNumber) {
              return makeErrorResponse({
                statusCode: 400,
                errorType: 'duplicate_member_phone_number',
              });
            }

            return HttpResponse.json({
              statusCode: 200,
              request_id: '123',
            });
          },
        ),
      },
    },
    stytch: {
      b2b: {
        initialState: {
          mfa: {
            primaryInfo: {
              enrolledMfaMethods: [],
              memberPhoneNumber: '+1' + validPhoneNumber,
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
} satisfies Meta<typeof SMSOTPEnrollScreen>;

export default meta;

type Story = StoryObj<typeof meta>;

export const _SMSOTPEnrollScreen = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: 'Continue' })).toBeDisabled();
    await expect(canvas.queryByText('Not now')).not.toBeInTheDocument();
  },
} satisfies Story;

export const ValidPhoneNumber = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByRole('textbox'), validPhoneNumber, { delay: 10 });

    await waitFor(() => expect(canvas.getByRole('button', { name: 'Continue' })).toBeEnabled());
  },
} satisfies Story;

export const InvalidPhoneNumber = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByRole('textbox'), invalidPhoneNumber, { delay: 10 });

    await waitFor(() => expect(canvas.getByRole('button', { name: 'Continue' })).toBeEnabled());
    await userEvent.click(canvas.getByRole('button', { name: 'Continue' }));

    await waitFor(() =>
      expect(
        canvas.getByText('Phone number format is invalid. Ensure the phone number is in the E.164 format.'),
      ).toBeInTheDocument(),
    );
  },
} satisfies Story;

export const DuplicatePhoneNumber = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByRole('textbox'), duplicatePhoneNumber, { delay: 10 });

    await waitFor(() => expect(canvas.getByRole('button', { name: 'Continue' })).toBeEnabled());
    await userEvent.click(canvas.getByRole('button', { name: 'Continue' }));

    await waitFor(() =>
      expect(
        canvas.getByText('A member with the specified phone number already exists for this organization.'),
      ).toBeInTheDocument(),
    );
  },
} satisfies Story;

export const DefaultNumber = {
  parameters: {
    stytch: {
      b2b: {
        initialState: {
          mfa: {
            primaryInfo: {
              ...meta.parameters.stytch.b2b.initialState.mfa.primaryInfo,
              enrolledMfaMethods: [B2BMFAProducts.smsOtp],
            },
            smsOtp: {
              enrolledNumber: {
                countryCode: 'GB',
                phoneNumber: '020 7123 4567',
              },
            },
          },
        },
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('combobox')).toHaveValue('GB');
    await expect(canvas.getByRole('textbox')).toHaveValue('020 7123 4567');
  },
} satisfies Story;
