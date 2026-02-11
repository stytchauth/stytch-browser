import type { Meta, StoryObj } from '@storybook/react';
import { B2BPasswordStrengthCheckResponse, MemberResponseCommon } from '@stytch/core/public';
import { MOCK_MEMBER_COMMON_RESPONSE, MOCK_REQUEST_ID } from '@stytch/internal-mocks';
import { http, HttpResponse } from 'msw';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { passwords } from '../B2BProducts';
import Container from '../Container';
import ContainerMeta from '../Container.stories';
import { AppScreens } from '../types/AppScreens';

const meta = {
  ...ContainerMeta,
} satisfies Meta<typeof Container>;

export default meta;

type Story = StoryObj<typeof meta>;

const responseCommon = {
  request_id: MOCK_REQUEST_ID,
  ...MOCK_MEMBER_COMMON_RESPONSE,
} as unknown as MemberResponseCommon;

const emptyLudsFeedback = {
  missing_characters: 0,
  missing_complexity: 0,
  has_lower_case: false,
  has_upper_case: false,
  has_digit: false,
  has_symbol: false,
};

const emptyZxcvbnFeedback = {
  warning: '',
  suggestions: [],
};

export const Default = {
  parameters: {
    stytch: {
      b2b: {
        config: {
          products: [passwords],
        },
        initialState: {
          screen: AppScreens.PasswordResetForm,
        },
      },
    },
  },
} satisfies Story;

export const StrongPassword = {
  ...Default,
  parameters: {
    ...Default.parameters,
    msw: {
      handlers: {
        b2bPasswordsStrengthCheck: http.post('https://api.stytch.com/sdk/v1/b2b/passwords/strength_check', async () =>
          HttpResponse.json({
            data: {
              ...responseCommon,
              score: 4,
              valid_password: true,
              strength_policy: 'zxcvbn',
              zxcvbn_feedback: emptyZxcvbnFeedback,
              luds_feedback: emptyLudsFeedback,
              breached_password: false,
              breach_detection_on_create: true,
            } satisfies B2BPasswordStrengthCheckResponse,
          }),
        ),
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const passwordInput = canvas.getByLabelText('Password');
    const submitButton = canvas.getByRole('button', { name: 'Continue' });

    await userEvent.type(passwordInput, 'VeryStrongPassword123!');

    // Wait for strength check to complete
    await waitFor(() => expect(submitButton).not.toBeDisabled());
  },
} satisfies Story;

export const WeakPassword = {
  ...Default,
  parameters: {
    ...Default.parameters,
    msw: {
      handlers: {
        b2bPasswordsStrengthCheck: http.post('https://api.stytch.com/sdk/v1/b2b/passwords/strength_check', async () =>
          HttpResponse.json({
            data: {
              ...responseCommon,
              score: 1,
              valid_password: false,
              strength_policy: 'zxcvbn',
              zxcvbn_feedback: {
                warning: 'This is a very common password.',
                suggestions: [
                  'Add another word or two. Uncommon words are better.',
                  'Avoid repeated words and characters.',
                  'Use a longer keyboard pattern with more turns.',
                ],
              },
              luds_feedback: emptyLudsFeedback,
              breached_password: false,
              breach_detection_on_create: true,
            } satisfies B2BPasswordStrengthCheckResponse,
          }),
        ),
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const passwordInput = canvas.getByLabelText('Password');
    const submitButton = canvas.getByRole('button', { name: 'Continue' });

    await userEvent.type(passwordInput, 'password');

    // Wait for strength check to complete
    await waitFor(() => expect(canvas.getByText('This is a very common password.')).toBeInTheDocument());

    await expect(submitButton).toBeDisabled();
  },
} satisfies Story;

export const LUDSValidation = {
  ...Default,
  parameters: {
    ...Default.parameters,
    msw: {
      handlers: {
        b2bPasswordsStrengthCheck: http.post('https://api.stytch.com/sdk/v1/b2b/passwords/strength_check', async () => {
          return HttpResponse.json({
            data: {
              ...responseCommon,
              score: 0,
              valid_password: false,
              strength_policy: 'luds',
              zxcvbn_feedback: emptyZxcvbnFeedback,
              luds_feedback: {
                missing_characters: 2,
                missing_complexity: 1,
                has_lower_case: true,
                has_upper_case: false,
                has_digit: false,
                has_symbol: false,
              },
              breached_password: false,
              breach_detection_on_create: true,
            } satisfies B2BPasswordStrengthCheckResponse,
          });
        }),
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const passwordInput = canvas.getByLabelText('Password');
    const submitButton = canvas.getByRole('button', { name: 'Continue' });

    await userEvent.type(passwordInput, 'weak');

    // Wait for strength check to complete
    await waitFor(() => expect(submitButton).toBeDisabled());
  },
} satisfies Story;

export const BreachedPassword = {
  ...Default,
  parameters: {
    ...Default.parameters,
    msw: {
      handlers: {
        b2bPasswordsStrengthCheck: http.post('https://api.stytch.com/sdk/v1/b2b/passwords/strength_check', async () =>
          HttpResponse.json({
            data: {
              ...responseCommon,
              score: 3,
              valid_password: false,
              strength_policy: 'luds',
              zxcvbn_feedback: emptyZxcvbnFeedback,
              luds_feedback: emptyLudsFeedback,
              breached_password: true,
              breach_detection_on_create: true,
            } satisfies B2BPasswordStrengthCheckResponse,
          }),
        ),
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const passwordInput = canvas.getByLabelText('Password');
    const submitButton = canvas.getByRole('button', { name: 'Continue' });

    await userEvent.type(passwordInput, 'breachedpassword123');

    // Wait for strength check to complete
    await waitFor(() => expect(submitButton).toBeDisabled());
  },
} satisfies Story;

export const StrengthCheckError = {
  ...Default,
  parameters: {
    ...Default.parameters,
    msw: {
      handlers: {
        b2bPasswordsStrengthCheck: http.post('https://api.stytch.com/sdk/v1/b2b/passwords/strength_check', async () =>
          HttpResponse.json(
            {
              error_type: 'rate_limit_error',
              error_message: 'Rate limit exceeded',
              error_url: 'https://stytch.com/docs/api/errors#rate_limit_error',
            },
            { status: 429 },
          ),
        ),
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const passwordInput = canvas.getByLabelText('Password');

    await userEvent.type(passwordInput, 'testpassword');

    // TODO: No error state for this page yet
    await waitFor(() => expect(canvas.getByRole('button', { name: 'Continue' })).toBeInTheDocument());
  },
} satisfies Story;
