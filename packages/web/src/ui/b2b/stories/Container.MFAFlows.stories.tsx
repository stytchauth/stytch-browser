import type { Meta, StoryObj } from '@storybook/react';
import { B2BPasswordAuthenticateResponse, StytchEventType } from '@stytch/core/public';
import { HttpResponse } from 'msw';
import { expect, getByAltText, getByText, queryByRole, queryByText, userEvent, waitFor, within } from 'storybook/test';

import { clientsideServicesLoader } from '../../../../.storybook/clientsideServicesStorybookLoader';
import { b2bAuthenticateResponseSuccess, makeB2BPasswordsAuthenticateHandler } from '../../../../.storybook/handlers';
import { onEvent } from '../../../../.storybook/stytchDecorator';
import { MOCK_TOTP_RECOVERY_CODES } from '../../../testUtils';
import Container from '../Container';
import ContainerMeta from '../Container.stories';
import { Canvas, completeSmsOtpEnrollment, getBackButton } from '../storyUtils';
import { FlowPasswordAuthenticate } from './Container.PasswordAuth.stories';

const b2bPasswordsAuthenticateResponseMfaEnrollmentRequired = {
  ...b2bAuthenticateResponseSuccess,
  organization: {
    ...b2bAuthenticateResponseSuccess.organization,
    mfa_policy: 'REQUIRED_FOR_ALL',
  },
  intermediate_session_token: 'fake-intermediate-session-token',
  member_authenticated: false,
  member_session: null,
  mfa_required: { member_options: null, secondary_auth_initiated: null },
  primary_required: null,
} satisfies B2BPasswordAuthenticateResponse;

const b2bPasswordsAuthenticateResponseMfaEnrollmentMemberRequired = {
  ...b2bPasswordsAuthenticateResponseMfaEnrollmentRequired,
  organization: b2bAuthenticateResponseSuccess.organization,
  member: {
    ...b2bAuthenticateResponseSuccess.member,
    mfa_enrolled: true,
  },
} satisfies B2BPasswordAuthenticateResponse;

const b2bPasswordsAuthenticateResponseMfaEnrollmentTotpRequired = {
  ...b2bPasswordsAuthenticateResponseMfaEnrollmentRequired,
  organization: {
    ...b2bPasswordsAuthenticateResponseMfaEnrollmentRequired.organization,
    mfa_policy: 'REQUIRED_FOR_ALL',
    mfa_methods: 'RESTRICTED',
    allowed_mfa_methods: ['totp'],
  },
} satisfies B2BPasswordAuthenticateResponse;

const b2bPasswordsAuthenticateResponseMfaEnrollmentSmsOtpRequired = {
  ...b2bPasswordsAuthenticateResponseMfaEnrollmentTotpRequired,
  organization: {
    ...b2bPasswordsAuthenticateResponseMfaEnrollmentTotpRequired.organization,
    allowed_mfa_methods: ['sms_otp'],
  },
} satisfies B2BPasswordAuthenticateResponse;

const b2bPasswordsAuthenticateResponseMfaEnrollmentSmsOtpWithNumber = {
  ...b2bPasswordsAuthenticateResponseMfaEnrollmentSmsOtpRequired,
  member: {
    ...b2bPasswordsAuthenticateResponseMfaEnrollmentSmsOtpRequired.member,
    mfa_phone_number: '+442071234567',
    mfa_phone_number_verified: false,
  },
  mfa_required: { member_options: { mfa_phone_number: '+442071234567' }, secondary_auth_initiated: 'sms_otp' },
} satisfies B2BPasswordAuthenticateResponse;

const b2bPasswordsAuthenticateResponseMfaEntryTotpRequired = {
  ...b2bPasswordsAuthenticateResponseMfaEnrollmentRequired,
  organization: {
    ...b2bPasswordsAuthenticateResponseMfaEnrollmentRequired.organization,
    allowed_mfa_methods: ['totp'],
  },
  member: {
    ...b2bPasswordsAuthenticateResponseMfaEnrollmentRequired.member,
    default_mfa_method: 'totp',
    totp_registration_id: 'fake-totp-registration-id',
  },
  mfa_required: { member_options: null, secondary_auth_initiated: null },
} satisfies B2BPasswordAuthenticateResponse;

