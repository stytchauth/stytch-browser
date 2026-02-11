import type { Meta, StoryObj } from '@storybook/react';
import { AuthFlowType } from '@stytch/core/public';
import { expect, userEvent } from 'storybook/test';

import { emailMagicLinks, passwords } from '../B2BProducts';
import Container from '../Container';
import ContainerMeta from '../Container.stories';

const meta = {
  ...ContainerMeta,
  title: 'b2b/Container/Email+Password',
} satisfies Meta<typeof Container>;

export default meta;

type Story = StoryObj<typeof meta>;

export const OrgLogin = {
  parameters: {
    stytch: {
      b2b: {
        config: {
          products: [emailMagicLinks, passwords],
          organizationSlug: 'no-sso-connections',
        },
      },
    },
  },
  play: async ({ canvas }) => {
    await expect(await canvas.findByText('Continue to Example Org Inc.')).toBeInTheDocument();
    await expect(await canvas.getByLabelText('Email')).toHaveValue('');
    await expect(await canvas.getByRole('button', { name: 'Continue with email' })).toBeEnabled();
    await expect(await canvas.getByText('Use a password instead')).toBeInTheDocument();
  },
} satisfies Story;

export const FlowOrgUsePassword = {
  ...OrgLogin,
  play: async ({ canvas }) => {
    await userEvent.click(await canvas.findByText('Use a password instead'));

    await expect(await canvas.findByText('Log in with email and password')).toBeInTheDocument();
    await expect(await canvas.findByLabelText('Email')).toHaveValue('');
    await expect(await canvas.getByRole('button', { name: 'Continue' })).toBeEnabled();
    await expect(await canvas.getByText('Sign up or reset password')).toBeInTheDocument();
  },
} satisfies Story;

export const FlowOrgEmailPasswordPreserved = {
  ...OrgLogin,
  play: async ({ canvas }) => {
    const emailInput = await canvas.findByLabelText('Email');
    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.click(canvas.getByRole('button', { name: 'Use a password instead' }));

    await expect(await canvas.findByText('Log in with email and password')).toBeInTheDocument();
    await expect(await canvas.findByLabelText('Email')).toHaveValue('test@example.com');
  },
} satisfies Story;

export const FlowOrgResetPasswordPreserved = {
  ...FlowOrgEmailPasswordPreserved,
  play: async (params) => {
    await FlowOrgEmailPasswordPreserved.play(params);
    const { canvas } = params;

    await userEvent.click(canvas.getByRole('button', { name: 'Sign up or reset password' }));

    await expect(await canvas.findByText('Check your email for help signing in')).toBeInTheDocument();
    await expect(await canvas.findByLabelText('Email')).toHaveValue('test@example.com');
  },
} satisfies Story;

export const FlowOrgEmailPasswordBackPreserved = {
  ...FlowOrgEmailPasswordPreserved,
  play: async (params) => {
    await FlowOrgEmailPasswordPreserved.play(params);
    const { canvas } = params;

    await userEvent.click(canvas.getByRole('button', { name: 'Go back' }));

    await expect(await canvas.findByText('Continue to Example Org Inc.')).toBeInTheDocument();
    await expect(await canvas.findByLabelText('Email')).toHaveValue('test@example.com');
  },
} satisfies Story;

export const FlowOrgPasswordReset = {
  ...FlowOrgUsePassword,
  play: async (params) => {
    await FlowOrgUsePassword.play(params);

    const { canvas } = params;

    await userEvent.click(await canvas.findByText('Sign up or reset password'));

    await expect(await canvas.findByText('Check your email for help signing in')).toBeInTheDocument();
  },
} satisfies Story;

export const FlowOrgPasswordResetActiveMember = {
  ...FlowOrgPasswordReset,
  play: async (params) => {
    await FlowOrgPasswordReset.play(params);

    const { canvas } = params;

    await userEvent.type(await canvas.findByLabelText('Email'), 'active@example.com');
    await userEvent.click(await canvas.findByRole('button', { name: 'Continue' }));

    await expect(await canvas.findByText('Check your email')).toBeInTheDocument();
    await expect(
      await canvas.findByText((_, el) => el?.textContent === 'A login link was sent to you at active@example.com.'),
    ).toBeInTheDocument();
  },
} satisfies Story;

export const FlowOrgPasswordResetActiveMemberNoJIT = {
  ...FlowOrgPasswordReset,
  play: async (params) => {
    await FlowOrgPasswordReset.play(params);

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

export const FlowOrgPasswordResetMemberWithoutPassword = {
  ...FlowOrgPasswordReset,
  play: async (params) => {
    await FlowOrgPasswordReset.play(params);

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

export const FlowOrgPasswordResetMemberWithoutPasswordNoJIT = {
  ...FlowOrgPasswordResetMemberWithoutPassword,
  play: async (params) => {
    await FlowOrgPasswordReset.play(params);

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

export const FlowOrgPasswordResetNonMember = {
  ...FlowOrgPasswordReset,
  play: async (params) => {
    await FlowOrgPasswordReset.play(params);

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

export const FlowOrgPasswordResetNonMemberNoJIT = {
  ...FlowOrgPasswordResetNonMember,
  play: async (params) => {
    await FlowOrgPasswordReset.play(params);

    const { canvas } = params;

    await userEvent.type(await canvas.findByLabelText('Email'), 'not-a-member@different.example.com');
    await userEvent.click(await canvas.findByRole('button', { name: 'Continue' }));

    await expect(
      await canvas.findByText(
        'not-a-member@different.example.com does not have access to Example Org Inc.. If you think this is a mistake, contact your admin.',
      ),
    ).toBeInTheDocument();
  },
} satisfies Story;

export const DiscoveryLogin = {
  parameters: {
    stytch: {
      b2b: {
        config: {
          products: [emailMagicLinks, passwords],
          authFlowType: AuthFlowType.Discovery,
        },
        initialState: {
          flowState: {
            type: AuthFlowType.Discovery,
          },
        },
      },
    },
  },
  play: async ({ canvas }) => {
    await expect(await canvas.findByText('Sign up or log in')).toBeInTheDocument();
    await expect(await canvas.getByLabelText('Email')).toHaveValue('');
    await expect(await canvas.getByRole('button', { name: 'Continue with email' })).toBeEnabled();
    await expect(await canvas.getByText('Use a password instead')).toBeInTheDocument();
  },
} satisfies Story;

export const FlowDiscoveryUsePassword = {
  ...DiscoveryLogin,
  play: FlowOrgUsePassword.play,
} satisfies Story;

export const FlowDiscoveryEmailPasswordPreserved = {
  ...DiscoveryLogin,
  play: FlowOrgEmailPasswordPreserved.play,
} satisfies Story;

export const FlowDiscoveryResetPasswordPreserved = {
  ...FlowDiscoveryEmailPasswordPreserved,
  play: FlowOrgResetPasswordPreserved.play,
} satisfies Story;

export const FlowDiscoveryEmailPasswordBackPreserved = {
  ...FlowDiscoveryEmailPasswordPreserved,
  play: async (params) => {
    await FlowDiscoveryEmailPasswordPreserved.play(params);
    const { canvas } = params;

    await userEvent.click(canvas.getByRole('button', { name: 'Go back' }));

    await expect(await canvas.findByText('Sign up or log in')).toBeInTheDocument();
    await expect(await canvas.findByLabelText('Email')).toHaveValue('test@example.com');
  },
} satisfies Story;
