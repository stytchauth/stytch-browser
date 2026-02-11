import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import { makeB2BSessionAuthenticateHandler, organizationMeResponse } from '../../../.storybook/handlers';
import { AdminPortalB2BProducts } from '../AdminPortalB2BProducts';
import { OrgSettingsUserOnboardingSection } from './OrgSettingsUserOnboardingSection';

const meta = {
  component: OrgSettingsUserOnboardingSection,
  args: {
    orgInfo: organizationMeResponse,
  },
  parameters: {
    msw: {
      handlers: {
        b2bSessionAuthenticate: makeB2BSessionAuthenticateHandler({
          roles: ['stytch_admin', 'stytch_member'],
          oauthRegistrations: [
            {
              locale: null,
              member_oauth_registration_id: 'oauth-registration-test-id',
              profile_picture_url: null,
              provider_subject: '12345',
              provider_tenants: [
                {
                  tenant_id: 'tenant-123',
                  tenant_name: 'Test Tenant',
                },
                {
                  tenant_id: 'tenant-456',
                  tenant_name: 'Test Tenant 2',
                },
              ],
              provider_type: 'GitHub',
            },
            {
              locale: null,
              member_oauth_registration_id: 'oauth-registration-test-id-2',
              profile_picture_url: null,
              provider_subject: '12345',
              provider_tenants: [
                {
                  tenant_id: 'tenant-789',
                  tenant_name: 'Another Tenant',
                },
              ],
              provider_type: 'Hubspot',
            },
          ],
        }),
      },
    },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const View = {
  play: async ({ canvas }) => {
    await expect(await canvas.findByRole('heading', { name: 'JIT Provisioning' })).toBeInTheDocument();
    await expect(await canvas.getByRole('checkbox', { name: 'Email domains' })).toBeInTheDocument();
    await expect(await canvas.getByRole('checkbox', { name: 'OAuth accounts' })).toBeInTheDocument();
    await expect(await canvas.getByRole('checkbox', { name: 'SSO connections' })).toBeInTheDocument();

    await expect(
      await canvas.getByRole('columnheader', {
        name: 'OAuth Provider',
      }),
    ).toBeInTheDocument();

    await expect(
      await canvas.getByRole('radio', {
        name: 'All SSO connections',
      }),
    ).toBeInTheDocument();
  },
} satisfies Story;

export const SSODisabled = {
  parameters: {
    stytch: {
      adminPortalConfig: {
        allowedAuthMethods: [
          AdminPortalB2BProducts.emailMagicLinks,
          AdminPortalB2BProducts.oauthGoogle,
          AdminPortalB2BProducts.oauthGithub,
        ],
      },
    },
  },
  play: async ({ canvas }) => {
    await expect(await canvas.findByRole('heading', { name: 'JIT Provisioning' })).toBeInTheDocument();
    await expect(await canvas.getByRole('checkbox', { name: 'Email domains' })).toBeInTheDocument();
    await expect(await canvas.getByRole('checkbox', { name: 'OAuth accounts' })).toBeInTheDocument();
    await expect(await canvas.queryByRole('checkbox', { name: 'SSO connections' })).not.toBeInTheDocument();

    await expect(
      await canvas.getByRole('columnheader', {
        name: 'OAuth Provider',
      }),
    ).toBeInTheDocument();

    await expect(
      await canvas.queryByRole('radio', {
        name: 'All SSO connections',
      }),
    ).not.toBeInTheDocument();
  },
} satisfies Story;

export const OAuthDisabled = {
  parameters: {
    stytch: {
      adminPortalConfig: {
        allowedAuthMethods: [AdminPortalB2BProducts.emailMagicLinks, AdminPortalB2BProducts.sso],
      },
    },
  },
  play: async ({ canvas }) => {
    await expect(await canvas.findByRole('heading', { name: 'JIT Provisioning' })).toBeInTheDocument();
    await expect(await canvas.getByRole('checkbox', { name: 'Email domains' })).toBeInTheDocument();
    await expect(await canvas.queryByRole('checkbox', { name: 'OAuth accounts' })).not.toBeInTheDocument();
    await expect(await canvas.getByRole('checkbox', { name: 'SSO connections' })).toBeInTheDocument();

    await expect(
      await canvas.queryByRole('columnheader', {
        name: 'OAuth Provider',
      }),
    ).not.toBeInTheDocument();

    await expect(
      await canvas.getByRole('radio', {
        name: 'All SSO connections',
      }),
    ).toBeInTheDocument();
  },
} satisfies Story;

export const OAuthNonProvidersEnabled = {
  args: {
    orgInfo: {
      ...organizationMeResponse,
      allowed_oauth_tenants: {},
    },
  },
  parameters: {
    stytch: {
      adminPortalConfig: {
        allowedAuthMethods: [
          AdminPortalB2BProducts.emailMagicLinks,
          AdminPortalB2BProducts.sso,
          AdminPortalB2BProducts.oauthGoogle,
        ],
      },
    },
  },
  play: async ({ canvas }) => {
    await expect(await canvas.findByRole('heading', { name: 'JIT Provisioning' })).toBeInTheDocument();
    await expect(await canvas.getByRole('checkbox', { name: 'Email domains' })).toBeInTheDocument();
    await expect(await canvas.queryByRole('checkbox', { name: 'OAuth accounts' })).not.toBeInTheDocument();
    await expect(await canvas.getByRole('checkbox', { name: 'SSO connections' })).toBeInTheDocument();

    await expect(
      await canvas.queryByRole('columnheader', {
        name: 'OAuth Provider',
      }),
    ).not.toBeInTheDocument();
  },
} satisfies Story;

export const FlowClickEdit = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Use an extended timeout because this can take longer than typical to load
    // for some reason (long garbage collection?)
    const editbutton = await canvas.findByRole('button', { name: 'Edit' }, { timeout: 10000 });
    await userEvent.click(editbutton);
    await waitFor(() => expect(canvas.getByRole('button', { name: 'Save' })).toBeDisabled());
  },
} satisfies Story;

