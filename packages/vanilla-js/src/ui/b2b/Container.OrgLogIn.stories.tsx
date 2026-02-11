import type { Meta, StoryObj } from '@storybook/react';
import { expect, waitFor } from '@storybook/test';
import Container from './Container';
import ContainerMeta from './Container.stories';

const meta = {
  ...ContainerMeta,
  title: 'b2b/Container/Org Login',
} satisfies Meta<typeof Container>;

export default meta;

type Story = StoryObj<typeof meta>;

export const ConfiguredSlug = {
  parameters: {
    stytch: {
      b2b: {
        config: {
          organizationSlug: 'no-sso-connections',
        },
      },
    },
  },
  play: async ({ canvas }) => {
    await waitFor(() => expect(canvas.getByText('Continue to Example Org Inc.')).toBeInTheDocument());
  },
} satisfies Story;

export const ConfiguredSlugNotFound = {
  parameters: {
    stytch: {
      b2b: {
        config: {
          organizationSlug: 'no-such-org',
        },
      },
    },
  },
  play: async ({ canvas }) => {
    await waitFor(() =>
      expect(
        canvas.getByText(
          'The organization you are looking for could not be found. If you think this is a mistake, contact your admin.',
        ),
      ).toBeInTheDocument(),
    );
    await expect(canvas.queryByLabelText('Back')).not.toBeInTheDocument();
  },
} satisfies Story;

export const ConfiguredSlugNetworkError = {
  parameters: {
    stytch: {
      b2b: {
        config: {
          organizationSlug: 'error-org',
        },
      },
    },
  },
} satisfies Story;

export const WithOrgLogo = {
  parameters: {
    stytch: {
      b2b: {
        config: {
          organizationSlug: 'org-logo',
        },
      },
    },
  },
} satisfies Story;

export const CustomCopy = {
  ...ConfiguredSlug,
  globals: {
    locale: 'custom',
  },
  play: async ({ canvas }) => {
    await expect(await canvas.findByText('Proceed to your Example Org Inc. account')).toBeInTheDocument();
  },
} satisfies Story;
