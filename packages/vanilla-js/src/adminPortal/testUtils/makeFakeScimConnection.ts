import { MOCK_ORG_ID } from '@stytch/internal-mocks';
import { SCIMConnection, SCIMConnectionWithBearerToken, SCIMConnectionWithNextBearerToken } from '@stytch/core/public';

const fakeScimConnection = {
  organization_id: MOCK_ORG_ID,
  connection_id: 'scim-connection-test-cdd5415a-c470-42be-8369-5c90cf7762dc',
  status: 'active',
  display_name: 'SCIM test connection',
  identity_provider: '',
  base_url: 'https://test.stytch.com/v1/b2b/scim/scim-connection-test-cdd5415a-c470-42be-8369-5c90cf7762dc',
  bearer_token_last_four: 'sdko',
  bearer_token_expires_at: '2029-03-20T21:28:28Z',
  bearer_token: '9LmcAfUxGGMSNzfROGY762wTD3A6DQsD3hmxbrAJaEjTsdko',
  scim_group_implicit_role_assignments: [
    {
      role_id: 'stytch_admin',
      group_id: 'scim_group_id0',
    },
    {
      role_id: 'sso_get',
      group_id: 'scim_group_id1',
    },
    {
      role_id: 'stytch_admin',
      group_id: 'scim_group_id1',
    },
  ],
} as SCIMConnection;

const fakeScimConnectionWithBearerToken = {
  ...fakeScimConnection,
  bearer_token: '9LmcAfUxGGMSNzfROGY762wTD3A6DQsD3hmxbrAJaEjTsdko',
} as SCIMConnectionWithBearerToken;

const fakeScimConnectionWithNextBearerToken = {
  ...fakeScimConnection,
  next_bearer_token: '8TqbGcJyFFLSNveQPGZ861xSE2B7CPtC2gnyasAIbDiUrcjn',
  next_bearer_token_expires_at: '2030-03-20T21:28:28Z',
} as SCIMConnectionWithNextBearerToken;

export const makeFakeScimConnection = (connection: Partial<SCIMConnection> = {}): SCIMConnection => {
  return {
    ...fakeScimConnection,
    ...connection,
  };
};

export const makeFakeScimConnectionWithBearerToken = (
  connection: Partial<SCIMConnectionWithBearerToken> = {},
): SCIMConnectionWithBearerToken => {
  return {
    ...fakeScimConnectionWithBearerToken,
    ...connection,
  };
};

export const makeFakeScimConnectionWithNextBearerToken = (
  connection: Partial<SCIMConnectionWithNextBearerToken> = {},
): SCIMConnectionWithNextBearerToken => {
  return {
    ...fakeScimConnectionWithNextBearerToken,
    ...connection,
  };
};
