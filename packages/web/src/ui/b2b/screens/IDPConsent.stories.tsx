import type { Meta, StoryObj } from '@storybook/react';
import { OAuthLogoutStartResponse } from '@stytch/core';
import { http, HttpResponse } from 'msw';
import React from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import {
  MOCK_OAUTH_AUTHORIZE_START_CUSTOM_SCOPES_RESPONSE,
  MOCK_OAUTH_AUTHORIZE_START_RESPONSE,
  MOCK_OAUTH_AUTHORIZE_SUBMIT_RESPONSE,
} from '../../../../.storybook/handlers';
import { IDPConsentScreen } from './IDPConsent';

// Mock search params objects for different scenarios
const mockSearchParams = {
  client_id: 'mock-client-123',
  redirect_uri: 'https://oauthdebugger.com/debug',
  scope: 'openid email profile',
  response_type: 'code',
  state: '931g8tkpvgv',
  nonce: 'uiv1hs2sk2p',
};

const mockCustomScopesSearchParams = {
  client_id: 'mock-client-123',
  redirect_uri: 'https://oauthdebugger.com/debug',
  scope: 'openid email profile admin custom_scope',
  response_type: 'code',
  state: '931g8tkpvgv',
  nonce: 'uiv1hs2sk2p',
};

const mockErrorSearchParams = {
  client_id: '',
  redirect_uri: 'https://oauthdebugger.com/debug',
  scope: 'openid email profile',
  response_type: 'code',
  state: '931g8tkpvgv',
  nonce: 'uiv1hs2sk2p',
};

// Mock search params for logout flow
const mockLogoutSearchParams = {
  client_id: 'mock-client-123',
  post_logout_redirect_uri: 'https://oauthdebugger.com/debug',
  id_token_hint: 'eYJ...',
  state: 'code',
};

const createLogoutHandler = (paramsOverride: Partial<OAuthLogoutStartResponse> = {}) => ({
  oauthLogoutStart: http.post('https://api.stytch.com/sdk/v1/b2b/oauth/logout/start', async () =>
    HttpResponse.json({
      data: {
        request_id: 'request-id-test-b05c992f-ebdc-489d-a754-c7e70ba13141',
        status_code: 200,
        consent_required: true,
        redirect_uri: 'https://oauthdebugger.com/debug',
        ...paramsOverride,
      },
    }),
  ),
});

let navigateHref: string | undefined;

const IDPConsentWrapper = ({
  searchParams = mockSearchParams,
  navigate,
}: {
  searchParams?: Record<string, string>;
  navigate?: (href: string) => void;
}) => {
  // Convert object args to search string
  const params = new URLSearchParams();
  Object.entries(searchParams).forEach(([key, value]) => {
    params.set(key, value);
  });

  return <IDPConsentScreen searchParams={'?' + params.toString()} navigate={navigate} />;
};

const meta = {
  component: IDPConsentWrapper,
  args: {
    searchParams: mockSearchParams,
    navigate: undefined,
  },
  argTypes: {
    searchParams: {
      control: 'object',
      description: 'OAuth URL parameters as an object',
    },
    navigate: {
      control: false,
      description: 'Optional navigation function to override default browser navigation',
    },
  },
  parameters: {
    msw: {
      handlers: {
        oauthAuthorizeStart: http.post('https://api.stytch.com/sdk/v1/idp/b2b/oauth/authorize/start', async () =>
          HttpResponse.json({ data: MOCK_OAUTH_AUTHORIZE_START_RESPONSE }),
        ),
        oauthAuthorizeSubmit: http.post('https://api.stytch.com/sdk/v1/idp/b2b/oauth/authorize/submit', async () =>
          HttpResponse.json({ data: MOCK_OAUTH_AUTHORIZE_SUBMIT_RESPONSE }),
        ),
      },
    },
  },
  beforeEach() {
    navigateHref = undefined;
  },
} satisfies Meta<typeof IDPConsentWrapper>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    // Wait for the consent screen to load
    await expect(await canvas.findByText('Sign in to Sample Application with Mock Project')).toBeInTheDocument();

    // Verify the consent form elements are present
    await expect(await canvas.findByText('Allow')).toBeInTheDocument();
    await expect(await canvas.findByText('Deny')).toBeInTheDocument();
  },
};

