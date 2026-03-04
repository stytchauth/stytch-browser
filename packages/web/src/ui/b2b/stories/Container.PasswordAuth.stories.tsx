import type { Meta, StoryObj } from '@storybook/react-vite';
import { AuthFlowType } from '@stytch/core/public';
import { expect, getByText, userEvent, waitFor, within } from 'storybook/test';

import {
  infiniteResolver,
  makeB2BPasswordsAuthenticateHandler,
  makeB2BPasswordsDiscoveryAuthenticateHandler,
  makeErrorResponse,
} from '../../../../.storybook/handlers';
import { MOCK_ORGANIZATION } from '../../../testUtils';
import { passwords } from '../B2BProducts';
import Container from '../Container';
import ContainerMeta from '../Container.stories';
import { AppScreens } from '../types/AppScreens';

const meta = {
  ...ContainerMeta,
  title: 'b2b/Container/Password Auth',
} satisfies Meta<typeof Container>;

export default meta;

type Story = StoryObj<typeof meta>;

export const FlowPassword = {
  parameters: {
    stytch: {
      b2b: {
        config: {
          products: [passwords],
        },
        initialState: {
          screen: AppScreens.PasswordAuthenticate,
          flowState: {
            type: AuthFlowType.Organization,
            organization: { ...MOCK_ORGANIZATION },
          },
        },
      },
    },
  },
} satisfies Story;

export const FlowPasswordAuthenticate = {
  ...FlowPassword,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const emailInput = await canvas.findByLabelText('Email');
    const passwordInput = canvas.getByLabelText('Password');

    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordInput, 'password');
  },
} satisfies Story;

export const FlowPasswordAuthenticateSuccess = {
  ...FlowPasswordAuthenticate,
  play: async (params) => {
    await FlowPasswordAuthenticate.play(params);

    const { canvasElement } = params;
    const canvas = within(canvasElement);
    const submitButton = canvas.getByRole('button', { name: 'Continue' });
    await userEvent.click(submitButton);
    await waitFor(() => expect(getByText(canvasElement, 'Success!')).toBeInTheDocument());
  },
} satisfies Story;

