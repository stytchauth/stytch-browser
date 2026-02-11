import type { Meta, StoryObj } from '@storybook/react';
import { AuthFlowType, B2BOTPsEmailLoginOrSignupOptions, B2BOTPsEmailLoginOrSignupResponse } from '@stytch/core/public';
import { MOCK_REQUEST_ID } from '@stytch/internal-mocks';
import isChromatic from 'chromatic/isChromatic';
import { delay, http, HttpResponse } from 'msw';
import { expect, userEvent } from 'storybook/test';

import { DataResponse, ErrorResponse, makeErrorResponse } from '../../../../.storybook/handlers';
import { MOCK_ORGANIZATION } from '../../../testUtils';
import { emailMagicLinks, emailOtp, oauth, passwords } from '../B2BProducts';
import Container from '../Container';
import ContainerMeta from '../Container.stories';
import { Canvas } from '../storyUtils';
import { AppScreens } from '../types/AppScreens';
import { _DiscoveryMenu } from './Container.DiscoveryMenu.stories';

const meta = {
  ...ContainerMeta,
  title: 'b2b/Container/Email',
  parameters: {
    ...ContainerMeta.parameters,
    stytch: {
      b2b: {
        config: {
          products: [emailOtp, emailMagicLinks],
          emailOtpOptions: {},
        },
      },
    },
  },
} satisfies Meta<typeof Container>;

export default meta;

type Story = StoryObj<typeof meta>;

export const OrgLoginOTPAndEML = {
  parameters: {
    stytch: {
      b2b: {
        initialState: {
          screen: AppScreens.Main,
          flowState: {
            type: AuthFlowType.Organization,
            organization: MOCK_ORGANIZATION,
          },
        },
      },
    },
  },
  play: async ({ canvas }) => {
    await expect(await canvas.findByText('Continue to Fake Organization')).toBeInTheDocument();
    await expect(await canvas.findByText('Continue with email')).toBeInTheDocument();
  },
} satisfies Story;

export const OrgLoginOTPOnly = {
  ...OrgLoginOTPAndEML,
  parameters: {
    ...OrgLoginOTPAndEML.parameters,
    stytch: {
      ...OrgLoginOTPAndEML.parameters.stytch,
      b2b: {
        ...OrgLoginOTPAndEML.parameters.stytch.b2b,
        config: {
          products: [emailOtp],
        },
      },
    },
  },
} satisfies Story;

export const OrgLoginEMLOnly = {
  ...OrgLoginOTPAndEML,
  parameters: {
    ...OrgLoginOTPAndEML.parameters,
    stytch: {
      ...OrgLoginOTPAndEML.parameters.stytch,
      b2b: {
        ...OrgLoginOTPAndEML.parameters.stytch.b2b,
        config: {
          products: [emailMagicLinks],
        },
      },
    },
  },
} satisfies Story;

export const DiscoveryLoginOTPAndEML = {
  parameters: {
    stytch: {
      b2b: {
        initialState: {
          screen: AppScreens.Main,
          flowState: {
            type: AuthFlowType.Discovery,
          },
        },
      },
    },
  },
  play: async ({ canvas }) => {
    await expect(await canvas.findByText('Sign up or log in')).toBeInTheDocument();
    await expect(await canvas.findByText('Continue with email')).toBeInTheDocument();
  },
} satisfies Story;

export const DiscoveryLoginOTPOnly = {
  ...DiscoveryLoginOTPAndEML,
  parameters: {
    ...DiscoveryLoginOTPAndEML.parameters,
    stytch: {
      ...DiscoveryLoginOTPAndEML.parameters.stytch,
      b2b: {
        ...DiscoveryLoginOTPAndEML.parameters.stytch.b2b,
        config: {
          products: [emailOtp],
        },
      },
    },
  },
} satisfies Story;

export const DiscoveryLoginEMLOnly = {
  ...DiscoveryLoginOTPAndEML,
  parameters: {
    ...DiscoveryLoginOTPAndEML.parameters,
    stytch: {
      ...DiscoveryLoginOTPAndEML.parameters.stytch,
      b2b: {
        ...DiscoveryLoginOTPAndEML.parameters.stytch.b2b,
        config: {
          products: [emailMagicLinks],
        },
      },
    },
  },
} satisfies Story;

const submitEmail = async (canvas: Canvas, email = 'test@stytch.com') => {
  const emailInput = await canvas.findByLabelText('Email');
  await userEvent.type(emailInput, email);
  await userEvent.click(canvas.getByRole('button', { name: 'Continue with email' }));
};

