import type { Meta, StoryObj } from '@storybook/react-vite';
import { Organization, ResponseCommon } from '@stytch/core/public';
import { http, HttpResponse } from 'msw';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { DataResponse, makeB2BSessionAuthenticateHandler, organizationMeResponse } from '../../../.storybook/handlers';
import { AdminPortalOrgUIConfig } from '../settings/AdminPortalOrgSettingsContainer';
import { MemberDetailsScreen } from './MemberDetailsScreen';

const meta = {
  component: MemberDetailsScreen,
  args: {
    memberId: 'member-id-1',
  },
  parameters: {
    adminPortal: true,
    msw: {
      handlers: {
        b2bSessionAuthenticate: makeB2BSessionAuthenticateHandler({
          roles: ['stytch_admin', 'stytch_member'],
          memberId: 'member-id-1',
        }),
      },
    },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const _MemberDetailsScreen = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitFor(() => expect(canvas.getByText('Member 1')).toBeInTheDocument());

    await waitFor(() => expect(canvas.getByText('Deactivate Member')).toBeInTheDocument());
    await expect(
      canvas.getByText(
        'All of the Member’s authentication factors will be deleted and all active sessions will be revoked. You will be able to reactivate the Member and restore their email, but other authentication factors and Role assignments will not be restored.',
      ),
    ).toBeInTheDocument();

    await expect(
      await canvas.findByText(
        'Require MFA for this Member. When enabled, the Member will be required to set up and use MFA on each login.',
      ),
    ).toBeInTheDocument();
    await expect(await canvas.queryByText('MFA is required for all members.')).not.toBeInTheDocument();
  },
} satisfies Story;

export const SelfPermission = {
  parameters: {
    msw: {
      handlers: {
        b2bSessionAuthenticate: makeB2BSessionAuthenticateHandler({
          roles: ['self'],
          memberId: 'member-id-1',
        }),
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitFor(() => expect(canvas.getByText('Member 1')).toBeInTheDocument());

    await waitFor(() => expect(canvas.getByText('Deactivate Member')).toBeInTheDocument());
    await expect(
      canvas.getByText(
        'All of the Member’s authentication factors will be deleted and all active sessions will be revoked. You will be able to reactivate the Member and restore their email, but other authentication factors and Role assignments will not be restored.',
      ),
    ).toBeInTheDocument();
  },
} satisfies Story;

export const NotSelfPermission = {
  args: {
    memberId: 'member-id-2',
  },
  parameters: {
    msw: {
      handlers: {
        b2bSessionAuthenticate: makeB2BSessionAuthenticateHandler({
          roles: ['stytch_member'],
          memberId: 'member-id-1',
        }),
      },
    },
  },
} satisfies Story;

export const Deactivated = {
  args: {
    memberId: 'member-id-0',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitFor(() => expect(canvas.getAllByText('Member 0')).toHaveLength(2));
    await expect(canvas.getByText('Deactivated')).toBeInTheDocument();

    // wait an arbitrary amount of time to ensure the Reactivate button does not appear
    await sleep(1000);

    await expect(canvas.queryByText('Reactivate Member')).not.toBeInTheDocument();
  },
} satisfies Story;

export const DeactivatedCanReactivate = {
  args: {
    memberId: 'member-id-11',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitFor(() => expect(canvas.getAllByText('Member 11')).toHaveLength(2));
    await expect(canvas.getByText('Deactivated')).toBeInTheDocument();

    await waitFor(() => expect(canvas.getByText('Reactivate Member')).toBeInTheDocument());
    await expect(
      canvas.getByText('Reactivating the Member will allow them to log in under their previous account.'),
    ).toBeInTheDocument();
  },
} satisfies Story;

export const Invited = {
  args: {
    memberId: 'member-id-4',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitFor(() => expect(canvas.getAllByText('Member 4')).toHaveLength(2));
    await expect(canvas.getByText('Invited')).toBeInTheDocument();

    await waitFor(() => expect(canvas.getByText('Revoke invite')).toBeInTheDocument());
    await expect(
      canvas.getByText(
        'The invited Member will be deleted and cannot be reactivated. Resending an invite to this email will create a new Member record.',
      ),
    ).toBeInTheDocument();
  },
} satisfies Story;

export const Pending = {
  args: {
    memberId: 'member-id-7',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitFor(() => expect(canvas.getAllByText('Member 7')).toHaveLength(2));
    await expect(canvas.getByText('Pending')).toBeInTheDocument();

    await waitFor(() => expect(canvas.getByText('Deactivate Member')).toBeInTheDocument());
    await expect(
      canvas.getByText(
        'All of the Member’s authentication factors will be deleted and all active sessions will be revoked. The Member’s email is not verified, so you will not be able to reactivate the Member or restore their email.',
      ),
    ).toBeInTheDocument();
  },
} satisfies Story;

export const ActiveUnverifiedEmail = {
  args: {
    memberId: 'member-id-17',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitFor(() => expect(canvas.getAllByText('Member 17')).toHaveLength(2));

    await waitFor(() => expect(canvas.getByText('Deactivate Member')).toBeInTheDocument());
    await expect(
      canvas.getByText(
        'All of the Member’s authentication factors will be deleted and all active sessions will be revoked. The Member’s email is not verified, so you will not be able to reactivate the Member or restore their email.',
      ),
    ).toBeInTheDocument();
  },
} satisfies Story;

export const EditDetails = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitFor(() => expect(canvas.getByText('Member 1')).toBeInTheDocument());

    const detailsHeading = await canvas.getByText('Details');
    await expect(detailsHeading).toBeInTheDocument();

    const editButton = await waitFor(() => within(detailsHeading.closest('div')!).getByText('Edit'));
    await expect(editButton).toBeEnabled();

    await userEvent.click(editButton);
  },
} satisfies Story;

export const EnrolledMember = {
  args: {
    memberId: 'member-id-89',
  },
} satisfies Story;

export const CustomRoleDisplay = {
  ..._MemberDetailsScreen,
  parameters: {
    stytch: {
      adminPortalConfig: {
        getRoleDisplayName: (role) => `!!${role.role_id.toUpperCase()}!!`,
        getRoleDescription: (role) => `!!${role.description.toUpperCase()}!!`,
      } satisfies AdminPortalOrgUIConfig,
    },
  },
} satisfies Story;

export const CustomRoleSortOrderDisplay = {
  parameters: {
    stytch: {
      adminPortalConfig: {
        getRoleSortOrder: () => ['sso_delete', 'self', 'organization_update.settings.default-sso-connection'],
      },
    },
  },
} satisfies Story;

export const OrgRequiresMfa = {
  parameters: {
    msw: {
      handlers: {
        b2bOrganizationMe: http.get<never, never, DataResponse<{ organization: Organization } & ResponseCommon>>(
          'https://api.stytch.com/sdk/v1/b2b/organizations/me',
          () => {
            return HttpResponse.json({
              data: {
                organization: { ...organizationMeResponse, mfa_policy: 'REQUIRED_FOR_ALL' },
                request_id: 'request-id-test-896c625f-89a6-4a0d-8615-3dcbdf00314d',
                status_code: 200,
              },
            });
          },
        ),
      },
    },
  },
  play: async ({ canvas }) => {
    await expect(
      await canvas.queryByText(
        'Require MFA for this Member. When enabled, the Member will be required to set up and use MFA on each login.',
      ),
    ).not.toBeInTheDocument();
    await expect(await canvas.findByText('MFA is required for all members.')).toBeInTheDocument();
  },
} satisfies Story;
