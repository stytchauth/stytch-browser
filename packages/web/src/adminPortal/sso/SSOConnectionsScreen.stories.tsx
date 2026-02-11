import type { Meta, StoryObj } from '@storybook/react';
import { B2BSSOGetConnectionsResponse } from '@stytch/core/public';
import { http, HttpResponse } from 'msw';
import { expect, getByRole, userEvent, waitFor, waitForElementToBeRemoved, within } from 'storybook/test';

import { DataResponse, makeB2BSessionAuthenticateHandler } from '../../../.storybook/handlers';
import { makeFakeOidcConnection } from '../testUtils/makeFakeOidcConnection';
import { makeFakeSamlConnection } from '../testUtils/makeFakeSamlConnection';
import { DEFAULT_ITEMS_PER_PAGE } from '../utils/useItemsPerPage';
import { SSOConnectionsScreen } from './SSOConnectionsScreen';

const meta = {
  component: SSOConnectionsScreen,
  parameters: {
    msw: {
      handlers: {
        b2bSessionAuthenticate: makeB2BSessionAuthenticateHandler({ roles: ['stytch_admin', 'stytch_member'] }),
      },
    },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const clickAway = async (menuElement: HTMLElement) => {
  await userEvent.click(within(document.body).getByRole('presentation').firstElementChild!);
  await waitForElementToBeRemoved(menuElement);
};

const openActionMenu = async (row: HTMLElement) => {
  const actionsButton = within(row).getByRole('button', { name: 'actions' });
  await userEvent.click(actionsButton);
  return getByRole(document.body, 'menu');
};

const expectActionMenuItems = async (row: HTMLElement, items: string[]) => {
  const actionsMenu = await openActionMenu(row);
  await expect(within(actionsMenu).getAllByRole('menuitem')).toHaveLength(items.length);
  for (const item of items) {
    await expect(within(actionsMenu).getByRole('menuitem', { name: item })).toBeInTheDocument();
  }
  await clickAway(actionsMenu);
};

export const SingleConnection = {
  parameters: {
    msw: {
      handlers: {
        b2bSso: http.get<never, never, DataResponse<B2BSSOGetConnectionsResponse>>(
          'https://api.stytch.com/sdk/v1/b2b/sso',
          () => {
            return HttpResponse.json({
              data: {
                external_connections: [],
                oidc_connections: [
                  makeFakeOidcConnection({
                    display_name: 'Test connection',
                    connection_id: 'oidc-connection-test-fake-0',
                  }),
                ],
                request_id: 'request-id-test-602dffcd-603a-471d-b3ca-60f01f7215da',
                saml_connections: [],
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

    await waitFor(() => expect(canvas.getByText('SSO Connections')).toBeInTheDocument());

    const table = canvas.getByRole('table');
    const [, tableBody] = within(table).getAllByRole('rowgroup');
    await waitFor(() => expect(within(tableBody).getAllByRole('row')).toHaveLength(1));

    await expect(canvas.getByText('Test connection')).toBeInTheDocument();
    await waitFor(() => expect(within(within(tableBody).getByRole('row')).getByText('Default')).toBeInTheDocument());

    await waitFor(() => expect(canvas.getByRole('button', { name: 'New connection' })).toBeInTheDocument());
    await waitFor(() => expect(within(table).getByRole('button', { name: 'actions' })).toBeInTheDocument());

    await expectActionMenuItems(within(table).getByRole('row', { name: /Test connection/ }), [
      'Edit connection',
      // Delete is available for the last connection, even if it's the default
      'Delete',
    ]);
  },
} satisfies Story;

export const SeveralConnections = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitFor(() => expect(canvas.getByText('SSO Connections')).toBeInTheDocument());

    const table = canvas.getByRole('table');
    const [, tableBody] = within(table).getAllByRole('rowgroup');
    await waitFor(() => expect(within(tableBody).getAllByRole('row')).toHaveLength(DEFAULT_ITEMS_PER_PAGE));

    await expect(canvas.getByRole('row', { name: /Fake OIDC Connection 1/ })).toBeInTheDocument();
    await waitFor(
      () =>
        expect(
          within(canvas.getByRole('row', { name: /Fake OIDC Connection 1/ })).getByText('Default'),
        ).toBeInTheDocument(),
      { timeout: 1000 },
    );

    await waitFor(() => expect(canvas.getByRole('button', { name: 'New connection' })).toBeInTheDocument());
    await waitFor(() =>
      expect(within(table).getAllByRole('button', { name: 'actions' })).toHaveLength(DEFAULT_ITEMS_PER_PAGE),
    );
  },
} satisfies Story;

export const ActionsMenu = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitFor(() => expect(canvas.getByText('SSO Connections')).toBeInTheDocument());

    const table = canvas.getByRole('table');
    await waitFor(() =>
      expect(within(table).getAllByRole('button', { name: 'actions' })).toHaveLength(DEFAULT_ITEMS_PER_PAGE),
    );
    await waitFor(() => expect(canvas.getByRole('button', { name: 'New connection' })).toBeInTheDocument());

    // Verify actions for default connection
    await waitFor(() => expect(within(table).getByRole('row', { name: /Default/ })).toBeInTheDocument());
    await expectActionMenuItems(within(table).getByRole('row', { name: /Default/ }), ['Edit connection']);

    // Verify actions for non-default connection
    await expectActionMenuItems(within(table).getByRole('row', { name: /Fake OIDC Connection 3/ }), [
      'Edit connection',
      'Set as default',
      'Delete',
    ]);
  },
} satisfies Story;

export const GetOnly = {
  parameters: {
    msw: {
      handlers: {
        b2bSessionAuthenticate: makeB2BSessionAuthenticateHandler({ roles: ['sso_get'] }),
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitFor(() => expect(canvas.getByText('SSO Connections')).toBeInTheDocument());
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await expect(canvas.queryByRole('button', { name: 'New connection' })).not.toBeInTheDocument();

    const table = canvas.getByRole('table');
    await waitFor(() =>
      expect(within(table).getAllByRole('button', { name: 'actions' })).toHaveLength(DEFAULT_ITEMS_PER_PAGE),
    );

    // Verify "view connection" is only action available
    await expectActionMenuItems(within(table).getByRole('row', { name: /Fake OIDC Connection 3/ }), [
      'View connection',
    ]);
  },
} satisfies Story;

export const GetAndUpdate = {
  parameters: {
    msw: {
      handlers: {
        b2bSessionAuthenticate: makeB2BSessionAuthenticateHandler({ roles: ['sso_get', 'sso_update'] }),
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitFor(() => expect(canvas.getByText('SSO Connections')).toBeInTheDocument());
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await expect(canvas.queryByRole('button', { name: 'New connection' })).not.toBeInTheDocument();

    const table = canvas.getByRole('table');
    await waitFor(() =>
      expect(within(table).getAllByRole('button', { name: 'actions' })).toHaveLength(DEFAULT_ITEMS_PER_PAGE),
    );

    // Verify "edit connection" is only action available
    await expectActionMenuItems(within(table).getByRole('row', { name: /Fake OIDC Connection 3/ }), [
      'Edit connection',
    ]);
  },
} satisfies Story;

export const GetUpdateAndDelete = {
  parameters: {
    msw: {
      handlers: {
        b2bSessionAuthenticate: makeB2BSessionAuthenticateHandler({ roles: ['sso_get', 'sso_update', 'sso_delete'] }),
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitFor(() => expect(canvas.getByText('SSO Connections')).toBeInTheDocument());
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await expect(canvas.queryByRole('button', { name: 'New connection' })).not.toBeInTheDocument();

    const table = canvas.getByRole('table');
    await waitFor(() =>
      expect(within(table).getAllByRole('button', { name: 'actions' })).toHaveLength(DEFAULT_ITEMS_PER_PAGE),
    );

    // Verify "edit connection" is only action available for default connection
    await expectActionMenuItems(within(table).getByRole('row', { name: /Default/ }), ['Edit connection']);

    // Verify "edit connection" and "delete" are only actions available
    await expectActionMenuItems(within(table).getByRole('row', { name: /Fake OIDC Connection 3/ }), [
      'Edit connection',
      'Delete',
    ]);
  },
} satisfies Story;

export const ReachedConnectionsLimit = {
  parameters: {
    msw: {
      handlers: {
        b2bAdminPortalConfig: http.get('https://api.stytch.com/sdk/v1/b2b/admin_portal_config', () => {
          return HttpResponse.json({
            data: {
              sso_config: {
                can_create_oidc_connection: false,
                can_create_saml_connection: false,
                sso_enabled: true,
              },
            },
          });
        }),
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitFor(() => expect(canvas.getByText('SSO Connections')).toBeInTheDocument());
    await waitFor(() =>
      expect(
        canvas.getByText(
          'You’ve reached the maximum number of allowed connections. Delete an existing connection in order to add a new one.',
        ),
      ).toBeInTheDocument(),
    );
    await expect(canvas.queryByRole('button', { name: 'New connection' })).not.toBeInTheDocument();
  },
} satisfies Story;

export const SetDefault = {
  parameters: {
    msw: {
      handlers: {
        b2bSessionAuthenticate: makeB2BSessionAuthenticateHandler({
          roles: ['sso_get', 'organization_update.settings.default-sso-connection'],
        }),
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitFor(() => expect(canvas.getByText('SSO Connections')).toBeInTheDocument());
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await expect(canvas.queryByRole('button', { name: 'New connection' })).not.toBeInTheDocument();

    const table = canvas.getByRole('table');
    await waitFor(() =>
      expect(within(table).getAllByRole('button', { name: 'actions' })).toHaveLength(DEFAULT_ITEMS_PER_PAGE),
    );

    // non-default row should have "set as default" action
    await expectActionMenuItems(within(table).getByRole('row', { name: /Fake OIDC Connection 3/ }), [
      'View connection',
      'Set as default',
    ]);
  },
} satisfies Story;

export const ChangeDefault = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitFor(() => expect(canvas.getByText('SSO Connections')).toBeInTheDocument());

    const table = canvas.getByRole('table');
    await waitFor(() =>
      expect(within(table).getAllByRole('button', { name: 'actions' })).toHaveLength(DEFAULT_ITEMS_PER_PAGE),
    );
    // The "New connection" button appears after RBAC info has loaded
    await waitFor(() => expect(canvas.getByRole('button', { name: 'New connection' })).toBeInTheDocument());

    const row = within(table).getByRole('row', { name: /Fake OIDC Connection 2/ });
    const actionsMenu = await openActionMenu(row);
    await userEvent.click(within(actionsMenu).getByRole('menuitem', { name: 'Set as default' }));

    const modal = getByRole(document.body, 'dialog');
    await waitFor(() => expect(within(modal).getByText('Set Fake OIDC Connection 2 as default?')).toBeInTheDocument());
    await expect(
      within(modal).getByText('This will replace Fake OIDC Connection 1 as your default SSO connection.'),
    ).toBeInTheDocument();

    await userEvent.click(within(modal).getByRole('button', { name: 'Set as default' }));
    await waitForElementToBeRemoved(modal);

    const defaultRow = within(table).getByRole('row', { name: /Default/ });
    await expect(within(defaultRow).getByText('Fake OIDC Connection 2')).toBeInTheDocument();
  },
} satisfies Story;

export const ChangeDefaultError = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitFor(() => expect(canvas.getByText('SSO Connections')).toBeInTheDocument());

    const table = canvas.getByRole('table');
    await waitFor(() =>
      expect(within(table).getAllByRole('button', { name: 'actions' })).toHaveLength(DEFAULT_ITEMS_PER_PAGE),
    );
    // The "New connection" button appears after RBAC info has loaded
    await waitFor(() => expect(canvas.getByRole('button', { name: 'New connection' })).toBeInTheDocument());

    const row = within(table).getByRole('row', { name: /Fake OIDC Connection 3/ });
    const actionsMenu = await openActionMenu(row);
    await userEvent.click(within(actionsMenu).getByRole('menuitem', { name: 'Set as default' }));

    const modal = getByRole(document.body, 'dialog');
    await waitFor(() => expect(within(modal).getByText('Set Fake OIDC Connection 3 as default?')).toBeInTheDocument());
    await expect(
      within(modal).getByText('This will replace Fake OIDC Connection 1 as your default SSO connection.'),
    ).toBeInTheDocument();

    await userEvent.click(within(modal).getByRole('button', { name: 'Set as default' }));
    await waitForElementToBeRemoved(modal);

    await waitFor(() =>
      expect(canvas.getByText('Failed to set Fake OIDC Connection 3 as default connection')).toBeInTheDocument(),
    );
  },
} satisfies Story;

export const NoConnections = {
  parameters: {
    msw: {
      handlers: {
        b2bSso: http.get<never, never, DataResponse<B2BSSOGetConnectionsResponse>>(
          'https://api.stytch.com/sdk/v1/b2b/sso',
          () => {
            return HttpResponse.json({
              data: {
                external_connections: [],
                oidc_connections: [],
                request_id: 'request-id-test-602dffcd-603a-471d-b3ca-60f01f7215da',
                saml_connections: [],
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

    await waitFor(() => expect(canvas.getByText('SSO Connections')).toBeInTheDocument());
    await waitFor(() => expect(canvas.getByText('No results found.')).toBeInTheDocument());
  },
} satisfies Story;

export const SearchBar = {
  parameters: {
    msw: {
      handlers: {
        b2bSso: http.get<never, never, DataResponse<B2BSSOGetConnectionsResponse>>(
          'https://api.stytch.com/sdk/v1/b2b/sso',
          () => {
            return HttpResponse.json({
              data: {
                external_connections: [],
                oidc_connections: [...Array(10).keys()].map((i) =>
                  makeFakeOidcConnection({
                    connection_id: `oidc-connection-test-fake-${i}`,
                    display_name: `Fake OIDC Connection ${i + 1}`,
                  }),
                ),
                saml_connections: [...Array(10).keys()].map((i) =>
                  makeFakeSamlConnection({
                    connection_id: `saml-connection-test-fake-${i}`,
                    display_name: `Fake SAML Connection ${i + 1}`,
                  }),
                ),
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

    await waitFor(() => expect(canvas.getByText('SSO Connections')).toBeInTheDocument());

    const table = canvas.getByRole('table');
    const [, tableBody] = within(table).getAllByRole('rowgroup');

    await waitFor(() => expect(within(tableBody).getAllByRole('row')).toHaveLength(DEFAULT_ITEMS_PER_PAGE));

    const searchBar = canvas.getByPlaceholderText('Search');
    expect(searchBar).not.toHaveFocus();
    await userEvent.type(canvasElement, '/');
    expect(searchBar).toHaveFocus();

    await userEvent.type(searchBar, 'Fake SAML Connection 5');

    await expect(within(tableBody).getAllByRole('row')).toHaveLength(1);
    await expect(within(tableBody).getByText('Fake SAML Connection 5')).toBeInTheDocument();

    await userEvent.clear(searchBar);
    await userEvent.type(searchBar, 'Nonexistent Connection');
    await expect(canvas.getByText('No results found.')).toBeInTheDocument();
  },
} satisfies Story;
