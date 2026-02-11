import type { Meta, StoryObj } from '@storybook/react';
import { AuthFlowType, Member, Organization } from '@stytch/core/public';
import { MOCK_EMAIL, MOCK_MEMBER } from '@stytch/internal-mocks';
import { produce } from 'immer';
import { expect, userEvent } from 'storybook/test';

import { MOCK_ORGANIZATION } from '../../../testUtils';
import Container from '../Container';
import ContainerMeta from '../Container.stories';
import { DEFAULT_STATE } from '../GlobalContextProvider';
import { reducer } from '../reducer';

const meta = {
  ...ContainerMeta,
  title: 'b2b/Container/Discovery Menu',
  parameters: {
    ...ContainerMeta.parameters,
  },
} satisfies Meta<typeof Container>;

export default meta;

type Story = StoryObj<typeof meta>;

export const _DiscoveryMenu = {
  parameters: {
    stytch: {
      b2b: {
        config: {
          authFlowType: AuthFlowType.Discovery,
        },
        initialState: reducer(
          { ...DEFAULT_STATE, flowState: { type: AuthFlowType.Discovery, organization: null } },
          {
            type: 'set_discovery_state',
            email: MOCK_EMAIL,
            discoveredOrganizations: [
              {
                member_authenticated: false,
                organization: {
                  ...(MOCK_ORGANIZATION as unknown as Organization),
                  organization_name: 'Already a member',
                  organization_logo_url: '/stytch.jpg',
                },
                membership: {
                  type: 'active_member',
                  details: null,
                  member: MOCK_MEMBER as unknown as Member,
                },
                mfa_required: null,
                primary_required: null,
              },
              {
                member_authenticated: false,
                organization: {
                  ...(MOCK_ORGANIZATION as unknown as Organization),
                  organization_name: 'Can join by email',
                },
                membership: {
                  type: 'eligible_to_join_by_email_domain',
                  details: { domain: 'stytch.com' },
                  member: null,
                },
                mfa_required: null,
                primary_required: {
                  allowed_auth_methods: ['google_oauth', 'magic_link', 'email_otp'],
                },
              },
              {
                member_authenticated: false,
                organization: {
                  ...(MOCK_ORGANIZATION as unknown as Organization),
                  organization_name: 'Can join by oauth',
                },
                membership: {
                  type: 'eligible_to_join_by_oauth_tenant',
                  details: { provider: 'hubspot', tenant: 'fake-tenant' },
                  member: null,
                },
                mfa_required: null,
                primary_required: {
                  allowed_auth_methods: [],
                },
              },
              {
                member_authenticated: false,
                organization: {
                  ...(MOCK_ORGANIZATION as unknown as Organization),
                  organization_name: 'Invited to join',
                },
                membership: {
                  type: 'invited_member',
                  details: null,
                  member: MOCK_MEMBER as unknown as Member,
                },
                mfa_required: null,
                primary_required: null,
              },
              {
                member_authenticated: false,
                organization: {
                  ...(MOCK_ORGANIZATION as unknown as Organization),
                  organization_name: 'Member pending',
                },
                membership: {
                  type: 'pending_member',
                  details: null,
                  member: MOCK_MEMBER as unknown as Member,
                },
                mfa_required: null,
                primary_required: null,
              },
              {
                member_authenticated: false,
                organization: {
                  ...(MOCK_ORGANIZATION as unknown as Organization),
                  organization_name: 'IST not found',
                  organization_id: 'ist-not-found',
                },
                membership: {
                  type: 'active_member',
                  details: null,
                  member: MOCK_MEMBER as unknown as Member,
                },
                mfa_required: null,
                primary_required: null,
              },
            ],
          },
        ),
      },
    },
  },
} satisfies Story;

export const WithLongNames = {
  ..._DiscoveryMenu,
  parameters: {
    ..._DiscoveryMenu.parameters,
    stytch: produce(_DiscoveryMenu.parameters.stytch, (draft) => {
      draft.b2b.initialState.formState.discoveryState.discoveredOrganizations =
        draft.b2b.initialState.formState.discoveryState.discoveredOrganizations.map((org) => {
          org.organization.organization_name = `${org.organization.organization_name} `.repeat(3).trim();
          return org;
        });
    }),
  },
};

export const WithLongUnbrokenNames = {
  ...WithLongNames,
  parameters: {
    ...WithLongNames.parameters,
    stytch: produce(WithLongNames.parameters.stytch, (draft) => {
      draft.b2b.initialState.formState.discoveryState.discoveredOrganizations =
        draft.b2b.initialState.formState.discoveryState.discoveredOrganizations.map((org) => {
          org.organization.organization_name = org.organization.organization_name.repeat(2).replaceAll(' ', '');
          return org;
        });
    }),
  },
};
export const NoResults = {
  ..._DiscoveryMenu,
  parameters: {
    ..._DiscoveryMenu.parameters,
    stytch: produce(_DiscoveryMenu.parameters.stytch, (draft) => {
      draft.b2b.initialState.formState.discoveryState.discoveredOrganizations = [];
    }),
  },
};

export const Error = {
  ..._DiscoveryMenu,
  play: async ({ canvas }) => {
    await userEvent.click(await canvas.findByText('IST not found'));
    await expect(await canvas.findByText('Looks like there was an error!')).toBeInTheDocument();
  },
} satisfies Story;

export const ErrorBack = {
  ...Error,
  play: async (params) => {
    await Error.play(params);

    const backButton = params.canvas.getByRole('button', { name: 'Go back' });
    await expect(backButton).toBeInTheDocument();
    await userEvent.click(backButton);
  },
} satisfies Story;