export const FlowEditEmailInvites = {
  ...FlowClickEdit,
  play: async (params) => {
    await FlowClickEdit.play(params);
    const { canvasElement } = params;
    const canvas = within(canvasElement);

    const emailInvitesSwitch = canvas.getByLabelText('Allow members to be invited by email');
    await userEvent.click(emailInvitesSwitch);

    await expect(emailInvitesSwitch).not.toBeChecked();
  },
} satisfies Story;

export const FlowEditEmailDomainsVisibility = {
  ...FlowClickEdit,
  play: async (params) => {
    await FlowClickEdit.play(params);
    const { canvas } = params;

    const emailInvitesSwitch = canvas.getByLabelText('Allow members to be invited by email');
    await expect(emailInvitesSwitch).toBeChecked();

    const anybodyRadio = await canvas.findByRole('radio', { name: 'Anybody' });
    const usersFromAllowedDomainsRadio = await canvas.findByRole('radio', { name: 'Users from allowed email domains' });
    const jitEmailDomainsCheckbox = await canvas.findByRole('checkbox', { name: 'Email domains' });

    await expect(anybodyRadio).toBeChecked();
    await expect(usersFromAllowedDomainsRadio).not.toBeChecked();
    await expect(jitEmailDomainsCheckbox).toBeChecked();
    await expect(await canvas.findByRole('heading', { name: 'Email domains' })).toBeInTheDocument();

    await userEvent.click(jitEmailDomainsCheckbox);
    await expect(anybodyRadio).toBeChecked();
    await expect(usersFromAllowedDomainsRadio).not.toBeChecked();
    await expect(jitEmailDomainsCheckbox).not.toBeChecked();
    await expect(canvas.queryByRole('heading', { name: 'Email domains' })).not.toBeInTheDocument();

    await userEvent.click(usersFromAllowedDomainsRadio);
    await expect(anybodyRadio).not.toBeChecked();
    await expect(usersFromAllowedDomainsRadio).toBeChecked();
    await expect(jitEmailDomainsCheckbox).not.toBeChecked();
    await expect(await canvas.findByRole('heading', { name: 'Email domains' })).toBeInTheDocument();

    await userEvent.click(emailInvitesSwitch);
    await expect(emailInvitesSwitch).not.toBeChecked();
    await expect(canvas.queryByRole('heading', { name: 'Email domains' })).not.toBeInTheDocument();

    await userEvent.click(jitEmailDomainsCheckbox);
    await expect(jitEmailDomainsCheckbox).toBeChecked();
    await expect(await canvas.findByRole('heading', { name: 'Email domains' })).toBeInTheDocument();
  },
} satisfies Story;

