import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor } from '@storybook/test';
import { produce } from 'immer';
import Container from './Container';
import ContainerMeta, { DiscoveryLogin } from './Container.stories';

const continuously = async (
  callback: () => void | Promise<void>,
  { interval = 100, timeout = 1000 }: { interval?: number; timeout?: number } = {},
) => {
  const startTime = Date.now();
  const endTime = startTime + timeout;

  while (Date.now() < endTime) {
    await callback();
    await new Promise((resolve) => setTimeout(resolve, interval));
  }
};

const meta = {
  ...ContainerMeta,
  title: 'b2b/Container/Discovery SSO',
  parameters: produce(ContainerMeta.parameters, (draft) => {
    draft.stytch.b2b.config.ssoOptions ??= {};
    draft.stytch.b2b.config.ssoOptions.loginRedirectURL = 'https://example.com/login';
    draft.stytch.b2b.config.ssoOptions.signupRedirectURL = 'https://example.com/signup';
  }),
} satisfies Meta<typeof Container>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Login = {
  ...DiscoveryLogin,
  play: async ({ canvas }) => {
    await expect(await canvas.findByText('Continue with SSO')).toBeInTheDocument();
  },
} satisfies Story;

export const EmailPrompt = {
  ...Login,
  play: async ({ canvas }) => {
    const continueWithSsoButton = await canvas.findByText('Continue with SSO');
    await expect(continueWithSsoButton).toBeInTheDocument();
    await userEvent.click(continueWithSsoButton);

    await expect(await canvas.findByText('Enter your email to continue')).toBeInTheDocument();
  },
} satisfies Story;

export const EmailPromptError = {
  ...EmailPrompt,
  play: async (params) => {
    await EmailPrompt.play(params);

    const { canvas } = params;

    await userEvent.type(await canvas.findByRole('textbox'), 'error@example.com');

    const continueButton = await canvas.findByText('Continue');

    await userEvent.click(continueButton);

    await waitFor(() => {
      expect(continueButton).toBeDisabled();
    });

    await expect(
      await canvas.findByText('Something went wrong. Try again later or contact your admin for help.'),
    ).toBeInTheDocument();

    await expect(continueButton).toBeEnabled();
  },
} satisfies Story;

export const SingleConnection = {
  ...EmailPrompt,
  play: async (params) => {
    await EmailPrompt.play(params);

    const { canvas } = params;

    await userEvent.type(await canvas.findByRole('textbox'), 'test@example.com');

    await expect(await canvas.findByText('Continue')).toBeEnabled();
  },
} satisfies Story;

export const SingleConnectionContinue = {
  ...SingleConnection,
  play: async (params) => {
    await SingleConnection.play(params);

    const { canvas } = params;

    const continueButton = await canvas.findByText('Continue');

    await userEvent.click(continueButton);

    await waitFor(() => {
      expect(continueButton).toBeDisabled();
    });

    await waitFor(() => {
      expect(window.__STORYBOOK_MOCK_LOCATION__?.href).toBe(
        'https://api.stytch.com/v1/public/sso/start?public_token=public-token-fake-public-token&connection_id=sso-conn-test123&login_redirect_url=https%3A%2F%2Fexample.com%2Flogin&signup_redirect_url=https%3A%2F%2Fexample.com%2Fsignup',
      );
    });

    // Continue button should remain disabled ~indefinitely
    await continuously(() => expect(continueButton).toBeDisabled(), { timeout: 2000 });
  },
} satisfies Story;

export const MultipleConnections = {
  ...EmailPrompt,
  play: async (params) => {
    await EmailPrompt.play(params);

    const { canvas } = params;

    await userEvent.type(await canvas.findByRole('textbox'), 'multiple@example.com');
    await userEvent.click(await canvas.findByText('Continue'));

    await expect(await canvas.findByText('Select a connection to continue')).toBeInTheDocument();

    await expect(await canvas.getByRole('button', { name: 'Continue with Test Okta Provider' })).toBeEnabled();
    await expect(
      await canvas.getByRole('button', { name: 'Continue with Test Google Workspace Provider' }),
    ).toBeEnabled();
    await expect(
      await canvas.getByRole('button', { name: 'Continue with Test Microsoft Entra Provider' }),
    ).toBeEnabled();
    await expect(await canvas.getByRole('button', { name: 'Continue with Test Generic Provider' })).toBeEnabled();
    await expect(await canvas.getByRole('button', { name: 'Continue with Test Unknown Provider' })).toBeEnabled();
  },
} satisfies Story;

export const MultipleConnectionsContinue = {
  ...MultipleConnections,
  play: async (params) => {
    await MultipleConnections.play(params);

    const { canvas } = params;

    await userEvent.click(await canvas.getByRole('button', { name: 'Continue with Test Microsoft Entra Provider' }));

    await waitFor(() => {
      expect(window.__STORYBOOK_MOCK_LOCATION__?.href).toBe(
        'https://api.stytch.com/v1/public/sso/start?public_token=public-token-fake-public-token&connection_id=sso-conn-test12345&login_redirect_url=https%3A%2F%2Fexample.com%2Flogin&signup_redirect_url=https%3A%2F%2Fexample.com%2Fsignup',
      );
    });
  },
} satisfies Story;