const submitOtp = async (canvas: Canvas, code = '123456') => {
  const otpInput = await canvas.findByLabelText('One-time passcode');
  await userEvent.type(otpInput, code, { delay: 100 });
};

export const FlowOrgOTPInvalidEmail = {
  ...OrgLoginOTPOnly,
  play: async ({ canvas }) => {
    await submitEmail(canvas, 'inactive-email@stytch.com');

    await expect(
      await canvas.findByText(
        'The email address is marked as inactive. Please try another email address, or contact your admin if you think this is a mistake.',
      ),
    ).toBeInTheDocument();
  },
} satisfies Story;

export const FlowOrgOTPError = {
  ...OrgLoginOTPOnly,
  play: async ({ canvas }) => {
    await submitEmail(canvas, 'error@stytch.com');

    await expect(
      await canvas.findByText(
        'We were unable to reach this email address. Please try another email or contact your admin.',
      ),
    ).toBeInTheDocument();
  },
} satisfies Story;

export const FlowOrgOTPResend = {
  ...OrgLoginOTPOnly,
  play: async ({ canvas }) => {
    await submitEmail(canvas);

    await canvas.findByText(/Your code expires in 10:00/);
    await canvas.findByText(/Your code expires in 9:59/, undefined, { timeout: 1500 });
    await canvas.findByText(/Your code expires in 9:58/, undefined, { timeout: 1500 });

    await userEvent.click(await canvas.findByText('Resend code'));
    await canvas.findByText(/Your code expires in 10:00/);
  },
} satisfies Story;

export const FlowOrgOTPInvalidEmailResend = {
  ...OrgLoginOTPOnly,
  play: async ({ canvas }) => {
    const email = isChromatic() ? `inactive-email+chromatic@stytch.com` : `inactive-email+${Date.now()}@stytch.com`;
    await submitEmail(canvas, email);

    await canvas.findByText(/Your code expires in 10:00/);
    await canvas.findByText(/Your code expires in 9:59/, undefined, { timeout: 1500 });
    await expect(
      await canvas.queryByText(
        'The email address is marked as inactive. Please try another email address, or contact your admin if you think this is a mistake.',
      ),
    ).not.toBeInTheDocument();

    await userEvent.click(await canvas.findByText('Resend code'));
    await expect(
      await canvas.findByText(
        'The email address is marked as inactive. Please try another email address, or contact your admin if you think this is a mistake.',
      ),
    ).toBeInTheDocument();
  },
} satisfies Story;

let flowOrgOTPResendErrorShowError = false;
export const FlowOrgOTPResendError = {
  ...OrgLoginOTPOnly,
  parameters: {
    ...OrgLoginOTPOnly.parameters,
    msw: {
      handlers: {
        b2bOtpEmailLoginOrSignup: http.post<
          never,
          B2BOTPsEmailLoginOrSignupOptions,
          DataResponse<B2BOTPsEmailLoginOrSignupResponse> | ErrorResponse
        >('https://api.stytch.com/sdk/v1/b2b/otps/email/login_or_signup', async () => {
          await delay(300);
          if (flowOrgOTPResendErrorShowError) {
            return makeErrorResponse({
              errorType: 'test',
              statusCode: 400,
              message: 'We were unable to reach this email address. Please try another email or contact your admin.',
            });
          }
          return HttpResponse.json({
            data: {
              request_id: MOCK_REQUEST_ID,
              status_code: 200,
            },
          });
        }),
      },
    },
  },
  play: async ({ canvas }) => {
    flowOrgOTPResendErrorShowError = false;
    await submitEmail(canvas, 'example@stytch.com');

    await canvas.findByText(/Your code expires in 10:00/);
    await canvas.findByText(/Your code expires in 9:59/, undefined, { timeout: 1500 });
    await expect(
      await canvas.queryByText(
        'We were unable to reach this email address. Please try another email or contact your admin.',
      ),
    ).not.toBeInTheDocument();

    flowOrgOTPResendErrorShowError = true;
    await userEvent.click(await canvas.findByText('Resend code'));
    await expect(
      await canvas.findByText(
        'We were unable to reach this email address. Please try another email or contact your admin.',
      ),
    ).toBeInTheDocument();
  },
} satisfies Story;

