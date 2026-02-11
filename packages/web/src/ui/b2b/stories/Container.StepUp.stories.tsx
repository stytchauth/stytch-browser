import type { Meta, StoryObj } from '@storybook/react';
import { B2BAuthenticateResponseWithMFA, B2BOAuthProviders, Member, Organization } from '@stytch/core/public';
import { MOCK_EMAIL, MOCK_MEMBER } from '@stytch/internal-mocks';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { MOCK_ORGANIZATION } from '../../../testUtils';
import { oauth } from '../B2BProducts';
import Container from '../Container';
import ContainerMeta, { OrgLogin } from '../Container.stories';
import { DEFAULT_STATE } from '../GlobalContextProvider';
import { reducer } from '../reducer';
import { _DiscoveryMenu } from './Container.DiscoveryMenu.stories';

const meta = {
  ...ContainerMeta,
  title: 'b2b/Container/StepUp',
  parameters: {
    ...ContainerMeta.parameters,
  },
} satisfies Meta<typeof Container>;

export default meta;

type Story = StoryObj<typeof meta>;

export const OrgStepUp = {
  ...OrgLogin,
  parameters: {
    ...OrgLogin.parameters,
    stytch: {
      ...OrgLogin.parameters.stytch,
      b2b: {
        ...OrgLogin.parameters.stytch.b2b,
        initialState: reducer(DEFAULT_STATE, {
          type: 'primary_authenticate_success',
          response: {
            member_authenticated: false,
            member_session: null,
            member: {
              ...MOCK_MEMBER,
              email_address: MOCK_EMAIL,
              email_address_verified: false,
              member_password_id: '',
            } as unknown as Member,
            organization: MOCK_ORGANIZATION as unknown as Organization,
            primary_required: {
              allowed_auth_methods: ['google_oauth', 'magic_link', 'password'],
            },
          } as B2BAuthenticateResponseWithMFA,
          includedMfaMethods: undefined,
        }),
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitFor(() => expect(canvas.getByText('Verify your email')).toBeInTheDocument());

    await expect(canvas.queryByText('Continue with email')).not.toBeInTheDocument();
    await expect(canvas.getByText('Email me a link')).toBeInTheDocument();
    await expect(canvas.queryByText('Use a password instead')).toBeInTheDocument();
    await expect(canvas.getByText('Continue with Google')).toBeInTheDocument();
    await expect(canvas.queryByText('Continue with Microsoft')).not.toBeInTheDocument();
    await expect(canvas.queryByText('Continue with HubSpot')).not.toBeInTheDocument();
    await expect(canvas.queryByText('Continue with Slack')).not.toBeInTheDocument();
    await expect(canvas.queryByText('Continue with GitHub')).not.toBeInTheDocument();
    await expect(canvas.queryByText('Continue with Test Okta Provider')).not.toBeInTheDocument();

    await expect(canvas.queryByPlaceholderText('example@email.com')).not.toBeInTheDocument();
  },
} satisfies Story;

export const PostDiscoveryStepUp = {
  ..._DiscoveryMenu,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitFor(() => expect(canvas.getByText('Select an organization to continue')).toBeInTheDocument());

    await userEvent.click(canvas.getByRole('button', { name: /Can join by email/ }));

    await waitFor(() => expect(canvas.getByText('Continue to Can join by email')).toBeInTheDocument());

    await expect(canvas.queryByText('Continue with email')).not.toBeInTheDocument();
    await expect(canvas.getByText('Email me a link')).toBeInTheDocument();
    await expect(canvas.queryByText('Email me a code')).not.toBeInTheDocument();
    await expect(canvas.queryByText('Use a password instead')).not.toBeInTheDocument();
    await expect(canvas.getByText('Continue with Google')).toBeInTheDocument();
    await expect(canvas.queryByText('Continue with Microsoft')).not.toBeInTheDocument();
    await expect(canvas.queryByText('Continue with HubSpot')).not.toBeInTheDocument();
    await expect(canvas.queryByText('Continue with Slack')).not.toBeInTheDocument();
    await expect(canvas.queryByText('Continue with GitHub')).not.toBeInTheDocument();
    await expect(canvas.queryByText('Continue with Test Okta Provider')).not.toBeInTheDocument();

    await expect(canvas.queryByPlaceholderText('example@email.com')).not.toBeInTheDocument();
  },
} satisfies Story;

export const PostDiscoveryNoAvailableMethods = {
  ..._DiscoveryMenu,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitFor(() => expect(canvas.getByText('Select an organization to continue')).toBeInTheDocument());

    await userEvent.click(canvas.getByRole('button', { name: /Can join by oauth/ }));

    await waitFor(() =>
      expect(
        canvas.getByText(
          "Unable to join due to Can join by oauth's authentication policy. Please contact your admin for more information.",
        ),
      ).toBeInTheDocument(),
    );
  },
} satisfies Story;

