import type { Meta, StoryObj } from '@storybook/react';
import { PasswordStrengthCheckOptions, PasswordStrengthCheckResponse } from '@stytch/core/public';
import { http, HttpResponse } from 'msw';
import type { Canvas } from 'storybook/internal/csf';
import { expect, userEvent, within } from 'storybook/test';

import { DataResponse } from '../../../../../.storybook/handlers';
import { ResetPasswordScreen } from './ResetPasswordScreen';

function getRequirementContainer(element: HTMLElement) {
  // Hacky, but not terrible as far as selectors go since each message should be atomic
  return element.closest<HTMLElement>('[aria-atomic]')!;
}

async function expectRequirement(
  canvas: Canvas,
  type: 'Fulfilled' | 'Not Fulfilled' | 'Warning' | 'Suggestion',
  requirementText: string,
) {
  const textElement = await canvas.findByText(requirementText);
  await expect(within(getRequirementContainer(textElement)).getByText(type, { exact: false })).toBeInTheDocument();
}

const baseResponse = {
  breach_detection_on_create: true,
  breached_password: false,
  request_id: 'request-id-test-b05c992f-ebdc-489d-a754-c7e70ba13141',
  score: 4,
  status_code: 200,
  valid_password: true,
} as const;

const zxcvbnBaseResponse = {
  ...baseResponse,
  strength_policy: 'zxcvbn' as const,
  feedback: {
    // actual response type doesn't exactly match declared type
    luds_requirements: null as unknown as PasswordStrengthCheckResponse['feedback']['luds_requirements'],
    suggestions: [] as string[],
    warning: '',
  },
};

const ludsBaseResponse = {
  ...baseResponse,
  score: 0,
  strength_policy: 'luds' as const,
  feedback: {
    luds_requirements: {
      missing_characters: 0,
      missing_complexity: 0,
      has_digit: false,
      has_lower_case: false,
      has_symbol: false,
      has_upper_case: false,
    },
    suggestions: [] as string[],
    warning: '',
  },
};

const createZxcvbnResponse = ({
  score,
  valid,
  feedback,
  breached = false,
}: {
  score: number;
  valid: boolean;
  feedback?: Partial<typeof zxcvbnBaseResponse.feedback>;
  breached?: boolean;
}) => ({
  ...zxcvbnBaseResponse,
  score,
  valid_password: valid,
  breached_password: breached,
  feedback: { ...zxcvbnBaseResponse.feedback, ...feedback },
});

const createLudsResponse = ({
  valid,
  requirements,
  breached = false,
}: {
  valid: boolean;
  requirements?: { missing_characters?: number; missing_complexity?: number };
  breached?: boolean;
}) => ({
  ...ludsBaseResponse,
  valid_password: valid,
  breached_password: breached,
  feedback: {
    ...ludsBaseResponse.feedback,
    luds_requirements: { ...ludsBaseResponse.feedback.luds_requirements, ...requirements },
  },
});

const strengthCheckHandler = http.post<
  never,
  PasswordStrengthCheckOptions,
  DataResponse<PasswordStrengthCheckResponse>