export const FlowEditJITProvisioningOauthTenants = {
  ...FlowClickEdit,
  play: async (params) => {
    await FlowClickEdit.play(params);
    const { canvasElement } = params;
    const canvas = within(canvasElement);

    await expect(await canvas.findByRole('heading', { name: 'OAuth accounts' })).toBeInTheDocument();

    const oAuthCheckbox = canvas.getByRole('checkbox', { name: 'OAuth accounts' });
    await userEvent.click(oAuthCheckbox);

    await expect(oAuthCheckbox).not.toBeChecked();

    await expect(canvas.queryByRole('heading', { name: 'OAuth accounts' })).not.toBeInTheDocument();
  },
} satisfies Story;

export const FlowEditJITProvisioningSSOConnections = {
  ...FlowClickEdit,
  play: async (params) => {
    await FlowClickEdit.play(params);
    const { canvasElement } = params;
    const canvas = within(canvasElement);

    await expect(await canvas.findByRole('heading', { name: 'SSO connections' })).toBeInTheDocument();

    const ssoCheckbox = canvas.getByRole('checkbox', { name: 'SSO connections' });
    await userEvent.click(ssoCheckbox);

    await expect(ssoCheckbox).not.toBeChecked();

    await expect(canvas.queryByRole('heading', { name: 'SSO connections' })).not.toBeInTheDocument();
  },
} satisfies Story;

export const FlowAddJITProvisioningAllowedSSOConnections = {
  ...FlowClickEdit,
  play: async (params) => {
    await FlowClickEdit.play(params);
    const { canvasElement } = params;
    const canvas = within(canvasElement);

    const radio = canvas.getByLabelText('Allowed SSO connections');
    await userEvent.click(radio);

    await expect(await canvas.findByText('Fake OIDC Connection 1')).toBeInTheDocument();
  },
} satisfies Story;

export const FlowDeleteAllowedEmailDomains = {
  ...FlowClickEdit,
  play: async (params) => {
    await FlowClickEdit.play(params);
    const { canvasElement } = params;
    const canvas = within(canvasElement);

    const deleteButton = canvas.getAllByRole('button', { name: 'Delete' });
    await userEvent.click(deleteButton[0]);

    await expect(canvas.getByRole('button', { name: 'Add domain' })).toBeInTheDocument();
  },
} satisfies Story;

export const FlowAddAllowedEmailDomains = {
  ...FlowClickEdit,
  play: async (params) => {
    await FlowClickEdit.play(params);
    const { canvasElement } = params;
    const canvas = within(canvasElement);

    const addDomainButton = canvas.getByRole('button', { name: 'Add domain' });
    await userEvent.click(addDomainButton);

    const body = canvasElement.ownerDocument.body;
    const modal = within(body);
    await waitFor(() => expect(modal.findByText('Add allowed email domain')));
    const input = modal.getByLabelText('Domain');
    await userEvent.type(input, 'example.com');

    const okButton = modal.getByRole('button', { name: 'Save' });
    await userEvent.click(okButton);

    await waitFor(() => expect(canvas.getByText('example.com')).toBeInTheDocument());
  },
} satisfies Story;

export const FlowOAuthModal = {
  ...FlowClickEdit,
  play: async (params) => {
    await FlowClickEdit.play(params);
    const { canvas, canvasElement } = params;

    await userEvent.click(canvas.getByRole('button', { name: 'Add account' }));

    const dialog = await within(canvasElement.ownerDocument.body).findByRole('dialog');
    await expect(within(dialog).getByText('Add allowed OAuth account')).toBeInTheDocument();
    await expect(within(dialog).getByText('Select from the list of linked accounts.')).toBeInTheDocument();
    await expect(within(dialog).getByRole('button', { name: 'Add manually' })).toBeInTheDocument();
  },
} satisfies Story;