const b2bPasswordsAuthenticateResponseMfaEntrySmsOtpRequired = {
  ...b2bPasswordsAuthenticateResponseMfaEnrollmentRequired,
  organization: {
    ...b2bPasswordsAuthenticateResponseMfaEnrollmentRequired.organization,
    allowed_mfa_methods: ['sms_otp'],
  },
  member: {
    ...b2bPasswordsAuthenticateResponseMfaEnrollmentRequired.member,
    default_mfa_method: 'sms_otp',
    mfa_phone_number: '+15005550006',
    mfa_phone_number_verified: true,
  },
  mfa_required: { member_options: { mfa_phone_number: '+15005550006' }, secondary_auth_initiated: 'sms_otp' },
} satisfies B2BPasswordAuthenticateResponse;

const b2bPasswordsAuthenticateResponseMfaEntryTotpDefault = {
  ...b2bPasswordsAuthenticateResponseMfaEntryTotpRequired,
  organization: {
    ...b2bPasswordsAuthenticateResponseMfaEntryTotpRequired.organization,
    allowed_mfa_methods: [],
    mfa_methods: 'ALL_ALLOWED',
  },
  member: {
    ...b2bPasswordsAuthenticateResponseMfaEntryTotpRequired.member,
    mfa_phone_number: '+15005550006',
    mfa_phone_number_verified: true,
  },
} satisfies B2BPasswordAuthenticateResponse;

const b2bPasswordsAuthenticateResponseMfaEntrySmsOtpDefault = {
  ...b2bPasswordsAuthenticateResponseMfaEntryTotpDefault,
  member: {
    ...b2bPasswordsAuthenticateResponseMfaEntryTotpDefault.member,
    default_mfa_method: 'sms_otp',
  },
  mfa_required: { member_options: { mfa_phone_number: '+15005550006' }, secondary_auth_initiated: 'sms_otp' },
} satisfies B2BPasswordAuthenticateResponse;

const b2bPasswordsAuthenticateResponseMfaEntrySmsOtpDeferred = {
  ...b2bPasswordsAuthenticateResponseMfaEntrySmsOtpRequired,
  mfa_required: {
    ...b2bPasswordsAuthenticateResponseMfaEntrySmsOtpRequired.mfa_required,
    secondary_auth_initiated: null,
  },
} satisfies B2BPasswordAuthenticateResponse;

const b2bPasswordsAuthenticateResponseMfaEntrySmsOtpDefaultNotSupported = {
  ...b2bPasswordsAuthenticateResponseMfaEntrySmsOtpDefault,
  organization: {
    ...b2bPasswordsAuthenticateResponseMfaEntrySmsOtpDefault.organization,
    allowed_mfa_methods: ['totp'],
    mfa_methods: 'RESTRICTED',
  },
  mfa_required: { member_options: null, secondary_auth_initiated: null },
} satisfies B2BPasswordAuthenticateResponse;

const meta = {
  ...ContainerMeta,
  title: 'b2b/Container/MFA Flows',
  loaders: [clientsideServicesLoader],
} satisfies Meta<typeof Container>;

export default meta;

type Story = StoryObj<typeof meta>;

const completeSmsOtpEntry = async (canvas: Canvas) => {
  await waitFor(() => expect(canvas.getByText('Enter passcode')).toBeInTheDocument());
  await expect(getBackButton(canvas)).toBeInTheDocument();
  await expect(
    canvas.getByText(
      (_, element) => element?.textContent === 'A 6-digit passcode was sent to you at +1 (500) 555-0006.',
    ),
  ).toBeInTheDocument();
  await userEvent.type(canvas.getByLabelText('One-time passcode'), '123456', { delay: 100 });
};

