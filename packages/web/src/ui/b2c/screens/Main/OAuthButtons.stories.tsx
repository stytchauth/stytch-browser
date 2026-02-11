import type { Meta, StoryObj } from '@storybook/react';
import { OAuthProviders } from '@stytch/core/public';
import { expect } from 'storybook/test';

import Container from '../../Container';
import { AppScreens } from '../../GlobalContextProvider';
import * as Products from '../../Products';

const meta = {
  component: Container,
  parameters: {
    stytch: {
      disableSnackbar: true,
      b2c: {
        initialState: {
          screen: AppScreens.Main,
        },
      },
    },
  },
} satisfies Meta<typeof Container>;

export default meta;

type Story = StoryObj<typeof meta>;

export const GoogleOnly = {
  parameters: {
    stytch: {
      b2c: {
        config: {
          products: [Products.oauth],
          oauthOptions: {
            providers: [{ type: OAuthProviders.Google }],
          },
        },
      },
    },
  },
  play: async ({ canvas }) => {
    await expect(await canvas.findByText('Continue with Google')).toBeInTheDocument();
  },
} satisfies Story;

export const AppleOnly = {
  parameters: {
    stytch: {
      b2c: {
        config: {
          products: [Products.oauth],
          oauthOptions: {
            providers: [{ type: OAuthProviders.Apple }],
          },
        },
      },
    },
  },
  play: async ({ canvas }) => {
    await expect(await canvas.findByText('Continue with Apple')).toBeInTheDocument();
  },
} satisfies Story;

export const MultipleProviders = {
  parameters: {
    stytch: {
      b2c: {
        config: {
          products: [Products.oauth],
          oauthOptions: {
            providers: [
              { type: OAuthProviders.Google },
              { type: OAuthProviders.Apple },
              { type: OAuthProviders.Microsoft },
              { type: OAuthProviders.Github },
            ],
          },
        },
      },
    },
  },
  play: async ({ canvas }) => {
    await expect(await canvas.findByText('Continue with Google')).toBeInTheDocument();
    await expect(await canvas.findByText('Continue with Apple')).toBeInTheDocument();
    await expect(await canvas.findByText('Continue with Microsoft')).toBeInTheDocument();
    await expect(await canvas.findByText('Continue with GitHub')).toBeInTheDocument();
  },
} satisfies Story;

export const SocialProviders = {
  parameters: {
    stytch: {
      b2c: {
        config: {
          products: [Products.oauth],
          oauthOptions: {
            providers: [
              { type: OAuthProviders.Google },
              { type: OAuthProviders.Facebook },
              { type: OAuthProviders.Discord },
              { type: OAuthProviders.Slack },
            ],
          },
        },
      },
    },
  },
  play: async ({ canvas }) => {
    await expect(await canvas.findByText('Continue with Google')).toBeInTheDocument();
    await expect(await canvas.findByText('Continue with Facebook')).toBeInTheDocument();
    await expect(await canvas.findByText('Continue with Discord')).toBeInTheDocument();
    await expect(await canvas.findByText('Continue with Slack')).toBeInTheDocument();
  },
} satisfies Story;

export const AllProviders = {
  parameters: {
    stytch: {
      b2c: {
        config: {
          products: [Products.oauth],
          oauthOptions: {
            providers: Object.values(OAuthProviders).map((type) => ({ type })),
          },
        },
      },
    },
  },
} satisfies Story;