>('https://api.stytch.com/sdk/v1/passwords/strength_check', async ({ request }) => {
  const body = await request.json();

  const responses = {
    // ZXCVBN Policy responses
    'zxcvbn-score-1': createZxcvbnResponse({ score: 1, valid: false }),
    'zxcvbn-score-2': createZxcvbnResponse({ score: 2, valid: false }),
    'zxcvbn-score-3': createZxcvbnResponse({ score: 3, valid: true }),
    'zxcvbn-score-4': createZxcvbnResponse({ score: 4, valid: true }),
    'zxcvbn-with-warning': createZxcvbnResponse({
      score: 2,
      valid: false,
      feedback: { warning: 'Short keyboard patterns are easy to guess.' },
    }),
    'zxcvbn-with-suggestions': createZxcvbnResponse({
      score: 2,
      valid: false,
      feedback: {
        suggestions: ['Use a few words, avoid common phrases.', 'No need for symbols, digits, or uppercase letters.'],
      },
    }),
    'zxcvbn-with-suggestions-and-warning': createZxcvbnResponse({
      score: 2,
      valid: false,
      feedback: {
        suggestions: ['Use a few words, avoid common phrases.', 'No need for symbols, digits, or uppercase letters.'],
        warning: 'Short keyboard patterns are easy to guess.',
      },
    }),
    'zxcvbn-high-score-breached': createZxcvbnResponse({
      score: 4,
      valid: false,
      breached: true,
    }),
    // LUDS Policy responses
    'luds-valid': createLudsResponse({ valid: true }),
    'luds-missing-chars': createLudsResponse({ valid: false, requirements: { missing_characters: 3 } }),
    'luds-missing-complexity': createLudsResponse({ valid: false, requirements: { missing_complexity: 2 } }),
    'luds-missing-both': createLudsResponse({
      valid: false,
      requirements: { missing_characters: 3, missing_complexity: 2 },
    }),
    'luds-breached': createLudsResponse({ valid: false, breached: true }),
    'luds-all-problems': createLudsResponse({
      valid: false,
      requirements: { missing_characters: 3, missing_complexity: 2 },
      breached: true,
    }),
  } as const;

  const response = responses[body.password as keyof typeof responses] || zxcvbnBaseResponse;

  return HttpResponse.json({ data: response });
});

const meta = {
  component: ResetPasswordScreen,
  parameters: {
    msw: {
      handlers: {
        strengthCheck: strengthCheckHandler,
      },
    },
  },
} satisfies Meta<typeof ResetPasswordScreen>;

export default meta;

type Story = StoryObj<typeof meta>;

export const _ResetPasswordScreen = {} satisfies Story;

// ZXCVBN Policy Stories
export const ZxcvbnScore1 = {
  play: async ({ canvas }) => {
    await userEvent.type(await canvas.findByLabelText('Password'), 'zxcvbn-score-1');
  },
} satisfies Story;

export const ZxcvbnScore2 = {
  play: async ({ canvas }) => {
    await userEvent.type(await canvas.findByLabelText('Password'), 'zxcvbn-score-2');
  },
} satisfies Story;

export const ZxcvbnScore3 = {
  play: async ({ canvas }) => {
    await userEvent.type(await canvas.findByLabelText('Password'), 'zxcvbn-score-3');
  },
} satisfies Story;

export const ZxcvbnScore4 = {
  play: async ({ canvas }) => {
    await userEvent.type(await canvas.findByLabelText('Password'), 'zxcvbn-score-4');
  },
} satisfies Story;

export const ZxcvbnWithWarning = {
  play: async ({ canvas }) => {
    await userEvent.type(await canvas.findByLabelText('Password'), 'zxcvbn-with-warning');

    await expect(await canvas.findByText('Short keyboard patterns are easy to guess.')).toBeInTheDocument();
  },
} satisfies Story;

export const ZxcvbnWithSuggestions = {
  play: async ({ canvas }) => {
    await userEvent.type(await canvas.findByLabelText('Password'), 'zxcvbn-with-suggestions');

    await expect(await canvas.findByText('Use a few words, avoid common phrases.')).toBeInTheDocument();
    await expect(canvas.getByText('No need for symbols, digits, or uppercase letters.')).toBeInTheDocument();
  },
} satisfies Story;

export const ZxcvbnWithSuggestionsAndWarning = {
  play: async ({ canvas }) => {
    await userEvent.type(await canvas.findByLabelText('Password'), 'zxcvbn-with-suggestions-and-warning');

    await expect(await canvas.findByText('Short keyboard patterns are easy to guess.')).toBeInTheDocument();
    await expect(canvas.getByText('Use a few words, avoid common phrases.')).toBeInTheDocument();
    await expect(canvas.getByText('No need for symbols, digits, or uppercase letters.')).toBeInTheDocument();
  },
} satisfies Story;

export const ZxcvbnBreached = {
  play: async ({ canvas }) => {
    await userEvent.type(await canvas.findByLabelText('Password'), 'zxcvbn-high-score-breached');

    await expect(
      await canvas.findByText(
        'This password may have been used on a different site that experienced a security issue. Please choose another password.',
      ),
    ).toBeInTheDocument();

    await expect(await canvas.findByRole('button', { name: 'Continue' })).toBeDisabled();
  },
} satisfies Story;