export const EnrollmentRequired = {
  ...FlowPasswordAuthenticate,
  parameters: {
    ...FlowPasswordAuthenticate.parameters,
    msw: {
      handlers: {
        b2bPasswordsAuthenticate: makeB2BPasswordsAuthenticateHandler(() =>
          HttpResponse.json({
            data: b2bPasswordsAuthenticateResponseMfaEnrollmentRequired,
          }),
        ),
      },
    },
  },
  play: async (params) => {
    await FlowPasswordAuthenticate.play(params);

    const { canvasElement } = params;
    const canvas = within(canvasElement);
    const submitButton = canvas.getByRole('button', { name: 'Continue' });
    await userEvent.click(submitButton);
    await waitFor(() => expect(getByText(canvasElement, 'Set up Multi-Factor Authentication')).toBeInTheDocument());
    await waitFor(() => expect(getByText(canvasElement, 'Use an authenticator app')).toBeInTheDocument());
    await waitFor(() => expect(getByText(canvasElement, 'Text me a code')).toBeInTheDocument());
    await waitFor(() => expect(queryByText(canvasElement, 'Not now')).not.toBeInTheDocument());
  },
} satisfies Story;

export const EnrollmentMemberRequired = {
  ...EnrollmentRequired,
  parameters: {
    ...EnrollmentRequired.parameters,
    msw: {
      handlers: {
        b2bPasswordsAuthenticate: makeB2BPasswordsAuthenticateHandler(() =>
          HttpResponse.json({
            data: b2bPasswordsAuthenticateResponseMfaEnrollmentMemberRequired,
          }),
        ),
      },
    },
  },
} satisfies Story;

export const EnrollmentRequiredSMSOTPComplete = {
  ...EnrollmentRequired,
  play: async (params) => {
    await EnrollmentRequired.play(params);

    const { canvasElement } = params;
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: 'Text me a code' }));

    await completeSmsOtpEnrollment(canvas);
    await completeSmsOtpEntry(canvas);

    await waitFor(() => expect(canvas.getByText('Success!')).toBeInTheDocument());
    await waitFor(() =>
      expect(onEvent).toHaveBeenCalledWith({ type: StytchEventType.AuthenticateFlowComplete, data: {} }),
    );
  },
} satisfies Story;

export const EnrollmentTOTPRequired = {
  ...FlowPasswordAuthenticate,
  parameters: {
    ...FlowPasswordAuthenticate.parameters,
    msw: {
      handlers: {
        b2bPasswordsAuthenticate: makeB2BPasswordsAuthenticateHandler(() =>
          HttpResponse.json({
            data: b2bPasswordsAuthenticateResponseMfaEnrollmentTotpRequired,
          }),
        ),
      },
    },
  },
  play: async (params) => {
    await FlowPasswordAuthenticate.play(params);

    const { canvasElement } = params;
    const canvas = within(canvasElement);
    const submitButton = canvas.getByRole('button', { name: 'Continue' });
    await userEvent.click(submitButton);
    await waitFor(() =>
      expect(getByText(canvasElement, 'Scan the QR code to link your authenticator app')).toBeInTheDocument(),
    );
    await waitFor(() => expect(getByAltText(canvasElement, 'QR code for TOTP enrollment')).toBeInTheDocument());
    await waitFor(() => expect(getByText(canvasElement, 'Continue')).toBeInTheDocument());
    await waitFor(() => expect(queryByText(canvasElement, 'Not now')).not.toBeInTheDocument());
  },
} satisfies Story;

export const EnrollmentTOTPRequiredComplete = {
  ...EnrollmentTOTPRequired,
  play: async (params) => {
    await EnrollmentTOTPRequired.play(params);

    const { canvasElement } = params;
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Continue' }));
    await waitFor(() => expect(canvas.getByText('Enter verification code')).toBeInTheDocument());

    await userEvent.type(canvas.getByLabelText('One-time passcode'), '654321', { delay: 100 });
    await waitFor(() => expect(canvas.getByText('Save your backup codes!')).toBeInTheDocument());
    for (const code of MOCK_TOTP_RECOVERY_CODES) {
      await expect(canvas.getByText(code)).toBeInTheDocument();
    }

    await new Promise((resolve) => setTimeout(resolve, 100));
    await expect(onEvent).not.toHaveBeenCalledWith({ type: StytchEventType.AuthenticateFlowComplete, data: {} });

    await userEvent.click(canvas.getByRole('button', { name: 'Done' }));

    await waitFor(() => expect(canvas.getByText('Success!')).toBeInTheDocument());
    await waitFor(() =>
      expect(onEvent).toHaveBeenCalledWith({ type: StytchEventType.AuthenticateFlowComplete, data: {} }),
    );
  },
} satisfies Story;