export const MultipleConnectionsBack = {
  ...MultipleConnections,
  play: async (params) => {
    await MultipleConnections.play(params);

    const { canvas } = params;

    await userEvent.click(await canvas.getByRole('button', { name: 'Back' }));
  },
} satisfies Story;

export const NoConnections = {
  ...EmailPrompt,
  play: async (params) => {
    await EmailPrompt.play(params);

    const { canvas } = params;

    await userEvent.type(await canvas.findByRole('textbox'), 'zero@example.com');
    await userEvent.click(await canvas.findByText('Continue'));

    await expect(await canvas.findByText("Sorry, we couldn't find any connections.")).toBeInTheDocument();
    await expect(await canvas.getByPlaceholderText('Enter org slug')).toBeInTheDocument();
    await expect(await canvas.getByRole('button', { name: 'Continue' })).toBeDisabled();
    await expect(await canvas.getByRole('button', { name: 'Try another log in method' })).toBeEnabled();
  },
} satisfies Story;

export const NoConnectionsOrgSlugNoSSO = {
  ...NoConnections,
  play: async (params) => {
    await NoConnections.play(params);

    const { canvas } = params;

    await userEvent.type(await canvas.findByPlaceholderText('Enter org slug'), 'no-sso-connections');
    await userEvent.click(await canvas.findByText('Continue'));

    await expect(await canvas.findByText('Continue to Example Org Inc.')).toBeInTheDocument();
    await expect(canvas.queryByRole('button', { name: 'Continue with Test Okta Provider' })).not.toBeInTheDocument();
    await expect(
      canvas.queryByRole('button', { name: 'Continue with Test Google Workspace Provider' }),
    ).not.toBeInTheDocument();
    await expect(
      canvas.queryByRole('button', { name: 'Continue with Test Microsoft Entra Provider' }),
    ).not.toBeInTheDocument();
    await expect(canvas.queryByRole('button', { name: 'Continue with Test Generic Provider' })).not.toBeInTheDocument();
    await expect(canvas.queryByRole('button', { name: 'Continue with Test Unknown Provider' })).not.toBeInTheDocument();
  },
} satisfies Story;

export const NoConnectionsOrgSlugMultipleSSO = {
  ...NoConnections,
  play: async (params) => {
    await NoConnections.play(params);

    const { canvas } = params;

    await userEvent.type(await canvas.findByPlaceholderText('Enter org slug'), 'multiple-sso-connections');
    await userEvent.click(await canvas.findByText('Continue'));

    await expect(await canvas.findByText('Continue to Example Org Inc.')).toBeInTheDocument();
    await expect(await canvas.getByRole('button', { name: 'Continue with Test Okta Provider' })).toBeEnabled();
    await expect(
      await canvas.getByRole('button', { name: 'Continue with Test Google Workspace Provider' }),
    ).toBeEnabled();
    await expect(
      await canvas.getByRole('button', { name: 'Continue with Test Microsoft Entra Provider' }),
    ).toBeEnabled();
    await expect(await canvas.getByRole('button', { name: 'Continue with Test Generic Provider' })).toBeEnabled();
    await expect(await canvas.getByRole('button', { name: 'Continue with Test Unknown Provider' })).toBeEnabled();
  },
} satisfies Story;

export const NoConnectionsInvalidOrgSlug = {
  ...NoConnections,
  play: async (params) => {
    await NoConnections.play(params);

    const { canvas } = params;

    await userEvent.type(await canvas.findByPlaceholderText('Enter org slug'), 'invalid-slug');
    await userEvent.click(await canvas.findByText('Continue'));

    await expect(await canvas.findByText('Organization not found. Please try again.')).toBeInTheDocument();
  },
} satisfies Story;

export const NoConnectionsNetworkError = {
  ...NoConnections,
  play: async (params) => {
    await NoConnections.play(params);

    const { canvas } = params;

    await userEvent.type(await canvas.findByPlaceholderText('Enter org slug'), 'error-org');
    await userEvent.click(await canvas.findByText('Continue'));

    await expect(await canvas.findByText('An error occurred. Please try again.')).toBeInTheDocument();
  },
} satisfies Story;

export const NoConnectionsBack = {
  ...NoConnections,
  play: async (params) => {
    await NoConnections.play(params);

    const { canvas } = params;

    await userEvent.click(await canvas.getByRole('button', { name: 'Back' }));

    await expect(await canvas.findByText('Enter your email to continue')).toBeInTheDocument();
  },
} satisfies Story;

export const NoConnectionsTryAnotherMethod = {
  ...NoConnections,
  play: async (params) => {
    await NoConnections.play(params);

    const { canvas } = params;

    await userEvent.click(await canvas.findByText('Try another log in method'));

    await expect(await canvas.findByText('Sign up or log in')).toBeInTheDocument();
  },
} satisfies Story;