export const WithCustomScopes: Story = {
  args: {
    searchParams: mockCustomScopesSearchParams,
  },
  parameters: {
    msw: {
      handlers: {
        oauthAuthorizeStart: http.post('*/oauth/authorize/start', async () =>
          HttpResponse.json({ data: MOCK_OAUTH_AUTHORIZE_START_CUSTOM_SCOPES_RESPONSE }),
        ),
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Wait for the consent screen to load with custom scopes
    await expect(
      await canvas.findByText('Sample Application wants to access your Mock Project account'),
    ).toBeInTheDocument();

    // Verify the consent form elements are present
    await expect(canvas.getByText('Allow')).toBeInTheDocument();
    await expect(canvas.getByText('Deny')).toBeInTheDocument();
  },
};

export const WithUngrantableScopes: Story = {
  args: {
    searchParams: mockCustomScopesSearchParams,
  },
  parameters: {
    msw: {
      handlers: {
        oauthAuthorizeStart: http.post('https://api.stytch.com/sdk/v1/idp/b2b/oauth/authorize/start', async () =>
          HttpResponse.json({ data: MOCK_OAUTH_AUTHORIZE_START_CUSTOM_SCOPES_RESPONSE }),
        ),
      },
    },
  },
  play: async ({ canvas }) => {
    // Wait for the consent screen to load
    await expect(
      await canvas.findByText('Sample Application wants to access your Mock Project account'),
    ).toBeInTheDocument();

    // Verify the consent form elements are present
    await expect(canvas.getByText('Allow')).toBeInTheDocument();
    await expect(canvas.getByText('Deny')).toBeInTheDocument();

    // Check that ungrantable scopes are handled by the UI correctly
    // The custom_scope should be shown as ungrantable (disabled or with warning)
    await userEvent.click(canvas.getByText(/You do not have permissions to grant Sample Application access/));

    // Verify that ungrantable scopes are visually indicated (disabled state or warning)
    await expect(await canvas.findByText(/Use the custom_scope scope/)).toBeInTheDocument();
  },
};

export const AllowConsent: Story = {
  play: async ({ canvas }) => {
    // Wait for the consent screen to load
    await expect(await canvas.findByText('Sign in to Sample Application with Mock Project')).toBeInTheDocument();

    // Click Allow button
    await userEvent.click(canvas.getByText('Allow'));

    // Should redirect or show success
    await expect(await canvas.findByText('Success!')).toBeInTheDocument();
  },
};

export const DenyConsent: Story = {
  play: async ({ canvas }) => {
    // Wait for the consent screen to load
    await expect(await canvas.findByText('Sign in to Sample Application with Mock Project')).toBeInTheDocument();

    // Click Deny button
    await userEvent.click(canvas.getByText('Deny'));

    // Should show denial message
    await expect(await canvas.findByText('Access to the application was denied.')).toBeInTheDocument();
  },
};

export const NoConsentRequired: Story = {
  parameters: {
    msw: {
      handlers: {
        oauthAuthorizeStart: http.post('https://api.stytch.com/sdk/v1/idp/b2b/oauth/authorize/start', async () =>
          HttpResponse.json({ data: { ...MOCK_OAUTH_AUTHORIZE_START_RESPONSE, consent_required: false } }),
        ),
      },
    },
  },

  play: async ({ canvas }) => {
    // Should automatically redirect without showing consent screen
    await expect(await canvas.findByText('Success!')).toBeInTheDocument();
  },
};

export const URLParameterError: Story = {
  args: {
    searchParams: mockErrorSearchParams,
  },
  play: async ({ canvas }) => {
    // Should show error message for missing client_id
    await expect(
      await canvas.findByText(
        'Required parameter is missing: client_id. Please reach out to the application developer.',
      ),
    ).toBeInTheDocument();
  },
};

export const ErrorState: Story = {
  parameters: {
    msw: {
      handlers: {
        oauthAuthorizeStart: http.post('https://api.stytch.com/sdk/v1/idp/b2b/oauth/authorize/start', async () =>
          HttpResponse.json(
            {
              status_code: 400,
              request_id: 'request-id-test-b05c992f-ebdc-489d-a754-c7e70ba13141',
              error_type: 'invalid_parameters',
              error_message: 'Invalid client_id',
              error_url: 'https://stytch.com/docs/api/errors#invalid_parameters',
            },
            { status: 400 },
          ),
        ),
      },
    },
  },
  play: async ({ canvas }) => {
    // Should show error message
    await expect(await canvas.findByText('Invalid client_id')).toBeInTheDocument();
  },
};

// Logout flow stories
export const LogoutDefault: Story = {
  args: {
    searchParams: mockLogoutSearchParams,
  },
  parameters: {
    msw: { handlers: createLogoutHandler() },
  },
  play: async ({ canvas }) => {
    // Wait for the logout consent screen to load
    await expect(await canvas.findByText('Log out?')).toBeInTheDocument();

    // Verify the logout confirmation message
    await expect(
      canvas.getByText('Are you sure you want to log out of your Mock Project account?'),
    ).toBeInTheDocument();

    // Verify the buttons are present
    await expect(canvas.getByText('Yes')).toBeInTheDocument();
    await expect(canvas.getByText('No')).toBeInTheDocument();
  },
};

export const LogoutWithConsentYes: Story = {
  args: {
    searchParams: mockLogoutSearchParams,
    navigate: (href: string) => {
      navigateHref = href;
    },
  },
  parameters: {
    msw: { handlers: createLogoutHandler() },
  },
  play: async ({ canvas }) => {
    // Wait for the logout consent screen to load
    await expect(await canvas.findByText('Log out?')).toBeInTheDocument();

    // Click Yes button
    await userEvent.click(canvas.getByText('Yes'));

    // Verify navigate was called with the correct redirect URI
    await waitFor(() => expect(navigateHref).toBe('https://oauthdebugger.com/debug'));
  },
};

export const LogoutWithConsentNo: Story = {
  args: {
    searchParams: mockLogoutSearchParams,
  },
  parameters: {
    msw: { handlers: createLogoutHandler() },
  },
  play: async ({ canvas }) => {
    // Wait for the logout consent screen to load
    await expect(await canvas.findByText('Log out?')).toBeInTheDocument();

    // Click No button
    await userEvent.click(canvas.getByText('No'));

    // Should show denial message
    await expect(await canvas.findByText('You have not been logged out. You may close this page.')).toBeInTheDocument();
  },
};

export const LogoutNoConsentRequired: Story = {
  args: {
    searchParams: mockLogoutSearchParams,
    navigate: (href: string) => {
      navigateHref = href;
    },
  },
  parameters: {
    msw: {
      handlers: createLogoutHandler({ consent_required: false }),
    },
  },
  play: async () => {
    // Verify navigate was called with the correct redirect URI
    await waitFor(() => expect(navigateHref).toBe('https://oauthdebugger.com/debug'));
  },
};
