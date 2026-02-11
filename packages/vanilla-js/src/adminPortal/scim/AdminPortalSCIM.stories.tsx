import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, waitForElementToBeRemoved, within } from '@storybook/test';
import { B2BSCIMGetConnectionResponse } from '@stytch/core/public';
import { HttpResponse, http } from 'msw';
import React from 'react';
import { DataResponse, infiniteResolver, makeB2BSessionAuthenticateHandler } from '../../../.storybook/handlers';
import { MainContainer } from '../MainContainer';
import { makeFakeScimConnection } from '../testUtils/makeFakeScimConnection';
import { Content } from './AdminPortalSCIM';

const meta = {
  component: Content,
  render: (args) => (
    <MainContainer>
      <Content {...args} />
    </MainContainer>
  ),
  parameters: {
    msw: {
      handlers: {
        b2bSessionAuthenticate: makeB2BSessionAuthenticateHandler({ roles: ['stytch_admin', 'stytch_member'] }),
      },
    },
    layout: 'fullscreen',
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const _AdminPortalSCIM = {} satisfies Story;

export const FlowManageTokenRotation = {
  args: {
    connection: makeFakeScimConnection({
      identity_provider: 'generic',
    }),
  },
  parameters: {
    msw: {
      handlers: {
        b2bScim: http.get<never, never, DataResponse<B2BSCIMGetConnectionResponse>>(
          'https://api.stytch.com/sdk/v1/b2b/scim',
          () => {
            return HttpResponse.json({
              data: {
                connection: makeFakeScimConnection({
                  identity_provider: 'generic',
                  next_bearer_token_last_four: 'test',
                  next_bearer_token_expires_at: '2030-03-20T21:28:28Z',
                }),
                request_id: 'request-id-test-602dffcd-603a-471d-b3ca-60f01f7215da',
                status_code: 200,
              },
            });
          },
        ),
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const cancelButton = await waitFor(() => canvas.getByRole('button', { name: 'Cancel rotation' }));
    const completeButton = await waitFor(() => canvas.getByRole('button', { name: 'Complete rotation' }));

    await waitFor(() => expect(cancelButton).toBeVisible());
    await waitFor(() => expect(completeButton).toBeVisible());
  },
} satisfies Story;

export const Loading = {
  parameters: {
    msw: {
      handlers: {
        b2bAdminPortalConfig: http.get('https://api.stytch.com/sdk/v1/b2b/admin_portal_config', infiniteResolver),
      },
    },
  },
} satisfies Story;

export const NoPermission = {
  parameters: {
    msw: {
      handlers: {
        b2bSessionAuthenticate: makeB2BSessionAuthenticateHandler({ roles: [] }),
      },
    },
  },
} satisfies Story;

export const NotEnabled = {
  parameters: {
    msw: {
      handlers: {
        b2bAdminPortalConfig: http.get('https://api.stytch.com/sdk/v1/b2b/admin_portal_config', () => {
          return HttpResponse.json({
            data: {
              scim_config: {
                scim_enabled: false,
              },
            },
          });
        }),
      },
    },
  },
} satisfies Story;

export const NetworkError = {
  parameters: {
    msw: {
      handlers: {
        b2bAdminPortalConfig: http.get('https://api.stytch.com/sdk/v1/b2b/admin_portal_config', () => {
          return HttpResponse.error();
        }),
      },
    },
  },
} satisfies Story;

export const FlowStartTokenRotation = {
  play: async ({ canvas, canvasElement }) => {
    const button = await canvas.findByRole('button', { name: 'Start token rotation' });
    await userEvent.click(button);

    const body = canvasElement.ownerDocument.body;
    const modal = await within(body).findByRole('dialog');
    const saveButton = await within(modal).findByRole('button', { name: 'Done' });

    await waitFor(() => expect(saveButton).toBeDisabled());

    const nextTokenLabel = await canvas.findByText('Next HTTP Header Bearer Token');
    await expect(nextTokenLabel).toBeInTheDocument();

    const checkbox = await within(modal).findByRole('checkbox');
    await userEvent.click(checkbox);

    await waitFor(() => expect(saveButton).toBeEnabled());
    await userEvent.click(saveButton);

    await waitForElementToBeRemoved(modal);

    // Wait an arbitrary period to make sure the label does not disappear
    await new Promise((resolve) => setTimeout(resolve, 1000));

    await expect(nextTokenLabel).toBeInTheDocument();
  },
} satisfies Story;

export const FlowCancelTokenRotation = {
  play: async ({ canvas, canvasElement }) => {
    const button = await canvas.findByRole('button', { name: 'Start token rotation' });
    await userEvent.click(button);

    const body = canvasElement.ownerDocument.body;
    const modal = await within(body).findByRole('dialog');
    const cancelButton = await within(modal).findByRole('button', { name: 'Cancel' });

    const nextTokenLabel = await canvas.findByText('Next HTTP Header Bearer Token');
    await expect(nextTokenLabel).toBeInTheDocument();

    await userEvent.click(cancelButton);

    await waitForElementToBeRemoved(modal);
    await waitForElementToBeRemoved(nextTokenLabel);
  },
} satisfies Story;

export const FlowAbortTokenRotation = {
  play: async ({ canvas, canvasElement }) => {
    const button = await canvas.findByRole('button', { name: 'Start token rotation' });
    await userEvent.click(button);

    const body = canvasElement.ownerDocument.body;
    const modal = await within(body).findByRole('dialog');

    const nextTokenLabel = await canvas.findByText('Next HTTP Header Bearer Token');
    await expect(nextTokenLabel).toBeInTheDocument();

    await userEvent.keyboard('{Escape}');

    await waitForElementToBeRemoved(modal);
    await waitForElementToBeRemoved(nextTokenLabel);
  },
} satisfies Story;