export const EnrollmentSMSOTPRequired = {
  ...FlowPasswordAuthenticate,
  parameters: {
    ...FlowPasswordAuthenticate.parameters,
    msw: {
      handlers: {
        b2bPasswordsAuthenticate: makeB2BPasswordsAuthenticateHandler(() =>
          HttpResponse.json({
            data: b2bPasswordsAuthenticateResponseMfaEnrollmentSmsOtpRequired,
          }),
        ),
      },
    },
  },
  play: async (params) => {
    await FlowPasswordAuthenticate.play(params);

    const { canvasElement } = params;
    const canvas = within(canvasElement);
    const submitButton = canvas.getByRole('button', { name: 'Continue' });
    await userEvent.click(submitButton);
    await waitFor(() =>
      expect(
        getByText(canvasElement, 'Enter your phone number to set up Multi-Factor Authentication'),
      ).toBeInTheDocument(),
    );
    await waitFor(() => expect(queryByText(canvasElement, 'Not now')).not.toBeInTheDocument());
  },
} satisfies Story;

export const EnrollmentSMSOTPRequiredResend = {
  ...EnrollmentSMSOTPRequired,
  play: async (params) => {
    await EnrollmentSMSOTPRequired.play(params);

    const { canvasElement } = params;
    const canvas = within(canvasElement);

    await completeSmsOtpEnrollment(canvas);
    await waitFor(() =>
      expect(
        canvas.getByText(
          (_, element) => element?.textContent === 'A 6-digit passcode was sent to you at +1 (500) 555-0006.',
        ),
      ).toBeInTheDocument(),
    );

    await waitFor(() => expect(canvas.getByText(/Your code expires in 1:59/)).toBeInTheDocument(), { timeout: 1500 });
    await userEvent.click(canvas.getByRole('button', { name: 'Resend code' }));

    await waitFor(() => expect(canvas.getByText(/Your code expires in 2:00/)).toBeInTheDocument());

    await waitFor(() =>
      expect(
        canvas.getByText(
          (_, element) => element?.textContent === 'A 6-digit passcode was sent to you at +1 (500) 555-0006.',
        ),
      ).toBeInTheDocument(),
    );
  },
} satisfies Story;

export const EnrollmentSMSOTPWithNumber = {
  ...FlowPasswordAuthenticate,
  parameters: {
    ...FlowPasswordAuthenticate.parameters,
    msw: {
      handlers: {
        b2bPasswordsAuthenticate: makeB2BPasswordsAuthenticateHandler(() =>
          HttpResponse.json({
            data: b2bPasswordsAuthenticateResponseMfaEnrollmentSmsOtpWithNumber,
          }),
        ),
      },
    },
  },
  play: async (params) => {
    await FlowPasswordAuthenticate.play(params);

    const { canvasElement } = params;
    const canvas = within(canvasElement);
    const submitButton = canvas.getByRole('button', { name: 'Continue' });
    await userEvent.click(submitButton);
    await waitFor(() => expect(canvas.getByText('Enter passcode')).toBeInTheDocument());
    await waitFor(() =>
      expect(
        canvas.getByText(
          (_, element) => element?.textContent === 'A 6-digit passcode was sent to you at 020 7123 4567.',
        ),
      ).toBeInTheDocument(),
    );

    // User is allowed to go back to enrollment screen to change their phone number
    await userEvent.click(getBackButton(canvas));
    await waitFor(() =>
      expect(canvas.getByText('Enter your phone number to set up Multi-Factor Authentication')).toBeInTheDocument(),
    );
    await expect(canvas.queryByText('Not now')).not.toBeInTheDocument();
    await expect(canvas.queryByRole('button', { name: 'Go back' })).not.toBeInTheDocument();
  },
} satisfies Story;

