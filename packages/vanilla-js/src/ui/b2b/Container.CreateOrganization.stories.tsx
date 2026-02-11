import type { Meta, Parameters, StoryObj } from '@storybook/react';
import { expect } from '@storybook/test';
import { B2BDiscoveryOrganizationsCreateOptions, B2BDiscoveryOrganizationsCreateResponse } from '@stytch/core/public';
import { produce } from 'immer';
import { HttpResponse, delay, http } from 'msw';
import {
  DataResponse,
  MOCK_STORYBOOK_BOOTSTRAP_DATA,
  b2bAuthenticateResponseSuccess,
} from '../../../.storybook/handlers';
import Container from './Container';
import ContainerMeta from './Container.stories';
import { _DiscoveryMenu, NoResults } from './Container.DiscoveryMenu.stories';

const meta = {
  ...ContainerMeta,
  title: 'b2b/Container/Create Organization',
  parameters: {
    ...ContainerMeta.parameters,
  },
} satisfies Meta<typeof Container>;

export default meta;

type Story = StoryObj<typeof meta>;

export const EnabledWithDiscoveredOrgs = {
  ..._DiscoveryMenu,
  play: async ({ canvas }) => {
    await expect(await canvas.findByText('Select an organization to continue')).toBeInTheDocument();
    await expect(await canvas.findByRole('button', { name: 'Create an organization' })).toBeInTheDocument();
  },
} satisfies Story;

export const DisabledLocallyWithDiscoveredOrgs = {
  ...EnabledWithDiscoveredOrgs,
  parameters: {
    ...EnabledWithDiscoveredOrgs.parameters,
    stytch: {
      ...EnabledWithDiscoveredOrgs.parameters.stytch,
      b2b: {
        ...EnabledWithDiscoveredOrgs.parameters.stytch.b2b,
        config: {
          disableCreateOrganization: true,
        },
      },
    },
  },
  play: async ({ canvas }) => {
    await expect(await canvas.findByText('Select an organization to continue')).toBeInTheDocument();
    // Arbitrary wait to make sure the button does not appear
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await expect(await canvas.queryByRole('button', { name: 'Create an organization' })).not.toBeInTheDocument();
  },
} satisfies Story;

export const DisabledRemotelyWithDiscoveredOrgs = {
  ...EnabledWithDiscoveredOrgs,
  parameters: {
    ...EnabledWithDiscoveredOrgs.parameters,
    msw: {
      handlers: {
        bootstrap: http.get('https://api.stytch.com/sdk/v1/projects/bootstrap/public-token-fake-public-token', () => {
          return HttpResponse.json(
            {
              data: { ...MOCK_STORYBOOK_BOOTSTRAP_DATA, create_organization_enabled: false },
            },
            { status: 200 },
          );
        }),
      },
    },
  },
  play: DisabledLocallyWithDiscoveredOrgs.play,
} satisfies Story;

export const EnabledWithNoOrgs = {
  ...NoResults,
  parameters: {
    ...NoResults.parameters,
  },
  play: async ({ canvas }) => {
    // Arbitrary wait to avoid matching transient content
    await new Promise((resolve) => setTimeout(resolve, 1000));

    await expect(await canvas.findByText('Create an organization to get started')).toBeInTheDocument();
    await expect(await canvas.findByRole('button', { name: 'Create an organization' })).toBeInTheDocument();
  },
} satisfies Story;

export const DisabledLocallyWithNoOrgs = {
  ...EnabledWithNoOrgs,
  parameters: {
    ...EnabledWithNoOrgs.parameters,
    stytch: {
      ...EnabledWithNoOrgs.parameters.stytch,
      b2b: {
        ...EnabledWithNoOrgs.parameters.stytch.b2b,
        config: DisabledLocallyWithDiscoveredOrgs.parameters.stytch.b2b.config,
      },
    },
  },
  play: async ({ canvas }) => {
    // Arbitrary wait to avoid matching transient content
    await new Promise((resolve) => setTimeout(resolve, 1000));

    await expect(
      await canvas.findByText('example@stytch.com does not belong to any organizations.'),
    ).toBeInTheDocument();
    await expect(await canvas.findByRole('button', { name: 'Try a different email address' })).toBeInTheDocument();
  },
} satisfies Story;

export const DisabledRemotelyWithNoOrgs = {
  ...EnabledWithNoOrgs,
  parameters: {
    ...EnabledWithNoOrgs.parameters,
    msw: DisabledRemotelyWithDiscoveredOrgs.parameters.msw,
  },
  play: DisabledLocallyWithNoOrgs.play,
} satisfies Story;

export const CreateWhenNoOrgs = {
  ...DisabledLocallyWithNoOrgs,
  parameters: produce<Parameters>(DisabledLocallyWithNoOrgs.parameters, (draft) => {
    draft.stytch.b2b.config.directCreateOrganizationForNoMembership = true;

    draft.msw ??= {};
    draft.msw.handlers ??= {};
    draft.msw.handlers.b2bDiscoveryOrganizationsCreate = http.post<
      never,
      B2BDiscoveryOrganizationsCreateOptions,
      DataResponse<B2BDiscoveryOrganizationsCreateResponse>
    >('https://api.stytch.com/sdk/v1/b2b/discovery/organizations/create', async () => {
      await delay(300);

      return HttpResponse.json({
        data: { ...b2bAuthenticateResponseSuccess, primary_required: null },
      });
    });
  }),
  play: async ({ canvas }) => {
    await expect(await canvas.findByText('You have successfully logged in.')).toBeInTheDocument();
  },
} satisfies Story;