export const FlowOrgOTPBack = {
  ...OrgLoginOTPOnly,
  play: async ({ canvas }) => {
    await submitEmail(canvas);

    await userEvent.click(await canvas.findByRole('button', { name: 'Go back' }));
    await expect(await canvas.findByText('Continue with email')).toBeInTheDocument();
  },
} satisfies Story;

export const FlowOrgOTPInvalidCode = {
  ...FlowOrgOTPResend,
  play: async ({ canvas }) => {
    await submitEmail(canvas);
    await submitOtp(canvas, '987654');
    await canvas.findByText('Unauthorized credentials.');
  },
} satisfies Story;

export const FlowOrgOTPSubmit = {
  ...OrgLoginOTPOnly,
  play: async ({ canvas }) => {
    await submitEmail(canvas);
    await submitOtp(canvas);

    await expect(await canvas.findByText('You have successfully logged in.')).toBeInTheDocument();
  },
} satisfies Story;

export const FlowOrgOTPAndEMLChoice = {
  ...OrgLoginOTPAndEML,
  play: async ({ canvas }) => {
    await submitEmail(canvas);

    expect(await canvas.findByText('Select how you’d like to continue')).toBeInTheDocument();
  },
} satisfies Story;

export const FlowOrgOTPAndEMLChoiceBackPreserved = {
  ...FlowOrgOTPAndEMLChoice,
  play: async (params) => {
    await FlowOrgOTPAndEMLChoice.play(params);
    const { canvas } = params;

    await userEvent.click(canvas.getByRole('button', { name: 'Go back' }));

    await expect(await canvas.findByText('Continue to Fake Organization')).toBeInTheDocument();
    await expect(await canvas.findByText('Continue with email')).toBeInTheDocument();
    await expect(await canvas.findByLabelText('Email')).toHaveValue('test@stytch.com');
  },
} satisfies Story;

export const FlowOrgOTPAndEMLSubmitOTP = {
  ...FlowOrgOTPAndEMLChoice,
  play: async (params) => {
    await FlowOrgOTPAndEMLChoice.play(params);
    const { canvas } = params;

    await userEvent.click(canvas.getByRole('button', { name: 'Email me a login code' }));

    await submitOtp(canvas);
    await expect(await canvas.findByText('You have successfully logged in.')).toBeInTheDocument();
  },
} satisfies Story;

export const FlowOrgOTPAndEMLSubmitOTPBack = {
  ...FlowOrgOTPAndEMLChoice,
  play: async (params) => {
    await FlowOrgOTPAndEMLChoice.play(params);
    const { canvas } = params;

    await userEvent.click(canvas.getByRole('button', { name: 'Email me a login code' }));
    await expect(await canvas.findByText('Enter passcode')).toBeInTheDocument();

    await userEvent.click(await canvas.findByRole('button', { name: 'Go back' }));
    expect(await canvas.findByText('Select how you’d like to continue')).toBeInTheDocument();

    await userEvent.click(await canvas.findByRole('button', { name: 'Go back' }));
    expect(await canvas.findByText('Continue to Fake Organization')).toBeInTheDocument();
    expect(await canvas.findByText('Continue with email')).toBeInTheDocument();
  },
} satisfies Story;

export const FlowOrgOTPAndEMLSubmitOTPError = {
  ...FlowOrgOTPAndEMLChoice,
  parameters: {
    ...FlowOrgOTPAndEMLChoice.parameters,
    msw: {
      handlers: {
        b2bOtpEmailLoginOrSignup: http.post<never, B2BOTPsEmailLoginOrSignupOptions, ErrorResponse>(
          'https://api.stytch.com/sdk/v1/b2b/otps/email/login_or_signup',
          async () => {
            await delay(300);
            return makeErrorResponse({
              errorType: 'invalid_request',
              statusCode: 400,
              message: 'Invalid request',
            });
          },
        ),
      },
    },
  },
  play: async (params) => {
    await FlowOrgOTPAndEMLChoice.play(params);
    const { canvas } = params;

    await userEvent.click(canvas.getByRole('button', { name: 'Email me a login code' }));

    await expect(await canvas.findByText('Invalid request')).toBeInTheDocument();
  },
} satisfies Story;

export const FlowOrgOTPAndEMLSubmitEML = {
  ...FlowOrgOTPAndEMLChoice,
  play: async (params) => {
    await FlowOrgOTPAndEMLChoice.play(params);
    const { canvas } = params;

    await userEvent.click(canvas.getByRole('button', { name: 'Email me a login link' }));

    expect(await canvas.findByText('Check your email')).toBeInTheDocument();
  },
} satisfies Story;

