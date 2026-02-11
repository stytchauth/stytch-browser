import { SAMLConnection } from '@stytch/core/public';
import { MOCK_ORG_ID } from '@stytch/internal-mocks';

const fakeSamlConnection = {
  acs_url: 'https://test.stytch.com/v1/b2b/sso/callback/saml-connection-test-51861cbc-d3b9-428b-9761-227f5fb12be9',
  attribute_mapping: {
    email: 'email',
    full_name: 'name',
  },
  audience_uri: 'https://test.stytch.com/v1/b2b/sso/callback/saml-connection-test-51861cbc-d3b9-428b-9761-227f5fb12be9',
  // @ts-expect-error: present in response, but not in types
  alternative_audience_uri: '',
  connection_id: 'saml-connection-test-51861cbc-d3b9-428b-9761-227f5fb12be9',
  display_name: 'Example SAML Connection',
  idp_entity_id: 'https://idp.example.com/51861cbc-d3b9-428b-9761-227f5fb12be9',
  idp_sso_url: 'https://idp.example.com/51861cbc-d3b9-428b-9761-227f5fb12be9/sso/saml',
  organization_id: MOCK_ORG_ID,
  saml_connection_implicit_role_assignments: [
    {
      role_id: 'stytch_admin',
    },
  ],
  saml_group_implicit_role_assignments: [
    {
      role_id: 'sso_update',
      group: 'editors',
    },
    {
      role_id: 'sso_get',
      group: 'readers',
    },
  ],
  signing_certificates: [
    {
      certificate: '-----BEGIN CERTIFICATE-----\n...base64 blob...\n-----END CERTIFICATE',
      certificate_id: '',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
      expires_at: '2033-01-01T00:00:00Z',
      issuer: 'Stytch',
    },
  ],
  status: 'active',
  verification_certificates: [
    {
      certificate: '-----BEGIN CERTIFICATE-----\n...base64 blob...\n-----END CERTIFICATE',
      certificate_id: 'saml-verification-key-test-5ccbc642-9373-42b8-928f-c1646c868701',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
      expires_at: '2033-01-01T00:00:00Z',
      issuer: '',
    },
  ],
  identity_provider: 'generic',
  saml_encryption_private_keys: [
    {
      private_key_id: 'saml-encryption-key-test-5ccbc642-9373-42b8-928f-c1646c868701',
      private_key: '-----BEGIN PRIVATE KEY-----\n...base64 blob...\n-----END PRIVATE KEY-----',
      created_at: '2023-01-01T00:00:00Z',
    },
  ],
} satisfies SAMLConnection;

export const makeFakeSamlConnection = (connection: Partial<SAMLConnection> = {}): SAMLConnection => {
  return {
    ...fakeSamlConnection,
    ...connection,
  };
};
