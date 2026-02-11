import { OIDCConnection } from '@stytch/core/public';
import { MOCK_ORG_ID } from '@stytch/internal-mocks';

const fakeOidcConnection = {
  organization_id: MOCK_ORG_ID,
  connection_id: 'oidc-connection-test-b6c714c2-7413-4b92-a0f1-97aa1085aeff',
  display_name: 'Example OIDC Connection',
  redirect_url: 'https://test.stytch.com/v1/b2b/sso/callback/oidc-connection-test-b6c714c2-7413-4b92-a0f1-97aa1085aeff',
  status: 'active',
  issuer: 'https://idp.example.com/',
  client_id: 's6BhdRkqt3',
  client_secret: 'SeiGwdj5lKkrEVgcEY3QNJXt6srxS3IK2Nwkar6mXD4=',
  authorization_url: 'https://idp.example.com/authorize',
  token_url: 'https://idp.example.com/oauth2/token',
  userinfo_url: 'https://idp.example.com/userinfo',
  jwks_url: 'https://idp.example.com/oauth2/jwks',
  identity_provider: 'generic',
  custom_scopes: 'openid email profile',
  attribute_mapping: {
    email: 'email',
    first_name: 'given_name',
    last_name: 'family_name',
  },
} satisfies OIDCConnection;

export const makeFakeOidcConnection = (connection: Partial<OIDCConnection> = {}): OIDCConnection => ({
  ...fakeOidcConnection,
  ...connection,
});
