import type { Meta, StoryObj } from '@storybook/react';
import { expect, waitFor, within } from '@storybook/test';
import { AuthFlowType, B2BOAuthProviders, B2BProducts, StytchB2BUIConfig } from '@stytch/core/public';
import { MOCK_SSO_ACTIVE_CONNECTIONS } from '../../../.storybook/handlers';
import { MOCK_ORGANIZATION } from '../../testUtils';
import Container from './Container';
import { AppScreens } from './types/AppScreens';

const b2bConfig: Partial<StytchB2BUIConfig> = {
  products: [B2BProducts.oauth, B2BProducts.sso, B2BProducts.emailMagicLinks, B2BProducts.passwords],
  oauthOptions: {
    providers: [
      B2BOAuthProviders.Google,
      B2BOAuthProviders.Microsoft,
      B2BOAuthProviders.HubSpot,
      B2BOAuthProviders.Slack,
      B2BOAuthProviders.GitHub,
    ],
  },
};

const meta = {
  component: Container,
  parameters: {
    stytch: {
      // Container provides its own snackbar
      disableSnackbar: true,
      b2b: {
        config: b2bConfig,
      },
    },
  },
} satisfies Meta<typeof Container>;

export default meta;

type Story = StoryObj<typeof meta>;

export const OrgLogin = {
  parameters: {
    stytch: {
      b2b: {
        initialState: {
          screen: AppScreens.Main,
          flowState: {
            type: AuthFlowType.Organization,
            organization: {
              ...MOCK_ORGANIZATION,
              sso_active_connections: MOCK_SSO_ACTIVE_CONNECTIONS,
            },
          },
        },
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitFor(() => expect(canvas.getByText('Continue to Fake Organization')).toBeInTheDocument());

    await expect(canvas.getByText('Continue with email')).toBeInTheDocument();
    await expect(canvas.getByText('Use a password instead')).toBeInTheDocument();
    await expect(canvas.getByText('Continue with Google')).toBeInTheDocument();
    await expect(canvas.getByText('Continue with Microsoft')).toBeInTheDocument();
    await expect(canvas.getByText('Continue with HubSpot')).toBeInTheDocument();
    await expect(canvas.getByText('Continue with Slack')).toBeInTheDocument();
    await expect(canvas.getByText('Continue with GitHub')).toBeInTheDocument();
    await expect(canvas.getByText('Continue with Test Okta Provider')).toBeInTheDocument();
    await expect(canvas.getByText('Continue with Test Google Workspace Provider')).toBeInTheDocument();
    await expect(canvas.getByText('Continue with Test Microsoft Entra Provider')).toBeInTheDocument();
    await expect(canvas.getByText('Continue with Test Generic Provider')).toBeInTheDocument();
    await expect(canvas.getByText('Continue with Test Unknown Provider')).toBeInTheDocument();

    await expect(canvas.getByPlaceholderText('example@email.com')).toBeEnabled();
    await expect(canvas.getByPlaceholderText('example@email.com')).not.toHaveValue();
  },
} satisfies Story;

export const DiscoveryLogin = {
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitFor(() => expect(canvas.getByText('Sign up or log in')).toBeInTheDocument());

    await expect(canvas.getByText('Continue with email')).toBeInTheDocument();
    await expect(canvas.queryByText('Use a password instead')).toBeInTheDocument();
    await expect(canvas.getByText('Continue with Google')).toBeInTheDocument();
    await expect(canvas.getByText('Continue with Microsoft')).toBeInTheDocument();
    await expect(canvas.getByText('Continue with HubSpot')).toBeInTheDocument();
    await expect(canvas.getByText('Continue with Slack')).toBeInTheDocument();
    await expect(canvas.getByText('Continue with GitHub')).toBeInTheDocument();
    await expect(canvas.getByText('Continue with SSO')).toBeInTheDocument();

    await expect(canvas.getByPlaceholderText('example@email.com')).toBeEnabled();
    await expect(canvas.getByPlaceholderText('example@email.com')).not.toHaveValue();
  },
} satisfies Story;

export const DiscoveryLoginReordered = {
  parameters: {
    stytch: {
      b2b: {
        ...DiscoveryLogin.parameters.stytch.b2b,
        config: {
          products: [B2BProducts.sso, B2BProducts.emailMagicLinks, B2BProducts.oauth],
        },
      },
    },
  },
} satisfies Story;
