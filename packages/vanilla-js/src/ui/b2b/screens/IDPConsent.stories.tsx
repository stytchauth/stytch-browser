import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import { http, HttpResponse } from 'msw';
import { IDPConsentScreen } from './IDPConsent';
import {
  MOCK_OAUTH_AUTHORIZE_START_CUSTOM_SCOPES_RESPONSE,
  MOCK_OAUTH_AUTHORIZE_START_RESPONSE,
  MOCK_OAUTH_AUTHORIZE_SUBMIT_RESPONSE,
} from '../../../../.storybook/handlers';

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

const IDPConsentWrapper = ({ searchParams = mockSearchParams }: { searchParams?: Record<string, string> }) => {
  // Convert object args to search string
  const params = new URLSearchParams();
  Object.entries(searchParams).forEach(([key, value]) => {
    params.set(key, value);
  });

  return <IDPConsentScreen searchParams={'?' + params.toString()} />;
};

const meta = {
  component: IDPConsentWrapper,
  args: {
    searchParams: mockSearchParams,
  },
  argTypes: {
    searchParams: {
      control: 'object',
      description: 'OAuth URL parameters as an object',
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