export const FlowOAuthModalLinkedAccounts = {
  ...FlowClickEdit,
  play: async (params) => {
    await FlowOAuthModal.play(params);
    const { canvasElement } = params;
    const dialog = await within(canvasElement.ownerDocument.body).findByRole('dialog');

    const select = within(dialog).getByRole('combobox');
    await userEvent.click(select);

    const listbox = await within(canvasElement.ownerDocument.body).findByRole('listbox');
    const menuItems = within(listbox).getAllByRole('menuitem');
    await expect(menuItems).toHaveLength(3);
    await expect(menuItems[0]).toHaveTextContent('GitHub Test Tenant [tenant-123]');
    await expect(menuItems[1]).toHaveTextContent('GitHub Test Tenant 2 [tenant-456]');
    await expect(menuItems[2]).toHaveTextContent('HubSpot Another Tenant [tenant-789]');
  },
} satisfies Story;

export const FlowOAuthModalAddTenant = {
  ...FlowOAuthModalLinkedAccounts,
  play: async (params) => {
    await FlowOAuthModalLinkedAccounts.play(params);
    const { canvas, canvasElement } = params;

    const listbox = await within(canvasElement.ownerDocument.body).findByRole('listbox');
    const menuItems = within(listbox).getAllByRole('menuitem');
    await userEvent.click(menuItems[0]);

    const dialog = await within(canvasElement.ownerDocument.body).findByRole('dialog');
    const saveButton = within(dialog).getByRole('button', { name: 'Save' });
    await userEvent.click(saveButton);

    const tableRows = await canvas.findAllByRole('row');

    const gitHubRow = tableRows.find(
      (row) => within(row).queryByText('GitHub') && within(row).queryByText('tenant-123'),
    );
    expect(gitHubRow).toBeInTheDocument();
  },
} satisfies Story;

export const FlowOAuthModalTenantFiltered = {
  ...FlowOAuthModalAddTenant,
  play: async (params) => {
    await FlowOAuthModalAddTenant.play(params);

    const { canvas, canvasElement } = params;

    await userEvent.click(canvas.getByRole('button', { name: 'Add account' }));

    const dialog = await within(canvasElement.ownerDocument.body).findByRole('dialog');
    await expect(within(dialog).getByText('Add allowed OAuth account')).toBeInTheDocument();

    const select = within(dialog).getByRole('combobox');
    await userEvent.click(select);

    const listbox = await within(canvasElement.ownerDocument.body).findByRole('listbox');
    const menuItems = within(listbox).getAllByRole('menuitem');
    await expect(menuItems).toHaveLength(2);
    await expect(menuItems[0]).toHaveTextContent('GitHub Test Tenant 2 [tenant-456]');
    await expect(menuItems[1]).toHaveTextContent('HubSpot Another Tenant [tenant-789]');
  },
} satisfies Story;

export const FlowOAuthModalTenantFilteredNoExistingTenants = {
  ...FlowOAuthModalTenantFiltered,
  args: {
    orgInfo: {
      ...organizationMeResponse,
      allowed_oauth_tenants: {},
    },
  },
} satisfies Story;

export const FlowOAuthModalLinkedAccountsLimitedProviders = {
  ...FlowOAuthModal,
  parameters: {
    stytch: {
      adminPortalConfig: {
        allowedAuthMethods: [
          AdminPortalB2BProducts.emailMagicLinks,
          AdminPortalB2BProducts.sso,
          AdminPortalB2BProducts.oauthHubspot,
          AdminPortalB2BProducts.oauthSlack,
        ],
      },
    },
  },
  play: async (params) => {
    await FlowOAuthModal.play(params);
    const { canvasElement } = params;
    const dialog = await within(canvasElement.ownerDocument.body).findByRole('dialog');

    const select = within(dialog).getByRole('combobox');
    await userEvent.click(select);

    const listbox = await within(canvasElement.ownerDocument.body).findByRole('listbox');
    const menuItems = within(listbox).getAllByRole('menuitem');
    await expect(menuItems).toHaveLength(1);
    await expect(menuItems[0]).toHaveTextContent('HubSpot Another Tenant [tenant-789]');
  },
} satisfies Story;

export const FlowOAuthModalManual = {
  ...FlowClickEdit,
  play: async (params) => {
    await FlowOAuthModal.play(params);
    const { canvasElement } = params;
    const dialog = await within(canvasElement.ownerDocument.body).findByRole('dialog');

    const addManuallyButton = within(dialog).getByRole('button', { name: 'Add manually' });
    await userEvent.click(addManuallyButton);

    await expect(
      within(dialog).getByText(
        'Add an OAuth account manually by selecting the OAuth provider and inputting the account ID.',
      ),
    ).toBeInTheDocument();
    await expect(within(dialog).getByRole('button', { name: 'Add from linked accounts' })).toBeInTheDocument();
  },
} satisfies Story;