// LUDS Policy Stories
export const LudsValid = {
  play: async ({ canvas }) => {
    await userEvent.type(await canvas.findByLabelText('Password'), 'luds-valid');

    // Check that both requirements are fulfilled
    await expectRequirement(canvas, 'Fulfilled', 'Must be at least 8 characters long');
    await expectRequirement(
      canvas,
      'Fulfilled',
      'Must contain 3 of the following: uppercase letter, lowercase letter, number, symbol',
    );

    await expect(canvas.getByRole('button', { name: 'Continue' })).toBeEnabled();
  },
} satisfies Story;

export const LudsMissingCharacters = {
  play: async ({ canvas }) => {
    await userEvent.type(await canvas.findByLabelText('Password'), 'luds-missing-chars');

    // Check character length requirement is not fulfilled, complexity is fulfilled
    await expectRequirement(canvas, 'Not Fulfilled', 'Must be at least 8 characters long');
    await expectRequirement(
      canvas,
      'Fulfilled',
      'Must contain 3 of the following: uppercase letter, lowercase letter, number, symbol',
    );

    await expect(canvas.getByRole('button', { name: 'Continue' })).toBeDisabled();
  },
} satisfies Story;

export const LudsMissingComplexity = {
  play: async ({ canvas }) => {
    await userEvent.type(await canvas.findByLabelText('Password'), 'luds-missing-complexity');

    // Check character length requirement is fulfilled, complexity is not fulfilled
    await expectRequirement(canvas, 'Fulfilled', 'Must be at least 8 characters long');
    await expectRequirement(
      canvas,
      'Not Fulfilled',
      'Must contain 3 of the following: uppercase letter, lowercase letter, number, symbol',
    );

    await expect(canvas.getByRole('button', { name: 'Continue' })).toBeDisabled();
  },
} satisfies Story;

export const LudsMissingBoth = {
  play: async ({ canvas }) => {
    await userEvent.type(await canvas.findByLabelText('Password'), 'luds-missing-both');

    // Check both requirements are not fulfilled
    await expectRequirement(canvas, 'Not Fulfilled', 'Must be at least 8 characters long');
    await expectRequirement(
      canvas,
      'Not Fulfilled',
      'Must contain 3 of the following: uppercase letter, lowercase letter, number, symbol',
    );

    await expect(canvas.getByRole('button', { name: 'Continue' })).toBeDisabled();
  },
} satisfies Story;

export const LudsBreached = {
  play: async ({ canvas }) => {
    await userEvent.type(await canvas.findByLabelText('Password'), 'luds-breached');

    // Check both requirements are fulfilled, but password is breached
    await expectRequirement(canvas, 'Fulfilled', 'Must be at least 8 characters long');
    await expectRequirement(
      canvas,
      'Fulfilled',
      'Must contain 3 of the following: uppercase letter, lowercase letter, number, symbol',
    );
    await expectRequirement(
      canvas,
      'Warning',
      'This password may have been used on a different site that experienced a security issue. Please choose another password.',
    );

    await expect(canvas.getByRole('button', { name: 'Continue' })).toBeDisabled();
  },
} satisfies Story;

export const LudsAllProblems = {
  play: async ({ canvas }) => {
    await userEvent.type(await canvas.findByLabelText('Password'), 'luds-all-problems');

    // Check all requirements are not fulfilled
    await expectRequirement(canvas, 'Not Fulfilled', 'Must be at least 8 characters long');
    await expectRequirement(
      canvas,
      'Not Fulfilled',
      'Must contain 3 of the following: uppercase letter, lowercase letter, number, symbol',
    );
    await expectRequirement(
      canvas,
      'Warning',
      'This password may have been used on a different site that experienced a security issue. Please choose another password.',
    );

    await expect(canvas.getByRole('button', { name: 'Continue' })).toBeDisabled();
  },
} satisfies Story;