export const CreateOrgStepUp = {
  ..._DiscoveryMenu,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitFor(() => expect(canvas.getByText('Select an organization to continue')).toBeInTheDocument());

    await waitFor(() => expect(canvas.getByText('Create an organization')).toBeInTheDocument());
    await userEvent.click(canvas.getByRole('button', { name: 'Create an organization' }));

    await waitFor(() => expect(canvas.getByText('Verify your email')).toBeInTheDocument());

    await expect(canvas.queryByText('Continue with email')).not.toBeInTheDocument();
    await expect(canvas.getByText('Email me a link')).toBeInTheDocument();
    await expect(canvas.queryByText('Use a password instead')).toBeInTheDocument();
    await expect(canvas.getByText('Continue with Google')).toBeInTheDocument();
    await expect(canvas.getByText('Continue with Microsoft')).toBeInTheDocument();
    await expect(canvas.queryByText('Continue with HubSpot')).not.toBeInTheDocument();
    await expect(canvas.queryByText('Continue with Slack')).not.toBeInTheDocument();
    await expect(canvas.queryByText('Continue with GitHub')).not.toBeInTheDocument();
    await expect(canvas.queryByText('Continue with Test Okta Provider')).not.toBeInTheDocument();

    await expect(canvas.queryByPlaceholderText('example@email.com')).not.toBeInTheDocument();
  },
} satisfies Story;

export const StepUpWithPassword = {
  ...OrgLogin,
  parameters: {
    ...OrgLogin.parameters,
    stytch: {
      ...OrgLogin.parameters.stytch,
      b2b: {
        ...OrgLogin.parameters.stytch.b2b,
        initialState: reducer(DEFAULT_STATE, {
          type: 'primary_authenticate_success',
          response: {
            member_authenticated: false,
            member_session: null,
            member: {
              ...MOCK_MEMBER,
              email_address: MOCK_EMAIL,
              email_address_verified: false,
              member_password_id: 'password_id',
            } as unknown as Member,
            organization: MOCK_ORGANIZATION as unknown as Organization,
            primary_required: {
              allowed_auth_methods: ['google_oauth', 'magic_link', 'password'],
            },
          } as B2BAuthenticateResponseWithMFA,
          includedMfaMethods: undefined,
        }),
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitFor(() => expect(canvas.getByText('Verify your email')).toBeInTheDocument());

    await expect(canvas.queryByText('Continue with email')).not.toBeInTheDocument();
    await expect(canvas.getByText('Email me a link')).toBeInTheDocument();
    await expect(canvas.getByText('Use a password instead')).toBeInTheDocument();
    await expect(canvas.getByText('Continue with Google')).toBeInTheDocument();
    await expect(canvas.queryByText('Continue with Microsoft')).not.toBeInTheDocument();
    await expect(canvas.queryByText('Continue with HubSpot')).not.toBeInTheDocument();
    await expect(canvas.queryByText('Continue with Slack')).not.toBeInTheDocument();
    await expect(canvas.queryByText('Continue with GitHub')).not.toBeInTheDocument();
    await expect(canvas.queryByText('Continue with Test Okta Provider')).not.toBeInTheDocument();

    await expect(canvas.queryByPlaceholderText('example@email.com')).not.toBeInTheDocument();
  },
} satisfies Story;

export const StepUpWithPasswordForm = {
  ...StepUpWithPassword,
  play: async (params) => {
    await StepUpWithPassword.play(params);

    const canvas = within(params.canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: 'Use a password instead' }));

    await waitFor(() => expect(canvas.getByText('Log in with email and password')).toBeInTheDocument());

    await expect(canvas.getByPlaceholderText('example@email.com')).toBeEnabled();
    await expect(canvas.getByPlaceholderText('example@email.com')).toHaveValue(MOCK_EMAIL);
  },
} satisfies Story;