export const FlowDiscoveryOTPInvalidEmail = {
  ...DiscoveryLoginOTPOnly,
  play: FlowOrgOTPInvalidEmail.play,
} satisfies Story;

export const FlowDiscoveryOTPError = {
  ...DiscoveryLoginOTPOnly,
  play: FlowOrgOTPError.play,
} satisfies Story;

export const FlowDiscoveryOTPResend = {
  ...DiscoveryLoginOTPOnly,
  play: FlowOrgOTPResend.play,
} satisfies Story;

export const FlowDiscoveryOTPInvalidEmailResend = {
  ...DiscoveryLoginOTPOnly,
  play: FlowOrgOTPInvalidEmailResend.play,
} satisfies Story;

export const FlowDiscoveryOTPResendError = {
  ...DiscoveryLoginOTPOnly,
  parameters: {
    ...DiscoveryLoginOTPOnly.parameters,
    msw: {
      handlers: {
        b2bOtpEmailDiscoverySend: http.post<
          never,
          B2BOTPsEmailLoginOrSignupOptions,
          DataResponse<B2BOTPsEmailLoginOrSignupResponse> | ErrorResponse
        >('https://api.stytch.com/sdk/v1/b2b/otps/email/discovery/send', async () => {
          await delay(300);
          if (flowOrgOTPResendErrorShowError) {
            return makeErrorResponse({
              errorType: 'test',
              statusCode: 400,
              message: 'We were unable to reach this email address. Please try another email or contact your admin.',
            });
          }
          return HttpResponse.json({
            data: {
              request_id: MOCK_REQUEST_ID,
              status_code: 200,
            },
          });
        }),
      },
    },
  },
  play: FlowOrgOTPResendError.play,
} satisfies Story;

export const FlowDiscoveryOTPBack = {
  ...FlowDiscoveryOTPResend,
  play: FlowOrgOTPBack.play,
} satisfies Story;

export const FlowDiscoveryOTPInvalidCode = {
  ...FlowDiscoveryOTPResend,
  play: FlowOrgOTPInvalidCode.play,
} satisfies Story;

export const FlowDiscoveryOTPSubmit = {
  ...DiscoveryLoginOTPOnly,
  play: async ({ canvas }) => {
    await submitEmail(canvas);

    await submitOtp(canvas);

    await canvas.findByText('Create an organization to get started');
    await userEvent.click(await canvas.findByText('Create an organization'));

    await expect(await canvas.findByText('Email me a code')).toBeInTheDocument();
    await expect(await canvas.queryByText('Email me a link')).not.toBeInTheDocument();
  },
} satisfies Story;

export const FlowDiscoveryOTPAndEMLChoice = {
  ...DiscoveryLoginOTPAndEML,
  play: FlowOrgOTPAndEMLChoice.play,
} satisfies Story;

export const FlowDiscoveryOTPAndEMLChoiceBackPreserved = {
  ...FlowDiscoveryOTPAndEMLChoice,
  play: async (params) => {
    await FlowDiscoveryOTPAndEMLChoice.play(params);
    const { canvas } = params;

    await userEvent.click(canvas.getByRole('button', { name: 'Go back' }));

    await expect(await canvas.findByText('Sign up or log in')).toBeInTheDocument();
    await expect(await canvas.findByText('Continue with email')).toBeInTheDocument();
    await expect(await canvas.findByLabelText('Email')).toHaveValue('test@stytch.com');
  },
} satisfies Story;

export const FlowDiscoveryOTPAndEMLSubmitOTP = {
  ...FlowDiscoveryOTPAndEMLChoice,
  play: async (params) => {
    await FlowDiscoveryOTPAndEMLChoice.play(params);
    const { canvas } = params;

    await userEvent.click(canvas.getByRole('button', { name: 'Email me a login code' }));

    await submitOtp(canvas);

    await canvas.findByText('Create an organization to get started');
    await canvas.findByText(
      'test@stytch.com does not have an account. Think this is a mistake? Try a different email address, or contact your admin.',
    );
    await userEvent.click(await canvas.findByText('Create an organization'));

    await expect(await canvas.findByText('Email me a code')).toBeEnabled();
    await expect(await canvas.findByText('Email me a link')).toBeEnabled();

    await userEvent.click(await canvas.findByText('Email me a code'));

    await submitOtp(canvas);

    await expect(await canvas.findByText('You have successfully logged in.')).toBeInTheDocument();
  },
} satisfies Story;

