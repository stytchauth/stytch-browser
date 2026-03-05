import type { Meta, StoryObj } from '@storybook/react-vite';
import { B2BMFAProducts, B2BOrganizationsUpdateOptions, B2BOrganizationsUpdateResponse } from '@stytch/core/public';
import { delay, http, HttpResponse } from 'msw';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { DataResponse, makeB2BSessionAuthenticateHandler, organizationMeResponse } from '../../../.storybook/handlers';
import { AdminPortalB2BProducts } from '../AdminPortalB2BProducts';
import { OrgSettingsAuthenticationSettingsSection } from './OrgSettingsAuthenticationSettingsSection';

const meta = {
  args: {
    orgInfo: organizationMeResponse,
  },
  component: OrgSettingsAuthenticationSettingsSection,
  parameters: {
    adminPortal: true,
    msw: {
      handlers: {
        b2bSessionAuthenticate: makeB2BSessionAuthenticateHandler({ roles: ['stytch_admin', 'stytch_member'] }),
      },
    },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const View = {} satisfies Story;

export const FlowClickEdit = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => expect(canvas.getByText('Edit')));
    const editbutton = canvas.getByRole('button', { name: 'Edit' });
    await userEvent.click(editbutton);
  },
} satisfies Story;

export const MfaControlsEnabled = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitFor(() => expect(canvas.getByText('Secondary authentication')).toBeInTheDocument());
  },
} satisfies Story;

export const MfaControlsDisabled = {
  parameters: {
    msw: {
      handlers: {
        b2bAdminPortalConfig: http.get('https://api.stytch.com/sdk/v1/b2b/admin_portal_config', () => {
          return HttpResponse.json({
            data: {
              organization_config: {
                mfa_controls_enabled: false,
              },
            },
          });
        }),
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await delay(500);
    await expect(canvas.queryByText('Secondary authentication')).not.toBeInTheDocument();
  },
} satisfies Story;

export const CustomOrgSettingsUIConfig = {
  ...FlowClickEdit,
  parameters: {
    stytch: {
      adminPortalConfig: {
        allowedAuthMethods: [
          AdminPortalB2BProducts.emailMagicLinks,
          AdminPortalB2BProducts.oauthGoogle,
          AdminPortalB2BProducts.oauthMicrosoft,
          AdminPortalB2BProducts.password,
        ],
        allowedMfaAuthMethods: [B2BMFAProducts.smsOtp],
      },
    },
  },
  play: async (params) => {
    const { canvasElement } = params;
    const canvas = within(canvasElement);

    await FlowClickEdit.play(params);

    const primaryAuthButton = canvas.getByLabelText('Allow all primary auth methods');
    await userEvent.click(primaryAuthButton);

    await expect(canvas.queryByLabelText('Email Magic Links')).toBeInTheDocument();
    await expect(canvas.queryByLabelText('Single Sign-On')).not.toBeInTheDocument();
  },
} satisfies Story;

export const AllOrgSettingsUIConfig = {
  ...FlowClickEdit,
  play: async (params) => {
    const { canvasElement } = params;
    const canvas = within(canvasElement);

    await FlowClickEdit.play(params);

    const primaryAuthButton = canvas.getByLabelText('Allow all primary auth methods');
    await waitFor(() => userEvent.click(primaryAuthButton));

    await expect(canvas.queryByLabelText('Single Sign-On')).toBeInTheDocument();
  },
} satisfies Story;

export const FlowEditPrimaryAuthentication = {
  ...FlowClickEdit,
  play: async (params) => {
    const { canvasElement } = params;
    const canvas = within(canvasElement);

    await FlowClickEdit.play(params);

    const primaryAuthButton = canvas.getByLabelText('Allow all primary auth methods');
    await userEvent.click(primaryAuthButton);
    const saveButton = canvas.getByRole('button', { name: 'Save' });

    await waitFor(() => expect(saveButton).toBeDisabled());
    const alertText = canvas.getByText('Please select at least one primary authentication method.');
    await waitFor(() => expect(alertText).toBeVisible());

    const emailCheckbox = canvas.getByLabelText('Email Magic Links');
    await userEvent.click(emailCheckbox);

    await waitFor(() => expect(saveButton).toBeEnabled());
  },
} satisfies Story;

export const FlowEditSecondaryAuthentication = {
  ...FlowClickEdit,

  play: async (params) => {
    const { canvasElement } = params;
    const canvas = within(canvasElement);

    await FlowClickEdit.play(params);

    const primaryAuthButton = canvas.getByLabelText('Allow all secondary auth methods');
    await userEvent.click(primaryAuthButton);
    const saveButton = canvas.getByRole('button', { name: 'Save' });

    await waitFor(() => expect(saveButton).toBeDisabled());
    const alertText = canvas.getByText('Please select at least one secondary authentication method.');
    await waitFor(() => expect(alertText).toBeVisible());

    const smsOtpCheckbox = canvas.getByLabelText('SMS OTP');
    await userEvent.click(smsOtpCheckbox);

    await waitFor(() => expect(saveButton).toBeEnabled());
  },
} satisfies Story;

export const FlowEditAndSavePrimaryAuth = {
  ...FlowEditPrimaryAuthentication,
  parameters: {
    msw: {
      handlers: {
        b2bOrganizationMePut: http.put<
          never,
          B2BOrganizationsUpdateOptions,
          DataResponse<B2BOrganizationsUpdateResponse>
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        >('https://api.stytch.com/sdk/v1/b2b/organizations/me', async ({ request }: any) => {
          await delay(300);
          const body = await request.json();

          return HttpResponse.json({
            data: {
              organization: {
                ...organizationMeResponse,
                ...body,
              },
              request_id: 'request-id-test-896c625f-89a6-4a0d-8615-3dcbdf00314d',
              status_code: 200,
            },
          });
        }),
      },
    },
  },
  play: async (params) => {
    const { canvasElement } = params;
    const canvas = within(canvasElement);

    await FlowEditPrimaryAuthentication.play(params);
    const saveButton = canvas.getByRole('button', { name: 'Save' });
    await userEvent.click(saveButton);

    const body = canvasElement.ownerDocument.body;
    const modal = within(body);
    await expect(await modal.findByText('Save changes?'));
    await delay(50);
    const saveChangesButton = modal.getByRole('button', { name: 'Save changes' });
    await userEvent.click(saveChangesButton);

    const emailCheckbox = canvas.getByLabelText('Email Magic Links');
    await waitFor(() => expect(emailCheckbox).toBeChecked());
  },
} satisfies Story;
