import type { Meta, StoryObj } from '@storybook/react';

import { makeFakeScimConnectionWithBearerToken } from '../testUtils/makeFakeScimConnection';
import { SCIMNewConnectionConfigureScreen } from './SCIMNewConnectionConfigureScreen';

const meta = {
  component: SCIMNewConnectionConfigureScreen,
  parameters: {
    adminPortal: true,
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Generic = {
  args: {
    connection: makeFakeScimConnectionWithBearerToken({
      identity_provider: 'generic',
    }),
  },
} satisfies Story;

export const Okta = {
  args: {
    connection: makeFakeScimConnectionWithBearerToken({
      identity_provider: 'okta',
    }),
  },
} satisfies Story;

export const Entra = {
  args: {
    connection: makeFakeScimConnectionWithBearerToken({
      identity_provider: 'microsoft-entra',
    }),
  },
} satisfies Story;

export const CyberArk = {
  args: {
    connection: makeFakeScimConnectionWithBearerToken({
      identity_provider: 'cyberark',
    }),
  },
} satisfies Story;

export const JumpCloud = {
  args: {
    connection: makeFakeScimConnectionWithBearerToken({
      identity_provider: 'jumpcloud',
    }),
  },
} satisfies Story;

export const OneLogin = {
  args: {
    connection: makeFakeScimConnectionWithBearerToken({
      identity_provider: 'onelogin',
    }),
  },
} satisfies Story;

export const PingFederate = {
  args: {
    connection: makeFakeScimConnectionWithBearerToken({
      identity_provider: 'pingfederate',
    }),
  },
} satisfies Story;

export const Rippling = {
  args: {
    connection: makeFakeScimConnectionWithBearerToken({
      identity_provider: 'rippling',
    }),
  },
} satisfies Story;