export const EnrollmentSMSOTPRequiredComplete = {
  ...EnrollmentSMSOTPRequired,
  play: async (params) => {
    await EnrollmentSMSOTPRequired.play(params);

    const { canvasElement } = params;
    const canvas = within(canvasElement);

    await completeSmsOtpEnrollment(canvas);
    await completeSmsOtpEntry(canvas);

    await waitFor(() => expect(canvas.getByText('Success!')).toBeInTheDocument());
    await waitFor(() =>
      expect(onEvent).toHaveBeenCalledWith({ type: StytchEventType.AuthenticateFlowComplete, data: {} }),
    );
  },
} satisfies Story;

export const TOTPEntryRequired = {
  ...FlowPasswordAuthenticate,
  parameters: {
    ...FlowPasswordAuthenticate.parameters,
    msw: {
      handlers: {
        b2bPasswordsAuthenticate: makeB2BPasswordsAuthenticateHandler(() =>
          HttpResponse.json({
            data: b2bPasswordsAuthenticateResponseMfaEntryTotpRequired,
          }),
        ),
      },
    },
  },
  play: async (params) => {
    await FlowPasswordAuthenticate.play(params);

    const { canvasElement } = params;
    const canvas = within(canvasElement);
    const submitButton = canvas.getByRole('button', { name: 'Continue' });
    await userEvent.click(submitButton);
    await waitFor(() => expect(getByText(canvasElement, 'Enter verification code')).toBeInTheDocument());
    await waitFor(() => expect(queryByText(canvasElement, 'Text me a code instead')).not.toBeInTheDocument());
  },
} satisfies Story;

export const TOTPEntryDefault = {
  ...FlowPasswordAuthenticate,
  parameters: {
    ...FlowPasswordAuthenticate.parameters,
    msw: {
      handlers: {
        b2bPasswordsAuthenticate: makeB2BPasswordsAuthenticateHandler(() =>
          HttpResponse.json({
            data: b2bPasswordsAuthenticateResponseMfaEntryTotpDefault,
          }),
        ),
      },
    },
  },
  play: async (params) => {
    await FlowPasswordAuthenticate.play(params);

    const { canvasElement } = params;
    const canvas = within(canvasElement);
    const submitButton = canvas.getByRole('button', { name: 'Continue' });
    await userEvent.click(submitButton);
    await waitFor(() => expect(getByText(canvasElement, 'Enter verification code')).toBeInTheDocument());
    await waitFor(() => expect(getByText(canvasElement, 'Text me a code instead')).toBeInTheDocument());
  },
} satisfies Story;

export const SMSOTPEntryRequired = {
  ...FlowPasswordAuthenticate,
  parameters: {
    ...FlowPasswordAuthenticate.parameters,
    msw: {
      handlers: {
        b2bPasswordsAuthenticate: makeB2BPasswordsAuthenticateHandler(() =>
          HttpResponse.json({
            data: b2bPasswordsAuthenticateResponseMfaEntrySmsOtpRequired,
          }),
        ),
      },
    },
  },
  play: async (params) => {
    await FlowPasswordAuthenticate.play(params);

    const { canvasElement } = params;
    const canvas = within(canvasElement);
    const submitButton = canvas.getByRole('button', { name: 'Continue' });
    await userEvent.click(submitButton);
    await waitFor(() => expect(getByText(canvasElement, 'Enter passcode')).toBeInTheDocument());

    await expect(getByText(canvasElement, /^Your code expires in 2:00/)).toBeInTheDocument();
    await waitFor(() =>
      expect(
        canvas.getByText(
          (_, element) => element?.textContent === 'A 6-digit passcode was sent to you at (500) 555-0006.',
        ),
      ).toBeInTheDocument(),
    );
    await expect(queryByRole(canvasElement, 'button', { name: 'Go back' })).not.toBeInTheDocument();
    await expect(queryByText(canvasElement, 'Use an authenticator app')).not.toBeInTheDocument();
  },
} satisfies Story;