export const FlowDiscoveryOTPAndEMLSubmitOTPBack = {
  ...FlowDiscoveryOTPAndEMLChoice,
  play: async (params) => {
    await FlowDiscoveryOTPAndEMLChoice.play(params);
    const { canvas } = params;

    await userEvent.click(canvas.getByRole('button', { name: 'Email me a login code' }));
    await expect(await canvas.findByText('Enter passcode')).toBeInTheDocument();

    await userEvent.click(await canvas.findByRole('button', { name: 'Go back' }));
    expect(await canvas.findByText('Select how you’d like to continue')).toBeInTheDocument();

    await userEvent.click(await canvas.findByRole('button', { name: 'Go back' }));
    await expect(await canvas.findByText('Sign up or log in')).toBeInTheDocument();
    await expect(await canvas.findByText('Continue with email')).toBeInTheDocument();
  },
} satisfies Story;

export const FlowDiscoveryOTPAndEMLSubmitOTPError = {
  ...FlowDiscoveryOTPAndEMLChoice,
  parameters: {
    ...FlowDiscoveryOTPAndEMLChoice.parameters,
    msw: {
      handlers: {
        b2bOtpEmailDiscoverySend: http.post<never, B2BOTPsEmailLoginOrSignupOptions, ErrorResponse>(
          'https://api.stytch.com/sdk/v1/b2b/otps/email/discovery/send',
          async () => {
            await delay(300);
            return makeErrorResponse({
              errorType: 'invalid_request',
              statusCode: 400,
              message: 'Invalid request',
            });
          },
        ),
      },
    },
  },
  play: FlowOrgOTPAndEMLSubmitOTPError.play,
} satisfies Story;

export const FlowDiscoveryOTPAndEMLSubmitEML = {
  ...FlowDiscoveryOTPAndEMLChoice,
  play: async (params) => {
    await FlowDiscoveryOTPAndEMLChoice.play(params);
    const { canvas } = params;

    await userEvent.click(canvas.getByRole('button', { name: 'Email me a login link' }));

    await expect(await canvas.findByText('Check your email')).toBeInTheDocument();
    await expect(
      await canvas.findByText((_, element) => element?.textContent === 'An email was sent to test@stytch.com.'),
    ).toBeInTheDocument();
  },
} satisfies Story;

export const FlowDiscoveryStepUp = {
  ..._DiscoveryMenu,
  parameters: {
    ..._DiscoveryMenu.parameters,
    stytch: {
      ..._DiscoveryMenu.parameters.stytch,
      b2b: {
        ..._DiscoveryMenu.parameters.stytch.b2b,
        config: {
          products: [oauth, emailMagicLinks, emailOtp, passwords],
        },
      },
    },
  },
  play: async ({ canvas }) => {
    await expect(await canvas.findByText('Select an organization to continue')).toBeInTheDocument();

    await userEvent.click(canvas.getByRole('button', { name: /Can join by email/ }));

    await expect(await canvas.findByText('Continue to Can join by email')).toBeInTheDocument();

    await expect(canvas.getByText('Email me a link')).toBeInTheDocument();
    await expect(canvas.getByText('Email me a code')).toBeInTheDocument();
  },
} satisfies Story;

export const FlowDiscoveryStepUpEML = {
  ...FlowDiscoveryStepUp,
  play: async (params) => {
    await FlowDiscoveryStepUp.play(params);

    const { canvas } = params;

    await userEvent.click(canvas.getByRole('button', { name: 'Email me a link' }));

    await expect(await canvas.findByText('Check your email')).toBeInTheDocument();
    await expect(
      await canvas.findByText((_, element) => element?.textContent === 'An email was sent to example@stytch.com.'),
    ).toBeInTheDocument();
  },
} satisfies Story;

export const FlowDiscoveryStepUpEmailOTP = {
  ...FlowDiscoveryStepUp,
  play: async (params) => {
    await FlowDiscoveryStepUp.play(params);

    const { canvas } = params;

    await userEvent.click(canvas.getByRole('button', { name: 'Email me a code' }));

    await expect(
      await canvas.findByText(
        (_, element) => element?.textContent === 'A 6-digit passcode was sent to you at example@stytch.com.',
      ),
    ).toBeInTheDocument();
  },
} satisfies Story;