export const FlowPasswordAuthenticateInvalidPassword = {
  ...FlowPasswordAuthenticate,
  parameters: {
    ...FlowPasswordAuthenticate.parameters,
    msw: {
      handlers: {
        b2bPasswordsAuthenticate: makeB2BPasswordsAuthenticateHandler(() =>
          makeErrorResponse({
            errorType: 'unauthorized_credentials',
            statusCode: 401,
            message: 'Unauthorized credentials',
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
    await waitFor(() => expect(getByText(canvasElement, 'Unauthorized credentials.')).toBeInTheDocument());
  },
} satisfies Story;

export const FlowPasswordAuthenticateIndefiniteLoading = {
  ...FlowPasswordAuthenticate,
  parameters: {
    ...FlowPasswordAuthenticate.parameters,
    msw: {
      handlers: {
        b2bPasswordsAuthenticate: makeB2BPasswordsAuthenticateHandler(infiniteResolver),
      },
    },
  },
  play: async (params) => {
    await FlowPasswordAuthenticate.play(params);

    const { canvasElement } = params;
    const canvas = within(canvasElement);

    const submitButton = canvas.getByRole('button', { name: 'Continue' });
    await userEvent.click(submitButton);
    await waitFor(() => expect(submitButton).toBeDisabled());
  },
} satisfies Story;

export const FlowPasswordCrossOrg = {
  parameters: {
    stytch: {
      b2b: {
        config: {
          products: [passwords],
        },
        initialState: {
          screen: AppScreens.PasswordAuthenticate,
          flowState: {
            type: AuthFlowType.Organization,
          },
        },
      },
    },
  },
} satisfies Story;

export const FlowPasswordCrossOrgAuthenticate = {
  ...FlowPasswordCrossOrg,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const emailInput = await canvas.findByLabelText('Email');
    const passwordInput = canvas.getByLabelText('Password');

    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordInput, 'password');
  },
} satisfies Story;

export const FlowPasswordCrossOrgAuthenticateSuccess = {
  ...FlowPasswordCrossOrgAuthenticate,
  play: async (params) => {
    await FlowPasswordCrossOrgAuthenticate.play(params);

    const { canvasElement } = params;
    const canvas = within(canvasElement);
    const submitButton = canvas.getByRole('button', { name: 'Continue' });
    await userEvent.click(submitButton);
    await waitFor(() => expect(getByText(canvasElement, 'Create an organization to get started')).toBeInTheDocument());
  },
} satisfies Story;

export const FlowPasswordCrossOrgAuthenticateInvalidPassword = {
  ...FlowPasswordCrossOrgAuthenticate,
  parameters: {
    ...FlowPasswordCrossOrgAuthenticate.parameters,
    msw: {
      handlers: {
        b2bPasswordsAuthenticate: makeB2BPasswordsDiscoveryAuthenticateHandler(() =>
          makeErrorResponse({
            errorType: 'unauthorized_credentials',
            statusCode: 401,
            message: 'Unauthorized credentials',
          }),
        ),
      },
    },
  },
  play: async (params) => {
    await FlowPasswordCrossOrgAuthenticate.play(params);

    const { canvasElement } = params;
    const canvas = within(canvasElement);
    const submitButton = canvas.getByRole('button', { name: 'Continue' });
    await userEvent.click(submitButton);
    await waitFor(() => expect(getByText(canvasElement, 'Unauthorized credentials.')).toBeInTheDocument());
  },
} satisfies Story;

export const FlowPasswordCrossOrgAuthenticateIndefiniteLoading = {
  ...FlowPasswordCrossOrgAuthenticate,
  parameters: {
    ...FlowPasswordCrossOrgAuthenticate.parameters,
    msw: {
      handlers: {
        b2bPasswordsAuthenticate: makeB2BPasswordsDiscoveryAuthenticateHandler(infiniteResolver),
      },
    },
  },
  play: async (params) => {
    await FlowPasswordAuthenticate.play(params);

    const { canvasElement } = params;
    const canvas = within(canvasElement);

    const submitButton = canvas.getByRole('button', { name: 'Continue' });
    await userEvent.click(submitButton);
    await waitFor(() => expect(submitButton).toBeDisabled());
  },
} satisfies Story;

export const FlowPasswordReset = {
  ...FlowPassword,
  play: async ({ canvas }) => {
    await userEvent.click(await canvas.findByText('Sign up or reset password'));

    await expect(await canvas.findByText('Check your email for help signing in')).toBeInTheDocument();
  },
} satisfies Story;

export const FlowPasswordResetActiveMember = {
  ...FlowPasswordReset,
  play: async (params) => {
    await FlowPasswordReset.play(params);

    const { canvas } = params;

    await userEvent.type(await canvas.findByLabelText('Email'), 'active@example.com');
    await userEvent.click(await canvas.findByRole('button', { name: 'Continue' }));

    await expect(await canvas.findByText('Check your email')).toBeInTheDocument();
    await expect(
      await canvas.findByText((_, el) => el?.textContent === 'A login link was sent to you at active@example.com.'),
    ).toBeInTheDocument();
  },
} satisfies Story;

export const FlowPasswordResetActiveMemberNoJIT = {
  ...FlowPasswordReset,
  play: async (params) => {
    await FlowPasswordReset.play(params);

    const { canvas } = params;

    await userEvent.type(await canvas.findByLabelText('Email'), 'active@different.example.com');
    await userEvent.click(await canvas.findByRole('button', { name: 'Continue' }));

    await expect(await canvas.findByText('Check your email')).toBeInTheDocument();
    await expect(
      await canvas.findByText(
        (_, el) => el?.textContent === 'A login link was sent to you at active@different.example.com.',
      ),
    ).toBeInTheDocument();
  },
} satisfies Story;

export const FlowPasswordResetMemberWithoutPassword = {
  ...FlowPasswordReset,
  play: async (params) => {
    await FlowPasswordReset.play(params);

    const { canvas } = params;

    await userEvent.type(await canvas.findByLabelText('Email'), 'member-without-password@example.com');
    await userEvent.click(await canvas.findByRole('button', { name: 'Continue' }));

    await expect(await canvas.findByText('Check your email')).toBeInTheDocument();
    await expect(
      await canvas.findByText(
        (_, el) => el?.textContent === 'A login link was sent to you at member-without-password@example.com.',
      ),
    ).toBeInTheDocument();
  },
} satisfies Story;

export const FlowPasswordResetMemberWithoutPasswordNoJIT = {
  ...FlowPasswordResetMemberWithoutPassword,
  play: async (params) => {
    await FlowPasswordReset.play(params);

    const { canvas } = params;

    await userEvent.type(await canvas.findByLabelText('Email'), 'member-without-password@different.example.com');
    await userEvent.click(await canvas.findByRole('button', { name: 'Continue' }));

    await expect(await canvas.findByText('Check your email')).toBeInTheDocument();
    await expect(
      await canvas.findByText(
        (_, el) => el?.textContent === 'A login link was sent to you at member-without-password@different.example.com.',
      ),
    ).toBeInTheDocument();
  },
} satisfies Story;

export const FlowPasswordResetNonMember = {
  ...FlowPasswordReset,
  play: async (params) => {
    await FlowPasswordReset.play(params);

    const { canvas } = params;

    await userEvent.type(await canvas.findByLabelText('Email'), 'not-a-member@example.com');
    await userEvent.click(await canvas.findByRole('button', { name: 'Continue' }));

    await expect(await canvas.findByText('Verify your email first.')).toBeInTheDocument();
    await expect(
      await canvas.findByText(
        (_, el) => el?.textContent === 'A login link was sent to you at not-a-member@example.com.',
      ),
    ).toBeInTheDocument();
  },
} satisfies Story;

export const FlowPasswordResetNonMemberNoJIT = {
  ...FlowPasswordResetNonMember,
  play: async (params) => {
    await FlowPasswordReset.play(params);

    const { canvas } = params;

    await userEvent.type(await canvas.findByLabelText('Email'), 'not-a-member@different.example.com');
    await userEvent.click(await canvas.findByRole('button', { name: 'Continue' }));

    await expect(
      await canvas.findByText(
        'not-a-member@different.example.com does not have access to Fake Organization. If you think this is a mistake, contact your admin.',
      ),
    ).toBeInTheDocument();
  },
} satisfies Story;