export const TOTPEntryBackupCodeComplete = {
  ...TOTPEntryDefault,
  play: async (params) => {
    await TOTPEntryDefault.play(params);

    const { canvasElement } = params;
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Use a backup code' }));
    await userEvent.type(canvas.getByPlaceholderText('Enter backup code'), '1234-abcd-5678');
    await userEvent.click(canvas.getByRole('button', { name: 'Continue' }));

    await waitFor(() => expect(canvas.getByText('Success!')).toBeInTheDocument());
    await waitFor(() =>
      expect(onEvent).toHaveBeenCalledWith({ type: StytchEventType.AuthenticateFlowComplete, data: {} }),
    );
  },
} satisfies Story;

export const SMSOTPEntryRequiredComplete = {
  ...SMSOTPEntryRequired,
  play: async (params) => {
    await SMSOTPEntryRequired.play(params);

    const { canvasElement } = params;
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByLabelText('One-time passcode'), '123456', { delay: 100 });
    await waitFor(() => expect(canvas.getByText('Success!')).toBeInTheDocument());
    await waitFor(() =>
      expect(onEvent).toHaveBeenCalledWith({ type: StytchEventType.AuthenticateFlowComplete, data: {} }),
    );
  },
} satisfies Story;

export const SMSOTPEntryDefault = {
  ...FlowPasswordAuthenticate,
  parameters: {
    ...FlowPasswordAuthenticate.parameters,
    msw: {
      handlers: {
        b2bPasswordsAuthenticate: makeB2BPasswordsAuthenticateHandler(() =>
          HttpResponse.json({
            data: b2bPasswordsAuthenticateResponseMfaEntrySmsOtpDefault,
          }),
        ),
      },
    },
  },
  play: async (params) => {
    await FlowPasswordAuthenticate.play(params);

    const { canvasElement } = params;
    const canvas = within(canvasElement);
    const submitButton = canvas.getByRole('button', { name: 'Continue' });
    await userEvent.click(submitButton);
    await waitFor(() => expect(getByText(canvasElement, 'Enter passcode')).toBeInTheDocument());
    await waitFor(() => expect(getByText(canvasElement, 'Use an authenticator app')).toBeInTheDocument());
  },
} satisfies Story;

export const SMSOTPEntryDeferred = {
  ...SMSOTPEntryRequired,
  parameters: {
    ...SMSOTPEntryRequired.parameters,
    msw: {
      handlers: {
        b2bPasswordsAuthenticate: makeB2BPasswordsAuthenticateHandler(() =>
          HttpResponse.json({
            data: b2bPasswordsAuthenticateResponseMfaEntrySmsOtpDeferred,
          }),
        ),
      },
    },
  },
  play: async (params) => {
    await FlowPasswordAuthenticate.play(params);

    const { canvasElement } = params;
    const canvas = within(canvasElement);
    const submitButton = canvas.getByRole('button', { name: 'Continue' });
    await userEvent.click(submitButton);
    await waitFor(() => expect(getByText(canvasElement, 'Enter passcode')).toBeInTheDocument());
    await waitFor(() => expect(queryByText(canvasElement, 'Use an authenticator app')).not.toBeInTheDocument());
  },
} satisfies Story;

export const SMSOTPEntryDefaultNotSupported = {
  ...FlowPasswordAuthenticate,
  parameters: {
    ...FlowPasswordAuthenticate.parameters,
    msw: {
      handlers: {
        b2bPasswordsAuthenticate: makeB2BPasswordsAuthenticateHandler(() =>
          HttpResponse.json({
            data: b2bPasswordsAuthenticateResponseMfaEntrySmsOtpDefaultNotSupported,
          }),
        ),
      },
    },
  },
  play: async (params) => {
    await FlowPasswordAuthenticate.play(params);

    const { canvasElement } = params;
    const canvas = within(canvasElement);
    const submitButton = canvas.getByRole('button', { name: 'Continue' });
    await userEvent.click(submitButton);
    await waitFor(() => expect(canvas.getByText('Enter verification code')).toBeInTheDocument());
  },
} satisfies Story;