export const FlowOAuthModalManualAddTenant = {
  ...FlowOAuthModalManual,
  play: async (params) => {
    await FlowOAuthModalManual.play(params);
    const { canvas, canvasElement } = params;
    const dialog = await within(canvasElement.ownerDocument.body).findByRole('dialog');

    const select = within(dialog).getByRole('combobox');
    await userEvent.click(select);

    const listbox = await within(canvasElement.ownerDocument.body).findByRole('listbox');
    const menuItems = within(listbox).getAllByRole('menuitem');
    await userEvent.click(menuItems[0]);

    const tenantIdInput = within(dialog).getByLabelText('Account ID');
    await userEvent.type(tenantIdInput, 'test-tenant-123');

    const addButton = within(dialog).getByRole('button', { name: 'Save' });
    await userEvent.click(addButton);

    const tableRows = await canvas.findAllByRole('row');
    const tableRow = tableRows.find(
      (row) => within(row).queryByText('GitHub') && within(row).queryByText('test-tenant-123'),
    );
    expect(tableRow).toBeInTheDocument();
  },
} satisfies Story;

export const FlowOAuthModalProviders = {
  ...FlowOAuthModalManual,
  play: async (params) => {
    await FlowOAuthModalManual.play(params);
    const { canvasElement } = params;
    const dialog = await within(canvasElement.ownerDocument.body).findByRole('dialog');

    const select = within(dialog).getByRole('combobox');
    await userEvent.click(select);

    const listbox = await within(canvasElement.ownerDocument.body).findByRole('listbox');
    const menuItems = within(listbox).getAllByRole('menuitem');

    await expect(menuItems).toHaveLength(3);
    await expect(menuItems[0]).toHaveTextContent('GitHub');
    await expect(menuItems[1]).toHaveTextContent('HubSpot');
    await expect(menuItems[2]).toHaveTextContent('Slack');
  },
} satisfies Story;

export const FlowOAuthModalLimitedProviders = {
  ...FlowOAuthModal,
  parameters: {
    stytch: {
      adminPortalConfig: {
        allowedAuthMethods: [
          AdminPortalB2BProducts.emailMagicLinks,
          AdminPortalB2BProducts.sso,
          AdminPortalB2BProducts.oauthHubspot,
          AdminPortalB2BProducts.oauthSlack,
        ],
      },
    },
  },
  play: async (params) => {
    await FlowOAuthModalManual.play(params);
    const { canvasElement } = params;
    const dialog = await within(canvasElement.ownerDocument.body).findByRole('dialog');

    const select = within(dialog).getByRole('combobox');
    await userEvent.click(select);

    const listbox = await within(canvasElement.ownerDocument.body).findByRole('listbox');
    const menuItems = within(listbox).getAllByRole('menuitem');

    await expect(menuItems).toHaveLength(2);
    await expect(menuItems[0]).toHaveTextContent('HubSpot');
    await expect(menuItems[1]).toHaveTextContent('Slack');
  },
} satisfies Story;

export const FlowOAuthModalWithNoLinkedAccounts = {
  ...FlowOAuthModal,
  parameters: {
    msw: {
      handlers: {
        b2bSessionAuthenticate: makeB2BSessionAuthenticateHandler({
          roles: ['stytch_admin', 'stytch_member'],
        }),
      },
    },
  },
  play: async (params) => {
    await FlowClickEdit.play(params);
    const { canvas, canvasElement } = params;

    await userEvent.click(canvas.getByRole('button', { name: 'Add account' }));

    const dialog = await within(canvasElement.ownerDocument.body).findByRole('dialog');

    await expect(within(dialog).getByText('Add allowed OAuth account')).toBeInTheDocument();
    await expect(
      within(dialog).getByText(
        'Add an OAuth account manually by selecting the OAuth provider and inputting the account ID.',
      ),
    ).toBeInTheDocument();
    await expect(within(dialog).getByRole('textbox', { name: 'Account ID' })).toBeInTheDocument();
    await expect(within(dialog).queryByRole('button', { name: 'Add from linked accounts' })).not.toBeInTheDocument();
  },
} satisfies Story;
