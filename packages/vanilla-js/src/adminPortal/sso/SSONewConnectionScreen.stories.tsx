import type { Meta, StoryObj } from '@storybook/react';
import { expect, screen, userEvent, waitFor } from '@storybook/test';
import { B2BSSOCreateExternalConnectionOptions, B2BSSOSAMLCreateConnectionOptions } from '@stytch/core/public';
import { delay, http } from 'msw';
import { ErrorResponse, makeErrorResponse } from '../../../.storybook/handlers';
import { SSONewConnectionScreen } from './SSONewConnectionScreen';

const meta = {
  component: SSONewConnectionScreen,
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const _SSONewConnectionScreen = {
  play: async ({ canvas }) => {
    await expect(
      canvas.getByText('Select your identity provider or choose to configure a custom SAML / OIDC connection.'),
    ).toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: 'Create' })).toBeDisabled();
  },
} satisfies Story;

export const AddIDPConnectionComplete = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button', { name: 'Create' })).toBeDisabled();

    await userEvent.type(canvas.getByPlaceholderText('Text'), 'Connection name');
    await expect(canvas.getByRole('button', { name: 'Create' })).toBeDisabled();

    await userEvent.click(canvas.getByRole('combobox'));
    await userEvent.click(screen.getByRole('menuitem', { name: 'Okta SAML' }));

    await waitFor(() => expect(canvas.getByRole('button', { name: 'Create' })).toBeEnabled());
  },
} satisfies Story;

export const CreateIDPError = {
  parameters: {
    msw: {
      handlers: {
        b2bSsoSamlCreate: http.post<never, B2BSSOSAMLCreateConnectionOptions, ErrorResponse>(
          'https://api.stytch.com/sdk/v1/b2b/sso/saml',
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
    await AddIDPConnectionComplete.play(params);

    const { canvas } = params;

    await userEvent.click(canvas.getByRole('button', { name: 'Create' }));

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Invalid request'));
  },
} satisfies Story;

export const AddExternalConnection = {
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByText('Add an external connection'));

    await expect(
      canvas.getByText(
        'Add an existing SSO connection from another organization by inputting the Source Organization ID and desired SSO Connection ID.',
      ),
    ).toBeInTheDocument();
    await expect(canvas.getByLabelText('Source Organization ID')).toBeInTheDocument();
    await expect(canvas.getByLabelText('Source Connection ID')).toBeInTheDocument();
  },
} satisfies Story;

export const AddExternalConnectionComplete = {
  play: async (params) => {
    await AddExternalConnection.play(params);

    const { canvas } = params;

    await expect(canvas.getByRole('button', { name: 'Create' })).toBeDisabled();

    await userEvent.type(canvas.getByPlaceholderText('Text'), 'Connection name');
    await expect(canvas.getByRole('button', { name: 'Create' })).toBeDisabled();

    await userEvent.type(canvas.getByLabelText('Source Organization ID'), 'source-organization-id');
    await expect(canvas.getByRole('button', { name: 'Create' })).toBeDisabled();

    await userEvent.type(canvas.getByLabelText('Source Connection ID'), 'source-connection-id');
    await expect(canvas.getByRole('button', { name: 'Create' })).toBeEnabled();
  },
} satisfies Story;

export const CreateExternalError = {
  parameters: {
    msw: {
      handlers: {
        b2bSsoExternalCreate: http.post<never, B2BSSOCreateExternalConnectionOptions, ErrorResponse>(
          'https://api.stytch.com/sdk/v1/b2b/sso/external',
          async () => {
            await delay(300);
            return makeErrorResponse({
              errorType: 'invalid_organization_id',
              message: 'organization_id format is invalid.',
              statusCode: 400,
            });
          },
        ),
      },
    },
  },
  play: async (params) => {
    await AddExternalConnectionComplete.play(params);

    const { canvas } = params;

    await userEvent.click(canvas.getByRole('button', { name: 'Create' }));

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('organization_id format is invalid.'));
  },
} satisfies Story;

export const SwitchToAddIDPConnection = {
  play: async (params) => {
    await AddExternalConnection.play(params);

    const { canvas } = params;

    await userEvent.click(canvas.getByText('Add connection by IdP'));

    await expect(
      canvas.getByText('Select your identity provider or choose to configure a custom SAML / OIDC connection.'),
    ).toBeInTheDocument();
  },
} satisfies Story;