export const FallbackMethodsAllAllowed = {
  ...OrgLogin,
  parameters: {
    ...OrgLogin.parameters,
    stytch: {
      ...OrgLogin.parameters.stytch,
      b2b: {
        ...OrgLogin.parameters.stytch.b2b,
        config: {
          products: [oauth],
          oauthOptions: { providers: [B2BOAuthProviders.HubSpot] },
        },
        initialState: reducer(DEFAULT_STATE, {
          type: 'primary_authenticate_success',
          response: {
            member_authenticated: false,
            member_session: null,
            member: {
              ...MOCK_MEMBER,
              email_address: MOCK_EMAIL,
              email_address_verified: false,
              member_password_id: '',
            } as unknown as Member,
            organization: { ...(MOCK_ORGANIZATION as unknown as Organization), auth_methods: 'ALL_ALLOWED' },
            primary_required: {
              allowed_auth_methods: ['google_oauth', 'microsoft_oauth', 'magic_link'],
            },
          } as B2BAuthenticateResponseWithMFA,
          includedMfaMethods: undefined,
        }),
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitFor(() => expect(canvas.getByText('Verify your email')).toBeInTheDocument());

    await expect(canvas.queryByText('Continue with email')).not.toBeInTheDocument();
    await expect(canvas.getByText('Email me a link')).toBeInTheDocument();
    await expect(canvas.queryByText('Use a password instead')).not.toBeInTheDocument();
    await expect(canvas.queryByText('Continue with Google')).not.toBeInTheDocument();
    await expect(canvas.queryByText('Continue with Microsoft')).not.toBeInTheDocument();
    await expect(canvas.queryByText('Continue with HubSpot')).not.toBeInTheDocument();
    await expect(canvas.queryByText('Continue with Slack')).not.toBeInTheDocument();
    await expect(canvas.queryByText('Continue with GitHub')).not.toBeInTheDocument();
    await expect(canvas.queryByText('Continue with Test Okta Provider')).not.toBeInTheDocument();
  },
} satisfies Story;

export const FallbackMethodsOrgRestricted = {
  ...OrgLogin,
  parameters: {
    ...OrgLogin.parameters,
    stytch: {
      ...OrgLogin.parameters.stytch,
      b2b: {
        ...OrgLogin.parameters.stytch.b2b,
        config: {
          products: [oauth],
          oauthOptions: { providers: [B2BOAuthProviders.HubSpot] },
        },
        initialState: reducer(DEFAULT_STATE, {
          type: 'primary_authenticate_success',
          response: {
            member_authenticated: false,
            member_session: null,
            member: {
              ...MOCK_MEMBER,
              email_address: MOCK_EMAIL,
              email_address_verified: false,
              member_password_id: '',
            } as unknown as Member,
            organization: { ...(MOCK_ORGANIZATION as unknown as Organization), auth_methods: 'RESTRICTED' },
            primary_required: {
              allowed_auth_methods: ['google_oauth', 'microsoft_oauth', 'magic_link'],
            },
          } as B2BAuthenticateResponseWithMFA,
          includedMfaMethods: undefined,
        }),
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitFor(() => expect(canvas.getByText('Verify your email')).toBeInTheDocument());

    await expect(canvas.queryByText('Continue with email')).not.toBeInTheDocument();
    await expect(canvas.getByText('Email me a link')).toBeInTheDocument();
    await expect(canvas.queryByText('Use a password instead')).not.toBeInTheDocument();
    await expect(canvas.getByText('Continue with Google')).toBeInTheDocument();
    await expect(canvas.getByText('Continue with Microsoft')).toBeInTheDocument();
    await expect(canvas.queryByText('Continue with HubSpot')).not.toBeInTheDocument();
    await expect(canvas.queryByText('Continue with Slack')).not.toBeInTheDocument();
    await expect(canvas.queryByText('Continue with GitHub')).not.toBeInTheDocument();
    await expect(canvas.queryByText('Continue with Test Okta Provider')).not.toBeInTheDocument();
  },
} satisfies Story;
