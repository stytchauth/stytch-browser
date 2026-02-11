import type { Meta, StoryObj } from '@storybook/react';
import { makeFakeOidcConnection } from '../testUtils/makeFakeOidcConnection';
import { makeFakeSamlConnection } from '../testUtils/makeFakeSamlConnection';
import { SSONewConnectionConfigureScreen } from './SSONewConnectionConfigureScreen';

const meta = {
  component: SSONewConnectionConfigureScreen,
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const GenericSAML = {
  args: {
    connection: { ...makeFakeSamlConnection(), connectionType: 'saml' },
  },
} satisfies Story;

export const GenericOIDC = {
  args: {
    connection: { ...makeFakeOidcConnection(), connectionType: 'oidc' },
  },
} satisfies Story;

export const GoogleSAML = {
  args: {
    connection: { ...makeFakeSamlConnection(), connectionType: 'saml', identity_provider: 'google-workspace' },
  },
} satisfies Story;

export const OktaSAML = {
  args: {
    connection: { ...makeFakeSamlConnection(), connectionType: 'saml', identity_provider: 'okta' },
  },
} satisfies Story;

export const OktaOIDC = {
  args: {
    connection: { ...makeFakeOidcConnection(), connectionType: 'oidc', identity_provider: 'okta' },
  },
} satisfies Story;

export const MicrosoftSAML = {
  args: {
    connection: { ...makeFakeSamlConnection(), connectionType: 'saml', identity_provider: 'microsoft-entra' },
  },
} satisfies Story;

export const MicrosoftOIDC = {
  args: {
    connection: { ...makeFakeOidcConnection(), connectionType: 'oidc', identity_provider: 'microsoft-entra' },
  },
} satisfies Story;
